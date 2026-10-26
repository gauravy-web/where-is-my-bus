'use strict';

/**
 * School_Sheet import: preview cache and transactional apply (Requirement 17.4, 17.12, 17.14).
 *
 * preview() parses the file and builds a plan against the current DB without
 * writing anything. The parse is cached in memory under sha256(fileBytes) for
 * `ttlMs`, bound to the uploading admin. confirm() re-loads the DB state,
 * rebuilds the plan from the cached parse and applies it in one transaction.
 * The cache is per-process: a restart invalidates outstanding previews.
 */

const crypto = require('crypto');
const { mapHeaders, parseRows, buildPlan } = require('./schoolSheetImporter');
const { ImportError, readSheet } = require('./schoolSheetReader');

const DEFAULT_TTL_MS = 15 * 60 * 1000;
const EXPIRED_MESSAGE = 'Preview expired, upload the file again';
const ACTIVE_TRIP_MESSAGE = 'The bus has an active trip. End the trip before importing.';
const NO_SCHOOL_WARNING = 'School location is not set. Add it in School settings.';

// Interactive transaction limits; a 500-row sheet issues ~2,000 queries.
const TX_OPTIONS = { maxWait: 10000, timeout: 120000 };

function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}

/**
 * Load the DB state buildPlan needs. Read-only.
 * @param {object} prisma
 * @param {{ students: object[] }} parsed
 */
async function loadExisting(prisma, parsed) {
  const students = (parsed && Array.isArray(parsed.students)) ? parsed.students : [];
  const firstBus = students.find((s) => s && !isBlank(s.busNo));
  const busNo = firstBus ? String(firstBus.busNo) : null;

  const bus = busNo ? await prisma.bus.findUnique({ where: { busNo } }) : null;
  const [drivers, conductors, school] = await Promise.all([
    prisma.driver.findMany(),
    prisma.conductor.findMany(),
    prisma.school.findFirst(),
  ]);

  const rolls = [...new Set(students
    .map((s) => (s && !isBlank(s.rollNo) ? String(s.rollNo).trim() : null))
    .filter(Boolean))];
  const matches = rolls.length > 0
    ? await prisma.student.findMany({ where: { admissionNo: { in: rolls } } })
    : [];
  const studentsByAdmissionNo = new Map();
  for (const st of matches || []) {
    const key = String(st.admissionNo ?? '').trim();
    if (!studentsByAdmissionNo.has(key)) studentsByAdmissionNo.set(key, []);
    studentsByAdmissionNo.get(key).push(st);
  }

  const busStudents = bus ? await prisma.student.findMany({ where: { busId: bus.id } }) : [];
  const activeTrip = bus
    ? await prisma.trip.findFirst({ where: { busId: bus.id, status: 'ACTIVE' } })
    : null;

  return {
    busByNo: new Map(bus ? [[busNo, bus]] : []),
    drivers: drivers || [],
    conductors: conductors || [],
    school: school || null,
    studentsByAdmissionNo,
    busStudents: busStudents || [],
    activeTrip: activeTrip || null,
  };
}

/** Upsert a Driver or Conductor by id and make it the only one on the bus. */
async function assignStaff(delegate, person, busId) {
  let id;
  if (person.id) {
    const data = { phone: person.phone, busId };
    if (!isBlank(person.name)) data.name = person.name;
    ({ id } = await delegate.update({ where: { id: person.id }, data }));
  } else {
    ({ id } = await delegate.create({ data: { name: person.name || '', phone: person.phone, busId } }));
  }
  await delegate.updateMany({ where: { busId, id: { not: id } }, data: { busId: null } });
  return id;
}

/**
 * Apply a confirmed plan in one transaction (design steps 1–8).
 * @param {object} prisma
 * @param {object} plan from buildPlan with canConfirm true
 */
async function applyPlan(prisma, plan) {
  return prisma.$transaction(async (tx) => {
    const warnings = [...(plan.warnings || [])];

    // 1) No ACTIVE trip on the bus.
    if (plan.bus.id) {
      const active = await tx.trip.findFirst({ where: { busId: plan.bus.id, status: 'ACTIVE' } });
      if (active) throw new ImportError(409, ACTIVE_TRIP_MESSAGE);
    }

    // 2) Bus by busNo, Bus Alloted as label.
    let busId;
    if (plan.bus.id) {
      const data = {};
      if (!isBlank(plan.bus.label)) data.label = plan.bus.label;
      ({ id: busId } = await tx.bus.update({ where: { id: plan.bus.id }, data }));
    } else {
      ({ id: busId } = await tx.bus.create({
        data: {
          busNo: plan.bus.busNo,
          label: plan.bus.label ?? null,
          driverName: (plan.driver && plan.driver.name) || '',
          status: 'ACTIVE',
        },
      }));
    }

    // 3) Driver and Conductor by phone, assigned to this bus only.
    if (plan.driver) await assignStaff(tx.driver, plan.driver, busId);
    if (plan.conductor) await assignStaff(tx.conductor, plan.conductor, busId);

    // 4) School name and contact; coordinates are never set by the importer.
    const school = await tx.school.findFirst();
    if (school) {
      if (plan.school) {
        const data = { name: plan.school.name };
        if (!isBlank(plan.school.contactPhone)) data.contactPhone = plan.school.contactPhone;
        await tx.school.update({ where: { id: school.id }, data });
      }
    } else {
      warnings.push(NO_SCHOOL_WARNING);
    }

    // 5) Students by Roll Number.
    let created = 0;
    let updated = 0;
    const idByAdmissionNo = new Map();
    for (const s of plan.students) {
      const data = {
        name: s.name,
        fatherName: s.fatherName ?? null,
        motherName: s.motherName ?? null,
        parentPhone: s.parentPhone,
        parentPhone2: s.parentPhone2 ?? null,
        busId,
      };
      let row;
      if (s.action === 'update' && s.id) {
        row = await tx.student.update({ where: { id: s.id }, data });
        updated += 1;
      } else {
        row = await tx.student.create({ data: { ...data, admissionNo: s.admissionNo, class: '' } });
        created += 1;
      }
      idByAdmissionNo.set(s.admissionNo, row.id);
    }

    // 6) Students of this bus missing from the sheet keep their row; clear links to this bus's stops.
    let clearedLinks = 0;
    const notInSheetIds = (plan.notInSheet || []).map((s) => s.id);
    if (notInSheetIds.length > 0) {
      const oldStops = await tx.stop.findMany({ where: { busId }, select: { id: true } });
      const stopIds = (oldStops || []).map((st) => st.id);
      if (stopIds.length > 0) {
        const pickup = await tx.student.updateMany({
          where: { id: { in: notInSheetIds }, stopId: { in: stopIds } },
          data: { stopId: null },
        });
        const drop = await tx.student.updateMany({
          where: { id: { in: notInSheetIds }, dropStopId: { in: stopIds } },
          data: { dropStopId: null },
        });
        clearedLinks = ((pickup && pickup.count) || 0) + ((drop && drop.count) || 0);
      }
    }

    // 7) Replace both stop sequences, ordered exactly by the sheet.
    await tx.stop.deleteMany({ where: { busId } });
    const pickupStopByAdmissionNo = new Map();
    const dropStopByAdmissionNo = new Map();
    const createStops = async (stops, direction, target) => {
      for (const st of stops) {
        const stop = await tx.stop.create({
          data: {
            busId,
            name: st.name,
            lat: st.lat,
            lng: st.lng,
            order: st.order,
            direction,
            studentId: idByAdmissionNo.get(st.admissionNo) ?? null,
          },
        });
        target.set(st.admissionNo, stop.id);
      }
    };
    await createStops(plan.pickupStops || [], 'PICKUP', pickupStopByAdmissionNo);
    await createStops(plan.dropStops || [], 'DROP', dropStopByAdmissionNo);

    // 8) Link each sheet student to their new stops.
    for (const [admissionNo, studentId] of idByAdmissionNo) {
      await tx.student.update({
        where: { id: studentId },
        data: {
          stopId: pickupStopByAdmissionNo.get(admissionNo) ?? null,
          dropStopId: dropStopByAdmissionNo.get(admissionNo) ?? null,
        },
      });
    }

    return {
      busId,
      busNo: plan.bus.busNo,
      created,
      updated,
      stops: { pickup: pickupStopByAdmissionNo.size, drop: dropStopByAdmissionNo.size },
      clearedLinks,
      warnings,
    };
  }, TX_OPTIONS);
}

/**
 * @param {{ prisma: object, now?: () => number, ttlMs?: number }} deps
 */
function createImportService({ prisma, now = () => Date.now(), ttlMs = DEFAULT_TTL_MS }) {
  const cache = new Map();

  function sweep() {
    const t = now();
    for (const [token, entry] of cache) {
      if (t - entry.createdAt >= ttlMs) cache.delete(token);
    }
  }

  async function preview({ buffer, filename, adminId }) {
    sweep();
    const { headerRow, rows, headerRowNumber } = await readSheet(buffer, filename);
    const { fieldByColumn, missing } = mapHeaders(headerRow);
    if (missing.length > 0) {
      throw new ImportError(400, 'Missing required headers', { missing });
    }
    const parsed = parseRows(rows, fieldByColumn, { headerRowNumber });
    const existing = await loadExisting(prisma, parsed);
    const plan = buildPlan({ ...parsed, missing }, existing);

    const previewToken = crypto.createHash('sha256').update(buffer).digest('hex');
    const fileName = String(filename || '');
    cache.set(previewToken, { adminId, parsed, missing, fileName, createdAt: now() });

    return { previewToken, fileName, rows: parsed.students, ...plan };
  }

  async function confirm({ previewToken, adminId }) {
    sweep();
    const entry = typeof previewToken === 'string' ? cache.get(previewToken) : undefined;
    if (!entry || entry.adminId === undefined || entry.adminId !== adminId) {
      throw new ImportError(410, EXPIRED_MESSAGE);
    }

    const existing = await loadExisting(prisma, entry.parsed);
    const plan = buildPlan({ ...entry.parsed, missing: entry.missing }, existing);
    if (existing.activeTrip) throw new ImportError(409, ACTIVE_TRIP_MESSAGE);
    if (!plan.canConfirm) {
      throw new ImportError(400, 'The sheet has problems', { blockers: plan.blockers });
    }

    const result = await applyPlan(prisma, plan);
    cache.delete(previewToken);
    return result;
  }

  return { preview, confirm, _cache: cache };
}

module.exports = { createImportService, applyPlan, loadExisting, ImportError };

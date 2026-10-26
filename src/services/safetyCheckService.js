// Safety_Check service: conductor "Boarded" (PICKUP) / "Dropped safely"
// (DROP) confirmations, stored in Attendance (Requirement 18.4, 18.7, 18.8,
// 18.11). One record per (tripId, studentId, type) is enforced by the
// Attendance unique key, so a repeated or concurrent submission returns the
// existing record and never triggers a second alert.
//
// Dependencies are injectable so tests can pass fakes:
//   const checks = createSafetyCheckService({ prisma, accessService, now, onSafetyCheck });
// The default export uses ../db and the shared accessService. Parent alerts
// are attached at startup with setOnSafetyCheck(fn) (task 17.2); until then
// recording a check sends nothing.

const TYPE_BY_DIRECTION = { PICKUP: 'BOARDED', DROP: 'DROPPED_SAFE' };
const SAFETY_TYPES = Object.values(TYPE_BY_DIRECTION);
const UNDO_WINDOW_MS = 2 * 60 * 1000;
const TRIP_TIME_ZONE = 'Asia/Kolkata';

class SafetyCheckError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'SafetyCheckError';
    this.status = status;
  }
}

const isBlank = (v) => v === undefined || v === null || String(v).trim() === '';
const sameId = (a, b) => !isBlank(a) && !isBlank(b) && String(a) === String(b);

// Pure. PICKUP -> 'BOARDED', DROP -> 'DROPPED_SAFE', anything else -> null.
function expectedType(trip) {
  return TYPE_BY_DIRECTION[trip?.direction] || null;
}

// Pure. Relevant_Stop: Student.stopId on PICKUP, Student.dropStopId on DROP.
function relevantStopId(student, direction) {
  if (!student) return null;
  if (direction === 'PICKUP') return isBlank(student.stopId) ? null : String(student.stopId);
  if (direction === 'DROP') return isBlank(student.dropStopId) ? null : String(student.dropStopId);
  return null;
}

// Pure (Property 33). The student rides the trip's bus and the student's
// Relevant_Stop is the stop of a TripStop of this trip that is not CANCELLED.
function isEligible(student, trip) {
  if (!student || !trip || !sameId(student.busId, trip.busId)) return false;
  const stopId = relevantStopId(student, trip.direction);
  if (!stopId) return false;
  const stops = Array.isArray(trip.stops) ? trip.stops : [];
  return stops.some((ts) => sameId(ts.stopId, stopId) && ts.status !== 'CANCELLED');
}

// Pure. Students on a DROP trip whose Relevant_Stop TripStop is COMPLETED and
// who have no DROPPED_SAFE check (Requirement 18.10, used at trip end).
function missingDropSafe(trip, students, checks) {
  if (!trip || trip.direction !== 'DROP') return [];
  const completed = new Set((Array.isArray(trip.stops) ? trip.stops : [])
    .filter((ts) => ts.status === 'COMPLETED' && !isBlank(ts.stopId))
    .map((ts) => String(ts.stopId)));
  const safe = new Set((Array.isArray(checks) ? checks : [])
    .filter((c) => c && c.type === 'DROPPED_SAFE' && (c.tripId === undefined || sameId(c.tripId, trip.id)))
    .map((c) => String(c.studentId)));
  return (Array.isArray(students) ? students : []).filter((s) => {
    if (!s || !sameId(s.busId, trip.busId)) return false;
    const stopId = relevantStopId(s, 'DROP');
    return !!stopId && completed.has(stopId) && !safe.has(String(s.id));
  });
}

// Public shape of a check in trip state and `trip:safety` events.
const toSafetyCheck = (row) => ({
  id: row.id,
  studentId: row.studentId,
  type: row.type,
  checkedAt: row.checkedAt instanceof Date ? row.checkedAt.toISOString() : row.checkedAt ?? null,
  conductorId: row.conductorId ?? null,
});

const isSafetyRow = (row, tripId) => !!row && SAFETY_TYPES.includes(row.type) && sameId(row.tripId, tripId);

// Checks of one trip in recording order. Shared with tripService so every
// trip state carries them.
async function listChecks(client, tripId) {
  const rows = await client.attendance.findMany({
    where: { tripId: String(tripId) },
    orderBy: [{ checkedAt: 'asc' }, { id: 'asc' }],
  });
  return rows.filter((r) => isSafetyRow(r, tripId)).map(toSafetyCheck);
}

// Attendance.date for the trip: the trip's start day in Asia/Kolkata.
const tripLocalDate = (date) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: TRIP_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(date);

const isUniqueViolation = (err) => err && err.code === 'P2002';

function createSafetyCheckService({
  prisma,
  accessService,
  now = () => new Date(),
  onSafetyCheck,
  logger = console,
} = {}) {
  const db = () => (typeof prisma === 'function' ? prisma() : prisma);
  const access = () => (typeof accessService === 'function' ? accessService() : accessService);

  async function loadTrip(tripId) {
    if (isBlank(tripId)) throw new SafetyCheckError(400, 'trip id is required');
    const id = String(tripId).trim();
    const trip = await db().trip.findUnique({ where: { id } });
    if (!trip) throw new SafetyCheckError(404, 'Trip not found');
    const stops = await db().tripStop.findMany({ where: { tripId: id }, orderBy: [{ order: 'asc' }, { id: 'asc' }] });
    return { ...trip, stops: stops.filter((s) => sameId(s.tripId, id)) };
  }

  // ADMIN acts on any bus (no conductor id); a CONDUCTOR only on the
  // assigned bus. Returns the Conductor row, or null for ADMIN.
  async function authorize(user, trip) {
    if (user?.role === 'ADMIN') return null;
    if (user?.role === 'CONDUCTOR') {
      const conductor = await access().getConductorForUser(user);
      if (conductor && sameId(conductor.busId, trip.busId)) return conductor;
    }
    throw new SafetyCheckError(403, 'Only the conductor of this bus can record safety checks');
  }

  // Background parent-alert hook; never delays or fails the request.
  function notify(check, ctx) {
    if (typeof onSafetyCheck !== 'function') return;
    Promise.resolve()
      .then(() => onSafetyCheck(check, ctx))
      .catch((err) => logger.error('[safetyCheckService] onSafetyCheck failed:', err?.message || err));
  }

  // POST /api/trips/:id/safety-checks. Returns { created, check, trip, safetyChecks }.
  async function recordCheck(user, tripId, studentId, type) {
    if (isBlank(studentId)) throw new SafetyCheckError(400, 'studentId is required');
    const wanted = isBlank(type) ? '' : String(type).trim().toUpperCase();
    if (!SAFETY_TYPES.includes(wanted)) {
      throw new SafetyCheckError(400, `type must be one of ${SAFETY_TYPES.join(', ')}`);
    }

    const trip = await loadTrip(tripId);
    const conductor = await authorize(user, trip);
    if (trip.status !== 'ACTIVE') throw new SafetyCheckError(409, 'Trip is not active');
    if (wanted !== expectedType(trip)) {
      throw new SafetyCheckError(409, `A ${trip.direction} trip takes ${expectedType(trip)} checks`);
    }
    const student = await db().student.findUnique({ where: { id: String(studentId).trim() } });
    if (!isEligible(student, trip)) {
      throw new SafetyCheckError(409, 'Student is not on this trip');
    }

    const checkedAt = now();
    const key = { tripId: trip.id, studentId: student.id, type: wanted };
    let row;
    let created = true;
    try {
      row = await db().attendance.create({
        data: {
          ...key,
          busId: trip.busId,
          conductorId: conductor ? conductor.id : null,
          checkedAt,
          date: tripLocalDate(trip.startedAt ? new Date(trip.startedAt) : checkedAt),
          tripType: trip.direction === 'DROP' ? 'drop' : 'pickup',
          boarded: true,
        },
      });
    } catch (err) {
      if (!isUniqueViolation(err)) throw err;
      row = await db().attendance.findFirst({ where: key });
      if (!row) throw err;
      created = false;
    }

    const check = toSafetyCheck(row);
    if (created) notify(check, { trip, student, conductor, busId: trip.busId });
    return { created, check, trip, safetyChecks: await listChecks(db(), trip.id) };
  }

  // DELETE /api/trips/:id/safety-checks/:checkId. Same conductor (or ADMIN)
  // within 2 minutes of checkedAt; no alert. Returns { check, trip, safetyChecks }.
  async function undoCheck(user, tripId, checkId) {
    const trip = await loadTrip(tripId);
    const conductor = await authorize(user, trip);
    if (isBlank(checkId)) throw new SafetyCheckError(404, 'Safety check not found');
    const row = await db().attendance.findUnique({ where: { id: String(checkId).trim() } });
    if (!isSafetyRow(row, trip.id)) throw new SafetyCheckError(404, 'Safety check not found');
    if (conductor && !sameId(row.conductorId, conductor.id)) {
      throw new SafetyCheckError(403, 'Only the conductor who recorded this check can undo it');
    }
    const at = row.checkedAt ? new Date(row.checkedAt).getTime() : NaN;
    if (!Number.isFinite(at) || now().getTime() - at > UNDO_WINDOW_MS) {
      throw new SafetyCheckError(409, 'A safety check can only be undone within 2 minutes');
    }
    try {
      await db().attendance.delete({ where: { id: row.id } });
    } catch (err) {
      if (err && err.code === 'P2025') throw new SafetyCheckError(404, 'Safety check not found');
      throw err;
    }
    return { check: toSafetyCheck(row), trip, safetyChecks: await listChecks(db(), trip.id) };
  }

  return { recordCheck, undoCheck };
}

// Shared instance; task 17.2 attaches the parent alerts with setOnSafetyCheck.
let sharedOnSafetyCheck = null;
const defaultService = createSafetyCheckService({
  prisma: () => require('../db'),
  accessService: () => require('./accessService'),
  onSafetyCheck: (check, ctx) => (sharedOnSafetyCheck ? sharedOnSafetyCheck(check, ctx) : undefined),
});
const setOnSafetyCheck = (fn) => { sharedOnSafetyCheck = typeof fn === 'function' ? fn : null; };

module.exports = {
  ...defaultService,
  setOnSafetyCheck,
  createSafetyCheckService,
  SafetyCheckError,
  expectedType,
  relevantStopId,
  isEligible,
  missingDropSafe,
  listChecks,
  toSafetyCheck,
  tripLocalDate,
  SAFETY_TYPES,
  UNDO_WINDOW_MS,
};

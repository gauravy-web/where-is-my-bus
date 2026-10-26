// Safety_Check alerts (Requirements 18.5, 18.6, 18.10).
//
// - onSafetyCheck(check, ctx): attached with safetyCheckService.setOnSafetyCheck
//   (wired in the default gpsSocket(io)). It runs only for newly created
//   checks, so a repeat or an undo never sends anything (18.7, 18.8). One
//   sendMulticast per student to every Linked_Parent token (parentPhone or
//   parentPhone2, compared on the normalized last 10 digits).
// - onTripEnded(trip, io): called by tripController after a trip ends. For a
//   COMPLETED DROP trip it lists the students on COMPLETED stops without a
//   DROPPED_SAFE check, pushes one alert to ADMIN tokens and emits
//   `trip:safety-missing` to the `admins` room only (student names must not
//   reach other parents).
//
// Dependencies are injectable so tests can pass fakes:
//   const alerts = createSafetyAlerts({ prisma, sendMulticast, logger });
// `prisma` and `sendMulticast` may be values or zero-arg resolvers. The
// defaults (../db, notificationService) load lazily, so requiring this module
// never initialises Firebase.

const { normalizePhone } = require('./accessService');
const { missingDropSafe, listChecks } = require('./safetyCheckService');

const TIME_ZONE = 'Asia/Kolkata';
const MISSING_EVENT = 'trip:safety-missing';
const ALERTED_TRIPS_LIMIT = 1000;

const resolve = (dep) => (typeof dep === 'function' ? dep() : dep);
const isBlank = (v) => v === undefined || v === null || String(v).trim() === '';
const sameId = (a, b) => !isBlank(a) && !isBlank(b) && String(a) === String(b);
const text = (v) => (isBlank(v) ? '' : String(v));
const errMsg = (err) => (err && err.message ? err.message : err);

const timeFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: TIME_ZONE, hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});

// Pure. HH:mm in Asia/Kolkata; '' for a missing or invalid time.
function formatTime(value) {
  if (isBlank(value)) return '';
  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime()) ? timeFormat.format(date) : '';
}

// Pure. Exact parent alert texts (Requirements 18.5, 18.6); null for any
// other type.
function buildSafetyMessage(type, { studentName, stopName, busNo, time } = {}) {
  if (type === 'DROPPED_SAFE') {
    return {
      title: 'Dropped off safely',
      body: `${text(studentName)} was dropped off safely at the drop-off stop (${text(stopName)}) at ${text(time)} by the bus conductor.`,
    };
  }
  if (type === 'BOARDED') {
    return {
      title: 'Boarded the bus',
      body: `${text(studentName)} has boarded bus ${text(busNo)} at ${text(time)}.`,
    };
  }
  return null;
}

// Pure. Admin alert for students lacking a "Dropped safely" check (18.10).
// students: [{ name, stopName }]
function buildMissingMessage(busNo, students) {
  const list = (students || []).map((s) => (s.stopName ? `${text(s.name)} (${s.stopName})` : text(s.name)));
  return {
    title: 'Drop-off not confirmed',
    body: `Bus ${text(busNo)} ended its drop trip without a "Dropped safely" check for: ${list.join(', ')}.`,
  };
}

function createSafetyAlerts({
  prisma = () => require('../db'),
  sendMulticast,
  logger = console,
} = {}) {
  const db = () => resolve(prisma);
  // sendMulticast(tokens, title, body, data); the FCM service is required
  // only when the first alert is sent.
  const send = (...args) => (resolve(sendMulticast) || require('./notificationService').sendMulticast)(...args);

  // Trips already handled by onTripEnded in this process. Ending a COMPLETED
  // trip again returns it unchanged, so this keeps a repeat end silent.
  const alertedTrips = new Set();
  const claimTrip = (tripId) => {
    const key = String(tripId);
    if (alertedTrips.has(key)) return false;
    alertedTrips.add(key);
    if (alertedTrips.size > ALERTED_TRIPS_LIMIT) alertedTrips.delete(alertedTrips.values().next().value);
    return true;
  };

  // Deduplicated fcmTokens of the student's Linked_Parents.
  async function linkedParentTokens(student) {
    const phones = new Set([normalizePhone(student?.parentPhone), normalizePhone(student?.parentPhone2)].filter(Boolean));
    if (phones.size === 0) return [];
    const users = (await db().user.findMany({
      where: { fcmToken: { not: null } },
      select: { phone: true, fcmToken: true },
    })) || [];
    const tokens = users
      .filter((u) => !isBlank(u?.fcmToken) && phones.has(normalizePhone(u?.phone)))
      .map((u) => String(u.fcmToken));
    return [...new Set(tokens)];
  }

  async function adminTokens() {
    const admins = (await db().user.findMany({
      where: { role: 'ADMIN', fcmToken: { not: null } },
      select: { fcmToken: true },
    })) || [];
    return [...new Set(admins.map((a) => a?.fcmToken).filter((t) => !isBlank(t)).map(String))];
  }

  async function busNoOf(trip, busId) {
    const known = trip?.bus?.busNo ?? trip?.busNo;
    if (!isBlank(known)) return String(known);
    const id = busId ?? trip?.busId;
    if (isBlank(id)) return '';
    const bus = await db().bus.findUnique({ where: { id: String(id) } });
    return text(bus?.busNo);
  }

  // Name of the student's drop stop: the trip's TripStop snapshot first,
  // then the Stop row.
  async function dropStopName(trip, student) {
    const stopId = student?.dropStopId;
    if (isBlank(stopId)) return '';
    const ts = (Array.isArray(trip?.stops) ? trip.stops : []).find((s) => sameId(s.stopId, stopId));
    if (ts && !isBlank(ts.name)) return String(ts.name);
    const stop = await db().stop.findUnique({ where: { id: String(stopId) } });
    return text(stop?.name);
  }

  // Parent alert for a newly recorded check. Never rejects. Resolves to
  // { sent, tokens } (sent false when the student has no Linked_Parent token).
  async function onSafetyCheck(check, ctx = {}) {
    try {
      const { trip, student } = ctx;
      if (!check || !student) return { sent: false, tokens: [] };
      const type = check.type;
      if (type !== 'BOARDED' && type !== 'DROPPED_SAFE') return { sent: false, tokens: [] };

      const tokens = await linkedParentTokens(student);
      if (tokens.length === 0) return { sent: false, tokens };

      const busId = ctx.busId ?? trip?.busId;
      const details = { studentName: student.name, time: formatTime(check.checkedAt) };
      if (type === 'BOARDED') details.busNo = await busNoOf(trip, busId);
      else details.stopName = await dropStopName(trip, student);
      const { title, body } = buildSafetyMessage(type, details);

      // FCM data values must be strings.
      await send(tokens, title, body, {
        type,
        busId: text(busId),
        tripId: text(check.tripId ?? trip?.id),
        studentId: text(student.id ?? check.studentId),
        checkId: text(check.id),
      });
      return { sent: true, tokens };
    } catch (err) {
      logger?.error?.(`[safetyAlerts] safety alert failed for check ${check?.id}:`, errMsg(err));
      return { sent: false, tokens: [] };
    }
  }

  // After a trip ends. Never rejects. Resolves to the missing students
  // ([{ id, name, stopName }]); empty when nothing was sent.
  async function onTripEnded(trip, io) {
    try {
      if (!trip || trip.direction !== 'DROP' || trip.status !== 'COMPLETED' || isBlank(trip.id)) return [];
      if (!claimTrip(trip.id)) return [];

      const client = db();
      const students = (await client.student.findMany({ where: { busId: String(trip.busId) } })) || [];
      const checks = await listChecks(client, trip.id);
      const missing = missingDropSafe(trip, students, checks);
      if (missing.length === 0) return [];

      const list = [];
      for (const s of missing) {
        list.push({ id: String(s.id), name: text(s.name), stopName: await dropStopName(trip, s) });
      }
      const busNo = await busNoOf(trip, trip.busId);
      logger?.warn?.(`[safetyAlerts] DROP trip ${trip.id} on bus ${trip.busId} ended without "Dropped safely" for: ${list.map((s) => s.id).join(', ')}`);

      if (io) {
        io.to('admins').emit(MISSING_EVENT, { busId: String(trip.busId), busNo, tripId: String(trip.id), students: list });
      }

      const tokens = await adminTokens();
      if (tokens.length > 0) {
        const { title, body } = buildMissingMessage(busNo, list);
        await send(tokens, title, body, {
          type: 'SAFETY_MISSING',
          busId: String(trip.busId),
          tripId: String(trip.id),
          studentIds: list.map((s) => s.id).join(','),
        });
      }
      return list;
    } catch (err) {
      logger?.error?.(`[safetyAlerts] missing drop-safe alert failed for trip ${trip?.id}:`, errMsg(err));
      return [];
    }
  }

  return { onSafetyCheck, onTripEnded, linkedParentTokens };
}

const defaultAlerts = createSafetyAlerts();

module.exports = {
  ...defaultAlerts,
  createSafetyAlerts,
  buildSafetyMessage,
  buildMissingMessage,
  formatTime,
  MISSING_EVENT,
  TIME_ZONE,
};

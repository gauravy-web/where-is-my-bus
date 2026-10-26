// Proximity_Notifier: one push alert about five minutes before the bus
// reaches a student's stop (Requirement 10).
//
// Flow for every ETA computation (onEta, wired from etaCoordinator in 8.2):
//   1. Take the Current_Stop (first PENDING|ARRIVED TripStop) and its ETA.
//      The school (eta.school) is never a perStop entry, so it never alerts.
//   2. shouldNotify (pure debounce) or the initial-alert rule decides.
//   3. findRecipients (the single recipient lookup) returns one entry per
//      student whose busId is the trip's bus *now* and whose Relevant_Stop
//      (stopId on PICKUP, dropStopId on DROP) is the Current_Stop's stop.
//   4. Per student: claim a NotificationLog row (unique tripId, tripStopId,
//      studentId, type). A P2002 unique violation means it was already
//      claimed, so nothing is sent. Then one sendMulticast to all of that
//      student's parent tokens and the row is updated to SENT or FAILED.
// onStopClosed (completeCurrent/skipCurrent, wired in 8.2) records SKIPPED
// for every eligible student that was not claimed yet, so no alert follows.
//
// Dependencies are injectable so tests can pass fakes:
//   const n = createProximityNotifier({ prisma, sendMulticast, now, logger });
// `prisma` and `sendMulticast` may be values or zero-arg resolvers. The
// defaults (../db, notificationService) are loaded lazily on first use, so
// requiring this module never initialises Firebase or the database.

const { normalizePhone } = require('./accessService');

const TYPE_ETA = 'ETA_5_MIN';
const CHANNEL_ID = 'whereismybus';
const FRESH_MS = 60 * 1000; // Valid_ETA: ETA and fix both under 60 s old
const CONFIRM_SECONDS = 330; // two consecutive fresh readings at or under this
const IMMEDIATE_SECONDS = 240; // one fresh reading below this
const INITIAL_SECONDS = 300; // first fresh reading below this: alert with actual minutes
const DEFAULT_MINUTES = 5;
const HISTORY_LIMIT = 5;

const OPEN_STATUSES = ['PENDING', 'ARRIVED'];

const resolve = (dep) => (typeof dep === 'function' ? dep() : dep);
const isBlank = (v) => v === undefined || v === null || String(v).trim() === '';
const sameId = (a, b) => !isBlank(a) && !isBlank(b) && String(a) === String(b);

const toMs = (v) => {
  if (v === undefined || v === null || v === '') return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  const ms = v instanceof Date ? v.getTime() : Date.parse(v);
  return Number.isFinite(ms) ? ms : null;
};

const isUniqueViolation = (err) => err?.code === 'P2002';

// Pure. A reading is { etaSeconds, computedAt, fixRecordedAt } (times as epoch
// ms, Date or ISO string). Fresh = finite non-negative ETA, and both the ETA
// computation and the GPS fix it is based on are under 60 s old at nowMs.
function isFreshReading(reading, nowMs) {
  if (!reading || !Number.isFinite(nowMs)) return false;
  const eta = reading.etaSeconds;
  if (typeof eta !== 'number' || !Number.isFinite(eta) || eta < 0) return false;
  const computedAt = toMs(reading.computedAt);
  const fixAt = toMs(reading.fixRecordedAt);
  if (computedAt === null || fixAt === null) return false;
  return nowMs - computedAt < FRESH_MS && nowMs - fixAt < FRESH_MS;
}

// Pure debounce decision (Requirements 10.1, 10.2).
//   history: earlier readings for the same TripStop, oldest first, each
//            { etaSeconds, computedAt, fixRecordedAt, at } where `at` is the
//            epoch ms at which that reading was evaluated.
//   reading: the current reading; nowMs: the current time.
// True iff the current reading is fresh and either it is below 240 s, or it
// and the immediately previous reading (which must have been fresh at its own
// `at`) are both at most 330 s.
function shouldNotify(history, reading, nowMs) {
  if (!isFreshReading(reading, nowMs)) return false;
  const cur = reading.etaSeconds;
  if (cur < IMMEDIATE_SECONDS) return true;
  if (cur > CONFIRM_SECONDS) return false;
  const list = Array.isArray(history) ? history : [];
  const prev = list.length ? list[list.length - 1] : null;
  if (!prev || !isFreshReading(prev, toMs(prev.at))) return false;
  return prev.etaSeconds <= CONFIRM_SECONDS;
}

// Pure. True when no earlier reading for this TripStop was fresh and the
// current fresh reading is already below 300 s (Requirement 10.3).
function isInitialAlert(history, reading, nowMs) {
  if (!isFreshReading(reading, nowMs) || reading.etaSeconds >= INITIAL_SECONDS) return false;
  const list = Array.isArray(history) ? history : [];
  return !list.some((h) => h && isFreshReading(h, toMs(h.at)));
}

// Pure. Minutes shown in the alert: 5, or the actual rounded minutes (at
// least 1) for an initial alert (Requirement 10.10).
function alertMinutes(etaSeconds, initial) {
  if (!initial || typeof etaSeconds !== 'number' || !Number.isFinite(etaSeconds)) return DEFAULT_MINUTES;
  return Math.min(DEFAULT_MINUTES, Math.max(1, Math.round(etaSeconds / 60)));
}

const normalizeDirection = (direction) => {
  const d = String(direction || '').trim().toUpperCase();
  return d === 'DROP' || d === 'ETA_DROP' ? 'DROP' : 'PICKUP';
};

// Pure. Exact alert texts (Requirements 10.9, 10.10).
function buildMessage(direction, { busNo, stopName, studentName, minutes } = {}) {
  const bus = isBlank(busNo) ? '' : String(busNo);
  const stop = isBlank(stopName) ? '' : String(stopName);
  const mins = minutes === undefined || minutes === null ? DEFAULT_MINUTES : minutes;
  if (normalizeDirection(direction) === 'DROP') {
    const child = isBlank(studentName) ? '' : String(studentName);
    return {
      title: 'Bus arriving at drop-off',
      body: `The school bus ${bus} is on the way home and will reach ${child}'s drop-off stop (${stop}) in about ${mins} minutes. Please be at the stop.`,
    };
  }
  return {
    title: 'Bus arriving at pickup',
    body: `Your child's bus ${bus} is expected to arrive at the pickup stop (${stop}) in approximately ${mins} minutes. Please be ready.`,
  };
}

// Same rule as tripService.currentStop (order asc, then id asc). Kept local
// so this module never requires tripService (which will require it in 8.2).
function currentStopOf(trip) {
  const stops = Array.isArray(trip?.stops) ? [...trip.stops] : [];
  stops.sort((a, b) => {
    const d = Number(a?.order) - Number(b?.order);
    if (Number.isFinite(d) && d !== 0) return d;
    return String(a?.id).localeCompare(String(b?.id));
  });
  return stops.find((s) => OPEN_STATUSES.includes(s?.status)) || null;
}

const relevantStopField = (trip) => (normalizeDirection(trip?.direction) === 'DROP' ? 'dropStopId' : 'stopId');

function createProximityNotifier({
  prisma = () => require('../db'),
  sendMulticast,
  now = () => Date.now(),
  logger = console,
} = {}) {
  const db = () => resolve(prisma);
  // sendMulticast(tokens, title, body, data[, options]). The default is the
  // FCM service, required only when the first alert is sent.
  const send = (...args) => (sendMulticast || require('./notificationService').sendMulticast)(...args);

  // Map<tripId, { stops: Map<tripStopId, StopState>, warnedMissingDrop }>
  // StopState = { history: Reading[], done: boolean, busy: boolean, warnedUnverified: boolean }
  const trips = new Map();

  function tripState(tripId) {
    const key = String(tripId);
    let st = trips.get(key);
    if (!st) {
      st = { stops: new Map(), warnedMissingDrop: false };
      trips.set(key, st);
    }
    return st;
  }

  function stopState(tripId, tripStopId) {
    const st = tripState(tripId);
    const key = String(tripStopId);
    let s = st.stops.get(key);
    if (!s) {
      s = { history: [], done: false, busy: false, warnedUnverified: false };
      st.stops.set(key, s);
    }
    return s;
  }

  // The single recipient lookup (Requirements 10.4, 10.5, 10.12, 10.14).
  // Students are read fresh, so their busId is checked at send time.
  // -> [{ studentId, studentName, stopName, busNo, tokens: string[] }]
  async function findRecipients(trip, tripStop) {
    if (!trip || !tripStop || isBlank(trip.busId) || isBlank(tripStop.stopId)) return [];
    const field = relevantStopField(trip);
    const client = db();

    const students = (await client.student.findMany({
      where: { busId: String(trip.busId), [field]: String(tripStop.stopId) },
    })) || [];
    const matched = students.filter((s) => sameId(s.busId, trip.busId) && sameId(s[field], tripStop.stopId));
    if (matched.length === 0) return [];

    let busNo = trip.bus?.busNo ?? trip.busNo ?? null;
    if (isBlank(busNo)) {
      const bus = await client.bus.findUnique({ where: { id: String(trip.busId) } });
      busNo = bus?.busNo ?? '';
    }

    // Phones may be stored with different formatting, so tokens are matched
    // on the normalized (last 10 digits) phone, as in accessService.
    const users = (await client.user.findMany({
      where: { fcmToken: { not: null } },
      select: { phone: true, fcmToken: true },
    })) || [];
    const tokensByPhone = new Map();
    for (const u of users) {
      const phone = normalizePhone(u?.phone);
      if (!phone || isBlank(u?.fcmToken)) continue;
      if (!tokensByPhone.has(phone)) tokensByPhone.set(phone, []);
      tokensByPhone.get(phone).push(String(u.fcmToken));
    }

    const stopName = tripStop.name ?? '';
    return matched.map((s) => {
      const phones = [...new Set([normalizePhone(s.parentPhone), normalizePhone(s.parentPhone2)].filter(Boolean))];
      const tokens = [...new Set(phones.flatMap((p) => tokensByPhone.get(p) || []))];
      return { studentId: String(s.id), studentName: s.name ?? '', stopName, busNo: String(busNo ?? ''), tokens };
    });
  }

  // DROP students without a drop stop never match a TripStop, so they get no
  // drop alert (10.13). Logged once per trip for the administrator; this also
  // covers trips resumed after a restart, which tripService does not re-log.
  async function warnMissingDropStop(trip) {
    const st = tripState(trip.id);
    if (st.warnedMissingDrop || normalizeDirection(trip.direction) !== 'DROP') return;
    st.warnedMissingDrop = true;
    try {
      const students = (await db().student.findMany({ where: { busId: String(trip.busId), dropStopId: null } })) || [];
      const ids = students
        .filter((s) => sameId(s.busId, trip.busId) && (s.dropStopId === null || s.dropStopId === undefined))
        .map((s) => s.id);
      if (ids.length) {
        logger?.warn?.(`[proximityNotifier] DROP trip ${trip.id} on bus ${trip.busId}: no drop alert for students without a drop stop: ${ids.join(', ')}`);
      }
    } catch (err) {
      logger?.error?.(`[proximityNotifier] missing drop stop lookup failed for trip ${trip.id}:`, err?.message || err);
    }
  }

  const logKey = (tripId, tripStopId, studentId) => ({
    tripId_tripStopId_studentId_type: { tripId: String(tripId), tripStopId: String(tripStopId), studentId: String(studentId), type: TYPE_ETA },
  });

  // Claim the (trip, TripStop, student, type) row. true = claimed by us.
  async function claim(tripId, tripStopId, studentId, status, etaSeconds) {
    try {
      await db().notificationLog.create({
        data: {
          tripId: String(tripId),
          tripStopId: String(tripStopId),
          studentId: String(studentId),
          type: TYPE_ETA,
          status,
          etaSeconds: Number.isFinite(etaSeconds) ? Math.round(etaSeconds) : null,
        },
      });
      return true;
    } catch (err) {
      if (!isUniqueViolation(err)) {
        logger?.error?.(`[proximityNotifier] claim failed for trip ${tripId} stop ${tripStopId} student ${studentId}:`, err?.message || err);
      }
      return false;
    }
  }

  async function record(tripId, tripStopId, studentId, status) {
    try {
      await db().notificationLog.update({
        where: logKey(tripId, tripStopId, studentId),
        data: { status, sentAt: status === 'SENT' ? new Date(Number(now())) : null },
      });
    } catch (err) {
      logger?.error?.(`[proximityNotifier] status ${status} not recorded for trip ${tripId} student ${studentId}:`, err?.message || err);
    }
  }

  // sendMulticast resolves to an FCM BatchResponse, or undefined when it
  // caught an error itself. SENT needs at least one delivered message.
  const delivered = (res) => !!res && (typeof res.successCount !== 'number' || res.successCount > 0);

  async function sendToStudent(trip, tripStop, r, etaSeconds, minutes) {
    if (r.tokens.length === 0) return 'NO_TOKENS';
    if (!(await claim(trip.id, tripStop.id, r.studentId, 'PENDING', etaSeconds))) return 'ALREADY_CLAIMED';
    const direction = normalizeDirection(trip.direction);
    const { title, body } = buildMessage(direction, { busNo: r.busNo, stopName: r.stopName, studentName: r.studentName, minutes });
    // FCM data values must be strings.
    const data = {
      type: TYPE_ETA,
      direction,
      busId: String(trip.busId),
      tripId: String(trip.id),
      tripStopId: String(tripStop.id),
      studentId: r.studentId,
      minutes: String(minutes),
    };
    let status = 'FAILED';
    try {
      const res = await send(r.tokens, title, body, data, { channelId: CHANNEL_ID });
      status = delivered(res) ? 'SENT' : 'FAILED';
    } catch (err) {
      logger?.error?.(`[proximityNotifier] send failed for trip ${trip.id} student ${r.studentId}:`, err?.message || err);
    }
    await record(trip.id, tripStop.id, r.studentId, status);
    return status;
  }

  // Latest TripStop row and its source Stop. An alert is sent only while the
  // TripStop is still open and its Stop is verified (needsLocation false).
  async function stopIsAlertable(trip, tripStop, state) {
    const client = db();
    const row = client.tripStop?.findUnique ? await client.tripStop.findUnique({ where: { id: String(tripStop.id) } }) : tripStop;
    if (row && !OPEN_STATUSES.includes(row.status)) return false;
    const stop = client.stop?.findUnique ? await client.stop.findUnique({ where: { id: String(tripStop.stopId) } }) : null;
    if (stop && stop.needsLocation) {
      if (!state.warnedUnverified) {
        state.warnedUnverified = true;
        logger?.warn?.(`[proximityNotifier] stop ${tripStop.stopId} needs a confirmed location; no alert for trip ${trip.id}`);
      }
      return false;
    }
    return true;
  }

  // ETA listener entry point. Accepts the coordinator event
  // { busId, trip, fix, eta } or (trip, eta). Never rejects. Resolves to
  // { sent: [{ studentId, status }] } when an alert attempt ran, else null.
  async function onEta(eventOrTrip, maybeEta) {
    const event = maybeEta !== undefined || !eventOrTrip?.trip ? { trip: eventOrTrip, eta: maybeEta } : eventOrTrip;
    const { trip, eta, fix } = event || {};
    try {
      if (!trip || trip.status !== 'ACTIVE' || isBlank(trip.id) || isBlank(trip.busId)) return null;
      for (const key of trips.keys()) {
        // Only the latest trip of a bus matters; forget ended trips lazily.
        const st = trips.get(key);
        if (st.busId !== undefined && sameId(st.busId, trip.busId) && key !== String(trip.id)) trips.delete(key);
      }
      tripState(trip.id).busId = String(trip.busId);
      await warnMissingDropStop(trip);

      const current = currentStopOf(trip);
      if (!current || isBlank(current.id)) return null;
      const state = stopState(trip.id, current.id);
      if (state.done || state.busy) return null;

      const nowMs = Number(now());
      const entry = eta && Array.isArray(eta.perStop) ? eta.perStop.find((p) => sameId(p?.tripStopId, current.id)) : null;
      const reading = entry
        ? { etaSeconds: entry.etaSeconds, computedAt: eta.computedAt, fixRecordedAt: eta.fixRecordedAt ?? fix?.recordedAt ?? null }
        : null;

      const initial = isInitialAlert(state.history, reading, nowMs);
      const trigger = initial || shouldNotify(state.history, reading, nowMs);
      // A missing or stale reading breaks the "consecutive" chain.
      state.history.push(reading ? { ...reading, at: nowMs } : { etaSeconds: null, at: nowMs });
      if (state.history.length > HISTORY_LIMIT) state.history.shift();
      if (!trigger) return null;

      state.busy = true;
      try {
        if (!(await stopIsAlertable(trip, current, state))) {
          state.done = true; // closed or unverified: never alertable for this trip
          return null;
        }
        const minutes = alertMinutes(reading.etaSeconds, initial);
        const recipients = await findRecipients(trip, current);
        const sent = [];
        for (const r of recipients) {
          sent.push({ studentId: r.studentId, status: await sendToStudent(trip, current, r, reading.etaSeconds, minutes) });
        }
        state.done = true;
        return { sent };
      } finally {
        state.busy = false;
      }
    } catch (err) {
      logger?.error?.(`[proximityNotifier] onEta failed for trip ${trip?.id}:`, err?.message || err);
      return null;
    }
  }

  // The stop was completed or skipped (10.8): no alert for it any more, and
  // SKIPPED is recorded for every eligible student without a claim. Resolves
  // to the student ids recorded as SKIPPED. Never rejects.
  async function onStopClosed(trip, tripStop) {
    try {
      if (!trip || !tripStop || isBlank(trip.id) || isBlank(tripStop.id)) return [];
      stopState(trip.id, tripStop.id).done = true;
      const recipients = await findRecipients(trip, tripStop);
      const skipped = [];
      for (const r of recipients) {
        if (await claim(trip.id, tripStop.id, r.studentId, 'SKIPPED', null)) skipped.push(r.studentId);
      }
      return skipped;
    } catch (err) {
      logger?.error?.(`[proximityNotifier] onStopClosed failed for trip ${trip?.id}:`, err?.message || err);
      return [];
    }
  }

  // Drop in-memory state for a trip (e.g. when it ends).
  function forgetTrip(tripId) {
    trips.delete(String(tripId));
  }

  return { onEta, onStopClosed, findRecipients, forgetTrip, shouldNotify, buildMessage };
}

const defaultNotifier = createProximityNotifier();

module.exports = {
  ...defaultNotifier,
  createProximityNotifier,
  shouldNotify,
  isFreshReading,
  isInitialAlert,
  alertMinutes,
  buildMessage,
  TYPE_ETA,
  CHANNEL_ID,
  FRESH_MS,
  CONFIRM_SECONDS,
  IMMEDIATE_SECONDS,
  INITIAL_SECONDS,
};

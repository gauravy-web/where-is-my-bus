// Location_Service: validate, throttle, persist and broadcast GPS fixes
// (Requirement 7). Arrival detection for the Current_Stop is delegated to
// Trip_Service.detectArrival / markArrived (7.10, 7.11).
//
// Dependencies are injectable so tests can pass fakes:
//   const loc = createLocationService({ prisma, tripService, now, emit, onFix });
// `prisma` and `tripService` may be objects or zero-arg resolver functions.
// The default export functions use ../db and ./tripService, loaded lazily on
// first use (so requiring this module never touches the database).
//
// Fix units: speed in m/s (non-negative, default 0), heading in degrees or
// null, accuracy in meters or null, recordedAt in epoch ms after validation.

const MAX_ACCURACY_M = 100;
const MAX_PAST_MS = 2 * 60 * 1000;
const MAX_FUTURE_MS = 30 * 1000;
const MAX_SPEED_MS = 200 / 3.6; // 200 km/h in m/s

const TRIP_WRITE_INTERVAL_MS = 5000;
const HISTORY_INTERVAL_MS = 15000;
const HISTORY_DISTANCE_M = 50;
const BROADCAST_INTERVAL_MS = 1000;

const EARTH_RADIUS_M = 6371000;
const toRad = (deg) => (deg * Math.PI) / 180;

// Pure. Great-circle distance in meters between two {lat, lng} points.
function haversineMeters(a, b) {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

// Numbers, or non-empty numeric strings (HTTP fallback bodies). Anything else
// is NaN, so null/''/booleans never coerce to 0.
function toNumber(v) {
  if (typeof v === 'number') return v;
  if (typeof v === 'string' && v.trim() !== '') return Number(v);
  return NaN;
}

// ISO string, epoch ms or Date -> epoch ms, else NaN.
function toMillis(v) {
  if (v instanceof Date) return v.getTime();
  if (typeof v === 'number') return v;
  if (typeof v === 'string' && v.trim() !== '') return Date.parse(v);
  return NaN;
}

const drop = (reason) => ({ ok: false, reason });

// Pure. Validates a raw fix against the last accepted (normalized) fix of the
// same bus and the server clock. Returns the normalized fix when valid.
function validateFix(fix, last, nowMs) {
  if (!fix || typeof fix !== 'object') return drop('invalid_fix');

  const lat = toNumber(fix.lat);
  const lng = toNumber(fix.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return drop('invalid_coordinates');
  }

  const rawAccuracy = toNumber(fix.accuracy);
  const accuracy = Number.isFinite(rawAccuracy) && rawAccuracy >= 0 ? rawAccuracy : null;
  if (accuracy !== null && accuracy > MAX_ACCURACY_M) return drop('low_accuracy');

  const recordedAt = toMillis(fix.recordedAt);
  if (!Number.isFinite(recordedAt)) return drop('invalid_timestamp');
  if (recordedAt < nowMs - MAX_PAST_MS) return drop('stale');
  if (recordedAt > nowMs + MAX_FUTURE_MS) return drop('future');

  if (last && Number.isFinite(last.recordedAt)) {
    if (recordedAt <= last.recordedAt) return drop('out_of_order');
    const seconds = (recordedAt - last.recordedAt) / 1000;
    if (haversineMeters(last, { lat, lng }) / seconds > MAX_SPEED_MS) return drop('speed_jump');
  }

  const rawSpeed = toNumber(fix.speed);
  const speed = Number.isFinite(rawSpeed) && rawSpeed > 0 ? rawSpeed : 0;
  const rawHeading = toNumber(fix.heading);
  const heading = Number.isFinite(rawHeading) ? ((rawHeading % 360) + 360) % 360 : null;

  return { ok: true, fix: { lat, lng, speed, heading, accuracy, recordedAt } };
}

// Pure throttles, all keyed on recordedAt (ms).
function shouldWriteTrip(lastWriteMs, fixMs) {
  return !Number.isFinite(lastWriteMs) || fixMs - lastWriteMs >= TRIP_WRITE_INTERVAL_MS;
}

function shouldAppendHistory(lastAppended, fix) {
  if (!lastAppended || !Number.isFinite(lastAppended.recordedAt)) return true;
  // A fix older than the last appended row (an interleaved ingest) never
  // appends, so the history window only moves forward (7.8).
  if (fix.recordedAt <= lastAppended.recordedAt) return false;
  if (fix.recordedAt - lastAppended.recordedAt >= HISTORY_INTERVAL_MS) return true;
  return haversineMeters(lastAppended, fix) >= HISTORY_DISTANCE_M;
}

function shouldBroadcast(lastBroadcastMs, fixMs) {
  return !Number.isFinite(lastBroadcastMs) || fixMs - lastBroadcastMs >= BROADCAST_INTERVAL_MS;
}

const toKmh = (ms) => Math.round(ms * 3.6 * 10) / 10;

function createLocationService({
  prisma,
  tripService,
  now = () => Date.now(),
  emit = () => {},
  onFix = async () => {},
  logger = console,
} = {}) {
  const db = () => (typeof prisma === 'function' ? prisma() : prisma);
  const trips = () => (typeof tripService === 'function' ? tripService() : tripService);
  const detect = (trip, fix) => {
    const svc = trips();
    return typeof svc.detectArrival === 'function' ? svc.detectArrival(trip, fix) : null;
  };

  // Map<busId, { last, lastTripWrite, lastHistory, lastBroadcast, drops }>
  const cache = new Map();

  const entryFor = (busId) => {
    let entry = cache.get(busId);
    if (!entry) {
      entry = { last: null, lastTripWrite: null, lastHistory: null, lastBroadcast: null, drops: {} };
      cache.set(busId, entry);
    }
    return entry;
  };

  const safeEmit = (event, busId, payload) => {
    try {
      emit(event, busId, payload);
    } catch (err) {
      logger.error(`[locationService] emit ${event} failed for bus ${busId}:`, err?.message || err);
    }
  };

  // Latest accepted fix for a bus (copy), or null.
  function getLatest(busId) {
    const entry = cache.get(String(busId));
    return entry?.last ? { ...entry.last } : null;
  }

  // Drop counters by reason for a bus (copy).
  function getDrops(busId) {
    return { ...(cache.get(String(busId))?.drops || {}) };
  }

  async function ingest(rawBusId, rawFix) {
    if (rawBusId === undefined || rawBusId === null || String(rawBusId).trim() === '') {
      return { accepted: false, reason: 'invalid_bus' };
    }
    const busId = String(rawBusId);
    const entry = entryFor(busId);

    // Validation and the cache update run synchronously, so concurrent
    // ingests for one bus cannot both pass the out-of-order check (7.4).
    const result = validateFix(rawFix, entry.last, Number(now()));
    if (!result.ok) {
      entry.drops[result.reason] = (entry.drops[result.reason] || 0) + 1;
      return { accepted: false, reason: result.reason };
    }
    const { fix } = result;
    entry.last = fix; // 7.6

    let trip = null;
    try {
      trip = await trips().getCurrentTrip(busId);
    } catch (err) {
      logger.error(`[locationService] trip lookup failed for bus ${busId}:`, err?.message || err);
    }
    const recordedAtDate = new Date(fix.recordedAt);

    // 7.7: each throttle is checked and claimed synchronously right before its
    // side effect, so interleaved ingests cannot both pass the same window.
    let wroteTrip = false;
    if (trip && shouldWriteTrip(entry.lastTripWrite, fix.recordedAt)) {
      const previous = entry.lastTripWrite;
      entry.lastTripWrite = fix.recordedAt;
      try {
        await db().trip.update({
          where: { id: trip.id },
          data: {
            lastLat: fix.lat,
            lastLng: fix.lng,
            lastSpeed: fix.speed,
            lastHeading: fix.heading,
            lastLocationAt: recordedAtDate,
          },
        });
        wroteTrip = true;
      } catch (err) {
        if (entry.lastTripWrite === fix.recordedAt) entry.lastTripWrite = previous;
        logger.error(`[locationService] trip location write failed for bus ${busId}:`, err?.message || err);
      }
    }

    // 7.8: LiveLocation keeps km/h for its existing consumers.
    let appendedHistory = false;
    if (shouldAppendHistory(entry.lastHistory, fix)) {
      const previous = entry.lastHistory;
      const appended = { lat: fix.lat, lng: fix.lng, recordedAt: fix.recordedAt };
      entry.lastHistory = appended;
      try {
        await db().liveLocation.create({
          data: { busId, lat: fix.lat, lng: fix.lng, speed: fix.speed * 3.6, timestamp: recordedAtDate },
        });
        appendedHistory = true;
      } catch (err) {
        if (entry.lastHistory === appended) entry.lastHistory = previous;
        logger.error(`[locationService] history append failed for bus ${busId}:`, err?.message || err);
      }
    }

    // 7.9
    let broadcast = false;
    if (shouldBroadcast(entry.lastBroadcast, fix.recordedAt)) {
      entry.lastBroadcast = fix.recordedAt;
      broadcast = true;
      safeEmit('bus:location', busId, {
        busId,
        tripId: trip?.id ?? null,
        lat: fix.lat,
        lng: fix.lng,
        speed: fix.speed,
        heading: fix.heading,
        accuracy: fix.accuracy,
        recordedAt: recordedAtDate.toISOString(),
      });
      safeEmit('locationUpdate', busId, { busId, lat: fix.lat, lng: fix.lng, speed: toKmh(fix.speed) });
    }

    // 7.10, 7.11: only the Current_Stop is evaluated (inside detectArrival).
    let arrived = null;
    if (trip) {
      try {
        const tripStopId = detect(trip, fix);
        if (tripStopId !== null && tripStopId !== undefined) {
          const updated = await trips().markArrived(trip.id, tripStopId);
          if (updated) {
            arrived = tripStopId;
            trip = updated;
            safeEmit('trip:state', busId, { busId, trip: updated, tripStops: updated.stops || [] });
          }
        }
      } catch (err) {
        logger.error(`[locationService] arrival check failed for bus ${busId}:`, err?.message || err);
      }
    }

    // Hook for ETA recompute (task 7.2). Never fails the ingest.
    try {
      await onFix(busId, fix, trip);
    } catch (err) {
      logger.error(`[locationService] onFix failed for bus ${busId}:`, err?.message || err);
    }

    return { accepted: true, broadcast, wroteTrip, appendedHistory, arrived };
  }

  return { ingest, getLatest, getDrops };
}

// Pure. Maps an incoming socket/HTTP payload to an ingest fix. A payload with
// no `recordedAt` comes from the pre-task-10.3 app, which sends speed in km/h
// and no timestamp: its speed is converted to m/s and it is stamped with the
// server receive time. Payloads with `recordedAt` are passed through (m/s).
function toIngestFix(data, nowMs) {
  const src = data && typeof data === 'object' ? data : {};
  const { lat, lng, speed, heading, accuracy, recordedAt } = src;
  if (recordedAt !== undefined && recordedAt !== null && recordedAt !== '') {
    return { lat, lng, speed, heading, accuracy, recordedAt };
  }
  const kmh = toNumber(speed);
  return {
    lat,
    lng,
    speed: Number.isFinite(kmh) ? kmh / 3.6 : speed,
    heading,
    accuracy,
    recordedAt: nowMs,
  };
}

// The shared instance used by the socket gateway, the HTTP fallback and the
// snapshot endpoints, so they all see one cache and one set of throttles.
// Broadcasting and the ETA hook are attached at startup:
//   setEmitter(fn)  — gpsSocket(io) points this at the bus_<id> + admins rooms
//   setOnFix(fn)    — ETA recompute hook (task 7.2)
let sharedEmit = null;
let sharedOnFix = null;
const defaultService = createLocationService({
  prisma: () => require('../db'),
  tripService: () => require('./tripService'),
  emit: (event, busId, payload) => {
    if (sharedEmit) sharedEmit(event, busId, payload);
  },
  onFix: async (busId, fix, trip) => {
    if (sharedOnFix) await sharedOnFix(busId, fix, trip);
  },
});
const setEmitter = (fn) => { sharedEmit = typeof fn === 'function' ? fn : null; };
const setOnFix = (fn) => { sharedOnFix = typeof fn === 'function' ? fn : null; };

module.exports = {
  ...defaultService,
  setEmitter,
  setOnFix,
  toIngestFix,
  createLocationService,
  validateFix,
  shouldWriteTrip,
  shouldAppendHistory,
  shouldBroadcast,
  haversineMeters,
  MAX_ACCURACY_M,
  TRIP_WRITE_INTERVAL_MS,
  HISTORY_INTERVAL_MS,
  HISTORY_DISTANCE_M,
  BROADCAST_INTERVAL_MS,
};

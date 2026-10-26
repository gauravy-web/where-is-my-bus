// ETA coordinator: connects Location_Service intake to ETA_Service
// (Requirements 9.6, 9.7, 8.1).
//
// For every accepted fix (locationService onFix hook) it:
//   - drops its cache when the bus has no ACTIVE trip, or a different trip;
//   - forces a recompute when the open stop sequence changed (stop completed,
//     skipped or cancelled), otherwise follows shouldRecompute (15 s / 100 m);
//   - runs at most one OSRM computation per bus at a time;
//   - stores the latest ETA per bus, keyed by trip id;
//   - emits `trip:eta { busId, tripId, eta }` (eta null on failure) to the
//     bus room and `admins`, and calls the registered ETA listeners (the
//     proximity notifier hooks in here in task 8.2).
//
// Dependencies are injectable so tests can pass fakes:
//   const c = createEtaCoordinator({ etaService, tripService, emit, now, logger });
// `etaService` and `tripService` may be objects or zero-arg resolvers.

const FIX_MAX_AGE_MS = 2 * 60 * 1000; // same window as fix validation

const resolve = (dep) => (typeof dep === 'function' ? dep() : dep);
const isBlank = (v) => v === undefined || v === null || String(v).trim() === '';
const sameId = (a, b) => !isBlank(a) && !isBlank(b) && String(a) === String(b);

const toIso = (v) => {
  if (v === undefined || v === null || v === '') return null;
  const d = v instanceof Date ? v : new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

// Pure. The client-facing ETA shape used by `trip:eta` and the snapshots.
function publicEta(eta) {
  if (!eta) return null;
  return {
    perStop: Array.isArray(eta.perStop) ? eta.perStop.map((p) => ({ tripStopId: p.tripStopId, etaSeconds: p.etaSeconds })) : [],
    school: eta.school ? { etaSeconds: eta.school.etaSeconds } : null,
    geometry: eta.geometry ?? null,
    computedAt: toIso(eta.computedAt),
  };
}

function createEtaCoordinator({
  etaService = () => require('./etaService'),
  tripService = () => require('./tripService'),
  emit = () => {},
  now = () => Date.now(),
  logger = console,
} = {}) {
  // Map<busId, { tripId, signature, last, lastFix, eta, inFlight, gen }>
  const buses = new Map();
  const listeners = new Set();

  // The open waypoint sequence of a trip. It changes exactly when a stop is
  // completed, skipped or cancelled, which must trigger a prompt recompute.
  const signatureOf = (trip) => {
    try {
      return resolve(tripService).routeWaypoints(trip)
        .map((wp) => (wp.kind === 'SCHOOL' ? 'SCHOOL' : String(wp.tripStopId)))
        .join('|');
    } catch (err) {
      return null;
    }
  };

  const safeEmit = (busId, payload) => {
    try {
      emit('trip:eta', busId, payload);
    } catch (err) {
      logger?.error?.(`[etaCoordinator] emit trip:eta failed for bus ${busId}:`, err?.message || err);
    }
  };

  async function notifyListeners(event) {
    for (const fn of [...listeners]) {
      try {
        await fn(event);
      } catch (err) {
        logger?.error?.(`[etaCoordinator] ETA listener failed for bus ${event.busId}:`, err?.message || err);
      }
    }
  }

  // Forget a bus. When it held an ETA, that ETA now becomes null (9.7).
  function clear(rawBusId) {
    const busId = String(rawBusId);
    const entry = buses.get(busId);
    if (!entry) return;
    buses.delete(busId);
    if (entry.eta) safeEmit(busId, { busId, tripId: entry.tripId, eta: null });
  }

  // Next fix recomputes regardless of the 15 s / 100 m throttle.
  function invalidate(rawBusId) {
    const entry = buses.get(String(rawBusId));
    if (!entry) return;
    entry.last = null;
    entry.gen += 1; // an in-flight result computed for the old state is discarded
  }

  function entryFor(busId, trip) {
    let entry = buses.get(busId);
    if (entry && !sameId(entry.tripId, trip.id)) {
      clear(busId);
      entry = null;
    }
    if (!entry) {
      entry = { tripId: String(trip.id), signature: null, last: null, lastFix: null, eta: null, inFlight: null, gen: 0 };
      buses.set(busId, entry);
    }
    return entry;
  }

  function startComputation(busId, entry, trip, fix) {
    const gen = entry.gen;
    entry.last = { at: Number(now()), lat: fix.lat, lng: fix.lng };
    entry.inFlight = (async () => {
      let eta = null;
      try {
        eta = await resolve(etaService).computeEta(trip, fix);
      } catch (err) {
        logger?.warn?.(`[etaCoordinator] computeEta failed for bus ${busId}:`, err?.message || err);
        eta = null;
      }
      // The trip ended, changed or a stop closed while OSRM was running.
      if (buses.get(busId) !== entry || entry.gen !== gen) return null;
      entry.eta = eta || null;
      safeEmit(busId, { busId, tripId: entry.tripId, eta: publicEta(entry.eta) });
      await notifyListeners({ busId, trip, fix, eta: entry.eta });
      return entry.eta;
    })().finally(() => {
      if (buses.get(busId) === entry) entry.inFlight = null;
    });
    return entry.inFlight;
  }

  // locationService onFix hook: (busId, normalizedFix, activeTripOrNull).
  // Resolves to the new ETA (or null) when a computation ran, else undefined.
  // Never rejects.
  async function onFix(rawBusId, fix, trip) {
    try {
      if (isBlank(rawBusId)) return undefined;
      const busId = String(rawBusId);
      if (!trip || trip.status !== 'ACTIVE' || isBlank(trip.id)) {
        clear(busId);
        return undefined;
      }
      if (!fix || !Number.isFinite(fix.lat) || !Number.isFinite(fix.lng)) return undefined;

      const entry = entryFor(busId, trip);
      entry.lastFix = { ...fix };
      const signature = signatureOf(trip);
      if (signature !== entry.signature) {
        entry.signature = signature;
        if (entry.last) invalidate(busId);
      }
      if (entry.inFlight) return undefined; // one OSRM call per bus at a time
      if (!resolve(etaService).shouldRecompute(entry.last, fix, Number(now()))) return undefined;
      return await startComputation(busId, entry, trip, fix);
    } catch (err) {
      logger?.error?.(`[etaCoordinator] onFix failed for bus ${rawBusId}:`, err?.message || err);
      return undefined;
    }
  }

  // Called after a trip mutation (stop completed/skipped/cancelled, trip
  // ended) with the updated trip. An ended trip clears the cache; otherwise
  // the ETA is recomputed right away from the last fix seen for this trip
  // when it is recent, or on the next fix. Never rejects.
  async function onTripChanged(trip) {
    try {
      if (!trip || isBlank(trip.busId)) return undefined;
      const busId = String(trip.busId);
      const entry = buses.get(busId);
      if (!entry || !sameId(entry.tripId, trip.id)) return undefined;
      if (trip.status !== 'ACTIVE') {
        clear(busId);
        return undefined;
      }
      invalidate(busId);
      const fix = entry.lastFix;
      if (!fix || !Number.isFinite(fix.recordedAt) || Number(now()) - fix.recordedAt > FIX_MAX_AGE_MS) return undefined;
      return await onFix(busId, fix, trip);
    } catch (err) {
      logger?.error?.(`[etaCoordinator] onTripChanged failed for trip ${trip?.id}:`, err?.message || err);
      return undefined;
    }
  }

  // Latest ETA of the bus in the public shape, only when it belongs to the
  // given ACTIVE trip; else null.
  function getEta(rawBusId, trip) {
    if (isBlank(rawBusId) || !trip || trip.status !== 'ACTIVE') return null;
    const entry = buses.get(String(rawBusId));
    if (!entry || !sameId(entry.tripId, trip.id)) return null;
    return publicEta(entry.eta);
  }

  // Raw cached ETA (with fixRecordedAt) for internal consumers, or null.
  function getRawEta(rawBusId) {
    const entry = buses.get(String(rawBusId));
    return entry && entry.eta ? { tripId: entry.tripId, ...entry.eta } : null;
  }

  // Listener: fn({ busId, trip, fix, eta }) after every computation (eta may
  // be null). Returns an unsubscribe function.
  function addEtaListener(fn) {
    if (typeof fn !== 'function') return () => {};
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  // Resolves when the bus has no OSRM computation running.
  async function idle(rawBusId) {
    const entry = buses.get(String(rawBusId));
    if (entry && entry.inFlight) await entry.inFlight.catch(() => {});
  }

  return { onFix, onTripChanged, getEta, getRawEta, invalidate, clear, addEtaListener, idle };
}

// Shared instance. gpsSocket(io) wires it at startup:
//   locationService.setOnFix(...) -> onFix, and setEmitter(roomEmitter).
let sharedEmit = null;
const defaultCoordinator = createEtaCoordinator({
  emit: (event, busId, payload) => {
    if (sharedEmit) sharedEmit(event, busId, payload);
  },
});
const setEmitter = (fn) => { sharedEmit = typeof fn === 'function' ? fn : null; };

module.exports = {
  ...defaultCoordinator,
  setEmitter,
  createEtaCoordinator,
  publicEta,
  FIX_MAX_AGE_MS,
};

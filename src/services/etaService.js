// ETA_Service: road ETAs through the OSRM `route` service (Requirement 9, 6.12).
//
// Waypoints come from tripService.routeWaypoints(trip): the Current_Stop and
// the remaining open TripStops in snapshot order, then the school last on
// PICKUP trips. They are sent to OSRM exactly in that order, after the GPS
// fix, and never through the OSRM `trip` service (which would reorder them).
//
// The school leg is reported as `eta.school` and never as a `perStop` entry,
// so the Notifier can never alert for it. Any failure yields null: ETAs are
// never estimated or fabricated.
//
// Dependencies are injectable so tests can pass fakes:
//   const eta = createEtaService({ fetch, now, osrmUrl, logger, tripService });
// `fetch` defaults to the global fetch (looked up at call time so tests can
// mock global.fetch), `osrmUrl` to OSRM_URL from config, `tripService` to
// ./tripService (object or zero-arg resolver).

// Required lazily: locationService will call into this module (7.2), so a
// top-level require would create a load-order cycle.
const haversineMeters = (a, b) => require('./locationService').haversineMeters(a, b);

const OSRM_TIMEOUT_MS = 4000;
const BREAKER_THRESHOLD = 3;
const BREAKER_OPEN_MS = 60 * 1000;
const RECOMPUTE_INTERVAL_MS = 15 * 1000;
const RECOMPUTE_DISTANCE_M = 100;

const isFiniteCoord = (p) => Number.isFinite(p?.lat) && Number.isFinite(p?.lng);
const resolve = (dep) => (typeof dep === 'function' ? dep() : dep);

// Pure. OSRM route URL: the fix first, then the waypoints in the given
// (snapshot) order, as `lng,lat` pairs. Null when there is nothing to route
// or any coordinate is not finite.
function buildRouteUrl(osrmUrl, fix, waypoints) {
  if (!isFiniteCoord(fix) || !Array.isArray(waypoints) || waypoints.length === 0) return null;
  if (!waypoints.every(isFiniteCoord)) return null;
  const base = String(osrmUrl || '').replace(/\/+$/, '');
  const coords = [fix, ...waypoints].map((p) => `${p.lng},${p.lat}`).join(';');
  return `${base}/route/v1/driving/${coords}?overview=full&geometries=geojson`;
}

// Pure. Turn an OSRM route response into per-stop cumulative ETAs.
// Returns null unless code === 'Ok', the first route has exactly one leg per
// waypoint and every leg duration is finite and non-negative.
// Leg i ends at waypoints[i], so the ETA of waypoint i = sum of legs 0..i.
function parseRoute(json, waypoints) {
  if (!json || json.code !== 'Ok') return null;
  if (!Array.isArray(waypoints) || waypoints.length === 0) return null;
  const route = Array.isArray(json.routes) ? json.routes[0] : null;
  const legs = route?.legs;
  if (!Array.isArray(legs) || legs.length !== waypoints.length) return null;

  const durations = legs.map((leg) => leg?.duration);
  if (!durations.every((d) => typeof d === 'number' && Number.isFinite(d) && d >= 0)) return null;

  const perStop = [];
  let school = null;
  let total = 0;
  waypoints.forEach((wp, i) => {
    total += durations[i];
    if (wp?.kind === 'SCHOOL') {
      school = { etaSeconds: total };
    } else {
      perStop.push({ tripStopId: wp.tripStopId, etaSeconds: total });
    }
  });

  return { perStop, school, geometry: route.geometry ?? null };
}

// Pure. Recompute when there is no previous computation, 15 s have passed
// since it, or the bus has moved 100 m from where it was computed.
// `last` = { at: epochMs, lat, lng } | null.
function shouldRecompute(last, fix, nowMs) {
  if (!last) return true;
  if (!Number.isFinite(last.at) || nowMs - last.at >= RECOMPUTE_INTERVAL_MS) return true;
  if (!isFiniteCoord(last) || !isFiniteCoord(fix)) return true;
  return haversineMeters(last, fix) >= RECOMPUTE_DISTANCE_M;
}

function createEtaService({
  fetch: fetchImpl,
  now = () => Date.now(),
  osrmUrl,
  logger = console,
  tripService = () => require('./tripService'),
} = {}) {
  const doFetch = fetchImpl || ((...args) => globalThis.fetch(...args));
  const getOsrmUrl = () => osrmUrl || require('../config/env').getConfig().OSRM_URL;

  // Circuit breaker: 3 consecutive failures open it for 60 s. After that a
  // single trial call is allowed; a failed trial reopens it (the consecutive
  // count is still >= 3), a success closes it.
  const breaker = { failures: 0, openUntil: 0 };

  const isOpen = () => now() < breaker.openUntil;

  function recordFailure(reason) {
    breaker.failures += 1;
    if (breaker.failures >= BREAKER_THRESHOLD) {
      breaker.openUntil = now() + BREAKER_OPEN_MS;
    }
    logger?.warn?.(`[eta] OSRM failure (${reason}); consecutive=${breaker.failures}`);
  }

  function recordSuccess() {
    breaker.failures = 0;
    breaker.openUntil = 0;
  }

  async function fetchRoute(url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), OSRM_TIMEOUT_MS);
    try {
      const res = await doFetch(url, { signal: controller.signal });
      if (!res || !res.ok) return { error: `HTTP ${res ? res.status : 'no response'}` };
      return { json: await res.json() };
    } catch (err) {
      return { error: err?.name === 'AbortError' ? 'timeout' : 'network error' };
    } finally {
      clearTimeout(timer);
    }
  }

  // ETA for the trip from the given Valid_Fix, or null on any failure, when
  // the breaker is open, or when there is nothing left to route to.
  // Result: { perStop: [{tripStopId, etaSeconds}], school: {etaSeconds}|null,
  //           geometry, computedAt, fixRecordedAt }
  async function computeEta(trip, fix) {
    if (!trip || !isFiniteCoord(fix)) return null;
    const waypoints = resolve(tripService).routeWaypoints(trip);
    const url = buildRouteUrl(getOsrmUrl(), fix, waypoints);
    if (!url) return null;
    if (isOpen()) return null;

    const { json, error } = await fetchRoute(url);
    if (error) {
      recordFailure(error);
      return null;
    }
    const parsed = parseRoute(json, waypoints);
    if (!parsed) {
      recordFailure(`invalid response code=${json?.code ?? 'none'}`);
      return null;
    }
    recordSuccess();
    return { ...parsed, computedAt: now(), fixRecordedAt: fix.recordedAt ?? null };
  }

  return {
    computeEta,
    shouldRecompute,
    isBreakerOpen: isOpen,
    breakerState: () => ({ ...breaker }),
  };
}

const defaultService = createEtaService();

module.exports = {
  ...defaultService,
  createEtaService,
  buildRouteUrl,
  parseRoute,
  shouldRecompute,
  OSRM_TIMEOUT_MS,
  BREAKER_THRESHOLD,
  BREAKER_OPEN_MS,
  RECOMPUTE_INTERVAL_MS,
  RECOMPUTE_DISTANCE_M,
};

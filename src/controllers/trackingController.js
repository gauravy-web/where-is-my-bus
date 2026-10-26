// State snapshot endpoints (Requirements 8.1–8.3). Clients call these when a
// screen opens or a socket reconnects, then apply socket events on top.
//
// Every bus state has the same shape (a superset of `trip:state`):
//   { busId, busNo, trip, tripStops, currentStop, destination,
//     location: { lat, lng, speed, heading, recordedAt } | null,
//     eta: { perStop, school, geometry, computedAt } | null }
// `tripStops` is the ACTIVE trip's snapshot in saved order (never reordered).
// `location.recordedAt` is an ISO timestamp so clients can flag stale fixes;
// responses also carry `serverTime` to compare against.
const prisma = require('../db');
const accessService = require('../services/accessService');
const tripService = require('../services/tripService');
const defaultLocationService = require('../services/locationService');
const defaultEtaCoordinator = require('../services/etaCoordinator');

const { tripState } = tripService;

const isBlank = (v) => v === undefined || v === null || String(v).trim() === '';
const sameId = (a, b) => !isBlank(a) && !isBlank(b) && String(a) === String(b);
const numOrNull = (v) => (Number.isFinite(v) ? v : null);

const toIso = (v) => {
  if (isBlank(v)) return null;
  const d = v instanceof Date ? v : new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

const fail = (res, err, label) => {
  console.error(`[trackingController] ${label} failed:`, err?.message || err);
  return res.status(500).json({ message: 'Tracking state unavailable' });
};

// The live location cache. server.js may register the instance it feeds
// fixes into with app.set('locationService', ...); otherwise the module's
// default instance (the one the socket and HTTP fallback use) is read.
const locationServiceFor = (req) => req.app.get('locationService') || defaultLocationService;

// Latest Valid_Fix: the in-memory fix when present, else the ACTIVE trip's
// last-location fields (survive a restart; at most 5 s behind the cache).
function latestLocation(locationService, busId, trip) {
  const fix = locationService.getLatest(busId);
  if (fix && Number.isFinite(fix.lat) && Number.isFinite(fix.lng)) {
    return {
      lat: fix.lat,
      lng: fix.lng,
      speed: numOrNull(fix.speed),
      heading: numOrNull(fix.heading),
      recordedAt: toIso(fix.recordedAt),
    };
  }
  if (trip && Number.isFinite(trip.lastLat) && Number.isFinite(trip.lastLng)) {
    return {
      lat: trip.lastLat,
      lng: trip.lastLng,
      speed: numOrNull(trip.lastSpeed),
      heading: numOrNull(trip.lastHeading),
      recordedAt: toIso(trip.lastLocationAt),
    };
  }
  return null;
}

// The ETA cache. Tests may register their own coordinator with
// app.set('etaCoordinator', ...); otherwise the shared instance fed by the
// Location_Service onFix hook is read.
const etaCoordinatorFor = (req) => req.app.get('etaCoordinator') || defaultEtaCoordinator;

// Latest ETA for the bus: { perStop: [{tripStopId, etaSeconds}], school,
// geometry, computedAt } | null. Only an ETA computed for this same ACTIVE
// trip is returned; anything else is null ("ETA unavailable" in the app).
function latestEta(etaCoordinator, busId, trip) {
  if (!trip || trip.status !== 'ACTIVE') return null;
  return etaCoordinator.getEta(busId, trip) || null;
}

// Snapshot for one bus. `bus` is the Bus row when already loaded (admin list).
async function buildBusState(busId, {
  bus,
  locationService = defaultLocationService,
  etaCoordinator = defaultEtaCoordinator,
} = {}) {
  const id = String(busId);
  const [busRow, trip] = await Promise.all([
    bus !== undefined ? bus : prisma.bus.findUnique({ where: { id } }),
    tripService.getCurrentTrip(id),
  ]);
  return {
    ...tripState(id, trip),
    busNo: busRow?.busNo ?? null,
    tripStops: trip && Array.isArray(trip.stops) ? trip.stops : [],
    location: latestLocation(locationService, id, trip),
    eta: latestEta(etaCoordinator, id, trip),
  };
}

// GET /api/tracking/bus/:busId/state — any role that may view the bus
// (ADMIN any; DRIVER/CONDUCTOR assigned bus; PARENT a child's bus).
// Access is checked before the lookup, so a non-admin gets the same 403 for
// an unknown bus as for someone else's bus. Only ADMIN can see a 404.
const getBusState = async (req, res) => {
  try {
    const busId = String(req.params.busId || '').trim();
    if (!(await accessService.canViewBus(req.user, busId))) {
      return res.status(403).json({ message: 'Forbidden: no access to this bus' });
    }
    const bus = await prisma.bus.findUnique({ where: { id: busId } });
    if (!bus) return res.status(404).json({ message: 'Bus not found' });
    const state = await buildBusState(busId, {
      bus, locationService: locationServiceFor(req), etaCoordinator: etaCoordinatorFor(req),
    });
    return res.json({ success: true, serverTime: new Date().toISOString(), ...state });
  } catch (err) {
    return fail(res, err, 'getBusState');
  }
};

// Relevant_Stop: stopId on PICKUP trips, dropStopId on DROP trips; null
// while the bus has no ACTIVE trip (the direction is unknown).
function relevantStopFor(student, state) {
  const direction = state?.trip?.direction;
  if (direction !== 'PICKUP' && direction !== 'DROP') return { relevantStopId: null, relevantTripStop: null };
  const stopId = direction === 'DROP' ? student.dropStopId : student.stopId;
  if (isBlank(stopId)) return { relevantStopId: null, relevantTripStop: null };
  const tripStop = state.tripStops.find((ts) => sameId(ts.stopId, stopId)) || null;
  return { relevantStopId: String(stopId), relevantTripStop: tripStop };
}

// GET /api/tracking/parent — PARENT only. One entry per own child (matched on
// parentPhone or parentPhone2) with the child's bus state and Relevant_Stop.
// Only the child's own fields are returned (no parent phones).
const getParentState = async (req, res) => {
  try {
    const students = await accessService.getParentStudents(req.user);
    const locationService = locationServiceFor(req);
    const etaCoordinator = etaCoordinatorFor(req);
    const busIds = [...new Set(students.map((s) => s.busId).filter((b) => !isBlank(b)).map(String))];
    const states = new Map(await Promise.all(
      busIds.map(async (busId) => [busId, await buildBusState(busId, { locationService, etaCoordinator })]),
    ));

    const children = students.map((s) => {
      const state = isBlank(s.busId) ? null : states.get(String(s.busId)) || null;
      return {
        id: s.id,
        name: s.name,
        busId: isBlank(s.busId) ? null : String(s.busId),
        busNo: state?.busNo ?? null,
        stopId: s.stopId ?? null,
        dropStopId: s.dropStopId ?? null,
        ...relevantStopFor(s, state),
        state,
      };
    });
    return res.json({ success: true, serverTime: new Date().toISOString(), children });
  } catch (err) {
    return fail(res, err, 'getParentState');
  }
};

// GET /api/tracking/admin/live — ADMIN only. Every bus, including buses
// with no trip and no recent fix (location null or an old recordedAt).
const getAdminLive = async (req, res) => {
  try {
    const buses = await prisma.bus.findMany({ orderBy: { busNo: 'asc' } });
    const locationService = locationServiceFor(req);
    const etaCoordinator = etaCoordinatorFor(req);
    const states = await Promise.all(
      buses.map((bus) => buildBusState(bus.id, { bus, locationService, etaCoordinator })),
    );
    return res.json({ success: true, serverTime: new Date().toISOString(), buses: states });
  } catch (err) {
    return fail(res, err, 'getAdminLive');
  }
};

module.exports = {
  getBusState,
  getParentState,
  getAdminLive,
  buildBusState,
  latestLocation,
  latestEta,
  relevantStopFor,
};

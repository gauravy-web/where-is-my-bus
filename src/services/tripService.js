// Trip_Service: Trip and TripStop lifecycle (Requirement 6, 10.13).
//
// A trip snapshots the bus's stop sequence for one direction in the exact
// saved order (never by geography). Progress is strictly one stop at a time:
// only the Current_Stop (first PENDING|ARRIVED TripStop) may be completed or
// skipped. All state lives in the database, so a restarted server resumes an
// ACTIVE trip simply by reading it back (Requirement 6.9).
//
// Dependencies are injectable so tests can pass a fake:
//   const trips = createTripService({ prisma: fakePrisma, now: () => fixedDate });
// The default export functions use ../db, loaded lazily on first call.

const { createStopService, sortBySavedOrder } = require('./stopService');
const { listChecks } = require('./safetyCheckService');

const DIRECTIONS = ['PICKUP', 'DROP'];
const OPEN_STATUSES = ['PENDING', 'ARRIVED'];

// Error carrying the HTTP status the controller should answer with.
class TripServiceError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = 'TripServiceError';
    this.status = status;
    if (details) this.details = details;
  }
}

const isOpen = (tripStop) => OPEN_STATUSES.includes(tripStop?.status);
const sameId = (a, b) => a !== undefined && a !== null && b !== undefined && b !== null && String(a) === String(b);
const hasSchool = (trip) => Number.isFinite(trip?.destLat) && Number.isFinite(trip?.destLng);

// TripStops in snapshot order (order asc, id asc). Returns a new array.
const sortedStops = (trip) => sortBySavedOrder(Array.isArray(trip?.stops) ? trip.stops : []);

// Pure. First TripStop in snapshot order whose status is PENDING or ARRIVED.
function currentStop(trip) {
  return sortedStops(trip).find(isOpen) || null;
}

const ARRIVAL_RADIUS_M = 50;
const ARRIVAL_MAX_SPEED_MS = 2;

// Pure (Requirements 7.10, 7.11). The Current_Stop's id when the trip is
// ACTIVE, that stop is still PENDING, the fix is within 50 m of it and the
// speed (m/s, missing = 0) is below 2 m/s; else null. Later stops are never
// evaluated, even when the bus is standing on one.
function detectArrival(trip, fix) {
  if (!trip || trip.status !== 'ACTIVE' || !fix) return null;
  const current = currentStop(trip);
  if (!current || current.status !== 'PENDING') return null;
  if (![fix.lat, fix.lng, current.lat, current.lng].every(Number.isFinite)) return null;
  const speed = Number.isFinite(fix.speed) ? fix.speed : 0;
  if (speed >= ARRIVAL_MAX_SPEED_MS) return null;
  const { haversineMeters } = require('./locationService');
  return haversineMeters(fix, current) <= ARRIVAL_RADIUS_M ? current.id : null;
}

const stopWaypoint = (ts) => ({
  kind: 'STOP', tripStopId: ts.id, stopId: ts.stopId, lat: ts.lat, lng: ts.lng, name: ts.name,
});

// School leg only on PICKUP trips with a snapshotted destination (6.11–6.13).
const schoolWaypoint = (trip) => (trip?.direction === 'PICKUP' && hasSchool(trip)
  ? { kind: 'SCHOOL', name: trip.destName ?? null, lat: trip.destLat, lng: trip.destLng }
  : null);

// Pure. What the bus is heading to next: the Current_Stop, else (PICKUP only)
// the school, else null. The school is never a TripStop: no status, no
// arrival detection, no alert. A trip that is no longer ACTIVE has nothing
// left to head to.
function remainingDestination(trip) {
  if (!trip || trip.status !== 'ACTIVE') return null;
  const current = currentStop(trip);
  if (current) return stopWaypoint(current);
  return schoolWaypoint(trip);
}

// Pure. OSRM waypoints after the GPS fix: the Current_Stop and the remaining
// open TripStops in snapshot order, then the school last on PICKUP trips.
function routeWaypoints(trip) {
  const waypoints = sortedStops(trip).filter(isOpen).map(stopWaypoint);
  const school = schoolWaypoint(trip);
  if (school) waypoints.push(school);
  return waypoints;
}

// Pure. { busId, trip, currentStop, destination, safetyChecks }: the shape of
// every `trip:state` event (REST mutations, arrivals, socket connect) and of
// the GET /api/trips/current response. Loaded trips carry their checks as
// `trip.safetyChecks`; they are lifted to the top level (Requirement 18.9).
function tripState(busId, trip) {
  let tripOut = trip || null;
  let safetyChecks = [];
  if (trip && Object.prototype.hasOwnProperty.call(trip, 'safetyChecks')) {
    const { safetyChecks: checks, ...rest } = trip;
    tripOut = rest;
    safetyChecks = Array.isArray(checks) ? checks : [];
  }
  return {
    busId: busId === undefined || busId === null ? null : String(busId),
    trip: tripOut,
    currentStop: trip ? currentStop(trip) : null,
    destination: trip ? remainingDestination(trip) : null,
    safetyChecks,
  };
}

// Pure. A stop sequence can start a trip only when it is non-empty and every
// order is a unique integer >= 1. Gaps are fine: the snapshot keeps the
// saved order values (Requirement 6.3).
function validateSequence(stops) {
  const list = Array.isArray(stops) ? stops : [];
  if (list.length === 0) {
    return { ok: false, status: 409, message: 'No stops are set up for this bus and direction' };
  }
  const invalid = list.filter((s) => !(Number.isInteger(s.order) && s.order >= 1)).map((s) => s.order);
  if (invalid.length) {
    return {
      ok: false,
      status: 409,
      message: `Stop order has invalid values (${invalid.map(String).join(', ')}); fix the stop order before starting`,
    };
  }
  const counts = new Map();
  list.forEach((s) => counts.set(s.order, (counts.get(s.order) || 0) + 1));
  const duplicates = [...counts.entries()].filter(([, n]) => n > 1).map(([o]) => o).sort((a, b) => a - b);
  if (duplicates.length) {
    return {
      ok: false,
      status: 409,
      message: `Stop order has duplicate values (${duplicates.join(', ')}); fix the stop order before starting`,
    };
  }
  return { ok: true };
}

function parseTripDirection(raw) {
  const value = typeof raw === 'string' ? raw.trim().toUpperCase() : '';
  if (!DIRECTIONS.includes(value)) throw new TripServiceError(400, 'direction must be PICKUP or DROP');
  return value;
}

// Optional bus guard: callers may pass { busId } (e.g. the driver's bus).
function assertBusGuard(user, trip) {
  if (user && user.busId !== undefined && user.busId !== null && !sameId(user.busId, trip.busId)) {
    throw new TripServiceError(403, 'Trip belongs to a different bus');
  }
}

const STOP_ORDER_BY = [{ order: 'asc' }, { id: 'asc' }];

function createTripService({ prisma, now = () => new Date(), logger = console } = {}) {
  const db = () => (typeof prisma === 'function' ? prisma() : prisma);

  async function withStops(client, trip) {
    if (!trip) return null;
    const stops = await client.tripStop.findMany({ where: { tripId: trip.id }, orderBy: STOP_ORDER_BY });
    const loaded = { ...trip, stops: sortBySavedOrder(stops.filter((s) => sameId(s.tripId, trip.id))) };
    // Safety checks ride along so every trip state shows them (Requirement
    // 18.9). A client without the Attendance model (minimal test fakes)
    // simply yields a trip without checks.
    if (client.attendance && typeof client.attendance.findMany === 'function') {
      loaded.safetyChecks = await listChecks(client, trip.id);
    }
    return loaded;
  }

  async function findActive(client, busId) {
    const trip = await client.trip.findFirst({
      where: { busId, status: 'ACTIVE' },
      orderBy: { startedAt: 'desc' },
    });
    return withStops(client, trip);
  }

  async function loadTrip(client, tripId) {
    const id = tripId === undefined || tripId === null ? '' : String(tripId).trim();
    if (!id) throw new TripServiceError(400, 'trip id is required');
    const trip = await client.trip.findUnique({ where: { id } });
    if (!trip) throw new TripServiceError(404, 'Trip not found');
    return withStops(client, trip);
  }

  async function schoolSnapshot(client) {
    const school = await client.school.findFirst();
    if (school && Number.isFinite(school.lat) && Number.isFinite(school.lng)) {
      return { destName: school.name ?? null, destLat: school.lat, destLng: school.lng };
    }
    return { destName: null, destLat: null, destLng: null };
  }

  // Requirement 6.1–6.3, 6.9: resume the bus's ACTIVE trip, or snapshot the
  // saved stop sequence into a new ACTIVE trip. The check, snapshot and bus
  // status change happen in one transaction.
  async function startTrip({ driver, direction } = {}) {
    const dir = parseTripDirection(direction);
    if (!driver || driver.busId === undefined || driver.busId === null || String(driver.busId).trim() === '') {
      throw new TripServiceError(409, 'Driver is not assigned to a bus');
    }
    const busId = String(driver.busId);

    const result = await db().$transaction(async (tx) => {
      const active = await findActive(tx, busId);
      if (active) return { trip: active, resumed: true };

      const stops = await createStopService(tx).listStops({ busId, direction: dir });
      const check = validateSequence(stops);
      if (!check.ok) throw new TripServiceError(check.status, check.message);

      const dest = await schoolSnapshot(tx);
      const trip = await tx.trip.create({
        data: {
          busId,
          driverId: driver.id,
          direction: dir,
          status: 'ACTIVE',
          startedAt: now(),
          ...dest,
        },
      });
      for (const stop of stops) {
        await tx.tripStop.create({
          data: {
            tripId: trip.id,
            stopId: stop.id,
            order: stop.order,
            name: stop.name,
            lat: stop.lat,
            lng: stop.lng,
            status: 'PENDING',
          },
        });
      }
      await tx.bus.update({ where: { id: busId }, data: { status: 'ON_TRIP' } });
      return { trip: await withStops(tx, trip), resumed: false };
    });

    if (result.resumed) return { ...result, missingDropStop: [] };

    // Requirement 10.13: DROP students without a drop stop get no alert; log
    // them once at trip start so the administrator can fix the data.
    let missingDropStop = [];
    if (dir === 'DROP') {
      const students = await db().student.findMany({ where: { busId, dropStopId: null } });
      missingDropStop = students
        .filter((s) => sameId(s.busId, busId) && (s.dropStopId === null || s.dropStopId === undefined))
        .map((s) => ({ id: s.id, name: s.name }));
      if (missingDropStop.length) {
        logger.warn(
          `[tripService] DROP trip ${result.trip.id} on bus ${busId}: students without a drop stop: ${missingDropStop.map((s) => s.id).join(', ')}`
        );
      }
    }
    return { trip: result.trip, resumed: false, missingDropStop };
  }

  // Requirement 6.10: ACTIVE trip of a bus with its TripStops, or null.
  async function getCurrentTrip(busId) {
    if (busId === undefined || busId === null || String(busId).trim() === '') return null;
    return findActive(db(), String(busId));
  }

  // Requirements 6.4, 6.5: close the Current_Stop only. The status condition
  // on the write keeps a concurrent request from closing the same stop twice.
  async function closeCurrent(tripId, tripStopId, user, status) {
    return db().$transaction(async (tx) => {
      const trip = await loadTrip(tx, tripId);
      assertBusGuard(user, trip);
      if (trip.status !== 'ACTIVE') throw new TripServiceError(409, 'Trip is not active');
      const current = currentStop(trip);
      if (!current || !sameId(current.id, tripStopId)) {
        throw new TripServiceError(409, 'Only the current stop can be updated');
      }
      const data = status === 'COMPLETED' ? { status, completedAt: now() } : { status };
      const { count } = await tx.tripStop.updateMany({
        where: { id: current.id, tripId: trip.id, status: { in: OPEN_STATUSES } },
        data,
      });
      if (count !== 1) throw new TripServiceError(409, 'Only the current stop can be updated');
      return loadTrip(tx, trip.id);
    });
  }

  const completeCurrent = (tripId, tripStopId, user) => closeCurrent(tripId, tripStopId, user, 'COMPLETED');
  const skipCurrent = (tripId, tripStopId, user) => closeCurrent(tripId, tripStopId, user, 'SKIPPED');

  // Requirement 6.6: an ADMIN may cancel any open TripStop of an ACTIVE trip.
  async function cancelStop(tripId, tripStopId, admin) {
    if (!admin || admin.role !== 'ADMIN') throw new TripServiceError(403, 'Only an admin can cancel a stop');
    return db().$transaction(async (tx) => {
      const trip = await loadTrip(tx, tripId);
      if (trip.status !== 'ACTIVE') throw new TripServiceError(409, 'Trip is not active');
      const target = trip.stops.find((s) => sameId(s.id, tripStopId));
      if (!target) throw new TripServiceError(404, 'Trip stop not found');
      if (!isOpen(target)) throw new TripServiceError(409, `Stop is already ${target.status}`);
      const { count } = await tx.tripStop.updateMany({
        where: { id: target.id, tripId: trip.id, status: { in: OPEN_STATUSES } },
        data: { status: 'CANCELLED' },
      });
      if (count !== 1) throw new TripServiceError(409, 'Stop is no longer open');
      return loadTrip(tx, trip.id);
    });
  }

  // Requirement 6.7: COMPLETED, open stops CANCELLED, bus back to ACTIVE, in
  // one transaction. Ending an already COMPLETED trip returns it unchanged.
  async function endTrip(tripId, user) {
    return db().$transaction(async (tx) => {
      const trip = await loadTrip(tx, tripId);
      assertBusGuard(user, trip);
      if (trip.status === 'COMPLETED') return trip;
      if (trip.status !== 'ACTIVE') throw new TripServiceError(409, `Trip is ${trip.status}`);
      const { count } = await tx.trip.updateMany({
        where: { id: trip.id, status: 'ACTIVE' },
        data: { status: 'COMPLETED', endedAt: now() },
      });
      if (count !== 1) return loadTrip(tx, trip.id);
      await tx.tripStop.updateMany({
        where: { tripId: trip.id, status: { in: OPEN_STATUSES } },
        data: { status: 'CANCELLED' },
      });
      await tx.bus.update({ where: { id: trip.busId }, data: { status: 'ACTIVE' } });
      return loadTrip(tx, trip.id);
    });
  }

  // Requirement 7.10/7.11 support: mark the Current_Stop ARRIVED when it is
  // still PENDING. Returns the updated trip, or null when nothing changed.
  async function markArrived(tripId, tripStopId) {
    return db().$transaction(async (tx) => {
      const trip = await loadTrip(tx, tripId);
      if (trip.status !== 'ACTIVE') return null;
      const current = currentStop(trip);
      if (!current || !sameId(current.id, tripStopId) || current.status !== 'PENDING') return null;
      const { count } = await tx.tripStop.updateMany({
        where: { id: current.id, tripId: trip.id, status: 'PENDING' },
        data: { status: 'ARRIVED', arrivedAt: now() },
      });
      if (count !== 1) return null;
      return loadTrip(tx, trip.id);
    });
  }

  return {
    startTrip,
    getCurrentTrip,
    completeCurrent,
    skipCurrent,
    cancelStop,
    endTrip,
    markArrived,
    detectArrival,
    currentStop,
    remainingDestination,
    routeWaypoints,
    validateSequence,
  };
}

const defaultService = createTripService({ prisma: () => require('../db') });

module.exports = {
  ...defaultService,
  createTripService,
  TripServiceError,
  currentStop,
  remainingDestination,
  routeWaypoints,
  tripState,
  validateSequence,
  detectArrival,
  DIRECTIONS,
};

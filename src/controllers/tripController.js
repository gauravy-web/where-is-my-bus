// Trip endpoints (Requirements 6.6, 6.8, 6.10, 3.10). The trip state machine
// lives in services/tripService.js; this file resolves who is calling, checks
// that they act on their own bus, and broadcasts the result over Socket.IO.
const prisma = require('../db');
const accessService = require('../services/accessService');
const tripService = require('../services/tripService');
const etaCoordinator = require('../services/etaCoordinator');
const proximityNotifier = require('../services/proximityNotifier');
const safetyAlerts = require('../services/safetyAlerts');

const { TripServiceError, currentStop, remainingDestination, tripState } = tripService;

const sameId = (a, b) => a !== undefined && a !== null && b !== undefined && b !== null && String(a) === String(b);
const isBlank = (v) => v === undefined || v === null || String(v).trim() === '';
const hasBus = (row) => !!row && !isBlank(row.busId);

const sendError = (res, err, label) => {
  if (err instanceof TripServiceError) {
    return res.status(err.status).json({ message: err.message });
  }
  console.error(`[tripController] ${label} failed:`, err);
  return res.status(500).json({ message: 'Trip operation failed' });
};

// tripState (tripService) builds { busId, trip, currentStop, destination },
// the shape of `trip:state` events and of the GET /current response.

// Requirement 6.8: every Trip/TripStop change is pushed to the bus room and
// the admins room. `adminExtra` is merged into the admins copy only (student
// names in missingDropStop must not reach other parents). req.io is absent in
// tests that do not attach Socket.IO.
function emitTripState(io, trip, adminExtra) {
  // Requirement 9.6: a closed stop changes the remaining waypoints, so the
  // ETA is recomputed promptly; an ended trip drops its cached ETA. Runs in
  // the background and never rejects.
  if (trip) etaCoordinator.onTripChanged(trip);
  if (!io || !trip) return;
  const state = tripState(trip.busId, trip);
  io.to(`bus_${trip.busId}`).emit('trip:state', state);
  io.to('admins').emit('trip:state', adminExtra ? { ...state, ...adminExtra } : state);
}

// Requirement 10.8: a completed or skipped Current_Stop gets SKIPPED for its
// unalerted students and no alert afterwards. Fire-and-forget: a notifier
// failure never changes the HTTP response.
function notifyStopClosed(trip, tripStopId) {
  try {
    const closed = (trip && Array.isArray(trip.stops) ? trip.stops : []).find((s) => sameId(s.id, tripStopId));
    if (!closed) return;
    Promise.resolve(proximityNotifier.onStopClosed(trip, closed)).catch((err) =>
      console.error('[tripController] onStopClosed failed:', err && err.message ? err.message : err));
  } catch (err) {
    console.error('[tripController] onStopClosed failed:', err && err.message ? err.message : err);
  }
}

// An ended trip needs no notifier state any more.
function forgetNotifierTrip(trip) {
  try {
    if (trip && trip.status !== 'ACTIVE') proximityNotifier.forgetTrip(trip.id);
  } catch (err) {
    console.error('[tripController] forgetTrip failed:', err && err.message ? err.message : err);
  }
}

// Requirement 18.10: a DROP trip that ends with students on completed stops
// lacking "Dropped safely" alerts ADMIN users and emits `trip:safety-missing`
// to `admins` only. Fire-and-forget: never changes the HTTP response.
function notifySafetyMissing(io, trip) {
  try {
    Promise.resolve(safetyAlerts.onTripEnded(trip, io)).catch((err) =>
      console.error('[tripController] safety-missing alert failed:', err && err.message ? err.message : err));
  } catch (err) {
    console.error('[tripController] safety-missing alert failed:', err && err.message ? err.message : err);
  }
}

function emitLegacy(io, busId, event, payload) {
  if (!io) return;
  io.to(`bus_${busId}`).emit(event, payload);
  io.to('admins').emit(event, payload);
}

// The DRIVER row of the caller (bus assignment comes from the Driver table,
// never from the request body).
const driverOf = (req) => accessService.getDriverForUser(req.user);

// For trip mutations: a DRIVER acts only on trips of the assigned bus. A
// driver with no bus has no trips to act on, so it is refused outright (the
// service's bus guard is skipped when busId is empty).
async function busGuardFor(req) {
  if (req.user.role === 'ADMIN') return undefined;
  const driver = await driverOf(req);
  if (!hasBus(driver)) throw new TripServiceError(403, 'Driver is not assigned to a bus');
  return { busId: String(driver.busId) };
}

// POST /api/trips/start { direction, busId? } — DRIVER only.
// The pre-direction app sends only { busId }, so direction defaults to PICKUP.
const startTrip = async (req, res) => {
  try {
    const body = req.body || {};
    const driver = await driverOf(req);
    if (!isBlank(body.busId) && !(hasBus(driver) && sameId(driver.busId, String(body.busId).trim()))) {
      return res.status(403).json({ message: 'Forbidden: no access to this bus' });
    }
    if (!hasBus(driver)) {
      return res.status(409).json({ message: 'Driver is not assigned to a bus' });
    }
    const direction = isBlank(body.direction) ? 'PICKUP' : body.direction;

    const { trip, resumed, missingDropStop } = await tripService.startTrip({ driver, direction });

    emitTripState(req.io, trip, missingDropStop && missingDropStop.length ? { missingDropStop } : undefined);
    if (!resumed) {
      emitLegacy(req.io, trip.busId, 'tripStarted', { busId: trip.busId, tripId: trip.id, direction: trip.direction });
    }

    return res.status(resumed ? 200 : 201).json({
      success: true,
      trip,
      resumed,
      missingDropStop,
      currentStop: currentStop(trip),
      destination: remainingDestination(trip),
    });
  } catch (err) {
    return sendError(res, err, 'startTrip');
  }
};

// GET /api/trips/current — DRIVER or CONDUCTOR (assigned bus, read-only), or
// ADMIN with ?busId=. Requirement 6.10.
const getCurrentTrip = async (req, res) => {
  try {
    const requested = isBlank(req.query?.busId) ? null : String(req.query.busId).trim();
    let busId;
    if (req.user.role === 'ADMIN') {
      if (!requested) return res.status(400).json({ message: 'busId required' });
      busId = requested;
    } else {
      const staff = req.user.role === 'DRIVER'
        ? await accessService.getDriverForUser(req.user)
        : await accessService.getConductorForUser(req.user);
      if (requested && !(hasBus(staff) && sameId(staff.busId, requested))) {
        return res.status(403).json({ message: 'Forbidden: no access to this bus' });
      }
      if (!hasBus(staff)) {
        return res.json({ success: true, ...tripState(null, null) });
      }
      busId = String(staff.busId);
    }
    const trip = await tripService.getCurrentTrip(busId);
    return res.json({ success: true, ...tripState(busId, trip) });
  } catch (err) {
    return sendError(res, err, 'getCurrentTrip');
  }
};

// POST /api/trips/:id/stops/:tripStopId/complete|skip — DRIVER of the trip's bus.
const progressStop = (action) => async (req, res) => {
  try {
    const guard = await busGuardFor(req);
    const fn = action === 'complete' ? tripService.completeCurrent : tripService.skipCurrent;
    const trip = await fn(req.params.id, req.params.tripStopId, guard);
    emitTripState(req.io, trip);
    notifyStopClosed(trip, req.params.tripStopId);
    return res.json({ success: true, ...tripState(trip.busId, trip) });
  } catch (err) {
    return sendError(res, err, `${action}Stop`);
  }
};

const completeStop = progressStop('complete');
const skipStop = progressStop('skip');

// POST /api/trips/:id/stops/:tripStopId/cancel — ADMIN only (Requirement 6.6).
const cancelStop = async (req, res) => {
  try {
    const trip = await tripService.cancelStop(req.params.id, req.params.tripStopId, req.user);
    emitTripState(req.io, trip);
    return res.json({ success: true, ...tripState(trip.busId, trip) });
  } catch (err) {
    return sendError(res, err, 'cancelStop');
  }
};

async function finishTrip(req, tripId, guard) {
  const trip = await tripService.endTrip(tripId, guard);
  emitTripState(req.io, trip);
  forgetNotifierTrip(trip);
  emitLegacy(req.io, trip.busId, 'tripEnded', { busId: trip.busId, tripId: trip.id });
  notifySafetyMissing(req.io, trip);
  return trip;
}

// POST /api/trips/:id/end — DRIVER of the trip's bus, or ADMIN.
const endTripById = async (req, res) => {
  try {
    const guard = await busGuardFor(req);
    const trip = await finishTrip(req, req.params.id, guard);
    return res.json({ success: true, ...tripState(trip.busId, trip) });
  } catch (err) {
    return sendError(res, err, 'endTrip');
  }
};

// Legacy POST /api/trips/end { busId } (old app). The route already checked
// that the caller is ADMIN or the DRIVER of body.busId. Ends the bus's ACTIVE
// trip; with no ACTIVE trip it keeps the old behaviour (bus back to ACTIVE).
const endTrip = async (req, res) => {
  try {
    const busId = String(req.body.busId).trim();
    const active = await tripService.getCurrentTrip(busId);
    if (active) {
      const guard = req.user.role === 'ADMIN' ? undefined : { busId };
      const trip = await finishTrip(req, active.id, guard);
      return res.json({ success: true, message: 'Trip ended', busId, ...tripState(busId, trip) });
    }
    await prisma.bus.update({ where: { id: busId }, data: { status: 'ACTIVE' } });
    return res.json({ success: true, message: 'Trip ended', busId, trip: null });
  } catch (err) {
    return sendError(res, err, 'endTrip (legacy)');
  }
};

// Active trips dekho
const getActiveBuses = async (req, res) => {
  try {
    const buses = await prisma.bus.findMany({
      where: { status: 'ON_TRIP' }
    });
    res.json({ success: true, buses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  startTrip,
  getCurrentTrip,
  completeStop,
  skipStop,
  cancelStop,
  endTripById,
  endTrip,
  getActiveBuses,
};

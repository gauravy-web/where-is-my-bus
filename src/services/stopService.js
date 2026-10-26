// Stop_Service: per-bus, per-direction stop sequences (Requirement 5).
//
// Stops are always returned in the exact saved `order` (ties broken by id so
// the result is stable). Nothing here sorts, reverses or optimizes stops by
// geography or proximity (Requirements 5.2, 5.3).
//
// Prisma is injectable so tests can pass a fake:
//   const stops = createStopService(fakePrisma);
// The default export functions use ../db, loaded lazily on first call.

const DIRECTIONS = ['PICKUP', 'DROP'];
const DEFAULT_DIRECTION = 'PICKUP';

// Error carrying the HTTP status the controller should answer with.
class StopServiceError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = 'StopServiceError';
    this.status = status;
    if (details) this.details = details;
  }
}

const badRequest = (message, details) => new StopServiceError(400, message, details);

// Parse a direction from a query string or body value. Case-insensitive.
// Omitted (undefined, null or blank) means PICKUP so callers written before
// directions existed keep working. Anything else, including arrays from a
// repeated query parameter, is a 400.
function parseDirection(raw) {
  if (raw === undefined || raw === null) return DEFAULT_DIRECTION;
  if (typeof raw !== 'string') {
    throw badRequest('direction must be PICKUP or DROP');
  }
  const value = raw.trim().toUpperCase();
  if (value === '') return DEFAULT_DIRECTION;
  if (!DIRECTIONS.includes(value)) {
    throw badRequest('direction must be PICKUP or DROP');
  }
  return value;
}

// Rows written before the direction column existed are PICKUP (DB default).
const directionOf = (stop) => stop?.direction || DEFAULT_DIRECTION;

// Saved order ascending, then id, so equal orders come back in a stable
// sequence. Returns a new array; the input is not modified.
function sortBySavedOrder(stops) {
  return [...stops].sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    const ia = String(a.id);
    const ib = String(b.id);
    if (ia < ib) return -1;
    if (ia > ib) return 1;
    return 0;
  });
}

const isNonEmptyString = (id) => typeof id === 'string' && id.trim() !== '';

// Compare a reorder request against the stop ids that actually belong to the
// bus and direction. The request is valid only when it is a list of unique,
// non-empty strings that equals that set exactly.
//   missing:    ids of the bus+direction that the request left out
//   duplicates: ids listed more than once
//   foreign:    ids that are not stops of this bus+direction
function validateReorder(existingIds, stopIds) {
  if (!Array.isArray(stopIds)) {
    return { ok: false, reason: 'stopIds must be an array', missing: [], duplicates: [], foreign: [] };
  }
  if (!stopIds.every(isNonEmptyString)) {
    return { ok: false, reason: 'stopIds must be non-empty strings', missing: [], duplicates: [], foreign: [] };
  }
  const existing = new Set(existingIds.map(String));
  const seen = new Set();
  const duplicates = new Set();
  const foreign = new Set();
  for (const id of stopIds) {
    if (seen.has(id)) duplicates.add(id);
    seen.add(id);
    if (!existing.has(id)) foreign.add(id);
  }
  const missing = [...existing].filter((id) => !seen.has(id));
  const ok = duplicates.size === 0 && foreign.size === 0 && missing.length === 0;
  return {
    ok,
    reason: ok ? null : 'stopIds must list every stop of this bus and direction exactly once',
    missing,
    duplicates: [...duplicates],
    foreign: [...foreign],
  };
}

// Orders 1..N for an already-sorted list. Returns only the stops whose order
// changes: [{ id, order }].
function renumber(sortedStops) {
  const changes = [];
  sortedStops.forEach((s, i) => {
    if (s.order !== i + 1) changes.push({ id: s.id, order: i + 1 });
  });
  return changes;
}

// Can `stop` be linked to `student` for the given direction? Pure. The stop
// must exist, belong to the student's bus and have that direction (legacy
// rows without a direction count as PICKUP). Returns { ok, reason }.
function validateStudentStop(student, stop, direction) {
  const label = direction === 'DROP' ? 'Drop stop' : 'Pickup stop';
  if (!stop) return { ok: false, reason: `${label} not found` };
  if (!student || stop.busId !== student.busId) {
    return { ok: false, reason: `${label} must belong to the student's bus` };
  }
  if (directionOf(stop) !== direction) {
    return { ok: false, reason: `${label} must be a ${direction} stop` };
  }
  return { ok: true, reason: null };
}

// Requirement 5.8: dropStopId only for a DROP stop on the student's bus.
const validateDropStop = (student, stop) => validateStudentStop(student, stop, 'DROP');
// Student.stopId stays the pickup stop (Requirement 5.7).
const validatePickupStop = (student, stop) => validateStudentStop(student, stop, 'PICKUP');

const requireBusId = (busId) => {
  const value = busId === undefined || busId === null ? '' : String(busId).trim();
  if (!value) throw badRequest('busId is required');
  return value;
};

const ORDER_BY = [{ order: 'asc' }, { id: 'asc' }];

function createStopService(prismaOrGetter) {
  const db = () => (typeof prismaOrGetter === 'function' ? prismaOrGetter() : prismaOrGetter);

  async function findSequence(client, busId, direction) {
    const rows = await client.stop.findMany({ where: { busId, direction }, orderBy: ORDER_BY });
    // Filter and sort again in memory so the result is the saved order even
    // if the client ignores orderBy; never by coordinates.
    return sortBySavedOrder(rows.filter((s) => s.busId === busId && directionOf(s) === direction));
  }

  // One bus, one direction, saved order ascending.
  async function listStops({ busId, direction } = {}) {
    const id = requireBusId(busId);
    const dir = parseDirection(direction);
    return findSequence(db(), id, dir);
  }

  // Every stop of every bus (Admin list), grouped by bus and direction, each
  // group in saved order.
  async function listAllStops() {
    return db().stop.findMany({
      orderBy: [{ busId: 'asc' }, { direction: 'asc' }, { order: 'asc' }, { id: 'asc' }],
    });
  }

  // New stops go to the end of their bus+direction sequence.
  async function createStop({ busId, name, lat, lng, direction } = {}) {
    if (!busId || !name || lat === undefined || lng === undefined) {
      throw badRequest('busId, name, lat, lng are required');
    }
    const dir = parseDirection(direction);
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
      throw badRequest('lat and lng must be numbers');
    }
    const client = db();
    const bus = await client.bus.findUnique({ where: { id: busId } });
    if (!bus) throw new StopServiceError(404, 'Bus not found');

    const sequence = await findSequence(client, busId, dir);
    const maxOrder = sequence.reduce((m, s) => (Number.isFinite(s.order) && s.order > m ? s.order : m), 0);
    return client.stop.create({
      data: { busId, name, lat: latNum, lng: lngNum, direction: dir, order: maxOrder + 1 },
    });
  }

  // Set order = index + 1 for one bus and direction. The id list is checked
  // against the stored sequence inside the transaction, before any write, so
  // a rejected request changes nothing (Requirements 5.4, 5.5).
  async function reorderStops({ busId, direction, stopIds } = {}) {
    const id = requireBusId(busId);
    const dir = parseDirection(direction);
    if (!Array.isArray(stopIds)) throw badRequest('busId and stopIds[] are required');
    if (!stopIds.every(isNonEmptyString)) throw badRequest('stopIds must be non-empty strings');

    return db().$transaction(async (tx) => {
      const current = await findSequence(tx, id, dir);
      const check = validateReorder(current.map((s) => s.id), stopIds);
      if (!check.ok) {
        throw badRequest(check.reason, {
          missing: check.missing, duplicates: check.duplicates, foreign: check.foreign,
        });
      }
      const byId = new Map(current.map((s) => [String(s.id), s]));
      for (let i = 0; i < stopIds.length; i += 1) {
        if (byId.get(stopIds[i]).order !== i + 1) {
          await tx.stop.update({ where: { id: stopIds[i] }, data: { order: i + 1 } });
        }
      }
      return findSequence(tx, id, dir);
    });
  }

  // Delete one stop, renumber the rest of the SAME bus and direction to 1..N
  // in their previous relative order, and unlink students that pointed at it
  // (stopId for a pickup stop, dropStopId for a drop stop). All in one
  // transaction (Requirement 5.6).
  async function deleteStop(stopId) {
    const id = stopId === undefined || stopId === null ? '' : String(stopId).trim();
    if (!id) throw badRequest('stop id is required');

    return db().$transaction(async (tx) => {
      const stop = await tx.stop.findUnique({ where: { id } });
      if (!stop) throw new StopServiceError(404, 'Stop not found');
      const dir = directionOf(stop);

      const field = dir === 'DROP' ? 'dropStopId' : 'stopId';
      await tx.student.updateMany({ where: { [field]: id }, data: { [field]: null } });
      await tx.stop.delete({ where: { id } });

      const remaining = (await findSequence(tx, stop.busId, dir)).filter((s) => s.id !== id);
      for (const change of renumber(remaining)) {
        await tx.stop.update({ where: { id: change.id }, data: { order: change.order } });
      }
      return { deleted: stop, direction: dir };
    });
  }

  return { listStops, listAllStops, createStop, reorderStops, deleteStop };
}

const defaultService = createStopService(() => require('../db'));

module.exports = {
  ...defaultService,
  createStopService,
  StopServiceError,
  parseDirection,
  sortBySavedOrder,
  validateReorder,
  renumber,
  validateDropStop,
  validatePickupStop,
  DIRECTIONS,
  DEFAULT_DIRECTION,
};

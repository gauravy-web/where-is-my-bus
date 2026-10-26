// Example tests for Trip_Service (task 5.1). Property tests are task 5.3 and
// scenario tests task 5.4. Prisma is an in-memory fake with rollback-on-throw
// transactions; no DB.
// Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.11, 6.12, 6.13, 10.13
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/testdb';
process.env.JWT_SECRET = 'test-jwt-secret';

const {
  createTripService, TripServiceError, currentStop, remainingDestination, routeWaypoints, validateSequence,
} = require('../src/services/tripService');

function createFakePrisma(seed = {}) {
  const keys = ['stops', 'students', 'buses', 'schools', 'trips', 'tripStops'];
  const state = {};
  keys.forEach((k) => { state[k] = (seed[k] || []).map((r) => ({ ...r })); });
  const stats = { transactions: 0, rollbacks: 0 };
  let seq = 0;
  const clone = (x) => (x ? { ...x } : null);

  const matches = (row, where = {}) => Object.entries(where).every(([k, v]) => {
    if (v && typeof v === 'object' && !(v instanceof Date)) {
      if ('in' in v) return v.in.includes(row[k]);
      if ('not' in v) return row[k] !== v.not;
      return true;
    }
    return row[k] === v;
  });

  const applyOrderBy = (rows, orderBy) => {
    const ks = (Array.isArray(orderBy) ? orderBy : orderBy ? [orderBy] : []).map((o) => Object.entries(o)[0]);
    return [...rows].sort((a, b) => {
      for (const [k, dir] of ks) {
        if (a[k] < b[k]) return dir === 'desc' ? 1 : -1;
        if (a[k] > b[k]) return dir === 'desc' ? -1 : 1;
      }
      return 0;
    });
  };

  const model = (key) => ({
    findMany: async (args = {}) =>
      applyOrderBy(state[key].filter((r) => matches(r, args.where)), args.orderBy).map(clone),
    findUnique: async (args = {}) => clone(state[key].find((r) => matches(r, args.where))),
    findFirst: async (args = {}) =>
      clone(applyOrderBy(state[key].filter((r) => matches(r, args.where)), args.orderBy)[0]),
    create: async ({ data }) => {
      seq += 1;
      const row = { id: `${key}-${String(seq).padStart(4, '0')}`, ...data };
      state[key].push(row);
      return clone(row);
    },
    update: async ({ where, data }) => {
      const row = state[key].find((r) => r.id === where.id);
      if (!row) throw Object.assign(new Error('Record not found'), { code: 'P2025' });
      Object.assign(row, data);
      return clone(row);
    },
    updateMany: async ({ where, data }) => {
      const rows = state[key].filter((r) => matches(r, where));
      rows.forEach((r) => Object.assign(r, data));
      return { count: rows.length };
    },
  });

  const client = {
    stop: model('stops'),
    student: model('students'),
    bus: model('buses'),
    school: model('schools'),
    trip: model('trips'),
    tripStop: model('tripStops'),
  };
  client.$transaction = async (fn) => {
    stats.transactions += 1;
    const snapshot = JSON.parse(JSON.stringify(state));
    try {
      return await fn(client);
    } catch (err) {
      stats.rollbacks += 1;
      Object.keys(snapshot).forEach((k) => { state[k] = snapshot[k]; });
      throw err;
    }
  };
  client.__state = state;
  client.__stats = stats;
  return client;
}

const FIXED_NOW = new Date('2026-09-01T08:00:00.000Z');
const driver = { id: 'drv-1', busId: 'bus-1' };
const school = { id: 'sch-1', name: 'Green Valley School', lat: 12.9, lng: 77.6 };

// Saved order deliberately disagrees with geography (stop C is nearest the
// school but saved first; ids are not in order either).
const pickupStops = [
  { id: 's-c', busId: 'bus-1', direction: 'PICKUP', order: 1, name: 'C', lat: 12.89, lng: 77.59 },
  { id: 's-a', busId: 'bus-1', direction: 'PICKUP', order: 3, name: 'A', lat: 12.5, lng: 77.1 },
  { id: 's-b', busId: 'bus-1', direction: 'PICKUP', order: 2, name: 'B', lat: 12.7, lng: 77.3 },
];
const dropStops = [
  { id: 'd-1', busId: 'bus-1', direction: 'DROP', order: 1, name: 'D1', lat: 12.8, lng: 77.5 },
  { id: 'd-2', busId: 'bus-1', direction: 'DROP', order: 2, name: 'D2', lat: 12.6, lng: 77.2 },
];

function setup(seed = {}) {
  const prisma = createFakePrisma({
    stops: [...pickupStops, ...dropStops],
    buses: [{ id: 'bus-1', busNo: 'KA-01', status: 'ACTIVE' }],
    schools: [school],
    students: [],
    ...seed,
  });
  const logger = { warn: jest.fn() };
  const service = createTripService({ prisma, now: () => FIXED_NOW, logger });
  return { prisma, service, logger };
}

const expectError = async (promise, status) => {
  const err = await promise.then(() => null, (e) => e);
  expect(err).toBeInstanceOf(TripServiceError);
  expect(err.status).toBe(status);
  return err;
};

describe('startTrip', () => {
  test('snapshots stops in saved order with saved order values, all PENDING, and sets bus ON_TRIP', async () => {
    const { prisma, service } = setup();
    const { trip, resumed, missingDropStop } = await service.startTrip({ driver, direction: 'PICKUP' });

    expect(resumed).toBe(false);
    expect(missingDropStop).toEqual([]);
    expect(trip).toMatchObject({ busId: 'bus-1', driverId: 'drv-1', direction: 'PICKUP', status: 'ACTIVE' });
    expect(trip.stops.map((s) => [s.stopId, s.order, s.name, s.lat, s.lng, s.status])).toEqual([
      ['s-c', 1, 'C', 12.89, 77.59, 'PENDING'],
      ['s-b', 2, 'B', 12.7, 77.3, 'PENDING'],
      ['s-a', 3, 'A', 12.5, 77.1, 'PENDING'],
    ]);
    expect(trip).toMatchObject({ destName: 'Green Valley School', destLat: 12.9, destLng: 77.6 });
    expect(prisma.__state.buses[0].status).toBe('ON_TRIP');
  });

  test('keeps saved order values when the sequence has gaps', async () => {
    const { service } = setup({
      stops: [
        { id: 'g-1', busId: 'bus-1', direction: 'PICKUP', order: 5, name: 'X', lat: 1, lng: 1 },
        { id: 'g-2', busId: 'bus-1', direction: 'PICKUP', order: 2, name: 'Y', lat: 2, lng: 2 },
      ],
    });
    const { trip } = await service.startTrip({ driver, direction: 'PICKUP' });
    expect(trip.stops.map((s) => [s.stopId, s.order])).toEqual([['g-2', 2], ['g-1', 5]]);
  });

  test('returns the existing ACTIVE trip unchanged instead of creating another', async () => {
    const { prisma, service } = setup();
    const first = await service.startTrip({ driver, direction: 'PICKUP' });
    await service.completeCurrent(first.trip.id, first.trip.stops[0].id);

    const again = await service.startTrip({ driver, direction: 'DROP' });
    expect(again.resumed).toBe(true);
    expect(again.trip.id).toBe(first.trip.id);
    expect(again.trip.direction).toBe('PICKUP');
    expect(again.trip.stops.map((s) => s.status)).toEqual(['COMPLETED', 'PENDING', 'PENDING']);
    expect(prisma.__state.trips).toHaveLength(1);
    expect(prisma.__state.tripStops).toHaveLength(3);
  });

  test('refuses an empty sequence with 409 and writes nothing', async () => {
    const { prisma, service } = setup({ stops: [] });
    const err = await expectError(service.startTrip({ driver, direction: 'PICKUP' }), 409);
    expect(err.message).toMatch(/no stops/i);
    expect(prisma.__state.trips).toHaveLength(0);
    expect(prisma.__state.buses[0].status).toBe('ACTIVE');
  });

  test('refuses duplicate or non-integer orders with 409 and writes nothing', async () => {
    const dup = setup({
      stops: [
        { id: 'x-1', busId: 'bus-1', direction: 'PICKUP', order: 1, name: 'X', lat: 1, lng: 1 },
        { id: 'x-2', busId: 'bus-1', direction: 'PICKUP', order: 1, name: 'Y', lat: 2, lng: 2 },
      ],
    });
    const err = await expectError(dup.service.startTrip({ driver, direction: 'PICKUP' }), 409);
    expect(err.message).toMatch(/duplicate/i);
    expect(dup.prisma.__state.trips).toHaveLength(0);
    expect(dup.prisma.__state.tripStops).toHaveLength(0);

    expect(validateSequence([{ order: 1.5 }]).ok).toBe(false);
    expect(validateSequence([{ order: 0 }]).status).toBe(409);
    expect(validateSequence([{ order: 1 }, { order: 4 }])).toEqual({ ok: true });
  });

  test('400 for a bad direction and 409 when the driver has no bus', async () => {
    const { service } = setup();
    await expectError(service.startTrip({ driver, direction: 'SIDEWAYS' }), 400);
    await expectError(service.startTrip({ driver, direction: undefined }), 400);
    await expectError(service.startTrip({ driver: { id: 'drv-2', busId: null }, direction: 'PICKUP' }), 409);
  });

  test('DROP start returns and logs students without a drop stop once', async () => {
    const { service, logger } = setup({
      students: [
        { id: 'st-1', name: 'Asha', busId: 'bus-1', dropStopId: 'd-1' },
        { id: 'st-2', name: 'Ravi', busId: 'bus-1', dropStopId: null },
        { id: 'st-3', name: 'Other bus', busId: 'bus-2', dropStopId: null },
      ],
    });
    const { trip, missingDropStop } = await service.startTrip({ driver, direction: 'DROP' });
    expect(trip.stops.map((s) => s.stopId)).toEqual(['d-1', 'd-2']);
    expect(missingDropStop).toEqual([{ id: 'st-2', name: 'Ravi' }]);
    expect(logger.warn).toHaveBeenCalledTimes(1);
    expect(logger.warn.mock.calls[0][0]).toContain('st-2');

    const resumed = await service.startTrip({ driver, direction: 'DROP' });
    expect(resumed.missingDropStop).toEqual([]);
    expect(logger.warn).toHaveBeenCalledTimes(1);
  });
});

describe('progress', () => {
  test('complete and skip apply only to the current stop; others get 409 and change nothing', async () => {
    const { prisma, service } = setup();
    const { trip } = await service.startTrip({ driver, direction: 'PICKUP' });
    const [first, second, third] = trip.stops;

    await expectError(service.completeCurrent(trip.id, second.id), 409);
    await expectError(service.skipCurrent(trip.id, third.id), 409);
    expect(prisma.__state.tripStops.every((s) => s.status === 'PENDING')).toBe(true);

    const afterComplete = await service.completeCurrent(trip.id, first.id);
    expect(afterComplete.stops[0]).toMatchObject({ status: 'COMPLETED', completedAt: FIXED_NOW });
    expect(currentStop(afterComplete).id).toBe(second.id);

    await expectError(service.completeCurrent(trip.id, first.id), 409);

    const afterSkip = await service.skipCurrent(trip.id, second.id);
    expect(afterSkip.stops.map((s) => s.status)).toEqual(['COMPLETED', 'SKIPPED', 'PENDING']);
  });

  test('404 for an unknown trip and 403 when the bus guard differs', async () => {
    const { service } = setup();
    const { trip } = await service.startTrip({ driver, direction: 'PICKUP' });
    await expectError(service.completeCurrent('nope', trip.stops[0].id), 404);
    await expectError(service.completeCurrent(trip.id, trip.stops[0].id, { busId: 'bus-9' }), 403);
    const ok = await service.completeCurrent(trip.id, trip.stops[0].id, { busId: 'bus-1' });
    expect(ok.stops[0].status).toBe('COMPLETED');
  });

  test('markArrived only marks the current PENDING stop', async () => {
    const { service } = setup();
    const { trip } = await service.startTrip({ driver, direction: 'PICKUP' });
    expect(await service.markArrived(trip.id, trip.stops[1].id)).toBeNull();
    const arrived = await service.markArrived(trip.id, trip.stops[0].id);
    expect(arrived.stops[0]).toMatchObject({ status: 'ARRIVED', arrivedAt: FIXED_NOW });
    expect(await service.markArrived(trip.id, trip.stops[0].id)).toBeNull();
    expect(currentStop(arrived).id).toBe(trip.stops[0].id);
  });

  test('cancelStop: admin only, any open stop, 409 for closed stops', async () => {
    const { service } = setup();
    const { trip } = await service.startTrip({ driver, direction: 'PICKUP' });
    await expectError(service.cancelStop(trip.id, trip.stops[2].id, { role: 'DRIVER' }), 403);

    const cancelled = await service.cancelStop(trip.id, trip.stops[2].id, { role: 'ADMIN' });
    expect(cancelled.stops.map((s) => s.status)).toEqual(['PENDING', 'PENDING', 'CANCELLED']);
    await expectError(service.cancelStop(trip.id, trip.stops[2].id, { role: 'ADMIN' }), 409);
  });
});

describe('endTrip', () => {
  test('completes the trip, cancels open stops, sets bus ACTIVE, and is idempotent', async () => {
    const { prisma, service } = setup();
    const { trip } = await service.startTrip({ driver, direction: 'PICKUP' });
    await service.completeCurrent(trip.id, trip.stops[0].id);

    await expectError(service.endTrip(trip.id, { busId: 'bus-9' }), 403);
    const ended = await service.endTrip(trip.id, { busId: 'bus-1' });
    expect(ended).toMatchObject({ status: 'COMPLETED', endedAt: FIXED_NOW });
    expect(ended.stops.map((s) => s.status)).toEqual(['COMPLETED', 'CANCELLED', 'CANCELLED']);
    expect(prisma.__state.buses[0].status).toBe('ACTIVE');
    expect(await service.getCurrentTrip('bus-1')).toBeNull();

    const again = await service.endTrip(trip.id);
    expect(again.status).toBe('COMPLETED');
    await expectError(service.endTrip('missing'), 404);
    await expectError(service.completeCurrent(trip.id, trip.stops[1].id), 409);
  });
});

describe('school destination waypoints', () => {
  test('PICKUP: school is the last waypoint and the destination once all stops are closed', async () => {
    const { service } = setup();
    const { trip } = await service.startTrip({ driver, direction: 'PICKUP' });

    const wps = routeWaypoints(trip);
    expect(wps.map((w) => w.kind)).toEqual(['STOP', 'STOP', 'STOP', 'SCHOOL']);
    expect(wps[0]).toEqual({ kind: 'STOP', tripStopId: trip.stops[0].id, stopId: 's-c', lat: 12.89, lng: 77.59, name: 'C' });
    expect(wps[3]).toEqual({ kind: 'SCHOOL', name: 'Green Valley School', lat: 12.9, lng: 77.6 });
    expect(remainingDestination(trip)).toMatchObject({ kind: 'STOP', tripStopId: trip.stops[0].id });

    let t = trip;
    for (const s of trip.stops) t = await service.completeCurrent(t.id, s.id);
    expect(currentStop(t)).toBeNull();
    expect(routeWaypoints(t)).toEqual([{ kind: 'SCHOOL', name: 'Green Valley School', lat: 12.9, lng: 77.6 }]);
    expect(remainingDestination(t)).toEqual({ kind: 'SCHOOL', name: 'Green Valley School', lat: 12.9, lng: 77.6 });
    expect(t.status).toBe('ACTIVE');
  });

  test('PICKUP without school coordinates omits the school leg', async () => {
    const noSchool = setup({ schools: [] });
    const a = (await noSchool.service.startTrip({ driver, direction: 'PICKUP' })).trip;
    expect(a).toMatchObject({ destName: null, destLat: null, destLng: null });
    expect(routeWaypoints(a).every((w) => w.kind === 'STOP')).toBe(true);

    const badCoords = setup({ schools: [{ id: 'sch-2', name: 'No coords', lat: null, lng: 77 }] });
    const b = (await badCoords.service.startTrip({ driver, direction: 'PICKUP' })).trip;
    expect(b.destLat).toBeNull();
    expect(routeWaypoints(b)).toHaveLength(3);
    expect(remainingDestination({ ...b, stops: [] })).toBeNull();
  });

  test('DROP trips never include the school waypoint', async () => {
    const { service } = setup();
    const { trip } = await service.startTrip({ driver, direction: 'DROP' });
    expect(trip.destLat).toBe(12.9);
    expect(routeWaypoints(trip).map((w) => w.kind)).toEqual(['STOP', 'STOP']);
    expect(remainingDestination({ ...trip, stops: [] })).toBeNull();
  });
});

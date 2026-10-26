// Example tests for the trip endpoints and events (task 5.2). Scenario tests
// are task 5.4. Prisma is an in-memory fake with rollback-on-throw
// transactions and Socket.IO is a fake that records emits; no DB, no network.
// Validates: Requirements 3.10, 6.6, 6.8, 6.10
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/testdb';
process.env.JWT_SECRET = 'test-jwt-secret';

jest.mock('../src/db', () => {
  const keys = ['users', 'drivers', 'conductors', 'students', 'buses', 'stops', 'schools', 'trips', 'tripStops'];
  const state = {};
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
    findMany: jest.fn(async (args = {}) =>
      applyOrderBy(state[key].filter((r) => matches(r, args.where)), args.orderBy).map(clone)),
    findUnique: jest.fn(async (args = {}) => clone(state[key].find((r) => matches(r, args.where)))),
    findFirst: jest.fn(async (args = {}) =>
      clone(applyOrderBy(state[key].filter((r) => matches(r, args.where)), args.orderBy)[0])),
    create: jest.fn(async ({ data }) => {
      seq += 1;
      const row = { id: `${key}-${String(seq).padStart(4, '0')}`, ...data };
      state[key].push(row);
      return clone(row);
    }),
    update: jest.fn(async ({ where, data }) => {
      const row = state[key].find((r) => r.id === where.id);
      if (!row) throw Object.assign(new Error('Record not found'), { code: 'P2025' });
      Object.assign(row, data);
      return clone(row);
    }),
    updateMany: jest.fn(async ({ where, data }) => {
      const rows = state[key].filter((r) => matches(r, where));
      rows.forEach((r) => Object.assign(r, data));
      return { count: rows.length };
    }),
  });
  const client = {
    user: model('users'),
    driver: model('drivers'),
    conductor: model('conductors'),
    student: model('students'),
    bus: model('buses'),
    stop: model('stops'),
    school: model('schools'),
    trip: model('trips'),
    tripStop: model('tripStops'),
    $disconnect: jest.fn(),
  };
  client.$transaction = async (fn) => {
    const snapshot = JSON.parse(JSON.stringify(state));
    try {
      return await fn(client);
    } catch (err) {
      Object.keys(snapshot).forEach((k) => { state[k] = snapshot[k]; });
      throw err;
    }
  };
  client.__state = state;
  client.__reset = (seed) => {
    seq = 0;
    keys.forEach((k) => { state[k] = (seed[k] || []).map((r) => ({ ...r })); });
  };
  return client;
});

jest.mock('../src/services/notificationService', () => ({
  sendNotification: jest.fn(async () => undefined),
  sendMulticast: jest.fn(async () => undefined),
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const prisma = require('../src/db');
const { sendMulticast, sendNotification } = require('../src/services/notificationService');
const app = require('../src/app');

const sign = (payload) => `Bearer ${jwt.sign(payload, 'test-jwt-secret')}`;
const T = {
  ADMIN: sign({ id: 'a1', role: 'ADMIN' }),
  PARENT: sign({ id: 'u-parent', role: 'PARENT', phone: '9111111111' }),
  DRIVER: sign({ id: 'u-driver', role: 'DRIVER', phone: '9333333333' }), // bus b1
  DRIVER_B2: sign({ id: 'u-driver2', role: 'DRIVER', phone: '9444444444' }), // bus b2
  DRIVER_NO_BUS: sign({ id: 'u-driver3', role: 'DRIVER', phone: '9666666666' }),
  CONDUCTOR: sign({ id: 'u-conductor', role: 'CONDUCTOR', phone: '9555555555' }), // bus b1
};

const SEED = {
  drivers: [
    { id: 'dr1', name: 'Ravi', phone: '+91 93333 33333', busId: 'b1' },
    { id: 'dr2', name: 'Mohan', phone: '9444444444', busId: 'b2' },
    { id: 'dr3', name: 'Spare', phone: '9666666666', busId: null },
  ],
  conductors: [{ id: 'c1', name: 'Asha', phone: '9555555555', busId: 'b1' }],
  students: [
    { id: 'st-1', name: 'Kid One', busId: 'b1', parentPhone: '9111111111', stopId: 's-c', dropStopId: null },
  ],
  buses: [
    { id: 'b1', busNo: 'B-1', status: 'ACTIVE' },
    { id: 'b2', busNo: 'B-2', status: 'ACTIVE' },
  ],
  // Saved order differs from id order and geography.
  stops: [
    { id: 's-c', busId: 'b1', direction: 'PICKUP', order: 1, name: 'C', lat: 26.89, lng: 75.79 },
    { id: 's-a', busId: 'b1', direction: 'PICKUP', order: 3, name: 'A', lat: 26.5, lng: 75.1 },
    { id: 's-b', busId: 'b1', direction: 'PICKUP', order: 2, name: 'B', lat: 26.7, lng: 75.3 },
    { id: 'd-1', busId: 'b1', direction: 'DROP', order: 1, name: 'D1', lat: 26.8, lng: 75.5 },
    { id: 'x-1', busId: 'b2', direction: 'PICKUP', order: 1, name: 'X1', lat: 26.6, lng: 75.6 },
  ],
  schools: [{ id: 'sch-1', name: 'Green Valley School', lat: 26.9, lng: 75.8 }],
};

let emits = [];
const fakeIo = {
  to: (room) => ({ emit: (event, payload) => { emits.push({ room, event, payload }); } }),
};
const emitted = (event, room) => emits.filter((e) => e.event === event && (!room || e.room === room));

const post = (path, token, body) => {
  const r = request(app).post(path);
  return (token ? r.set('Authorization', token) : r).send(body || {});
};
const get = (path, token) => {
  const r = request(app).get(path);
  return token ? r.set('Authorization', token) : r;
};

// Start a PICKUP trip on b1 as the b1 driver; clears the recorded emits.
async function startB1() {
  const res = await post('/api/trips/start', T.DRIVER, { direction: 'PICKUP' });
  expect(res.status).toBe(201);
  emits = [];
  return res.body.trip;
}

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

beforeEach(() => {
  prisma.__reset(SEED);
  emits = [];
  app.set('io', fakeIo);
});

afterEach(() => {
  // Trip endpoints never push FCM themselves (the notifier is task 8).
  expect(sendMulticast).not.toHaveBeenCalled();
  expect(sendNotification).not.toHaveBeenCalled();
});

describe('POST /api/trips/start', () => {
  test('401 without a token; 403 for PARENT, CONDUCTOR and ADMIN, with no trip created', async () => {
    expect((await post('/api/trips/start', null, { direction: 'PICKUP' })).status).toBe(401);
    for (const token of [T.PARENT, T.CONDUCTOR, T.ADMIN]) {
      expect((await post('/api/trips/start', token, { direction: 'PICKUP' })).status).toBe(403);
    }
    expect(prisma.__state.trips).toHaveLength(0);
    expect(emits).toHaveLength(0);
  });

  test('403 when body.busId is not the driver\'s bus; 409 for a driver with no bus', async () => {
    expect((await post('/api/trips/start', T.DRIVER, { direction: 'PICKUP', busId: 'b2' })).status).toBe(403);
    expect((await post('/api/trips/start', T.DRIVER_NO_BUS, { direction: 'PICKUP', busId: 'b1' })).status).toBe(403);
    const noBus = await post('/api/trips/start', T.DRIVER_NO_BUS, { direction: 'PICKUP' });
    expect(noBus.status).toBe(409);
    expect(noBus.body.message).toMatch(/not assigned/i);
    expect(prisma.__state.trips).toHaveLength(0);
  });

  test('400 for an invalid direction', async () => {
    const res = await post('/api/trips/start', T.DRIVER, { direction: 'SIDEWAYS' });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'direction must be PICKUP or DROP' });
  });

  test('201 creates a snapshot in saved order and emits trip:state + tripStarted to the bus room and admins', async () => {
    const res = await post('/api/trips/start', T.DRIVER, { direction: 'PICKUP', busId: 'b1' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ success: true, resumed: false, missingDropStop: [] });
    const { trip } = res.body;
    expect(trip).toMatchObject({ busId: 'b1', driverId: 'dr1', direction: 'PICKUP', status: 'ACTIVE' });
    expect(trip.stops.map((s) => s.stopId)).toEqual(['s-c', 's-b', 's-a']);
    expect(res.body.currentStop).toMatchObject({ stopId: 's-c', status: 'PENDING' });
    expect(res.body.destination).toMatchObject({ kind: 'STOP', stopId: 's-c' });
    expect(prisma.__state.buses.find((b) => b.id === 'b1').status).toBe('ON_TRIP');

    for (const room of ['bus_b1', 'admins']) {
      const [state] = emitted('trip:state', room);
      expect(state.payload).toMatchObject({ busId: 'b1', trip: { id: trip.id }, currentStop: { stopId: 's-c' } });
      expect(state.payload.destination).toMatchObject({ stopId: 's-c' });
      expect(emitted('tripStarted', room).map((e) => e.payload)).toEqual([
        { busId: 'b1', tripId: trip.id, direction: 'PICKUP' },
      ]);
    }
  });

  test('a second start resumes the ACTIVE trip with 200 and emits trip:state but no tripStarted', async () => {
    const first = await startB1();
    const res = await post('/api/trips/start', T.DRIVER, { direction: 'DROP' });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, resumed: true, trip: { id: first.id, direction: 'PICKUP' } });
    expect(prisma.__state.trips).toHaveLength(1);
    expect(emitted('trip:state').map((e) => e.room).sort()).toEqual(['admins', 'bus_b1']);
    expect(emitted('tripStarted')).toHaveLength(0);
  });

  test('legacy body { busId } with no direction starts a PICKUP trip', async () => {
    const res = await post('/api/trips/start', T.DRIVER, { busId: 'b1' });
    expect(res.status).toBe(201);
    expect(res.body.trip.direction).toBe('PICKUP');
  });

  test('DROP start reports missingDropStop in the response and the admins event only', async () => {
    const res = await post('/api/trips/start', T.DRIVER, { direction: 'DROP' });
    expect(res.status).toBe(201);
    expect(res.body.missingDropStop).toEqual([{ id: 'st-1', name: 'Kid One' }]);
    expect(emitted('trip:state', 'admins')[0].payload.missingDropStop).toEqual([{ id: 'st-1', name: 'Kid One' }]);
    expect(emitted('trip:state', 'bus_b1')[0].payload).not.toHaveProperty('missingDropStop');
  });

  test('works without Socket.IO attached', async () => {
    app.set('io', undefined);
    const res = await post('/api/trips/start', T.DRIVER, { direction: 'PICKUP' });
    expect(res.status).toBe(201);
    expect(emits).toHaveLength(0);
  });

  test('an unexpected error is a 500 with a generic message', async () => {
    prisma.trip.findFirst.mockRejectedValueOnce(new Error('connection lost'));
    const res = await post('/api/trips/start', T.DRIVER, { direction: 'PICKUP' });
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: 'Trip operation failed' });
  });
});

describe('GET /api/trips/current', () => {
  test('DRIVER gets null before a trip and the ACTIVE trip with its stops after', async () => {
    const before = await get('/api/trips/current', T.DRIVER);
    expect(before.status).toBe(200);
    expect(before.body).toEqual({
      success: true, busId: 'b1', trip: null, currentStop: null, destination: null, safetyChecks: [],
    });

    const trip = await startB1();
    const after = await get('/api/trips/current', T.DRIVER);
    expect(after.status).toBe(200);
    expect(after.body).toMatchObject({ success: true, busId: 'b1', trip: { id: trip.id }, currentStop: { stopId: 's-c' } });
    expect(after.body.trip.stops).toHaveLength(3);
  });

  test('CONDUCTOR reads their own bus only; ADMIN needs ?busId; PARENT is refused', async () => {
    const trip = await startB1();
    const conductor = await get('/api/trips/current', T.CONDUCTOR);
    expect(conductor.status).toBe(200);
    expect(conductor.body.trip.id).toBe(trip.id);
    expect((await get('/api/trips/current?busId=b2', T.CONDUCTOR)).status).toBe(403);
    expect((await get('/api/trips/current?busId=b2', T.DRIVER)).status).toBe(403);

    expect((await get('/api/trips/current', T.ADMIN)).status).toBe(400);
    const admin = await get('/api/trips/current?busId=b1', T.ADMIN);
    expect(admin.status).toBe(200);
    expect(admin.body.trip.id).toBe(trip.id);
    expect((await get('/api/trips/current?busId=b2', T.ADMIN)).body.trip).toBeNull();

    expect((await get('/api/trips/current', T.PARENT)).status).toBe(403);
    expect((await get('/api/trips/current')).status).toBe(401);
    expect(emits).toHaveLength(0);
  });
});

describe('POST /api/trips/:id/stops/:tripStopId/complete|skip', () => {
  test('CONDUCTOR, ADMIN, a driver of another bus and a driver with no bus are refused without changes', async () => {
    const trip = await startB1();
    const current = trip.stops[0];
    for (const action of ['complete', 'skip']) {
      const path = `/api/trips/${trip.id}/stops/${current.id}/${action}`;
      for (const token of [T.CONDUCTOR, T.ADMIN, T.PARENT, T.DRIVER_B2, T.DRIVER_NO_BUS]) {
        expect((await post(path, token)).status).toBe(403);
      }
    }
    expect(prisma.__state.tripStops.every((s) => s.status === 'PENDING')).toBe(true);
    expect(emits).toHaveLength(0);
  });

  test('the driver completes then skips the current stop, emitting trip:state each time', async () => {
    const trip = await startB1();
    const [first, second, third] = trip.stops;

    const done = await post(`/api/trips/${trip.id}/stops/${first.id}/complete`, T.DRIVER);
    expect(done.status).toBe(200);
    expect(done.body).toMatchObject({ success: true, busId: 'b1', currentStop: { id: second.id } });
    expect(done.body.trip.stops[0].status).toBe('COMPLETED');
    expect(emitted('trip:state', 'bus_b1')[0].payload.currentStop.id).toBe(second.id);
    expect(emitted('trip:state', 'admins')).toHaveLength(1);

    const skipped = await post(`/api/trips/${trip.id}/stops/${second.id}/skip`, T.DRIVER);
    expect(skipped.status).toBe(200);
    expect(skipped.body.trip.stops[1].status).toBe('SKIPPED');
    expect(skipped.body.currentStop.id).toBe(third.id);
    expect(emitted('trip:state')).toHaveLength(4);
  });

  test('409 for a stop that is not the current stop; 404 for an unknown trip', async () => {
    const trip = await startB1();
    const res = await post(`/api/trips/${trip.id}/stops/${trip.stops[2].id}/complete`, T.DRIVER);
    expect(res.status).toBe(409);
    expect(res.body).toEqual({ message: 'Only the current stop can be updated' });
    expect((await post(`/api/trips/nope/stops/${trip.stops[0].id}/skip`, T.DRIVER)).status).toBe(404);
    expect(emits).toHaveLength(0);
  });
});

describe('POST /api/trips/:id/stops/:tripStopId/cancel', () => {
  test('ADMIN only; cancelling any open stop emits trip:state', async () => {
    const trip = await startB1();
    const path = `/api/trips/${trip.id}/stops/${trip.stops[1].id}/cancel`;
    for (const token of [T.DRIVER, T.CONDUCTOR, T.PARENT]) {
      expect((await post(path, token)).status).toBe(403);
    }
    expect(emits).toHaveLength(0);

    const res = await post(path, T.ADMIN);
    expect(res.status).toBe(200);
    expect(res.body.trip.stops[1].status).toBe('CANCELLED');
    expect(res.body.currentStop.id).toBe(trip.stops[0].id);
    expect(emitted('trip:state').map((e) => e.room).sort()).toEqual(['admins', 'bus_b1']);

    expect((await post(path, T.ADMIN)).status).toBe(409);
  });
});

describe('POST /api/trips/:id/end', () => {
  test('CONDUCTOR and a driver of another bus are refused', async () => {
    const trip = await startB1();
    for (const token of [T.CONDUCTOR, T.DRIVER_B2, T.DRIVER_NO_BUS, T.PARENT]) {
      expect((await post(`/api/trips/${trip.id}/end`, token)).status).toBe(403);
    }
    expect(prisma.__state.trips[0].status).toBe('ACTIVE');
    expect(emits).toHaveLength(0);
  });

  test('the driver ends the trip: COMPLETED, open stops CANCELLED, trip:state + tripEnded emitted', async () => {
    const trip = await startB1();
    const res = await post(`/api/trips/${trip.id}/end`, T.DRIVER);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, busId: 'b1', trip: { status: 'COMPLETED' }, currentStop: null });
    expect(res.body.trip.stops.every((s) => s.status === 'CANCELLED')).toBe(true);
    expect(prisma.__state.buses.find((b) => b.id === 'b1').status).toBe('ACTIVE');
    for (const room of ['bus_b1', 'admins']) {
      expect(emitted('trip:state', room)[0].payload).toMatchObject({ busId: 'b1', trip: { status: 'COMPLETED' } });
      expect(emitted('tripEnded', room).map((e) => e.payload)).toEqual([{ busId: 'b1', tripId: trip.id }]);
    }
  });

  test('ADMIN may end any trip; 404 for an unknown trip', async () => {
    const trip = await startB1();
    expect((await post(`/api/trips/${trip.id}/end`, T.ADMIN)).status).toBe(200);
    expect(prisma.__state.trips[0].status).toBe('COMPLETED');
    expect((await post('/api/trips/missing/end', T.ADMIN)).status).toBe(404);
  });
});

describe('legacy POST /api/trips/end { busId }', () => {
  test('ends the ACTIVE trip of the bus through the trip service', async () => {
    const trip = await startB1();
    const res = await post('/api/trips/end', T.DRIVER, { busId: 'b1' });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, busId: 'b1', trip: { id: trip.id, status: 'COMPLETED' } });
    expect(emitted('tripEnded', 'bus_b1')).toHaveLength(1);
    expect(emitted('trip:state', 'admins')).toHaveLength(1);
  });

  test('without an ACTIVE trip it only resets the bus status, as before', async () => {
    prisma.__state.buses[0].status = 'ON_TRIP';
    const res = await post('/api/trips/end', T.ADMIN, { busId: 'b1' });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, busId: 'b1', trip: null });
    expect(prisma.__state.buses[0].status).toBe('ACTIVE');
    expect(emits).toHaveLength(0);
  });

  test('CONDUCTOR and a driver of another bus are refused', async () => {
    await startB1();
    expect((await post('/api/trips/end', T.CONDUCTOR, { busId: 'b1' })).status).toBe(403);
    expect((await post('/api/trips/end', T.DRIVER_B2, { busId: 'b1' })).status).toBe(403);
    expect(prisma.__state.trips[0].status).toBe('ACTIVE');
  });
});

// Focused tests for the conductor safety check service and routes (task
// 17.1). Prisma is an in-memory fake that enforces the Attendance unique key
// (tripId, studentId, type) with P2002; Socket.IO is a fake that records
// emits. Full property/example suites are tasks 17.3/17.4.
// Validates: Requirements 18.4, 18.7, 18.8, 18.11
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/testdb';
process.env.JWT_SECRET = 'test-jwt-secret';

jest.mock('../src/db', () => {
  const keys = ['users', 'drivers', 'conductors', 'students', 'buses', 'stops', 'schools', 'trips', 'tripStops', 'attendances'];
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
  const model = (key, unique) => ({
    findMany: jest.fn(async (args = {}) =>
      applyOrderBy(state[key].filter((r) => matches(r, args.where)), args.orderBy).map(clone)),
    findUnique: jest.fn(async (args = {}) => clone(state[key].find((r) => matches(r, args.where)))),
    findFirst: jest.fn(async (args = {}) =>
      clone(applyOrderBy(state[key].filter((r) => matches(r, args.where)), args.orderBy)[0])),
    create: jest.fn(async ({ data }) => {
      if (unique && state[key].some((r) => unique.every((k) => r[k] === data[k]))) {
        throw Object.assign(new Error('Unique constraint failed'), { code: 'P2002' });
      }
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
    delete: jest.fn(async ({ where }) => {
      const i = state[key].findIndex((r) => r.id === where.id);
      if (i < 0) throw Object.assign(new Error('Record not found'), { code: 'P2025' });
      return state[key].splice(i, 1)[0];
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
    attendance: model('attendances', ['tripId', 'studentId', 'type']),
    $disconnect: jest.fn(),
  };
  client.$transaction = async (fn) => fn(client);
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
const safety = require('../src/services/safetyCheckService');
const { tripState } = require('../src/services/tripService');

const sign = (payload) => `Bearer ${jwt.sign(payload, 'test-jwt-secret')}`;
const T = {
  ADMIN: sign({ id: 'a1', role: 'ADMIN' }),
  PARENT: sign({ id: 'u-parent', role: 'PARENT', phone: '9111111111' }),
  DRIVER: sign({ id: 'u-driver', role: 'DRIVER', phone: '9333333333' }), // bus b1
  CONDUCTOR: sign({ id: 'u-c1', role: 'CONDUCTOR', phone: '9555555555' }), // bus b1
  CONDUCTOR_B2: sign({ id: 'u-c2', role: 'CONDUCTOR', phone: '9777777777' }), // bus b2
};

const STARTED = new Date('2026-03-10T20:00:00.000Z'); // 11 March, 01:30 in Asia/Kolkata
const SEED = {
  drivers: [{ id: 'dr1', name: 'Ravi', phone: '9333333333', busId: 'b1' }],
  conductors: [
    { id: 'c1', name: 'Asha', phone: '9555555555', busId: 'b1' },
    { id: 'c2', name: 'Meena', phone: '9777777777', busId: 'b2' },
  ],
  buses: [{ id: 'b1', busNo: 'B-1', status: 'ON_TRIP' }, { id: 'b2', busNo: 'B-2', status: 'ACTIVE' }],
  students: [
    { id: 'st-1', name: 'Kid One', busId: 'b1', parentPhone: '9111111111', stopId: 's-1', dropStopId: 'd-1' },
    { id: 'st-2', name: 'Kid Two', busId: 'b1', parentPhone: '9222222222', stopId: 's-2', dropStopId: null },
    { id: 'st-3', name: 'Kid Three', busId: 'b2', parentPhone: '9888888888', stopId: 's-1', dropStopId: null },
  ],
  trips: [
    { id: 't1', busId: 'b1', driverId: 'dr1', direction: 'PICKUP', status: 'ACTIVE', startedAt: STARTED },
    { id: 't0', busId: 'b1', driverId: 'dr1', direction: 'DROP', status: 'COMPLETED', startedAt: STARTED },
  ],
  tripStops: [
    { id: 'ts1', tripId: 't1', stopId: 's-1', order: 1, name: 'One', lat: 26.1, lng: 75.1, status: 'ARRIVED' },
    { id: 'ts2', tripId: 't1', stopId: 's-2', order: 2, name: 'Two', lat: 26.2, lng: 75.2, status: 'CANCELLED' },
    { id: 'ts0', tripId: 't0', stopId: 'd-1', order: 1, name: 'Drop', lat: 26.3, lng: 75.3, status: 'COMPLETED' },
  ],
};

let emits = [];
const fakeIo = { to: (room) => ({ emit: (event, payload) => { emits.push({ room, event, payload }); } }) };
const emitted = (event) => emits.filter((e) => e.event === event);

const post = (path, token, body) => {
  const r = request(app).post(path);
  return (token ? r.set('Authorization', token) : r).send(body || {});
};
const del = (path, token) => request(app).delete(path).set('Authorization', token);
const record = (token, body) => post('/api/trips/t1/safety-checks', token, body);
const flush = () => new Promise((resolve) => setImmediate(resolve));

const hook = jest.fn(async () => undefined);

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});
afterAll(() => {
  safety.setOnSafetyCheck(null);
  jest.restoreAllMocks();
});
beforeEach(() => {
  prisma.__reset(SEED);
  emits = [];
  hook.mockClear();
  safety.setOnSafetyCheck(hook);
  app.set('io', fakeIo);
});
afterEach(() => {
  // Parent alerts go through the onSafetyCheck hook, which is mocked here
  // (alert texts are covered in safetyAlerts.test.js); no trip ends here.
  expect(sendMulticast).not.toHaveBeenCalled();
  expect(sendNotification).not.toHaveBeenCalled();
});

describe('pure helpers', () => {
  const trip = { id: 't', busId: 'b1', direction: 'DROP', stops: [
    { stopId: 'd-1', status: 'COMPLETED' }, { stopId: 'd-2', status: 'CANCELLED' }, { stopId: 'd-3', status: 'PENDING' },
  ] };

  test('expectedType maps the direction', () => {
    expect(safety.expectedType({ direction: 'PICKUP' })).toBe('BOARDED');
    expect(safety.expectedType({ direction: 'DROP' })).toBe('DROPPED_SAFE');
    expect(safety.expectedType({ direction: 'X' })).toBeNull();
  });

  test('isEligible needs the same bus and a non-cancelled TripStop for the Relevant_Stop', () => {
    expect(safety.isEligible({ busId: 'b1', dropStopId: 'd-1' }, trip)).toBe(true);
    expect(safety.isEligible({ busId: 'b1', dropStopId: 'd-3' }, trip)).toBe(true);
    expect(safety.isEligible({ busId: 'b1', dropStopId: 'd-2' }, trip)).toBe(false);
    expect(safety.isEligible({ busId: 'b2', dropStopId: 'd-1' }, trip)).toBe(false);
    expect(safety.isEligible({ busId: 'b1', stopId: 'd-1', dropStopId: null }, trip)).toBe(false);
  });

  test('missingDropSafe lists students on COMPLETED stops without DROPPED_SAFE', () => {
    const students = [
      { id: 'a', busId: 'b1', dropStopId: 'd-1' },
      { id: 'b', busId: 'b1', dropStopId: 'd-1' },
      { id: 'c', busId: 'b1', dropStopId: 'd-3' },
      { id: 'd', busId: 'b2', dropStopId: 'd-1' },
    ];
    const checks = [{ studentId: 'b', type: 'DROPPED_SAFE' }, { studentId: 'a', type: 'BOARDED' }];
    expect(safety.missingDropSafe(trip, students, checks).map((s) => s.id)).toEqual(['a']);
    expect(safety.missingDropSafe({ ...trip, direction: 'PICKUP' }, students, [])).toEqual([]);
  });
});

describe('POST /api/trips/:id/safety-checks', () => {
  test('the conductor of the bus records a check once, with the Attendance mapping', async () => {
    const res = await record(T.CONDUCTOR, { studentId: 'st-1', type: 'boarded' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      success: true, created: true, check: { studentId: 'st-1', type: 'BOARDED', conductorId: 'c1' },
    });
    expect(res.body.safetyChecks).toEqual([res.body.check]);

    const rows = prisma.__state.attendances;
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      tripId: 't1', studentId: 'st-1', busId: 'b1', type: 'BOARDED', conductorId: 'c1',
      date: '2026-03-11', tripType: 'pickup', boarded: true,
    });
    expect(rows[0].checkedAt).toBeInstanceOf(Date);

    const events = emitted('trip:safety');
    expect(events.map((e) => e.room).sort()).toEqual(['admins', 'bus_b1']);
    expect(events[0].payload).toMatchObject({ busId: 'b1', tripId: 't1', action: 'RECORDED', check: res.body.check });

    await flush();
    expect(hook).toHaveBeenCalledTimes(1);
    expect(hook.mock.calls[0][0]).toEqual(res.body.check);
    expect(hook.mock.calls[0][1]).toMatchObject({ busId: 'b1', student: { id: 'st-1' }, conductor: { id: 'c1' } });
  });

  test('a repeat returns the existing record with no event and no second hook call', async () => {
    const first = await record(T.CONDUCTOR, { studentId: 'st-1', type: 'BOARDED' });
    emits = [];
    const again = await record(T.CONDUCTOR, { studentId: 'st-1', type: 'BOARDED' });
    expect(again.status).toBe(200);
    expect(again.body).toMatchObject({ created: false, check: first.body.check });
    expect(prisma.__state.attendances).toHaveLength(1);
    expect(emitted('trip:safety')).toHaveLength(0);
    await flush();
    expect(hook).toHaveBeenCalledTimes(1);
  });

  test('403 for another bus\'s conductor, DRIVER and PARENT; 401 without a token', async () => {
    const body = { studentId: 'st-1', type: 'BOARDED' };
    for (const token of [T.CONDUCTOR_B2, T.DRIVER, T.PARENT]) {
      expect((await record(token, body)).status).toBe(403);
    }
    expect((await record(null, body)).status).toBe(401);
    expect(prisma.__state.attendances).toHaveLength(0);
  });

  test('409 for an ineligible student, the wrong type or a non-ACTIVE trip; 400/404 for bad input', async () => {
    expect((await record(T.CONDUCTOR, { studentId: 'st-2', type: 'BOARDED' })).status).toBe(409); // cancelled stop
    expect((await record(T.CONDUCTOR, { studentId: 'st-3', type: 'BOARDED' })).status).toBe(409); // other bus
    expect((await record(T.CONDUCTOR, { studentId: 'nope', type: 'BOARDED' })).status).toBe(409);
    expect((await record(T.CONDUCTOR, { studentId: 'st-1', type: 'DROPPED_SAFE' })).status).toBe(409);
    expect((await post('/api/trips/t0/safety-checks', T.CONDUCTOR, { studentId: 'st-1', type: 'DROPPED_SAFE' })).status)
      .toBe(409);
    expect((await record(T.CONDUCTOR, { studentId: 'st-1', type: 'ABSENT' })).status).toBe(400);
    expect((await record(T.CONDUCTOR, { type: 'BOARDED' })).status).toBe(400);
    expect((await post('/api/trips/zzz/safety-checks', T.CONDUCTOR, { studentId: 'st-1', type: 'BOARDED' })).status)
      .toBe(404);
    expect(prisma.__state.attendances).toHaveLength(0);
    expect(emits).toHaveLength(0);
  });

  test('ADMIN may record a check without a conductor id', async () => {
    const res = await record(T.ADMIN, { studentId: 'st-1', type: 'BOARDED' });
    expect(res.status).toBe(201);
    expect(res.body.check.conductorId).toBeNull();
  });
});

describe('DELETE /api/trips/:id/safety-checks/:checkId', () => {
  const seedCheck = (ageMs, extra = {}) => {
    const row = {
      id: 'att-1', tripId: 't1', studentId: 'st-1', busId: 'b1', type: 'BOARDED', conductorId: 'c1',
      checkedAt: new Date(Date.now() - ageMs), date: '2026-03-11', tripType: 'pickup', boarded: true, ...extra,
    };
    prisma.__state.attendances.push(row);
    return row;
  };

  test('the same conductor undoes within 2 minutes; the record is gone and trip:safety is emitted', async () => {
    seedCheck(119 * 1000);
    const res = await del('/api/trips/t1/safety-checks/att-1', T.CONDUCTOR);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, check: { id: 'att-1' }, safetyChecks: [] });
    expect(prisma.__state.attendances).toHaveLength(0);
    expect(emitted('trip:safety').map((e) => e.payload.action)).toEqual(['UNDONE', 'UNDONE']);
    await flush();
    expect(hook).not.toHaveBeenCalled();
  });

  test('409 after 2 minutes, record kept', async () => {
    seedCheck(121 * 1000);
    expect((await del('/api/trips/t1/safety-checks/att-1', T.CONDUCTOR)).status).toBe(409);
    expect(prisma.__state.attendances).toHaveLength(1);
  });

  test('404 unknown check; 403 for a different conductor; ADMIN may undo', async () => {
    expect((await del('/api/trips/t1/safety-checks/missing', T.CONDUCTOR)).status).toBe(404);
    seedCheck(10 * 1000, { conductorId: 'c-other' });
    expect((await del('/api/trips/t1/safety-checks/att-1', T.CONDUCTOR)).status).toBe(403);
    expect((await del('/api/trips/t1/safety-checks/att-1', T.CONDUCTOR_B2)).status).toBe(403);
    expect((await del('/api/trips/t1/safety-checks/att-1', T.ADMIN)).status).toBe(200);
  });
});

describe('trip state carries safetyChecks', () => {
  test('GET /api/trips/current lists the trip\'s checks at the top level', async () => {
    const rec = await record(T.CONDUCTOR, { studentId: 'st-1', type: 'BOARDED' });
    const res = await request(app).get('/api/trips/current').set('Authorization', T.CONDUCTOR);
    expect(res.status).toBe(200);
    expect(res.body.trip).toMatchObject({ id: 't1' });
    expect(res.body.trip).not.toHaveProperty('safetyChecks');
    expect(res.body.safetyChecks).toEqual([rec.body.check]);
  });

  test('tripState defaults to an empty list', () => {
    expect(tripState('b1', null).safetyChecks).toEqual([]);
    expect(tripState('b1', { id: 't', status: 'ACTIVE', stops: [] }).safetyChecks).toEqual([]);
  });
});

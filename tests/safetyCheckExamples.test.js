// Safety check example tests (task 17.4).
// Already covered elsewhere, not repeated here:
// - safetyChecks.test.js: wrong conductor / DRIVER / PARENT 403, ineligible
//   student, wrong type and non-ACTIVE trip 409, repeat returns the existing
//   check (200, created:false, no event, no second hook call), undo within
//   2 minutes and 409 after, Attendance field mapping (18.4, 18.7, 18.8, 18.11).
// - safetyAlerts.test.js: exact "Boarded the bus" / "Dropped off safely" texts,
//   repeat/undo send no second alert, DROP trip end admin alert for missing
//   "Dropped safely" checks (18.5, 18.6, 18.10).
// This file adds: the existing attendance list (GET /api/attendance) and the
// legacy POST /api/attendance keep working next to safety check rows.
// Prisma is an in-memory fake; FCM is mocked.
// Validates: Requirements 18.11
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/testdb';
process.env.JWT_SECRET = 'test-jwt-secret';

jest.mock('../src/db', () => {
  const keys = ['users', 'drivers', 'conductors', 'students', 'buses', 'stops', 'schools', 'trips', 'tripStops', 'attendances'];
  const state = {};
  let seq = 0;
  const clone = (x) => (x ? { ...x } : null);
  const matches = (row, where = {}) => Object.entries(where).every(([k, v]) => {
    if (v === undefined) return true;
    if (v && typeof v === 'object' && !(v instanceof Date)) {
      if ('in' in v) return v.in.includes(row[k]);
      if ('not' in v) return row[k] !== v.not && !(v.not === null && row[k] === undefined);
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
      if (unique && state[key].some((r) => unique.every((k) => r[k] !== undefined && r[k] === data[k]))) {
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
const app = require('../src/app');
const safety = require('../src/services/safetyCheckService');

const sign = (payload) => `Bearer ${jwt.sign(payload, 'test-jwt-secret')}`;
const T = {
  ADMIN: sign({ id: 'a1', role: 'ADMIN' }),
  CONDUCTOR_B1: sign({ id: 'u-c1', role: 'CONDUCTOR', phone: '9555555555' }),
  CONDUCTOR_B2: sign({ id: 'u-c2', role: 'CONDUCTOR', phone: '9777777777' }),
};

const STARTED = new Date('2026-03-10T20:00:00.000Z'); // 11 March in Asia/Kolkata
const DATE = '2026-03-11';
const SEED = {
  drivers: [
    { id: 'dr1', name: 'Ravi', phone: '9333333333', busId: 'b1' },
    { id: 'dr2', name: 'Mohan', phone: '9333333334', busId: 'b2' },
  ],
  conductors: [
    { id: 'c1', name: 'Asha', phone: '9555555555', busId: 'b1' },
    { id: 'c2', name: 'Meena', phone: '9777777777', busId: 'b2' },
  ],
  buses: [{ id: 'b1', busNo: 'B-1', status: 'ON_TRIP' }, { id: 'b2', busNo: 'B-2', status: 'ON_TRIP' }],
  students: [
    { id: 'st-1', name: 'Kid One', busId: 'b1', parentPhone: '9111111111', stopId: 's-1', dropStopId: null },
    { id: 'st-2', name: 'Kid Two', busId: 'b1', parentPhone: '9222222222', stopId: 's-1', dropStopId: null },
    { id: 'st-3', name: 'Kid Three', busId: 'b2', parentPhone: '9444444444', stopId: null, dropStopId: 'd-1' },
  ],
  trips: [
    { id: 't1', busId: 'b1', driverId: 'dr1', direction: 'PICKUP', status: 'ACTIVE', startedAt: STARTED },
    { id: 't2', busId: 'b2', driverId: 'dr2', direction: 'DROP', status: 'ACTIVE', startedAt: STARTED },
  ],
  tripStops: [
    { id: 'ts1', tripId: 't1', stopId: 's-1', order: 1, name: 'One', lat: 26.1, lng: 75.1, status: 'ARRIVED' },
    { id: 'ts2', tripId: 't2', stopId: 'd-1', order: 1, name: 'Drop', lat: 26.3, lng: 75.3, status: 'ARRIVED' },
  ],
};

const fakeIo = { to: () => ({ emit: () => {} }) };
const post = (path, token, body) => request(app).post(path).set('Authorization', token).send(body || {});
const list = (token, query) => request(app).get('/api/attendance').query(query).set('Authorization', token);

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});
afterAll(() => jest.restoreAllMocks());
beforeEach(() => {
  prisma.__reset(SEED);
  safety.setOnSafetyCheck(null);
  app.set('io', fakeIo);
});

describe('existing attendance list keeps working with safety checks (18.11)', () => {
  test('GET /api/attendance lists BOARDED and DROPPED_SAFE checks as attendance rows', async () => {
    expect((await post('/api/trips/t1/safety-checks', T.CONDUCTOR_B1, { studentId: 'st-1', type: 'BOARDED' })).status).toBe(201);
    expect((await post('/api/trips/t2/safety-checks', T.CONDUCTOR_B2, { studentId: 'st-3', type: 'DROPPED_SAFE' })).status).toBe(201);

    const b1 = await list(T.ADMIN, { busId: 'b1', date: DATE });
    expect(b1.status).toBe(200);
    expect(b1.body.success).toBe(true);
    expect(b1.body.attendance).toHaveLength(1);
    expect(b1.body.attendance[0]).toMatchObject({
      studentId: 'st-1', busId: 'b1', date: DATE, tripType: 'pickup', boarded: true,
      tripId: 't1', conductorId: 'c1', type: 'BOARDED',
    });

    const b2 = await list(T.ADMIN, { busId: 'b2', date: DATE });
    expect(b2.body.attendance).toHaveLength(1);
    expect(b2.body.attendance[0]).toMatchObject({
      studentId: 'st-3', busId: 'b2', date: DATE, tripType: 'drop', boarded: true,
      tripId: 't2', conductorId: 'c2', type: 'DROPPED_SAFE',
    });
  });

  test('legacy POST /api/attendance still marks rows next to safety checks, and the list returns both', async () => {
    await post('/api/trips/t1/safety-checks', T.CONDUCTOR_B1, { studentId: 'st-1', type: 'BOARDED' });
    const legacy = await post('/api/attendance', T.ADMIN, { studentId: 'st-2', busId: 'b1', date: DATE, boarded: false });
    expect(legacy.status).toBe(200);
    expect(legacy.body.attendance).toMatchObject({ studentId: 'st-2', busId: 'b1', date: DATE, boarded: false });

    const res = await list(T.ADMIN, { busId: 'b1', date: DATE });
    expect(res.status).toBe(200);
    expect(res.body.attendance.map((a) => a.studentId).sort()).toEqual(['st-1', 'st-2']);
  });

  test('the attendance list stays ADMIN-only', async () => {
    expect((await list(T.CONDUCTOR_B1, { busId: 'b1', date: DATE })).status).toBe(403);
  });
});

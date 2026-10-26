// Example tests for student drop stops and the bus full-detail sequences
// (task 4.5). Property 8 is task 4.8.
// Prisma is an in-memory fake; no DB.
// Validates: Requirements 5.7, 5.8, 5.9
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/testdb';
process.env.JWT_SECRET = 'test-jwt-secret';

function mockCreateFakePrisma() {
  const state = { stops: [], students: [], buses: [], drivers: [], users: [], liveLocations: [] };
  const stats = { writes: 0 };
  const clone = (x) => (x ? { ...x } : null);

  const matches = (row, where = {}) => Object.entries(where).every(([k, v]) => {
    if (v && typeof v === 'object') {
      if ('in' in v) return v.in.includes(row[k]);
      if ('not' in v) return row[k] !== v.not;
      return true;
    }
    return row[k] === v;
  });
  const notFound = () => Object.assign(new Error('Record not found'), { code: 'P2025' });

  // Deliberately ignores orderBy: the code under test must not rely on the
  // client's ordering to produce the saved sequence.
  const model = (key) => ({
    findMany: async (args = {}) => state[key].filter((r) => matches(r, args.where)).map(clone),
    findUnique: async (args = {}) => clone(state[key].find((r) => matches(r, args.where))),
    findFirst: async (args = {}) => clone(state[key].find((r) => matches(r, args.where))),
    create: async ({ data }) => {
      stats.writes += 1;
      const row = { id: `${key}-${state[key].length + 1}`, ...data };
      state[key].push(row);
      return clone(row);
    },
    update: async ({ where, data }) => {
      const row = state[key].find((r) => r.id === where.id);
      if (!row) throw notFound();
      stats.writes += 1;
      Object.assign(row, data);
      return clone(row);
    },
  });

  const client = {
    stop: model('stops'),
    student: model('students'),
    bus: model('buses'),
    driver: model('drivers'),
    user: model('users'),
    liveLocation: model('liveLocations'),
    $queryRaw: async () => [],
    $disconnect: async () => {},
  };
  client.$transaction = async (fn) => fn(client);
  client.__state = state;
  client.__stats = stats;
  client.__reset = (seed = {}) => {
    Object.keys(state).forEach((k) => { state[k] = (seed[k] || []).map(clone); });
    stats.writes = 0;
  };
  return client;
}

jest.mock('../src/db', () => mockCreateFakePrisma());

const request = require('supertest');
const jwt = require('jsonwebtoken');
const prisma = require('../src/db');
const { validateDropStop, validatePickupStop } = require('../src/services/stopService');
const app = require('../src/app');

const sign = (payload, secret = 'test-jwt-secret') => `Bearer ${jwt.sign(payload, secret)}`;
const ADMIN = sign({ id: 'a1', role: 'ADMIN' });
const PARENT = sign({ id: 'u-parent', role: 'PARENT', phone: '9111111111' });
const DRIVER = sign({ id: 'u-driver', role: 'DRIVER', phone: '9333333333' });
const BAD = sign({ id: 'a1', role: 'ADMIN' }, 'wrong-secret');

const stop = (id, busId, direction, order, lat, lng) => ({ id, busId, direction, order, lat, lng, name: `Stop ${id}` });

// Bus b1: pickup and drop sequences whose saved order disagrees with
// geography (order 1 is farthest from the school at 26.90, 75.80) and whose
// rows are stored out of order. Bus b2 has its own DROP stop.
const seed = () => ({
  buses: [{ id: 'b1', busNo: 'B-1', status: 'ACTIVE' }, { id: 'b2', busNo: 'B-2', status: 'ACTIVE' }],
  users: [
    { id: 'u-parent', phone: '9111111111', role: 'PARENT' },
    { id: 'u-driver', phone: '9333333333', role: 'DRIVER' },
  ],
  drivers: [{ id: 'dr1', name: 'Ravi', phone: '9333333333', busId: 'b1' }],
  students: [
    { id: 's1', name: 'Kid 1', busId: 'b1', parentPhone: '9111111111', stopId: 'p1', dropStopId: null },
  ],
  stops: [
    stop('p3', 'b1', 'PICKUP', 3, 26.901, 75.801),
    stop('d2', 'b1', 'DROP', 2, 26.902, 75.802),
    stop('p1', 'b1', 'PICKUP', 1, 27.5, 76.5),
    stop('d1', 'b1', 'DROP', 1, 27.6, 76.6),
    stop('p2', 'b1', 'PICKUP', 2, 27.2, 76.1),
    stop('x1', 'b2', 'DROP', 1, 26.95, 75.85),
  ],
});

const student = () => prisma.__state.students.find((s) => s.id === 's1');
const put = (id, body, auth = ADMIN) => {
  const r = request(app).put(`/api/students/${id}`);
  return (auth ? r.set('Authorization', auth) : r).send(body);
};

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});
afterAll(() => jest.restoreAllMocks());
beforeEach(() => prisma.__reset(seed()));

describe('validateDropStop / validatePickupStop', () => {
  const kid = { id: 's1', busId: 'b1' };

  test('accepts only a DROP stop of the same bus for drop', () => {
    expect(validateDropStop(kid, stop('d', 'b1', 'DROP', 1, 0, 0)).ok).toBe(true);
    expect(validateDropStop(kid, stop('d', 'b2', 'DROP', 1, 0, 0)).ok).toBe(false);
    expect(validateDropStop(kid, stop('p', 'b1', 'PICKUP', 1, 0, 0)).ok).toBe(false);
    expect(validateDropStop(kid, null)).toEqual({ ok: false, reason: 'Drop stop not found' });
  });

  test('treats a stop without a direction as PICKUP', () => {
    const legacy = { id: 'old', busId: 'b1', order: 1 };
    expect(validatePickupStop(kid, legacy).ok).toBe(true);
    expect(validateDropStop(kid, legacy).ok).toBe(false);
  });
});

describe('PUT /api/students/:id', () => {
  test('assigns a DROP stop of the same bus and keeps stopId as the pickup stop', async () => {
    const res = await put('s1', { dropStopId: 'd2' });
    expect(res.status).toBe(200);
    expect(res.body.student).toMatchObject({ id: 's1', dropStopId: 'd2', stopId: 'p1' });
    expect(student()).toMatchObject({ dropStopId: 'd2', stopId: 'p1' });
  });

  test.each([
    ['a DROP stop of another bus', 'x1'],
    ['a PICKUP stop', 'p2'],
    ['an unknown stop', 'nope'],
  ])('rejects %s with 400 and writes nothing', async (_label, dropStopId) => {
    const res = await put('s1', { dropStopId });
    expect(res.status).toBe(400);
    expect(prisma.__stats.writes).toBe(0);
    expect(student()).toMatchObject({ dropStopId: null, stopId: 'p1' });
  });

  test('rejects a non-string dropStopId and an empty body with 400', async () => {
    expect((await put('s1', { dropStopId: 5 })).status).toBe(400);
    expect((await put('s1', {})).status).toBe(400);
    expect(prisma.__stats.writes).toBe(0);
  });

  test('clears the drop stop with null', async () => {
    student().dropStopId = 'd1';
    const res = await put('s1', { dropStopId: null });
    expect(res.status).toBe(200);
    expect(student()).toMatchObject({ dropStopId: null, stopId: 'p1' });
  });

  test('stopId, if given, must be a PICKUP stop of the same bus', async () => {
    expect((await put('s1', { stopId: 'd1' })).status).toBe(400);
    expect((await put('s1', { stopId: 'p2', dropStopId: 'x1' })).status).toBe(400);
    expect(prisma.__stats.writes).toBe(0);

    const ok = await put('s1', { stopId: 'p2', dropStopId: 'd1' });
    expect(ok.status).toBe(200);
    expect(student()).toMatchObject({ stopId: 'p2', dropStopId: 'd1' });
  });

  test('unknown student -> 404', async () => {
    expect((await put('missing', { dropStopId: 'd1' })).status).toBe(404);
  });

  test('is ADMIN-only: 401 without or with a bad token, 403 for PARENT and DRIVER', async () => {
    expect((await put('s1', { dropStopId: 'd1' }, null)).status).toBe(401);
    expect((await put('s1', { dropStopId: 'd1' }, BAD)).status).toBe(401);
    expect((await put('s1', { dropStopId: 'd1' }, PARENT)).status).toBe(403);
    expect((await put('s1', { dropStopId: 'd1' }, DRIVER)).status).toBe(403);
    expect(prisma.__stats.writes).toBe(0);
    expect(student().dropStopId).toBeNull();
  });
});

describe('POST /api/students with drop stop and parent fields', () => {
  const base = { name: 'New Kid', busId: 'b1', parentPhone: '9222222222' };
  const post = (body) => request(app).post('/api/students').set('Authorization', ADMIN).send(body);

  test('stores dropStopId, parentPhone2, fatherName and motherName', async () => {
    const res = await post({
      ...base, stopId: 'p3', dropStopId: 'd1', parentPhone2: ' 9555555555 ', fatherName: 'Raj', motherName: 'Sita',
    });
    expect(res.status).toBe(200);
    expect(res.body.student).toMatchObject({
      busId: 'b1', stopId: 'p3', dropStopId: 'd1', parentPhone2: '9555555555', fatherName: 'Raj', motherName: 'Sita',
    });
  });

  test('without the new fields behaves as before', async () => {
    const res = await post(base);
    expect(res.status).toBe(200);
    expect(res.body.student).toMatchObject({ ...base, stopId: null, admissionNo: '', class: '' });
    expect(res.body.student).not.toHaveProperty('dropStopId');
  });

  test.each([
    ['dropStopId on another bus', { dropStopId: 'x1' }],
    ['a PICKUP stop as dropStopId', { dropStopId: 'p1' }],
    ['an unknown dropStopId', { dropStopId: 'nope' }],
    ['a non-string fatherName', { fatherName: 42 }],
  ])('rejects %s with 400', async (_label, extra) => {
    const res = await post({ ...base, ...extra });
    expect(res.status).toBe(400);
    expect(prisma.__stats.writes).toBe(0);
  });
});

describe('GET /api/buses/:busId/full', () => {
  test('returns independent pickup and drop sequences in saved order, stops = pickup', async () => {
    const res = await request(app).get('/api/buses/b1/full').set('Authorization', ADMIN);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true, busId: 'b1', busNo: 'B-1', status: 'ACTIVE', tripActive: false,
      driver: { id: 'dr1', name: 'Ravi', phone: '9333333333' }, liveLocation: null,
    });

    const ids = (list) => list.map((s) => s.id);
    expect(ids(res.body.pickupStops)).toEqual(['p1', 'p2', 'p3']);
    expect(ids(res.body.dropStops)).toEqual(['d1', 'd2']);
    expect(res.body.stops).toEqual(res.body.pickupStops);
    expect(res.body.pickupStops.every((s) => s.direction === 'PICKUP')).toBe(true);
    expect(res.body.dropStops.every((s) => s.direction === 'DROP')).toBe(true);
    expect(res.body.pickupStops[0]).toEqual({
      id: 'p1', name: 'Stop p1', lat: 27.5, lng: 76.5, order: 1, direction: 'PICKUP',
    });

    // Geography (nearest the school first) would give a different order.
    const byLat = (list) => ids([...list].sort((a, b) => a.lat - b.lat));
    expect(byLat(res.body.pickupStops)).toEqual(['p3', 'p2', 'p1']);
    expect(byLat(res.body.dropStops)).toEqual(['d2', 'd1']);
  });

  test('a bus with only drop stops returns empty pickupStops and stops', async () => {
    const res = await request(app).get('/api/buses/b2/full').set('Authorization', ADMIN);
    expect(res.status).toBe(200);
    expect(res.body.pickupStops).toEqual([]);
    expect(res.body.stops).toEqual([]);
    expect(res.body.dropStops.map((s) => s.id)).toEqual(['x1']);
  });
});

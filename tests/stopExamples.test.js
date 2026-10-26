// Stop example tests (task 4.9) for the cases not already covered by
// tests/stopService.test.js and tests/dropStops.test.js:
//   - legacy stops (no `direction`) are PICKUP in the list, /full and student
//     assignment, and DROP stop create/reorder/delete never touch stopId
//   - the exact /full response shape
//   - pickup and drop sequences over the same physical points stay independent
// Prisma is an in-memory fake; no DB.
// Validates: Requirements 5.7, 5.9
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/testdb';
process.env.JWT_SECRET = 'test-jwt-secret';

function mockCreateFakePrisma() {
  const state = { stops: [], students: [], buses: [], drivers: [], users: [], liveLocations: [] };
  const stats = { writes: 0 };
  let nextId = 1;
  const clone = (x) => (x ? { ...x } : null);

  // Column defaults the real DB applies when a row predates the column. The
  // migration adds Stop.direction NOT NULL DEFAULT 'PICKUP', so a WHERE on
  // direction sees legacy rows as PICKUP. Rows are still returned without the
  // field so the code's own fallback is exercised.
  const defaults = { stops: { direction: 'PICKUP' } };
  const field = (key, row, k) => (row[k] === undefined ? defaults[key]?.[k] : row[k]);

  const matches = (key, row, where = {}) => Object.entries(where).every(([k, v]) => {
    const value = field(key, row, k);
    if (v && typeof v === 'object') {
      if ('in' in v) return v.in.includes(value);
      if ('not' in v) return value !== v.not;
      return true;
    }
    return value === v;
  });
  const notFound = () => Object.assign(new Error('Record not found'), { code: 'P2025' });

  // Deliberately ignores orderBy: the code under test must produce the saved
  // sequence itself. Rows are kept in insertion order.
  const model = (key) => ({
    findMany: async (args = {}) => state[key].filter((r) => matches(key, r, args.where)).map(clone),
    findUnique: async (args = {}) => clone(state[key].find((r) => matches(key, r, args.where))),
    findFirst: async (args = {}) => clone(state[key].find((r) => matches(key, r, args.where))),
    count: async (args = {}) => state[key].filter((r) => matches(key, r, args.where)).length,
    create: async ({ data }) => {
      stats.writes += 1;
      const row = { id: `${key}-${nextId++}`, ...data };
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
    updateMany: async ({ where, data }) => {
      stats.writes += 1;
      const rows = state[key].filter((r) => matches(key, r, where));
      rows.forEach((r) => Object.assign(r, data));
      return { count: rows.length };
    },
    delete: async ({ where }) => {
      const i = state[key].findIndex((r) => r.id === where.id);
      if (i < 0) throw notFound();
      stats.writes += 1;
      return clone(state[key].splice(i, 1)[0]);
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
    nextId = 1;
  };
  return client;
}

jest.mock('../src/db', () => mockCreateFakePrisma());
jest.mock('../src/services/notificationService');

const request = require('supertest');
const jwt = require('jsonwebtoken');
const prisma = require('../src/db');
const app = require('../src/app');

const ADMIN = `Bearer ${jwt.sign({ id: 'a1', role: 'ADMIN' }, 'test-jwt-secret')}`;

// Legacy rows: written before Stop.direction existed, so no `direction` key.
const legacyStop = (id, busId, order, lat, lng) => ({ id, busId, order, lat, lng, name: `Stop ${id}` });

const seed = () => ({
  buses: [
    { id: 'b1', busNo: 'B-1', status: 'ACTIVE' },
    { id: 'b2', busNo: 'B-2', status: 'ON_TRIP' },
    { id: 'b3', busNo: 'B-3', status: 'ACTIVE' },
  ],
  drivers: [{ id: 'dr2', name: 'Mohan', phone: '9444444444', busId: 'b2' }],
  liveLocations: [{
    id: 'll1', busId: 'b2', lat: 26.91, lng: 75.81, speed: 22.5, timestamp: '2026-01-05T07:30:00.000Z',
  }],
  students: [
    { id: 's1', name: 'Kid 1', busId: 'b1', parentPhone: '9111111111', stopId: 'L2', dropStopId: null },
    { id: 's2', name: 'Kid 2', busId: 'b1', parentPhone: '9222222222', stopId: 'L1', dropStopId: null },
    { id: 's3', name: 'Kid 3', busId: 'b1', parentPhone: '9333333333', stopId: null, dropStopId: null },
  ],
  stops: [
    legacyStop('L2', 'b1', 2, 26.95, 75.85),
    legacyStop('L1', 'b1', 1, 27.1, 76.0),
    legacyStop('M1', 'b2', 1, 26.92, 75.82),
    { ...legacyStop('M2', 'b2', 1, 26.93, 75.83), direction: 'DROP' },
  ],
});

const ids = (list) => list.map((s) => s.id);
const stopIds = () => Object.fromEntries(prisma.__state.students.map((s) => [s.id, s.stopId]));
const getFull = (busId) => request(app).get(`/api/buses/${busId}/full`).set('Authorization', ADMIN);
const listStops = (busId, direction) => request(app)
  .get(`/api/stops/bus/${busId}${direction ? `?direction=${direction}` : ''}`)
  .set('Authorization', ADMIN);
const addStop = (body) => request(app).post('/api/stops').set('Authorization', ADMIN).send(body);
const reorder = (body) => request(app).put('/api/stops/reorder').set('Authorization', ADMIN).send(body);
const putStudent = (id, body) => request(app).put(`/api/students/${id}`).set('Authorization', ADMIN).send(body);

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterAll(() => jest.restoreAllMocks());
beforeEach(() => prisma.__reset(seed()));

describe('existing Student.stopId values stay the pickup stop', () => {
  test('legacy stops without a direction are PICKUP in the list, /full and student assignment', async () => {
    const plain = await listStops('b1');
    expect(plain.status).toBe(200);
    expect(ids(plain.body.stops)).toEqual(['L1', 'L2']);
    expect(ids((await listStops('b1', 'PICKUP')).body.stops)).toEqual(['L1', 'L2']);
    expect((await listStops('b1', 'DROP')).body.stops).toEqual([]);

    const full = await getFull('b1');
    expect(full.status).toBe(200);
    expect(ids(full.body.pickupStops)).toEqual(['L1', 'L2']);
    expect(full.body.pickupStops.map((s) => s.direction)).toEqual(['PICKUP', 'PICKUP']);
    expect(full.body.dropStops).toEqual([]);

    // A legacy stop is a valid pickup stop and not a valid drop stop.
    expect((await putStudent('s3', { dropStopId: 'L1' })).status).toBe(400);
    const ok = await putStudent('s3', { stopId: 'L1' });
    expect(ok.status).toBe(200);
    expect(stopIds()).toEqual({ s1: 'L2', s2: 'L1', s3: 'L1' });
  });

  test('creating, reordering, assigning and deleting DROP stops never changes any stopId', async () => {
    const before = stopIds();
    const legacyOrders = () => prisma.__state.stops.filter((s) => s.busId === 'b1' && !s.direction)
      .map((s) => [s.id, s.order]);
    const legacyBefore = legacyOrders();

    // Same coordinates as the legacy pickup stops, plus one more.
    const created = [];
    for (const [lat, lng] of [[26.95, 75.85], [27.1, 76.0], [27.3, 76.2]]) {
      const res = await addStop({ busId: 'b1', name: 'Drop', lat, lng, direction: 'DROP' });
      expect(res.status).toBe(201);
      expect(res.body.stop).toMatchObject({ direction: 'DROP' });
      created.push(res.body.stop.id);
    }
    expect((await listStops('b1', 'DROP')).body.stops.map((s) => s.order)).toEqual([1, 2, 3]);
    expect(stopIds()).toEqual(before);

    const [d1, d2, d3] = created;
    expect((await reorder({ busId: 'b1', direction: 'DROP', stopIds: [d3, d1, d2] })).status).toBe(200);
    expect(stopIds()).toEqual(before);

    expect((await putStudent('s1', { dropStopId: d1 })).status).toBe(200);
    expect(prisma.__state.students.find((s) => s.id === 's1')).toMatchObject({ stopId: 'L2', dropStopId: d1 });

    expect((await request(app).delete(`/api/stops/${d1}`).set('Authorization', ADMIN)).status).toBe(200);
    expect(prisma.__state.students.find((s) => s.id === 's1')).toMatchObject({ stopId: 'L2', dropStopId: null });
    expect(stopIds()).toEqual(before);

    expect(ids((await listStops('b1', 'DROP')).body.stops)).toEqual([d3, d2]);
    expect(ids((await listStops('b1')).body.stops)).toEqual(['L1', 'L2']);
    expect(legacyOrders()).toEqual(legacyBefore);
  });
});

describe('GET /api/buses/:busId/full response shape', () => {
  const TOP_KEYS = [
    'busId', 'busNo', 'driver', 'dropStops', 'liveLocation', 'pickupStops', 'status', 'stops', 'success', 'tripActive',
  ];
  const STOP_KEYS = ['direction', 'id', 'lat', 'lng', 'name', 'order'];
  const keys = (o) => Object.keys(o).sort();

  test('a bus on trip with a driver and a live location', async () => {
    const res = await getFull('b2');
    expect(res.status).toBe(200);
    expect(keys(res.body)).toEqual(TOP_KEYS);
    expect(res.body).toMatchObject({
      success: true, busId: 'b2', busNo: 'B-2', status: 'ON_TRIP', tripActive: true,
    });
    expect(res.body.driver).toEqual({ id: 'dr2', name: 'Mohan', phone: '9444444444' });
    expect(res.body.liveLocation).toEqual({
      lat: 26.91, lng: 75.81, speed: 22.5, timestamp: '2026-01-05T07:30:00.000Z',
    });
    expect(res.body.stops).toEqual(res.body.pickupStops);
    expect(res.body.pickupStops).toEqual([
      { id: 'M1', name: 'Stop M1', lat: 26.92, lng: 75.82, order: 1, direction: 'PICKUP' },
    ]);
    expect(res.body.dropStops).toEqual([
      { id: 'M2', name: 'Stop M2', lat: 26.93, lng: 75.83, order: 1, direction: 'DROP' },
    ]);
  });

  test('a bus with no driver and no location; every stop has exactly the stop keys', async () => {
    await addStop({ busId: 'b1', name: 'Gate', lat: 26.9, lng: 75.8, direction: 'DROP' });
    const res = await getFull('b1');
    expect(res.status).toBe(200);
    expect(keys(res.body)).toEqual(TOP_KEYS);
    expect(res.body).toMatchObject({
      success: true, busId: 'b1', busNo: 'B-1', status: 'ACTIVE', tripActive: false, driver: null, liveLocation: null,
    });
    expect(res.body.stops).toEqual(res.body.pickupStops);
    const all = [...res.body.stops, ...res.body.pickupStops, ...res.body.dropStops];
    expect(all).toHaveLength(5);
    all.forEach((s) => expect(keys(s)).toEqual(STOP_KEYS));
  });

  test('unknown bus is 404', async () => {
    expect((await getFull('nope')).status).toBe(404);
  });
});

describe('pickup and drop sequences over the same points are independent end to end', () => {
  // Like the school sheet sample: three physical stops, pickup order 1,2,3
  // and drop order 2,3,1 for the same locations.
  const points = { A: [26.97, 75.77], B: [26.99, 75.79], C: [27.01, 75.81] };

  test('each direction comes back in its own saved order from the list and /full', async () => {
    const pickupId = {};
    const dropId = {};
    for (const [label, [lat, lng]] of Object.entries(points)) {
      pickupId[label] = (await addStop({ busId: 'b3', name: `Point ${label}`, lat, lng, direction: 'PICKUP' })).body.stop.id;
    }
    for (const [label, [lat, lng]] of Object.entries(points)) {
      dropId[label] = (await addStop({ busId: 'b3', name: `Point ${label}`, lat, lng, direction: 'DROP' })).body.stop.id;
    }

    // Drop order: C=1, A=2, B=3 (stored rows stay in A, B, C insertion order).
    const res = await reorder({ busId: 'b3', direction: 'DROP', stopIds: [dropId.C, dropId.A, dropId.B] });
    expect(res.status).toBe(200);

    const pickupList = (await listStops('b3', 'PICKUP')).body.stops;
    const dropList = (await listStops('b3', 'DROP')).body.stops;
    expect(ids(pickupList)).toEqual([pickupId.A, pickupId.B, pickupId.C]);
    expect(ids(dropList)).toEqual([dropId.C, dropId.A, dropId.B]);

    const full = (await getFull('b3')).body;
    expect(ids(full.pickupStops)).toEqual(ids(pickupList));
    expect(ids(full.dropStops)).toEqual(ids(dropList));
    expect(full.stops).toEqual(full.pickupStops);

    // Per physical point: [pickup order, drop order].
    const orderAt = (list) => Object.fromEntries(list.map((s) => [s.name.slice(-1), s.order]));
    const pickupOrder = orderAt(full.pickupStops);
    const dropOrder = orderAt(full.dropStops);
    expect(Object.fromEntries(Object.keys(points).map((p) => [p, [pickupOrder[p], dropOrder[p]]])))
      .toEqual({ A: [1, 2], B: [2, 3], C: [3, 1] });

    // Same coordinates in both directions.
    full.dropStops.forEach((d) => {
      const p = full.pickupStops.find((s) => s.name === d.name);
      expect([d.lat, d.lng]).toEqual([p.lat, p.lng]);
    });
  });
});

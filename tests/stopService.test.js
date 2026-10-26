// Example tests for direction-aware stop APIs (task 4.4). Property tests are task 4.7.
// Prisma is an in-memory fake with rollback-on-throw transactions; no DB.
// Validates: Requirements 5.2, 5.3, 5.4, 5.5, 5.6
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/testdb';
process.env.JWT_SECRET = 'test-jwt-secret';

// In-memory Prisma fake covering what stopService and the per-bus access
// check use. Writes are counted, and writes made outside $transaction are
// counted separately so tests can assert reorder/delete are transactional.
function mockCreateFakePrisma() {
  const state = { stops: [], students: [], buses: [], drivers: [], users: [] };
  const stats = { writes: 0, writesOutsideTx: 0, transactions: 0 };
  const clone = (x) => (x ? { ...x } : null);

  const matches = (row, where = {}) => Object.entries(where).every(([k, v]) => {
    if (v && typeof v === 'object') {
      if ('in' in v) return v.in.includes(row[k]);
      if ('not' in v) return row[k] !== v.not;
      return true;
    }
    return row[k] === v;
  });

  const applyOrderBy = (rows, orderBy) => {
    const keys = (Array.isArray(orderBy) ? orderBy : orderBy ? [orderBy] : [])
      .map((o) => Object.entries(o)[0]);
    return [...rows].sort((a, b) => {
      for (const [k, dir] of keys) {
        if (a[k] < b[k]) return dir === 'desc' ? 1 : -1;
        if (a[k] > b[k]) return dir === 'desc' ? -1 : 1;
      }
      return 0;
    });
  };

  const notFound = () => Object.assign(new Error('Record not found'), { code: 'P2025' });

  const makeModel = (key, inTx) => {
    const write = () => {
      stats.writes += 1;
      if (!inTx()) stats.writesOutsideTx += 1;
    };
    return {
      findMany: async (args = {}) =>
        applyOrderBy(state[key].filter((r) => matches(r, args.where)), args.orderBy).map(clone),
      findUnique: async (args = {}) => clone(state[key].find((r) => matches(r, args.where))),
      findFirst: async (args = {}) =>
        clone(applyOrderBy(state[key].filter((r) => matches(r, args.where)), args.orderBy)[0]),
      count: async (args = {}) => state[key].filter((r) => matches(r, args.where)).length,
      create: async ({ data }) => {
        write();
        const row = { id: `${key}-${state[key].length + 1}-${Date.now()}`, ...data };
        state[key].push(row);
        return clone(row);
      },
      update: async ({ where, data }) => {
        const row = state[key].find((r) => r.id === where.id);
        if (!row) throw notFound();
        write();
        Object.assign(row, data);
        return clone(row);
      },
      updateMany: async ({ where, data }) => {
        write();
        const rows = state[key].filter((r) => matches(r, where));
        rows.forEach((r) => Object.assign(r, data));
        return { count: rows.length };
      },
      delete: async ({ where }) => {
        const i = state[key].findIndex((r) => r.id === where.id);
        if (i < 0) throw notFound();
        write();
        return clone(state[key].splice(i, 1)[0]);
      },
    };
  };

  const makeClient = (inTx) => ({
    stop: makeModel('stops', inTx),
    student: makeModel('students', inTx),
    bus: makeModel('buses', inTx),
    driver: makeModel('drivers', inTx),
    user: makeModel('users', inTx),
  });

  let txDepth = 0;
  const txClient = makeClient(() => true);
  const client = makeClient(() => txDepth > 0);

  client.$transaction = async (fn) => {
    stats.transactions += 1;
    const snapshot = JSON.parse(JSON.stringify(state));
    txDepth += 1;
    try {
      return await fn(txClient);
    } catch (err) {
      Object.keys(snapshot).forEach((k) => { state[k] = snapshot[k]; });
      throw err;
    } finally {
      txDepth -= 1;
    }
  };
  client.$queryRaw = async () => [];
  client.$disconnect = async () => {};

  client.__state = state;
  client.__stats = stats;
  client.__reset = (seed = {}) => {
    Object.keys(state).forEach((k) => { state[k] = (seed[k] || []).map(clone); });
    Object.assign(stats, { writes: 0, writesOutsideTx: 0, transactions: 0 });
  };
  return client;
}

jest.mock('../src/db', () => mockCreateFakePrisma());

const request = require('supertest');
const jwt = require('jsonwebtoken');
const prisma = require('../src/db');
const {
  createStopService, parseDirection, validateReorder, renumber, sortBySavedOrder,
} = require('../src/services/stopService');
const app = require('../src/app');

const sign = (payload) => `Bearer ${jwt.sign(payload, 'test-jwt-secret')}`;
const ADMIN = sign({ id: 'a1', role: 'ADMIN' });
const PARENT = sign({ id: 'u-parent', role: 'PARENT', phone: '9111111111' });
const DRIVER = sign({ id: 'u-driver', role: 'DRIVER', phone: '9333333333' });

// Bus b1 has PICKUP and DROP sequences whose geography disagrees with the
// saved order: pickup order 1 is the stop farthest from the school, and the
// rows are inserted out of order. Bus b2 has its own PICKUP stops.
const stop = (id, busId, direction, order, lat, lng) => ({
  id, busId, direction, order, lat, lng, name: id, needsLocation: false,
});
const seed = () => ({
  buses: [{ id: 'b1', busNo: 'B-1', status: 'ACTIVE' }, { id: 'b2', busNo: 'B-2', status: 'ACTIVE' }],
  users: [
    { id: 'u-parent', phone: '9111111111', role: 'PARENT' },
    { id: 'u-driver', phone: '9333333333', role: 'DRIVER' },
  ],
  drivers: [{ id: 'dr1', name: 'Ravi', phone: '9333333333', busId: 'b1' }],
  students: [
    { id: 's1', name: 'Kid 1', busId: 'b1', parentPhone: '9111111111', stopId: 'p2', dropStopId: 'd1' },
    { id: 's2', name: 'Kid 2', busId: 'b1', parentPhone: '9222222222', stopId: 'p3', dropStopId: 'd2' },
  ],
  stops: [
    stop('p3', 'b1', 'PICKUP', 3, 26.901, 75.801), // nearest the school, last
    stop('p1', 'b1', 'PICKUP', 1, 27.5, 76.5), // farthest, first
    stop('d2', 'b1', 'DROP', 2, 27.5, 76.5),
    stop('p2', 'b1', 'PICKUP', 2, 26.0, 74.0), // opposite side of the school
    stop('d1', 'b1', 'DROP', 1, 26.901, 75.801),
    stop('d3', 'b1', 'DROP', 3, 26.0, 74.0),
    stop('x1', 'b2', 'PICKUP', 1, 26.9, 75.8),
    stop('x2', 'b2', 'PICKUP', 2, 26.95, 75.85),
  ],
});

const ids = (rows) => rows.map((s) => s.id);
const ordersOf = (busId, direction) => Object.fromEntries(prisma.__state.stops
  .filter((s) => s.busId === busId && s.direction === direction)
  .map((s) => [s.id, s.order]));
const allOrders = () => Object.fromEntries(prisma.__state.stops.map((s) => [s.id, s.order]));

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterAll(() => jest.restoreAllMocks());
beforeEach(() => prisma.__reset(seed()));

describe('pure helpers', () => {
  test('parseDirection is case-insensitive, defaults to PICKUP, rejects anything else with 400', () => {
    expect(parseDirection(undefined)).toBe('PICKUP');
    expect(parseDirection(null)).toBe('PICKUP');
    expect(parseDirection('')).toBe('PICKUP');
    expect(parseDirection('drop')).toBe('DROP');
    expect(parseDirection(' Pickup ')).toBe('PICKUP');
    for (const bad of ['UP', 'pick-up', 'DROPS', ['DROP', 'PICKUP'], 1, {}]) {
      expect(() => parseDirection(bad)).toThrow(expect.objectContaining({ status: 400 }));
    }
  });

  test('sortBySavedOrder uses order then id, never coordinates', () => {
    const rows = [
      { id: 'b', order: 2, lat: 0, lng: 0 },
      { id: 'c', order: 1, lat: 90, lng: 90 },
      { id: 'a', order: 2, lat: -90, lng: -90 },
    ];
    expect(ids(sortBySavedOrder(rows))).toEqual(['c', 'a', 'b']);
  });

  test('validateReorder reports missing, duplicate and foreign ids', () => {
    expect(validateReorder(['a', 'b'], ['b', 'a']).ok).toBe(true);
    expect(validateReorder(['a', 'b'], ['a'])).toMatchObject({ ok: false, missing: ['b'] });
    expect(validateReorder(['a', 'b'], ['a', 'b', 'a'])).toMatchObject({ ok: false, duplicates: ['a'] });
    expect(validateReorder(['a', 'b'], ['a', 'b', 'z'])).toMatchObject({ ok: false, foreign: ['z'] });
  });

  test('renumber returns only the stops whose order changes', () => {
    expect(renumber([{ id: 'a', order: 1 }, { id: 'b', order: 3 }, { id: 'c', order: 7 }]))
      .toEqual([{ id: 'b', order: 2 }, { id: 'c', order: 3 }]);
  });
});

describe('listing keeps saved order per bus and direction', () => {
  test('service returns saved order even when geography suggests another order', async () => {
    const svc = createStopService(prisma);
    expect(ids(await svc.listStops({ busId: 'b1', direction: 'PICKUP' }))).toEqual(['p1', 'p2', 'p3']);
    expect(ids(await svc.listStops({ busId: 'b1', direction: 'DROP' }))).toEqual(['d1', 'd2', 'd3']);
    expect(ids(await svc.listStops({ busId: 'b1' }))).toEqual(['p1', 'p2', 'p3']);
    expect(ids(await svc.listStops({ busId: 'b2', direction: 'DROP' }))).toEqual([]);
  });

  test('GET /api/stops/bus/:busId and legacy /api/stops/:busId honour ?direction=', async () => {
    const drop = await request(app).get('/api/stops/bus/b1?direction=drop').set('Authorization', PARENT);
    expect(drop.status).toBe(200);
    expect(drop.body).toMatchObject({ success: true, direction: 'DROP' });
    expect(ids(drop.body.stops)).toEqual(['d1', 'd2', 'd3']);

    const legacy = await request(app).get('/api/stops/b1').set('Authorization', DRIVER);
    expect(legacy.status).toBe(200);
    expect(ids(legacy.body.stops)).toEqual(['p1', 'p2', 'p3']);

    const legacyDrop = await request(app).get('/api/stops/b1?direction=DROP').set('Authorization', ADMIN);
    expect(ids(legacyDrop.body.stops)).toEqual(['d1', 'd2', 'd3']);
  });

  test('invalid direction is 400 on every endpoint and writes nothing', async () => {
    const before = allOrders();
    const responses = [
      await request(app).get('/api/stops/bus/b1?direction=sideways').set('Authorization', ADMIN),
      await request(app).get('/api/stops/b1?direction=both').set('Authorization', ADMIN),
      await request(app).get('/api/stops/b1?direction=DROP&direction=PICKUP').set('Authorization', ADMIN),
      await request(app).post('/api/stops').set('Authorization', ADMIN)
        .send({ busId: 'b1', name: 'N', lat: 1, lng: 2, direction: 'RETURN' }),
      await request(app).put('/api/stops/reorder').set('Authorization', ADMIN)
        .send({ busId: 'b1', direction: 'x', stopIds: ['p1', 'p2', 'p3'] }),
    ];
    responses.forEach((r) => expect(r.status).toBe(400));
    expect(prisma.__stats.writes).toBe(0);
    expect(allOrders()).toEqual(before);
  });

  test('per-bus listing still enforces bus access', async () => {
    expect((await request(app).get('/api/stops/bus/b1')).status).toBe(401);
    expect((await request(app).get('/api/stops/bus/b2').set('Authorization', PARENT)).status).toBe(403);
    expect((await request(app).get('/api/stops/bus/b2').set('Authorization', DRIVER)).status).toBe(403);
  });

  test('GET /api/stops (admin list) returns every stop with its direction', async () => {
    const res = await request(app).get('/api/stops').set('Authorization', ADMIN);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.stops).toHaveLength(8);
    expect(res.body.stops.every((s) => ['PICKUP', 'DROP'].includes(s.direction))).toBe(true);
    // Grouped by bus, then direction, each group in saved order.
    expect(ids(res.body.stops)).toEqual(['d1', 'd2', 'd3', 'p1', 'p2', 'p3', 'x1', 'x2']);
  });
});

describe('create appends to its own direction', () => {
  test('order = max(order) of that bus+direction + 1; direction defaults to PICKUP', async () => {
    // A gap in DROP orders: max is what counts, not the count.
    prisma.__state.stops.find((s) => s.id === 'd3').order = 7;

    const drop = await request(app).post('/api/stops').set('Authorization', ADMIN)
      .send({ busId: 'b1', name: 'Gate', lat: 26.9, lng: 75.8, direction: 'drop' });
    expect(drop.status).toBe(201);
    expect(drop.body.stop).toMatchObject({ busId: 'b1', direction: 'DROP', order: 8 });

    const pickup = await request(app).post('/api/stops').set('Authorization', ADMIN)
      .send({ busId: 'b1', name: 'Market', lat: 26.9, lng: 75.8 });
    expect(pickup.status).toBe(201);
    expect(pickup.body.stop).toMatchObject({ direction: 'PICKUP', order: 4 });

    const empty = await request(app).post('/api/stops').set('Authorization', ADMIN)
      .send({ busId: 'b2', name: 'First drop', lat: 26.9, lng: 75.8, direction: 'DROP' });
    expect(empty.body.stop).toMatchObject({ busId: 'b2', direction: 'DROP', order: 1 });
  });

  test('unknown bus is 404 and missing fields are 400', async () => {
    expect((await request(app).post('/api/stops').set('Authorization', ADMIN)
      .send({ busId: 'nope', name: 'N', lat: 1, lng: 2 })).status).toBe(404);
    expect((await request(app).post('/api/stops').set('Authorization', ADMIN)
      .send({ busId: 'b1', name: 'N' })).status).toBe(400);
    expect(prisma.__stats.writes).toBe(0);
  });
});

describe('reorder is scoped, validated and transactional', () => {
  test.each(['put', 'patch'])('%s /api/stops/reorder sets order = index + 1 for one direction only', async (verb) => {
    const otherDirection = ordersOf('b1', 'DROP');
    const otherBus = ordersOf('b2', 'PICKUP');

    const res = await request(app)[verb]('/api/stops/reorder').set('Authorization', ADMIN)
      .send({ busId: 'b1', direction: 'PICKUP', stopIds: ['p3', 'p1', 'p2'] });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(ids(res.body.stops)).toEqual(['p3', 'p1', 'p2']);
    expect(ordersOf('b1', 'PICKUP')).toEqual({ p3: 1, p1: 2, p2: 3 });
    expect(ordersOf('b1', 'DROP')).toEqual(otherDirection);
    expect(ordersOf('b2', 'PICKUP')).toEqual(otherBus);
    expect(prisma.__stats.transactions).toBe(1);
    expect(prisma.__stats.writesOutsideTx).toBe(0);
  });

  test('legacy PATCH body without direction reorders the PICKUP sequence', async () => {
    const res = await request(app).patch('/api/stops/reorder').set('Authorization', ADMIN)
      .send({ busId: 'b1', stopIds: ['p2', 'p3', 'p1'] });
    expect(res.status).toBe(200);
    expect(ordersOf('b1', 'PICKUP')).toEqual({ p2: 1, p3: 2, p1: 3 });
  });

  test('DROP reorder leaves PICKUP untouched', async () => {
    const pickup = ordersOf('b1', 'PICKUP');
    const res = await request(app).put('/api/stops/reorder').set('Authorization', ADMIN)
      .send({ busId: 'b1', direction: 'drop', stopIds: ['d3', 'd2', 'd1'] });
    expect(res.status).toBe(200);
    expect(ordersOf('b1', 'DROP')).toEqual({ d3: 1, d2: 2, d1: 3 });
    expect(ordersOf('b1', 'PICKUP')).toEqual(pickup);
  });

  const badBodies = [
    ['a missing id', { stopIds: ['p1', 'p2'] }],
    ['a duplicated id', { stopIds: ['p1', 'p2', 'p3', 'p1'] }],
    ['a duplicate replacing an id', { stopIds: ['p1', 'p1', 'p3'] }],
    ['an id from the other direction', { stopIds: ['p1', 'p2', 'p3', 'd1'] }],
    ['an id swapped for the other direction', { stopIds: ['p1', 'p2', 'd1'] }],
    ['an id from another bus', { stopIds: ['p1', 'p2', 'x1'] }],
    ['an unknown id', { stopIds: ['p1', 'p2', 'zzz'] }],
    ['a non-string id', { stopIds: ['p1', 'p2', 3] }],
    ['stopIds that is not an array', { stopIds: 'p1,p2,p3' }],
    ['no busId', { busId: undefined, stopIds: ['p1', 'p2', 'p3'] }],
  ];
  test.each(badBodies)('%s -> 400 and no order changes', async (_label, patch) => {
    const before = allOrders();
    const res = await request(app).put('/api/stops/reorder').set('Authorization', ADMIN)
      .send({ busId: 'b1', direction: 'PICKUP', ...patch });
    expect(res.status).toBe(400);
    expect(allOrders()).toEqual(before);
    expect(prisma.__stats.writes).toBe(0);
  });

  test('the 400 names the offending ids', async () => {
    const res = await request(app).put('/api/stops/reorder').set('Authorization', ADMIN)
      .send({ busId: 'b1', direction: 'PICKUP', stopIds: ['p1', 'p1', 'd1'] });
    expect(res.status).toBe(400);
    expect(res.body.details).toEqual({ missing: ['p2', 'p3'], duplicates: ['p1'], foreign: ['d1'] });
  });
});

describe('delete renumbers within the same bus and direction', () => {
  test('deleting a PICKUP stop renumbers PICKUP 1..N and clears Student.stopId only', async () => {
    const drop = ordersOf('b1', 'DROP');
    const otherBus = ordersOf('b2', 'PICKUP');

    const res = await request(app).delete('/api/stops/p2').set('Authorization', ADMIN);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });

    expect(ordersOf('b1', 'PICKUP')).toEqual({ p1: 1, p3: 2 });
    expect(ordersOf('b1', 'DROP')).toEqual(drop);
    expect(ordersOf('b2', 'PICKUP')).toEqual(otherBus);
    const s1 = prisma.__state.students.find((s) => s.id === 's1');
    expect(s1).toMatchObject({ stopId: null, dropStopId: 'd1' });
    expect(prisma.__state.students.find((s) => s.id === 's2').stopId).toBe('p3');
    expect(prisma.__stats.transactions).toBe(1);
    expect(prisma.__stats.writesOutsideTx).toBe(0);
  });

  test('deleting a DROP stop renumbers DROP only and clears Student.dropStopId only', async () => {
    const pickup = ordersOf('b1', 'PICKUP');
    const res = await request(app).delete('/api/stops/d1').set('Authorization', ADMIN);
    expect(res.status).toBe(200);
    expect(ordersOf('b1', 'DROP')).toEqual({ d2: 1, d3: 2 });
    expect(ordersOf('b1', 'PICKUP')).toEqual(pickup);
    expect(prisma.__state.students.find((s) => s.id === 's1')).toMatchObject({ stopId: 'p2', dropStopId: null });
  });

  test('relative order is preserved when existing orders have gaps and ties', async () => {
    const svc = createStopService(prisma);
    prisma.__reset({
      ...seed(),
      stops: [
        stop('a', 'b1', 'PICKUP', 2, 0, 0),
        stop('c', 'b1', 'PICKUP', 9, 0, 0),
        stop('b', 'b1', 'PICKUP', 5, 0, 0),
        stop('d', 'b1', 'PICKUP', 9, 0, 0),
        stop('gone', 'b1', 'PICKUP', 4, 0, 0),
      ],
    });
    await svc.deleteStop('gone');
    expect(ids(await svc.listStops({ busId: 'b1' }))).toEqual(['a', 'b', 'c', 'd']);
    expect(ordersOf('b1', 'PICKUP')).toEqual({ a: 1, b: 2, c: 3, d: 4 });
  });

  test('unknown stop is 404 and nothing changes', async () => {
    const before = allOrders();
    const res = await request(app).delete('/api/stops/nope').set('Authorization', ADMIN);
    expect(res.status).toBe(404);
    expect(allOrders()).toEqual(before);
    expect(prisma.__stats.writes).toBe(0);
  });
});

describe('mutations stay ADMIN-only', () => {
  const mutations = [
    ['post', '/api/stops', { busId: 'b1', name: 'N', lat: 1, lng: 2 }],
    ['put', '/api/stops/reorder', { busId: 'b1', direction: 'PICKUP', stopIds: ['p3', 'p2', 'p1'] }],
    ['patch', '/api/stops/reorder', { busId: 'b1', stopIds: ['p3', 'p2', 'p1'] }],
    ['delete', '/api/stops/p1', undefined],
    ['get', '/api/stops', undefined],
  ];
  test.each(mutations)('%s %s: 401 without token, 403 for PARENT and DRIVER, no writes', async (verb, path, body) => {
    const before = allOrders();
    const call = (auth) => {
      let r = request(app)[verb](path);
      if (auth) r = r.set('Authorization', auth);
      return body === undefined ? r : r.send(body);
    };
    expect((await call(null)).status).toBe(401);
    expect((await call(PARENT)).status).toBe(403);
    expect((await call(DRIVER)).status).toBe(403);
    expect(prisma.__stats.writes).toBe(0);
    expect(allOrders()).toEqual(before);
  });
});

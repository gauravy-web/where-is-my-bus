// Trip scenario tests (task 5.4): plan scenarios 1, 2, 3 and 9, resume after
// a restart, and the trip:state / tripStarted / tripEnded emissions.
// Supertest drives backend/src/app.js. Prisma is an in-memory fake whose
// tables live in `mockShared`, so a second app instance (jest.isolateModules)
// reads the same "database". Socket.IO is a fake that records emits.
// Validates: Requirements 6.3, 6.8, 6.9, 6.10
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/testdb';
process.env.JWT_SECRET = 'test-jwt-secret';

// Shared "database" for every fake Prisma instance (outer and isolated).
const mockShared = { state: {}, seq: 0 };

// Builds a fake Prisma client over mockShared.state. Models are created on
// first access, so any model the code under test touches gets a table.
function mockMakePrisma() {
  const shared = mockShared;
  const clone = (x) => (x ? { ...x } : null);
  // Prisma model name -> state key (prisma.bus -> state.buses, ...).
  const plural = { bus: 'buses' };
  const table = (modelName) => {
    const key = plural[modelName] || `${modelName}s`;
    if (!shared.state[key]) shared.state[key] = [];
    return shared.state[key];
  };
  const cmp = (a, b) => {
    const x = a instanceof Date ? a.getTime() : a;
    const y = b instanceof Date ? b.getTime() : b;
    if (x < y) return -1;
    if (x > y) return 1;
    return 0;
  };
  const matches = (row, where = {}) => Object.entries(where || {}).every(([k, v]) => {
    if (k === 'OR') return v.some((w) => matches(row, w));
    if (k === 'AND') return (Array.isArray(v) ? v : [v]).every((w) => matches(row, w));
    if (k === 'NOT') return !matches(row, v);
    if (v && typeof v === 'object' && !(v instanceof Date)) {
      if ('in' in v && !v.in.includes(row[k])) return false;
      if ('notIn' in v && v.notIn.includes(row[k])) return false;
      if ('not' in v && row[k] === v.not) return false;
      if ('equals' in v && row[k] !== v.equals) return false;
      if ('gt' in v && !(cmp(row[k], v.gt) > 0)) return false;
      if ('gte' in v && !(cmp(row[k], v.gte) >= 0)) return false;
      if ('lt' in v && !(cmp(row[k], v.lt) < 0)) return false;
      if ('lte' in v && !(cmp(row[k], v.lte) <= 0)) return false;
      return true;
    }
    return (row[k] === undefined ? null : row[k]) === v;
  });
  const applyOrderBy = (rows, orderBy) => {
    const ks = (Array.isArray(orderBy) ? orderBy : orderBy ? [orderBy] : []).map((o) => Object.entries(o)[0]);
    return [...rows].sort((a, b) => {
      for (const [k, dir] of ks) {
        const c = cmp(a[k], b[k]);
        if (c !== 0) return dir === 'desc' ? -c : c;
      }
      return 0;
    });
  };
  const notFound = () => Object.assign(new Error('Record not found'), { code: 'P2025' });
  const model = (key) => ({
    findMany: jest.fn(async (args = {}) => {
      let rows = applyOrderBy(table(key).filter((r) => matches(r, args.where)), args.orderBy);
      if (Number.isInteger(args.skip)) rows = rows.slice(args.skip);
      if (Number.isInteger(args.take)) rows = rows.slice(0, args.take);
      return rows.map(clone);
    }),
    findUnique: jest.fn(async (args = {}) => clone(table(key).find((r) => matches(r, args.where)))),
    findFirst: jest.fn(async (args = {}) =>
      clone(applyOrderBy(table(key).filter((r) => matches(r, args.where)), args.orderBy)[0])),
    count: jest.fn(async (args = {}) => table(key).filter((r) => matches(r, args.where)).length),
    create: jest.fn(async ({ data }) => {
      shared.seq += 1;
      const row = { id: `${key}-${String(shared.seq).padStart(4, '0')}`, ...data };
      table(key).push(row);
      return clone(row);
    }),
    createMany: jest.fn(async ({ data }) => {
      (Array.isArray(data) ? data : [data]).forEach((d) => {
        shared.seq += 1;
        table(key).push({ id: `${key}-${String(shared.seq).padStart(4, '0')}`, ...d });
      });
      return { count: Array.isArray(data) ? data.length : 1 };
    }),
    update: jest.fn(async ({ where, data }) => {
      const row = table(key).find((r) => matches(r, where));
      if (!row) throw notFound();
      Object.assign(row, data);
      return clone(row);
    }),
    updateMany: jest.fn(async ({ where, data }) => {
      const rows = table(key).filter((r) => matches(r, where));
      rows.forEach((r) => Object.assign(r, data));
      return { count: rows.length };
    }),
    upsert: jest.fn(async ({ where, create, update }) => {
      const row = table(key).find((r) => matches(r, where));
      if (row) { Object.assign(row, update); return clone(row); }
      shared.seq += 1;
      const created = { id: `${key}-${String(shared.seq).padStart(4, '0')}`, ...create };
      table(key).push(created);
      return clone(created);
    }),
    delete: jest.fn(async ({ where }) => {
      const rows = table(key);
      const i = rows.findIndex((r) => matches(r, where));
      if (i < 0) throw notFound();
      return clone(rows.splice(i, 1)[0]);
    }),
    deleteMany: jest.fn(async ({ where } = {}) => {
      const rows = table(key);
      const keep = rows.filter((r) => !matches(r, where));
      const count = rows.length - keep.length;
      rows.splice(0, rows.length, ...keep);
      return { count };
    }),
  });

  const base = { $disconnect: jest.fn(), $connect: jest.fn() };
  const client = new Proxy(base, {
    get(target, prop) {
      if (prop in target) return target[prop];
      if (typeof prop !== 'string' || prop === 'then' || prop.startsWith('$') || prop.startsWith('_')) {
        return undefined;
      }
      target[prop] = model(prop);
      return target[prop];
    },
  });
  // Interactive transactions roll the whole state back on a throw.
  base.$transaction = async (arg) => {
    if (Array.isArray(arg)) return Promise.all(arg);
    const snapshot = Object.fromEntries(Object.entries(shared.state).map(([k, rows]) => [k, rows.map((r) => ({ ...r }))]));
    try {
      return await arg(client);
    } catch (err) {
      Object.keys(shared.state).forEach((k) => { shared.state[k] = snapshot[k] || []; });
      throw err;
    }
  };
  return client;
}

jest.mock('../src/db', () => mockMakePrisma());

jest.mock('../src/services/notificationService', () => ({
  sendNotification: jest.fn(async () => undefined),
  sendMulticast: jest.fn(async () => undefined),
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const tripService = require('../src/services/tripService');

const sign = (payload) => `Bearer ${jwt.sign(payload, 'test-jwt-secret')}`;
const T = {
  ADMIN: sign({ id: 'a1', role: 'ADMIN' }),
  DRIVER: sign({ id: 'u-driver', role: 'DRIVER', phone: '9333333333' }), // bus b1
  CONDUCTOR: sign({ id: 'u-conductor', role: 'CONDUCTOR', phone: '9555555555' }), // bus b1
};

const SCHOOL = { id: 'sch-1', name: 'Krishna Public School', lat: 21.24007759960864, lng: 81.32025012026357, contactPhone: null };

// The school sample: 3 students on one bus, pickup orders 1,2,3 (Rahul,
// Priya, Amit) and drop orders 2,3,1 (so drop runs Amit, Rahul, Priya).
// Neither geography (distance from the school) nor id order matches the
// saved order, and rows are stored shuffled.
const SEED = {
  buses: [{ id: 'b1', busNo: 'RJ 37 PJ 5689', status: 'ACTIVE' }],
  drivers: [{ id: 'dr1', name: 'kalu', phone: '+91 93333 33333', busId: 'b1' }],
  conductors: [{ id: 'c1', name: 'Rohan', phone: '9555555555', busId: 'b1' }],
  schools: [SCHOOL],
  students: [
    { id: 'st-rahul', name: 'Rahul', busId: 'b1', parentPhone: '9876543210', parentPhone2: null, stopId: 'p-rahul', dropStopId: 'd-rahul' },
    { id: 'st-priya', name: 'Priya', busId: 'b1', parentPhone: '9876543211', parentPhone2: '9876543212', stopId: 'p-priya', dropStopId: 'd-priya' },
    { id: 'st-amit', name: 'Amit', busId: 'b1', parentPhone: '9876543213', parentPhone2: null, stopId: 'p-amit', dropStopId: 'd-amit' },
  ],
  stops: [
    { id: 'p-amit', busId: 'b1', direction: 'PICKUP', order: 3, name: 'Amit – pickup', lat: 21.27, lng: 81.36, studentId: 'st-amit' },
    { id: 'd-priya', busId: 'b1', direction: 'DROP', order: 3, name: 'Priya – drop', lat: 21.26, lng: 81.35, studentId: 'st-priya' },
    { id: 'p-rahul', busId: 'b1', direction: 'PICKUP', order: 1, name: 'Rahul – pickup', lat: 21.30, lng: 81.40, studentId: 'st-rahul' },
    { id: 'd-amit', busId: 'b1', direction: 'DROP', order: 1, name: 'Amit – drop', lat: 21.29, lng: 81.39, studentId: 'st-amit' },
    { id: 'p-priya', busId: 'b1', direction: 'PICKUP', order: 2, name: 'Priya – pickup', lat: 21.241, lng: 81.321, studentId: 'st-priya' },
    { id: 'd-rahul', busId: 'b1', direction: 'DROP', order: 2, name: 'Rahul – drop', lat: 21.245, lng: 81.325, studentId: 'st-rahul' },
  ],
};
const PICKUP_ORDER = ['p-rahul', 'p-priya', 'p-amit'];
const DROP_ORDER = ['d-amit', 'd-rahul', 'd-priya'];

function resetDb() {
  mockShared.seq = 0;
  Object.keys(mockShared.state).forEach((k) => { delete mockShared.state[k]; });
  Object.entries(SEED).forEach(([k, rows]) => { mockShared.state[k] = rows.map((r) => ({ ...r })); });
}
const db = () => mockShared.state;
const deepCopy = (x) => JSON.parse(JSON.stringify(x));

// Fake Socket.IO recording every emit.
let emits = [];
const fakeIo = {
  to: (room) => ({ emit: (event, payload) => { emits.push({ room, event, payload: deepCopy(payload) }); } }),
};
const emitted = (event, room) => emits.filter((e) => e.event === event && (!room || e.room === room));
const takeEmits = () => { const out = emits; emits = []; return out; };

// Exactly one trip:state to bus_b1 and one to admins (and nothing else unless
// `others` lists it). Returns the bus-room payload.
function expectStateBroadcast(events, others = []) {
  const states = events.filter((e) => e.event === 'trip:state');
  expect(states.map((e) => e.room).sort()).toEqual(['admins', 'bus_b1']);
  expect(events.every((e) => ['admins', 'bus_b1'].includes(e.room))).toBe(true);
  expect(events.filter((e) => e.event !== 'trip:state').map((e) => e.event).sort())
    .toEqual(others.flatMap((name) => [name, name]).sort());
  const [bus, admins] = ['bus_b1', 'admins'].map((room) => states.find((e) => e.room === room).payload);
  expect(admins.trip).toEqual(bus.trip);
  expect(admins.currentStop).toEqual(bus.currentStop);
  expect(admins.destination).toEqual(bus.destination);
  return bus;
}

const client = (theApp) => ({
  post: (path, token, body) => request(theApp).post(path).set('Authorization', token).send(body || {}),
  put: (path, token, body) => request(theApp).put(path).set('Authorization', token).send(body || {}),
  get: (path, token) => request(theApp).get(path).set('Authorization', token),
});
const api = client(app);

const distance = (a, b) => Math.hypot(a.lat - b.lat, a.lng - b.lng);
const statuses = (trip) => trip.stops.map((s) => s.status);
const stopIds = (trip) => trip.stops.map((s) => s.stopId);

async function start(direction, theApi = api) {
  const res = await theApi.post('/api/trips/start', T.DRIVER, { direction });
  expect(res.status).toBe(201);
  expect(res.body.resumed).toBe(false);
  return res.body;
}

const progress = (trip, tripStopId, action, theApi = api) =>
  theApi.post(`/api/trips/${trip.id}/stops/${tripStopId}/${action}`, T.DRIVER);

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

beforeEach(() => {
  resetDb();
  emits = [];
  app.set('io', fakeIo);
});

describe('Scenario 1: morning PICKUP follows the configured sequence', () => {
  test('geography suggests another order, but stops are served 1,2,3 and the school comes last', async () => {
    // Precondition: nearest-to-school first would be Priya, Amit, Rahul.
    const byDistance = db().stops.filter((s) => s.direction === 'PICKUP')
      .sort((a, b) => distance(a, SCHOOL) - distance(b, SCHOOL)).map((s) => s.id);
    expect(byDistance).not.toEqual(PICKUP_ORDER);

    const started = await start('PICKUP');
    const { trip } = started;
    expect(trip).toMatchObject({ busId: 'b1', direction: 'PICKUP', status: 'ACTIVE', destName: SCHOOL.name });
    expect(stopIds(trip)).toEqual(PICKUP_ORDER);
    expect(trip.stops.map((s) => s.order)).toEqual([1, 2, 3]);
    expect(statuses(trip)).toEqual(['PENDING', 'PENDING', 'PENDING']);
    expect(expectStateBroadcast(takeEmits(), ['tripStarted']).currentStop.stopId).toBe('p-rahul');

    const seen = [started.currentStop.stopId];
    let last = started;
    for (let i = 0; i < PICKUP_ORDER.length; i += 1) {
      expect(last.destination).toMatchObject({ kind: 'STOP', stopId: PICKUP_ORDER[i] });
      const res = await progress(trip, last.currentStop.id, 'complete');
      expect(res.status).toBe(200);
      const event = expectStateBroadcast(takeEmits());
      expect(event.currentStop).toEqual(res.body.currentStop);
      expect(event.destination).toEqual(res.body.destination);
      last = res.body;
      if (last.currentStop) seen.push(last.currentStop.stopId);
    }
    expect(seen).toEqual(PICKUP_ORDER);
    expect(statuses(last.trip)).toEqual(['COMPLETED', 'COMPLETED', 'COMPLETED']);

    // Every student stop is done: the school is the remaining destination
    // until the driver ends the trip (6.11).
    const school = { kind: 'SCHOOL', name: SCHOOL.name, lat: SCHOOL.lat, lng: SCHOOL.lng };
    expect(last.currentStop).toBeNull();
    expect(last.destination).toEqual(school);
    const current = await api.get('/api/trips/current', T.DRIVER);
    expect(current.status).toBe(200);
    expect(current.body).toMatchObject({ trip: { id: trip.id, status: 'ACTIVE' }, currentStop: null, destination: school });
    expect(tripService.routeWaypoints(current.body.trip)).toEqual([school]);
    expect(takeEmits()).toHaveLength(0);

    const ended = await api.post(`/api/trips/${trip.id}/end`, T.DRIVER);
    expect(ended.status).toBe(200);
    expect(ended.body.trip.status).toBe('COMPLETED');
    expect(statuses(ended.body.trip)).toEqual(['COMPLETED', 'COMPLETED', 'COMPLETED']);
    expectStateBroadcast(takeEmits(), ['tripEnded']);
    expect((await api.get('/api/trips/current', T.DRIVER)).body).toMatchObject({ trip: null, destination: null });
  });

  test('after the trip ends the school is no longer reported as the remaining destination', async () => {
    const { trip } = await start('PICKUP');
    for (const ts of trip.stops) expect((await progress(trip, ts.id, 'complete')).status).toBe(200);
    takeEmits();
    const ended = await api.post(`/api/trips/${trip.id}/end`, T.DRIVER);
    expect(ended.status).toBe(200);
    // 6.11: the school is shown "until the driver ends the trip".
    expect(ended.body.destination).toBeNull();
    expect(expectStateBroadcast(takeEmits(), ['tripEnded']).destination).toBeNull();
  });
});

describe('Scenario 2: return DROP follows its own configured sequence', () => {
  test('drop orders 2,3,1 run Amit, Rahul, Priya with no school leg', async () => {
    const byDistance = db().stops.filter((s) => s.direction === 'DROP')
      .sort((a, b) => distance(a, SCHOOL) - distance(b, SCHOOL)).map((s) => s.id);
    expect(byDistance).not.toEqual(DROP_ORDER);

    const started = await start('DROP');
    const { trip } = started;
    expect(trip).toMatchObject({ direction: 'DROP', status: 'ACTIVE' });
    expect(started.missingDropStop).toEqual([]);
    expect(stopIds(trip)).toEqual(DROP_ORDER);
    expect(trip.stops.map((s) => s.name)).toEqual(['Amit – drop', 'Rahul – drop', 'Priya – drop']);
    expect(trip.stops.some((s) => s.stopId.startsWith('p-'))).toBe(false);
    expect(tripService.routeWaypoints(trip).map((w) => w.kind)).toEqual(['STOP', 'STOP', 'STOP']);
    expect(expectStateBroadcast(takeEmits(), ['tripStarted']).destination).toMatchObject({ kind: 'STOP', stopId: 'd-amit' });

    const seen = [started.currentStop.stopId];
    let last = started;
    for (let i = 0; i < DROP_ORDER.length; i += 1) {
      expect(last.destination).toMatchObject({ kind: 'STOP', stopId: DROP_ORDER[i] });
      const res = await progress(trip, last.currentStop.id, 'complete');
      expect(res.status).toBe(200);
      expectStateBroadcast(takeEmits());
      last = res.body;
      if (last.currentStop) seen.push(last.currentStop.stopId);
    }
    expect(seen).toEqual(DROP_ORDER);
    expect(last.currentStop).toBeNull();
    expect(last.destination).toBeNull();
    expect(tripService.routeWaypoints(last.trip)).toEqual([]);

    expect((await api.post(`/api/trips/${trip.id}/end`, T.DRIVER)).status).toBe(200);
    takeEmits();

    // The pickup sequence is untouched by the drop trip.
    const pickup = await start('PICKUP');
    expect(stopIds(pickup.trip)).toEqual(PICKUP_ORDER);
  });
});

describe('Scenario 3: a running trip is never reordered', () => {
  test('an admin reorder during an ACTIVE trip leaves its snapshot alone; the next trip uses the new order', async () => {
    const { trip } = await start('PICKUP');
    expect((await progress(trip, trip.stops[0].id, 'complete')).status).toBe(200);
    takeEmits();
    const before = deepCopy(db().tripStops);

    const reorder = await api.put('/api/stops/reorder', T.ADMIN, {
      busId: 'b1', direction: 'PICKUP', stopIds: ['p-amit', 'p-priya', 'p-rahul'],
    });
    expect(reorder.status).toBe(200);
    expect(reorder.body.stops.map((s) => s.id)).toEqual(['p-amit', 'p-priya', 'p-rahul']);
    expect(Object.fromEntries(db().stops.filter((s) => s.direction === 'PICKUP').map((s) => [s.id, s.order])))
      .toEqual({ 'p-amit': 1, 'p-priya': 2, 'p-rahul': 3 });

    expect(deepCopy(db().tripStops)).toEqual(before);
    const current = await api.get('/api/trips/current', T.DRIVER);
    expect(stopIds(current.body.trip)).toEqual(PICKUP_ORDER);
    expect(current.body.trip.stops.map((s) => s.order)).toEqual([1, 2, 3]);
    expect(statuses(current.body.trip)).toEqual(['COMPLETED', 'PENDING', 'PENDING']);
    expect(current.body.currentStop.stopId).toBe('p-priya');

    const ended = await api.post(`/api/trips/${trip.id}/end`, T.DRIVER);
    expect(statuses(ended.body.trip)).toEqual(['COMPLETED', 'CANCELLED', 'CANCELLED']);
    takeEmits();

    const next = await start('PICKUP');
    expect(next.trip.id).not.toBe(trip.id);
    expect(stopIds(next.trip)).toEqual(['p-amit', 'p-priya', 'p-rahul']);
    expect(next.currentStop.stopId).toBe('p-amit');
  });

  test('the bus being closer to a later stop does not change the current stop', async () => {
    const { trip } = await start('PICKUP');
    takeEmits();
    const amit = db().stops.find((s) => s.id === 'p-amit');
    const priya = db().stops.find((s) => s.id === 'p-priya');
    // Parked (speed 0) right on top of the 3rd and then the 2nd stop while
    // the 1st stop is current.
    for (const spot of [amit, priya]) {
      const res = await api.post('/api/buses/location', T.DRIVER, {
        busId: 'b1', lat: spot.lat, lng: spot.lng, speed: 0, heading: 0, accuracy: 5,
        recordedAt: new Date().toISOString(),
      });
      expect(res.status).toBe(200);
    }
    const current = await api.get('/api/trips/current', T.DRIVER);
    expect(current.body.currentStop.stopId).toBe('p-rahul');
    expect(current.body.destination).toMatchObject({ kind: 'STOP', stopId: 'p-rahul' });
    expect(statuses(current.body.trip)).toEqual(['PENDING', 'PENDING', 'PENDING']);
    expect(tripService.routeWaypoints(current.body.trip).map((w) => w.stopId ?? w.kind))
      .toEqual([...PICKUP_ORDER, 'SCHOOL']);
    expect(emitted('trip:state')).toHaveLength(0);
  });
});

describe('Scenario 9: progress is one configured stop at a time', () => {
  test('complete and skip both advance to the next configured student', async () => {
    const { trip } = await start('PICKUP');
    takeEmits();
    const [rahul, priya, amit] = trip.stops;

    const done = await progress(trip, rahul.id, 'complete');
    expect(done.status).toBe(200);
    expect(done.body.currentStop).toMatchObject({ id: priya.id, name: 'Priya – pickup' });
    expect(expectStateBroadcast(takeEmits()).currentStop.id).toBe(priya.id);

    const skipped = await progress(trip, priya.id, 'skip');
    expect(skipped.status).toBe(200);
    expect(skipped.body.currentStop).toMatchObject({ id: amit.id, name: 'Amit – pickup' });
    expect(statuses(skipped.body.trip)).toEqual(['COMPLETED', 'SKIPPED', 'PENDING']);
    expect(expectStateBroadcast(takeEmits()).currentStop.id).toBe(amit.id);

    const lastSkip = await progress(trip, amit.id, 'skip');
    expect(lastSkip.status).toBe(200);
    expect(statuses(lastSkip.body.trip)).toEqual(['COMPLETED', 'SKIPPED', 'SKIPPED']);
    expect(lastSkip.body.destination).toMatchObject({ kind: 'SCHOOL' });
    expectStateBroadcast(takeEmits());
  });

  test('completing or skipping a non-current stop is a 409 and changes nothing', async () => {
    const { trip } = await start('PICKUP');
    takeEmits();
    const [rahul, priya, amit] = trip.stops;
    const snapshot = () => deepCopy({ trips: db().trips, tripStops: db().tripStops, buses: db().buses });

    let before = snapshot();
    for (const [ts, action] of [[amit, 'complete'], [priya, 'complete'], [amit, 'skip'], [priya, 'skip']]) {
      const res = await progress(trip, ts.id, action);
      expect(res.status).toBe(409);
      expect(res.body).toEqual({ message: 'Only the current stop can be updated' });
    }
    expect(snapshot()).toEqual(before);
    expect(takeEmits()).toHaveLength(0);

    // A stop already closed cannot be closed again.
    expect((await progress(trip, rahul.id, 'complete')).status).toBe(200);
    takeEmits();
    before = snapshot();
    expect((await progress(trip, rahul.id, 'complete')).status).toBe(409);
    expect((await progress(trip, rahul.id, 'skip')).status).toBe(409);
    expect((await progress(trip, amit.id, 'complete')).status).toBe(409);
    expect(snapshot()).toEqual(before);
    expect(takeEmits()).toHaveLength(0);

    // After the trip ends nothing progresses.
    expect((await api.post(`/api/trips/${trip.id}/end`, T.DRIVER)).status).toBe(200);
    takeEmits();
    before = snapshot();
    const late = await progress(trip, priya.id, 'complete');
    expect(late.status).toBe(409);
    expect(snapshot()).toEqual(before);
    expect(takeEmits()).toHaveLength(0);
  });
});

describe('Resume after a backend restart (6.9, 6.10)', () => {
  test('a fresh app and trip service read the ACTIVE trip back with unchanged statuses', async () => {
    const { trip } = await start('PICKUP');
    expect((await progress(trip, trip.stops[0].id, 'complete')).status).toBe(200);
    expect((await progress(trip, trip.stops[1].id, 'skip')).status).toBe(200);
    takeEmits();
    const dbBefore = deepCopy({ trips: db().trips, tripStops: db().tripStops });

    // "Restart": a new module registry, so new app, controller, trip service
    // and Prisma client instances over the same stored rows.
    let app2;
    let tripService2;
    jest.isolateModules(() => {
      app2 = require('../src/app');
      tripService2 = require('../src/services/tripService');
    });
    expect(app2).not.toBe(app);
    expect(tripService2).not.toBe(tripService);
    app2.set('io', fakeIo);
    const api2 = client(app2);

    const current = await api2.get('/api/trips/current', T.DRIVER);
    expect(current.status).toBe(200);
    expect(current.body).toMatchObject({ success: true, busId: 'b1', trip: { id: trip.id, status: 'ACTIVE', direction: 'PICKUP' } });
    expect(stopIds(current.body.trip)).toEqual(PICKUP_ORDER);
    expect(statuses(current.body.trip)).toEqual(['COMPLETED', 'SKIPPED', 'PENDING']);
    expect(current.body.currentStop.stopId).toBe('p-amit');
    expect((await tripService2.getCurrentTrip('b1')).id).toBe(trip.id);

    const conductor = await api2.get('/api/trips/current', T.CONDUCTOR);
    expect(conductor.body.trip.id).toBe(trip.id);
    expect(deepCopy({ trips: db().trips, tripStops: db().tripStops })).toEqual(dbBefore);
    expect(takeEmits()).toHaveLength(0);

    // The driver's app calls start again after the restart: it resumes.
    const resumed = await api2.post('/api/trips/start', T.DRIVER, { direction: 'PICKUP' });
    expect(resumed.status).toBe(200);
    expect(resumed.body).toMatchObject({ resumed: true, trip: { id: trip.id } });
    expect(statuses(resumed.body.trip)).toEqual(['COMPLETED', 'SKIPPED', 'PENDING']);
    expect(db().trips).toHaveLength(1);
    expectStateBroadcast(takeEmits());

    const finished = await progress(trip, current.body.currentStop.id, 'complete', api2);
    expect(finished.status).toBe(200);
    expect(statuses(finished.body.trip)).toEqual(['COMPLETED', 'SKIPPED', 'COMPLETED']);
    expect(finished.body.destination).toMatchObject({ kind: 'SCHOOL' });
    expectStateBroadcast(takeEmits());
  });
});

describe('Events for every trip change (6.8)', () => {
  test('start, resume, complete, skip, cancel and end each broadcast trip:state; legacy events only on start and end', async () => {
    const started = await start('PICKUP');
    const { trip } = started;
    let events = takeEmits();
    expectStateBroadcast(events, ['tripStarted']);
    expect(events.filter((e) => e.event === 'tripStarted').map((e) => [e.room, e.payload])).toEqual(
      expect.arrayContaining([
        ['bus_b1', { busId: 'b1', tripId: trip.id, direction: 'PICKUP' }],
        ['admins', { busId: 'b1', tripId: trip.id, direction: 'PICKUP' }],
      ])
    );

    // Resume: state again, but never a second tripStarted.
    expect((await api.post('/api/trips/start', T.DRIVER, { direction: 'PICKUP' })).status).toBe(200);
    expect(expectStateBroadcast(takeEmits()).trip.id).toBe(trip.id);

    const [rahul, priya, amit] = trip.stops;
    expect((await progress(trip, rahul.id, 'complete')).status).toBe(200);
    expect(expectStateBroadcast(takeEmits()).trip.stops[0].status).toBe('COMPLETED');

    expect((await progress(trip, priya.id, 'skip')).status).toBe(200);
    expect(expectStateBroadcast(takeEmits()).trip.stops[1].status).toBe('SKIPPED');

    expect((await api.post(`/api/trips/${trip.id}/stops/${amit.id}/cancel`, T.ADMIN)).status).toBe(200);
    const cancelled = expectStateBroadcast(takeEmits());
    expect(cancelled.trip.stops[2].status).toBe('CANCELLED');
    expect(cancelled.currentStop).toBeNull();

    expect((await api.post(`/api/trips/${trip.id}/end`, T.DRIVER)).status).toBe(200);
    events = takeEmits();
    expect(expectStateBroadcast(events, ['tripEnded']).trip.status).toBe('COMPLETED');
    expect(events.filter((e) => e.event === 'tripEnded').map((e) => [e.room, e.payload])).toEqual(
      expect.arrayContaining([
        ['bus_b1', { busId: 'b1', tripId: trip.id }],
        ['admins', { busId: 'b1', tripId: trip.id }],
      ])
    );

    // Reads emit nothing.
    await api.get('/api/trips/current', T.DRIVER);
    expect(takeEmits()).toHaveLength(0);
  });
});

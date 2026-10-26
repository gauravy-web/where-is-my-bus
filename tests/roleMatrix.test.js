// Supertest role matrix for every protected REST route (tasks 2.7 and 14.5).
// Each route gets: 401 without a token or with a bad token, 403 for each
// disallowed role, and a 2xx for each allowed role. Per-bus routes are checked
// for the caller's own bus (b1) and another bus (b2). Denied requests must
// not write to the database or send notifications.
// CONDUCTOR (assigned to b1) may read its own bus only and is refused on every
// driver-only and admin-only route (Requirements 3.9, 3.10).
// Fuel and maintenance routes are out of scope and not covered here.
// Prisma is an in-memory fake and FCM is mocked (Requirement 16.3).
// Validates: Requirements 2.7, 2.8, 3.2, 3.3, 3.4, 3.5, 3.6, 3.9, 3.10
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/testdb';
process.env.JWT_SECRET = 'test-jwt-secret';

jest.mock('../src/db', () => {
  const store = {
    users: [
      { id: 'u-parent', phone: '9111111111', role: 'PARENT', fcmToken: null },
      { id: 'u-driver', phone: '9333333333', role: 'DRIVER', fcmToken: null },
      { id: 'u-driver2', phone: '9444444444', role: 'DRIVER', fcmToken: null },
      { id: 'u-conductor', phone: '9555555555', role: 'CONDUCTOR', fcmToken: null },
      { id: 'u-conductor2', phone: '9666666666', role: 'CONDUCTOR', fcmToken: null },
    ],
    drivers: [
      { id: 'dr1', name: 'Ravi', phone: '+91 93333 33333', busId: 'b1' },
      // A driver with no bus assigned: must not reach any bus.
      { id: 'dr2', name: 'Spare', phone: '9444444444', busId: null },
    ],
    conductors: [
      { id: 'c1', name: 'Sunil', phone: '+91 95555 55555', busId: 'b1' },
      // A conductor with no bus assigned: must not reach any bus.
      { id: 'c2', name: 'Spare Conductor', phone: '9666666666', busId: null },
    ],
    students: [{ id: 's1', name: 'Kid', busId: 'b1', parentPhone: '9111111111', stopId: null }],
    buses: [
      { id: 'b1', busNo: 'B-1', status: 'ACTIVE' },
      { id: 'b2', busNo: 'B-2', status: 'ACTIVE' },
    ],
    stops: [{ id: 'st1', busId: 'b1', name: 'Stop 1', lat: 26.9, lng: 75.8, order: 1, direction: 'PICKUP' }],
    admins: [],
  };

  let writes = 0;
  const clone = (x) => (x ? { ...x } : null);

  // Minimal Prisma `where` matcher: equality, { not }, { in }; other filters are ignored.
  const matches = (row, where = {}) => Object.entries(where).every(([k, v]) => {
    if (v && typeof v === 'object') {
      if ('not' in v) return row[k] !== v.not;
      if ('in' in v) return v.in.includes(row[k]);
      return true;
    }
    return row[k] === v;
  });
  const findMany = (rows) => jest.fn(async (args = {}) => rows.filter((r) => matches(r, args.where)).map(clone));
  const findOne = (rows) => jest.fn(async (args = {}) => clone(rows.find((r) => matches(r, args.where))));
  // Mutations are counted so tests can assert denied requests never write.
  const mutation = (fn) => jest.fn(async (args = {}) => {
    writes += 1;
    return fn(args);
  });
  const echo = (prefix) => mutation(({ where, data }) => ({ id: where?.id || `${prefix}-new`, ...(data || {}) }));

  const $queryRaw = jest.fn(async (strings, ...values) => {
    const sql = Array.isArray(strings) ? strings.join('?') : String(strings);
    if (/FROM\s+"Admin"/i.test(sql)) {
      return store.admins.filter((a) => a.email === values[0]).map(clone);
    }
    if (/^\s*(INSERT|UPDATE|DELETE)\b/i.test(sql)) writes += 1;
    return [{ id: 'row-1', stops: [] }];
  });

  return {
    __store: store,
    __writes: () => writes,
    __resetWrites: () => { writes = 0; },
    user: {
      findUnique: findOne(store.users),
      findFirst: findOne(store.users),
      findMany: findMany(store.users),
      create: echo('u'),
      update: mutation(({ where, data }) => ({ ...(store.users.find((u) => u.id === where.id) || { id: where.id }), ...data })),
    },
    admin: {
      // adminLogin looks the admin up by email through the generated model.
      findUnique: jest.fn(async ({ where }) => {
        const a = store.admins.find((x) => x.email === where.email);
        return a ? clone(a) : null;
      }),
      update: echo('a'),
    },
    driver: {
      findMany: findMany(store.drivers),
      findFirst: findOne(store.drivers),
      findUnique: findOne(store.drivers),
      create: echo('dr'),
      update: echo('dr'),
      delete: echo('dr'),
    },
    conductor: {
      findMany: findMany(store.conductors),
      findFirst: findOne(store.conductors),
      findUnique: findOne(store.conductors),
    },
    student: {
      findMany: findMany(store.students),
      findUnique: findOne(store.students),
      create: echo('s'),
      update: echo('s'),
      delete: echo('s'),
      updateMany: mutation(() => ({ count: 0 })),
    },
    bus: {
      findMany: findMany(store.buses),
      findUnique: findOne(store.buses),
      create: echo('b'),
      update: echo('b'),
    },
    stop: {
      findMany: findMany(store.stops),
      findUnique: findOne(store.stops),
      count: jest.fn(async (args = {}) => store.stops.filter((s) => matches(s, args.where)).length),
      create: echo('st'),
      update: echo('st'),
      delete: echo('st'),
    },
    liveLocation: {
      findFirst: jest.fn(async (args = {}) => ({
        id: 'l1', busId: args.where?.busId, lat: 26.9, lng: 75.8, speed: 5, timestamp: new Date(0),
      })),
      create: echo('l'),
    },
    emergency: {
      findMany: jest.fn(async () => []),
      create: echo('e'),
      update: echo('e'),
    },
    attendance: {
      findFirst: jest.fn(async () => null),
      findMany: jest.fn(async () => []),
      create: echo('att'),
      update: echo('att'),
    },
    // Trips: no ACTIVE trip is ever stored, so start always creates a new trip
    // and the legacy end falls back to resetting the bus status.
    trip: {
      findFirst: jest.fn(async () => null),
      findUnique: jest.fn(async () => null),
      create: echo('t'),
      updateMany: mutation(() => ({ count: 0 })),
    },
    tripStop: {
      findMany: jest.fn(async () => []),
      create: echo('ts'),
      updateMany: mutation(() => ({ count: 0 })),
    },
    school: { findFirst: jest.fn(async () => null) },
    $queryRaw,
    $executeRaw: mutation(async () => 1),
    // Interactive transactions run against the same fake client.
    async $transaction(arg) {
      return Array.isArray(arg) ? Promise.all(arg) : arg(this);
    },
    $disconnect: jest.fn(),
  };
});

jest.mock('../src/services/notificationService', () => ({
  sendNotification: jest.fn(async () => undefined),
  sendMulticast: jest.fn(async () => undefined),
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const prisma = require('../src/db');
const { sendNotification, sendMulticast } = require('../src/services/notificationService');
const { resetConfig } = require('../src/config/env');
const app = require('../src/app');

const sign = (payload, secret = 'test-jwt-secret') => `Bearer ${jwt.sign(payload, secret)}`;
const TOKENS = {
  BAD_TOKEN: sign({ id: 'a1', role: 'ADMIN' }, 'wrong-secret'),
  ADMIN: sign({ id: 'a1', role: 'ADMIN' }),
  PARENT: sign({ id: 'u-parent', role: 'PARENT', phone: '9111111111' }),
  DRIVER: sign({ id: 'u-driver', role: 'DRIVER', phone: '9333333333' }),
  DRIVER_NO_BUS: sign({ id: 'u-driver2', role: 'DRIVER', phone: '9444444444' }),
  CONDUCTOR: sign({ id: 'u-conductor', role: 'CONDUCTOR', phone: '9555555555' }),
  CONDUCTOR_NO_BUS: sign({ id: 'u-conductor2', role: 'CONDUCTOR', phone: '9666666666' }),
};
const ACTORS = ['NONE', 'BAD_TOKEN', 'ADMIN', 'PARENT', 'DRIVER', 'DRIVER_NO_BUS', 'CONDUCTOR', 'CONDUCTOR_NO_BUS'];
const OK = '2xx';
const OWN_BUS = 'b1'; // the bus of DRIVER, of CONDUCTOR and of PARENT's child
const OTHER_BUS = 'b2';

const send = ({ method, path, body }, actor) => {
  let req = request(app)[method.toLowerCase()](path);
  if (actor !== 'NONE') req = req.set('Authorization', TOKENS[actor]);
  return body === undefined ? req : req.send(body);
};

const expectDenied = (res, status) => {
  expect(res.status).toBe(status);
  expect(prisma.__writes()).toBe(0);
  expect(sendMulticast).not.toHaveBeenCalled();
  expect(sendNotification).not.toHaveBeenCalled();
};

const expectOk = (res) => {
  if (res.status < 200 || res.status >= 300) {
    throw new Error(`expected 2xx, got ${res.status}: ${JSON.stringify(res.body)}`);
  }
};

const unauthenticated = { NONE: 401, BAD_TOKEN: 401 };
const conductorsDenied = { CONDUCTOR: 403, CONDUCTOR_NO_BUS: 403 };

const adminOnly = (method, path, body) => ({
  method, path, body,
  expect: { ...unauthenticated, ...conductorsDenied, ADMIN: OK, PARENT: 403, DRIVER: 403, DRIVER_NO_BUS: 403 },
});

const anyUser = (method, path, body) => ({
  method, path, body,
  expect: {
    ...unauthenticated,
    ADMIN: OK, PARENT: OK, DRIVER: OK, DRIVER_NO_BUS: OK, CONDUCTOR: OK, CONDUCTOR_NO_BUS: OK,
  },
});

// Rows that only pin the denied actors; actors without an expectation are not
// run here (their success paths need trip fixtures and live in tripRoutes.test.js).
const deniedOnly = (method, path, body, expect, label) => ({ method, path, body, label, expect });

// A route scoped to one bus, given in the URL or body. DRIVER may use only
// their assigned bus; `parent` lets a linked PARENT read their child's bus;
// `conductor` lets the assigned CONDUCTOR read their bus; `admin` lets ADMIN
// use any bus.
const perBus = (method, makePath, makeBody, { admin = true, parent = false, conductor = false } = {}) => [
  {
    method, path: makePath(OWN_BUS), body: makeBody && makeBody(OWN_BUS), label: 'own bus',
    expect: {
      ...unauthenticated,
      ADMIN: admin ? OK : 403,
      DRIVER: OK,
      DRIVER_NO_BUS: 403,
      PARENT: parent ? OK : 403,
      CONDUCTOR: conductor ? OK : 403,
      CONDUCTOR_NO_BUS: 403,
    },
  },
  {
    method, path: makePath(OTHER_BUS), body: makeBody && makeBody(OTHER_BUS), label: 'other bus',
    expect: {
      ...unauthenticated, ...conductorsDenied, ADMIN: admin ? OK : 403, DRIVER: 403, DRIVER_NO_BUS: 403, PARENT: 403,
    },
  },
];

// Trip mutations by id. The fake never stores a trip, so only the guard
// outcome is asserted for the roles the route refuses.
const TRIP_STOP = '/api/trips/t1/stops/ts1';
const driverOnlyTripRoute = (path) => deniedOnly('POST', path, {}, {
  ...unauthenticated, ...conductorsDenied, ADMIN: 403, PARENT: 403, DRIVER_NO_BUS: 403,
});

const ROUTES = [
  // Buses
  adminOnly('GET', '/api/buses'),
  adminOnly('GET', '/api/buses/live'),
  adminOnly('POST', '/api/buses', { busNo: 'NEW-1' }),
  adminOnly('PUT', '/api/buses/b1', { status: 'ACTIVE' }),
  adminOnly('DELETE', '/api/buses/b1'),
  ...perBus('GET', (b) => `/api/buses/${b}/location`, null, { parent: true, conductor: true }),
  ...perBus('GET', (b) => `/api/buses/${b}/full`, null, { parent: true, conductor: true }),
  ...perBus('POST', () => '/api/buses/location', (b) => ({ busId: b, lat: 26.9, lng: 75.8, speed: 10 }), { admin: false }),

  // Drivers
  adminOnly('GET', '/api/drivers'),
  adminOnly('GET', '/api/drivers/dr1'),
  adminOnly('POST', '/api/drivers', { name: 'New Driver', phone: '9000000000' }),
  adminOnly('PUT', '/api/drivers/dr1', { name: 'Ravi K' }),
  adminOnly('DELETE', '/api/drivers/dr1'),
  adminOnly('PATCH', '/api/drivers/dr1/assign-bus', { busId: 'b2' }),

  // Students
  adminOnly('GET', '/api/students'),
  adminOnly('POST', '/api/students', { name: 'New Kid', busId: 'b1', parentPhone: '9222222222' }),
  adminOnly('PUT', '/api/students/s1', { dropStopId: null }),
  adminOnly('DELETE', '/api/students/s1'),
  ...perBus('GET', (b) => `/api/students/bus/${b}`, null, { conductor: true }),

  // Stops
  adminOnly('GET', '/api/stops'),
  adminOnly('POST', '/api/stops', { busId: 'b1', name: 'New Stop', lat: 26.9, lng: 75.8 }),
  adminOnly('PATCH', '/api/stops/reorder', { busId: 'b1', stopIds: ['st1'] }),
  adminOnly('DELETE', '/api/stops/st1'),
  ...perBus('GET', (b) => `/api/stops/${b}`, null, { parent: true, conductor: true }),
  ...perBus('GET', (b) => `/api/stops/bus/${b}`, null, { parent: true, conductor: true }),

  // Routes (raw SQL)
  adminOnly('GET', '/api/routes'),
  adminOnly('GET', '/api/routes/r1'),
  adminOnly('POST', '/api/routes', {
    name: 'R1', busId: 'b1', startPoint: 'School', stops: [{ name: 'A', lat: 26.9, lng: 75.8 }],
  }),
  adminOnly('PUT', '/api/routes/r1', { name: 'R1 renamed' }),
  adminOnly('POST', '/api/routes/r1/stops', { name: 'A', lat: 26.9, lng: 75.8 }),
  adminOnly('DELETE', '/api/routes/stops/rs1'),
  adminOnly('DELETE', '/api/routes/r1'),
  ...perBus('GET', (b) => `/api/routes/bus/${b}`, null, { parent: true, conductor: true }),

  // Trips (start is DRIVER-only; the old app's { busId } body defaults to PICKUP)
  ...perBus('POST', () => '/api/trips/start', (b) => ({ busId: b }), { admin: false }),
  ...perBus('POST', () => '/api/trips/end', (b) => ({ busId: b })),
  adminOnly('GET', '/api/trips/active'),
  // Current trip: staff read their assigned bus; ADMIN must name the bus.
  ...perBus('GET', (b) => `/api/trips/current?busId=${b}`, null, { conductor: true }),
  {
    method: 'GET', path: '/api/trips/current', label: 'assigned bus',
    expect: {
      ...unauthenticated,
      ADMIN: 400, PARENT: 403, DRIVER: OK, DRIVER_NO_BUS: OK, CONDUCTOR: OK, CONDUCTOR_NO_BUS: OK,
    },
  },
  driverOnlyTripRoute(`${TRIP_STOP}/complete`),
  driverOnlyTripRoute(`${TRIP_STOP}/skip`),
  deniedOnly('POST', `${TRIP_STOP}/cancel`, {}, {
    ...unauthenticated, ...conductorsDenied, PARENT: 403, DRIVER: 403, DRIVER_NO_BUS: 403,
  }),
  deniedOnly('POST', '/api/trips/t1/end', {}, {
    ...unauthenticated, ...conductorsDenied, PARENT: 403, DRIVER_NO_BUS: 403,
  }),

  // SOS
  ...perBus('POST', () => '/api/sos', (b) => ({ busId: b, message: 'help' })),
  adminOnly('GET', '/api/sos'),
  adminOnly('PATCH', '/api/sos/e1', { status: 'resolved' }),

  // Attendance
  ...perBus('POST', () => '/api/attendance', (b) => ({ studentId: 's1', busId: b, date: '2026-01-05', boarded: true })),
  adminOnly('GET', '/api/attendance'),

  // Emergencies (adminRoutes mounted at /api)
  adminOnly('GET', '/api/emergencies'),
  adminOnly('POST', '/api/emergencies', { busId: 'b1' }),
  adminOnly('DELETE', '/api/emergencies/e1'),

  // Dev-only endpoints (outside production)
  adminOnly('POST', '/api/test-sos', { busId: 'b1' }),
  adminOnly('POST', '/api/notifications/send', { token: 't', title: 'x', body: 'y' }),

  // School_Sheet import: ADMIN only (ADMIN success paths live in importRoutes.test.js)
  deniedOnly('POST', '/api/import/school-sheet/preview', undefined, {
    ...unauthenticated, ...conductorsDenied, PARENT: 403, DRIVER: 403, DRIVER_NO_BUS: 403,
  }),
  deniedOnly('POST', '/api/import/school-sheet/confirm', { previewToken: 'p1' }, {
    ...unauthenticated, ...conductorsDenied, PARENT: 403, DRIVER: 403, DRIVER_NO_BUS: 403,
  }),

  // FCM token endpoints: any authenticated user, stored on req.user
  anyUser('POST', '/api/auth/fcm-token', { fcmToken: 'tok' }),
  anyUser('POST', '/api/notifications/save-token', { fcmToken: 'tok' }),
];

beforeAll(() => {
  // Controllers log heavily; keep the test output readable.
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

beforeEach(() => {
  jest.clearAllMocks();
  prisma.__resetWrites();
});

afterEach(() => {
  process.env.NODE_ENV = 'test';
  resetConfig();
});

describe('REST role matrix', () => {
  for (const row of ROUTES) {
    const title = `${row.method} ${row.path}${row.label ? ` (${row.label})` : ''}`;
    describe(title, () => {
      for (const actor of ACTORS) {
        const expected = row.expect[actor];
        if (expected === undefined) continue; // not pinned by this row (see deniedOnly)
        test(`${actor} -> ${expected}`, async () => {
          const res = await send(row, actor);
          if (expected === OK) expectOk(res);
          else expectDenied(res, expected);
        });
      }
    });
  }
});

describe('dev-only endpoints return 404 in production', () => {
  const rows = [
    { method: 'POST', path: '/api/test-sos', body: { busId: 'b1' } },
    { method: 'POST', path: '/api/notifications/send', body: { token: 't', title: 'x', body: 'y' } },
  ];
  for (const row of rows) {
    for (const actor of ['NONE', 'ADMIN', 'DRIVER']) {
      test(`${row.method} ${row.path} as ${actor} -> 404`, async () => {
        process.env.NODE_ENV = 'production';
        resetConfig();
        expectDenied(await send(row, actor), 404);
      });
    }
  }
});

describe('admin login token passes the ADMIN gate', () => {
  afterEach(() => {
    prisma.__store.admins.length = 0;
  });

  test('a token issued by bcrypt admin login reaches an ADMIN-only route', async () => {
    prisma.__store.admins.push({
      id: 'a-real', email: 'admin@school.test', name: 'Admin', password: await bcrypt.hash('s3cret', 4),
    });

    const wrong = await request(app).post('/api/auth/admin-login').send({ email: 'admin@school.test', password: 'nope' });
    expect(wrong.status).toBe(401);
    expect(wrong.body.token).toBeUndefined();

    const login = await request(app).post('/api/auth/admin-login').send({ email: 'admin@school.test', password: 's3cret' });
    expect(login.status).toBe(200);
    expect(jwt.verify(login.body.token, 'test-jwt-secret')).toMatchObject({ id: 'a-real', role: 'ADMIN' });

    const res = await request(app).get('/api/buses').set('Authorization', `Bearer ${login.body.token}`);
    expect(res.status).toBe(200);
  });
});

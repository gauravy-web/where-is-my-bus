// Smoke tests for REST authorization (task 2.3; the full role matrix is task 2.7).
// Prisma is an in-memory fake and FCM is mocked (Requirement 16.3).
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/testdb';
process.env.JWT_SECRET = 'test-jwt-secret';

jest.mock('../src/db', () => {
  const store = {
    users: [
      { id: 'u-parent', phone: '9111111111', role: 'PARENT', fcmToken: null },
      { id: 'u-driver', phone: '9333333333', role: 'DRIVER', fcmToken: null },
    ],
    drivers: [{ id: 'dr1', name: 'Ravi', phone: '+91 93333 33333', busId: 'b1' }],
    students: [{ id: 's1', name: 'Kid', busId: 'b1', parentPhone: '9111111111' }],
    conductors: [{ id: 'c1', name: 'Asha', phone: '9555555555', busId: 'b1' }],
  };
  const clone = (x) => (x ? { ...x } : null);
  return {
    __store: store,
    user: {
      findUnique: jest.fn(async ({ where }) => clone(store.users.find((u) => u.id === where.id))),
      findMany: jest.fn(async () => []),
      update: jest.fn(async ({ where, data }) => {
        const u = store.users.find((x) => x.id === where.id);
        if (!u) {
          const err = new Error('Record not found');
          err.code = 'P2025';
          throw err;
        }
        Object.assign(u, data);
        return clone(u);
      }),
    },
    driver: {
      findMany: jest.fn(async () => store.drivers.map(clone)),
      findFirst: jest.fn(async ({ where }) => clone(store.drivers.find((d) => d.busId === where.busId))),
    },
    conductor: { findMany: jest.fn(async () => store.conductors.map(clone)) },
    student: { findMany: jest.fn(async () => store.students.map(clone)) },
    bus: {
      findMany: jest.fn(async () => [{ id: 'b1', busNo: 'B-1', status: 'ACTIVE' }]),
      findUnique: jest.fn(async ({ where }) =>
        (['b1', 'b2'].includes(where.id) ? { id: where.id, busNo: `B-${where.id}`, status: 'ACTIVE' } : null)),
    },
    stop: { findMany: jest.fn(async () => []) },
    // No ACTIVE trip: POST /api/buses/location ingests without a trip.
    trip: { findFirst: jest.fn(async () => null) },
    liveLocation: {
      findFirst: jest.fn(async () => null),
      create: jest.fn(async ({ data }) => ({ id: 'l1', ...data })),
    },
    $queryRaw: jest.fn(async () => []),
    $disconnect: jest.fn(),
  };
});

jest.mock('../src/services/notificationService', () => ({
  sendNotification: jest.fn(async () => undefined),
  sendMulticast: jest.fn(async () => undefined),
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const prisma = require('../src/db');
const { resetConfig } = require('../src/config/env');
const app = require('../src/app');

const sign = (payload) => `Bearer ${jwt.sign(payload, 'test-jwt-secret')}`;
const ADMIN = sign({ id: 'a1', role: 'ADMIN' });
const PARENT = sign({ id: 'u-parent', role: 'PARENT', phone: '9111111111' });
const DRIVER = sign({ id: 'u-driver', role: 'DRIVER', phone: '9333333333' });
const CONDUCTOR = sign({ id: 'u-conductor', role: 'CONDUCTOR', phone: '9555555555' });

afterEach(() => {
  process.env.NODE_ENV = 'test';
  resetConfig();
});

describe('ADMIN-only lists and mutations', () => {
  test('GET /api/buses: 401 without token, 403 for PARENT/DRIVER, 200 for ADMIN', async () => {
    expect((await request(app).get('/api/buses')).status).toBe(401);
    expect((await request(app).get('/api/buses').set('Authorization', PARENT)).status).toBe(403);
    expect((await request(app).get('/api/buses').set('Authorization', DRIVER)).status).toBe(403);
    const ok = await request(app).get('/api/buses').set('Authorization', ADMIN);
    expect(ok.status).toBe(200);
    expect(ok.body).toMatchObject({ success: true, buses: [{ id: 'b1' }] });
  });

  test('POST /api/buses is rejected for a DRIVER before reaching the controller', async () => {
    const res = await request(app).post('/api/buses').set('Authorization', DRIVER).send({ busNo: 'X' });
    expect(res.status).toBe(403);
  });
});

describe('per-bus reads', () => {
  test('a PARENT can read their child\'s bus and gets 403 for another bus', async () => {
    const own = await request(app).get('/api/buses/b1/full').set('Authorization', PARENT);
    expect(own.status).toBe(200);
    expect(own.body).toMatchObject({ success: true, busId: 'b1' });
    expect((await request(app).get('/api/buses/b2/full').set('Authorization', PARENT)).status).toBe(403);
  });

  test('GET /api/students/bus/:busId is not available to a PARENT', async () => {
    const res = await request(app).get('/api/students/bus/b1').set('Authorization', PARENT);
    expect(res.status).toBe(403);
  });
});

// Smoke checks for task 14.3; the full conductor matrix is task 14.5.
describe('CONDUCTOR limits', () => {
  test('a CONDUCTOR can list students of their own bus only', async () => {
    const own = await request(app).get('/api/students/bus/b1').set('Authorization', CONDUCTOR);
    expect(own.status).toBe(200);
    expect(own.body.success).toBe(true);
    expect((await request(app).get('/api/students/bus/b2').set('Authorization', CONDUCTOR)).status).toBe(403);
  });

  test('a CONDUCTOR gets only student names and stop links, no parent phones (Requirement 3.9)', async () => {
    const res = await request(app).get('/api/students/bus/b1').set('Authorization', CONDUCTOR);
    expect(res.status).toBe(200);
    expect(res.body.students).toEqual([{ id: 's1', name: 'Kid', busId: 'b1', stopId: null, dropStopId: null }]);
    // Admins still get the full rows.
    const admin = await request(app).get('/api/students/bus/b1').set('Authorization', ADMIN);
    expect(admin.body.students[0].parentPhone).toBe('9111111111');
  });

  test('a CONDUCTOR gets 403 on location, trip start/end and SOS for their own bus', async () => {
    const fix = { busId: 'b1', lat: 26.9, lng: 75.8, speed: 10 };
    expect((await request(app).post('/api/buses/location').set('Authorization', CONDUCTOR).send(fix)).status).toBe(403);
    expect((await request(app).post('/api/trips/start').set('Authorization', CONDUCTOR).send({ busId: 'b1' })).status).toBe(403);
    expect((await request(app).post('/api/trips/end').set('Authorization', CONDUCTOR).send({ busId: 'b1' })).status).toBe(403);
    expect((await request(app).post('/api/sos').set('Authorization', CONDUCTOR).send({ busId: 'b1' })).status).toBe(403);
    expect(prisma.liveLocation.create).not.toHaveBeenCalled();
  });
});

describe('POST /api/buses/location', () => {
  const post = (auth, body) => {
    const r = request(app).post('/api/buses/location');
    return (auth ? r.set('Authorization', auth) : r).send(body);
  };
  const fix = (busId) => ({ busId, lat: 26.9, lng: 75.8, speed: 10 });

  test('only the DRIVER assigned to the bus is accepted', async () => {
    expect((await post(null, fix('b1'))).status).toBe(401);
    expect((await post(PARENT, fix('b1'))).status).toBe(403);
    expect((await post(ADMIN, fix('b1'))).status).toBe(403);
    expect((await post(DRIVER, fix('b2'))).status).toBe(403);
    expect(prisma.liveLocation.create).not.toHaveBeenCalled();

    const ok = await post(DRIVER, fix('b1'));
    expect(ok.status).toBe(200);
    expect(ok.body.success).toBe(true);
    expect(prisma.liveLocation.create).toHaveBeenCalledTimes(1);
  });
});

describe('dev-only endpoints', () => {
  test('POST /api/test-sos is ADMIN-only and 404 in production', async () => {
    expect((await request(app).post('/api/test-sos').send({ busId: 'b1' })).status).toBe(401);
    expect((await request(app).post('/api/test-sos').set('Authorization', DRIVER).send({ busId: 'b1' })).status).toBe(403);
    expect((await request(app).post('/api/test-sos').set('Authorization', ADMIN).send({ busId: 'b1' })).status).toBe(200);

    process.env.NODE_ENV = 'production';
    resetConfig();
    expect((await request(app).post('/api/test-sos').set('Authorization', ADMIN).send({ busId: 'b1' })).status).toBe(404);
    expect((await request(app).post('/api/notifications/send').set('Authorization', ADMIN).send({})).status).toBe(404);
  });
});

describe('FCM token endpoints', () => {
  test('POST /api/auth/fcm-token stores the token on req.user, ignoring body phone', async () => {
    expect((await request(app).post('/api/auth/fcm-token').send({ fcmToken: 't' })).status).toBe(401);
    expect((await request(app).post('/api/auth/fcm-token').set('Authorization', PARENT).send({})).status).toBe(400);

    const res = await request(app)
      .post('/api/auth/fcm-token')
      .set('Authorization', PARENT)
      .send({ phone: '9333333333', fcmToken: 'tok-parent' });
    expect(res.status).toBe(200);
    expect(prisma.__store.users.find((u) => u.id === 'u-parent').fcmToken).toBe('tok-parent');
    expect(prisma.__store.users.find((u) => u.id === 'u-driver').fcmToken).toBeNull();
  });

  test('POST /api/notifications/save-token uses req.user', async () => {
    const res = await request(app)
      .post('/api/notifications/save-token')
      .set('Authorization', DRIVER)
      .send({ phone: '9111111111', fcmToken: 'tok-driver' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, message: 'Token saved!' });
    expect(prisma.__store.users.find((u) => u.id === 'u-driver').fcmToken).toBe('tok-driver');
  });
});

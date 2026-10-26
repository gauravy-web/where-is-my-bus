// Auth tests: server-derived roles, phone+password login, bcrypt admin login.
// Prisma is an in-memory fake and FCM is mocked (Requirement 16.3).
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/testdb';
process.env.JWT_SECRET = 'test-jwt-secret';

jest.mock('../src/db', () => {
  const store = { users: [], drivers: [], conductors: [], students: [], buses: [], admins: [] };
  let seq = 0;
  const clone = (x) => (x ? { ...x } : null);
  return {
    __store: store,
    __reset(data = {}) {
      store.users      = (data.users      || []).map((u) => ({ fcmToken: null, name: null, password: null, ...u }));
      store.drivers    = (data.drivers    || []).map((d) => ({ ...d }));
      store.conductors = (data.conductors || []).map((c) => ({ ...c }));
      store.students   = (data.students   || []).map((s) => ({ ...s }));
      store.buses      = (data.buses      || []).map((b) => ({ ...b }));
      store.admins     = (data.admins     || []).map((a) => ({ ...a }));
    },
    user: {
      findUnique: jest.fn(async ({ where }) =>
        clone(store.users.find((u) => (where.id ? u.id === where.id : u.phone === where.phone)))),
      findMany: jest.fn(async () => store.users.map(clone)),
      create: jest.fn(async ({ data }) => {
        const u = { id: `u${++seq}`, name: null, fcmToken: null, password: null, ...data };
        store.users.push(u);
        return clone(u);
      }),
      update: jest.fn(async ({ where, data }) => {
        const u = store.users.find((x) => x.id === where.id);
        Object.assign(u, data);
        return clone(u);
      }),
    },
    driver:    { findMany: jest.fn(async () => store.drivers.map(clone)) },
    conductor: { findMany: jest.fn(async () => store.conductors.map(clone)) },
    student:   { findMany: jest.fn(async () => store.students.map(clone)) },
    bus: {
      findUnique: jest.fn(async ({ where }) => clone(store.buses.find((b) => b.id === where.id))),
      findMany:   jest.fn(async ({ where } = {}) =>
        store.buses.filter((b) => !where?.id?.in || where.id.in.includes(b.id)).map(clone)),
    },
    admin: {
      findUnique: jest.fn(async ({ where }) =>
        clone(store.admins.find((a) => a.email === where.email))),
      update: jest.fn(async ({ where, data }) => {
        const a = store.admins.find((x) => x.id === where.id);
        Object.assign(a, data);
        return clone(a);
      }),
    },
    $queryRaw: jest.fn(async (strings, ...values) => {
      const sql = strings.join('?');
      if (sql.includes('"Admin"')) {
        return store.admins.filter((a) => a.email === values[0]).map(clone);
      }
      return [];
    }),
    $disconnect: jest.fn(),
  };
});

jest.mock('../src/services/notificationService', () => ({
  sendNotification: jest.fn(),
  sendMulticast: jest.fn(),
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const prisma = require('../src/db');
const { resetConfig } = require('../src/config/env');
const { deriveRole } = require('../src/controllers/authController');
const app = require('../src/app');

const DRIVER_PHONE    = '9333333333';
const PARENT_PHONE    = '9111111111';
const BOTH_PHONE      = '9555555555';
const CONDUCTOR_PHONE = '9666666666';
const PARENT2_PHONE   = '9777777777';
const CONDUCTOR_PARENT_PHONE  = '9888888888';
const DRIVER_CONDUCTOR_PHONE  = '9222222222';

const seed = () =>
  prisma.__reset({
    drivers: [
      { id: 'dr1', phone: '+91 93333 33333', busId: 'b1' },
      { id: 'dr2', phone: BOTH_PHONE, busId: 'b2' },
      { id: 'dr3', phone: DRIVER_CONDUCTOR_PHONE, busId: 'b2' },
    ],
    conductors: [
      { id: 'c1', name: 'Meena', phone: '+91 96666 66666', busId: 'b1' },
      { id: 'c2', name: 'Sunil', phone: CONDUCTOR_PARENT_PHONE, busId: 'b2' },
      { id: 'c3', name: 'Kiran', phone: `+91${DRIVER_CONDUCTOR_PHONE}`, busId: 'b2' },
    ],
    students: [
      { id: 's1', busId: 'b1', parentPhone: '+91-91111-11111', parentPhone2: null },
      { id: 's2', busId: 'b2', parentPhone: BOTH_PHONE, parentPhone2: null },
      { id: 's3', busId: 'b1', parentPhone: '9000000099', parentPhone2: '+91 97777 77777' },
      { id: 's4', busId: 'b2', parentPhone: CONDUCTOR_PARENT_PHONE, parentPhone2: null },
    ],
    buses: [
      { id: 'b1', busNo: 'B-1' },
      { id: 'b2', busNo: 'B-2' },
    ],
  });

beforeEach(() => {
  seed();
  jest.clearAllMocks();
});

afterEach(() => {
  resetConfig();
});

// ─────────────────────────────────────────────
// deriveRole — unchanged behaviour
// ─────────────────────────────────────────────
describe('deriveRole', () => {
  test('DRIVER for a Driver phone (normalized match)', async () => {
    expect(await deriveRole('+919333333333', 'PARENT')).toEqual({ ok: true, role: 'DRIVER' });
  });

  test('PARENT for a Student parentPhone (normalized match)', async () => {
    expect(await deriveRole(PARENT_PHONE)).toEqual({ ok: true, role: 'PARENT' });
  });

  test('both roles: requested role is a hint, DRIVER preferred otherwise', async () => {
    expect((await deriveRole(BOTH_PHONE, 'PARENT')).role).toBe('PARENT');
    expect((await deriveRole(BOTH_PHONE, 'DRIVER')).role).toBe('DRIVER');
    expect((await deriveRole(BOTH_PHONE)).role).toBe('DRIVER');
    expect(await deriveRole(BOTH_PHONE, 'CONDUCTOR')).toMatchObject({ ok: false, status: 403 });
  });

  test('CONDUCTOR for a Conductor phone (normalized match)', async () => {
    expect(await deriveRole(CONDUCTOR_PHONE)).toEqual({ ok: true, role: 'CONDUCTOR' });
    expect(await deriveRole(CONDUCTOR_PHONE, 'CONDUCTOR')).toEqual({ ok: true, role: 'CONDUCTOR' });
  });

  test('CONDUCTOR request without a Conductor row is rejected', async () => {
    const r = await deriveRole(PARENT_PHONE, 'CONDUCTOR');
    expect(r).toEqual({
      ok: false, status: 403,
      message: 'This phone number is not registered as a conductor',
    });
  });

  test('PARENT for a Student parentPhone2 (normalized match)', async () => {
    expect(await deriveRole(PARENT2_PHONE)).toEqual({ ok: true, role: 'PARENT' });
  });

  test('ADMIN request is always rejected', async () => {
    expect(await deriveRole(DRIVER_PHONE, 'ADMIN')).toMatchObject({ ok: false, status: 403 });
  });

  test('DRIVER request without a Driver row is rejected', async () => {
    expect(await deriveRole(PARENT_PHONE, 'DRIVER')).toMatchObject({ ok: false, status: 403 });
  });

  test('unknown phone is rejected', async () => {
    const r = await deriveRole('9000000000', 'PARENT');
    expect(r).toMatchObject({ ok: false, status: 403 });
    expect(r.message).toMatch(/not registered with the school/);
  });
});

// ─────────────────────────────────────────────
// POST /api/auth/login — phone + password
// ─────────────────────────────────────────────
describe('POST /api/auth/login', () => {
  const login = (body) => request(app).post('/api/auth/login').send(body);

  test('creates the User with the derived role on first login', async () => {
    const res = await login({ phone: DRIVER_PHONE, role: 'PARENT', password: 'pass1234' });
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('DRIVER');
    expect(prisma.__store.users).toHaveLength(1);
    expect(prisma.__store.users[0]).toMatchObject({ phone: DRIVER_PHONE, role: 'DRIVER' });

    const payload = jwt.verify(res.body.token, 'test-jwt-secret');
    expect(payload).toMatchObject({ role: 'DRIVER', phone: DRIVER_PHONE, id: res.body.user.id });
  });

  test('stores a bcrypt hash of the password on first login', async () => {
    await login({ phone: DRIVER_PHONE, password: 'mySecret!' });
    const stored = prisma.__store.users[0].password;
    expect(stored).toMatch(/^\$2[aby]\$/);
    expect(await bcrypt.compare('mySecret!', stored)).toBe(true);
  });

  test('verifies the password on subsequent logins', async () => {
    // First login — creates user
    await login({ phone: DRIVER_PHONE, password: 'correct' });
    // Second login — correct password
    const ok = await login({ phone: DRIVER_PHONE, role: 'DRIVER', password: 'correct' });
    expect(ok.status).toBe(200);
    // Wrong password
    const bad = await login({ phone: DRIVER_PHONE, password: 'wrong' });
    expect(bad.status).toBe(401);
    expect(bad.body.message).toMatch(/incorrect password/i);
  });

  test('missing password returns 400', async () => {
    const res = await login({ phone: DRIVER_PHONE });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/password/i);
  });

  test('missing phone returns 400', async () => {
    const res = await login({ password: 'pass' });
    expect(res.status).toBe(400);
  });

  test('replaces a stale stored role with the derived one and updates fcmToken', async () => {
    // Pre-create a user with a bcrypt hash
    const hash = await bcrypt.hash('pass1234', 4);
    prisma.__reset({
      drivers:  prisma.__store.drivers,
      students: prisma.__store.students,
      users: [{ id: 'u-old', phone: PARENT_PHONE, role: 'DRIVER', password: hash, fcmToken: 'old' }],
    });
    const res = await login({ phone: PARENT_PHONE, role: 'PARENT', password: 'pass1234', fcmToken: 'new' });
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('PARENT');
    expect(prisma.__store.users[0]).toMatchObject({ role: 'PARENT', fcmToken: 'new' });
  });

  test('finds an existing User by normalized phone', async () => {
    const hash = await bcrypt.hash('pass1234', 4);
    prisma.__reset({
      drivers:  prisma.__store.drivers,
      students: prisma.__store.students,
      users: [{ id: 'u-fmt', phone: '+91 91111 11111', role: 'PARENT', password: hash }],
    });
    const res = await login({ phone: PARENT_PHONE, password: 'pass1234' });
    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe('u-fmt');
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  test('client ADMIN role is rejected with 403', async () => {
    const res = await login({ phone: DRIVER_PHONE, role: 'ADMIN', password: 'pass' });
    expect(res.status).toBe(403);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  test('DRIVER request without a Driver row gets 403', async () => {
    const res = await login({ phone: PARENT_PHONE, role: 'DRIVER', password: 'pass' });
    expect(res.status).toBe(403);
  });

  test('a conductor logs in as CONDUCTOR with the assigned bus', async () => {
    const res = await login({ phone: CONDUCTOR_PHONE, role: 'CONDUCTOR', password: 'pass1234' });
    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({
      role: 'CONDUCTOR', conductorId: 'c1', name: 'Meena', busId: 'b1', busNo: 'B-1',
    });
  });

  test('unknown phone gets 403', async () => {
    const res = await login({ phone: '9000000000', role: 'PARENT', password: 'pass' });
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/not registered with the school/);
  });

  test('a parent with two children on different buses gets children[]', async () => {
    prisma.__reset({
      buses: prisma.__store.buses,
      students: [
        { id: 'k1', name: 'Aarav', class: '3A', busId: 'b1', stopId: 'st1', dropStopId: 'st9',
          parentPhone: '9000000099', parentPhone2: '+91 97777 77777' },
        { id: 'k2', name: 'Diya',  class: '5B', busId: 'b2', stopId: 'st2', dropStopId: null,
          parentPhone: '0-97777-77777', parentPhone2: null },
      ],
    });
    const res = await login({ phone: PARENT2_PHONE, password: 'pass1234' });
    expect(res.status).toBe(200);
    const { user } = res.body;
    expect(user.role).toBe('PARENT');
    expect(user.children).toEqual([
      { id: 'k1', name: 'Aarav', busId: 'b1', busNo: 'B-1', stopId: 'st1', dropStopId: 'st9', class: '3A' },
      { id: 'k2', name: 'Diya',  busId: 'b2', busNo: 'B-2', stopId: 'st2', dropStopId: null,  class: '5B' },
    ]);
  });
});

// ─────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────
describe('POST /api/auth/register', () => {
  const register = (body) => request(app).post('/api/auth/register').send(body);

  test('creates the User with the derived role, ignoring the client role', async () => {
    const res = await register({ phone: PARENT_PHONE, name: 'Asha', role: 'DRIVER', password: 'pass1234' });
    // DRIVER requested without a Driver row -> 403, nothing persisted
    expect(res.status).toBe(403);
    expect(prisma.__store.users).toHaveLength(0);

    const ok = await register({ phone: PARENT_PHONE, name: 'Asha', role: 'SUPERUSER', password: 'pass1234' });
    expect(ok.status).toBe(201);
    expect(prisma.__store.users[0]).toMatchObject({ phone: PARENT_PHONE, name: 'Asha', role: 'PARENT' });
  });

  test('an existing User is signed in on re-register (same password)', async () => {
    await register({ phone: DRIVER_PHONE, name: 'Ravi', password: 'pass1234' });
    const again = await register({ phone: DRIVER_PHONE, name: 'Ravi', password: 'pass1234' });
    expect(again.status).toBe(200);
    expect(again.body.user.role).toBe('DRIVER');
    expect(prisma.__store.users).toHaveLength(1);
  });

  test('missing password returns 400', async () => {
    expect((await register({ phone: DRIVER_PHONE, name: 'Ravi' })).status).toBe(400);
  });
});

// ─────────────────────────────────────────────
// POST /api/auth/admin-login (unchanged)
// ─────────────────────────────────────────────
describe('POST /api/auth/admin-login', () => {
  const adminLogin = (body) => request(app).post('/api/auth/admin-login').send(body);

  test('accepts a correct password against a bcrypt hash', async () => {
    const hash = await bcrypt.hash('s3cret-pass', 4);
    prisma.__reset({ admins: [{ id: 'a1', email: 'admin@school.test', name: 'Admin', password: hash }] });
    const res = await adminLogin({ email: 'admin@school.test', password: 's3cret-pass' });
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('ADMIN');
    expect(jwt.verify(res.body.token, 'test-jwt-secret').role).toBe('ADMIN');
    expect(prisma.admin.update).not.toHaveBeenCalled();
  });

  test('rejects a wrong password', async () => {
    const hash = await bcrypt.hash('s3cret-pass', 4);
    prisma.__reset({ admins: [{ id: 'a1', email: 'admin@school.test', name: 'Admin', password: hash }] });
    expect((await adminLogin({ email: 'admin@school.test', password: 'nope' })).status).toBe(401);
  });

  test('lazily rehashes a correct legacy plaintext password', async () => {
    prisma.__reset({ admins: [{ id: 'a1', email: 'admin@school.test', name: 'Admin', password: 'legacy-pass' }] });
    const res = await adminLogin({ email: 'admin@school.test', password: 'legacy-pass' });
    expect(res.status).toBe(200);
    const stored = prisma.__store.admins[0].password;
    expect(stored).toMatch(/^\$2[aby]\$10\$/);
    expect(await bcrypt.compare('legacy-pass', stored)).toBe(true);
  });

  test('unknown email gets 401', async () => {
    prisma.__reset({ admins: [] });
    expect((await adminLogin({ email: 'x@y.z', password: 'p' })).status).toBe(401);
  });
});

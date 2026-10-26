// Property tests for server-derived roles and requireRole
// (Requirements 2.1–2.4, 2.10, 2.11, 3.1). OTP property removed.
// Prisma is an in-memory fake; FCM is mocked (Requirement 16.3).
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/testdb';
process.env.JWT_SECRET = 'test-jwt-secret';

jest.mock('../src/db', () => {
  const store = { users: [], drivers: [], conductors: [], students: [], buses: [] };
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
    admin:     { update: jest.fn() },
    bus: {
      findMany:   jest.fn(async ({ where } = {}) => {
        const ids = where?.id?.in;
        return store.buses.filter((b) => !ids || ids.includes(b.id)).map(clone);
      }),
      findUnique: jest.fn(async ({ where }) => clone(store.buses.find((b) => b.id === where.id))),
    },
    $queryRaw:   jest.fn(async () => []),
    $disconnect: jest.fn(),
  };
});

jest.mock('../src/services/notificationService', () => ({
  sendNotification: jest.fn(),
  sendMulticast: jest.fn(),
}));

const fc = require('fast-check');
const prisma = require('../src/db');
const { deriveRole, login } = require('../src/controllers/authController');
const { requireRole } = require('../src/middleware/requireRole');

const RUNS = { numRuns: 100 };

// ── Generators ──
const BASES = ['9680002257', '9876543210', '9123456780', '9000000001', '8800112233'];
const baseArb = fc.constantFrom(...BASES);

const formatPhone = (base, style) => {
  switch (style) {
    case 1: return `+91${base}`;
    case 2: return `+91 ${base.slice(0, 5)} ${base.slice(5)}`;
    case 3: return `91${base}`;
    case 4: return `0${base}`;
    case 5: return `${base.slice(0, 3)}-${base.slice(3, 6)}-${base.slice(6)}`;
    default: return base;
  }
};
const styleArb = fc.integer({ min: 0, max: 5 });
const phoneOf = (b) => styleArb.map((s) => ({ base: b, phone: formatPhone(b, s) }));
const formattedPhoneArb = baseArb.chain(phoneOf);

const requestedRoleArb = fc.oneof(
  fc.constantFrom('DRIVER', 'driver', 'PARENT', 'parent', 'ADMIN', 'admin', 'Admin',
    'CONDUCTOR', 'conductor', 'Conductor'),
  fc.constant(undefined),
  fc.constant(null),
  fc.constant(''),
  fc.string({ maxLength: 8 }),
);

const BUS_IDS = ['bus-1', 'bus-2'];
const busIdArb = fc.option(fc.constantFrom(...BUS_IDS), { nil: null });
const staffArb = fc.record({ p: formattedPhoneArb, busId: busIdArb });
const studentArb = fc.record({
  p1: formattedPhoneArb,
  p2: fc.oneof(
    { weight: 1, arbitrary: fc.constant(null) },
    { weight: 1, arbitrary: fc.constant({ base: null, phone: '' }) },
    { weight: 3, arbitrary: formattedPhoneArb },
  ),
  busId: busIdArb,
});

const scenarioArb = fc.record({
  drivers:    fc.array(staffArb,   { maxLength: 3 }),
  conductors: fc.array(staffArb,   { maxLength: 3 }),
  students:   fc.array(studentArb, { maxLength: 4 }),
  login:      formattedPhoneArb,
  requested:  requestedRoleArb,
  existingRole: fc.option(fc.constantFrom('DRIVER', 'PARENT', 'ADMIN', 'CONDUCTOR'), { nil: undefined }),
});

function expectedRole({ drivers, conductors, students, login: who, requested }) {
  const req = requested ? String(requested).toUpperCase() : null;
  const isDriver    = drivers.some((d) => d.p.base === who.base);
  const isConductor = conductors.some((c) => c.p.base === who.base);
  const isParent    = students.some((s) => s.p1.base === who.base || (s.p2 && s.p2.base === who.base));
  if (req === 'ADMIN') return null;
  if (req === 'DRIVER'    && !isDriver)    return null;
  if (req === 'CONDUCTOR' && !isConductor) return null;
  const derived = [];
  if (isDriver)    derived.push('DRIVER');
  if (isConductor) derived.push('CONDUCTOR');
  if (isParent)    derived.push('PARENT');
  if (derived.length === 0) return null;
  return derived.includes(req) ? req : derived[0];
}

function seed({ drivers, conductors, students, login: who, existingRole }) {
  prisma.__reset({
    drivers:    drivers.map((d, i)    => ({ id: `d${i}`, phone: d.p.phone, busId: d.busId })),
    conductors: conductors.map((c, i) => ({ id: `c${i}`, name: `Conductor ${i}`, phone: c.p.phone, busId: c.busId })),
    students:   students.map((s, i)   => ({
      id: `s${i}`, name: `Student ${i}`,
      parentPhone:  s.p1.phone,
      parentPhone2: s.p2 ? s.p2.phone : null,
      busId: s.busId,
    })),
    buses: BUS_IDS.map((id, i) => ({ id, busNo: `RJ-${i + 1}` })),
    users: existingRole ? [{ id: 'existing', phone: who.phone, role: existingRole, password: null }] : [],
  });
}

function mockRes() {
  const res = { statusCode: 200, body: undefined };
  res.status = jest.fn((code) => { res.statusCode = code; return res; });
  res.json   = jest.fn((body) => { res.body = body; return res; });
  return res;
}

beforeAll(() => { jest.spyOn(console, 'log').mockImplementation(() => {}); });
afterAll(()  => { console.log.mockRestore(); });

describe('authProperties', () => {
  // Property 1: Role is derived from server data only (Requirements 2.1–2.4, 2.10, 2.11)
  test('Property 1: role is derived from server data only', async () => {
    await fc.assert(
      fc.asyncProperty(scenarioArb, async (scenario) => {
        seed(scenario);
        const expected = expectedRole(scenario);

        const result = await deriveRole(scenario.login.phone, scenario.requested);
        if (expected === null) {
          expect(result.ok).toBe(false);
          expect(result.status).toBe(403);
        } else {
          expect(result).toEqual({ ok: true, role: expected });
        }

        // Login flow: any non-empty password is accepted for a new user.
        const res = mockRes();
        await login(
          { body: { phone: scenario.login.phone, password: 'testpass123', role: scenario.requested } },
          res,
        );
        if (expected === null) {
          expect(res.statusCode).toBe(403);
          expect(prisma.__store.users.some((u) => u.role !== scenario.existingRole)).toBe(false);
        } else {
          expect(res.statusCode).toBe(200);
          expect(res.body.user.role).toBe(expected);
          expect(prisma.__store.users).toHaveLength(1);
          expect(prisma.__store.users[0].role).toBe(expected);
        }
      }),
      RUNS,
    );
  });

  // Property 2: requireRole allows exactly the listed roles (Requirement 3.1)
  test('Property 2: requireRole calls next iff the role is listed, else 403', () => {
    const roleArb = fc.oneof(
      fc.constantFrom('ADMIN', 'DRIVER', 'PARENT', 'CONDUCTOR', 'admin'),
      fc.string({ maxLength: 8 }),
    );
    fc.assert(
      fc.property(
        fc.option(roleArb, { nil: undefined }),
        fc.array(roleArb, { maxLength: 4 }),
        (role, allowed) => {
          const req  = { user: role === undefined ? { id: 'u1' } : { id: 'u1', role } };
          const res  = mockRes();
          const next = jest.fn();
          requireRole(...allowed)(req, res, next);

          const permitted = role !== undefined && allowed.includes(role);
          if (permitted) {
            expect(next).toHaveBeenCalledTimes(1);
            expect(res.status).not.toHaveBeenCalled();
          } else {
            expect(next).not.toHaveBeenCalled();
            expect(res.statusCode).toBe(403);
          }
        },
      ),
      RUNS,
    );
  });
});

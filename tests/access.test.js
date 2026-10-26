// Unit tests for requireRole (Requirement 3.1) and accessService
// (Requirements 3.7, 4.2). Uses an in-memory fake Prisma; no DB access.
const { requireRole } = require('../src/middleware/requireRole');
const { createAccessService, normalizePhone } = require('../src/services/accessService');

function mockRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

function fakePrisma({ users = [], students = [], drivers = [], conductors = [] }) {
  return {
    user: {
      findUnique: jest.fn(async ({ where }) => {
        const u = users.find((x) => x.id === where.id);
        return u ? { phone: u.phone } : null;
      }),
    },
    student: { findMany: jest.fn(async () => students.map((s) => ({ ...s }))) },
    driver: { findMany: jest.fn(async () => drivers.map((d) => ({ ...d }))) },
    conductor: { findMany: jest.fn(async () => conductors.map((c) => ({ ...c }))) },
  };
}

describe('requireRole', () => {
  test('401 when there is no authenticated user', () => {
    const res = mockRes();
    const next = jest.fn();
    requireRole('ADMIN')({}, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('403 when the role is not allowed', () => {
    const res = mockRes();
    const next = jest.fn();
    requireRole('ADMIN', 'DRIVER')({ user: { id: 'u1', role: 'PARENT' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('403 when the role is missing on the user', () => {
    const res = mockRes();
    const next = jest.fn();
    requireRole('ADMIN')({ user: { id: 'u1' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('calls next when the role is allowed', () => {
    const res = mockRes();
    const next = jest.fn();
    requireRole('ADMIN', 'DRIVER')({ user: { id: 'u1', role: 'DRIVER' } }, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe('accessService', () => {
  const data = {
    users: [
      { id: 'p1', phone: '+91 96800 02257' },
      { id: 'p2', phone: '9111111111' },
      { id: 'p3', phone: '9222222222' },
      { id: 'd1', phone: '9333333333' },
      { id: 'd2', phone: '9444444444' },
      { id: 'p4', phone: '9555555555' },
      { id: 'c1', phone: '9666666666' },
      { id: 'c2', phone: '9777777777' },
    ],
    students: [
      { id: 's1', busId: 'b1', parentPhone: '9680002257' },
      { id: 's2', busId: 'b2', parentPhone: '919680002257' },
      { id: 's3', busId: 'b1', parentPhone: '96800-02257' },
      { id: 's4', busId: 'b3', parentPhone: '9111111111' },
      // p4 is the second parent of s5 and the first parent of s6.
      { id: 's5', busId: 'b4', parentPhone: '9000000099', parentPhone2: '+91 95555 55555' },
      { id: 's6', busId: 'b1', parentPhone: '95555-55555', parentPhone2: null },
    ],
    drivers: [
      { id: 'dr0', phone: '+91 93333 33333', busId: null },
      { id: 'dr1', phone: '+91 93333 33333', busId: 'b1' },
      { id: 'dr2', phone: '9444444444', busId: null },
    ],
    conductors: [
      { id: 'co0', phone: '+91 96666 66666', busId: null },
      { id: 'co1', phone: '96666-66666', busId: 'b2' },
      { id: 'co2', phone: '9777777777', busId: null },
    ],
  };
  const parent1 = { id: 'p1', role: 'PARENT' };
  const parent2 = { id: 'p2', role: 'PARENT' };
  const parentNoKids = { id: 'p3', role: 'PARENT' };
  const driver1 = { id: 'd1', role: 'DRIVER' };
  const driverNoBus = { id: 'd2', role: 'DRIVER' };
  const admin = { id: 'a1', role: 'ADMIN' };
  const parentBoth = { id: 'p4', role: 'PARENT' };
  const conductor1 = { id: 'c1', role: 'CONDUCTOR' };
  const conductorNoBus = { id: 'c2', role: 'CONDUCTOR' };

  let access;
  beforeEach(() => {
    access = createAccessService(fakePrisma(data));
  });

  test('normalizePhone keeps the last 10 digits', () => {
    expect(normalizePhone('+91 96800 02257')).toBe('9680002257');
    expect(normalizePhone('919680002257')).toBe('9680002257');
    expect(normalizePhone(null)).toBe('');
  });

  test('getParentStudents matches parentPhone after normalization', async () => {
    const ids = (await access.getParentStudents(parent1)).map((s) => s.id).sort();
    expect(ids).toEqual(['s1', 's2', 's3']);
    expect((await access.getParentStudents(parent2)).map((s) => s.id)).toEqual(['s4']);
    expect(await access.getParentStudents(parentNoKids)).toEqual([]);
  });

  test('getParentStudents returns nothing for non-parents or unknown users', async () => {
    expect(await access.getParentStudents(admin)).toEqual([]);
    expect(await access.getParentStudents({ id: 'nobody', role: 'PARENT' })).toEqual([]);
  });

  test('getDriverForUser prefers the row with an assigned bus', async () => {
    expect((await access.getDriverForUser(driver1)).id).toBe('dr1');
    expect((await access.getDriverForUser(driverNoBus)).id).toBe('dr2');
    expect(await access.getDriverForUser(parent1)).toBeNull();
  });

  test('canViewBus: ADMIN sees every bus', async () => {
    expect(await access.canViewBus(admin, 'b1')).toBe(true);
    expect(await access.canViewBus(admin, 'anything')).toBe(true);
  });

  test('canViewBus: DRIVER only their assigned bus', async () => {
    expect(await access.canViewBus(driver1, 'b1')).toBe(true);
    expect(await access.canViewBus(driver1, 'b2')).toBe(false);
    expect(await access.canViewBus(driverNoBus, 'b1')).toBe(false);
  });

  test('canViewBus: PARENT only buses of their children', async () => {
    expect(await access.canViewBus(parent1, 'b1')).toBe(true);
    expect(await access.canViewBus(parent1, 'b2')).toBe(true);
    expect(await access.canViewBus(parent1, 'b3')).toBe(false);
    expect(await access.canViewBus(parent2, 'b1')).toBe(false);
  });

  test('getParentStudents also matches parentPhone2 (normalized)', async () => {
    const ids = (await access.getParentStudents(parentBoth)).map((s) => s.id).sort();
    expect(ids).toEqual(['s5', 's6']);
    expect(await access.canViewBus(parentBoth, 'b4')).toBe(true);
    expect((await access.roomsForUser(parentBoth)).sort()).toEqual(['bus_b1', 'bus_b4']);
  });

  test('getConductorForUser prefers the row with an assigned bus', async () => {
    expect((await access.getConductorForUser(conductor1)).id).toBe('co1');
    expect((await access.getConductorForUser(conductorNoBus)).id).toBe('co2');
    expect(await access.getConductorForUser(driver1)).toBeNull();
    expect(await access.getConductorForUser({ id: 'nobody', role: 'CONDUCTOR' })).toBeNull();
  });

  test('canViewBus: CONDUCTOR only their assigned bus', async () => {
    expect(await access.canViewBus(conductor1, 'b2')).toBe(true);
    expect(await access.canViewBus(conductor1, 'b1')).toBe(false);
    expect(await access.canViewBus(conductorNoBus, 'b1')).toBe(false);
    expect(await access.canViewBus({ id: 'x', role: 'CONDUCTOR' }, 'b1')).toBe(false);
  });

  test('roomsForUser: CONDUCTOR gets its bus room, none without a bus', async () => {
    expect(await access.roomsForUser(conductor1)).toEqual(['bus_b2']);
    expect(await access.roomsForUser(conductorNoBus)).toEqual([]);
    expect(await access.roomsForUser({ id: 'x', role: 'CONDUCTOR' })).toEqual([]);
  });

  test('canViewBus: unknown role, no user or empty busId is false', async () => {
    expect(await access.canViewBus({ id: 'x', role: 'SUPERUSER' }, 'b1')).toBe(false);
    expect(await access.canViewBus(null, 'b1')).toBe(false);
    expect(await access.canViewBus(admin, '')).toBe(false);
  });

  test('roomsForUser per role', async () => {
    expect(await access.roomsForUser(admin)).toEqual(['admins']);
    expect(await access.roomsForUser(driver1)).toEqual(['bus_b1']);
    expect(await access.roomsForUser(driverNoBus)).toEqual([]);
    expect((await access.roomsForUser(parent1)).sort()).toEqual(['bus_b1', 'bus_b2']);
    expect(await access.roomsForUser(parentNoKids)).toEqual([]);
    expect(await access.roomsForUser(null)).toEqual([]);
  });

  test('uses phone from the JWT payload without a User lookup when present', async () => {
    const prisma = fakePrisma(data);
    const svc = createAccessService(prisma);
    const ids = (await svc.getParentStudents({ id: 'zzz', role: 'PARENT', phone: '9111111111' })).map((s) => s.id);
    expect(ids).toEqual(['s4']);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });
});

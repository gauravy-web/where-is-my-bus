// School settings routes: GET/PUT /api/school (task 16.2, Requirements 6.11, 6.13).
// Prisma is an in-memory fake holding the School rows; FCM is mocked.
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/testdb';
process.env.JWT_SECRET = 'test-jwt-secret';

jest.mock('../src/db', () => {
  const state = { schools: [], seq: 0 };
  const clone = (x) => (x ? { ...x } : null);
  const school = {
    findFirst: jest.fn(async () => clone(state.schools[0])),
    create: jest.fn(async ({ data }) => {
      state.seq += 1;
      const row = { id: `sch-${state.seq}`, ...data };
      state.schools.push(row);
      return clone(row);
    }),
    update: jest.fn(async ({ where, data }) => {
      const row = state.schools.find((r) => r.id === where.id);
      if (!row) throw Object.assign(new Error('Record not found'), { code: 'P2025' });
      Object.assign(row, data);
      return clone(row);
    }),
  };
  return {
    __state: state,
    __reset: () => { state.schools = []; state.seq = 0; },
    school,
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
const app = require('../src/app');

const sign = (payload) => `Bearer ${jwt.sign(payload, 'test-jwt-secret')}`;
const ADMIN = sign({ id: 'a1', role: 'ADMIN' });
const OTHERS = {
  PARENT: sign({ id: 'u-parent', role: 'PARENT', phone: '9111111111' }),
  DRIVER: sign({ id: 'u-driver', role: 'DRIVER', phone: '9333333333' }),
  CONDUCTOR: sign({ id: 'u-conductor', role: 'CONDUCTOR', phone: '9555555555' }),
};

// Test fixture only: Krishna Public School as an admin would enter it.
const KPS = { name: 'Krishna Public School', lat: 21.24007759960864, lng: 81.32025012026357 };

const getSchool = (auth = ADMIN) => {
  const req = request(app).get('/api/school');
  return auth ? req.set('Authorization', auth) : req;
};
const putSchool = (body, auth = ADMIN) => {
  const req = request(app).put('/api/school');
  return (auth ? req.set('Authorization', auth) : req).send(body);
};

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

beforeEach(() => {
  prisma.__reset();
  jest.clearAllMocks();
});

describe('ADMIN-only access', () => {
  test('401 without a token', async () => {
    expect((await getSchool(null)).status).toBe(401);
    expect((await putSchool(KPS, null)).status).toBe(401);
  });

  test.each(Object.keys(OTHERS))('403 for %s and nothing is written', async (role) => {
    expect((await getSchool(OTHERS[role])).status).toBe(403);
    expect((await putSchool(KPS, OTHERS[role])).status).toBe(403);
    expect(prisma.school.create).not.toHaveBeenCalled();
    expect(prisma.school.update).not.toHaveBeenCalled();
    expect(prisma.__state.schools).toHaveLength(0);
  });
});

describe('GET then PUT create then PUT update', () => {
  test('keeps exactly one School row', async () => {
    const empty = await getSchool();
    expect(empty.status).toBe(200);
    expect(empty.body).toEqual({ success: true, school: null });

    const created = await putSchool({
      ...KPS, lat: String(KPS.lat), lng: String(KPS.lng), address: ' Bhilai ', contactPhone: '+91 90909-09090',
    });
    expect(created.status).toBe(200);
    expect(created.body.success).toBe(true);
    expect(created.body.school).toMatchObject({
      name: 'Krishna Public School', address: 'Bhilai', lat: KPS.lat, lng: KPS.lng, contactPhone: '9090909090',
    });
    expect(prisma.__state.schools).toHaveLength(1);
    const { id } = created.body.school;

    const read = await getSchool();
    expect(read.body.school).toEqual(created.body.school);

    const updated = await putSchool({ name: ' KPS ', lat: 21.25, lng: 81.33, contactPhone: '09123456780', address: '' });
    expect(updated.status).toBe(200);
    expect(updated.body.school).toMatchObject({
      id, name: 'KPS', lat: 21.25, lng: 81.33, contactPhone: '9123456780', address: null,
    });
    expect(prisma.__state.schools).toHaveLength(1);
    expect(prisma.school.create).toHaveBeenCalledTimes(1);
    expect(prisma.school.update).toHaveBeenCalledTimes(1);
  });

  test('contactPhone is optional and accepts the 91 prefix', async () => {
    const res = await putSchool(KPS);
    expect(res.status).toBe(200);
    expect(res.body.school).toMatchObject({ ...KPS, contactPhone: null, address: null });

    const withPhone = await putSchool({ ...KPS, contactPhone: '919988776655' });
    expect(withPhone.body.school.contactPhone).toBe('9988776655');
  });
});

describe('validation', () => {
  test.each([
    ['missing name', { lat: 21, lng: 81 }],
    ['blank name', { name: '   ', lat: 21, lng: 81 }],
    ['missing lat', { name: 'S', lng: 81 }],
    ['empty lat', { name: 'S', lat: '', lng: 81 }],
    ['non-numeric lat', { name: 'S', lat: 'abc', lng: 81 }],
    ['lat above 90', { name: 'S', lat: 90.5, lng: 81 }],
    ['lat below -90', { name: 'S', lat: -91, lng: 81 }],
    ['missing lng', { name: 'S', lat: 21 }],
    ['lng above 180', { name: 'S', lat: 21, lng: 180.1 }],
    ['lng below -180', { name: 'S', lat: 21, lng: '-181' }],
    ['short phone', { name: 'S', lat: 21, lng: 81, contactPhone: '12345' }],
    ['letters in phone', { name: 'S', lat: 21, lng: 81, contactPhone: '98765abcde' }],
  ])('400 for %s and nothing is written', async (_label, body) => {
    const res = await putSchool(body);
    expect(res.status).toBe(400);
    expect(typeof res.body.message).toBe('string');
    expect(prisma.school.create).not.toHaveBeenCalled();
    expect(prisma.school.update).not.toHaveBeenCalled();
  });
});

// Task 16.3 — remaining cases (Requirements 6.11, 6.13).
describe('task 16.3 additions', () => {
  const seed = (row) => { prisma.__state.schools.push({ ...row }); prisma.__state.seq = 1; };

  test('ADMIN GET returns the stored row as-is', async () => {
    seed({ id: 'sch-1', name: 'Stored', address: null, lat: 10.5, lng: 20.25, contactPhone: null });
    const res = await getSchool();
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      school: { id: 'sch-1', name: 'Stored', address: null, lat: 10.5, lng: 20.25, contactPhone: null },
    });
  });

  test('PUT updates a pre-existing row instead of creating a second one', async () => {
    seed({ id: 'sch-1', name: 'Old', address: 'Addr', lat: 1, lng: 2, contactPhone: '9000000000' });
    const res = await putSchool(KPS);
    expect(res.status).toBe(200);
    expect(prisma.school.create).not.toHaveBeenCalled();
    expect(prisma.school.update).toHaveBeenCalledWith({ where: { id: 'sch-1' }, data: KPS });
    // Omitted optional fields keep their stored values.
    expect(res.body.school).toEqual({ id: 'sch-1', ...KPS, address: 'Addr', contactPhone: '9000000000' });
    expect(prisma.__state.schools).toHaveLength(1);
  });

  test.each([
    ['lat 90, lng 180', 90, 180],
    ['lat -90, lng -180', -90, -180],
    ['lat 0, lng 0', 0, 0],
    ['string boundaries', '-90', ' 180 '],
  ])('accepts boundary coordinates (%s)', async (_label, lat, lng) => {
    const res = await putSchool({ name: 'S', lat, lng });
    expect(res.status).toBe(200);
    expect(res.body.school).toMatchObject({ lat: Number(lat), lng: Number(lng) });
  });

  test.each([
    ['NaN-like lat', { name: 'S', lat: 'NaN', lng: 81 }],
    ['Infinity lng', { name: 'S', lat: 21, lng: 'Infinity' }],
    ['boolean lat', { name: 'S', lat: true, lng: 81 }],
    ['array lng', { name: 'S', lat: 21, lng: [81] }],
    ['null lat', { name: 'S', lat: null, lng: 81 }],
    ['number name', { name: 5, lat: 21, lng: 81 }],
    ['non-text address', { name: 'S', lat: 21, lng: 81, address: 42 }],
  ])('400 for %s and nothing is written', async (_label, body) => {
    const res = await putSchool(body);
    expect(res.status).toBe(400);
    expect(prisma.school.create).not.toHaveBeenCalled();
    expect(prisma.school.update).not.toHaveBeenCalled();
  });

  test('a database failure returns 500 without leaking details', async () => {
    prisma.school.findFirst.mockRejectedValueOnce(new Error('connection refused at 10.0.0.1'));
    const res = await getSchool();
    expect(res.status).toBe(500);
    expect(JSON.stringify(res.body)).not.toMatch(/10\.0\.0\.1|connection refused/);
  });

  test('the school coordinates are not hardcoded in the backend source', () => {
    const fs = require('fs');
    const path = require('path');
    // Every hand-written .js file under src/ (the generated Prisma client is skipped).
    const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) return e.name === 'generated' ? [] : walk(p);
      return e.name.endsWith('.js') ? [p] : [];
    });
    const files = walk(path.join(__dirname, '../src'));
    expect(files.length).toBeGreaterThan(10);
    for (const file of files) {
      const src = fs.readFileSync(file, 'utf8');
      expect(src).not.toMatch(/21\.2400775|81\.3202501/);
    }
  });
});

// Smoke tests for the School_Sheet import routes (task 15.3; full example tests are task 15.5).
// Prisma is an in-memory fake and FCM is mocked. The fixture is built in the test with exceljs;
// the school's real sheet is never read.
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/testdb';
process.env.JWT_SECRET = 'test-jwt-secret';

jest.mock('../src/db', () => {
  const state = {};
  let seq = 0;
  const clone = (x) => (x ? { ...x } : null);
  const matches = (row, where = {}) => Object.entries(where || {}).every(([k, cond]) => {
    if (cond && typeof cond === 'object') {
      if ('in' in cond) return cond.in.includes(row[k]);
      if ('not' in cond) return row[k] !== cond.not;
    }
    return row[k] === cond;
  });
  const model = (key, prefix) => ({
    findUnique: jest.fn(async ({ where }) => clone(state[key].find((r) => matches(r, where)))),
    findFirst: jest.fn(async (args = {}) => clone(state[key].find((r) => matches(r, args.where)))),
    findMany: jest.fn(async (args = {}) => state[key].filter((r) => matches(r, args.where)).map(clone)),
    create: jest.fn(async ({ data }) => {
      seq += 1;
      const row = { id: `${prefix}-${seq}`, ...data };
      state[key].push(row);
      return clone(row);
    }),
    update: jest.fn(async ({ where, data }) => {
      const row = state[key].find((r) => r.id === where.id);
      if (!row) throw Object.assign(new Error('Record not found'), { code: 'P2025' });
      Object.assign(row, data);
      return clone(row);
    }),
    updateMany: jest.fn(async ({ where, data }) => {
      const rows = state[key].filter((r) => matches(r, where));
      rows.forEach((r) => Object.assign(r, data));
      return { count: rows.length };
    }),
    deleteMany: jest.fn(async ({ where }) => {
      const before = state[key].length;
      state[key] = state[key].filter((r) => !matches(r, where));
      return { count: before - state[key].length };
    }),
  });
  const reset = () => {
    seq = 0;
    state.buses = [{ id: 'b1', busNo: 'RJ 37 PJ 5689', label: 'old', driverName: 'Old', status: 'ACTIVE' }];
    state.drivers = [{ id: 'd-old', name: 'Old Driver', phone: '9000000001', busId: 'b1' }];
    state.conductors = [];
    state.schools = [{ id: 'sch1', name: 'Old School', lat: 21.24, lng: 81.32, contactPhone: null }];
    state.students = [
      { id: 's-a101', name: 'Rahul K', admissionNo: 'A101', busId: 'b9', parentPhone: '9000000000', stopId: null, dropStopId: null },
      { id: 's-old', name: 'Left', admissionNo: 'Z9', busId: 'b1', parentPhone: '9000000002', stopId: 'st-old-p', dropStopId: 'st-old-d' },
    ];
    state.stops = [
      { id: 'st-old-p', busId: 'b1', name: 'Old – pickup', lat: 1, lng: 1, order: 1, direction: 'PICKUP', studentId: 's-old' },
      { id: 'st-old-d', busId: 'b1', name: 'Old – drop', lat: 1, lng: 1, order: 1, direction: 'DROP', studentId: 's-old' },
    ];
    state.trips = [];
    state.users = [];
  };
  reset();
  const prisma = {
    __state: state,
    __reset: reset,
    bus: model('buses', 'bus'),
    driver: model('drivers', 'drv'),
    conductor: model('conductors', 'con'),
    school: model('schools', 'sch'),
    student: model('students', 'stu'),
    stop: model('stops', 'stop'),
    trip: model('trips', 'trip'),
    user: model('users', 'usr'),
    $queryRaw: jest.fn(async () => []),
    $disconnect: jest.fn(),
  };
  prisma.$transaction = jest.fn(async (fn) => fn(prisma));
  return prisma;
});

jest.mock('../src/services/notificationService', () => ({
  sendNotification: jest.fn(async () => undefined),
  sendMulticast: jest.fn(async () => undefined),
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const ExcelJS = require('exceljs');
const prisma = require('../src/db');
const app = require('../src/app');

const sign = (payload) => `Bearer ${jwt.sign(payload, 'test-jwt-secret')}`;
const ADMIN = sign({ id: 'a1', role: 'ADMIN' });
const ADMIN2 = sign({ id: 'a2', role: 'ADMIN' });
const PARENT = sign({ id: 'u-parent', role: 'PARENT', phone: '9111111111' });

const HEADERS = [
  'Serial Number', 'Name of the Student', 'Roll Number', "Father's Name", "Mother's Name",
  'Parent Contact Number 1', 'Parent Contact Number 2', 'Bus Alloted', 'Bus Number', 'Driver Name',
  'Assistant Driver Name', 'Pick up Location With (Coordinates From Google Map)',
  'Drop Location with (Coordinates From Google Map)', 'School Name', 'Driver Contact Number',
  'Assistant Driver Contact Number', 'School Authorities Contact Number', 'Pick up order', 'Drop Order',
];
const shared = ['5', 'RJ 37 PJ 5689', 'kalu', 'Rohan'];
const school = ['Krishna Public School', 9123456780, 9988776655, 9090909090];
// Pickup orders 1,2,3; drop orders 2,3,1. Row 3 has a numeric Roll Number.
const ROWS = [
  [1, 'Rahul', 'A101', 'Mr R', 'Mrs R', 9876543210, null, ...shared, '21.25, 81.63', '21.26, 81.64', ...school, 1, 2],
  [2, 'Priya', 12345685, 'Mr P', 'Mrs P', 9876543211, 9876543212, ...shared, '21.27, 81.65', '21.28, 81.66', ...school, 2, 3],
  [3, 'Amit', 'A103', 'Mr A', 'Mrs A', 9876543213, null, ...shared, '21.29, 81.67', '21.30, 81.68', ...school, 3, 1],
];

async function xlsxBuffer() {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Sheet1');
  ws.addRow(HEADERS);
  ROWS.forEach((r) => ws.addRow(r));
  return Buffer.from(await wb.xlsx.writeBuffer());
}

function csvBuffer() {
  const quote = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [HEADERS, ...ROWS].map((r) => r.map(quote).join(','));
  return Buffer.from(`\uFEFF${lines.join('\r\n')}\r\n`, 'utf8');
}

const preview = (buffer, filename, auth = ADMIN) => request(app)
  .post('/api/import/school-sheet/preview')
  .set('Authorization', auth)
  .attach('file', buffer, filename);

const WRITE_METHODS = ['create', 'update', 'updateMany', 'deleteMany'];
const MODELS = ['bus', 'driver', 'conductor', 'school', 'student', 'stop', 'trip'];
const writeCalls = () => MODELS.flatMap((m) => WRITE_METHODS.map((w) => prisma[m][w].mock.calls.length))
  .reduce((a, b) => a + b, 0);

beforeEach(() => {
  prisma.__reset();
  jest.clearAllMocks();
});

describe('ADMIN-only access', () => {
  test('preview and confirm: 401 without token, 403 for PARENT', async () => {
    const buf = csvBuffer();
    expect((await request(app).post('/api/import/school-sheet/preview').attach('file', buf, 's.csv')).status).toBe(401);
    expect((await preview(buf, 's.csv', PARENT)).status).toBe(403);
    expect((await request(app).post('/api/import/school-sheet/confirm').send({ previewToken: 'x' })).status).toBe(401);
    expect((await request(app).post('/api/import/school-sheet/confirm')
      .set('Authorization', PARENT).send({ previewToken: 'x' })).status).toBe(403);
  });
});

describe('preview', () => {
  test('xlsx preview is confirmable, follows sheet orders and writes nothing', async () => {
    const res = await preview(await xlsxBuffer(), 'Bus 5.xlsx');
    expect(res.status).toBe(200);
    expect(res.body.canConfirm).toBe(true);
    expect(res.body.blockers).toEqual([]);
    expect(res.body.previewToken).toMatch(/^[0-9a-f]{64}$/);
    expect(res.body.rows).toHaveLength(3);
    expect(res.body.rows.map((r) => r.row)).toEqual([2, 3, 4]);
    expect(res.body.rows[1].rollNo).toBe('12345685');
    expect(res.body.pickupStops.map((s) => s.name)).toEqual(['Rahul – pickup', 'Priya – pickup', 'Amit – pickup']);
    expect(res.body.dropStops.map((s) => s.name)).toEqual(['Amit – drop', 'Rahul – drop', 'Priya – drop']);
    expect(res.body.notInSheet).toEqual([{ id: 's-old', name: 'Left', admissionNo: 'Z9' }]);
    expect(writeCalls()).toBe(0);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  test('equivalent CSV gives the same plan', async () => {
    const xlsx = await preview(await xlsxBuffer(), 'bus.xlsx');
    const csv = await preview(csvBuffer(), 'bus.csv');
    expect(csv.status).toBe(200);
    expect(csv.body.canConfirm).toBe(true);
    const pick = (b) => ({ students: b.students, pickupStops: b.pickupStops, dropStops: b.dropStops, bus: b.bus });
    expect(pick(csv.body)).toEqual(pick(xlsx.body));
    expect(writeCalls()).toBe(0);
  });
});

describe('confirm', () => {
  test('applies the plan in one transaction with stops in sheet order', async () => {
    const pre = await preview(await xlsxBuffer(), 'bus.xlsx');
    const res = await request(app).post('/api/import/school-sheet/confirm')
      .set('Authorization', ADMIN).send({ previewToken: pre.body.previewToken });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.result).toMatchObject({
      busId: 'b1', busNo: 'RJ 37 PJ 5689', created: 2, updated: 1, stops: { pickup: 3, drop: 3 }, clearedLinks: 2,
    });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);

    const { stops, students, drivers, conductors, schools, buses } = prisma.__state;
    const byName = Object.fromEntries(students.map((s) => [s.name, s]));
    const seq = (direction) => stops.filter((s) => s.direction === direction)
      .sort((a, b) => a.order - b.order)
      .map((s) => [s.order, s.name, s.studentId]);
    expect(seq('PICKUP')).toEqual([
      [1, 'Rahul – pickup', 's-a101'], [2, 'Priya – pickup', byName.Priya.id], [3, 'Amit – pickup', byName.Amit.id],
    ]);
    expect(seq('DROP')).toEqual([
      [1, 'Amit – drop', byName.Amit.id], [2, 'Rahul – drop', 's-a101'], [3, 'Priya – drop', byName.Priya.id],
    ]);
    expect(stops.every((s) => s.busId === 'b1')).toBe(true);
    expect(stops.find((s) => s.id === 'st-old-p')).toBeUndefined();

    for (const name of ['Rahul', 'Priya', 'Amit']) {
      const st = byName[name];
      expect(st.busId).toBe('b1');
      expect(stops.find((s) => s.id === st.stopId)).toMatchObject({ direction: 'PICKUP', studentId: st.id });
      expect(stops.find((s) => s.id === st.dropStopId)).toMatchObject({ direction: 'DROP', studentId: st.id });
    }
    expect(byName.Priya).toMatchObject({ admissionNo: '12345685', parentPhone: '9876543211', parentPhone2: '9876543212' });
    expect(byName.Left).toMatchObject({ busId: 'b1', stopId: null, dropStopId: null });

    expect(buses[0].label).toBe('5');
    expect(drivers.find((d) => d.id === 'd-old').busId).toBeNull();
    expect(drivers.find((d) => d.phone === '9123456780')).toMatchObject({ name: 'kalu', busId: 'b1' });
    expect(conductors).toEqual([expect.objectContaining({ name: 'Rohan', phone: '9988776655', busId: 'b1' })]);
    expect(schools[0]).toMatchObject({ name: 'Krishna Public School', contactPhone: '9090909090', lat: 21.24 });

    // The token is single-use.
    const again = await request(app).post('/api/import/school-sheet/confirm')
      .set('Authorization', ADMIN).send({ previewToken: pre.body.previewToken });
    expect(again.status).toBe(410);
  });

  test('unknown token or another admin gets 410', async () => {
    const unknown = await request(app).post('/api/import/school-sheet/confirm')
      .set('Authorization', ADMIN).send({ previewToken: 'f'.repeat(64) });
    expect(unknown.status).toBe(410);
    expect(unknown.body.message).toBe('Preview expired, upload the file again');

    const pre = await preview(csvBuffer(), 'bus.csv');
    const other = await request(app).post('/api/import/school-sheet/confirm')
      .set('Authorization', ADMIN2).send({ previewToken: pre.body.previewToken });
    expect(other.status).toBe(410);
    expect(writeCalls()).toBe(0);
  });
});

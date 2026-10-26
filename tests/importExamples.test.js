// Example tests for the School_Sheet importer end to end (task 15.5).
// Requirements 16.5, 17.1, 17.4, 17.12, 17.14, 17.15.
//
// Prisma is an in-memory fake (no database is ever contacted) and FCM is mocked.
// The sample-layout fixture is built in the test with exceljs plus an equivalent
// CSV; the school's real sheet is never read.
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
    state.buses = [{ id: 'b1', busNo: 'RJ 37 PJ 5689', label: null, driverName: 'Old', status: 'ACTIVE' }];
    state.drivers = [];
    state.conductors = [];
    state.schools = [{ id: 'sch1', name: 'Old School', lat: 21.24, lng: 81.32, contactPhone: null }];
    state.students = [];
    state.stops = [];
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
const JSZip = require('jszip');
const prisma = require('../src/db');
const app = require('../src/app');
const { readSheet } = require('../src/services/schoolSheetReader');
const { mapHeaders, HEADER_FIELDS } = require('../src/services/schoolSheetImporter');
const { createImportService } = require('../src/services/importService');

const sign = (payload) => `Bearer ${jwt.sign(payload, 'test-jwt-secret')}`;
const ADMIN = sign({ id: 'a1', role: 'ADMIN' });
const PARENT = sign({ id: 'u-parent', role: 'PARENT', phone: '9876543210' });
const DRIVER = sign({ id: 'u-driver', role: 'DRIVER', phone: '9111111111' });
const CONDUCTOR = sign({ id: 'u-conductor', role: 'CONDUCTOR', phone: '9222222222' });

// The exact header row of the school's sample sheet (19 columns).
const HEADERS = [
  'Serial Number', 'Name of the Student', 'Roll Number', "Father's Name", "Mother's Name",
  'Parent Contact Number 1', 'Parent Contact Number 2', 'Bus Alloted', 'Bus Number', 'Driver Name',
  'Assistant Driver Name', 'Pick up Location With (Coordinates From Google Map)',
  'Drop Location with (Coordinates From Google Map)', 'School Name', 'Driver Contact Number',
  'Assistant Driver Contact Number', 'School Authorities Contact Number', 'Pick up order', 'Drop Order',
];
const COL = Object.fromEntries(HEADERS.map((h, i) => [h, i]));

const DRIVER_PHONE = 9111111111;
const CONDUCTOR_PHONE = 9222222222;
const SCHOOL_PHONE = 9333333333;

// Sheet rows 2..4. Pickup orders 1,2,3 and drop orders 2,3,1. Latitude rises
// with pickup order but drop order 1 is the northernmost point, so neither
// sequence matches a geographic sort of the other.
// `conflictRow4` gives sheet row 4 a different Driver and Assistant Driver phone.
function sampleRows({ conflictRow4 = true } = {}) {
  const common = (driverPhone, conductorPhone) => ({
    busLabel: 5, busNo: 'RJ 37 PJ 5689', driver: 'kalu', assistant: 'Rohan',
    school: 'Krishna Public School', driverPhone, conductorPhone,
  });
  const rows = [
    { serial: 1, name: 'Rahul', roll: 'KPS-101', father: 'Ramesh', mother: 'Sita', p1: 9876543210, p2: null,
      pickup: '21.244718, 81.334927', drop: '21.252000, 81.341000', pOrder: 1, dOrder: 2,
      ...common(DRIVER_PHONE, CONDUCTOR_PHONE) },
    { serial: 2, name: 'Priya', roll: 12345685, father: 'Mohan', mother: 'Gita', p1: 9876500001, p2: 9876500002,
      pickup: '21.250001, 81.330002', drop: '21.248000, 81.338000', pOrder: 2, dOrder: 3,
      ...common(DRIVER_PHONE, CONDUCTOR_PHONE) },
    { serial: 3, name: 'Amit', roll: 'KPS-103', father: 'Suresh', mother: 'Lata', p1: 9876500003, p2: null,
      pickup: '21.260000, 81.320000', drop: '21.270000, 81.350000', pOrder: 3, dOrder: 1,
      ...(conflictRow4 ? common(9444444444, 9555555555) : common(DRIVER_PHONE, CONDUCTOR_PHONE)) },
  ];
  return rows.map((r) => [
    r.serial, r.name, r.roll, r.father, r.mother, r.p1, r.p2, r.busLabel, r.busNo, r.driver, r.assistant,
    r.pickup, r.drop, r.school, r.driverPhone, r.conductorPhone, SCHOOL_PHONE, r.pOrder, r.dOrder,
  ]);
}

async function xlsxBuffer(rows, headers = HEADERS) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Sheet1');
  ws.addRow(headers);
  rows.forEach((r) => ws.addRow(r));
  return Buffer.from(await wb.xlsx.writeBuffer());
}

function csvBuffer(rows, headers = HEADERS) {
  const quote = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [headers, ...rows].map((r) => r.map(quote).join(','));
  return Buffer.from(`\uFEFF${lines.join('\r\n')}\r\n`, 'utf8');
}

const FORMATS = [
  ['xlsx', 'Bus 5.xlsx', xlsxBuffer],
  ['csv', 'Bus 5.csv', async (rows, headers) => csvBuffer(rows, headers)],
];

const preview = (buffer, filename, auth = ADMIN) => request(app)
  .post('/api/import/school-sheet/preview')
  .set('Authorization', auth)
  .attach('file', buffer, filename);

const confirm = (previewToken, auth = ADMIN) => request(app)
  .post('/api/import/school-sheet/confirm')
  .set('Authorization', auth)
  .send({ previewToken });

const WRITE_METHODS = ['create', 'update', 'updateMany', 'deleteMany'];
const MODELS = ['bus', 'driver', 'conductor', 'school', 'student', 'stop', 'trip', 'user'];
const writeCalls = () => MODELS.flatMap((m) => WRITE_METHODS.map((w) => prisma[m][w].mock.calls.length))
  .reduce((a, b) => a + b, 0);

const snapshot = () => JSON.parse(JSON.stringify(prisma.__state));

const sequence = (direction) => prisma.__state.stops
  .filter((s) => s.direction === direction)
  .sort((a, b) => a.order - b.order)
  .map((s) => ({ order: s.order, name: s.name, lat: s.lat, lng: s.lng }));

beforeEach(() => {
  prisma.__reset();
  jest.clearAllMocks();
});

describe('sample layout header mapping', () => {
  test.each(FORMATS)('%s: all 19 sample headers map to a field with nothing missing', async (_f, name, build) => {
    const { headerRow, headerRowNumber, rows } = await readSheet(await build(sampleRows()), name);
    expect(headerRowNumber).toBe(1);
    expect(rows).toHaveLength(3);
    const { fieldByColumn, missing, duplicates } = mapHeaders(headerRow);
    expect(missing).toEqual([]);
    expect(duplicates).toEqual([]);
    expect(Object.keys(fieldByColumn)).toHaveLength(19);
    expect(HEADERS.map((_, i) => fieldByColumn[i])).toEqual(HEADER_FIELDS);
  });
});

describe('row-4 driver and assistant phone conflicts', () => {
  test.each(FORMATS)('%s: preview reports both conflicts naming rows, confirm is refused and nothing is written',
    async (_f, name, build) => {
      const before = snapshot();
      const pre = await preview(await build(sampleRows({ conflictRow4: true })), name);
      expect(pre.status).toBe(200);
      expect(pre.body.canConfirm).toBe(false);
      expect(pre.body.errors).toEqual([]);
      expect(pre.body.conflicts).toEqual([
        { field: 'driverPhone', values: [{ value: '9111111111', rows: [2, 3] }, { value: '9444444444', rows: [4] }] },
        { field: 'conductorPhone', values: [{ value: '9222222222', rows: [2, 3] }, { value: '9555555555', rows: [4] }] },
      ]);
      expect(pre.body.blockers).toEqual([
        'Rows disagree on Driver Contact Number: "9111111111" (rows 2, 3) vs "9444444444" (rows 4)',
        'Rows disagree on Assistant Driver Contact Number: "9222222222" (rows 2, 3) vs "9555555555" (rows 4)',
      ]);
      // Orders are valid; only the conflicts block.
      expect(pre.body.orderErrors).toEqual({ pickup: [], drop: [] });

      const res = await confirm(pre.body.previewToken);
      expect(res.status).toBe(400);
      expect(res.body.blockers).toEqual(pre.body.blockers);
      expect(writeCalls()).toBe(0);
      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(snapshot()).toEqual(before);
    });
});

describe('fixed sample sheet', () => {
  test.each(FORMATS)('%s: preview can confirm; confirm writes stops in sheet order and the numeric roll as text',
    async (_f, name, build) => {
      const pre = await preview(await build(sampleRows({ conflictRow4: false })), name);
      expect(pre.status).toBe(200);
      expect(pre.body.blockers).toEqual([]);
      expect(pre.body.canConfirm).toBe(true);
      expect(pre.body.conflicts).toEqual([]);
      expect(pre.body.rows.map((r) => [r.row, r.rollNo])).toEqual([[2, 'KPS-101'], [3, '12345685'], [4, 'KPS-103']]);
      expect(writeCalls()).toBe(0);

      const res = await confirm(pre.body.previewToken);
      expect(res.status).toBe(200);
      expect(res.body.result).toMatchObject({
        busId: 'b1', busNo: 'RJ 37 PJ 5689', created: 3, updated: 0, stops: { pickup: 3, drop: 3 }, clearedLinks: 0,
      });
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);

      expect(sequence('PICKUP')).toEqual([
        { order: 1, name: 'Rahul – pickup', lat: 21.244718, lng: 81.334927 },
        { order: 2, name: 'Priya – pickup', lat: 21.250001, lng: 81.330002 },
        { order: 3, name: 'Amit – pickup', lat: 21.26, lng: 81.32 },
      ]);
      expect(sequence('DROP')).toEqual([
        { order: 1, name: 'Amit – drop', lat: 21.27, lng: 81.35 },
        { order: 2, name: 'Rahul – drop', lat: 21.252, lng: 81.341 },
        { order: 3, name: 'Priya – drop', lat: 21.248, lng: 81.338 },
      ]);

      const { students, drivers, conductors, buses, schools, stops } = prisma.__state;
      const priya = students.find((s) => s.name === 'Priya');
      expect(priya).toMatchObject({
        admissionNo: '12345685', fatherName: 'Mohan', motherName: 'Gita',
        parentPhone: '9876500001', parentPhone2: '9876500002', busId: 'b1',
      });
      expect(typeof priya.admissionNo).toBe('string');
      for (const st of students) {
        expect(stops.find((s) => s.id === st.stopId)).toMatchObject({ direction: 'PICKUP', studentId: st.id });
        expect(stops.find((s) => s.id === st.dropStopId)).toMatchObject({ direction: 'DROP', studentId: st.id });
      }
      expect(buses[0].label).toBe('5');
      expect(drivers).toEqual([expect.objectContaining({ name: 'kalu', phone: '9111111111', busId: 'b1' })]);
      expect(conductors).toEqual([expect.objectContaining({ name: 'Rohan', phone: '9222222222', busId: 'b1' })]);
      expect(schools[0]).toMatchObject({ name: 'Krishna Public School', contactPhone: '9333333333' });
    });
});

describe('re-import', () => {
  test('a sheet without one student lists them under notInSheet, clears their stop links and keeps the student',
    async () => {
      const first = await preview(await xlsxBuffer(sampleRows({ conflictRow4: false })), 'bus.xlsx');
      expect((await confirm(first.body.previewToken)).status).toBe(200);
      const amit = prisma.__state.students.find((s) => s.name === 'Amit');
      expect(amit.stopId).not.toBeNull();

      // Drop Amit (sheet row 4); renumber so both sequences are 1..2 again.
      const rows = sampleRows({ conflictRow4: false }).slice(0, 2);
      rows[0][COL['Pick up order']] = 1; rows[0][COL['Drop Order']] = 1;
      rows[1][COL['Pick up order']] = 2; rows[1][COL['Drop Order']] = 2;
      jest.clearAllMocks();

      const pre = await preview(csvBuffer(rows), 'bus.csv');
      expect(pre.status).toBe(200);
      expect(pre.body.canConfirm).toBe(true);
      expect(pre.body.notInSheet).toEqual([{ id: amit.id, name: 'Amit', admissionNo: 'KPS-103' }]);
      expect(pre.body.students.map((s) => s.action)).toEqual(['update', 'update']);
      expect(writeCalls()).toBe(0);

      const res = await confirm(pre.body.previewToken);
      expect(res.status).toBe(200);
      expect(res.body.result).toMatchObject({ created: 0, updated: 2, stops: { pickup: 2, drop: 2 }, clearedLinks: 2 });

      const kept = prisma.__state.students.find((s) => s.id === amit.id);
      expect(kept).toMatchObject({ name: 'Amit', admissionNo: 'KPS-103', busId: 'b1', stopId: null, dropStopId: null });
      expect(prisma.__state.students).toHaveLength(3);
      expect(sequence('PICKUP').map((s) => s.name)).toEqual(['Rahul – pickup', 'Priya – pickup']);
      expect(sequence('DROP').map((s) => s.name)).toEqual(['Rahul – drop', 'Priya – drop']);
      expect(prisma.__state.stops.some((s) => s.studentId === amit.id)).toBe(false);
    });
});

describe('active trip', () => {
  test('preview lists the blocker and confirm returns 409 without writing', async () => {
    prisma.__state.trips.push({ id: 't1', busId: 'b1', status: 'ACTIVE' });
    const before = snapshot();
    const pre = await preview(await xlsxBuffer(sampleRows({ conflictRow4: false })), 'bus.xlsx');
    expect(pre.status).toBe(200);
    expect(pre.body.canConfirm).toBe(false);
    expect(pre.body.blockers).toEqual(['The bus has an active trip']);

    const res = await confirm(pre.body.previewToken);
    expect(res.status).toBe(409);
    expect(res.body.message).toBe('The bus has an active trip. End the trip before importing.');
    expect(writeCalls()).toBe(0);
    expect(snapshot()).toEqual(before);
  });

  test('a trip that starts after a clean preview still makes confirm return 409', async () => {
    const pre = await preview(await xlsxBuffer(sampleRows({ conflictRow4: false })), 'bus.xlsx');
    expect(pre.body.canConfirm).toBe(true);
    prisma.__state.trips.push({ id: 't1', busId: 'b1', status: 'ACTIVE' });
    const res = await confirm(pre.body.previewToken);
    expect(res.status).toBe(409);
    expect(writeCalls()).toBe(0);
  });
});

describe('preview token', () => {
  test('unknown or missing token returns 410', async () => {
    for (const token of ['0'.repeat(64), undefined, 42]) {
      const res = await confirm(token);
      expect(res.status).toBe(410);
      expect(res.body.message).toBe('Preview expired, upload the file again');
    }
    expect(writeCalls()).toBe(0);
  });

  test('a token expires after ttlMs', async () => {
    let t = 1_000_000;
    const service = createImportService({ prisma, now: () => t, ttlMs: 1000 });
    const buffer = await xlsxBuffer(sampleRows({ conflictRow4: false }));

    const p1 = await service.preview({ buffer, filename: 'bus.xlsx', adminId: 'a1' });
    t += 1000;
    await expect(service.confirm({ previewToken: p1.previewToken, adminId: 'a1' }))
      .rejects.toMatchObject({ status: 410, message: 'Preview expired, upload the file again' });
    expect(writeCalls()).toBe(0);

    // Just inside the TTL the same file confirms.
    const p2 = await service.preview({ buffer, filename: 'bus.xlsx', adminId: 'a1' });
    t += 999;
    await expect(service.confirm({ previewToken: p2.previewToken, adminId: 'a1' }))
      .resolves.toMatchObject({ busId: 'b1', stops: { pickup: 3, drop: 3 } });
  });
});

describe('upload limits and file types', () => {
  test('a file over 2 MB returns 413', async () => {
    const big = Buffer.alloc(2 * 1024 * 1024 + 1, 0x41);
    const res = await preview(big, 'big.csv');
    expect(res.status).toBe(413);
    expect(writeCalls()).toBe(0);
  });

  test.each([
    ['bus.xls', 'Only .xlsx and .csv files are supported'],
    ['bus.xlsm', 'Macro-enabled workbooks are not allowed'],
    ['bus.txt', 'Only .xlsx and .csv files are supported'],
  ])('%s returns 415', async (filename, message) => {
    const res = await preview(await xlsxBuffer(sampleRows({ conflictRow4: false })), filename);
    expect(res.status).toBe(415);
    expect(res.body.message).toBe(message);
  });

  test('an .xlsx name with non-zip bytes returns 415', async () => {
    const res = await preview(csvBuffer(sampleRows({ conflictRow4: false })), 'bus.xlsx');
    expect(res.status).toBe(415);
    expect(res.body.message).toBe('The file is not a valid .xlsx file');
  });

  test('a zip containing xl/vbaProject.bin returns 415', async () => {
    const zip = await JSZip.loadAsync(await xlsxBuffer(sampleRows({ conflictRow4: false })));
    zip.file('xl/vbaProject.bin', Buffer.from('not really vba'));
    const macro = await zip.generateAsync({ type: 'nodebuffer' });
    const res = await preview(macro, 'bus.xlsx');
    expect(res.status).toBe(415);
    expect(res.body.message).toBe('Macro-enabled workbooks are not allowed');
  });

  test.each(FORMATS)('%s: a missing required header returns 400 with `missing`', async (_f, name, build) => {
    const drop = new Set([COL['Roll Number'], COL['Drop Order']]);
    const headers = HEADERS.filter((_, i) => !drop.has(i));
    const rows = sampleRows({ conflictRow4: false }).map((r) => r.filter((_, i) => !drop.has(i)));
    const res = await preview(await build(rows, headers), name);
    expect(res.status).toBe(400);
    expect(res.body.missing).toEqual(['Roll Number', 'Drop Order']);
    expect(writeCalls()).toBe(0);
  });

  test('more than 500 data rows returns 400', async () => {
    const base = sampleRows({ conflictRow4: false })[0];
    const rows = Array.from({ length: 501 }, (_, i) => {
      const r = base.slice();
      r[COL['Roll Number']] = `R${i + 1}`;
      r[COL['Pick up order']] = i + 1;
      r[COL['Drop Order']] = i + 1;
      return r;
    });
    const res = await preview(csvBuffer(rows), 'big.csv');
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('The sheet has more than 500 rows');
    expect(writeCalls()).toBe(0);
  });
});

describe('formula cells', () => {
  test('the cached result is used and the formula is never evaluated', async () => {
    const rows = sampleRows({ conflictRow4: false });
    // Evaluating 9000000000+1 would give 9000000001; the cached result is the real number.
    rows[0][COL['Parent Contact Number 1']] = { formula: '9000000000+1', result: 9876543210 };
    // A volatile formula: evaluation would produce a date, the cached text is the roll number.
    rows[2][COL['Roll Number']] = { formula: 'NOW()', result: 'KPS-103' };
    const pre = await preview(await xlsxBuffer(rows), 'bus.xlsx');
    expect(pre.status).toBe(200);
    expect(pre.body.errors).toEqual([]);
    expect(pre.body.canConfirm).toBe(true);
    expect(pre.body.rows[0].parentPhone1).toBe('9876543210');
    expect(pre.body.rows[2].rollNo).toBe('KPS-103');

    expect((await confirm(pre.body.previewToken)).status).toBe(200);
    expect(prisma.__state.students.find((s) => s.name === 'Rahul').parentPhone).toBe('9876543210');
  });
});

describe('ADMIN-only access', () => {
  test.each([
    ['no token', undefined, 401],
    ['invalid token', 'Bearer not-a-jwt', 401],
    ['PARENT', PARENT, 403],
    ['DRIVER', DRIVER, 403],
    ['CONDUCTOR', CONDUCTOR, 403],
  ])('%s is refused on preview and confirm', async (_who, auth, status) => {
    const buf = csvBuffer(sampleRows({ conflictRow4: false }));
    let pre = request(app).post('/api/import/school-sheet/preview');
    let con = request(app).post('/api/import/school-sheet/confirm');
    if (auth) {
      pre = pre.set('Authorization', auth);
      con = con.set('Authorization', auth);
    }
    expect((await pre.attach('file', buf, 'bus.csv')).status).toBe(status);
    expect((await con.send({ previewToken: '0'.repeat(64) })).status).toBe(status);
    expect(writeCalls()).toBe(0);
  });
});

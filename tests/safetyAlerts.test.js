// Safety check alerts (task 17.2): parent "Boarded the bus" / "Dropped off
// safely" pushes and the admin alert for a DROP trip that ends with students
// lacking a "Dropped safely" check. Prisma is an in-memory fake (Attendance
// unique key enforced with P2002), sendMulticast is a jest mock and Socket.IO
// is a fake that records emits. The hook is wired through the real default
// gpsSocket(io), as in server.js.
// Validates: Requirements 18.5, 18.6, 18.10
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/testdb';
process.env.JWT_SECRET = 'test-jwt-secret';

jest.mock('../src/db', () => {
  const keys = ['users', 'drivers', 'conductors', 'students', 'buses', 'stops', 'schools', 'trips', 'tripStops', 'attendances'];
  const state = {};
  let seq = 0;
  const clone = (x) => (x ? { ...x } : null);
  const matches = (row, where = {}) => Object.entries(where).every(([k, v]) => {
    if (v && typeof v === 'object' && !(v instanceof Date)) {
      if ('in' in v) return v.in.includes(row[k]);
      if ('not' in v) return row[k] !== v.not && !(v.not === null && row[k] === undefined);
      return true;
    }
    return row[k] === v;
  });
  const applyOrderBy = (rows, orderBy) => {
    const ks = (Array.isArray(orderBy) ? orderBy : orderBy ? [orderBy] : []).map((o) => Object.entries(o)[0]);
    return [...rows].sort((a, b) => {
      for (const [k, dir] of ks) {
        if (a[k] < b[k]) return dir === 'desc' ? 1 : -1;
        if (a[k] > b[k]) return dir === 'desc' ? -1 : 1;
      }
      return 0;
    });
  };
  const model = (key, unique) => ({
    findMany: jest.fn(async (args = {}) =>
      applyOrderBy(state[key].filter((r) => matches(r, args.where)), args.orderBy).map(clone)),
    findUnique: jest.fn(async (args = {}) => clone(state[key].find((r) => matches(r, args.where)))),
    findFirst: jest.fn(async (args = {}) =>
      clone(applyOrderBy(state[key].filter((r) => matches(r, args.where)), args.orderBy)[0])),
    create: jest.fn(async ({ data }) => {
      if (unique && state[key].some((r) => unique.every((k) => r[k] === data[k]))) {
        throw Object.assign(new Error('Unique constraint failed'), { code: 'P2002' });
      }
      seq += 1;
      const row = { id: `${key}-${String(seq).padStart(4, '0')}`, ...data };
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
    delete: jest.fn(async ({ where }) => {
      const i = state[key].findIndex((r) => r.id === where.id);
      if (i < 0) throw Object.assign(new Error('Record not found'), { code: 'P2025' });
      return state[key].splice(i, 1)[0];
    }),
  });
  const client = {
    user: model('users'),
    driver: model('drivers'),
    conductor: model('conductors'),
    student: model('students'),
    bus: model('buses'),
    stop: model('stops'),
    school: model('schools'),
    trip: model('trips'),
    tripStop: model('tripStops'),
    attendance: model('attendances', ['tripId', 'studentId', 'type']),
    $disconnect: jest.fn(),
  };
  client.$transaction = async (fn) => fn(client);
  client.__state = state;
  client.__reset = (seed) => {
    seq = 0;
    keys.forEach((k) => { state[k] = (seed[k] || []).map((r) => ({ ...r })); });
  };
  return client;
});

jest.mock('../src/services/notificationService', () => ({
  sendNotification: jest.fn(async () => undefined),
  sendMulticast: jest.fn(async () => ({ successCount: 1, failureCount: 0 })),
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const prisma = require('../src/db');
const { sendMulticast, sendNotification } = require('../src/services/notificationService');
const app = require('../src/app');
const gpsSocket = require('../src/sockets/gpsSocket');
const safety = require('../src/services/safetyCheckService');
const alerts = require('../src/services/safetyAlerts');

const sign = (payload) => `Bearer ${jwt.sign(payload, 'test-jwt-secret')}`;
const T = {
  ADMIN: sign({ id: 'a1', role: 'ADMIN' }),
  DRIVER_B1: sign({ id: 'u-d1', role: 'DRIVER', phone: '9333333333' }),
  DRIVER_B2: sign({ id: 'u-d2', role: 'DRIVER', phone: '9333333334' }),
  CONDUCTOR_B1: sign({ id: 'u-c1', role: 'CONDUCTOR', phone: '9555555555' }),
  CONDUCTOR_B2: sign({ id: 'u-c2', role: 'CONDUCTOR', phone: '9777777777' }),
};

const STARTED = new Date('2026-03-10T20:00:00.000Z'); // 01:30 on 11 March in Asia/Kolkata
const SEED = {
  users: [
    { id: 'u-p1', role: 'PARENT', phone: '+91 91111 11111', fcmToken: 'tok-p1' },
    { id: 'u-p1b', role: 'PARENT', phone: '09111111111', fcmToken: 'tok-p1' }, // same token, other formatting
    { id: 'u-p2', role: 'PARENT', phone: '9222222222', fcmToken: 'tok-p2' }, // parentPhone2 of Kid One
    { id: 'u-p4', role: 'PARENT', phone: '9444444444', fcmToken: 'tok-p4' },
    { id: 'u-p6', role: 'PARENT', phone: '9666666666', fcmToken: null },
    { id: 'u-x', role: 'PARENT', phone: '9999999999', fcmToken: 'tok-other' },
    { id: 'a1', role: 'ADMIN', phone: '9000000000', fcmToken: 'tok-admin' },
    { id: 'a2', role: 'ADMIN', phone: '9000000001', fcmToken: null },
  ],
  drivers: [
    { id: 'dr1', name: 'Ravi', phone: '9333333333', busId: 'b1' },
    { id: 'dr2', name: 'Mohan', phone: '9333333334', busId: 'b2' },
  ],
  conductors: [
    { id: 'c1', name: 'Asha', phone: '9555555555', busId: 'b1' },
    { id: 'c2', name: 'Meena', phone: '9777777777', busId: 'b2' },
  ],
  buses: [
    { id: 'b1', busNo: 'RJ 14 PA 1234', status: 'ON_TRIP' },
    { id: 'b2', busNo: 'RJ 14 PB 5678', status: 'ON_TRIP' },
  ],
  students: [
    { id: 'st-1', name: 'Kid One', busId: 'b1', parentPhone: '9111111111', parentPhone2: '9222222222', stopId: 's-1', dropStopId: null },
    { id: 'st-5', name: 'Kid Five', busId: 'b1', parentPhone: '9888888888', parentPhone2: null, stopId: 's-1', dropStopId: null },
    { id: 'st-2', name: 'Kid Two', busId: 'b2', parentPhone: '9444444444', parentPhone2: null, stopId: null, dropStopId: 'd-1' },
    { id: 'st-3', name: 'Kid Three', busId: 'b2', parentPhone: '9666666666', parentPhone2: null, stopId: null, dropStopId: 'd-2' },
    { id: 'st-4', name: 'Kid Four', busId: 'b2', parentPhone: '9444444444', parentPhone2: null, stopId: null, dropStopId: 'd-3' },
  ],
  trips: [
    { id: 't1', busId: 'b1', driverId: 'dr1', direction: 'PICKUP', status: 'ACTIVE', startedAt: STARTED },
    { id: 't2', busId: 'b2', driverId: 'dr2', direction: 'DROP', status: 'ACTIVE', startedAt: STARTED },
  ],
  tripStops: [
    { id: 'ts1', tripId: 't1', stopId: 's-1', order: 1, name: 'Shastri Nagar', lat: 26.1, lng: 75.1, status: 'ARRIVED' },
    { id: 'tsd1', tripId: 't2', stopId: 'd-1', order: 1, name: 'Gandhi Nagar', lat: 26.3, lng: 75.3, status: 'COMPLETED' },
    { id: 'tsd2', tripId: 't2', stopId: 'd-2', order: 2, name: 'Ram Nagar', lat: 26.4, lng: 75.4, status: 'COMPLETED' },
    { id: 'tsd3', tripId: 't2', stopId: 'd-3', order: 3, name: 'Civil Lines', lat: 26.5, lng: 75.5, status: 'PENDING' },
  ],
};

let emits = [];
const fakeIo = {
  use: () => {},
  on: () => {},
  to: (room) => ({ emit: (event, payload) => { emits.push({ room, event, payload }); } }),
};
const emitted = (event) => emits.filter((e) => e.event === event);

const post = (path, token, body) => request(app).post(path).set('Authorization', token).send(body || {});
const del = (path, token) => request(app).delete(path).set('Authorization', token);
// Background alerts chain several awaits on the fake; let them all run.
const settle = async () => { for (let i = 0; i < 20; i += 1) await new Promise((r) => setImmediate(r)); };

const tripWithStops = (id) => ({
  ...SEED.trips.find((t) => t.id === id),
  stops: SEED.tripStops.filter((s) => s.tripId === id),
});
const studentById = (id) => SEED.students.find((s) => s.id === id);

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  gpsSocket(fakeIo); // wires safetyCheckService -> safetyAlerts like server.js
});
afterAll(() => {
  safety.setOnSafetyCheck(null);
  jest.restoreAllMocks();
});
beforeEach(() => {
  prisma.__reset(SEED);
  emits = [];
  sendMulticast.mockClear();
  app.set('io', fakeIo);
});
afterEach(() => {
  expect(sendNotification).not.toHaveBeenCalled();
});

describe('alert texts', () => {
  test('{time} is HH:mm (24 h) in Asia/Kolkata', () => {
    expect(alerts.formatTime(STARTED)).toBe('01:30');
    expect(alerts.formatTime('2026-03-10T18:35:00.000Z')).toBe('00:05');
    expect(alerts.formatTime('2026-03-11T09:15:00.000Z')).toBe('14:45');
    expect(alerts.formatTime('not a date')).toBe('');
  });

  test('exact Boarded and Dropped safely texts', () => {
    expect(alerts.buildSafetyMessage('BOARDED', { studentName: 'Kid One', busNo: 'RJ 14 PA 1234', time: '07:05' })).toEqual({
      title: 'Boarded the bus',
      body: 'Kid One has boarded bus RJ 14 PA 1234 at 07:05.',
    });
    expect(alerts.buildSafetyMessage('DROPPED_SAFE', { studentName: 'Kid Two', stopName: 'Gandhi Nagar', time: '14:45' })).toEqual({
      title: 'Dropped off safely',
      body: 'Kid Two was dropped off safely at the drop-off stop (Gandhi Nagar) at 14:45 by the bus conductor.',
    });
    expect(alerts.buildSafetyMessage('ABSENT', {})).toBeNull();
  });
});

describe('onSafetyCheck', () => {
  test('BOARDED goes to the tokens of both parent phones in one multicast', async () => {
    const check = { id: 'att-1', tripId: 't1', studentId: 'st-1', type: 'BOARDED', checkedAt: STARTED.toISOString() };
    const res = await alerts.onSafetyCheck(check, { trip: tripWithStops('t1'), student: studentById('st-1'), busId: 'b1' });
    expect(res.sent).toBe(true);
    expect(sendMulticast).toHaveBeenCalledTimes(1);
    const [tokens, title, body, data] = sendMulticast.mock.calls[0];
    expect([...tokens].sort()).toEqual(['tok-p1', 'tok-p2']);
    expect(title).toBe('Boarded the bus');
    expect(body).toBe('Kid One has boarded bus RJ 14 PA 1234 at 01:30.');
    expect(data).toEqual({ type: 'BOARDED', busId: 'b1', tripId: 't1', studentId: 'st-1', checkId: 'att-1' });
  });

  test('DROPPED_SAFE names the drop-off stop of the trip', async () => {
    const check = { id: 'att-2', tripId: 't2', studentId: 'st-2', type: 'DROPPED_SAFE', checkedAt: '2026-03-11T09:15:00.000Z' };
    await alerts.onSafetyCheck(check, { trip: tripWithStops('t2'), student: studentById('st-2'), busId: 'b2' });
    expect(sendMulticast).toHaveBeenCalledTimes(1);
    expect(sendMulticast.mock.calls[0].slice(0, 3)).toEqual([
      ['tok-p4'],
      'Dropped off safely',
      'Kid Two was dropped off safely at the drop-off stop (Gandhi Nagar) at 14:45 by the bus conductor.',
    ]);
  });

  test('no Linked_Parent token means no send', async () => {
    const check = { id: 'att-3', tripId: 't2', studentId: 'st-3', type: 'DROPPED_SAFE', checkedAt: STARTED.toISOString() };
    const res = await alerts.onSafetyCheck(check, { trip: tripWithStops('t2'), student: studentById('st-3'), busId: 'b2' });
    expect(res).toEqual({ sent: false, tokens: [] });
    expect(sendMulticast).not.toHaveBeenCalled();
  });
});

describe('through POST /api/trips/:id/safety-checks', () => {
  test('a new check alerts once; a repeat and an undo send nothing more', async () => {
    const first = await post('/api/trips/t1/safety-checks', T.CONDUCTOR_B1, { studentId: 'st-1', type: 'BOARDED' });
    expect(first.status).toBe(201);
    await settle();
    expect(sendMulticast).toHaveBeenCalledTimes(1);
    const [tokens, title, body] = sendMulticast.mock.calls[0];
    expect([...tokens].sort()).toEqual(['tok-p1', 'tok-p2']);
    expect(title).toBe('Boarded the bus');
    expect(body).toBe(`Kid One has boarded bus RJ 14 PA 1234 at ${alerts.formatTime(first.body.check.checkedAt)}.`);
    expect(body).toMatch(/ at \d{2}:\d{2}\.$/);

    const again = await post('/api/trips/t1/safety-checks', T.CONDUCTOR_B1, { studentId: 'st-1', type: 'BOARDED' });
    expect(again.status).toBe(200);
    expect(again.body.created).toBe(false);
    const undo = await del(`/api/trips/t1/safety-checks/${first.body.check.id}`, T.CONDUCTOR_B1);
    expect(undo.status).toBe(200);
    await settle();
    expect(sendMulticast).toHaveBeenCalledTimes(1);
  });

  test('a student without parent tokens records fine and sends nothing', async () => {
    const res = await post('/api/trips/t1/safety-checks', T.CONDUCTOR_B1, { studentId: 'st-5', type: 'BOARDED' });
    expect(res.status).toBe(201);
    await settle();
    expect(sendMulticast).not.toHaveBeenCalled();
  });
});

describe('trip end', () => {
  test('a DROP trip ending with a missing "Dropped safely" alerts admins only', async () => {
    // Kid Three was checked; Kid Four's stop never completed (CANCELLED at end).
    prisma.__state.attendances.push({
      id: 'att-9', tripId: 't2', studentId: 'st-3', busId: 'b2', type: 'DROPPED_SAFE', conductorId: 'c2',
      checkedAt: STARTED, date: '2026-03-11', tripType: 'drop', boarded: true,
    });
    const res = await post('/api/trips/t2/end', T.DRIVER_B2);
    expect(res.status).toBe(200);
    expect(res.body.trip.status).toBe('COMPLETED');
    await settle();

    const missing = emitted(alerts.MISSING_EVENT);
    expect(missing).toHaveLength(1);
    expect(missing[0].room).toBe('admins');
    expect(missing[0].payload).toEqual({
      busId: 'b2', busNo: 'RJ 14 PB 5678', tripId: 't2',
      students: [{ id: 'st-2', name: 'Kid Two', stopName: 'Gandhi Nagar' }],
    });
    // Student names never reach the bus room.
    expect(emits.filter((e) => e.room !== 'admins').some((e) => JSON.stringify(e.payload).includes('Kid Two'))).toBe(false);

    expect(sendMulticast).toHaveBeenCalledTimes(1);
    expect(sendMulticast.mock.calls[0]).toEqual([
      ['tok-admin'],
      'Drop-off not confirmed',
      'Bus RJ 14 PB 5678 ended its drop trip without a "Dropped safely" check for: Kid Two (Gandhi Nagar).',
      { type: 'SAFETY_MISSING', busId: 'b2', tripId: 't2', studentIds: 'st-2' },
    ]);

    // Ending the COMPLETED trip again is silent.
    expect((await post('/api/trips/t2/end', T.ADMIN)).status).toBe(200);
    await settle();
    expect(emitted(alerts.MISSING_EVENT)).toHaveLength(1);
    expect(sendMulticast).toHaveBeenCalledTimes(1);
  });

  test('a PICKUP trip end sends nothing', async () => {
    const res = await post('/api/trips/t1/end', T.DRIVER_B1);
    expect(res.status).toBe(200);
    await settle();
    expect(emitted(alerts.MISSING_EVENT)).toHaveLength(0);
    expect(sendMulticast).not.toHaveBeenCalled();
  });
});

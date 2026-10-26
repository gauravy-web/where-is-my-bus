// Example tests for the five-minute notifier (task 8.4), end to end:
//   fix -> real etaCoordinator -> real etaService (fake OSRM fetch)
//       -> real proximityNotifier (fake prisma, mocked sendMulticast).
// The fake prisma enforces the NotificationLog unique key
// (tripId, tripStopId, studentId, type) like the real table. No FCM, DB or
// network is used. "Reconnect"/restart = fresh coordinator + notifier
// instances on the same fake database.
// Validates: Requirements 10.2, 10.3, 10.7, 10.8, 10.9, 10.10, 10.12, 10.13, 10.14, 16.3
jest.mock('../src/db', () => ({}));
jest.mock('../src/services/notificationService', () => ({
  sendNotification: jest.fn(async () => { throw new Error('real FCM must not be used'); }),
  sendMulticast: jest.fn(async () => { throw new Error('real FCM must not be used'); }),
}));

const { createEtaService } = require('../src/services/etaService');
const { createEtaCoordinator } = require('../src/services/etaCoordinator');
const { createProximityNotifier } = require('../src/services/proximityNotifier');
const tripService = require('../src/services/tripService');

const T0 = Date.parse('2026-01-10T07:00:00.000Z');
const BUS = { id: 'b1', busNo: 'RJ14-01' };

const pickupText = (stopName, minutes) => ({
  title: 'Bus arriving at pickup',
  body: `Your child's bus RJ14-01 is expected to arrive at the pickup stop (${stopName}) in approximately ${minutes} minutes. Please be ready.`,
});
const dropText = (studentName, stopName, minutes) => ({
  title: 'Bus arriving at drop-off',
  body: `The school bus RJ14-01 is on the way home and will reach ${studentName}'s drop-off stop (${stopName}) in about ${minutes} minutes. Please be at the stop.`,
});

// ---------------------------------------------------------------- fakes

// Equality `where` matcher: null matches null/undefined; { not: null } too.
const matches = (row, where = {}) => Object.entries(where).every(([k, v]) => {
  if (v === null) return row[k] === null || row[k] === undefined;
  if (v && typeof v === 'object' && 'not' in v) return v.not === null ? row[k] !== null && row[k] !== undefined : row[k] !== v.not;
  return String(row[k]) === String(v);
});

function fakePrisma({ students, users, stops, getTrip }) {
  const logs = [];
  const key = (d) => `${d.tripId}|${d.tripStopId}|${d.studentId}|${d.type}`;
  return {
    logs,
    student: { findMany: async ({ where } = {}) => students.filter((s) => matches(s, where)).map((s) => ({ ...s })) },
    user: { findMany: async ({ where } = {}) => users.filter((u) => matches(u, where)).map((u) => ({ phone: u.phone, fcmToken: u.fcmToken })) },
    bus: { findUnique: async ({ where }) => (where.id === BUS.id ? { ...BUS } : null) },
    stop: { findUnique: async ({ where }) => stops.find((s) => s.id === where.id) || null },
    tripStop: { findUnique: async ({ where }) => (getTrip().stops.find((ts) => ts.id === where.id) || null) },
    notificationLog: {
      create: async ({ data }) => {
        if (logs.some((l) => key(l) === key(data))) {
          const err = new Error('Unique constraint failed on (tripId, tripStopId, studentId, type)');
          err.code = 'P2002';
          throw err;
        }
        const row = { id: `log-${logs.length + 1}`, sentAt: null, ...data };
        logs.push(row);
        return row;
      },
      update: async ({ where, data }) => {
        const row = logs.find((l) => key(l) === key(where.tripId_tripStopId_studentId_type));
        if (!row) throw new Error('NotificationLog row not found');
        Object.assign(row, data);
        return row;
      },
    },
  };
}

// Fake OSRM. The URL carries the fix plus N waypoints, so the route has N
// legs. Leg 0 (fix -> Current_Stop) is `osrm.leg`; every later leg is
// `osrm.otherLeg`. `osrm.leg = 'fail'` answers code NoRoute (ETA null).
function fakeOsrm() {
  const osrm = { leg: 600, otherLeg: 60, calls: [] };
  osrm.fetch = jest.fn(async (url) => {
    osrm.calls.push(url);
    if (osrm.leg === 'fail') return { ok: true, status: 200, json: async () => ({ code: 'NoRoute', routes: [] }) };
    const coords = url.split('/route/v1/driving/')[1].split('?')[0].split(';');
    const legs = coords.slice(1).map((_, i) => ({ duration: i === 0 ? osrm.leg : osrm.otherLeg }));
    return { ok: true, status: 200, json: async () => ({ code: 'Ok', routes: [{ legs, geometry: null }] }) };
  });
  return osrm;
}

const tripStop = (i, stopId, name) => ({
  id: `ts-${i}`, tripId: 't1', stopId, order: i, name, lat: 26.7 - i * 0.01, lng: 75.3 + i * 0.01, status: 'PENDING',
});

const DEFAULT_TRIP_STOPS = [tripStop(1, 's-1', 'Main Gate'), tripStop(2, 's-2', 'Park Road'), tripStop(3, 's-3', 'Lake View')];

// Builds the whole pipeline. `students`/`users` are DB rows.
function harness({ direction = 'PICKUP', students = [], users = [], tripStops = DEFAULT_TRIP_STOPS, unverified = [] } = {}) {
  let clock = T0;
  const now = () => clock;
  const h = {
    trip: {
      id: 't1', busId: 'b1', direction, status: 'ACTIVE',
      destName: 'School', destLat: 26.9, destLng: 75.8,
      stops: tripStops.map((ts) => ({ ...ts })),
    },
    sends: [],
    logger: { warn: jest.fn(), error: jest.fn() },
    osrm: fakeOsrm(),
  };
  const stops = tripStops.map((ts) => ({ id: ts.stopId, name: ts.name, needsLocation: unverified.includes(ts.stopId) }));
  h.prisma = fakePrisma({ students, users, stops, getTrip: () => h.trip });

  // Mocked FCM: records each call; `h.fcm` decides the outcome.
  h.fcm = async (tokens) => ({ successCount: tokens.length, failureCount: 0 });
  h.sendMulticast = jest.fn(async (tokens, title, body, data, options) => {
    h.sends.push({ tokens: [...tokens].sort(), title, body, data, options });
    return h.fcm(tokens);
  });

  // A server process: coordinator + ETA service + notifier.
  h.boot = () => {
    const etaService = createEtaService({ fetch: h.osrm.fetch, now, osrmUrl: 'http://osrm.test', logger: h.logger, tripService });
    h.notifier = createProximityNotifier({ prisma: h.prisma, sendMulticast: h.sendMulticast, now, logger: h.logger });
    h.coordinator = createEtaCoordinator({ etaService, tripService, now, logger: h.logger, emit: () => {} });
    h.coordinator.addEtaListener((event) => h.notifier.onEta(event));
  };
  h.boot();

  // One GPS fix at the current time (recorded 1 s ago, same position).
  h.fix = (ageMs = 1000) => h.coordinator.onFix('b1', { lat: 26.8, lng: 75.4, speed: 6, recordedAt: clock - ageMs }, h.trip);
  // 15 s later, a fix whose OSRM leg to the Current_Stop is `leg` seconds.
  h.step = (leg, ageMs) => {
    clock += 15000;
    h.osrm.leg = leg;
    return h.fix(ageMs);
  };
  // Driver completes/skips the Current_Stop (tripService returns a new trip),
  // then the controller wiring: onStopClosed + coordinator.onTripChanged.
  h.closeCurrent = async (status = 'COMPLETED') => {
    const current = tripService.currentStop(h.trip);
    h.trip = { ...h.trip, stops: h.trip.stops.map((s) => (s.id === current.id ? { ...s, status } : { ...s })) };
    const closed = h.trip.stops.find((s) => s.id === current.id);
    const skipped = await h.notifier.onStopClosed(h.trip, closed);
    return { skipped, recompute: h.coordinator.onTripChanged(h.trip) };
  };
  return h;
}

// Common rows: Asha (s-1), Bharat (s-2), Chetan (s-3) on bus b1; Dev on
// another bus at s-1; an unrelated registered parent with a token.
const STUDENTS = [
  { id: 'st-a', name: 'Asha', busId: 'b1', stopId: 's-1', dropStopId: 's-3', parentPhone: '9000000001', parentPhone2: null },
  { id: 'st-b', name: 'Bharat', busId: 'b1', stopId: 's-2', dropStopId: 's-2', parentPhone: '9000000002', parentPhone2: null },
  { id: 'st-c', name: 'Chetan', busId: 'b1', stopId: 's-3', dropStopId: 's-1', parentPhone: '9000000003', parentPhone2: null },
  { id: 'st-d', name: 'Dev', busId: 'b9', stopId: 's-1', dropStopId: 's-1', parentPhone: '9000000004', parentPhone2: null },
];
const USERS = [
  { phone: '9000000001', fcmToken: 'tok-a' },
  { phone: '+91 90000 00002', fcmToken: 'tok-b' },
  { phone: '9000000003', fcmToken: 'tok-c' },
  { phone: '9000000004', fcmToken: 'tok-d' },
  { phone: '9999999999', fcmToken: 'tok-unlinked' },
  { phone: '9000000005', fcmToken: null },
];

// ---------------------------------------------------------------- tests

describe('Scenario 7: only the next student\'s parent is notified', () => {
  test('the Current_Stop alert reaches only its linked parents, then the next stop alerts after completion', async () => {
    const h = harness({ students: STUDENTS, users: USERS });
    h.osrm.otherLeg = 10; // ts-2 is also within 330 s, but it is not the Current_Stop

    await h.fix(); // 600 s
    await h.step(400);
    await h.step(320); // ts-2 = 330
    expect(h.sends).toHaveLength(0);
    await h.step(310); // ts-2 = 320: two consecutive <= 330 for both stops

    expect(h.sends).toHaveLength(1);
    expect(h.sends[0]).toEqual(expect.objectContaining({ tokens: ['tok-a'], ...pickupText('Main Gate', 5) }));
    expect(h.sends[0].data).toEqual(expect.objectContaining({ tripStopId: 'ts-1', studentId: 'st-a' }));
    expect(h.prisma.logs).toEqual([expect.objectContaining({ tripStopId: 'ts-1', studentId: 'st-a', status: 'SENT' })]);

    // Completing an already-alerted stop records nothing new; the prompt
    // recompute makes ts-2 current with a first fresh ETA under 5 minutes.
    h.osrm.leg = 200;
    const { skipped, recompute } = await h.closeCurrent();
    await recompute;
    expect(skipped).toEqual([]);

    expect(h.sends).toHaveLength(2);
    expect(h.sends[1]).toEqual(expect.objectContaining({ tokens: ['tok-b'], ...pickupText('Park Road', 3) }));
    const all = h.sends.flatMap((s) => s.tokens);
    for (const tok of ['tok-c', 'tok-d', 'tok-unlinked']) expect(all).not.toContain(tok);
    expect(h.prisma.logs.map((l) => `${l.tripStopId}:${l.studentId}:${l.status}`)).toEqual(['ts-1:st-a:SENT', 'ts-2:st-b:SENT']);
  });
});

describe('Scenario 8: no duplicates on repeated GPS or reconnect', () => {
  test('repeated fixes, an identical burst and a reconnect to a restarted server send once', async () => {
    const h = harness({ students: STUDENTS, users: USERS });
    await h.step(200); // initial alert, 3 minutes
    expect(h.sends).toHaveLength(1);

    for (const leg of [190, 150, 100, 60, 20]) await h.step(leg);
    const osrmCalls = h.osrm.calls.length;
    for (let i = 0; i < 3; i += 1) await h.fix(); // identical fixes, same instant
    expect(h.osrm.calls.length).toBe(osrmCalls); // throttled: no recompute
    expect(h.sends).toHaveLength(1);

    // Driver app reconnects to a restarted server: in-memory state is gone,
    // the NotificationLog claim still blocks the send.
    h.boot();
    await h.step(15);
    await h.step(10);
    expect(h.sends).toHaveLength(1);

    expect(h.prisma.logs).toEqual([expect.objectContaining({ tripStopId: 'ts-1', studentId: 'st-a', status: 'SENT' })]);
  });

  test('two server instances handling the same ETA at the same time send once', async () => {
    const h = harness({ students: STUDENTS, users: USERS });
    const make = () => createProximityNotifier({ prisma: h.prisma, sendMulticast: h.sendMulticast, now: () => T0, logger: h.logger });
    const event = { busId: 'b1', trip: h.trip, eta: { perStop: [{ tripStopId: 'ts-1', etaSeconds: 100 }], computedAt: T0, fixRecordedAt: T0 - 1000 } };
    await Promise.all([make().onEta(event), make().onEta(event)]);
    expect(h.sendMulticast).toHaveBeenCalledTimes(1);
    expect(h.prisma.logs).toEqual([expect.objectContaining({ studentId: 'st-a', status: 'SENT' })]);
  });
});

describe('no Valid_ETA, no alert (Requirement 10.2)', () => {
  test('a fluctuating ETA never sends', async () => {
    const h = harness({ students: STUDENTS, users: USERS });
    for (const leg of [320, 400, 250, 400, 330, 360, 300, 335]) await h.step(leg);
    expect(h.osrm.calls).toHaveLength(8);
    expect(h.sends).toHaveLength(0);
    expect(h.prisma.logs).toHaveLength(0);
  });

  test('no ETA (OSRM failure or stale fix) never sends, and a null ETA breaks the consecutive pair', async () => {
    const h = harness({ students: STUDENTS, users: USERS });
    await h.step('fail');
    await h.step('fail');
    await h.step(100, 70 * 1000); // ETA computed from a 70 s old fix: not a Valid_ETA
    await h.step(320);
    await h.step('fail'); // null ETA in between
    await h.step(320);
    expect(h.sends).toHaveLength(0);
    expect(h.prisma.logs).toHaveLength(0);
  });

  test('an unverified stop (needsLocation) never sends and is logged once', async () => {
    const h = harness({ students: STUDENTS, users: USERS, unverified: ['s-1'] });
    await h.step(100);
    await h.step(50);
    expect(h.sends).toHaveLength(0);
    expect(h.prisma.logs).toHaveLength(0);
    const warnings = h.logger.warn.mock.calls.map((c) => String(c[0])).filter((m) => m.includes('s-1') && m.includes('needs a confirmed location'));
    expect(warnings).toHaveLength(1);
  });
});

describe('DROP trips (Requirements 10.10, 10.12, 10.13)', () => {
  const dropStops = [tripStop(1, 's-1', 'Main Gate'), tripStop(2, 's-2', 'Park Road')];

  test('drop alerts match dropStopId and use the exact drop text naming the child and stop', async () => {
    const h = harness({ direction: 'DROP', students: STUDENTS, users: USERS, tripStops: dropStops });
    await h.step(320);
    await h.step(300);
    // s-1 is Asha's and Dev's pickup stop but only Chetan's drop stop on b1.
    expect(h.sends).toHaveLength(1);
    expect(h.sends[0]).toEqual(expect.objectContaining({ tokens: ['tok-c'], ...dropText('Chetan', 'Main Gate', 5) }));
    expect(h.sends[0].data).toEqual(expect.objectContaining({ direction: 'DROP', studentId: 'st-c' }));
    // DROP trips have no school waypoint.
    expect(h.osrm.calls[0].split('/route/v1/driving/')[1].split('?')[0].split(';')).toHaveLength(3);
  });

  test('two children of one parent at the same stop get one alert each, each naming its child', async () => {
    const students = [
      { id: 'st-p', name: 'Priya', busId: 'b1', stopId: 's-2', dropStopId: 's-1', parentPhone: '9000000010', parentPhone2: null },
      { id: 'st-r', name: 'Rohan', busId: 'b1', stopId: 's-2', dropStopId: 's-1', parentPhone: '+91 90000 00010', parentPhone2: null },
    ];
    const h = harness({ direction: 'DROP', students, users: [{ phone: '919000000010', fcmToken: 'tok-parent' }], tripStops: dropStops });
    await h.step(170); // first Valid_ETA already under 5 minutes: 3 minutes

    expect(h.sends).toHaveLength(2);
    const byStudent = Object.fromEntries(h.sends.map((s) => [s.data.studentId, s]));
    expect(byStudent['st-p']).toEqual(expect.objectContaining({ tokens: ['tok-parent'], ...dropText('Priya', 'Main Gate', 3) }));
    expect(byStudent['st-r']).toEqual(expect.objectContaining({ tokens: ['tok-parent'], ...dropText('Rohan', 'Main Gate', 3) }));
    expect(h.prisma.logs.map((l) => `${l.studentId}:${l.status}`).sort()).toEqual(['st-p:SENT', 'st-r:SENT']);
  });

  test('a DROP-trip student without dropStopId gets no alert and is logged for the admin once', async () => {
    const students = [
      ...STUDENTS.filter((s) => s.id !== 'st-c'),
      { id: 'st-e', name: 'Esha', busId: 'b1', stopId: 's-1', dropStopId: null, parentPhone: '9000000006', parentPhone2: null },
    ];
    const users = [...USERS, { phone: '9000000006', fcmToken: 'tok-e' }];
    const h = harness({ direction: 'DROP', students, users, tripStops: dropStops });
    await h.step(100); // ts-1 (s-1): only Esha would match, and she has no drop stop
    const { recompute } = await h.closeCurrent();
    await recompute; // ts-2 (s-2) is current: Bharat, first ETA 100 s -> 2 minutes
    await h.step(50);

    expect(h.sends).toHaveLength(1);
    expect(h.sends[0]).toEqual(expect.objectContaining({ tokens: ['tok-b'], ...dropText('Bharat', 'Park Road', 2) }));
    expect(h.sends.flatMap((s) => s.tokens)).not.toContain('tok-e');
    expect(h.prisma.logs.some((l) => l.studentId === 'st-e')).toBe(false);
    const warnings = h.logger.warn.mock.calls.map((c) => String(c[0])).filter((m) => m.includes('without a drop stop'));
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('st-e');
    expect(warnings[0]).not.toContain('st-a');
  });
});

describe('stop closed before the alert (Requirement 10.8)', () => {
  test.each(['COMPLETED', 'SKIPPED'])('a stop %s early records SKIPPED and is never alerted', async (status) => {
    const students = [
      ...STUDENTS,
      { id: 'st-f', name: 'Farah', busId: 'b1', stopId: 's-1', dropStopId: 's-2', parentPhone: '9000000007', parentPhone2: null },
    ];
    const users = [...USERS, { phone: '9000000007', fcmToken: 'tok-f' }];
    const h = harness({ students, users });
    await h.step(320); // one reading <= 330: no alert yet
    const before = h.trip;

    const { skipped, recompute } = await h.closeCurrent(status);
    await recompute;
    expect(skipped.sort()).toEqual(['st-a', 'st-f']);

    // An ETA computed for the old snapshot arrives late, on this and on a
    // restarted instance: still no alert.
    const late = { busId: 'b1', trip: before, eta: { perStop: [{ tripStopId: 'ts-1', etaSeconds: 60 }], computedAt: T0 + 15000, fixRecordedAt: T0 + 14000 } };
    await h.notifier.onEta(late);
    h.boot();
    await h.notifier.onEta(late);
    await h.step(400); // ts-2 now current, far away

    expect(h.sends).toHaveLength(0);
    expect(h.prisma.logs.map((l) => `${l.tripStopId}:${l.studentId}:${l.status}`).sort()).toEqual(['ts-1:st-a:SKIPPED', 'ts-1:st-f:SKIPPED']);
  });
});

describe('message texts, FCM channel and send outcomes (Requirements 10.7, 10.9, 10.10, 10.11)', () => {
  test('pickup: 5 minutes after two readings, actual minutes on an initial reading; channel whereismybus; string data', async () => {
    const h = harness({ students: STUDENTS, users: USERS });
    await h.step(320);
    await h.step(330);
    expect(h.sends).toHaveLength(1);
    expect(h.sends[0]).toEqual({
      tokens: ['tok-a'],
      ...pickupText('Main Gate', 5),
      data: { type: 'ETA_5_MIN', direction: 'PICKUP', busId: 'b1', tripId: 't1', tripStopId: 'ts-1', studentId: 'st-a', minutes: '5' },
      options: { channelId: 'whereismybus' },
    });
    expect(Object.values(h.sends[0].data).every((v) => typeof v === 'string')).toBe(true);

    const h2 = harness({ students: STUDENTS, users: USERS });
    await h2.step(100); // round(100 / 60) = 2
    expect(h2.sends.map((s) => s.body)).toEqual([pickupText('Main Gate', 2).body]);
    expect(h2.prisma.logs[0]).toEqual(expect.objectContaining({ status: 'SENT', etaSeconds: 100, sentAt: new Date(T0 + 15000) }));
  });

  test.each([
    ['throws', async () => { throw new Error('FCM unavailable'); }],
    ['delivers nothing', async () => ({ successCount: 0, failureCount: 1 })],
  ])('FAILED is recorded when FCM %s, and the claim is not retried', async (_label, fcm) => {
    const h = harness({ students: STUDENTS, users: USERS });
    h.fcm = fcm;
    await h.step(100);
    await h.step(50);
    expect(h.sendMulticast).toHaveBeenCalledTimes(1);
    expect(h.prisma.logs).toEqual([expect.objectContaining({ tripStopId: 'ts-1', studentId: 'st-a', status: 'FAILED', sentAt: null })]);
  });
});

describe('both parent numbers (Requirement 10.14)', () => {
  test('both registered parents receive one multicast under one NotificationLog claim', async () => {
    const students = [
      { id: 'st-g', name: 'Gita', busId: 'b1', stopId: 's-1', dropStopId: 's-2', parentPhone: '+91 98765 43210', parentPhone2: '91234-56789' },
    ];
    const users = [
      { phone: '919876543210', fcmToken: 'tok-mother' },
      { phone: '9123456789', fcmToken: 'tok-father' },
      { phone: '9876543210', fcmToken: 'tok-mother' }, // same device registered twice
    ];
    const h = harness({ students, users });
    await h.step(200);

    expect(h.sendMulticast).toHaveBeenCalledTimes(1);
    expect(h.sends[0].tokens).toEqual(['tok-father', 'tok-mother']);
    expect(h.sends[0].data.studentId).toBe('st-g');
    expect(h.prisma.logs).toEqual([expect.objectContaining({ tripStopId: 'ts-1', studentId: 'st-g', type: 'ETA_5_MIN', status: 'SENT' })]);
  });
});

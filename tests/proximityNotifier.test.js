// Smoke tests for the proximity notifier (task 8.1). Full property and
// example suites are tasks 8.3 / 8.4. Prisma and FCM are in-memory fakes.
// Validates: Requirements 10.1, 10.3, 10.4, 10.6, 10.8, 10.9, 10.10, 10.14
const {
  createProximityNotifier,
  shouldNotify,
  buildMessage,
} = require('../src/services/proximityNotifier');

const T0 = Date.parse('2026-01-10T07:00:00.000Z');
const silent = { warn: () => {}, error: () => {} };

function fakePrisma({ students = [], users = [], buses = [], stops = [] } = {}) {
  const logs = [];
  const key = (d) => `${d.tripId}|${d.tripStopId}|${d.studentId}|${d.type}`;
  return {
    logs,
    student: { findMany: async () => students.map((s) => ({ ...s })) },
    user: { findMany: async () => users.map((u) => ({ ...u })) },
    bus: { findUnique: async ({ where }) => buses.find((b) => b.id === where.id) || null },
    stop: { findUnique: async ({ where }) => stops.find((s) => s.id === where.id) || null },
    notificationLog: {
      create: async ({ data }) => {
        if (logs.some((l) => key(l) === key(data))) {
          const err = new Error('Unique constraint failed');
          err.code = 'P2002';
          throw err;
        }
        const row = { id: `log-${logs.length + 1}`, ...data };
        logs.push(row);
        return row;
      },
      update: async ({ where, data }) => {
        const w = where.tripId_tripStopId_studentId_type;
        const row = logs.find((l) => key(l) === key(w));
        if (!row) throw new Error('not found');
        Object.assign(row, data);
        return row;
      },
    },
  };
}

const makeTrip = (direction = 'PICKUP') => ({
  id: 't1',
  busId: 'b1',
  direction,
  status: 'ACTIVE',
  stops: [
    { id: 'ts-1', tripId: 't1', stopId: 's-1', order: 1, name: 'Main Gate', lat: 1, lng: 1, status: 'PENDING' },
    { id: 'ts-2', tripId: 't1', stopId: 's-2', order: 2, name: 'Park Road', lat: 2, lng: 2, status: 'PENDING' },
  ],
});

const etaAt = (nowMs, perStop) => ({ perStop, school: { etaSeconds: 100 }, computedAt: nowMs, fixRecordedAt: nowMs - 1000 });

function setup(direction = 'PICKUP') {
  let clock = T0;
  const prisma = fakePrisma({
    buses: [{ id: 'b1', busNo: 'RJ14-01' }],
    students: [
      { id: 'st-a', name: 'Asha', busId: 'b1', stopId: 's-1', dropStopId: 's-2', parentPhone: '+91 98765 43210', parentPhone2: '9123456789' },
      { id: 'st-b', name: 'Bharat', busId: 'b1', stopId: 's-2', dropStopId: 's-1', parentPhone: '9000000002', parentPhone2: null },
      { id: 'st-c', name: 'Chetan', busId: 'b9', stopId: 's-1', dropStopId: 's-1', parentPhone: '9000000003', parentPhone2: null },
    ],
    users: [
      { phone: '919876543210', fcmToken: 'tok-a1' },
      { phone: '9123456789', fcmToken: 'tok-a2' },
      { phone: '9000000002', fcmToken: 'tok-b' },
      { phone: '9000000003', fcmToken: 'tok-c' },
    ],
  });
  const sends = [];
  const sendMulticast = async (tokens, title, body, data) => {
    sends.push({ tokens, title, body, data });
    return { successCount: tokens.length, failureCount: 0 };
  };
  const notifier = createProximityNotifier({ prisma, sendMulticast, now: () => clock, logger: silent });
  return { prisma, sends, notifier, trip: makeTrip(direction), tick: (ms) => { clock += ms; return clock; }, nowMs: () => clock };
}

describe('shouldNotify', () => {
  const r = (etaSeconds, at) => ({ etaSeconds, computedAt: at, fixRecordedAt: at, at });

  test('one fresh reading below 240 s triggers', () => {
    expect(shouldNotify([], r(239, T0), T0)).toBe(true);
  });

  test('two consecutive fresh readings at or under 330 s trigger, one does not', () => {
    expect(shouldNotify([], r(330, T0), T0)).toBe(false);
    expect(shouldNotify([r(330, T0)], r(300, T0 + 15000), T0 + 15000)).toBe(true);
  });

  test('stale or missing readings never trigger', () => {
    expect(shouldNotify([], null, T0)).toBe(false);
    expect(shouldNotify([], r(100, T0 - 60000), T0)).toBe(false);
  });
});

describe('buildMessage', () => {
  test('exact pickup and drop texts', () => {
    expect(buildMessage('PICKUP', { busNo: 'RJ14-01', stopName: 'Main Gate', studentName: 'Asha', minutes: 5 })).toEqual({
      title: 'Bus arriving at pickup',
      body: "Your child's bus RJ14-01 is expected to arrive at the pickup stop (Main Gate) in approximately 5 minutes. Please be ready.",
    });
    expect(buildMessage('DROP', { busNo: 'RJ14-01', stopName: 'Park Road', studentName: 'Asha', minutes: 3 })).toEqual({
      title: 'Bus arriving at drop-off',
      body: "The school bus RJ14-01 is on the way home and will reach Asha's drop-off stop (Park Road) in about 3 minutes. Please be at the stop.",
    });
  });
});

describe('createProximityNotifier', () => {
  test('alerts only the Current_Stop students, both parents under one claim, once', async () => {
    const { prisma, sends, notifier, trip, tick, nowMs } = setup();
    // First reading 400 s: no alert. Then 320 s twice: alert with 5 minutes.
    await notifier.onEta({ busId: 'b1', trip, eta: etaAt(nowMs(), [{ tripStopId: 'ts-1', etaSeconds: 400 }, { tripStopId: 'ts-2', etaSeconds: 100 }]) });
    tick(15000);
    await notifier.onEta({ busId: 'b1', trip, eta: etaAt(nowMs(), [{ tripStopId: 'ts-1', etaSeconds: 320 }]) });
    expect(sends).toHaveLength(0);
    tick(15000);
    await notifier.onEta({ busId: 'b1', trip, eta: etaAt(nowMs(), [{ tripStopId: 'ts-1', etaSeconds: 310 }]) });

    expect(sends).toHaveLength(1);
    expect(sends[0].tokens.sort()).toEqual(['tok-a1', 'tok-a2']);
    expect(sends[0].body).toContain('(Main Gate) in approximately 5 minutes');
    expect(prisma.logs).toEqual([expect.objectContaining({ tripStopId: 'ts-1', studentId: 'st-a', type: 'ETA_5_MIN', status: 'SENT' })]);

    // Repeated readings never send again.
    tick(15000);
    await notifier.onEta({ busId: 'b1', trip, eta: etaAt(nowMs(), [{ tripStopId: 'ts-1', etaSeconds: 100 }]) });
    expect(sends).toHaveLength(1);

    // A fresh notifier (restart) is blocked by the NotificationLog claim.
    const again = createProximityNotifier({ prisma, sendMulticast: async () => { throw new Error('must not send'); }, now: nowMs, logger: silent });
    await again.onEta({ busId: 'b1', trip, eta: etaAt(nowMs(), [{ tripStopId: 'ts-1', etaSeconds: 100 }]) });
    expect(prisma.logs).toHaveLength(1);
  });

  test('initial reading under 5 minutes alerts with actual minutes; DROP uses dropStopId', async () => {
    const { sends, notifier, trip, nowMs } = setup('DROP');
    await notifier.onEta({ busId: 'b1', trip, eta: etaAt(nowMs(), [{ tripStopId: 'ts-1', etaSeconds: 170 }]) });
    expect(sends).toHaveLength(1);
    expect(sends[0].tokens).toEqual(['tok-b']); // Bharat drops at s-1; Chetan is on another bus
    expect(sends[0].title).toBe('Bus arriving at drop-off');
    expect(sends[0].body).toBe("The school bus RJ14-01 is on the way home and will reach Bharat's drop-off stop (Main Gate) in about 3 minutes. Please be at the stop.");
  });

  test('onStopClosed records SKIPPED and blocks later alerts; FCM failure records FAILED', async () => {
    const { prisma, sends, notifier, trip, nowMs } = setup();
    expect(await notifier.onStopClosed(trip, trip.stops[0])).toEqual(['st-a']);
    await notifier.onEta({ busId: 'b1', trip, eta: etaAt(nowMs(), [{ tripStopId: 'ts-1', etaSeconds: 100 }]) });
    expect(sends).toHaveLength(0);
    expect(prisma.logs).toEqual([expect.objectContaining({ studentId: 'st-a', status: 'SKIPPED' })]);

    const failing = createProximityNotifier({ prisma, sendMulticast: async () => undefined, now: nowMs, logger: silent });
    const next = { ...trip, stops: [{ ...trip.stops[0], status: 'COMPLETED' }, trip.stops[1]] };
    await failing.onEta({ busId: 'b1', trip: next, eta: etaAt(nowMs(), [{ tripStopId: 'ts-2', etaSeconds: 100 }]) });
    expect(prisma.logs[1]).toEqual(expect.objectContaining({ tripStopId: 'ts-2', studentId: 'st-b', status: 'FAILED' }));
  });
});

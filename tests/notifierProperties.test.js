// Property tests for the Proximity_Notifier (task 8.3): Properties 19, 20, 21.
// Prisma and FCM are in-memory fakes. The NotificationLog fake enforces the
// unique (tripId, tripStopId, studentId, type) key with a P2002 error, and
// every fake call yields to the event loop so concurrent onEta calls and
// several notifier instances (restarts) really interleave. No DB, no FCM.
// Validates: Requirements 10.1, 10.2, 10.4, 10.6, 10.12, 10.13, 10.14
const fc = require('fast-check');
const { createProximityNotifier, shouldNotify } = require('../src/services/proximityNotifier');

jest.setTimeout(120000);

const T0 = Date.parse('2026-01-10T07:00:00.000Z');
const silent = { warn: () => {}, error: () => {}, info: () => {}, log: () => {} };
const yieldTick = () => new Promise((r) => setImmediate(r));

// Independent oracle helpers (not taken from the module under test).
const last10 = (p) => (p ? String(p).replace(/\D/g, '').slice(-10) : '');
const ageOk = (age) => age !== null && age < 60000;

// ---------------------------------------------------------------------------
// Property 19: Notification trigger decision
// ---------------------------------------------------------------------------

// A reading spec: eta value plus the ages (ms, relative to the time the
// reading is evaluated) of the ETA computation and its GPS fix. null age =
// timestamp missing or unparsable.
const etaValueArb = fc.oneof(
  fc.constantFrom(null, undefined, NaN, Infinity, -1, -0.5, '120'),
  fc.constantFrom(0, 239, 239.9, 240, 241, 299, 300, 329, 330, 330.5, 331),
  fc.integer({ min: 0, max: 700 }),
  fc.double({ min: 0, max: 700, noNaN: true }),
);
const ageArb = fc.oneof(
  { weight: 1, arbitrary: fc.constant(null) },
  { weight: 2, arbitrary: fc.constantFrom(0, 59999, 60000, 60001) },
  { weight: 5, arbitrary: fc.integer({ min: 0, max: 120000 }) },
);
const specArb = fc.oneof(
  { weight: 1, arbitrary: fc.constant(null) },
  {
    weight: 8,
    arbitrary: fc.record({
      eta: etaValueArb,
      computedAge: ageArb,
      fixAge: ageArb,
      repr: fc.constantFrom('number', 'date', 'iso'),
      badTs: fc.constantFrom(null, undefined, 'not-a-date'),
    }),
  },
);

const toTs = (ms, repr) => (repr === 'date' ? new Date(ms) : repr === 'iso' ? new Date(ms).toISOString() : ms);

function buildReading(spec, atMs) {
  if (spec === null) return null;
  const ts = (age) => (age === null ? spec.badTs : toTs(atMs - age, spec.repr));
  return { etaSeconds: spec.eta, computedAt: ts(spec.computedAge), fixRecordedAt: ts(spec.fixAge), at: atMs };
}

const freshOracle = (spec) =>
  spec !== null
  && typeof spec.eta === 'number' && Number.isFinite(spec.eta) && spec.eta >= 0
  && ageOk(spec.computedAge) && ageOk(spec.fixAge);

// Requirement 10.1/10.2: fresh and (below 240 s, or this and the immediately
// previous computation are both fresh and at most 330 s).
function triggerOracle(specs, i) {
  const cur = specs[i];
  if (!freshOracle(cur)) return false;
  if (cur.eta < 240) return true;
  if (cur.eta > 330 || i === 0) return false;
  const prev = specs[i - 1];
  return freshOracle(prev) && prev.eta <= 330;
}

describe('Property 19: Notification trigger decision', () => {
  // Feature: live-tracking-fixed-routes, Property 19: Notification trigger decision
  // **Validates: Requirements 10.1, 10.2**
  test('shouldNotify matches the freshness + 330/240 rule over arbitrary reading sequences', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({ spec: specArb, gapMs: fc.integer({ min: 0, max: 40000 }) }), { minLength: 1, maxLength: 8 }),
        (steps) => {
          let t = T0;
          const times = steps.map((s) => (t += s.gapMs));
          const specs = steps.map((s) => s.spec);
          const readings = specs.map((spec, i) => buildReading(spec, times[i]));
          for (let i = 0; i < steps.length; i += 1) {
            const history = readings.slice(0, i).map((r, j) => r || { etaSeconds: null, at: times[j] });
            const got = shouldNotify(history, readings[i], times[i]);
            if (got !== triggerOracle(specs, i)) return false;
          }
          return true;
        },
      ),
      { numRuns: 400 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 20: Recipients are only the next stop's linked parents
// ---------------------------------------------------------------------------

const PHONES = ['9876543210', '9123456789', '9000000001', '9000000002'];
const FORMATS = [
  (d) => d,
  (d) => `+91 ${d.slice(0, 5)} ${d.slice(5)}`,
  (d) => `91${d}`,
  (d) => `0${d}`,
  (d) => `+91-${d}`,
];
const phoneArb = fc.oneof(
  { weight: 1, arbitrary: fc.constantFrom(null, '') },
  { weight: 5, arbitrary: fc.tuple(fc.constantFrom(...PHONES), fc.integer({ min: 0, max: FORMATS.length - 1 })).map(([d, f]) => FORMATS[f](d)) },
);
const BUS_IDS = ['b1', 'b2'];
const STOP_IDS = ['s-1', 's-2', 's-3'];

const studentArb = fc.record({
  name: fc.constantFrom('Asha', 'Bharat', 'Chetan', 'Divya'),
  busId: fc.constantFrom(...BUS_IDS, null),
  stopId: fc.constantFrom(...STOP_IDS),
  dropStopId: fc.constantFrom(...STOP_IDS, null),
  parentPhone: phoneArb,
  parentPhone2: phoneArb,
});
const userArb = fc.record({
  phone: phoneArb,
  fcmToken: fc.constantFrom(null, 'tok-1', 'tok-2', 'tok-3', 'tok-4', 'tok-5'),
});

const matchesWhere = (row, where = {}) =>
  Object.entries(where).every(([k, v]) => {
    if (v === null) return row[k] === null || row[k] === undefined;
    if (v && typeof v === 'object') return v.not === null ? row[k] !== null && row[k] !== undefined : true;
    return row[k] !== null && row[k] !== undefined && String(row[k]) === String(v);
  });

describe('Property 20: Recipients are only the next stop\'s linked parents', () => {
  // Feature: live-tracking-fixed-routes, Property 20: Recipients are only the next stop's linked parents
  // **Validates: Requirements 10.4, 10.12, 10.13, 10.14**
  test('findRecipients returns exactly the eligible students with their linked parents\' deduplicated tokens', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(studentArb, { maxLength: 8 }),
        fc.array(userArb, { maxLength: 8 }),
        fc.constantFrom(...BUS_IDS),
        fc.constantFrom('PICKUP', 'DROP'),
        fc.constantFrom(...STOP_IDS),
        fc.boolean(), // whether the fake honours `where` (false = returns a superset)
        async (rawStudents, users, busId, direction, stopId, honourWhere) => {
          const students = rawStudents.map((s, i) => ({ id: `st-${i}`, ...s }));
          const prisma = {
            student: {
              findMany: async ({ where } = {}) => students.filter((s) => !honourWhere || matchesWhere(s, where)).map((s) => ({ ...s })),
            },
            user: {
              findMany: async ({ where } = {}) => users.filter((u) => !honourWhere || matchesWhere(u, where)).map((u) => ({ ...u })),
            },
            bus: { findUnique: async ({ where }) => ({ id: where.id, busNo: 'RJ14-01' }) },
          };
          const notifier = createProximityNotifier({ prisma, sendMulticast: async () => { throw new Error('no send'); }, logger: silent });
          const trip = { id: 'trip-1', busId, direction, status: 'ACTIVE' };
          const tripStop = { id: 'ts-1', tripId: 'trip-1', stopId, name: 'Main Gate', order: 1, status: 'PENDING' };

          const result = await notifier.findRecipients(trip, tripStop);

          const field = direction === 'DROP' ? 'dropStopId' : 'stopId';
          const expected = students
            .filter((s) => s.busId === busId && s[field] === stopId)
            .map((s) => {
              const phones = new Set([last10(s.parentPhone), last10(s.parentPhone2)].filter(Boolean));
              const tokens = new Set(users.filter((u) => u.fcmToken && phones.has(last10(u.phone))).map((u) => u.fcmToken));
              return { studentId: s.id, studentName: s.name, tokens: [...tokens].sort() };
            })
            .sort((a, b) => a.studentId.localeCompare(b.studentId));

          // Tokens per entry are deduplicated.
          for (const r of result) {
            if (new Set(r.tokens).size !== r.tokens.length) return false;
            if (r.stopName !== 'Main Gate' || r.busNo !== 'RJ14-01') return false;
          }
          const got = result
            .map((r) => ({ studentId: r.studentId, studentName: r.studentName, tokens: [...r.tokens].sort() }))
            .sort((a, b) => a.studentId.localeCompare(b.studentId));
          expect(got).toEqual(expected);
          return true;
        },
      ),
      { numRuns: 300 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 21: At most one alert per student per stop
// ---------------------------------------------------------------------------

// Fixed population: several students per stop, shared parents, another bus.
const P21_STUDENTS = [
  { id: 'st-1', name: 'Asha', busId: 'b1', stopId: 's-1', dropStopId: 's-3', parentPhone: '9876543210', parentPhone2: '9123456789' },
  { id: 'st-2', name: 'Bharat', busId: 'b1', stopId: 's-1', dropStopId: 's-2', parentPhone: '+91 98765 43210', parentPhone2: null },
  { id: 'st-3', name: 'Chetan', busId: 'b1', stopId: 's-2', dropStopId: 's-1', parentPhone: '9000000001', parentPhone2: null },
  { id: 'st-4', name: 'Divya', busId: 'b2', stopId: 's-3', dropStopId: 's-3', parentPhone: '9000000002', parentPhone2: null },
  { id: 'st-5', name: 'Esha', busId: 'b1', stopId: 's-3', dropStopId: 's-1', parentPhone: '9000000002', parentPhone2: '9000000001' },
];
const P21_USERS = [
  { phone: '919876543210', fcmToken: 'tok-a' },
  { phone: '9123456789', fcmToken: 'tok-b' },
  { phone: '9000000001', fcmToken: 'tok-c' },
  { phone: '09000000002', fcmToken: 'tok-d' },
];

function makeWorld(direction) {
  const trip = {
    id: 'trip-1',
    busId: 'b1',
    direction,
    status: 'ACTIVE',
    bus: { busNo: 'RJ14-01' },
    stops: STOP_IDS.map((stopId, i) => ({ id: `ts-${i + 1}`, tripId: 'trip-1', stopId, order: i + 1, name: `Stop ${i + 1}`, lat: i, lng: i, status: 'PENDING' })),
  };
  const logs = [];
  const logKey = (d) => `${d.tripId}|${d.tripStopId}|${d.studentId}|${d.type}`;
  const prisma = {
    student: {
      findMany: async ({ where } = {}) => { await yieldTick(); return P21_STUDENTS.filter((s) => matchesWhere(s, where)).map((s) => ({ ...s })); },
    },
    user: {
      findMany: async ({ where } = {}) => { await yieldTick(); return P21_USERS.filter((u) => matchesWhere(u, where)).map((u) => ({ ...u })); },
    },
    bus: { findUnique: async ({ where }) => ({ id: where.id, busNo: 'RJ14-01' }) },
    stop: { findUnique: async ({ where }) => { await yieldTick(); return { id: where.id, needsLocation: false }; } },
    tripStop: {
      findUnique: async ({ where }) => {
        await yieldTick();
        const row = trip.stops.find((s) => s.id === where.id);
        return row ? { ...row } : null;
      },
    },
    notificationLog: {
      // Check-and-insert is atomic (after the yield), like the DB unique index.
      create: async ({ data }) => {
        await yieldTick();
        if (logs.some((l) => logKey(l) === logKey(data))) {
          const err = new Error('Unique constraint failed on the fields: (`tripId`,`tripStopId`,`studentId`,`type`)');
          err.code = 'P2002';
          throw err;
        }
        const row = { id: `log-${logs.length + 1}`, ...data };
        logs.push(row);
        return row;
      },
      update: async ({ where, data }) => {
        await yieldTick();
        const w = where.tripId_tripStopId_studentId_type;
        const row = logs.find((l) => logKey(l) === logKey(w));
        if (!row) {
          const err = new Error('Record to update not found.');
          err.code = 'P2025';
          throw err;
        }
        Object.assign(row, data);
        return row;
      },
    },
  };
  return { trip, logs, prisma };
}

const snapshot = (trip) => ({ ...trip, stops: trip.stops.map((s) => ({ ...s })) });

const etaOpArb = fc.record({
  kind: fc.constant('eta'),
  instance: fc.integer({ min: 0, max: 2 }),
  etaSeconds: fc.oneof(fc.integer({ min: 60, max: 420 }), fc.constantFrom(239, 300, 330, 331)),
  computedAge: fc.integer({ min: 0, max: 70000 }),
  fixAge: fc.integer({ min: 0, max: 70000 }),
  staleSnapshot: fc.boolean(), // ETA computed from a trip snapshot taken before an earlier close
  duplicate: fc.integer({ min: 1, max: 3 }), // same ETA/fix delivered several times at once
});
const closeOpArb = fc.record({
  kind: fc.constant('close'),
  instance: fc.integer({ min: 0, max: 2 }),
  skip: fc.boolean(),
});
const stepArb = fc.oneof(
  { weight: 6, arbitrary: fc.record({ kind: fc.constant('batch'), tickMs: fc.integer({ min: 0, max: 30000 }), ops: fc.array(fc.oneof({ weight: 4, arbitrary: etaOpArb }, { weight: 1, arbitrary: closeOpArb }), { minLength: 1, maxLength: 4 }) }) },
  { weight: 1, arbitrary: fc.record({ kind: fc.constant('restart'), instance: fc.integer({ min: 0, max: 2 }) }) },
);

describe('Property 21: At most one alert per student per stop', () => {
  // Feature: live-tracking-fixed-routes, Property 21: At most one alert per student per stop
  // **Validates: Requirements 10.6**
  test('sendMulticast is called at most once per (trip, TripStop, student, type) across repeats, duplicates, concurrency and restarts', async () => {
    let totalSends = 0;
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('PICKUP', 'DROP'),
        fc.array(stepArb, { minLength: 1, maxLength: 12 }),
        fc.boolean(), // whether FCM reports failures (FAILED must not allow a resend)
        async (direction, steps, fcmFails) => {
          const { trip, logs, prisma } = makeWorld(direction);
          let clock = T0;
          const sends = [];
          const sendMulticast = async (tokens, title, body, data) => {
            await yieldTick();
            sends.push({ tokens: [...tokens], data: { ...data } });
            return fcmFails ? { successCount: 0, failureCount: tokens.length } : { successCount: tokens.length, failureCount: 0 };
          };
          const make = () => createProximityNotifier({ prisma, sendMulticast, now: () => clock, logger: silent });
          const instances = [make(), make(), make()];
          let oldSnapshot = snapshot(trip);

          for (const step of steps) {
            if (step.kind === 'restart') {
              instances[step.instance] = make();
              continue;
            }
            clock += step.tickMs;
            const before = snapshot(trip);
            const calls = [];
            for (const op of step.ops) {
              if (op.kind === 'close') {
                const cur = trip.stops.find((s) => s.status === 'PENDING' || s.status === 'ARRIVED');
                if (!cur) continue;
                cur.status = op.skip ? 'SKIPPED' : 'COMPLETED';
                calls.push(instances[op.instance].onStopClosed(snapshot(trip), { ...cur }));
              } else {
                const tripArg = op.staleSnapshot ? oldSnapshot : before;
                const eta = {
                  perStop: tripArg.stops.map((s, i) => ({ tripStopId: s.id, etaSeconds: op.etaSeconds + i * 120 })),
                  school: { etaSeconds: op.etaSeconds + 600 },
                  computedAt: clock - op.computedAge,
                  fixRecordedAt: clock - op.fixAge,
                };
                for (let k = 0; k < op.duplicate; k += 1) {
                  calls.push(instances[op.instance].onEta({ busId: 'b1', trip: snapshot(tripArg), fix: { recordedAt: eta.fixRecordedAt }, eta }));
                }
              }
            }
            await Promise.all(calls);
            oldSnapshot = before;
          }

          totalSends += sends.length;
          const counts = new Map();
          for (const s of sends) {
            const key = `${s.data.tripId}|${s.data.tripStopId}|${s.data.studentId}|${s.data.type}`;
            counts.set(key, (counts.get(key) || 0) + 1);
            // Every send is backed by its claimed NotificationLog row.
            if (!logs.some((l) => `${l.tripId}|${l.tripStopId}|${l.studentId}|${l.type}` === key)) return false;
          }
          return [...counts.values()].every((n) => n <= 1);
        },
      ),
      { numRuns: 150 },
    );
    // Guard against a vacuous pass: the generated scenarios do send alerts.
    expect(totalSends).toBeGreaterThan(0);
  });
});

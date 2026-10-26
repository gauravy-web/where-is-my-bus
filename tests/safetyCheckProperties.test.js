// Property tests for the Safety_Check service (task 17.3). No database: a
// fake prisma enforces the Attendance unique key (tripId, studentId, type)
// by throwing P2002, like the real unique index.
const fc = require('fast-check');
const { createSafetyCheckService, isEligible, expectedType } = require('../src/services/safetyCheckService');

const ADMIN = { id: 'u-admin', role: 'ADMIN' };
const flush = () => new Promise((r) => setImmediate(r));
const tick = (n) => (n > 0 ? Promise.resolve().then(() => tick(n - 1)) : Promise.resolve());

function makeFakePrisma({ trip, stops, student, delays }) {
  const rows = [];
  let seq = 0;
  let d = 0;
  const nextDelay = () => delays[d++ % delays.length];
  const matches = (row, where) => Object.entries(where).every(([k, v]) => row[k] === v);
  return {
    rows,
    trip: { findUnique: async ({ where }) => (where.id === trip.id ? { ...trip } : null) },
    tripStop: { findMany: async ({ where }) => stops.filter((s) => s.tripId === where.tripId) },
    student: { findUnique: async ({ where }) => (where.id === student.id ? { ...student } : null) },
    attendance: {
      create: async ({ data }) => {
        await tick(nextDelay()); // let concurrent calls interleave
        // Check-and-insert is atomic, like the unique index.
        if (rows.some((r) => r.tripId === data.tripId && r.studentId === data.studentId && r.type === data.type)) {
          const err = new Error('Unique constraint failed');
          err.code = 'P2002';
          throw err;
        }
        const row = { id: `att-${++seq}`, ...data };
        rows.push(row);
        return { ...row };
      },
      findFirst: async ({ where }) => {
        await tick(nextDelay());
        const row = rows.find((r) => matches(r, where));
        return row ? { ...row } : null;
      },
      findMany: async ({ where }) => rows.filter((r) => matches(r, where)).map((r) => ({ ...r })),
    },
  };
}

// Feature: live-tracking-fixed-routes, Property 31: Safety check idempotence
// **Validates: Requirements 18.4**
describe('Property 31: Safety check idempotence', () => {
  test('repeated or concurrent submissions leave one Attendance row and one alert', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('PICKUP', 'DROP'),
        fc.integer({ min: 1, max: 6 }),
        fc.boolean(),
        fc.array(fc.integer({ min: 0, max: 4 }), { minLength: 1, maxLength: 8 }),
        async (direction, submissions, concurrent, delays) => {
          const trip = { id: 't1', busId: 'b1', direction, status: 'ACTIVE', startedAt: '2026-01-05T03:00:00.000Z' };
          const stops = [
            { id: 'ts1', tripId: 't1', stopId: 's1', order: 1, status: 'PENDING' },
            { id: 'ts2', tripId: 't1', stopId: 's2', order: 2, status: 'COMPLETED' },
          ];
          const student = { id: 'st1', busId: 'b1', stopId: 's1', dropStopId: 's2' };
          const prisma = makeFakePrisma({ trip, stops, student, delays });
          const alerts = [];
          const svc = createSafetyCheckService({
            prisma,
            accessService: {},
            now: () => new Date('2026-01-05T03:10:00.000Z'),
            onSafetyCheck: (check) => { alerts.push(check); },
          });
          const type = expectedType(trip);
          const call = () => svc.recordCheck(ADMIN, 't1', 'st1', type);

          let results;
          if (concurrent) {
            results = await Promise.all(Array.from({ length: submissions }, call));
          } else {
            results = [];
            for (let i = 0; i < submissions; i++) results.push(await call());
          }
          await flush();

          const keyRows = prisma.rows.filter((r) => r.tripId === 't1' && r.studentId === 'st1' && r.type === type);
          expect(keyRows).toHaveLength(1);
          expect(results.filter((r) => r.created)).toHaveLength(1);
          expect(new Set(results.map((r) => r.check.id))).toEqual(new Set([keyRows[0].id]));
          expect(alerts).toHaveLength(1);
          expect(alerts[0].id).toBe(keyRows[0].id);
        },
      ),
      { numRuns: 100 },
    );
  });
});

// Feature: live-tracking-fixed-routes, Property 33: Safety check eligibility
// **Validates: Requirements 18.7**
describe('Property 33: Safety check eligibility', () => {
  const idArb = fc.constantFrom('a', 'b', 'c', '', null, undefined);
  const statusArb = fc.constantFrom('PENDING', 'ARRIVED', 'COMPLETED', 'SKIPPED', 'CANCELLED');

  // Independent oracle written from the requirement text.
  const present = (v) => typeof v === 'string' && v.length > 0;
  function oracle(student, trip) {
    if (!present(student.busId) || student.busId !== trip.busId) return false;
    const relevant = trip.direction === 'PICKUP' ? student.stopId
      : trip.direction === 'DROP' ? student.dropStopId : null;
    if (!present(relevant)) return false;
    return trip.stops.some((ts) => ts.stopId === relevant && ts.status !== 'CANCELLED');
  }

  test('isEligible matches the bus + non-cancelled Relevant_Stop rule', () => {
    fc.assert(
      fc.property(
        fc.record({ busId: idArb, stopId: idArb, dropStopId: idArb }),
        fc.record({
          busId: idArb,
          direction: fc.constantFrom('PICKUP', 'DROP', 'OTHER'),
          stops: fc.array(fc.record({ stopId: idArb, status: statusArb }), { maxLength: 5 }),
        }),
        (student, trip) => {
          expect(isEligible(student, trip)).toBe(oracle(student, trip));
        },
      ),
      { numRuns: 500 },
    );
  });
});

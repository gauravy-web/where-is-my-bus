// Property tests for drop stop assignment (Requirement 5.8) and the stop-order
// dry-run analyzer (Requirements 5.11, 6.3). Pure functions only: no DB, no HTTP.
const fc = require('fast-check');
const { validateDropStop } = require('../src/services/stopService');
const { analyzeOrders } = require('../scripts/checkStopOrder');

const RUNS = { numRuns: 200 };
const BUS_POOL = ['bus-1', 'bus-2', 'bus-3'];
// undefined/null/'' and an omitted key all mean a legacy PICKUP row.
const DIRECTION_POOL = ['PICKUP', 'DROP', undefined, null, ''];
const MISSING = Symbol('missing');

const effectiveDirection = (d) => (d === 'PICKUP' || d === 'DROP' ? d : 'PICKUP');

// Build a stop, sometimes omitting the direction key entirely.
const withDirection = (base, direction, omit) =>
  omit ? { ...base } : { ...base, direction };

// Feature: live-tracking-fixed-routes, Property 8: Drop stop assignment validation
// **Validates: Requirements 5.8**
describe('Property 8: Drop stop assignment validation', () => {
  const studentArb = fc.record({
    id: fc.uuid(),
    busId: fc.constantFrom(...BUS_POOL, null),
  });
  const stopArb = fc.option(
    fc
      .record({
        id: fc.uuid(),
        busId: fc.constantFrom(...BUS_POOL),
        direction: fc.constantFrom(...DIRECTION_POOL, MISSING),
        order: fc.integer({ min: 1, max: 20 }),
      })
      .map(({ direction, ...rest }) =>
        withDirection(rest, direction, direction === MISSING)
      ),
    { nil: null, freq: 5 }
  );

  test('ok iff stop exists, is on the student bus and is a DROP stop', () => {
    fc.assert(
      fc.property(studentArb, stopArb, (student, stop) => {
        const expected =
          stop !== null &&
          student.busId !== null &&
          stop.busId === student.busId &&
          effectiveDirection(stop.direction) === 'DROP';
        const result = validateDropStop(student, stop);
        expect(result.ok).toBe(expected);
        if (expected) {
          expect(result.reason).toBeNull();
        } else {
          expect(typeof result.reason).toBe('string');
          expect(result.reason.length).toBeGreaterThan(0);
        }
      }),
      RUNS
    );
  });
});

// Independent oracle for one group's orders.
function oracle(orders) {
  const n = orders.length;
  const valid = (v) => typeof v === 'number' && Number.isFinite(v) && Math.floor(v) === v && v >= 1;
  const nonInteger = orders.filter((v) => !valid(v));
  const counts = {};
  orders.filter(valid).forEach((v) => {
    counts[v] = (counts[v] || 0) + 1;
  });
  const duplicates = Object.keys(counts)
    .map(Number)
    .filter((v) => counts[v] > 1)
    .sort((a, b) => a - b);
  const gaps = [];
  for (let i = 1; i <= n; i += 1) if (!counts[i]) gaps.push(i);
  // Clean means: sorted orders are exactly [1, 2, ..., n].
  const sorted = [...orders].sort((a, b) => a - b);
  const clean = sorted.every((v, i) => v === i + 1);
  return { clean, duplicates, gaps, nonInteger, count: n };
}

const asMultiset = (values) => values.map(String).sort();

// Feature: live-tracking-fixed-routes, Property 9: Order analyzer reports exactly the ambiguous sequences
// **Validates: Requirements 5.11, 6.3**
describe('Property 9: Order analyzer reports exactly the ambiguous sequences', () => {
  // A group key: bus + effective direction. Each key is generated once so a
  // "clean" group is never merged with another group's orders.
  const keyArb = fc.record({
    busId: fc.constantFrom(...BUS_POOL),
    direction: fc.constantFrom('PICKUP', 'DROP'),
  });

  const orderValueArb = fc.oneof(
    { weight: 8, arbitrary: fc.integer({ min: 1, max: 8 }) },
    { weight: 1, arbitrary: fc.constantFrom(0, -1, 1.5, 2.25, NaN) }
  );

  const groupArb = fc
    .tuple(keyArb, fc.boolean(), fc.integer({ min: 1, max: 7 }))
    .chain(([key, clean, n]) => {
      const ordersArb = clean
        ? fc.shuffledSubarray(
            Array.from({ length: n }, (_, i) => i + 1),
            { minLength: n, maxLength: n }
          )
        : fc.array(orderValueArb, { minLength: 1, maxLength: 7 });
      // Pickup groups store direction in any legacy form.
      const storedDirArb =
        key.direction === 'PICKUP'
          ? fc.constantFrom('PICKUP', undefined, null, '', MISSING)
          : fc.constant('DROP');
      return fc.tuple(fc.constant(key), ordersArb, fc.array(storedDirArb, { minLength: 7, maxLength: 7 }));
    })
    .map(([key, orders, dirs]) => ({
      key,
      stops: orders.map((order, i) =>
        withDirection({ id: `${key.busId}-${key.direction}-${i}`, busId: key.busId, order }, dirs[i], dirs[i] === MISSING)
      ),
    }));

  const inputArb = fc
    .uniqueArray(groupArb, {
      selector: (g) => `${g.key.busId}|${g.key.direction}`,
      maxLength: 6,
    })
    .chain((groups) =>
      fc.tuple(
        fc.constant(groups),
        fc.shuffledSubarray(groups.flatMap((g) => g.stops), {
          minLength: groups.reduce((s, g) => s + g.stops.length, 0),
        })
      )
    );

  test('reports a group iff its orders are not exactly 1..N, with matching details, and writes nothing', () => {
    fc.assert(
      fc.property(inputArb, ([groups, stops]) => {
        const snapshot = JSON.stringify(stops, (k, v) => (Number.isNaN(v) ? 'NaN' : v));
        const report = analyzeOrders(stops);

        // Analysis performs no writes: input is unchanged.
        expect(JSON.stringify(stops, (k, v) => (Number.isNaN(v) ? 'NaN' : v))).toBe(snapshot);

        const reported = new Map(report.map((r) => [`${r.busId}|${r.direction}`, r]));
        // Every reported group is one that exists in the input.
        expect(reported.size).toBe(report.length);

        for (const g of groups) {
          const k = `${g.key.busId}|${g.key.direction}`;
          const o = oracle(g.stops.map((s) => s.order));
          const entry = reported.get(k);
          if (o.clean) {
            expect(entry).toBeUndefined();
            continue;
          }
          expect(entry).toBeDefined();
          expect(entry.count).toBe(o.count);
          expect(entry.duplicates).toEqual(o.duplicates);
          expect(entry.gaps).toEqual(o.gaps);
          // The order of invalid values is unspecified: compare as multisets.
          expect(asMultiset(entry.nonInteger)).toEqual(asMultiset(o.nonInteger));

          // Requirement 6.3 link: a duplicate-order sequence (one trip start
          // must refuse with 409) is always reported with its duplicates.
          if (o.duplicates.length > 0) expect(entry.duplicates.length).toBeGreaterThan(0);
        }

        const expectedKeys = groups
          .filter((g) => !oracle(g.stops.map((s) => s.order)).clean)
          .map((g) => `${g.key.busId}|${g.key.direction}`)
          .sort();
        expect([...reported.keys()].sort()).toEqual(expectedKeys);
      }),
      RUNS
    );
  });

  test('a single clean group in any storage order is never reported', () => {
    fc.assert(
      fc.property(
        keyArb,
        fc.integer({ min: 1, max: 12 }).chain((n) =>
          fc.shuffledSubarray(Array.from({ length: n }, (_, i) => i + 1), { minLength: n, maxLength: n })
        ),
        (key, orders) => {
          const stops = orders.map((order, i) => ({ id: `s${i}`, busId: key.busId, direction: key.direction, order }));
          expect(analyzeOrders(stops)).toEqual([]);
        }
      ),
      RUNS
    );
  });
});

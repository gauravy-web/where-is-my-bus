// Property tests for stop sequences (Stop_Service).
// Uses createStopService with an in-memory fake Prisma. The fake's findMany
// ignores orderBy and returns rows in storage order, so any ordering in the
// results must come from the service itself.

const fc = require('fast-check');
const { createStopService } = require('../src/services/stopService');

const RUNS = { numRuns: 100 };
const BUSES = ['bus-a', 'bus-b', 'bus-c'];
const DIRS = ['PICKUP', 'DROP'];

// ---------------------------------------------------------------------------
// Fake Prisma
// ---------------------------------------------------------------------------

const clone = (v) => JSON.parse(JSON.stringify(v));

function matches(row, where = {}) {
  return Object.entries(where).every(([k, v]) => row[k] === v);
}

function createFakePrisma(initial) {
  const state = clone(initial); // { stops: [], students: [] }

  const findIndex = (list, id) => list.findIndex((r) => r.id === id);
  const notFound = () => Object.assign(new Error('Record not found'), { code: 'P2025' });

  const client = {
    state,
    bus: {
      async findUnique({ where }) {
        return state.stops.some((s) => s.busId === where.id) ? { id: where.id } : null;
      },
    },
    stop: {
      // orderBy intentionally ignored: rows come back in storage order.
      async findMany({ where } = {}) {
        return state.stops.filter((s) => matches(s, where)).map((s) => ({ ...s }));
      },
      async findUnique({ where }) {
        const row = state.stops.find((s) => s.id === where.id);
        return row ? { ...row } : null;
      },
      async create({ data }) {
        const row = { id: `new-${state.stops.length}-${Date.now()}`, ...data };
        state.stops.push(row);
        return { ...row };
      },
      async update({ where, data }) {
        const i = findIndex(state.stops, where.id);
        if (i < 0) throw notFound();
        Object.assign(state.stops[i], data);
        return { ...state.stops[i] };
      },
      async updateMany({ where, data }) {
        let count = 0;
        state.stops.forEach((s) => {
          if (matches(s, where)) { Object.assign(s, data); count += 1; }
        });
        return { count };
      },
      async delete({ where }) {
        const i = findIndex(state.stops, where.id);
        if (i < 0) throw notFound();
        const [row] = state.stops.splice(i, 1);
        return { ...row };
      },
    },
    student: {
      async updateMany({ where, data }) {
        let count = 0;
        state.students.forEach((s) => {
          if (matches(s, where)) { Object.assign(s, data); count += 1; }
        });
        return { count };
      },
    },
    // Interactive transaction: on throw, restore the snapshot and rethrow.
    async $transaction(fn) {
      const snapshot = clone({ stops: state.stops, students: state.students });
      try {
        return await fn(client);
      } catch (err) {
        state.stops.splice(0, state.stops.length, ...snapshot.stops);
        state.students.splice(0, state.students.length, ...snapshot.students);
        throw err;
      }
    },
  };
  return client;
}

// ---------------------------------------------------------------------------
// Generators and helpers
// ---------------------------------------------------------------------------

// Saved order then id (string compare): the expected sequence order.
function bySavedOrder(a, b) {
  if (a.order !== b.order) return a.order - b.order;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

const groupOf = (stops, busId, direction) =>
  stops.filter((s) => s.busId === busId && s.direction === direction);

const key = (s) => `${s.busId}|${s.direction}`;

// Stops across several buses and both directions. Coordinates are drawn
// independently of order (or deliberately anti-correlated with it), and the
// storage order is a random permutation, so neither geography nor insertion
// order matches the saved order.
const stopsArb = fc
  .array(
    fc.record({
      busId: fc.constantFrom(...BUSES),
      direction: fc.constantFrom(...DIRS),
      order: fc.integer({ min: 1, max: 15 }),
      lat: fc.double({ min: -60, max: 60, noNaN: true }),
      lng: fc.double({ min: -170, max: 170, noNaN: true }),
    }),
    { maxLength: 18 },
  )
  .chain((raw) =>
    fc.tuple(
      fc.constant(raw),
      fc.shuffledSubarray(raw.map((_, i) => i), { minLength: raw.length, maxLength: raw.length }),
      fc.boolean(),
    ),
  )
  .map(([raw, perm, antiCorrelate]) =>
    perm.map((i) => {
      const s = raw[i];
      return {
        id: `stop-${i}`,
        name: `Stop ${i}`,
        ...s,
        // Geography that suggests the reverse of the saved order.
        lat: antiCorrelate ? 50 - s.order * 2 + s.lat / 1000 : s.lat,
      };
    }),
  );

// Students linked to pickup stops (stopId) and drop stops (dropStopId).
function studentsArb(stops) {
  const pickupIds = stops.filter((s) => s.direction === 'PICKUP').map((s) => s.id);
  const dropIds = stops.filter((s) => s.direction === 'DROP').map((s) => s.id);
  const link = (ids) => (ids.length ? fc.option(fc.constantFrom(...ids), { nil: null }) : fc.constant(null));
  return fc.array(
    fc.record({ stopId: link(pickupIds), dropStopId: link(dropIds) }),
    { maxLength: 8 },
  ).map((list) => list.map((s, i) => ({ id: `student-${i}`, ...s })));
}

const ordersById = (stops) => Object.fromEntries(stops.map((s) => [s.id, s.order]));

const isPermutationOf = (list, ids) =>
  list.length === ids.length &&
  new Set(list).size === list.length &&
  list.every((id) => ids.includes(id));

// ---------------------------------------------------------------------------
// Property 5
// ---------------------------------------------------------------------------

describe('stop sequence properties', () => {
  // Feature: live-tracking-fixed-routes, Property 5: Stop sequences keep saved order
  // **Validates: Requirements 5.2, 5.3**
  test('Property 5: listStops returns the bus+direction stops in saved order regardless of coordinates', async () => {
    await fc.assert(
      fc.asyncProperty(
        stopsArb,
        fc.constantFrom(...BUSES),
        fc.constantFrom(...DIRS),
        async (stops, busId, direction) => {
          const prisma = createFakePrisma({ stops, students: [] });
          const service = createStopService(prisma);

          const result = await service.listStops({ busId, direction });
          const expected = groupOf(stops, busId, direction).sort(bySavedOrder);

          expect(result.map((s) => s.id)).toEqual(expected.map((s) => s.id));
          expect(result.every((s) => s.busId === busId && s.direction === direction)).toBe(true);
        },
      ),
      RUNS,
    );
  });

  // -------------------------------------------------------------------------
  // Property 6
  // -------------------------------------------------------------------------

  // Feature: live-tracking-fixed-routes, Property 6: Reorder is scoped and validated
  // **Validates: Requirements 5.4, 5.5**
  test('Property 6: reorder succeeds iff the list is a permutation of the bus+direction ids', async () => {
    const caseArb = stopsArb.chain((stops) =>
      fc
        .tuple(fc.constantFrom(...BUSES), fc.constantFrom(...DIRS))
        .chain(([busId, direction]) => {
          const ids = groupOf(stops, busId, direction).map((s) => s.id);
          const allIds = stops.map((s) => s.id);
          const foreignPool = [...allIds.filter((id) => !ids.includes(id)), 'ghost-stop'];
          const perm = fc.shuffledSubarray(ids, { minLength: ids.length, maxLength: ids.length });

          const request = fc.oneof(
            // valid permutation
            perm,
            // one id missing
            perm.map((p) => p.slice(1)),
            // one id duplicated
            perm.chain((p) => (p.length
              ? fc.nat(p.length - 1).map((i) => [...p, p[i]])
              : fc.constant(p))),
            // one foreign id added or swapped in
            fc.tuple(perm, fc.constantFrom(...foreignPool), fc.boolean())
              .map(([p, f, swap]) => (swap && p.length ? [f, ...p.slice(1)] : [...p, f])),
            // arbitrary list from all known ids
            fc.array(fc.constantFrom(...allIds, 'ghost-stop'), { maxLength: 10 }),
          );
          return fc.tuple(fc.constant(stops), fc.constant(busId), fc.constant(direction), request);
        }),
    );

    await fc.assert(
      fc.asyncProperty(caseArb, async ([stops, busId, direction, stopIds]) => {
        const prisma = createFakePrisma({ stops, students: [] });
        const service = createStopService(prisma);
        const before = ordersById(prisma.state.stops);
        const beforeState = clone(prisma.state.stops);
        const groupIds = groupOf(stops, busId, direction).map((s) => s.id);

        if (isPermutationOf(stopIds, groupIds)) {
          await service.reorderStops({ busId, direction, stopIds });
          const after = ordersById(prisma.state.stops);
          stopIds.forEach((id, i) => expect(after[id]).toBe(i + 1));
          prisma.state.stops
            .filter((s) => !(s.busId === busId && s.direction === direction))
            .forEach((s) => expect(after[s.id]).toBe(before[s.id]));
          expect(prisma.state.stops).toHaveLength(stops.length);
        } else {
          await expect(service.reorderStops({ busId, direction, stopIds }))
            .rejects.toMatchObject({ status: 400 });
          expect(prisma.state.stops).toEqual(beforeState);
        }
      }),
      RUNS,
    );
  });

  // -------------------------------------------------------------------------
  // Property 7
  // -------------------------------------------------------------------------

  // Feature: live-tracking-fixed-routes, Property 7: Delete renumbers within direction
  // **Validates: Requirements 5.6**
  test('Property 7: deleting a stop renumbers its bus+direction to 1..N and clears the matching student link', async () => {
    const caseArb = stopsArb
      .filter((stops) => stops.length > 0)
      .chain((stops) =>
        fc.tuple(fc.constant(stops), fc.constantFrom(...stops.map((s) => s.id)), studentsArb(stops)),
      );

    await fc.assert(
      fc.asyncProperty(caseArb, async ([stops, deleteId, students]) => {
        const prisma = createFakePrisma({ stops, students });
        const service = createStopService(prisma);
        const target = stops.find((s) => s.id === deleteId);
        const before = ordersById(stops);

        const expectedRemaining = groupOf(stops, target.busId, target.direction)
          .sort(bySavedOrder)
          .filter((s) => s.id !== deleteId)
          .map((s) => s.id);

        await service.deleteStop(deleteId);
        const after = prisma.state.stops;

        // Deleted stop is gone; nothing else was removed.
        expect(after.some((s) => s.id === deleteId)).toBe(false);
        expect(after).toHaveLength(stops.length - 1);

        // Same bus+direction: 1..N in previous relative order.
        const group = groupOf(after, target.busId, target.direction).sort(bySavedOrder);
        expect(group.map((s) => s.id)).toEqual(expectedRemaining);
        expect(group.map((s) => s.order)).toEqual(expectedRemaining.map((_, i) => i + 1));

        // Every other bus/direction group unchanged.
        after
          .filter((s) => key(s) !== key(target))
          .forEach((s) => expect(s.order).toBe(before[s.id]));

        // Matching student link cleared, other links untouched.
        const field = target.direction === 'DROP' ? 'dropStopId' : 'stopId';
        const other = field === 'stopId' ? 'dropStopId' : 'stopId';
        prisma.state.students.forEach((st, i) => {
          const orig = students[i];
          expect(st[field]).toBe(orig[field] === deleteId ? null : orig[field]);
          expect(st[other]).toBe(orig[other]);
        });
      }),
      RUNS,
    );
  });
});

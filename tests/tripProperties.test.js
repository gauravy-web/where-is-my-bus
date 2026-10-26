// Property tests for Trip_Service (task 5.3): Properties 10, 11, 12 and 32.
// Prisma is an in-memory fake (adapted from tripService.test.js): rows are
// kept in random storage order, findMany ignores orderBy and returns rows
// shuffled, so any ordering must come from the service. $transaction rolls
// back on throw. No DB.
// Validates: Requirements 6.1, 6.2, 6.4, 6.5, 6.7, 6.11, 6.12, 6.13
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/testdb';
process.env.JWT_SECRET = 'test-jwt-secret';

const fc = require('fast-check');
const {
  createTripService, TripServiceError, currentStop, remainingDestination, routeWaypoints,
} = require('../src/services/tripService');

jest.setTimeout(120000);

const RUNS = 120;
const FIXED_NOW = new Date('2026-09-01T08:00:00.000Z');
const BUSES = ['bus-1', 'bus-2', 'bus-3'];
const DIRS = ['PICKUP', 'DROP'];
const OPEN = ['PENDING', 'ARRIVED'];

// Deep clone that keeps Date and NaN (JSON would not).
function deepClone(x) {
  if (x instanceof Date) return new Date(x.getTime());
  if (Array.isArray(x)) return x.map(deepClone);
  if (x && typeof x === 'object') {
    const out = {};
    Object.keys(x).forEach((k) => { out[k] = deepClone(x[k]); });
    return out;
  }
  return x;
}

// Small seeded PRNG so storage order is reproducible from the fast-check seed.
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(rows, rand) {
  const out = [...rows];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function createFakePrisma(seed = {}, rand = Math.random) {
  const keys = ['stops', 'students', 'buses', 'schools', 'trips', 'tripStops'];
  const state = {};
  keys.forEach((k) => { state[k] = shuffle((seed[k] || []).map((r) => ({ ...r })), rand); });
  let seq = 0;
  const clone = (x) => (x ? { ...x } : null);

  const matches = (row, where = {}) => Object.entries(where).every(([k, v]) => {
    if (v && typeof v === 'object' && !(v instanceof Date)) {
      if ('in' in v) return v.in.includes(row[k]);
      if ('not' in v) return row[k] !== v.not;
      return true;
    }
    return row[k] === v;
  });

  // orderBy is ignored everywhere: results come back in shuffled order.
  const model = (key) => ({
    findMany: async (args = {}) => shuffle(state[key].filter((r) => matches(r, args.where)), rand).map(clone),
    findUnique: async (args = {}) => clone(state[key].find((r) => matches(r, args.where))),
    findFirst: async (args = {}) => clone(state[key].find((r) => matches(r, args.where))),
    create: async ({ data }) => {
      seq += 1;
      const row = { id: `${key}-${String(seq).padStart(4, '0')}`, ...data };
      state[key].splice(Math.floor(rand() * (state[key].length + 1)), 0, row);
      return clone(row);
    },
    update: async ({ where, data }) => {
      const row = state[key].find((r) => r.id === where.id);
      if (!row) throw Object.assign(new Error('Record not found'), { code: 'P2025' });
      Object.assign(row, data);
      return clone(row);
    },
    updateMany: async ({ where, data }) => {
      const rows = state[key].filter((r) => matches(r, where));
      rows.forEach((r) => Object.assign(r, data));
      return { count: rows.length };
    },
  });

  const client = {
    stop: model('stops'),
    student: model('students'),
    bus: model('buses'),
    school: model('schools'),
    trip: model('trips'),
    tripStop: model('tripStops'),
  };
  client.$transaction = async (fn) => {
    const snapshot = deepClone(state);
    try {
      return await fn(client);
    } catch (err) {
      Object.keys(snapshot).forEach((k) => { state[k] = snapshot[k]; });
      throw err;
    }
  };
  client.__state = state;
  return client;
}

// ---------------------------------------------------------------- oracles

// Independent saved-order comparator: order ascending, then id as a string.
const bySavedOrder = (a, b) => {
  if (a.order !== b.order) return a.order - b.order;
  const ia = String(a.id);
  const ib = String(b.id);
  return ia < ib ? -1 : ia > ib ? 1 : 0;
};
const isOpenStatus = (s) => OPEN.includes(s);
const finite = (v) => typeof v === 'number' && Number.isFinite(v);

// Coordinates anti-correlated with order: a geographic sort would reverse it.
const makeStop = (id, busId, direction, order) => ({
  id, busId, direction, order, name: `Stop ${id}`,
  lat: 13 - (Number.isFinite(order) ? order : 0) * 0.005,
  lng: 78 - (Number.isFinite(order) ? order : 0) * 0.005,
});

const tripStopsOf = (prisma, tripId) => prisma.__state.tripStops
  .filter((s) => s.tripId === tripId)
  .map((s) => ({ ...s }))
  .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

const statusById = (stops) => Object.fromEntries(stops.map((s) => [s.id, s.status]));

const rejectionOf = (promise) => promise.then(() => null, (e) => e);

// ---------------------------------------------------------------- arbitraries

const validOrdersArb = (min = 1) => fc.uniqueArray(fc.integer({ min: 1, max: 60 }), { minLength: min, maxLength: 7 });
const idPoolArb = fc.uniqueArray(fc.integer({ min: 1, max: 999999 }), { minLength: 48, maxLength: 48 });
const coordArb = fc.oneof(
  { arbitrary: fc.double({ min: -90, max: 90, noNaN: true }), weight: 4 },
  { arbitrary: fc.constantFrom(null, NaN, Infinity), weight: 1 },
);
const schoolArb = fc.option(fc.record({ lat: coordArb, lng: coordArb }), { nil: null });

// Several buses and directions; the chosen bus+direction gets `chosenOrders`.
function buildWorld({ chosenOrders, otherGroups, ids, busIdx, direction }) {
  const stops = [];
  let next = 0;
  const takeId = () => `st-${ids[next++]}`;
  const chosenBus = BUSES[busIdx];
  let g = 0;
  BUSES.forEach((busId) => DIRS.forEach((dir) => {
    const orders = busId === chosenBus && dir === direction ? chosenOrders : otherGroups[g++];
    orders.forEach((order) => stops.push(makeStop(takeId(), busId, dir, order)));
  }));
  return { stops, chosenBus };
}

const seedWith = (stops, school) => ({
  stops,
  buses: BUSES.map((id) => ({ id, busNo: id.toUpperCase(), status: 'ACTIVE' })),
  schools: school ? [{ id: 'sch-1', name: 'Green Valley School', ...school }] : [],
  students: [],
});

const worldArb = (chosenOrdersArb) => fc.record({
  chosenOrders: chosenOrdersArb,
  otherGroups: fc.array(validOrdersArb(0), { minLength: 5, maxLength: 5 }),
  ids: idPoolArb,
  busIdx: fc.integer({ min: 0, max: BUSES.length - 1 }),
  direction: fc.constantFrom(...DIRS),
  secondDirection: fc.constantFrom(...DIRS),
  school: schoolArb,
  seed: fc.integer(),
});

// Invalid chosen sequences: empty, a duplicated order, or a non-integer/<1 order.
const invalidOrdersArb = fc.oneof(
  fc.constant([]),
  fc.tuple(validOrdersArb(1), fc.nat()).map(([orders, k]) => [...orders, orders[k % orders.length]]),
  fc.tuple(validOrdersArb(1), fc.nat(), fc.constantFrom(1.5, 2.25, 0, -1, NaN, null))
    .map(([orders, k, bad]) => orders.map((o, i) => (i === k % orders.length ? bad : o))),
);

// Actions against a trip with n stops; target === n means an unknown id.
const actionsArb = fc.array(
  fc.record({
    kind: fc.constantFrom('complete', 'complete', 'skip', 'skip', 'cancel', 'arrive'),
    target: fc.nat({ max: 63 }),
  }),
  { maxLength: 20 },
);

async function startedTrip({ orders, ids, seed, school = null, direction = 'PICKUP' }) {
  const stops = orders.map((order, i) => makeStop(`st-${ids[i]}`, 'bus-1', direction, order));
  const prisma = createFakePrisma(seedWith(stops, school), mulberry32(seed));
  const service = createTripService({ prisma, now: () => FIXED_NOW, logger: { warn: () => {} } });
  const { trip } = await service.startTrip({ driver: { id: 'drv-1', busId: 'bus-1' }, direction });
  // Snapshot order derived independently from the stored rows.
  const orderedIds = tripStopsOf(prisma, trip.id).sort(bySavedOrder).map((s) => s.id);
  return { prisma, service, trip, orderedIds, stops };
}

const targetId = (orderedIds, target) => {
  const idx = target % (orderedIds.length + 1);
  return idx === orderedIds.length ? 'ts-unknown' : orderedIds[idx];
};

// ---------------------------------------------------------------- Property 10

// Feature: live-tracking-fixed-routes, Property 10: Trip start snapshots saved order and is idempotent
describe('Property 10: Trip start snapshots saved order and is idempotent', () => {
  // **Validates: Requirements 6.1, 6.2**
  test('startTrip snapshots the bus+direction stops in (order, id) order, all PENDING; a second start resumes it', async () => {
    await fc.assert(
      fc.asyncProperty(worldArb(validOrdersArb(1)), async (w) => {
        const { stops, chosenBus } = buildWorld(w);
        const prisma = createFakePrisma(seedWith(stops, w.school), mulberry32(w.seed));
        const service = createTripService({ prisma, now: () => FIXED_NOW, logger: { warn: () => {} } });
        const driver = { id: 'drv-1', busId: chosenBus };

        const expected = stops
          .filter((s) => s.busId === chosenBus && s.direction === w.direction)
          .sort(bySavedOrder);

        const first = await service.startTrip({ driver, direction: w.direction });
        expect(first.resumed).toBe(false);
        expect(first.trip).toMatchObject({ busId: chosenBus, direction: w.direction, status: 'ACTIVE' });
        expect(first.trip.stops.map((s) => [s.stopId, s.order, s.name, s.lat, s.lng, s.status]))
          .toEqual(expected.map((s) => [s.id, s.order, s.name, s.lat, s.lng, 'PENDING']));
        expect(tripStopsOf(prisma, first.trip.id)).toHaveLength(expected.length);
        expect(prisma.__state.trips).toHaveLength(1);
        prisma.__state.buses.forEach((b) => {
          expect(b.status).toBe(b.id === chosenBus ? 'ON_TRIP' : 'ACTIVE');
        });

        const before = deepClone(prisma.__state);
        const second = await service.startTrip({ driver, direction: w.secondDirection });
        expect(second.resumed).toBe(true);
        expect(second.trip.id).toBe(first.trip.id);
        expect(second.trip.direction).toBe(w.direction);
        expect(second.trip.stops.map((s) => s.id)).toEqual(first.trip.stops.map((s) => s.id));
        expect(prisma.__state).toEqual(before);
      }),
      { numRuns: RUNS },
    );
  });

  // **Validates: Requirements 6.1, 6.2**
  test('empty, duplicate or non-integer sequences are refused with 409 and nothing is written', async () => {
    await fc.assert(
      fc.asyncProperty(worldArb(invalidOrdersArb), async (w) => {
        const { stops, chosenBus } = buildWorld(w);
        const prisma = createFakePrisma(seedWith(stops, w.school), mulberry32(w.seed));
        const service = createTripService({ prisma, now: () => FIXED_NOW, logger: { warn: () => {} } });
        const before = deepClone(prisma.__state);

        const err = await rejectionOf(service.startTrip({ driver: { id: 'drv-1', busId: chosenBus }, direction: w.direction }));
        expect(err).toBeInstanceOf(TripServiceError);
        expect(err.status).toBe(409);
        expect(prisma.__state).toEqual(before);
        expect(prisma.__state.trips).toHaveLength(0);
        expect(prisma.__state.tripStops).toHaveLength(0);
      }),
      { numRuns: RUNS },
    );
  });
});

// ---------------------------------------------------------------- Property 11

// Feature: live-tracking-fixed-routes, Property 11: Only the current stop progresses
describe('Property 11: Only the current stop progresses', () => {
  // **Validates: Requirements 6.4, 6.5**
  test('complete/skip succeed iff the target is the current stop; rejections change nothing', async () => {
    await fc.assert(
      fc.asyncProperty(validOrdersArb(1), idPoolArb, fc.integer(), actionsArb, async (orders, ids, seed, actions) => {
        const { prisma, service, trip, orderedIds } = await startedTrip({ orders, ids, seed });
        // Oracle: statuses in snapshot order.
        const model = orderedIds.map(() => 'PENDING');
        const modelCurrent = () => {
          const i = model.findIndex(isOpenStatus);
          return i === -1 ? null : orderedIds[i];
        };
        const modelStatusById = () => Object.fromEntries(orderedIds.map((id, i) => [id, model[i]]));

        for (const action of actions) {
          const id = targetId(orderedIds, action.target);
          const idx = orderedIds.indexOf(id);
          const before = deepClone(prisma.__state);

          if (action.kind === 'complete' || action.kind === 'skip') {
            const expectOk = id === modelCurrent();
            const call = action.kind === 'complete'
              ? service.completeCurrent(trip.id, id)
              : service.skipCurrent(trip.id, id);
            const result = await call.then((t) => ({ t }), (e) => ({ e }));
            if (expectOk) {
              expect(result.e).toBeUndefined();
              model[idx] = action.kind === 'complete' ? 'COMPLETED' : 'SKIPPED';
              expect(statusById(result.t.stops)).toEqual(modelStatusById());
              const cur = currentStop(result.t);
              expect(cur ? cur.id : null).toBe(modelCurrent());
            } else {
              expect(result.e).toBeInstanceOf(TripServiceError);
              expect(result.e.status).toBe(409);
              expect(prisma.__state).toEqual(before);
            }
          } else if (action.kind === 'cancel') {
            // Helper action to create CANCELLED holes in the sequence.
            const expectOk = idx !== -1 && isOpenStatus(model[idx]);
            const result = await service.cancelStop(trip.id, id, { role: 'ADMIN' }).then((t) => ({ t }), (e) => ({ e }));
            expect(result.e === undefined).toBe(expectOk);
            if (expectOk) model[idx] = 'CANCELLED';
            else expect(prisma.__state).toEqual(before);
          } else {
            // Helper action to reach ARRIVED states.
            const expectOk = id === modelCurrent() && model[idx] === 'PENDING';
            const t = await service.markArrived(trip.id, id);
            expect(t !== null).toBe(expectOk);
            if (expectOk) model[idx] = 'ARRIVED';
          }
          expect(statusById(tripStopsOf(prisma, trip.id))).toEqual(modelStatusById());
        }
      }),
      { numRuns: RUNS },
    );
  });
});

// ---------------------------------------------------------------- Property 12

// Feature: live-tracking-fixed-routes, Property 12: Ending a trip closes all open stops
describe('Property 12: Ending a trip closes all open stops', () => {
  // **Validates: Requirements 6.7**
  test('endTrip completes the trip, cancels open stops, keeps closed ones, frees the bus, and is idempotent', async () => {
    await fc.assert(
      fc.asyncProperty(validOrdersArb(1), idPoolArb, fc.integer(), actionsArb, async (orders, ids, seed, actions) => {
        const { prisma, service, trip, orderedIds } = await startedTrip({ orders, ids, seed });
        for (const action of actions) {
          const id = targetId(orderedIds, action.target);
          const call = {
            complete: () => service.completeCurrent(trip.id, id),
            skip: () => service.skipCurrent(trip.id, id),
            cancel: () => service.cancelStop(trip.id, id, { role: 'ADMIN' }),
            arrive: () => service.markArrived(trip.id, id),
          }[action.kind];
          await call().catch((e) => { if (!(e instanceof TripServiceError)) throw e; });
        }

        const statusesBefore = statusById(tripStopsOf(prisma, trip.id));
        const ended = await service.endTrip(trip.id);
        expect(ended).toMatchObject({ id: trip.id, status: 'COMPLETED', endedAt: FIXED_NOW });

        const expected = Object.fromEntries(Object.entries(statusesBefore)
          .map(([id, s]) => [id, isOpenStatus(s) ? 'CANCELLED' : s]));
        expect(statusById(tripStopsOf(prisma, trip.id))).toEqual(expected);
        expect(statusById(ended.stops)).toEqual(expected);
        expect(prisma.__state.trips.find((t) => t.id === trip.id).status).toBe('COMPLETED');
        expect(prisma.__state.buses.find((b) => b.id === 'bus-1').status).toBe('ACTIVE');
        expect(await service.getCurrentTrip('bus-1')).toBeNull();

        const before = deepClone(prisma.__state);
        const again = await service.endTrip(trip.id);
        expect(again.status).toBe('COMPLETED');
        expect(statusById(again.stops)).toEqual(expected);
        expect(prisma.__state).toEqual(before);
      }),
      { numRuns: RUNS },
    );
  });
});

// ---------------------------------------------------------------- Property 32

const STATUSES = ['PENDING', 'ARRIVED', 'COMPLETED', 'SKIPPED', 'CANCELLED'];
const pureTripArb = fc.record({
  direction: fc.constantFrom(...DIRS),
  destLat: fc.oneof(coordArb, fc.constant(undefined)),
  destLng: fc.oneof(coordArb, fc.constant(undefined)),
  destName: fc.option(fc.string({ maxLength: 12 }), { nil: null }),
  orders: fc.uniqueArray(fc.integer({ min: 1, max: 60 }), { maxLength: 8 }),
  ids: fc.uniqueArray(fc.integer({ min: 1, max: 999999 }), { minLength: 8, maxLength: 8 }),
  statuses: fc.array(fc.constantFrom(...STATUSES), { minLength: 8, maxLength: 8 }),
}).map((r) => ({
  id: 'trip-1',
  status: 'ACTIVE',
  direction: r.direction,
  destLat: r.destLat,
  destLng: r.destLng,
  destName: r.destName,
  // Array order is random (uniqueArray is unsorted), not snapshot order.
  stops: r.orders.map((order, i) => ({
    id: `ts-${r.ids[i]}`, tripId: 'trip-1', stopId: `st-${r.ids[i]}`, order,
    name: `Stop ${i}`, lat: 13 - order * 0.005, lng: 78 - order * 0.005, status: r.statuses[i],
  })),
}));

// Feature: live-tracking-fixed-routes, Property 32: School destination is the last waypoint and never alerted
describe('Property 32: School destination is the last waypoint and never alerted', () => {
  // **Validates: Requirements 6.11, 6.12, 6.13**
  test('routeWaypoints ends with one SCHOOL waypoint iff PICKUP with finite school coords; remainingDestination agrees', () => {
    fc.assert(
      fc.property(pureTripArb, (trip) => {
        const open = [...trip.stops].sort(bySavedOrder).filter((s) => isOpenStatus(s.status));
        const withSchool = trip.direction === 'PICKUP' && finite(trip.destLat) && finite(trip.destLng);
        const school = { kind: 'SCHOOL', name: trip.destName ?? null, lat: trip.destLat, lng: trip.destLng };

        const wps = routeWaypoints(trip);
        const schoolIdx = wps.map((w, i) => (w.kind === 'SCHOOL' ? i : -1)).filter((i) => i !== -1);
        expect(schoolIdx).toEqual(withSchool ? [wps.length - 1] : []);
        const stopWps = withSchool ? wps.slice(0, -1) : wps;
        expect(stopWps.map((w) => [w.kind, w.tripStopId, w.stopId, w.lat, w.lng]))
          .toEqual(open.map((s) => ['STOP', s.id, s.stopId, s.lat, s.lng]));
        if (withSchool) {
          const last = wps[wps.length - 1];
          expect(last).toEqual(school);
          expect('tripStopId' in last).toBe(false);
          expect('stopId' in last).toBe(false);
        }

        const dest = remainingDestination(trip);
        if (open.length) {
          expect(dest).toMatchObject({ kind: 'STOP', tripStopId: open[0].id });
        } else if (withSchool) {
          expect(dest).toEqual(school);
        } else {
          expect(dest).toBeNull();
        }
      }),
      { numRuns: 300 },
    );
  });

  // **Validates: Requirements 6.11, 6.12, 6.13**
  test('the school is never a TripStop: no row, no arrival, and the trip stays ACTIVE when only the school remains', async () => {
    await fc.assert(
      fc.asyncProperty(
        validOrdersArb(1), idPoolArb, fc.integer(), schoolArb, fc.constantFrom(...DIRS),
        async (orders, ids, seed, school, direction) => {
          const { prisma, service, trip, orderedIds, stops } = await startedTrip({ orders, ids, seed, school, direction });
          const rows = tripStopsOf(prisma, trip.id);
          expect(rows).toHaveLength(stops.length);
          const stopIds = new Set(stops.map((s) => s.id));
          rows.forEach((r) => expect(stopIds.has(r.stopId)).toBe(true));

          let t = trip;
          for (const id of orderedIds) t = await service.completeCurrent(trip.id, id);
          expect(currentStop(t)).toBeNull();
          expect(t.status).toBe('ACTIVE');

          const withSchool = direction === 'PICKUP' && !!school && finite(school.lat) && finite(school.lng);
          const expectedSchool = withSchool
            ? { kind: 'SCHOOL', name: 'Green Valley School', lat: school.lat, lng: school.lng }
            : null;
          expect(routeWaypoints(t)).toEqual(expectedSchool ? [expectedSchool] : []);
          expect(remainingDestination(t)).toEqual(expectedSchool);

          // Nothing left to arrive at: the school can never be marked ARRIVED.
          for (const id of [...orderedIds, 'school', 'sch-1']) {
            expect(await service.markArrived(trip.id, id)).toBeNull();
          }
          expect(tripStopsOf(prisma, trip.id)).toHaveLength(stops.length);
        },
      ),
      { numRuns: RUNS },
    );
  });
});

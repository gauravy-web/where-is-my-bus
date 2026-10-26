// Property tests for Location_Service (task 6.5): Properties 13, 14 and 15.
// Prisma, Trip_Service and the clock are in-memory fakes injected into
// createLocationService. No DB, no network.
// Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.7, 7.8, 7.9, 7.10, 7.11
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/testdb';
process.env.JWT_SECRET = 'test-jwt-secret';

const fc = require('fast-check');
const {
  createLocationService, validateFix, haversineMeters,
} = require('../src/services/locationService');
const { detectArrival, currentStop } = require('../src/services/tripService');

jest.setTimeout(120000);

const RUNS = 200;
const NOW = Date.parse('2026-10-22T08:00:00.000Z');
const MAX_SPEED_MS = 200 / 3.6;
const M_PER_DEG_LAT = (6371000 * Math.PI) / 180; // meters per degree along a meridian

// Independent great-circle distance (atan2 form) so oracles do not reuse the
// implementation's formula.
function refDistance(a, b) {
  const r = (d) => (d * Math.PI) / 180;
  const dLat = r(b.lat - a.lat);
  const dLng = r(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371000 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

const silentLogger = { error: () => {}, warn: () => {}, log: () => {} };
const tick = async (n) => { for (let i = 0; i < n; i += 1) await Promise.resolve(); };

// Fake prisma recording successful writes. `failTrip`/`failHistory` are
// per-call boolean lists (call index -> throw); `delays` adds microtask
// delays so concurrent ingests interleave.
function createFakePrisma({ failTrip = [], failHistory = [], delays = [] } = {}) {
  const tripWrites = [];
  const historyRows = [];
  let tripCalls = 0;
  let historyCalls = 0;
  let delayIdx = 0;
  const nextDelay = () => (delays.length ? delays[(delayIdx++) % delays.length] : 0);
  return {
    tripWrites,
    historyRows,
    trip: {
      update: async ({ where, data }) => {
        const i = tripCalls++;
        await tick(nextDelay());
        if (failTrip[i]) throw new Error('trip write failed');
        tripWrites.push({ id: where.id, ...data, t: data.lastLocationAt.getTime() });
        return { id: where.id, ...data };
      },
    },
    liveLocation: {
      create: async ({ data }) => {
        const i = historyCalls++;
        await tick(nextDelay());
        if (failHistory[i]) throw new Error('history append failed');
        historyRows.push({ ...data, t: data.timestamp.getTime() });
        return data;
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Property 13: Fix validation
// ---------------------------------------------------------------------------

const timeForm = (ms) => fc.constantFrom('number', 'iso', 'date').map((form) => {
  if (form === 'iso') return new Date(ms).toISOString();
  if (form === 'date') return new Date(ms);
  return ms;
});

// A scenario: optional last accepted fix plus a raw fix near it, with
// independently corruptible coordinates, accuracy and timestamp.
const validationScenario = fc.record({
  base: fc.record({ lat: fc.double({ min: -89, max: 89, noNaN: true }), lng: fc.double({ min: -179, max: 179, noNaN: true }) }),
  dLat: fc.double({ min: -0.02, max: 0.02, noNaN: true }),
  dLng: fc.double({ min: -0.02, max: 0.02, noNaN: true }),
  coordMode: fc.oneof(
    { weight: 6, arbitrary: fc.constant('keep') },
    { weight: 1, arbitrary: fc.constantFrom('latHigh', 'latLow', 'lngHigh', 'lngLow', 'nan', 'inf', 'null', 'missing') },
  ),
  outBy: fc.double({ min: 1e-6, max: 500, noNaN: true }),
  accuracy: fc.oneof(
    fc.constant(undefined),
    fc.constant(null),
    fc.double({ min: 0, max: 300, noNaN: true }),
    fc.constantFrom(0, 100, 100.0001),
  ),
  recOffset: fc.oneof(
    { weight: 4, arbitrary: fc.integer({ min: -200000, max: 60000 }) },
    { weight: 1, arbitrary: fc.constantFrom(-120000, -120001, 30000, 30001, 0) },
  ),
  badTime: fc.oneof({ weight: 8, arbitrary: fc.constant(null) }, { weight: 1, arbitrary: fc.constantFrom('garbage', undefined, '') }),
  hasLast: fc.boolean(),
  gap: fc.oneof(
    { weight: 5, arbitrary: fc.integer({ min: 1, max: 60000 }) },
    { weight: 1, arbitrary: fc.integer({ min: -5000, max: 0 }) },
  ),
  speed: fc.oneof(fc.double({ min: 0, max: 40, noNaN: true }), fc.constant(undefined)),
  heading: fc.oneof(fc.double({ min: -720, max: 720, noNaN: true }), fc.constant(null)),
}).chain((s) => timeForm(NOW + s.recOffset).map((recordedAt) => ({ ...s, recordedAtRaw: recordedAt })));

function buildValidationCase(s) {
  let lat = s.base.lat + s.dLat;
  let lng = s.base.lng + s.dLng;
  switch (s.coordMode) {
    case 'latHigh': lat = 90 + s.outBy; break;
    case 'latLow': lat = -90 - s.outBy; break;
    case 'lngHigh': lng = 180 + s.outBy; break;
    case 'lngLow': lng = -180 - s.outBy; break;
    case 'nan': lat = NaN; break;
    case 'inf': lng = -Infinity; break;
    case 'null': lat = null; break;
    case 'missing': lng = undefined; break;
    default: break;
  }
  const recordedAt = s.badTime === null ? s.recordedAtRaw : s.badTime;
  const fix = { lat, lng, accuracy: s.accuracy, recordedAt, speed: s.speed, heading: s.heading };
  const recMs = s.badTime === null ? NOW + s.recOffset : NaN;
  const last = s.hasLast ? { lat: s.base.lat, lng: s.base.lng, recordedAt: recMs - s.gap } : null;
  if (last && !Number.isFinite(last.recordedAt)) last.recordedAt = NOW - s.gap;
  return { fix, last, recMs };
}

describe('Property 13: Fix validation', () => {
  test('validateFix accepts iff coordinates, accuracy, time window, order and implied speed are all valid', () => {
    // Feature: live-tracking-fixed-routes, Property 13: Fix validation
    // **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**
    fc.assert(
      fc.property(validationScenario, (s) => {
        const { fix, last, recMs } = buildValidationCase(s);
        const { lat, lng } = fix;

        const coordsOk = typeof lat === 'number' && typeof lng === 'number'
          && Number.isFinite(lat) && Number.isFinite(lng)
          && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
        const accOk = fix.accuracy === undefined || fix.accuracy === null || fix.accuracy <= 100;
        const timeOk = Number.isFinite(recMs) && recMs >= NOW - 120000 && recMs <= NOW + 30000;
        const orderOk = !last || (Number.isFinite(recMs) && recMs > last.recordedAt);
        let speedOk = true;
        if (last && coordsOk && orderOk) {
          const implied = refDistance(last, { lat, lng }) / ((recMs - last.recordedAt) / 1000);
          // Skip float-noise ties right at the 200 km/h boundary.
          fc.pre(Math.abs(implied - MAX_SPEED_MS) > MAX_SPEED_MS * 1e-9);
          speedOk = implied <= MAX_SPEED_MS;
        }
        const expected = coordsOk && accOk && timeOk && orderOk && speedOk;

        const result = validateFix(fix, last, NOW);
        expect(result.ok).toBe(expected);
        if (result.ok) {
          expect(result.fix.lat).toBe(lat);
          expect(result.fix.lng).toBe(lng);
          expect(result.fix.recordedAt).toBe(recMs);
          expect(result.fix.accuracy).toBe(fix.accuracy === undefined ? null : fix.accuracy);
          expect(result.fix.speed).toBeGreaterThanOrEqual(0);
          if (result.fix.heading !== null) {
            expect(result.fix.heading).toBeGreaterThanOrEqual(0);
            expect(result.fix.heading).toBeLessThan(360);
          }
        } else {
          expect(typeof result.reason).toBe('string');
        }
      }),
      { numRuns: RUNS * 3 },
    );
  });

  test('ingest: accepted fixes of one bus are strictly increasing in time and never exceed 200 km/h between each other', async () => {
    // Feature: live-tracking-fixed-routes, Property 13: Fix validation
    // **Validates: Requirements 7.3, 7.4, 7.5**
    const step = fc.record({
      clockGap: fc.integer({ min: 0, max: 8000 }),
      recSkew: fc.integer({ min: -4000, max: 1000 }),
      moveM: fc.double({ min: -600, max: 600, noNaN: true }),
    });
    await fc.assert(
      fc.asyncProperty(fc.array(step, { minLength: 1, maxLength: 30 }), async (steps) => {
        let clock = NOW;
        const prisma = createFakePrisma();
        const loc = createLocationService({
          prisma,
          tripService: { getCurrentTrip: async () => null },
          now: () => clock,
          logger: silentLogger,
        });
        let lat = 12.9716;
        const accepted = [];
        for (const st of steps) {
          clock += st.clockGap;
          lat += st.moveM / M_PER_DEG_LAT;
          const raw = { lat, lng: 77.5946, accuracy: 10, speed: 5, recordedAt: clock + st.recSkew };
          const res = await loc.ingest('bus-1', raw);
          if (res.accepted) accepted.push({ lat: raw.lat, lng: raw.lng, recordedAt: raw.recordedAt });
        }
        for (let i = 1; i < accepted.length; i += 1) {
          const a = accepted[i - 1];
          const b = accepted[i];
          expect(b.recordedAt).toBeGreaterThan(a.recordedAt);
          const implied = haversineMeters(a, b) / ((b.recordedAt - a.recordedAt) / 1000);
          expect(implied).toBeLessThanOrEqual(MAX_SPEED_MS);
        }
        const latest = loc.getLatest('bus-1');
        if (accepted.length) {
          expect(latest.recordedAt).toBe(accepted[accepted.length - 1].recordedAt);
          expect(latest.lat).toBe(accepted[accepted.length - 1].lat);
        } else {
          expect(latest).toBeNull();
        }
      }),
      { numRuns: RUNS },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 14: Write and broadcast throttles
// ---------------------------------------------------------------------------

const throttleStep = fc.record({
  gap: fc.oneof(fc.integer({ min: 0, max: 1500 }), fc.integer({ min: 0, max: 20000 })),
  moveM: fc.oneof(fc.double({ min: -20, max: 20, noNaN: true }), fc.double({ min: -120, max: 120, noNaN: true })),
  lag: fc.integer({ min: 0, max: 2000 }),
});

const throttleScenario = fc.record({
  steps: fc.array(throttleStep, { minLength: 1, maxLength: 40 }),
  hasTrip: fc.oneof({ weight: 4, arbitrary: fc.constant(true) }, { weight: 1, arbitrary: fc.constant(false) }),
  failTrip: fc.array(fc.oneof({ weight: 5, arbitrary: fc.constant(false) }, { weight: 1, arbitrary: fc.constant(true) }), { maxLength: 40 }),
  failHistory: fc.array(fc.oneof({ weight: 5, arbitrary: fc.constant(false) }, { weight: 1, arbitrary: fc.constant(true) }), { maxLength: 40 }),
  delays: fc.array(fc.integer({ min: 0, max: 4 }), { maxLength: 10 }),
  concurrent: fc.boolean(),
});

async function runThrottleScenario(sc) {
  let clock = NOW;
  const prisma = createFakePrisma(sc);
  const events = [];
  const trip = sc.hasTrip ? { id: 'trip-1', status: 'ACTIVE', stops: [] } : null;
  const loc = createLocationService({
    prisma,
    tripService: { getCurrentTrip: async () => trip, detectArrival: () => null, markArrived: async () => null },
    now: () => clock,
    emit: (event, busId, payload) => events.push({ event, busId, payload }),
    logger: silentLogger,
  });

  let t = NOW - 60000;
  let lat = 12.9716;
  const pending = [];
  const results = [];
  for (const st of sc.steps) {
    t += st.gap;
    lat += st.moveM / M_PER_DEG_LAT;
    clock = t + st.lag;
    const p = loc.ingest('bus-1', { lat, lng: 77.5946, accuracy: 5, speed: 3, recordedAt: t });
    if (sc.concurrent) pending.push(p);
    else results.push(await p);
  }
  if (sc.concurrent) results.push(...(await Promise.all(pending)));
  return { prisma, events, results };
}

describe('Property 14: Write and broadcast throttles', () => {
  test('trip writes >= 5 s apart, history appends >= 15 s or >= 50 m apart, broadcasts >= 1 s apart', async () => {
    // Feature: live-tracking-fixed-routes, Property 14: Write and broadcast throttles
    // **Validates: Requirements 7.7, 7.8, 7.9**
    await fc.assert(
      fc.asyncProperty(throttleScenario, async (sc) => {
        const { prisma, events, results } = await runThrottleScenario(sc);

        // Concurrent DB writes may complete out of order, so spacing is
        // checked over the written fixes ordered by recordedAt.
        const byTime = (list) => [...list].sort((a, b) => a.t - b.t);

        // 7.7
        if (!sc.hasTrip) expect(prisma.tripWrites).toHaveLength(0);
        const writes = byTime(prisma.tripWrites);
        for (let i = 1; i < writes.length; i += 1) {
          expect(writes[i].t - writes[i - 1].t).toBeGreaterThanOrEqual(5000);
        }

        // 7.8
        const rows = byTime(prisma.historyRows);
        for (let i = 1; i < rows.length; i += 1) {
          const dt = rows[i].t - rows[i - 1].t;
          const dist = haversineMeters(rows[i - 1], rows[i]);
          expect(dt >= 15000 || dist >= 50).toBe(true);
        }

        // 7.9: both events go out together, >= 1 s apart.
        const live = events.filter((e) => e.event === 'bus:location');
        const legacy = events.filter((e) => e.event === 'locationUpdate');
        expect(legacy).toHaveLength(live.length);
        const times = live.map((e) => Date.parse(e.payload.recordedAt));
        for (let i = 1; i < times.length; i += 1) {
          expect(times[i] - times[i - 1]).toBeGreaterThanOrEqual(1000);
        }

        // Something accepted always reaches subscribers at least once.
        if (results.some((r) => r.accepted)) expect(live.length).toBeGreaterThanOrEqual(1);
      }),
      { numRuns: RUNS },
    );
  });

  test('sequential ingests: writes, appends and broadcasts happen exactly when their window allows', async () => {
    // Feature: live-tracking-fixed-routes, Property 14: Write and broadcast throttles
    // **Validates: Requirements 7.7, 7.8, 7.9**
    await fc.assert(
      fc.asyncProperty(throttleScenario.map((sc) => ({ ...sc, concurrent: false })), async (sc) => {
        const { prisma, events, results } = await runThrottleScenario(sc);

        // Reference model over the accepted fixes, honoring injected failures
        // (a failed write does not consume its window).
        const accepted = [];
        let t = NOW - 60000;
        let lat = 12.9716;
        sc.steps.forEach((st, i) => {
          t += st.gap;
          lat += st.moveM / M_PER_DEG_LAT;
          if (results[i].accepted) accepted.push({ lat, lng: 77.5946, recordedAt: t });
        });

        const expTrip = [];
        const expHistory = [];
        const expBroadcast = [];
        let lastTrip = null;
        let lastHist = null;
        let lastCast = null;
        let tripCall = 0;
        let histCall = 0;
        accepted.forEach((f) => {
          if (sc.hasTrip && (lastTrip === null || f.recordedAt - lastTrip >= 5000)) {
            if (!sc.failTrip[tripCall++]) { lastTrip = f.recordedAt; expTrip.push(f.recordedAt); }
          }
          if (lastHist === null || f.recordedAt - lastHist.recordedAt >= 15000 || haversineMeters(lastHist, f) >= 50) {
            if (!sc.failHistory[histCall++]) { lastHist = f; expHistory.push(f.recordedAt); }
          }
          if (lastCast === null || f.recordedAt - lastCast >= 1000) { lastCast = f.recordedAt; expBroadcast.push(f.recordedAt); }
        });

        expect(prisma.tripWrites.map((w) => w.t)).toEqual(expTrip);
        expect(prisma.historyRows.map((r) => r.t)).toEqual(expHistory);
        expect(events.filter((e) => e.event === 'bus:location').map((e) => Date.parse(e.payload.recordedAt)))
          .toEqual(expBroadcast);
      }),
      { numRuns: RUNS },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 15: Arrival detection applies to the current stop only
// ---------------------------------------------------------------------------

const STOP_STATUSES = ['PENDING', 'ARRIVED', 'COMPLETED', 'SKIPPED', 'CANCELLED'];

const arrivalScenario = fc.record({
  tripStatus: fc.oneof({ weight: 6, arbitrary: fc.constant('ACTIVE') }, { weight: 1, arbitrary: fc.constantFrom('COMPLETED', 'CANCELLED') }),
  orders: fc.uniqueArray(fc.integer({ min: 0, max: 50 }), { minLength: 1, maxLength: 6 }),
  statuses: fc.array(
    fc.oneof({ weight: 3, arbitrary: fc.constant('PENDING') }, { weight: 2, arbitrary: fc.constantFrom(...STOP_STATUSES) }),
    { minLength: 6, maxLength: 6 },
  ),
  positions: fc.array(
    fc.record({ lat: fc.double({ min: -60, max: 60, noNaN: true }), lng: fc.double({ min: -179, max: 179, noNaN: true }) }),
    { minLength: 6, maxLength: 6 },
  ),
  // Some stops share the current stop's position, so a later stop can sit right under the bus.
  shareWithFirst: fc.array(fc.boolean(), { minLength: 6, maxLength: 6 }),
  target: fc.oneof(
    { weight: 3, arbitrary: fc.constant({ kind: 'current' }) },
    { weight: 2, arbitrary: fc.nat({ max: 5 }).map((i) => ({ kind: 'stop', i })) },
    { weight: 1, arbitrary: fc.constant({ kind: 'random' }) },
  ),
  offsetM: fc.oneof(
    fc.double({ min: 0, max: 49.99, noNaN: true }),
    fc.double({ min: 50.01, max: 300, noNaN: true }),
    fc.constantFrom(0, 49.9, 50.1),
  ),
  north: fc.boolean(),
  speed: fc.oneof(
    fc.double({ min: 0, max: 1.999, noNaN: true }),
    fc.double({ min: 2, max: 15, noNaN: true }),
    fc.constantFrom(0, 1.9999, 2, 2.0001),
  ),
  randomPos: fc.record({ lat: fc.double({ min: -60, max: 60, noNaN: true }), lng: fc.double({ min: -179, max: 179, noNaN: true }) }),
  storageSeed: fc.nat(),
});

function buildArrivalCase(s) {
  const n = s.orders.length;
  const stops = s.orders.map((order, i) => {
    const pos = s.shareWithFirst[i] ? s.positions[0] : s.positions[i];
    return { id: `ts-${i}`, tripId: 'trip-1', order, status: s.statuses[i], lat: pos.lat, lng: pos.lng, name: `Stop ${i}` };
  });
  // Rotate storage order so the service has to sort.
  const k = s.storageSeed % n;
  const stored = [...stops.slice(k), ...stops.slice(0, k)];
  const trip = { id: 'trip-1', busId: 'bus-1', status: s.tripStatus, stops: stored };

  const bySaved = [...stops].sort((a, b) => a.order - b.order);
  const cur = bySaved.find((x) => x.status === 'PENDING' || x.status === 'ARRIVED') || null;

  let anchor;
  if (s.target.kind === 'current') anchor = cur || bySaved[0];
  else if (s.target.kind === 'stop') anchor = stops[s.target.i % n];
  else anchor = s.randomPos;
  const dLat = (s.north ? 1 : -1) * (s.offsetM / M_PER_DEG_LAT);
  const fix = { lat: anchor.lat + dLat, lng: anchor.lng, speed: s.speed, heading: null, accuracy: 5, recordedAt: NOW };
  return { trip, cur, fix };
}

describe('Property 15: Arrival detection applies to the current stop only', () => {
  test('detectArrival returns the current stop iff within 50 m and below 2 m/s, and never any other stop', () => {
    // Feature: live-tracking-fixed-routes, Property 15: Arrival detection applies to the current stop only
    // **Validates: Requirements 7.10, 7.11**
    fc.assert(
      fc.property(arrivalScenario, (s) => {
        const { trip, cur, fix } = buildArrivalCase(s);
        let expected = null;
        if (trip.status === 'ACTIVE' && cur && cur.status === 'PENDING') {
          const dist = refDistance(fix, cur);
          fc.pre(Math.abs(dist - 50) > 1e-3); // float-noise ties at the radius
          if (dist <= 50 && fix.speed < 2) expected = cur.id;
        }

        expect(currentStop(trip)?.id ?? null).toBe(cur ? cur.id : null);
        const got = detectArrival(trip, fix);
        expect(got).toBe(expected);
        if (got !== null) expect(got).toBe(currentStop(trip).id);
      }),
      { numRuns: RUNS * 3 },
    );
  });

  test('ingest marks ARRIVED only for the current stop', async () => {
    // Feature: live-tracking-fixed-routes, Property 15: Arrival detection applies to the current stop only
    // **Validates: Requirements 7.10, 7.11**
    await fc.assert(
      fc.asyncProperty(arrivalScenario, async (s) => {
        const { trip, cur, fix } = buildArrivalCase(s);
        const expected = detectArrival(trip, fix);
        const marked = [];
        const loc = createLocationService({
          prisma: createFakePrisma(),
          tripService: {
            getCurrentTrip: async () => trip,
            detectArrival,
            markArrived: async (tripId, tripStopId) => { marked.push({ tripId, tripStopId }); return null; },
          },
          now: () => NOW,
          logger: silentLogger,
        });
        const res = await loc.ingest('bus-1', fix);
        expect(res.accepted).toBe(true);
        expect(marked).toEqual(expected === null ? [] : [{ tripId: 'trip-1', tripStopId: cur.id }]);
      }),
      { numRuns: RUNS },
    );
  });
});

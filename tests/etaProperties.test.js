// Property tests for ETA_Service (task 7.3): Properties 16, 17 and 18.
// OSRM is faked through the injected fetch; trips are plain in-memory
// objects whose stops are stored in random order, so any ordering must come
// from tripService.routeWaypoints. No network, no DB.
// Validates: Requirements 9.1, 9.2, 9.3, 9.4
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/testdb';
process.env.JWT_SECRET = 'test-jwt-secret';

const fc = require('fast-check');
const { createEtaService, buildRouteUrl, parseRoute } = require('../src/services/etaService');
const { routeWaypoints } = require('../src/services/tripService');

jest.setTimeout(120000);

const RUNS = 150;
const OSRM = 'http://osrm.test';

// Coordinates as micro-degree integers / 1e6: finite, never -0, and they
// round-trip exactly through `${n}` -> Number.
const latArb = fc.integer({ min: -90_000_000, max: 90_000_000 }).map((x) => x / 1e6);
const lngArb = fc.integer({ min: -180_000_000, max: 180_000_000 }).map((x) => x / 1e6);
const pointArb = fc.record({ lat: latArb, lng: lngArb });

// A trip state reachable by one-at-a-time progress: `done` stops are
// COMPLETED or SKIPPED, then the Current_Stop (PENDING or ARRIVED), then the
// rest PENDING. Saved orders are unique with gaps; storage order is shuffled.
const tripArb = fc
  .uniqueArray(fc.integer({ min: 1, max: 500 }), { minLength: 0, maxLength: 8 })
  .chain((orders) => {
    const sorted = [...orders].sort((a, b) => a - b);
    const n = sorted.length;
    return fc.record({
      sorted: fc.constant(sorted),
      done: fc.integer({ min: 0, max: n }),
      doneStatuses: fc.array(fc.constantFrom('COMPLETED', 'SKIPPED'), { minLength: n, maxLength: n }),
      currentStatus: fc.constantFrom('PENDING', 'ARRIVED'),
      coords: fc.array(pointArb, { minLength: n, maxLength: n }),
      storage: fc.shuffledSubarray([...Array(n).keys()], { minLength: n, maxLength: n }),
      direction: fc.constantFrom('PICKUP', 'DROP'),
      school: fc.option(pointArb, { nil: null }),
    });
  })
  .map(({ sorted, done, doneStatuses, currentStatus, coords, storage, direction, school }) => {
    const inOrder = sorted.map((order, i) => {
      let status = 'PENDING';
      if (i < done) status = doneStatuses[i];
      else if (i === done) status = currentStatus;
      return {
        id: `ts-${order}`, stopId: `s-${order}`, order, status, name: `Stop ${order}`, ...coords[i],
      };
    });
    return {
      id: 'trip-1',
      status: 'ACTIVE',
      direction,
      destName: school ? 'School' : null,
      destLat: school ? school.lat : null,
      destLng: school ? school.lng : null,
      stops: storage.map((idx) => inOrder[idx]),
    };
  });

const fixArb = fc.record({ lat: latArb, lng: lngArb, recordedAt: fc.integer({ min: 0, max: 2e12 }) });

// Oracle: Current_Stop + remaining open TripStops by saved order, then the
// school last on PICKUP trips with a destination.
function expectedWaypoints(trip) {
  const open = [...trip.stops]
    .sort((a, b) => a.order - b.order)
    .filter((s) => s.status === 'PENDING' || s.status === 'ARRIVED')
    .map((s) => ({ kind: 'STOP', tripStopId: s.id, lat: s.lat, lng: s.lng }));
  if (trip.direction === 'PICKUP' && trip.destLat !== null && trip.destLng !== null) {
    open.push({ kind: 'SCHOOL', lat: trip.destLat, lng: trip.destLng });
  }
  return open;
}

// `${base}/route/v1/driving/lng,lat;lng,lat?...` -> { service, points }.
function parseUrl(url) {
  const m = /^(.*)\/route\/v1\/driving\/([^?]+)\?/.exec(url);
  if (!m) return null;
  const points = m[2].split(';').map((pair) => {
    const [lng, lat] = pair.split(',').map(Number);
    return { lat, lng };
  });
  return { base: m[1], points };
}

const okResponse = (body) => ({ ok: true, status: 200, json: async () => body });
const durationArb = fc.double({ min: 0, max: 1e5, noNaN: true, noDefaultInfinity: true });
const geometryArb = fc.constantFrom(null, { type: 'LineString', coordinates: [[77, 12], [77.1, 12.1]] });

// A valid OSRM body for the given number of legs.
const okBodyArb = (legCount) => fc.record({
  durations: fc.array(durationArb, { minLength: legCount, maxLength: legCount }),
  geometry: geometryArb,
}).map(({ durations, geometry }) => ({
  code: 'Ok',
  routes: [{ legs: durations.map((duration) => ({ duration })), geometry }],
}));

describe('Property 16: OSRM waypoints follow snapshot order', () => {
  // **Validates: Requirements 9.1, 9.2**
  test('computeEta requests /route/v1/driving/ with the fix, then the open stops in saved order, then the school', async () => {
    await fc.assert(
      fc.asyncProperty(tripArb, fixArb, async (trip, fix) => {
        const urls = [];
        const fetch = async (url) => {
          urls.push(url);
          return { ok: false, status: 503, json: async () => ({}) };
        };
        const eta = createEtaService({ fetch, now: () => 0, osrmUrl: OSRM, logger: null, tripService: { routeWaypoints } });
        const expected = expectedWaypoints(trip);
        await eta.computeEta(trip, fix);

        if (expected.length === 0) {
          expect(urls).toHaveLength(0);
          return;
        }
        expect(urls).toHaveLength(1);
        expect(urls[0]).not.toContain('/trip/');
        const parsed = parseUrl(urls[0]);
        expect(parsed).not.toBeNull();
        expect(parsed.base).toBe(OSRM);
        expect(parsed.points).toEqual([
          { lat: fix.lat, lng: fix.lng },
          ...expected.map(({ lat, lng }) => ({ lat, lng })),
        ]);
      }),
      { numRuns: RUNS },
    );
  });

  test('buildRouteUrl lists the fix first and the waypoints in the given order', () => {
    fc.assert(
      fc.property(pointArb, fc.array(pointArb, { minLength: 1, maxLength: 10 }), (fix, wps) => {
        const parsed = parseUrl(buildRouteUrl(`${OSRM}/`, fix, wps));
        expect(parsed.base).toBe(OSRM);
        expect(parsed.points).toEqual([fix, ...wps]);
      }),
      { numRuns: RUNS },
    );
  });
});

describe('Property 17: Cumulative ETA', () => {
  // **Validates: Requirements 9.3**
  const caseArb = tripArb
    .map((trip) => ({ trip, waypoints: routeWaypoints(trip) }))
    .filter(({ waypoints }) => waypoints.length > 0)
    .chain(({ trip, waypoints }) => fc.record({
      trip: fc.constant(trip),
      waypoints: fc.constant(waypoints),
      body: okBodyArb(waypoints.length),
    }));

  test('stop i gets the sum of legs 0..i, ETAs are non-decreasing and the school stays out of perStop', () => {
    fc.assert(
      fc.property(caseArb, ({ waypoints, body }) => {
        const result = parseRoute(body, waypoints);
        expect(result).not.toBeNull();

        const legs = body.routes[0].legs.map((l) => l.duration);
        const cumulative = [];
        legs.reduce((acc, d) => { const t = acc + d; cumulative.push(t); return t; }, 0);

        const expectedPerStop = [];
        let expectedSchool = null;
        waypoints.forEach((wp, i) => {
          if (wp.kind === 'SCHOOL') expectedSchool = { etaSeconds: cumulative[i] };
          else expectedPerStop.push({ tripStopId: wp.tripStopId, etaSeconds: cumulative[i] });
        });

        expect(result.perStop).toEqual(expectedPerStop);
        expect(result.school).toEqual(expectedSchool);
        expect(result.geometry).toEqual(body.routes[0].geometry);

        const all = [...result.perStop.map((p) => p.etaSeconds), ...(result.school ? [result.school.etaSeconds] : [])];
        for (let i = 1; i < all.length; i += 1) expect(all[i]).toBeGreaterThanOrEqual(all[i - 1]);
        all.forEach((t) => expect(t).toBeGreaterThanOrEqual(0));
      }),
      { numRuns: RUNS },
    );
  });

  test('computeEta returns the same cumulative ETAs for an Ok response', async () => {
    await fc.assert(
      fc.asyncProperty(caseArb, fixArb, async ({ trip, waypoints, body }, fix) => {
        const eta = createEtaService({
          fetch: async () => okResponse(body), now: () => 42, osrmUrl: OSRM, logger: null, tripService: { routeWaypoints },
        });
        const result = await eta.computeEta(trip, fix);
        const parsed = parseRoute(body, waypoints);
        expect(result).toEqual({ ...parsed, computedAt: 42, fixRecordedAt: fix.recordedAt });
      }),
      { numRuns: RUNS },
    );
  });
});

describe('Property 18: Invalid routing yields no ETA', () => {
  // **Validates: Requirements 9.4**
  const badCode = fc.oneof(
    fc.string().filter((s) => s !== 'Ok'),
    fc.constantFrom('NoRoute', 'NoSegment', 'InvalidQuery', 'TooBig', 'ok', 'OK', undefined, null),
  );
  const badDuration = fc.constantFrom(NaN, Infinity, -Infinity, undefined, null, '60', {});

  // One corruption applied to an otherwise valid body.
  const corruptionArb = (legCount) => fc.oneof(
    badCode.map((code) => ({ kind: 'code', apply: (b) => ({ ...b, code }) })),
    fc.constantFrom(
      { kind: 'missing', apply: (b) => ({ code: b.code }) },
      { kind: 'missing', apply: (b) => ({ ...b, routes: [] }) },
      { kind: 'missing', apply: (b) => ({ ...b, routes: null }) },
      { kind: 'missing', apply: (b) => ({ ...b, routes: [{ geometry: b.routes[0].geometry }] }) },
      { kind: 'missing', apply: (b) => ({ ...b, routes: [{ ...b.routes[0], legs: 'nope' }] }) },
    ),
    fc.integer({ min: 1, max: 3 }).chain((k) => fc.constantFrom(
      { kind: 'mismatch', apply: (b) => ({ ...b, routes: [{ ...b.routes[0], legs: [...b.routes[0].legs, ...Array(k).fill({ duration: 1 })] }] }) },
      { kind: 'mismatch', apply: (b) => ({ ...b, routes: [{ ...b.routes[0], legs: b.routes[0].legs.slice(0, Math.max(0, legCount - k)) }] }) },
    )),
    fc.record({ i: fc.integer({ min: 0, max: legCount - 1 }), d: badDuration }).map(({ i, d }) => ({
      kind: 'duration',
      apply: (b) => ({
        ...b,
        routes: [{ ...b.routes[0], legs: b.routes[0].legs.map((leg, j) => (j === i ? { duration: d } : leg)) }],
      }),
    })),
  );

  const caseArb = tripArb
    .map((trip) => ({ trip, waypoints: routeWaypoints(trip) }))
    .filter(({ waypoints }) => waypoints.length > 0)
    .chain(({ trip, waypoints }) => fc.record({
      trip: fc.constant(trip),
      waypoints: fc.constant(waypoints),
      body: okBodyArb(waypoints.length),
      corruption: corruptionArb(waypoints.length),
    }));

  test('parseRoute and computeEta return null for a bad code, missing legs, a leg count mismatch or a non-finite duration', async () => {
    await fc.assert(
      fc.asyncProperty(caseArb, fixArb, async ({ trip, waypoints, body, corruption }, fix) => {
        // Sanity: the uncorrupted body is valid, so the corruption alone causes null.
        expect(parseRoute(body, waypoints)).not.toBeNull();
        const bad = corruption.apply(body);
        expect(parseRoute(bad, waypoints)).toBeNull();

        const eta = createEtaService({
          fetch: async () => okResponse(bad), now: () => 0, osrmUrl: OSRM, logger: null, tripService: { routeWaypoints },
        });
        expect(await eta.computeEta(trip, fix)).toBeNull();
      }),
      { numRuns: RUNS },
    );
  });
});

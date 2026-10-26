// ETA example tests with OSRM mocked (task 7.4).
// OSRM is always an injected fake fetch: no network, no DB. Trips are plain
// objects and the real tripService.routeWaypoints builds the waypoints.
// Validates: Requirements 9.4, 9.5, 16.3
const {
  createEtaService, OSRM_TIMEOUT_MS, BREAKER_OPEN_MS,
} = require('../src/services/etaService');
const { createEtaCoordinator } = require('../src/services/etaCoordinator');
const tripService = require('../src/services/tripService');

// An OSRM URL carrying credentials: none of it may ever reach the logs.
const OSRM_URL = 'https://router:s3cr3t-pass@osrm.internal.test/base?key=API-KEY-123';

const makeTrip = (overrides = {}) => ({
  id: 't1',
  busId: 'b1',
  status: 'ACTIVE',
  direction: 'PICKUP',
  destName: 'School',
  destLat: 26.9,
  destLng: 75.8,
  stops: [
    { id: 'ts-1', stopId: 's-1', order: 1, status: 'PENDING', lat: 26.7, lng: 75.3 },
    { id: 'ts-2', stopId: 's-2', order: 2, status: 'PENDING', lat: 26.5, lng: 75.1 },
  ],
  ...overrides,
});
const fix = { lat: 26.8, lng: 75.5, recordedAt: 1000 };

const okBody = (durations) => ({
  code: 'Ok',
  routes: [{
    legs: durations.map((duration) => ({ duration })),
    geometry: { type: 'LineString', coordinates: [[75.5, 26.8], [75.8, 26.9]] },
  }],
});
const respond = (body, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => body });

// A fetch that never answers on its own and rejects like real fetch when the
// AbortController fires.
const abortError = () => {
  const err = new Error('This operation was aborted');
  err.name = 'AbortError';
  return err;
};
const hangingFetch = () => jest.fn((url, { signal } = {}) => new Promise((_, reject) => {
  signal?.addEventListener('abort', () => reject(abortError()));
}));

function recordingLogger() {
  const lines = [];
  const log = (...args) => lines.push(args.map(String).join(' '));
  return { lines, logger: { warn: log, error: log, info: log, log } };
}

function service({ fetch, nowRef = { t: 0 }, logger = null } = {}) {
  return createEtaService({
    fetch, now: () => nowRef.t, osrmUrl: OSRM_URL, logger, tripService,
  });
}

describe('computeEta outcomes', () => {
  test('success: cumulative per-stop ETAs, school leg separate, geometry and timestamps kept', async () => {
    const fetch = jest.fn(async () => respond(okBody([100, 200, 300])));
    const eta = service({ fetch, nowRef: { t: 5000 } });

    const result = await eta.computeEta(makeTrip(), fix);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
    expect(result).toEqual({
      perStop: [{ tripStopId: 'ts-1', etaSeconds: 100 }, { tripStopId: 'ts-2', etaSeconds: 300 }],
      school: { etaSeconds: 600 },
      geometry: okBody([]).routes[0].geometry,
      computedAt: 5000,
      fixRecordedAt: 1000,
    });
    expect(eta.breakerState().failures).toBe(0);
  });

  test('a DROP trip has no school leg', async () => {
    const fetch = jest.fn(async () => respond(okBody([40, 50])));
    const result = await service({ fetch }).computeEta(makeTrip({ direction: 'DROP' }), fix);
    expect(result.perStop).toEqual([{ tripStopId: 'ts-1', etaSeconds: 40 }, { tripStopId: 'ts-2', etaSeconds: 90 }]);
    expect(result.school).toBeNull();
  });

  describe('timeout (4 s)', () => {
    beforeEach(() => {
      jest.useFakeTimers({ doNotFake: ['nextTick', 'queueMicrotask', 'Date', 'hrtime', 'performance'] });
    });
    afterEach(() => {
      jest.useRealTimers();
    });

    test('a call still pending at 4 s is aborted and yields null', async () => {
      const fetch = hangingFetch();
      const eta = service({ fetch });
      let settled = false;
      const pending = eta.computeEta(makeTrip(), fix).then((v) => { settled = true; return v; });

      await jest.advanceTimersByTimeAsync(OSRM_TIMEOUT_MS - 1);
      expect(settled).toBe(false);
      expect(fetch.mock.calls[0][1].signal.aborted).toBe(false);

      await jest.advanceTimersByTimeAsync(1);
      expect(await pending).toBeNull();
      expect(fetch.mock.calls[0][1].signal.aborted).toBe(true);
      expect(eta.breakerState().failures).toBe(1);
    });

    test('an answer just under 4 s is used and the abort timer is cleared', async () => {
      const fetch = jest.fn(() => new Promise((r) => setTimeout(() => r(respond(okBody([10, 20, 30]))), OSRM_TIMEOUT_MS - 100)));
      const eta = service({ fetch });
      const pending = eta.computeEta(makeTrip(), fix);

      await jest.advanceTimersByTimeAsync(OSRM_TIMEOUT_MS - 100);
      const result = await pending;
      expect(result.perStop.map((p) => p.etaSeconds)).toEqual([10, 30]);
      expect(fetch.mock.calls[0][1].signal.aborted).toBe(false);
      expect(jest.getTimerCount()).toBe(0);
    });
  });

  test.each([
    ['HTTP 500', async () => respond({ message: 'boom' }, 500)],
    ['HTTP 429', async () => respond({}, 429)],
    ['network error', async () => { throw new TypeError('fetch failed'); }],
    ['no response object', async () => undefined],
    ['body that is not JSON', async () => ({ ok: true, status: 200, json: async () => { throw new SyntaxError('Unexpected token <'); } })],
  ])('transport failure (%s) yields null and counts as a failure', async (_label, impl) => {
    const eta = service({ fetch: jest.fn(impl) });
    expect(await eta.computeEta(makeTrip(), fix)).toBeNull();
    expect(eta.breakerState().failures).toBe(1);
  });

  test.each([
    ['code NoRoute', { ...okBody([1, 2, 3]), code: 'NoRoute' }],
    ['code InvalidQuery', { code: 'InvalidQuery', message: 'bad' }],
    ['missing code', { routes: okBody([1, 2, 3]).routes }],
    ['no routes', { code: 'Ok', routes: [] }],
    ['too few legs', okBody([1, 2])],
    ['too many legs', okBody([1, 2, 3, 4])],
    ['NaN duration', okBody([1, NaN, 3])],
    ['Infinity duration', okBody([1, 2, Infinity])],
    ['negative duration', okBody([-1, 2, 3])],
    ['string duration', okBody([1, '2', 3])],
    ['null duration', okBody([1, null, 3])],
  ])('bad routing response (%s) yields null, never a partial or estimated ETA', async (_label, body) => {
    const eta = service({ fetch: jest.fn(async () => respond(body)) });
    expect(await eta.computeEta(makeTrip(), fix)).toBeNull();
    expect(eta.breakerState().failures).toBe(1);
  });

  test('nothing to route to, or a non-finite fix, yields null without calling OSRM', async () => {
    const fetch = jest.fn(async () => respond(okBody([1])));
    const eta = service({ fetch });
    const done = makeTrip({
      direction: 'DROP',
      stops: makeTrip().stops.map((s) => ({ ...s, status: 'COMPLETED' })),
    });
    expect(await eta.computeEta(done, fix)).toBeNull();
    expect(await eta.computeEta(makeTrip(), { lat: NaN, lng: 75 })).toBeNull();
    expect(await eta.computeEta(null, fix)).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
    expect(eta.breakerState().failures).toBe(0);
  });
});

describe('waypoint order in the URL', () => {
  test('stops follow the saved order even when geographically out of order', async () => {
    // Order 1 is the farthest stop, order 2 the nearest, order 3 in between;
    // the array is also shuffled. Nearest-first would give 2,3,1.
    const trip = makeTrip({
      stops: [
        { id: 'ts-c', stopId: 's-c', order: 3, status: 'PENDING', lat: 26.85, lng: 75.6 },
        { id: 'ts-a', stopId: 's-a', order: 1, status: 'PENDING', lat: 27.5, lng: 76.5 },
        { id: 'ts-x', stopId: 's-x', order: 0, status: 'SKIPPED', lat: 26.0, lng: 74.0 },
        { id: 'ts-b', stopId: 's-b', order: 2, status: 'PENDING', lat: 26.801, lng: 75.501 },
      ],
    });
    const fetch = jest.fn(async () => respond(okBody([300, 200, 100, 50])));
    const result = await service({ fetch }).computeEta(trip, fix);

    const url = fetch.mock.calls[0][0];
    expect(url).toBe(
      'https://router:s3cr3t-pass@osrm.internal.test/base?key=API-KEY-123'
      + '/route/v1/driving/75.5,26.8;76.5,27.5;75.501,26.801;75.6,26.85;75.8,26.9'
      + '?overview=full&geometries=geojson',
    );
    expect(url).toContain('/route/v1/driving/');
    expect(url).not.toContain('/trip/v1/');
    expect(result.perStop).toEqual([
      { tripStopId: 'ts-a', etaSeconds: 300 },
      { tripStopId: 'ts-b', etaSeconds: 500 },
      { tripStopId: 'ts-c', etaSeconds: 600 },
    ]);
    expect(result.school).toEqual({ etaSeconds: 650 });
  });
});

describe('circuit breaker', () => {
  test('3 consecutive failures of any kind open it for 60 s with no OSRM calls', async () => {
    const nowRef = { t: 0 };
    const outcomes = [
      async () => { throw abortError(); },
      async () => respond({}, 500),
      async () => respond({ code: 'NoRoute' }),
    ];
    const fetch = jest.fn((...args) => outcomes.shift()(...args));
    const eta = service({ fetch, nowRef });

    for (let i = 0; i < 3; i += 1) {
      expect(eta.isBreakerOpen()).toBe(false);
      expect(await eta.computeEta(makeTrip(), fix)).toBeNull();
    }
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(eta.isBreakerOpen()).toBe(true);

    for (const t of [1, 30_000, BREAKER_OPEN_MS - 1]) {
      nowRef.t = t;
      expect(await eta.computeEta(makeTrip(), fix)).toBeNull();
    }
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  test('a failed trial after 60 s reopens it; a later successful trial closes it', async () => {
    const nowRef = { t: 0 };
    let healthy = false;
    const fetch = jest.fn(async () => (healthy ? respond(okBody([10, 20, 30])) : respond({}, 503)));
    const eta = service({ fetch, nowRef });
    for (let i = 0; i < 3; i += 1) await eta.computeEta(makeTrip(), fix);

    nowRef.t = BREAKER_OPEN_MS; // trial allowed, still failing
    expect(await eta.computeEta(makeTrip(), fix)).toBeNull();
    expect(fetch).toHaveBeenCalledTimes(4);
    expect(eta.isBreakerOpen()).toBe(true);

    nowRef.t = BREAKER_OPEN_MS + 1;
    expect(await eta.computeEta(makeTrip(), fix)).toBeNull();
    nowRef.t = 2 * BREAKER_OPEN_MS - 1;
    expect(await eta.computeEta(makeTrip(), fix)).toBeNull();
    expect(fetch).toHaveBeenCalledTimes(4);

    healthy = true;
    nowRef.t = 2 * BREAKER_OPEN_MS;
    expect((await eta.computeEta(makeTrip(), fix)).perStop).toHaveLength(2);
    expect(eta.isBreakerOpen()).toBe(false);
    expect(eta.breakerState()).toEqual({ failures: 0, openUntil: 0 });

    nowRef.t += 1;
    expect(await eta.computeEta(makeTrip(), fix)).not.toBeNull();
    expect(fetch).toHaveBeenCalledTimes(6);
  });

  test('a success resets the count, so failures must be consecutive to open it', async () => {
    const script = [false, false, true, false, false];
    const fetch = jest.fn(async () => (script.shift() ? respond(okBody([1, 2, 3])) : respond({}, 500)));
    const eta = service({ fetch });
    for (let i = 0; i < 5; i += 1) await eta.computeEta(makeTrip(), fix);

    expect(eta.breakerState().failures).toBe(2);
    expect(eta.isBreakerOpen()).toBe(false);
    await eta.computeEta(makeTrip(), fix); // third consecutive failure (script empty -> 500)
    expect(fetch).toHaveBeenCalledTimes(6);
    expect(eta.isBreakerOpen()).toBe(true);
  });
});

describe('failure logs', () => {
  test('logs name the failure kind only: no URL, credentials, coordinates or raw error text', async () => {
    const { lines, logger } = recordingLogger();
    const outcomes = [
      async () => { throw new TypeError(`fetch failed for ${OSRM_URL}`); },
      async () => respond({}, 500),
      async () => respond({ code: 'NoRoute', message: `no route via ${OSRM_URL}` }),
      async () => respond(okBody([1, NaN, 3])),
    ];
    const fetch = jest.fn((...args) => outcomes.shift()(...args));
    const nowRef = { t: 0 };
    const eta = service({ fetch, nowRef, logger });
    for (let i = 0; i < 3; i += 1) await eta.computeEta(makeTrip(), fix);
    nowRef.t = BREAKER_OPEN_MS;
    await eta.computeEta(makeTrip(), fix);

    expect(lines).toHaveLength(4);
    expect(lines[0]).toContain('network error');
    expect(lines[1]).toContain('HTTP 500');
    expect(lines[2]).toContain('NoRoute');
    const all = lines.join('\n');
    for (const secret of ['s3cr3t', 'API-KEY-123', 'router:', 'osrm.internal', 'http', '75.5', '26.8', 'fetch failed', 'no route via']) {
      expect(all).not.toContain(secret);
    }
  });
});

describe('no fabricated ETA reaches clients', () => {
  test('after OSRM goes down, every trip:eta is null and the old ETA is not reused, including while the breaker is open', async () => {
    const nowRef = { t: Date.parse('2026-01-10T07:00:00.000Z') };
    let healthy = true;
    const fetch = jest.fn(async () => (healthy ? respond(okBody([100, 200, 300])) : respond({}, 502)));
    const etaService = service({ fetch, nowRef });
    const events = [];
    const coordinator = createEtaCoordinator({
      etaService,
      tripService,
      now: () => nowRef.t,
      logger: null,
      emit: (event, busId, payload) => events.push({ event, busId, payload }),
    });
    const trip = makeTrip();
    const fixNow = () => ({ ...fix, recordedAt: nowRef.t });

    await coordinator.onFix('b1', fixNow(), trip);
    expect(events[0].payload.eta.perStop).toHaveLength(2);

    healthy = false;
    for (let i = 0; i < 4; i += 1) { // 3 failures open the breaker, the 4th is skipped
      nowRef.t += 15_000;
      await coordinator.onFix('b1', fixNow(), trip);
    }

    expect(fetch).toHaveBeenCalledTimes(4);
    expect(etaService.isBreakerOpen()).toBe(true);
    expect(events).toHaveLength(5);
    expect(events.slice(1)).toEqual(Array(4).fill({
      event: 'trip:eta', busId: 'b1', payload: { busId: 'b1', tripId: 't1', eta: null },
    }));
    expect(coordinator.getEta('b1', trip)).toBeNull();
    expect(coordinator.getRawEta('b1')).toBeNull();
  });
});

// Example tests for the ETA coordinator (task 7.2): intake -> ETA -> trip:eta.
// OSRM is an injected fake fetch (no network); trips are plain objects and the
// real tripService.routeWaypoints builds the waypoints (no DB).
// Validates: Requirements 9.6, 9.7, 8.1
const { createEtaService } = require('../src/services/etaService');
const { createEtaCoordinator } = require('../src/services/etaCoordinator');
const tripService = require('../src/services/tripService');

const T0 = Date.parse('2026-01-10T07:00:00.000Z');
const silent = { warn: () => {}, error: () => {} };

const makeTrip = (overrides = {}) => ({
  id: 't1',
  busId: 'b1',
  direction: 'PICKUP',
  status: 'ACTIVE',
  destName: 'School',
  destLat: 26.9,
  destLng: 75.8,
  stops: [
    { id: 'ts-1', tripId: 't1', stopId: 's-1', order: 1, lat: 26.7, lng: 75.3, status: 'PENDING' },
    { id: 'ts-2', tripId: 't1', stopId: 's-2', order: 2, lat: 26.5, lng: 75.1, status: 'PENDING' },
  ],
  ...overrides,
});

const okRoute = (durations) => ({
  code: 'Ok',
  routes: [{
    legs: durations.map((duration) => ({ duration })),
    geometry: { type: 'LineString', coordinates: [[75.2, 26.6], [75.3, 26.7]] },
  }],
});

// Fake OSRM: each call takes the next queued body (or the default). A body of
// 'pending' returns a promise the test resolves by hand.
function fakeOsrm(defaultBody = okRoute([100, 200, 300])) {
  const calls = [];
  const queue = [];
  let release = null;
  const fetch = jest.fn(async (url) => {
    calls.push(url);
    const body = queue.length ? queue.shift() : defaultBody;
    if (body === 'pending') {
      await new Promise((r) => { release = r; });
      return { ok: true, status: 200, json: async () => defaultBody };
    }
    return { ok: true, status: 200, json: async () => body };
  });
  return { fetch, calls, queue, release: () => release && release() };
}

function setup(osrm = fakeOsrm()) {
  let nowMs = T0;
  const now = () => nowMs;
  const events = [];
  const etaService = createEtaService({
    fetch: osrm.fetch, now, osrmUrl: 'http://osrm.test', logger: silent, tripService,
  });
  const coordinator = createEtaCoordinator({
    etaService,
    tripService,
    now,
    logger: silent,
    emit: (event, busId, payload) => events.push({ event, busId, payload }),
  });
  return {
    coordinator,
    osrm,
    events,
    advance: (ms) => { nowMs += ms; },
    fixAt: (offsetMs = 0, lat = 26.8, lng = 75.5) => ({ lat, lng, speed: 5, recordedAt: nowMs + offsetMs }),
  };
}

describe('trip:eta emission', () => {
  test('a computed ETA is emitted, cached for the trip and passed to listeners', async () => {
    const { coordinator, events, fixAt, osrm } = setup();
    const heard = [];
    coordinator.addEtaListener((e) => heard.push(e));
    const trip = makeTrip();

    await coordinator.onFix('b1', fixAt(), trip);

    expect(osrm.calls).toHaveLength(1);
    expect(osrm.calls[0]).toContain('/route/v1/driving/75.5,26.8;75.3,26.7;75.1,26.5;75.8,26.9');
    const expected = {
      perStop: [{ tripStopId: 'ts-1', etaSeconds: 100 }, { tripStopId: 'ts-2', etaSeconds: 300 }],
      school: { etaSeconds: 600 },
      geometry: { type: 'LineString', coordinates: [[75.2, 26.6], [75.3, 26.7]] },
      computedAt: new Date(T0).toISOString(),
    };
    expect(events).toEqual([{ event: 'trip:eta', busId: 'b1', payload: { busId: 'b1', tripId: 't1', eta: expected } }]);
    expect(coordinator.getEta('b1', trip)).toEqual(expected);
    expect(heard).toHaveLength(1);
    expect(heard[0]).toMatchObject({ busId: 'b1', trip: { id: 't1' }, eta: { perStop: expected.perStop } });
  });

  test('an OSRM failure emits trip:eta with eta null and caches no ETA', async () => {
    const { coordinator, events, fixAt } = setup(fakeOsrm({ code: 'NoRoute' }));
    const heard = [];
    coordinator.addEtaListener((e) => heard.push(e));
    const trip = makeTrip();

    await coordinator.onFix('b1', fixAt(), trip);

    expect(events).toEqual([{ event: 'trip:eta', busId: 'b1', payload: { busId: 'b1', tripId: 't1', eta: null } }]);
    expect(coordinator.getEta('b1', trip)).toBeNull();
    expect(heard).toEqual([expect.objectContaining({ busId: 'b1', eta: null })]);
  });

  test('a successful ETA followed by a failure replaces the cached ETA with null', async () => {
    const osrm = fakeOsrm();
    const { coordinator, events, fixAt, advance } = setup(osrm);
    const trip = makeTrip();
    await coordinator.onFix('b1', fixAt(), trip);
    osrm.queue.push({ code: 'Ok', routes: [{ legs: [{ duration: NaN }, { duration: 1 }, { duration: 1 }] }] });
    advance(15000);
    await coordinator.onFix('b1', fixAt(), trip);

    expect(events.map((e) => e.payload.eta === null)).toEqual([false, true]);
    expect(coordinator.getEta('b1', trip)).toBeNull();
  });

  test('a throwing listener does not stop the emit or other listeners', async () => {
    const { coordinator, events, fixAt } = setup();
    const second = jest.fn();
    coordinator.addEtaListener(() => { throw new Error('boom'); });
    coordinator.addEtaListener(second);
    await coordinator.onFix('b1', fixAt(), makeTrip());
    expect(events).toHaveLength(1);
    expect(second).toHaveBeenCalledTimes(1);
  });
});

describe('recompute throttle (15 s or 100 m)', () => {
  test('nearby fixes inside 15 s reuse the ETA; 15 s or 100 m trigger a recompute', async () => {
    const { coordinator, osrm, fixAt, advance, events } = setup();
    const trip = makeTrip();

    await coordinator.onFix('b1', fixAt(), trip);
    advance(5000);
    expect(await coordinator.onFix('b1', fixAt(0, 26.8001, 75.5), trip)).toBeUndefined(); // ~11 m, 5 s
    advance(9000);
    await coordinator.onFix('b1', fixAt(0, 26.8002, 75.5), trip); // 14 s
    expect(osrm.calls).toHaveLength(1);

    advance(1000); // 15 s since the computation
    await coordinator.onFix('b1', fixAt(0, 26.8002, 75.5), trip);
    expect(osrm.calls).toHaveLength(2);

    advance(2000);
    await coordinator.onFix('b1', fixAt(0, 26.8012, 75.5), trip); // ~111 m from the last computation
    expect(osrm.calls).toHaveLength(3);
    expect(events).toHaveLength(3);
  });

  test('only one OSRM call runs per bus at a time', async () => {
    const osrm = fakeOsrm();
    osrm.queue.push('pending');
    const { coordinator, fixAt, advance, events } = setup(osrm);
    const trip = makeTrip();

    const first = coordinator.onFix('b1', fixAt(), trip);
    await Promise.resolve();
    advance(20000);
    await coordinator.onFix('b1', fixAt(0, 26.9, 75.6), trip); // would qualify, but one is in flight
    expect(osrm.calls).toHaveLength(1);

    osrm.release();
    await first;
    expect(events).toHaveLength(1);
    await coordinator.onFix('b1', fixAt(0, 26.9, 75.6), trip);
    expect(osrm.calls).toHaveLength(2);
  });

  test('a closed stop forces a recompute on the next fix, without new waypoints for it', async () => {
    const { coordinator, osrm, fixAt, advance } = setup();
    const trip = makeTrip();
    await coordinator.onFix('b1', fixAt(), trip);

    const afterSkip = makeTrip({
      stops: [{ ...trip.stops[0], status: 'SKIPPED' }, trip.stops[1]],
    });
    advance(2000);
    osrm.queue.push(okRoute([50, 70]));
    await coordinator.onFix('b1', fixAt(), afterSkip);

    expect(osrm.calls).toHaveLength(2);
    expect(osrm.calls[1]).toContain('/route/v1/driving/75.5,26.8;75.1,26.5;75.8,26.9');
    expect(coordinator.getEta('b1', afterSkip).perStop).toEqual([{ tripStopId: 'ts-2', etaSeconds: 50 }]);
  });

  test('onTripChanged recomputes at once from the last recent fix', async () => {
    const { coordinator, osrm, fixAt, advance } = setup();
    const trip = makeTrip();
    await coordinator.onFix('b1', fixAt(), trip);
    advance(3000);
    osrm.queue.push(okRoute([40, 60]));
    await coordinator.onTripChanged(makeTrip({ stops: [{ ...trip.stops[0], status: 'COMPLETED' }, trip.stops[1]] }));
    expect(osrm.calls).toHaveLength(2);
    expect(coordinator.getEta('b1', trip).perStop).toEqual([{ tripStopId: 'ts-2', etaSeconds: 40 }]);
  });
});

describe('trip changes and ending', () => {
  test('ending the trip clears the cache and emits trip:eta null', async () => {
    const { coordinator, events, fixAt, osrm } = setup();
    const trip = makeTrip();
    await coordinator.onFix('b1', fixAt(), trip);

    await coordinator.onTripChanged({ ...trip, status: 'COMPLETED' });

    expect(events[1]).toEqual({ event: 'trip:eta', busId: 'b1', payload: { busId: 'b1', tripId: 't1', eta: null } });
    expect(coordinator.getEta('b1', trip)).toBeNull();
    expect(osrm.calls).toHaveLength(1);
  });

  test('a fix with no ACTIVE trip clears the cache; ETA is never served for another trip', async () => {
    const { coordinator, fixAt } = setup();
    const trip = makeTrip();
    await coordinator.onFix('b1', fixAt(), trip);

    expect(coordinator.getEta('b1', makeTrip({ id: 't2' }))).toBeNull();
    expect(coordinator.getEta('b1', { ...trip, status: 'COMPLETED' })).toBeNull();
    expect(coordinator.getEta('b2', trip)).toBeNull();

    await coordinator.onFix('b1', fixAt(), null);
    expect(coordinator.getEta('b1', trip)).toBeNull();
  });

  test('an in-flight result for an ended trip is discarded', async () => {
    const osrm = fakeOsrm();
    osrm.queue.push('pending');
    const { coordinator, fixAt, events } = setup(osrm);
    const trip = makeTrip();

    const pending = coordinator.onFix('b1', fixAt(), trip);
    await Promise.resolve();
    await coordinator.onTripChanged({ ...trip, status: 'COMPLETED' });
    osrm.release();
    await pending;

    expect(events).toEqual([]);
    expect(coordinator.getEta('b1', trip)).toBeNull();
  });
});

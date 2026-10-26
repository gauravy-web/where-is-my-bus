// Smoke tests for Location_Service (task 6.1). Property tests are task 6.5 and
// example tests task 6.6. Prisma and Trip_Service are small in-memory fakes.
// Validates: Requirements 7.1–7.11
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/testdb';
process.env.JWT_SECRET = 'test-jwt-secret';

const {
  createLocationService, validateFix, shouldWriteTrip, shouldAppendHistory, shouldBroadcast, haversineMeters,
} = require('../src/services/locationService');
const { detectArrival } = require('../src/services/tripService');

const NOW = Date.parse('2026-10-22T08:00:00.000Z');
const BASE = { lat: 12.9716, lng: 77.5946 };
const fixAt = (msOffset, extra = {}) => ({ ...BASE, speed: 5, accuracy: 10, recordedAt: NOW + msOffset, ...extra });

describe('validateFix', () => {
  test('normalizes a valid fix (ISO time, defaults)', () => {
    const r = validateFix({ lat: 10, lng: 20, recordedAt: new Date(NOW).toISOString() }, null, NOW);
    expect(r).toEqual({ ok: true, fix: { lat: 10, lng: 20, speed: 0, heading: null, accuracy: null, recordedAt: NOW } });
  });

  test.each([
    [{ lat: 91, lng: 0, recordedAt: NOW }, 'invalid_coordinates'],
    [{ lat: 0, lng: -180.1, recordedAt: NOW }, 'invalid_coordinates'],
    [{ lat: NaN, lng: 0, recordedAt: NOW }, 'invalid_coordinates'],
    [{ lat: null, lng: 0, recordedAt: NOW }, 'invalid_coordinates'],
    [{ lat: 0, lng: 0, accuracy: 100.5, recordedAt: NOW }, 'low_accuracy'],
    [{ lat: 0, lng: 0 }, 'invalid_timestamp'],
    [{ lat: 0, lng: 0, recordedAt: 'yesterday' }, 'invalid_timestamp'],
    [{ lat: 0, lng: 0, recordedAt: NOW - 120001 }, 'stale'],
    [{ lat: 0, lng: 0, recordedAt: NOW + 30001 }, 'future'],
  ])('drops %j as %s', (fix, reason) => {
    expect(validateFix(fix, null, NOW)).toEqual({ ok: false, reason });
  });

  test('time window boundaries are inclusive', () => {
    expect(validateFix({ lat: 0, lng: 0, recordedAt: NOW - 120000 }, null, NOW).ok).toBe(true);
    expect(validateFix({ lat: 0, lng: 0, recordedAt: NOW + 30000 }, null, NOW).ok).toBe(true);
    expect(validateFix({ lat: 0, lng: 0, accuracy: 100, recordedAt: NOW }, null, NOW).ok).toBe(true);
  });

  test('drops out-of-order, duplicate and impossible-speed fixes', () => {
    const last = { ...BASE, recordedAt: NOW };
    expect(validateFix({ ...BASE, recordedAt: NOW }, last, NOW).reason).toBe('out_of_order');
    expect(validateFix({ ...BASE, recordedAt: NOW - 1 }, last, NOW).reason).toBe('out_of_order');
    // ~1.11 km in 10 s ≈ 400 km/h
    expect(validateFix({ lat: BASE.lat + 0.01, lng: BASE.lng, recordedAt: NOW + 10000 }, last, NOW + 10000).reason)
      .toBe('speed_jump');
    // ~111 m in 10 s ≈ 40 km/h
    expect(validateFix({ lat: BASE.lat + 0.001, lng: BASE.lng, recordedAt: NOW + 10000 }, last, NOW + 10000).ok)
      .toBe(true);
  });
});

describe('throttles', () => {
  test('trip write every >= 5 s, broadcast every >= 1 s', () => {
    expect(shouldWriteTrip(null, NOW)).toBe(true);
    expect(shouldWriteTrip(NOW, NOW + 4999)).toBe(false);
    expect(shouldWriteTrip(NOW, NOW + 5000)).toBe(true);
    expect(shouldBroadcast(null, NOW)).toBe(true);
    expect(shouldBroadcast(NOW, NOW + 999)).toBe(false);
    expect(shouldBroadcast(NOW, NOW + 1000)).toBe(true);
  });

  test('history after >= 15 s or >= 50 m', () => {
    const last = { ...BASE, recordedAt: NOW };
    expect(shouldAppendHistory(null, { ...BASE, recordedAt: NOW })).toBe(true);
    expect(shouldAppendHistory(last, { ...BASE, recordedAt: NOW + 14999 })).toBe(false);
    expect(shouldAppendHistory(last, { ...BASE, recordedAt: NOW + 15000 })).toBe(true);
    const moved = { lat: BASE.lat + 0.0005, lng: BASE.lng, recordedAt: NOW + 1000 }; // ~55 m
    expect(haversineMeters(last, moved)).toBeGreaterThanOrEqual(50);
    expect(shouldAppendHistory(last, moved)).toBe(true);
  });
});

describe('detectArrival', () => {
  const stop = (id, order, status, pos = BASE) => ({ id, order, status, lat: pos.lat, lng: pos.lng });
  const far = { lat: BASE.lat + 0.01, lng: BASE.lng };

  test('arrives at the current stop when near and slow', () => {
    const trip = { status: 'ACTIVE', stops: [stop('a', 1, 'COMPLETED', far), stop('b', 2, 'PENDING')] };
    expect(detectArrival(trip, { ...BASE, speed: 1 })).toBe('b');
    expect(detectArrival(trip, { ...BASE, speed: 2 })).toBeNull();
    expect(detectArrival({ ...trip, status: 'COMPLETED' }, { ...BASE, speed: 0 })).toBeNull();
  });

  test('never evaluates a later stop', () => {
    const trip = { status: 'ACTIVE', stops: [stop('a', 1, 'PENDING', far), stop('b', 2, 'PENDING')] };
    expect(detectArrival(trip, { ...BASE, speed: 0 })).toBeNull();
  });

  test('an ARRIVED current stop is not re-detected', () => {
    const trip = { status: 'ACTIVE', stops: [stop('a', 1, 'ARRIVED'), stop('b', 2, 'PENDING', far)] };
    expect(detectArrival(trip, { ...BASE, speed: 0 })).toBeNull();
  });
});

describe('ingest', () => {
  function setup({ trip = null } = {}) {
    const writes = { trip: [], history: [] };
    const events = [];
    const fixes = [];
    let current = trip;
    let clock = NOW;
    const prisma = {
      trip: { update: async (args) => { writes.trip.push(args); return {}; } },
      liveLocation: { create: async (args) => { writes.history.push(args); return {}; } },
    };
    const tripService = {
      getCurrentTrip: async () => current,
      detectArrival,
      markArrived: async (tripId, tripStopId) => {
        current = { ...current, stops: current.stops.map((s) => (s.id === tripStopId ? { ...s, status: 'ARRIVED' } : s)) };
        return current;
      },
    };
    const loc = createLocationService({
      prisma,
      tripService,
      now: () => clock,
      emit: (event, busId, payload) => events.push({ event, busId, payload }),
      onFix: async (busId, fix, t) => { fixes.push({ busId, fix, trip: t }); },
      logger: { error: () => {}, warn: () => {} },
    });
    return { loc, writes, events, fixes, setClock: (ms) => { clock = ms; } };
  }

  test('happy path: writes, appends, broadcasts both events and calls onFix', async () => {
    const trip = { id: 't1', status: 'ACTIVE', stops: [{ id: 's1', order: 1, status: 'PENDING', lat: 13.5, lng: 77.5 }] };
    const { loc, writes, events, fixes } = setup({ trip });
    const r = await loc.ingest('bus-1', fixAt(0, { heading: 90 }));
    expect(r).toEqual({ accepted: true, broadcast: true, wroteTrip: true, appendedHistory: true, arrived: null });
    expect(writes.trip[0]).toEqual({
      where: { id: 't1' },
      data: { lastLat: BASE.lat, lastLng: BASE.lng, lastSpeed: 5, lastHeading: 90, lastLocationAt: new Date(NOW) },
    });
    expect(writes.history[0].data).toEqual({ busId: 'bus-1', lat: BASE.lat, lng: BASE.lng, speed: 18, timestamp: new Date(NOW) });
    expect(events.map((e) => e.event)).toEqual(['bus:location', 'locationUpdate']);
    expect(events[0].payload).toMatchObject({ busId: 'bus-1', tripId: 't1', speed: 5, recordedAt: new Date(NOW).toISOString() });
    expect(events[1].payload).toEqual({ busId: 'bus-1', lat: BASE.lat, lng: BASE.lng, speed: 18 });
    expect(fixes).toHaveLength(1);
    expect(loc.getLatest('bus-1')).toMatchObject({ ...BASE, recordedAt: NOW });
  });

  test('throttles a fix 500 ms later and drops bad fixes without side effects', async () => {
    const trip = { id: 't1', status: 'ACTIVE', stops: [] };
    const { loc, writes, events, setClock } = setup({ trip });
    await loc.ingest('bus-1', fixAt(0));
    setClock(NOW + 500);
    const r = await loc.ingest('bus-1', fixAt(500));
    expect(r).toEqual({ accepted: true, broadcast: false, wroteTrip: false, appendedHistory: false, arrived: null });
    const bad = await loc.ingest('bus-1', fixAt(500));
    expect(bad).toEqual({ accepted: false, reason: 'out_of_order' });
    expect(loc.getDrops('bus-1')).toEqual({ out_of_order: 1 });
    expect(writes.trip).toHaveLength(1);
    expect(writes.history).toHaveLength(1);
    expect(events).toHaveLength(2);
  });

  test('no active trip: no trip write, history and broadcast still happen', async () => {
    const { loc, writes, events } = setup();
    const r = await loc.ingest('bus-1', fixAt(0));
    expect(r).toMatchObject({ accepted: true, wroteTrip: false, appendedHistory: true, broadcast: true });
    expect(writes.trip).toHaveLength(0);
    expect(events[0].payload.tripId).toBeNull();
  });

  test('arrival marks the current stop and emits trip:state', async () => {
    const trip = { id: 't1', status: 'ACTIVE', stops: [{ id: 's1', order: 1, status: 'PENDING', ...BASE }] };
    const { loc, events, fixes } = setup({ trip });
    const r = await loc.ingest('bus-1', fixAt(0, { speed: 0.5 }));
    expect(r.arrived).toBe('s1');
    const state = events.find((e) => e.event === 'trip:state');
    expect(state.payload.tripStops[0].status).toBe('ARRIVED');
    expect(fixes[0].trip.stops[0].status).toBe('ARRIVED');
  });

  test('onFix errors are swallowed', async () => {
    const loc = createLocationService({
      prisma: { trip: { update: async () => ({}) }, liveLocation: { create: async () => ({}) } },
      tripService: { getCurrentTrip: async () => null, detectArrival, markArrived: async () => null },
      now: () => NOW,
      onFix: async () => { throw new Error('boom'); },
      logger: { error: () => {} },
    });
    await expect(loc.ingest('bus-1', fixAt(0))).resolves.toMatchObject({ accepted: true });
  });
});

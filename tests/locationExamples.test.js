// Example tests for location intake drops and the snapshot endpoints
// (task 6.6). Complements locationService/locationHttp/trackingRoutes/socket
// tests: here every drop reason is checked end to end for "no side effects,
// no broadcast, latest fix unchanged", and the exact snapshot shapes are
// pinned. Prisma is an in-memory fake; no DB, no network.
// Validates: Requirements 7.4, 7.6, 8.1, 8.2, 8.3
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/testdb';
process.env.JWT_SECRET = 'test-jwt-secret';

jest.mock('../src/db', () => {
  const keys = ['users', 'drivers', 'conductors', 'students', 'buses', 'stops', 'schools', 'trips', 'tripStops', 'liveLocations'];
  const state = {};
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
  const applyOrderBy = (rows, orderBy) => {
    const ks = (Array.isArray(orderBy) ? orderBy : orderBy ? [orderBy] : []).map((o) => Object.entries(o)[0]);
    return [...rows].sort((a, b) => {
      for (const [k, dir] of ks) {
        if (a[k] < b[k]) return dir === 'desc' ? 1 : -1;
        if (a[k] > b[k]) return dir === 'desc' ? -1 : 1;
      }
      return 0;
    });
  };
  const model = (key) => ({
    findMany: jest.fn(async (args = {}) =>
      applyOrderBy(state[key].filter((r) => matches(r, args.where)), args.orderBy).map(clone)),
    findUnique: jest.fn(async (args = {}) => clone(state[key].find((r) => matches(r, args.where)))),
    findFirst: jest.fn(async (args = {}) =>
      clone(applyOrderBy(state[key].filter((r) => matches(r, args.where)), args.orderBy)[0])),
    create: jest.fn(async ({ data }) => {
      seq += 1;
      const row = { id: `${key}-${seq}`, ...data };
      state[key].push(row);
      return clone(row);
    }),
    update: jest.fn(async ({ where, data }) => {
      const row = state[key].find((r) => r.id === where.id);
      if (!row) throw Object.assign(new Error('Record not found'), { code: 'P2025' });
      Object.assign(row, data);
      return clone(row);
    }),
  });
  const client = {
    user: model('users'),
    driver: model('drivers'),
    conductor: model('conductors'),
    student: model('students'),
    bus: model('buses'),
    stop: model('stops'),
    school: model('schools'),
    trip: model('trips'),
    tripStop: model('tripStops'),
    liveLocation: model('liveLocations'),
    $queryRaw: jest.fn(async () => []),
    $disconnect: jest.fn(),
  };
  client.$transaction = async (fn) => fn(client);
  client.__state = state;
  client.__reset = (seed) => {
    seq = 0;
    keys.forEach((k) => { state[k] = (seed[k] || []).map((r) => ({ ...r })); });
  };
  return client;
});

jest.mock('../src/services/notificationService', () => ({
  sendNotification: jest.fn(async () => undefined),
  sendMulticast: jest.fn(async () => undefined),
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const prisma = require('../src/db');
const app = require('../src/app');
const locationService = require('../src/services/locationService');
const { createRoomEmitter } = require('../src/sockets/gpsSocket');
const { detectArrival } = require('../src/services/tripService');

const { createLocationService } = locationService;

// ---------------------------------------------------------------------------
// Part 1: ingest with injected fakes. A bad fix after an accepted one has no
// side effects at all: no write, no history, no broadcast, no arrival, no ETA
// hook, and the latest fix stays the accepted one (7.4, 7.6).
// ---------------------------------------------------------------------------
describe('dropped fixes have no side effects (ingest, injected fakes)', () => {
  const NOW = Date.parse('2026-10-22T08:00:00.000Z');
  const STOP = { lat: 12.9716, lng: 77.5946 };
  // The first accepted fix sits ~1.1 km from the Current_Stop and moves fast.
  const FIRST = { lat: STOP.lat + 0.01, lng: STOP.lng, speed: 8, heading: 0, accuracy: 5, recordedAt: NOW - 10000 };

  function setup() {
    const calls = { tripUpdate: 0, history: 0, getCurrentTrip: 0, markArrived: 0, onFix: 0 };
    const events = [];
    const trip = { id: 't1', status: 'ACTIVE', stops: [{ id: 'ts1', order: 1, status: 'PENDING', ...STOP }] };
    const loc = createLocationService({
      prisma: {
        trip: { update: async () => { calls.tripUpdate += 1; return {}; } },
        liveLocation: { create: async () => { calls.history += 1; return {}; } },
      },
      tripService: {
        getCurrentTrip: async () => { calls.getCurrentTrip += 1; return trip; },
        detectArrival,
        markArrived: async () => { calls.markArrived += 1; return trip; },
      },
      now: () => NOW,
      emit: (event, busId, payload) => events.push({ event, busId, payload }),
      onFix: async () => { calls.onFix += 1; },
      logger: { error: () => {}, warn: () => {} },
    });
    return { loc, calls, events };
  }

  // Every candidate sits on the Current_Stop at speed 0, so an accepted one
  // would be an arrival; a dropped one must not be.
  const atStop = (extra) => ({ ...STOP, speed: 0, heading: 0, accuracy: 5, recordedAt: NOW, ...extra });

  test.each([
    ['invalid_coordinates', atStop({ lat: 91 })],
    ['invalid_coordinates', atStop({ lng: Infinity })],
    ['low_accuracy', atStop({ accuracy: 150 })],
    ['invalid_timestamp', atStop({ recordedAt: 'not-a-date' })],
    ['stale', atStop({ recordedAt: NOW - 2 * 60 * 1000 - 1 })],
    ['future', atStop({ recordedAt: NOW + 30 * 1000 + 1 })],
    ['out_of_order', atStop({ recordedAt: FIRST.recordedAt - 1 })],
    ['out_of_order', { ...FIRST }], // exact duplicate replay of the accepted fix
    ['out_of_order', atStop({ recordedAt: FIRST.recordedAt })], // same time, new position
    // ~1.1 km in 1 s is far above 200 km/h.
    ['speed_jump', atStop({ recordedAt: FIRST.recordedAt + 1000 })],
  ])('%s fix is dropped without any side effect', async (reason, bad) => {
    const { loc, calls, events } = setup();
    expect((await loc.ingest('bus-1', FIRST)).accepted).toBe(true);
    const before = { calls: { ...calls }, events: events.length, latest: loc.getLatest('bus-1') };

    expect(await loc.ingest('bus-1', bad)).toEqual({ accepted: false, reason });

    expect(calls).toEqual(before.calls); // no trip lookup, write, history, arrival or onFix
    expect(events).toHaveLength(before.events);
    expect(loc.getLatest('bus-1')).toEqual(before.latest);
    expect(loc.getDrops('bus-1')).toEqual({ [reason]: 1 });
  });

  test('a missing bus id or non-object fix is dropped before touching the cache', async () => {
    const { loc, calls, events } = setup();
    expect(await loc.ingest('', FIRST)).toEqual({ accepted: false, reason: 'invalid_bus' });
    expect(await loc.ingest(null, FIRST)).toEqual({ accepted: false, reason: 'invalid_bus' });
    expect(await loc.ingest('bus-1', null)).toEqual({ accepted: false, reason: 'invalid_fix' });
    expect(calls).toEqual({ tripUpdate: 0, history: 0, getCurrentTrip: 0, markArrived: 0, onFix: 0 });
    expect(events).toHaveLength(0);
    expect(loc.getLatest('bus-1')).toBeNull();
  });

  test('drops do not advance the last fix or consume the broadcast window', async () => {
    const { loc, events } = setup();
    await loc.ingest('bus-1', FIRST);
    // A burst of bad fixes, including a duplicate.
    await loc.ingest('bus-1', { ...FIRST });
    await loc.ingest('bus-1', { ...FIRST, accuracy: 500, recordedAt: FIRST.recordedAt + 1000 });
    await loc.ingest('bus-1', { ...FIRST, recordedAt: NOW - 5 * 60 * 1000 });
    expect(events.filter((e) => e.event === 'bus:location')).toHaveLength(1);

    // The next good fix 1 s after FIRST is accepted and broadcast.
    const next = { ...FIRST, lat: FIRST.lat + 0.0001, recordedAt: FIRST.recordedAt + 1000 };
    expect(await loc.ingest('bus-1', next)).toMatchObject({ accepted: true, broadcast: true });
    expect(events.filter((e) => e.event === 'bus:location')).toHaveLength(2);
    expect(loc.getLatest('bus-1')).toMatchObject({ lat: next.lat, recordedAt: next.recordedAt });
    expect(loc.getDrops('bus-1')).toEqual({ out_of_order: 1, low_accuracy: 1, stale: 1 });
  });

  test('drops are counted per bus', async () => {
    const { loc } = setup();
    await loc.ingest('bus-1', FIRST);
    await loc.ingest('bus-2', FIRST);
    await loc.ingest('bus-1', { ...FIRST });
    expect(loc.getDrops('bus-1')).toEqual({ out_of_order: 1 });
    expect(loc.getDrops('bus-2')).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// Part 2: the HTTP fallback, the shared Location_Service and the snapshot
// endpoints together. Drops are not broadcast and never reach the snapshot.
// ---------------------------------------------------------------------------
const sign = (payload) => `Bearer ${jwt.sign(payload, 'test-jwt-secret')}`;
const T = {
  ADMIN: sign({ id: 'a1', role: 'ADMIN' }),
  PARENT: sign({ id: 'u-parent', role: 'PARENT', phone: '9111111111' }), // st-1 (b1)
  PARENT_B2: sign({ id: 'u-parent2', role: 'PARENT', phone: '9222222222' }), // st-2 (b2)
  DRIVER: sign({ id: 'u-driver', role: 'DRIVER', phone: '9333333333' }), // b1
};

const SEED = {
  drivers: [
    { id: 'dr1', name: 'Ravi', phone: '9333333333', busId: 'b1' },
    { id: 'dr2', name: 'Mohan', phone: '9444444444', busId: 'b2' },
  ],
  conductors: [],
  students: [
    { id: 'st-1', name: 'Kid One', busId: 'b1', parentPhone: '9111111111', parentPhone2: null, stopId: 's-1', dropStopId: null },
    { id: 'st-2', name: 'Kid Two', busId: 'b2', parentPhone: '9222222222', parentPhone2: null, stopId: 's-9', dropStopId: null },
  ],
  buses: [
    { id: 'b1', busNo: 'B-1', status: 'ON_TRIP' },
    { id: 'b2', busNo: 'B-2', status: 'ACTIVE' },
  ],
  trips: [
    { id: 't1', busId: 'b1', driverId: 'dr1', direction: 'PICKUP', status: 'ACTIVE', startedAt: '2026-01-10T07:00:00.000Z',
      lastLat: null, lastLng: null, destName: 'School', destLat: 26.9, destLng: 75.8 },
  ],
  // Far from every fix below, so no arrival is detected.
  tripStops: [
    { id: 'ts-1', tripId: 't1', stopId: 's-1', order: 1, name: 'Gate', lat: 27.5, lng: 76.5, status: 'PENDING' },
  ],
};

const STATE_KEYS = ['busId', 'busNo', 'currentStop', 'destination', 'eta', 'location', 'safetyChecks', 'trip', 'tripStops'];
const LOCATION_KEYS = ['heading', 'lat', 'lng', 'recordedAt', 'speed'];
const CHILD_KEYS = ['busId', 'busNo', 'dropStopId', 'id', 'name', 'relevantStopId', 'relevantTripStop', 'state', 'stopId'];
const keysOf = (o) => Object.keys(o).sort();

let emits = [];
const fakeIo = { to: (room) => ({ emit: (event, payload) => { emits.push({ room, event, payload }); } }) };

const get = (path, token) => request(app).get(path).set('Authorization', token);
const post = (body) => request(app).post('/api/buses/location').set('Authorization', T.DRIVER).send(body);

describe('HTTP intake drops and snapshot endpoints', () => {
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    locationService.setEmitter(createRoomEmitter(fakeIo));
  });
  afterAll(() => {
    locationService.setEmitter(null);
    jest.restoreAllMocks();
  });
  beforeEach(() => {
    prisma.__reset(SEED);
    emits = [];
  });

  test('snapshot shapes before any fix (8.1, 8.2, 8.3)', async () => {
    const bus = await get('/api/tracking/bus/b1/state', T.PARENT);
    expect(bus.status).toBe(200);
    expect(keysOf(bus.body)).toEqual([...STATE_KEYS, 'serverTime', 'success'].sort());
    expect(bus.body).toMatchObject({
      success: true, busId: 'b1', busNo: 'B-1', location: null, eta: null,
      trip: { id: 't1', direction: 'PICKUP', status: 'ACTIVE' },
      tripStops: [{ id: 'ts-1', stopId: 's-1', order: 1, status: 'PENDING' }],
      currentStop: { id: 'ts-1' },
    });

    const parent = await get('/api/tracking/parent', T.PARENT);
    expect(parent.status).toBe(200);
    expect(keysOf(parent.body)).toEqual(['children', 'serverTime', 'success']);
    expect(parent.body.children).toHaveLength(1);
    const [child] = parent.body.children;
    expect(keysOf(child)).toEqual(CHILD_KEYS);
    expect(keysOf(child.state)).toEqual(STATE_KEYS);
    expect(child).toMatchObject({ id: 'st-1', relevantStopId: 's-1', relevantTripStop: { id: 'ts-1' } });

    const admin = await get('/api/tracking/admin/live', T.ADMIN);
    expect(admin.status).toBe(200);
    expect(keysOf(admin.body)).toEqual(['buses', 'serverTime', 'success']);
    expect(admin.body.buses.map((b) => b.busId)).toEqual(['b1', 'b2']);
    admin.body.buses.forEach((b) => expect(keysOf(b)).toEqual(STATE_KEYS));
    // A bus with no trip and no fix is still listed (8.3).
    expect(admin.body.buses[1]).toMatchObject({ busId: 'b2', trip: null, tripStops: [], location: null, eta: null });

    for (const res of [bus, parent, admin]) {
      expect(Number.isNaN(Date.parse(res.body.serverTime))).toBe(false);
    }
  });

  // One sequence against the shared cache for b1, so recordedAt only grows.
  test('bad fixes are dropped, not broadcast and never reach the snapshots (7.4, 7.6)', async () => {
    const base = Date.now() - 60 * 1000;
    const good = { busId: 'b1', lat: 26.71, lng: 75.31, speed: 6, heading: 45, accuracy: 8, recordedAt: new Date(base).toISOString() };

    const first = await post(good);
    expect(first.status).toBe(200);
    expect(first.body).toMatchObject({ accepted: true });
    expect(emits.map((e) => `${e.room}:${e.event}`)).toEqual([
      'bus_b1:bus:location', 'admins:bus:location', 'bus_b1:locationUpdate', 'admins:locationUpdate',
    ]);
    const writes = { trip: prisma.trip.update.mock.calls.length, history: prisma.liveLocation.create.mock.calls.length };
    emits = [];

    const iso = (ms) => new Date(ms).toISOString();
    const drops = [
      [200, 'out_of_order', { ...good }], // duplicate
      [200, 'out_of_order', { ...good, lat: 26.7101, recordedAt: iso(base - 1000) }], // older
      [200, 'stale', { ...good, recordedAt: iso(Date.now() - 5 * 60 * 1000) }],
      [200, 'future', { ...good, recordedAt: iso(Date.now() + 60 * 1000) }],
      [200, 'low_accuracy', { ...good, accuracy: 150, recordedAt: iso(base + 2000) }],
      [200, 'speed_jump', { ...good, lat: 26.72, recordedAt: iso(base + 1000) }], // ~1.1 km in 1 s
      [400, 'invalid_coordinates', { ...good, lat: 95, recordedAt: iso(base + 2000) }],
      [400, 'invalid_timestamp', { ...good, recordedAt: 'yesterday' }],
    ];
    for (const [status, reason, body] of drops) {
      const res = await post(body);
      expect({ reason, status: res.status, body: res.body.reason }).toEqual({ reason, status, body: reason });
      if (status === 200) expect(res.body).toEqual({ success: true, accepted: false, reason });
    }

    expect(emits).toEqual([]);
    expect(prisma.trip.update).toHaveBeenCalledTimes(writes.trip);
    expect(prisma.liveLocation.create).toHaveBeenCalledTimes(writes.history);
    expect(locationService.getDrops('b1')).toEqual({
      out_of_order: 2, stale: 1, future: 1, low_accuracy: 1, speed_jump: 1, invalid_coordinates: 1, invalid_timestamp: 1,
    });

    // Every snapshot still shows the first accepted fix.
    const accepted = { lat: 26.71, lng: 75.31, speed: 6, heading: 45, recordedAt: good.recordedAt };
    const bus = await get('/api/tracking/bus/b1/state', T.DRIVER);
    expect(bus.body.location).toEqual(accepted);
    expect(keysOf(bus.body.location)).toEqual(LOCATION_KEYS);
    const parent = await get('/api/tracking/parent', T.PARENT);
    expect(parent.body.children[0].state.location).toEqual(accepted);
    const admin = await get('/api/tracking/admin/live', T.ADMIN);
    expect(admin.body.buses[0].location).toEqual(accepted);
    expect(admin.body.buses[1].location).toBeNull();

    // A parent of another bus cannot read b1's fix.
    const other = await get('/api/tracking/bus/b1/state', T.PARENT_B2);
    expect(other.status).toBe(403);
    expect(other.body).not.toHaveProperty('location');

    // The next good fix is accepted, broadcast and becomes the snapshot fix.
    const next = { ...good, lat: 26.7105, recordedAt: iso(base + 3000) };
    expect((await post(next)).body).toMatchObject({ accepted: true });
    expect(emits.filter((e) => e.event === 'bus:location')).toHaveLength(2);
    const after = await get('/api/tracking/bus/b1/state', T.ADMIN);
    expect(after.body.location).toEqual({ ...accepted, lat: 26.7105, recordedAt: next.recordedAt });
  });
});

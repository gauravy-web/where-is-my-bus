// Example tests for the state snapshot endpoints (task 6.3). Prisma is an
// in-memory fake; locations go through the real locationService.ingest so the
// snapshot reads the same cache the socket and HTTP fallback write. No DB.
// Validates: Requirements 8.1, 8.2, 8.3, 3.7, 3.8, 3.9
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

const request = require('supertest');
const jwt = require('jsonwebtoken');
const prisma = require('../src/db');
const locationService = require('../src/services/locationService');
const app = require('../src/app');

const sign = (payload) => `Bearer ${jwt.sign(payload, 'test-jwt-secret')}`;
const T = {
  ADMIN: sign({ id: 'a1', role: 'ADMIN' }),
  PARENT: sign({ id: 'u-parent', role: 'PARENT', phone: '9111111111' }), // st-1 (b1), st-2 (b2)
  PARENT2: sign({ id: 'u-parent2', role: 'PARENT', phone: '9222222222' }), // st-3 (b3) via parentPhone2
  PARENT_NONE: sign({ id: 'u-parent3', role: 'PARENT', phone: '9777777777' }),
  DRIVER: sign({ id: 'u-driver', role: 'DRIVER', phone: '9333333333' }), // b1
  DRIVER_NO_BUS: sign({ id: 'u-driver3', role: 'DRIVER', phone: '9666666666' }),
  CONDUCTOR: sign({ id: 'u-conductor', role: 'CONDUCTOR', phone: '9555555555' }), // b1
};

const STARTED = '2026-01-10T07:00:00.000Z';
const B2_FIX_AT = '2026-01-10T13:00:05.000Z';

const SEED = {
  drivers: [
    { id: 'dr1', name: 'Ravi', phone: '+91 93333 33333', busId: 'b1' },
    { id: 'dr2', name: 'Mohan', phone: '9444444444', busId: 'b2' },
    { id: 'dr3', name: 'Spare', phone: '9666666666', busId: null },
  ],
  conductors: [{ id: 'c1', name: 'Asha', phone: '9555555555', busId: 'b1' }],
  students: [
    { id: 'st-1', name: 'Kid One', busId: 'b1', parentPhone: '+91 91111 11111', parentPhone2: null, stopId: 's-b', dropStopId: 'd-1' },
    { id: 'st-2', name: 'Kid Two', busId: 'b2', parentPhone: '9111111111', parentPhone2: null, stopId: 'x-1', dropStopId: 'x-d' },
    { id: 'st-3', name: 'Kid Three', busId: 'b3', parentPhone: '9888888888', parentPhone2: '9222222222', stopId: 'z-1', dropStopId: null },
  ],
  buses: [
    { id: 'b2', busNo: 'B-2', status: 'ON_TRIP' },
    { id: 'b1', busNo: 'B-1', status: 'ON_TRIP' },
    { id: 'b3', busNo: 'B-3', status: 'ACTIVE' },
  ],
  trips: [
    { id: 't1', busId: 'b1', driverId: 'dr1', direction: 'PICKUP', status: 'ACTIVE', startedAt: STARTED,
      lastLat: null, lastLng: null, destName: 'School', destLat: 26.9, destLng: 75.8 },
    { id: 't2', busId: 'b2', driverId: 'dr2', direction: 'DROP', status: 'ACTIVE', startedAt: STARTED,
      lastLat: 26.61, lastLng: 75.61, lastSpeed: 4, lastHeading: 180, lastLocationAt: B2_FIX_AT,
      destName: null, destLat: null, destLng: null },
    { id: 't3', busId: 'b3', driverId: 'dr9', direction: 'PICKUP', status: 'COMPLETED', startedAt: STARTED },
  ],
  // Inserted out of order; saved order is s-c, s-b, s-a (not geographic).
  tripStops: [
    { id: 'ts-3', tripId: 't1', stopId: 's-a', order: 3, name: 'A', lat: 26.5, lng: 75.1, status: 'PENDING' },
    { id: 'ts-1', tripId: 't1', stopId: 's-c', order: 1, name: 'C', lat: 26.89, lng: 75.79, status: 'COMPLETED' },
    { id: 'ts-2', tripId: 't1', stopId: 's-b', order: 2, name: 'B', lat: 26.7, lng: 75.3, status: 'PENDING' },
    { id: 'tx-1', tripId: 't2', stopId: 'x-d', order: 1, name: 'XD', lat: 26.6, lng: 75.6, status: 'ARRIVED' },
    { id: 'tz-1', tripId: 't3', stopId: 'z-1', order: 1, name: 'Z1', lat: 26.4, lng: 75.4, status: 'COMPLETED' },
  ],
};

const get = (path, token) => {
  const r = request(app).get(path);
  return token ? r.set('Authorization', token) : r;
};

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

beforeEach(() => {
  prisma.__reset(SEED);
});

describe('authentication and roles', () => {
  test('401 without a token or with a bad token on every snapshot endpoint', async () => {
    for (const path of ['/api/tracking/bus/b1/state', '/api/tracking/parent', '/api/tracking/admin/live']) {
      expect((await get(path)).status).toBe(401);
      expect((await get(path, 'Bearer not-a-jwt')).status).toBe(401);
    }
  });

  test('/parent is PARENT only and /admin/live is ADMIN only', async () => {
    for (const token of [T.ADMIN, T.DRIVER, T.CONDUCTOR]) {
      expect((await get('/api/tracking/parent', token)).status).toBe(403);
    }
    for (const token of [T.PARENT, T.DRIVER, T.CONDUCTOR]) {
      expect((await get('/api/tracking/admin/live', token)).status).toBe(403);
    }
  });
});

describe('GET /api/tracking/bus/:busId/state', () => {
  test('returns the ACTIVE trip with TripStops in snapshot order, current stop, destination and eta null', async () => {
    const res = await get('/api/tracking/bus/b1/state', T.ADMIN);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      busId: 'b1',
      busNo: 'B-1',
      trip: { id: 't1', direction: 'PICKUP', status: 'ACTIVE' },
      currentStop: { id: 'ts-2', stopId: 's-b' },
      destination: { kind: 'STOP', tripStopId: 'ts-2' },
      location: null,
      eta: null,
    });
    expect(res.body.tripStops.map((s) => s.id)).toEqual(['ts-1', 'ts-2', 'ts-3']);
    expect(Number.isNaN(Date.parse(res.body.serverTime))).toBe(false);
  });

  test('includes the latest accepted fix with an ISO recordedAt', async () => {
    const recordedAt = Date.now() - 1000;
    const ingest = await locationService.ingest('b1', {
      lat: 26.71, lng: 75.31, accuracy: 8, speed: 6, heading: 45, recordedAt,
    });
    expect(ingest.accepted).toBe(true);

    const res = await get('/api/tracking/bus/b1/state', T.DRIVER);
    expect(res.status).toBe(200);
    expect(res.body.location).toEqual({
      lat: 26.71, lng: 75.31, speed: 6, heading: 45, recordedAt: new Date(recordedAt).toISOString(),
    });
  });

  test('without an in-memory fix the trip\'s last-location fields are used', async () => {
    const res = await get('/api/tracking/bus/b2/state', T.ADMIN);
    expect(res.status).toBe(200);
    expect(res.body.location).toEqual({ lat: 26.61, lng: 75.61, speed: 4, heading: 180, recordedAt: B2_FIX_AT });
    expect(res.body.currentStop).toMatchObject({ id: 'tx-1', status: 'ARRIVED' });
  });

  test('a bus with only a COMPLETED trip and no fix reports no trip and no location', async () => {
    const res = await get('/api/tracking/bus/b3/state', T.ADMIN);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      busId: 'b3', busNo: 'B-3', trip: null, tripStops: [], currentStop: null, destination: null, location: null, eta: null,
    });
  });

  test('DRIVER and CONDUCTOR read their assigned bus; any other bus is 403', async () => {
    for (const token of [T.DRIVER, T.CONDUCTOR]) {
      const own = await get('/api/tracking/bus/b1/state', token);
      expect(own.status).toBe(200);
      expect(own.body.trip.id).toBe('t1');
      expect((await get('/api/tracking/bus/b2/state', token)).status).toBe(403);
    }
    expect((await get('/api/tracking/bus/b1/state', T.DRIVER_NO_BUS)).status).toBe(403);
  });

  test('PARENT reads a child\'s bus (parentPhone or parentPhone2); other buses are 403', async () => {
    expect((await get('/api/tracking/bus/b1/state', T.PARENT)).status).toBe(200);
    expect((await get('/api/tracking/bus/b2/state', T.PARENT)).status).toBe(200);
    expect((await get('/api/tracking/bus/b3/state', T.PARENT)).status).toBe(403);
    expect((await get('/api/tracking/bus/b3/state', T.PARENT2)).status).toBe(200);
    expect((await get('/api/tracking/bus/b1/state', T.PARENT2)).status).toBe(403);
  });

  test('an unknown bus is 403 for non-admins (no existence leak) and 404 for ADMIN', async () => {
    for (const token of [T.PARENT, T.DRIVER, T.CONDUCTOR]) {
      const res = await get('/api/tracking/bus/nope/state', token);
      expect(res.status).toBe(403);
      expect(res.body).toEqual((await get('/api/tracking/bus/b3/state', T.PARENT)).body);
    }
    const admin = await get('/api/tracking/bus/nope/state', T.ADMIN);
    expect(admin.status).toBe(404);
    expect(admin.body).toEqual({ message: 'Bus not found' });
  });

  test('an unexpected error is a 500 with a generic message', async () => {
    prisma.trip.findFirst.mockRejectedValueOnce(new Error('connection lost'));
    const res = await get('/api/tracking/bus/b1/state', T.ADMIN);
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: 'Tracking state unavailable' });
  });
});

describe('GET /api/tracking/parent', () => {
  test('returns each own child with bus state and Relevant_Stop for the trip direction', async () => {
    const res = await get('/api/tracking/parent', T.PARENT);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const byId = Object.fromEntries(res.body.children.map((c) => [c.id, c]));
    expect(Object.keys(byId).sort()).toEqual(['st-1', 'st-2']);

    // PICKUP trip -> stopId
    expect(byId['st-1']).toMatchObject({
      name: 'Kid One', busId: 'b1', busNo: 'B-1', stopId: 's-b', dropStopId: 'd-1',
      relevantStopId: 's-b', relevantTripStop: { id: 'ts-2', status: 'PENDING' },
      state: { busId: 'b1', trip: { id: 't1' }, currentStop: { id: 'ts-2' }, eta: null },
    });
    expect(byId['st-1'].state.tripStops.map((s) => s.id)).toEqual(['ts-1', 'ts-2', 'ts-3']);

    // DROP trip -> dropStopId
    expect(byId['st-2']).toMatchObject({
      busId: 'b2', relevantStopId: 'x-d', relevantTripStop: { id: 'tx-1' },
      state: { busId: 'b2', trip: { id: 't2', direction: 'DROP' }, location: { recordedAt: B2_FIX_AT } },
    });

    // Child data only: no parent phones, nothing from other families.
    for (const child of res.body.children) {
      expect(child).not.toHaveProperty('parentPhone');
      expect(child).not.toHaveProperty('parentPhone2');
    }
    expect(JSON.stringify(res.body)).not.toContain('st-3');
  });

  test('a child whose bus has no ACTIVE trip has a state with trip null and no Relevant_Stop', async () => {
    const res = await get('/api/tracking/parent', T.PARENT2);
    expect(res.status).toBe(200);
    expect(res.body.children).toHaveLength(1);
    expect(res.body.children[0]).toMatchObject({
      id: 'st-3', busId: 'b3', relevantStopId: null, relevantTripStop: null,
      state: { busId: 'b3', busNo: 'B-3', trip: null, tripStops: [], location: null, eta: null },
    });
  });

  test('a parent with no linked students gets an empty list', async () => {
    const res = await get('/api/tracking/parent', T.PARENT_NONE);
    expect(res.status).toBe(200);
    expect(res.body.children).toEqual([]);
  });
});

describe('ETA in the snapshots (task 7.2)', () => {
  const { createEtaService } = require('../src/services/etaService');
  const { createEtaCoordinator } = require('../src/services/etaCoordinator');
  const tripService = require('../src/services/tripService');
  const geometry = { type: 'LineString', coordinates: [[75.31, 26.71], [75.3, 26.7], [75.1, 26.5], [75.8, 26.9]] };
  let coordinator;
  let osrmFetch;
  let emitted;

  beforeEach(() => {
    emitted = [];
    // Fake OSRM: t1's open waypoints are ts-2, ts-3, then the school.
    osrmFetch = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ code: 'Ok', routes: [{ legs: [{ duration: 120 }, { duration: 240 }, { duration: 60 }], geometry }] }),
    }));
    coordinator = createEtaCoordinator({
      etaService: createEtaService({ fetch: osrmFetch, osrmUrl: 'http://osrm.test', logger: { warn() {} }, tripService }),
      tripService,
      emit: (event, busId, payload) => emitted.push({ event, busId, payload }),
    });
    app.set('etaCoordinator', coordinator);
    // The real ingest feeds the coordinator, as gpsSocket(io) wires it at startup.
    locationService.setOnFix((busId, fix, trip) => coordinator.onFix(busId, fix, trip));
  });

  afterEach(() => {
    locationService.setOnFix(null);
    app.set('etaCoordinator', undefined);
  });

  const ingestB1 = async () => {
    const last = locationService.getLatest('b1');
    const recordedAt = Math.max(Date.now() - 500, (last?.recordedAt || 0) + 1000);
    const res = await locationService.ingest('b1', { lat: 26.71, lng: 75.31, accuracy: 5, speed: 6, recordedAt });
    expect(res.accepted).toBe(true);
  };

  test('an accepted fix computes the ETA, emits trip:eta and the snapshots include ETA and geometry', async () => {
    await ingestB1();

    expect(osrmFetch).toHaveBeenCalledTimes(1);
    const eta = {
      perStop: [{ tripStopId: 'ts-2', etaSeconds: 120 }, { tripStopId: 'ts-3', etaSeconds: 360 }],
      school: { etaSeconds: 420 },
      geometry,
      computedAt: expect.any(String),
    };
    expect(emitted).toEqual([{ event: 'trip:eta', busId: 'b1', payload: { busId: 'b1', tripId: 't1', eta } }]);

    const bus = await get('/api/tracking/bus/b1/state', T.PARENT);
    expect(bus.status).toBe(200);
    expect(bus.body.eta).toEqual(eta);
    expect(Number.isNaN(Date.parse(bus.body.eta.computedAt))).toBe(false);

    const parent = await get('/api/tracking/parent', T.PARENT);
    const kid = parent.body.children.find((c) => c.id === 'st-1');
    expect(kid.state.eta).toEqual(eta);

    const admin = await get('/api/tracking/admin/live', T.ADMIN);
    const [b1, b2] = admin.body.buses;
    expect(b1.eta).toEqual(eta);
    expect(b2.eta).toBeNull(); // no fix for b2 -> no ETA
  });

  test('an OSRM failure emits trip:eta null and the snapshot reports eta null', async () => {
    osrmFetch.mockImplementation(async () => ({ ok: true, status: 200, json: async () => ({ code: 'NoRoute' }) }));
    await ingestB1();
    expect(emitted).toEqual([{ event: 'trip:eta', busId: 'b1', payload: { busId: 'b1', tripId: 't1', eta: null } }]);
    expect((await get('/api/tracking/bus/b1/state', T.ADMIN)).body.eta).toBeNull();
  });

  test('a cached ETA is not served once the trip ended or for a different ACTIVE trip', async () => {
    await ingestB1();
    expect((await get('/api/tracking/bus/b1/state', T.ADMIN)).body.eta).not.toBeNull();

    // A new ACTIVE trip replaced t1 (e.g. ended elsewhere and restarted).
    const t1 = prisma.__state.trips.find((t) => t.id === 't1');
    t1.status = 'COMPLETED';
    prisma.__state.trips.push({ ...t1, id: 't9', status: 'ACTIVE', startedAt: '2026-01-10T08:00:00.000Z' });
    const other = await get('/api/tracking/bus/b1/state', T.ADMIN);
    expect(other.body.trip.id).toBe('t9');
    expect(other.body.eta).toBeNull();

    // No ACTIVE trip at all.
    prisma.__state.trips = prisma.__state.trips.filter((t) => t.id !== 't9');
    const ended = await get('/api/tracking/bus/b1/state', T.ADMIN);
    expect(ended.body.trip).toBeNull();
    expect(ended.body.eta).toBeNull();
  });
});

describe('GET /api/tracking/admin/live', () => {
  test('returns every bus, including buses with no trip and no fix', async () => {
    const res = await get('/api/tracking/admin/live', T.ADMIN);
    expect(res.status).toBe(200);
    expect(res.body.buses.map((b) => b.busId)).toEqual(['b1', 'b2', 'b3']);
    const [b1, b2, b3] = res.body.buses;
    expect(b1).toMatchObject({ busNo: 'B-1', trip: { id: 't1' }, currentStop: { id: 'ts-2' }, eta: null });
    expect(b1.tripStops.map((s) => s.id)).toEqual(['ts-1', 'ts-2', 'ts-3']);
    expect(b2).toMatchObject({ busNo: 'B-2', trip: { id: 't2' }, location: { lat: 26.61, recordedAt: B2_FIX_AT } });
    expect(b3).toMatchObject({ busNo: 'B-3', trip: null, tripStops: [], location: null, eta: null });
  });
});

// Admin fleet snapshot: stop order, people, trip status, location source and
// status (stale / offline never reported as live), and ADMIN-only access.
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/testdb';
process.env.JWT_SECRET = 'test-jwt-secret';

jest.mock('../src/db', () => {
  const empty = () => ({ findMany: jest.fn(async () => []), findFirst: jest.fn(async () => null) });
  return {
    bus: { findMany: jest.fn(async () => []), findUnique: jest.fn(async () => null) },
    driver: empty(), conductor: empty(), route: empty(), stop: empty(), school: empty(), trip: empty(),
    $disconnect: jest.fn(),
  };
});

const request = require('supertest');
const jwt = require('jsonwebtoken');
const prisma = require('../src/db');
const { buildFleet, locationStatusOf } = require('../src/services/fleetService');
const { createLocationSourceService } = require('../src/services/locationSourceService');
const { validateFix } = require('../src/services/locationService');

const NOW = 1_700_000_000_000;
const iso = (ms) => new Date(ms).toISOString();

function fakes({ fixes = {}, rows = {} } = {}) {
  const data = {
    bus: [
      { id: 'b2', busNo: '102', status: 'INACTIVE' },
      { id: 'b1', busNo: '101', status: 'ON_TRIP' },
      { id: 'b3', busNo: '103', status: 'INACTIVE' },
    ],
    driver: [{ id: 'd1', name: 'Ravi', phone: '111', busId: 'b1' }],
    conductor: [{ id: 'c1', name: 'Sita', phone: '222', busId: 'b1' }],
    route: [{ id: 'r1', name: 'North Route', busId: 'b1', startPoint: 'A', endPoint: 'School' }],
    stop: [
      { id: 's3', busId: 'b1', direction: 'PICKUP', order: 3, name: 'Third', lat: 12.3, lng: 77.3 },
      { id: 's1', busId: 'b1', direction: 'PICKUP', order: 1, name: 'First', lat: 12.1, lng: 77.1 },
      { id: 's2', busId: 'b1', direction: 'PICKUP', order: 2, name: 'Second', lat: 12.2, lng: 77.2 },
      { id: 'd2', busId: 'b1', direction: 'DROP', order: 2, name: 'Home B', lat: 12.5, lng: 77.5 },
      { id: 'd1', busId: 'b1', direction: 'DROP', order: 1, name: 'Home A', lat: 12.4, lng: 77.4 },
      { id: 'bad', busId: 'b1', direction: 'PICKUP', order: 4, name: 'No coords', lat: 0, lng: 0 },
    ],
    school: { name: 'My School', lat: 12.9, lng: 77.9 },
    trip: [],
    ...rows,
  };
  const model = (key) => ({
    findMany: jest.fn(async () => (Array.isArray(data[key]) ? data[key] : [])),
    findFirst: jest.fn(async () => (Array.isArray(data[key]) ? data[key][0] || null : data[key])),
  });
  const db = { bus: model('bus'), driver: model('driver'), conductor: model('conductor'), route: model('route'), stop: model('stop'), school: model('school'), trip: model('trip') };
  const locationService = { getLatest: (id) => fixes[id] || null };
  const source = createLocationSourceService({ prisma: db, locationService, validateFix, now: () => NOW });
  return { db, locationService, source };
}

const find = (fleet, id) => fleet.buses.find((b) => b.busId === id);

describe('locationStatusOf', () => {
  test.each([
    ['MOBILE', 5000, 'LIVE'],
    ['DEVICE', 61000, 'STALE'],
    ['MOBILE', 11 * 60000, 'OFFLINE'],
    ['NONE', 1000, 'OFFLINE'],
    ['MOBILE', null, 'OFFLINE'],
  ])('%s age %s -> %s', (source, age, expected) => {
    expect(locationStatusOf(source, age === null ? null : NOW - age, NOW)).toBe(expected);
  });
});

describe('buildFleet', () => {
  test('lists every bus, sorted, with ordered stops, people and route name', async () => {
    const f = fakes();
    const fleet = await buildFleet({ prisma: f.db, locationService: f.locationService, locationSource: f.source, now: () => NOW });
    expect(fleet.buses.map((b) => b.busNo)).toEqual(['102', '101', '103']); // order from the bus query is kept
    const b1 = find(fleet, 'b1');
    expect(b1.pickupStops.map((s) => s.name)).toEqual(['First', 'Second', 'Third']);
    expect(b1.pickupStops.map((s) => s.seq)).toEqual([1, 2, 3]);
    expect(b1.dropStops.map((s) => s.name)).toEqual(['Home A', 'Home B']);
    expect(b1.driver).toMatchObject({ name: 'Ravi', phone: '111' });
    expect(b1.conductor).toMatchObject({ name: 'Sita' });
    expect(b1.route).toMatchObject({ name: 'North Route' });
    expect(fleet.school).toEqual({ name: 'My School', lat: 12.9, lng: 77.9 });
    const b3 = find(fleet, 'b3');
    expect(b3).toMatchObject({ driver: null, conductor: null, route: null, pickupStops: [], dropStops: [], location: null, locationStatus: 'OFFLINE', tripStatus: 'NOT_STARTED' });
  });

  test('fresh fix is LIVE, old fix STALE, very old OFFLINE; never live when stale', async () => {
    const f = fakes({
      fixes: {
        b1: { lat: 12, lng: 77, speed: 3, heading: 90, recordedAt: NOW - 5000 },
        b2: { lat: 12, lng: 77, speed: 0, heading: null, recordedAt: NOW - 120000 },
        b3: { lat: 12, lng: 77, speed: 0, heading: null, recordedAt: NOW - 3600000 },
      },
    });
    const fleet = await buildFleet({ prisma: f.db, locationService: f.locationService, locationSource: f.source, now: () => NOW });
    expect(find(fleet, 'b1')).toMatchObject({ locationStatus: 'LIVE', locationSource: 'MOBILE' });
    expect(find(fleet, 'b2').locationStatus).toBe('STALE');
    expect(find(fleet, 'b3').locationStatus).toBe('OFFLINE');
    expect(find(fleet, 'b1').location.recordedAt).toBe(iso(NOW - 5000));
  });

  test('trip status: active, recently completed, old completed', async () => {
    const f = fakes({
      rows: {
        trip: [
          { id: 't1', busId: 'b1', status: 'ACTIVE', direction: 'PICKUP', startedAt: new Date(NOW - 600000), endedAt: null, lastLat: 12.2, lastLng: 77.2, lastLocationAt: new Date(NOW - 3000) },
          { id: 't2', busId: 'b2', status: 'COMPLETED', direction: 'DROP', startedAt: new Date(NOW - 7200000), endedAt: new Date(NOW - 3600000) },
          { id: 't3', busId: 'b3', status: 'COMPLETED', direction: 'DROP', startedAt: new Date(NOW - 30 * 3600000), endedAt: new Date(NOW - 29 * 3600000) },
        ],
      },
    });
    const fleet = await buildFleet({ prisma: f.db, locationService: f.locationService, locationSource: f.source, now: () => NOW });
    expect(find(fleet, 'b1')).toMatchObject({ tripStatus: 'ACTIVE', tripDirection: 'PICKUP', locationStatus: 'LIVE' });
    expect(find(fleet, 'b1').location).toMatchObject({ lat: 12.2, lng: 77.2 }); // falls back to the trip's last position
    expect(find(fleet, 'b2')).toMatchObject({ tripStatus: 'COMPLETED', tripDirection: 'DROP' });
    expect(find(fleet, 'b3').tripStatus).toBe('NOT_STARTED');
  });

  test('reports the device as source and OFFLINE when no source is available', async () => {
    const f = fakes({ fixes: { b1: { lat: 12, lng: 77, recordedAt: NOW - 1000 } } });
    f.db.bus.findUnique = jest.fn(async () => ({ locationMode: 'DEVICE_PRIMARY', activeSource: 'DEVICE' }));
    f.db.gpsDevice = { findUnique: jest.fn(async () => ({ deviceId: 'g1', revokedAt: null, lastFixAt: new Date(NOW - 1000) })), update: jest.fn() };
    await f.source.ingestMobile('b1', { lat: 'x' }).catch(() => {}); // loads state; locationService has no ingest, ignored
    const fleet = await buildFleet({ prisma: f.db, locationService: f.locationService, locationSource: f.source, now: () => NOW });
    expect(find(fleet, 'b1')).toMatchObject({ locationMode: 'DEVICE_PRIMARY', locationSource: 'DEVICE', locationStatus: 'LIVE' });
  });

  test('does not write anything', async () => {
    const f = fakes();
    await buildFleet({ prisma: f.db, locationService: f.locationService, locationSource: f.source, now: () => NOW });
    Object.values(f.db).forEach((m) => {
      ['create', 'update', 'delete', 'upsert'].forEach((w) => expect(m[w]).toBeUndefined());
    });
  });
});

describe('GET /api/tracking/admin/fleet', () => {
  const app = require('../src/app');
  const sign = (p) => `Bearer ${jwt.sign(p, 'test-jwt-secret')}`;

  test('401 without token, 403 for non-admins', async () => {
    expect((await request(app).get('/api/tracking/admin/fleet')).status).toBe(401);
    for (const role of ['PARENT', 'DRIVER', 'CONDUCTOR']) {
      const r = await request(app).get('/api/tracking/admin/fleet').set('Authorization', sign({ id: 'u', role }));
      expect(r.status).toBe(403);
    }
  });

  test('admin gets the fleet', async () => {
    prisma.bus.findMany.mockResolvedValueOnce([{ id: 'x1', busNo: '7' }]);
    const r = await request(app).get('/api/tracking/admin/fleet').set('Authorization', sign({ id: 'a', role: 'ADMIN' }));
    expect(r.status).toBe(200);
    expect(r.body.success).toBe(true);
    expect(r.body.buses).toHaveLength(1);
    expect(r.body.buses[0]).toMatchObject({ busId: 'x1', busNo: '7', tripStatus: 'NOT_STARTED', locationStatus: 'OFFLINE' });
  });
});

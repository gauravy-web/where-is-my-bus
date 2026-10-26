// Task 6.2: POST /api/buses/location (HTTP fallback) goes through the shared
// Location_Service.ingest and broadcasts bus:location + legacy locationUpdate
// to the bus room and admins (Requirements 3.3, 7.9). Prisma is an in-memory
// fake; Socket.IO is a recording fake wired with the production room emitter.
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/testdb';
process.env.JWT_SECRET = 'test-jwt-secret';

jest.mock('../src/db', () => {
  const store = {
    drivers: [
      { id: 'dr1', name: 'Ravi', phone: '9333333333', busId: 'b1' },
      { id: 'dr2', name: 'Mohan', phone: '9444444444', busId: 'b2' },
    ],
    conductors: [{ id: 'c1', name: 'Asha', phone: '9555555555', busId: 'b1' }],
    students: [{ id: 's1', name: 'Kid', busId: 'b1', parentPhone: '9111111111' }],
    // Far from every fix below, so no arrival is detected.
    trips: [{ id: 't1', busId: 'b1', direction: 'PICKUP', status: 'ACTIVE', destLat: null, destLng: null }],
    tripStops: [{ id: 'ts1', tripId: 't1', stopId: 'st1', name: 'Gate', lat: 27.5, lng: 76.5, order: 1, status: 'PENDING' }],
  };
  const clone = (x) => (x ? { ...x } : null);
  return {
    __store: store,
    user: { findUnique: jest.fn(async () => null), findMany: jest.fn(async () => []) },
    driver: { findMany: jest.fn(async () => store.drivers.map(clone)) },
    conductor: { findMany: jest.fn(async () => store.conductors.map(clone)) },
    student: { findMany: jest.fn(async () => store.students.map(clone)) },
    trip: {
      findFirst: jest.fn(async ({ where }) =>
        clone(store.trips.find((t) => t.busId === where.busId && t.status === where.status))),
      update: jest.fn(async ({ where, data }) => ({ ...store.trips.find((t) => t.id === where.id), ...data })),
    },
    tripStop: { findMany: jest.fn(async ({ where }) => store.tripStops.filter((s) => s.tripId === where.tripId).map(clone)) },
    liveLocation: { create: jest.fn(async ({ data }) => ({ id: 'l1', ...data })) },
    $queryRaw: jest.fn(async () => []),
  };
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

const sign = (payload) => `Bearer ${jwt.sign(payload, 'test-jwt-secret')}`;
const ADMIN = sign({ id: 'a1', role: 'ADMIN' });
const PARENT = sign({ id: 'u-parent', role: 'PARENT', phone: '9111111111' });
const DRIVER = sign({ id: 'u-driver', role: 'DRIVER', phone: '9333333333' });
const CONDUCTOR = sign({ id: 'u-conductor', role: 'CONDUCTOR', phone: '9555555555' });

let emits = [];
const fakeIo = {
  to: (room) => ({ emit: (event, payload) => { emits.push({ room, event, payload }); } }),
};
const emitted = (event) => emits.filter((e) => e.event === event);

const post = (auth, body) => {
  const r = request(app).post('/api/buses/location');
  return (auth ? r.set('Authorization', auth) : r).send(body);
};

let ingest;
beforeAll(() => {
  locationService.setEmitter(createRoomEmitter(fakeIo));
});
beforeEach(() => {
  emits = [];
  ingest = jest.spyOn(locationService, 'ingest');
});
afterEach(() => {
  ingest.mockRestore();
  jest.clearAllMocks();
});
afterAll(() => {
  locationService.setEmitter(null);
});

// The tests below share the Location_Service cache for b1, so they run in
// order with increasing recordedAt values.
describe('POST /api/buses/location through ingest', () => {
  test('only the DRIVER of body.busId reaches ingest', async () => {
    const fix = (busId) => ({ busId, lat: 26.9, lng: 75.8, speed: 10 });
    expect((await post(null, fix('b1'))).status).toBe(401);
    expect((await post(PARENT, fix('b1'))).status).toBe(403);
    expect((await post(ADMIN, fix('b1'))).status).toBe(403);
    expect((await post(CONDUCTOR, fix('b1'))).status).toBe(403);
    expect((await post(DRIVER, fix('b2'))).status).toBe(403);
    expect((await post(DRIVER, { lat: 26.9, lng: 75.8 })).status).toBe(400);
    expect(ingest).not.toHaveBeenCalled();
    expect(emits).toHaveLength(0);
  });

  test('a fix is ingested, saved and broadcast as bus:location + locationUpdate to both rooms', async () => {
    const recordedAt = new Date(Date.now() - 60 * 1000).toISOString();
    const res = await post(DRIVER, {
      busId: 'b1', lat: 26.9, lng: 75.8, speed: 5, heading: 180, accuracy: 6, recordedAt,
    });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, accepted: true });

    expect(ingest).toHaveBeenCalledWith('b1', expect.objectContaining({ lat: 26.9, lng: 75.8, speed: 5, recordedAt }));
    const busLocation = {
      busId: 'b1', tripId: 't1', lat: 26.9, lng: 75.8, speed: 5, heading: 180, accuracy: 6, recordedAt,
    };
    expect(emitted('bus:location')).toEqual([
      { room: 'bus_b1', event: 'bus:location', payload: busLocation },
      { room: 'admins', event: 'bus:location', payload: busLocation },
    ]);
    const legacy = { busId: 'b1', lat: 26.9, lng: 75.8, speed: 18 };
    expect(emitted('locationUpdate')).toEqual([
      { room: 'bus_b1', event: 'locationUpdate', payload: legacy },
      { room: 'admins', event: 'locationUpdate', payload: legacy },
    ]);
    expect(prisma.trip.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 't1' },
      data: expect.objectContaining({ lastLat: 26.9, lastLng: 75.8, lastSpeed: 5, lastHeading: 180 }),
    }));
    expect(prisma.liveLocation.create).toHaveBeenCalledTimes(1);
    expect(emitted('trip:state')).toHaveLength(0);
    expect(locationService.getLatest('b1')).toMatchObject({ lat: 26.9, lng: 75.8 });
  });

  test('a legacy body (km/h, no recordedAt) is stamped with server time', async () => {
    const before = Date.now();
    const res = await post(DRIVER, { busId: 'b1', lat: 26.9005, lng: 75.8, speed: 36 });
    expect(res.status).toBe(200);
    expect(res.body.accepted).toBe(true);

    const [, fix] = ingest.mock.calls[0];
    expect(fix.recordedAt).toBeGreaterThanOrEqual(before);
    expect(fix.speed).toBeCloseTo(10);
    const [bus] = emitted('bus:location');
    expect(bus.payload.speed).toBeCloseTo(10);
    expect(emitted('locationUpdate')[0].payload).toEqual({ busId: 'b1', lat: 26.9005, lng: 75.8, speed: 36 });
  });

  test('a stale fix is dropped with 200 accepted:false and nothing is broadcast', async () => {
    const res = await post(DRIVER, {
      busId: 'b1', lat: 26.9, lng: 75.8, recordedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, accepted: false, reason: 'stale' });
    expect(emits).toHaveLength(0);
    expect(prisma.liveLocation.create).not.toHaveBeenCalled();
  });

  test('a malformed fix gets 400', async () => {
    const res = await post(DRIVER, { busId: 'b1', lat: 'abc', lng: 75.8 });
    expect(res.status).toBe(400);
    expect(res.body.reason).toBe('invalid_coordinates');
    expect(emits).toHaveLength(0);
  });
});

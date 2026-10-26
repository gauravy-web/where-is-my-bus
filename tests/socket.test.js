// In-process Socket.IO tests for the authenticated gateway (Requirements 4.1-4.4).
// A real http server + Socket.IO Server listens on an ephemeral port; clients
// connect with socket.io-client. Prisma is an in-memory fake, so no DB access.
const http = require('http');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const { io: ioClient } = require('socket.io-client');
const { createGpsSocket, createRoomEmitter } = require('../src/sockets/gpsSocket');
const { createAccessService } = require('../src/services/accessService');
const { createLocationService } = require('../src/services/locationService');
const { tripState } = require('../src/services/tripService');

const SECRET = 'test-secret';
const NEGATIVE_WAIT_MS = 200;
const POSITIVE_TIMEOUT_MS = 2000;

const users = [
  { id: 'admin1', role: 'ADMIN', phone: '9000000000' },
  { id: 'parent1', role: 'PARENT', phone: '9000000001' },
  // Children on two buses (b1 and b2).
  { id: 'parent2', role: 'PARENT', phone: '9000000002' },
  { id: 'driver1', role: 'DRIVER', phone: '9000000011' },
  { id: 'driver2', role: 'DRIVER', phone: '9000000012' },
  { id: 'conductor1', role: 'CONDUCTOR', phone: '9000000021' },
  { id: 'conductor2', role: 'CONDUCTOR', phone: '9000000022' },
];
const students = [
  { id: 's1', name: 'Child One', parentPhone: '+91 90000 00001', busId: 'b1' },
  { id: 's2', name: 'Other Child', parentPhone: '9000000099', busId: 'b2' },
  { id: 's3', name: 'Sibling A', parentPhone: '9000000002', busId: 'b1' },
  { id: 's4', name: 'Sibling B', parentPhone: '9000000002', busId: 'b2' },
];
const drivers = [
  { id: 'd1', phone: '9000000011', busId: 'b1' },
  { id: 'd2', phone: '9000000012', busId: 'b2' },
];
const conductors = [
  { id: 'c1', name: 'Sunil', phone: '+91 90000 00021', busId: 'b1' },
  // Not assigned to any bus yet.
  { id: 'c2', name: 'Spare', phone: '9000000022', busId: null },
];

const fakePrisma = {
  user: {
    findUnique: jest.fn(async ({ where }) => {
      const u = users.find((x) => x.id === where.id);
      return u ? { phone: u.phone } : null;
    }),
    findMany: jest.fn(async () => []),
  },
  student: { findMany: jest.fn(async () => students.map((s) => ({ ...s }))) },
  driver: { findMany: jest.fn(async () => drivers.map((d) => ({ ...d }))) },
  conductor: { findMany: jest.fn(async () => conductors.map((c) => ({ ...c }))) },
  liveLocation: { create: jest.fn(async ({ data }) => ({ id: 'll', ...data })) },
  trip: { update: jest.fn(async ({ where, data }) => ({ id: where.id, ...data })) },
  emergency: { create: jest.fn(async ({ data }) => ({ id: 'em', ...data })) },
  bus: { update: jest.fn(async ({ where, data }) => ({ id: where.id, ...data })) },
  $queryRaw: jest.fn(async () => []),
};
const sendMulticast = jest.fn(async () => ({}));

// ACTIVE trips by bus id, read through a minimal Trip_Service.
let activeTrips = {};
const fakeTrips = { getCurrentTrip: jest.fn(async (busId) => activeTrips[busId] || null) };
const ACTIVE_B1 = {
  id: 't1', busId: 'b1', direction: 'PICKUP', status: 'ACTIVE', destLat: null, destLng: null,
  stops: [
    { id: 'ts1', stopId: 'st1', name: 'Gate 1', lat: 26.8, lng: 75.7, order: 1, status: 'PENDING' },
    { id: 'ts2', stopId: 'st2', name: 'Gate 2', lat: 26.81, lng: 75.71, order: 2, status: 'PENDING' },
  ],
};

// A fresh Location_Service per test (empty cache and throttles), broadcasting
// to the test server's rooms exactly like production.
let locationService;

const tokenFor = (id) => {
  const u = users.find((x) => x.id === id);
  return jwt.sign({ id: u.id, role: u.role }, SECRET);
};

let httpServer;
let io;
let url;
const clients = [];

// Connect a client; resolves on 'connect', rejects with the connect_error.
// `setup(socket)` runs before the connection opens, so listeners attached
// there also see events emitted right on connect.
function connect(auth, setup) {
  return new Promise((resolve, reject) => {
    const socket = ioClient(url, {
      auth,
      transports: ['websocket'],
      reconnection: false,
      forceNew: true,
    });
    clients.push(socket);
    if (setup) setup(socket);
    const timer = setTimeout(() => reject(new Error('connect timeout')), POSITIVE_TIMEOUT_MS);
    socket.once('connect', () => { clearTimeout(timer); resolve(socket); });
    socket.once('connect_error', (err) => { clearTimeout(timer); reject(err); });
  });
}

// Resolves with the first payload of `event` matching `predicate`.
function waitFor(socket, event, predicate = () => true, ms = POSITIVE_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const handler = (payload) => {
      if (!predicate(payload)) return;
      clearTimeout(timer);
      socket.off(event, handler);
      resolve(payload);
    };
    const timer = setTimeout(() => {
      socket.off(event, handler);
      reject(new Error(`timed out waiting for '${event}'`));
    }, ms);
    socket.on(event, handler);
  });
}

// Records every `event` payload for the lifetime of the test.
function record(socket, event) {
  const received = [];
  const handler = (payload) => received.push(payload);
  socket.on(event, handler);
  received.stop = () => socket.off(event, handler);
  return received;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Polls `cond` until true; fails after POSITIVE_TIMEOUT_MS.
async function until(cond) {
  const deadline = Date.now() + POSITIVE_TIMEOUT_MS;
  while (!cond()) {
    if (Date.now() > deadline) throw new Error('timed out waiting for condition');
    await sleep(10);
  }
}

async function serverRoomsOf(clientSocket) {
  const sockets = await io.fetchSockets();
  const s = sockets.find((x) => x.id === clientSocket.id);
  return s ? [...s.rooms].filter((r) => r !== s.id).sort() : null;
}

beforeAll(async () => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  httpServer = http.createServer();
  io = new Server(httpServer);
  createGpsSocket({
    prisma: fakePrisma,
    accessService: createAccessService(fakePrisma),
    sendMulticast,
    getJwtSecret: () => SECRET,
    locationService: () => locationService,
    tripService: fakeTrips,
  })(io);
  await new Promise((resolve) => httpServer.listen(0, '127.0.0.1', resolve));
  url = `http://127.0.0.1:${httpServer.address().port}`;
});

beforeEach(() => {
  activeTrips = {};
  locationService = createLocationService({
    prisma: fakePrisma,
    tripService: fakeTrips,
    emit: createRoomEmitter(io),
  });
});

afterEach(() => {
  while (clients.length) clients.pop().disconnect();
  jest.clearAllMocks();
});

afterAll(async () => {
  while (clients.length) clients.pop().disconnect();
  await new Promise((resolve) => io.close(() => resolve()));
  console.log.mockRestore();
});

describe('handshake authentication (Req 4.1)', () => {
  test('connection without a token is rejected as unauthorized', async () => {
    await expect(connect(undefined)).rejects.toThrow('unauthorized');
  });

  test('connection with a token signed by another secret is rejected', async () => {
    const bad = jwt.sign({ id: 'parent1', role: 'PARENT' }, 'wrong-secret');
    await expect(connect({ token: bad })).rejects.toThrow('unauthorized');
  });

  test('connection with a malformed token is rejected', async () => {
    await expect(connect({ token: 'not-a-jwt' })).rejects.toThrow('unauthorized');
  });
});

describe('server-assigned rooms and broadcast isolation (Req 4.2, 4.3)', () => {
  test('parent is auto-joined only to their children\'s bus rooms', async () => {
    const parent = await connect({ token: tokenFor('parent1') });
    expect(await serverRoomsOf(parent)).toEqual(['bus_b1']);
  });

  test('parent receives location from own bus and never from another bus', async () => {
    const parent = await connect({ token: tokenFor('parent1') });
    const d1 = await connect({ token: tokenFor('driver1') });
    const d2 = await connect({ token: tokenFor('driver2') });
    const received = record(parent, 'locationUpdate');

    d2.emit('sendLocation', { busId: 'b2', lat: 26.1, lng: 75.1, speed: 10 });
    d1.emit('sendLocation', { busId: 'b1', lat: 26.2, lng: 75.2, speed: 10 });

    const own = await waitFor(parent, 'locationUpdate', (p) => p.busId === 'b1');
    expect(own).toEqual({ busId: 'b1', lat: 26.2, lng: 75.2, speed: 10 });

    // Another b2 fix after the b1 fix arrived; it must never reach the parent.
    d2.emit('sendLocation', { busId: 'b2', lat: 26.3, lng: 75.3, speed: 10 });
    await sleep(NEGATIVE_WAIT_MS);
    expect(received.every((p) => p.busId === 'b1')).toBe(true);
    expect(received).toHaveLength(1);
  });

  test('parent joinBus for another bus gets error and still receives nothing', async () => {
    const parent = await connect({ token: tokenFor('parent1') });
    const d2 = await connect({ token: tokenFor('driver2') });

    const err = waitFor(parent, 'error');
    parent.emit('joinBus', { busId: 'b2' });
    expect(await err).toEqual({ code: 'FORBIDDEN', message: 'forbidden' });
    expect(await serverRoomsOf(parent)).toEqual(['bus_b1']);

    const received = record(parent, 'locationUpdate');
    d2.emit('sendLocation', { busId: 'b2', lat: 26.4, lng: 75.4, speed: 10 });
    await sleep(NEGATIVE_WAIT_MS);
    expect(received).toHaveLength(0);
  });

  test('admin receives location from all buses via the admins room', async () => {
    const admin = await connect({ token: tokenFor('admin1') });
    expect(await serverRoomsOf(admin)).toEqual(['admins']);
    const d1 = await connect({ token: tokenFor('driver1') });
    const d2 = await connect({ token: tokenFor('driver2') });

    const fromB1 = waitFor(admin, 'locationUpdate', (p) => p.busId === 'b1');
    const fromB2 = waitFor(admin, 'locationUpdate', (p) => p.busId === 'b2');
    d1.emit('sendLocation', { busId: 'b1', lat: 26.5, lng: 75.5, speed: 10 });
    d2.emit('driver:location', { busId: 'b2', lat: 26.6, lng: 75.6, speed: 10 });

    await expect(fromB1).resolves.toMatchObject({ busId: 'b1', lat: 26.5, lng: 75.5 });
    await expect(fromB2).resolves.toMatchObject({ busId: 'b2', lat: 26.6, lng: 75.6 });
  });
});

describe('only the assigned driver may send bus events (Req 4.4)', () => {
  test('parent spoofed sendLocation is discarded', async () => {
    const parent = await connect({ token: tokenFor('parent1') });
    const admin = await connect({ token: tokenFor('admin1') });
    const parentUpdates = record(parent, 'locationUpdate');
    const adminUpdates = record(admin, 'locationUpdate');

    const err = waitFor(parent, 'error');
    parent.emit('sendLocation', { busId: 'b1', lat: 1, lng: 2, speed: 90 });
    expect(await err).toEqual({ code: 'FORBIDDEN', message: 'forbidden' });

    await sleep(NEGATIVE_WAIT_MS);
    expect(parentUpdates).toHaveLength(0);
    expect(adminUpdates).toHaveLength(0);
    expect(fakePrisma.liveLocation.create).not.toHaveBeenCalled();
    expect(fakePrisma.user.findMany).not.toHaveBeenCalled();
    expect(sendMulticast).not.toHaveBeenCalled();
  });

  test('parent spoofed sos is discarded', async () => {
    const parent = await connect({ token: tokenFor('parent1') });
    const admin = await connect({ token: tokenFor('admin1') });
    const parentAlerts = record(parent, 'sosAlert');
    const adminAlerts = record(admin, 'sosAlert');

    const err = waitFor(parent, 'error');
    parent.emit('sos', { busId: 'b1', driverName: 'Fake', lat: 1, lng: 2 });
    expect(await err).toEqual({ code: 'FORBIDDEN', message: 'forbidden' });

    await sleep(NEGATIVE_WAIT_MS);
    expect(parentAlerts).toHaveLength(0);
    expect(adminAlerts).toHaveLength(0);
    expect(fakePrisma.emergency.create).not.toHaveBeenCalled();
    expect(fakePrisma.$queryRaw).not.toHaveBeenCalled();
    expect(fakePrisma.user.findMany).not.toHaveBeenCalled();
    expect(sendMulticast).not.toHaveBeenCalled();
  });

  test('driver cannot send location for another bus', async () => {
    const d1 = await connect({ token: tokenFor('driver1') });
    const admin = await connect({ token: tokenFor('admin1') });
    const adminUpdates = record(admin, 'locationUpdate');

    const err = waitFor(d1, 'error');
    d1.emit('sendLocation', { busId: 'b2', lat: 1, lng: 2, speed: 10 });
    expect(await err).toEqual({ code: 'FORBIDDEN', message: 'forbidden' });

    await sleep(NEGATIVE_WAIT_MS);
    expect(adminUpdates).toHaveLength(0);
    expect(fakePrisma.liveLocation.create).not.toHaveBeenCalled();
  });

  test('assigned driver location is broadcast and saved for its own bus', async () => {
    const d1 = await connect({ token: tokenFor('driver1') });
    const parent = await connect({ token: tokenFor('parent1') });

    const got = waitFor(parent, 'locationUpdate');
    d1.emit('sendLocation', { busId: 'b1', lat: 26.7, lng: 75.7, speed: 12 });
    await expect(got).resolves.toEqual({ busId: 'b1', lat: 26.7, lng: 75.7, speed: 12 });
    expect(fakePrisma.liveLocation.create).toHaveBeenCalledTimes(1);
    const { data } = fakePrisma.liveLocation.create.mock.calls[0][0];
    expect(data).toMatchObject({ busId: 'b1', lat: 26.7, lng: 75.7 });
    expect(data.speed).toBeCloseTo(12); // LiveLocation keeps km/h
    expect(data.timestamp).toBeInstanceOf(Date);
  });
});

// Task 14.5: a CONDUCTOR watches its own bus but never drives it.
describe('conductor sockets (Req 3.9, 3.10, 4.2, 4.4)', () => {
  test('conductor is auto-joined only to its assigned bus room', async () => {
    const conductor = await connect({ token: tokenFor('conductor1') });
    expect(await serverRoomsOf(conductor)).toEqual(['bus_b1']);
  });

  test('conductor with no bus assigned joins no room', async () => {
    const conductor = await connect({ token: tokenFor('conductor2') });
    expect(await serverRoomsOf(conductor)).toEqual([]);
  });

  test('conductor receives its bus location and never another bus', async () => {
    const conductor = await connect({ token: tokenFor('conductor1') });
    const d1 = await connect({ token: tokenFor('driver1') });
    const d2 = await connect({ token: tokenFor('driver2') });
    const received = record(conductor, 'locationUpdate');

    d2.emit('sendLocation', { busId: 'b2', lat: 26.1, lng: 75.1, speed: 10 });
    d1.emit('sendLocation', { busId: 'b1', lat: 26.2, lng: 75.2, speed: 10 });

    const own = await waitFor(conductor, 'locationUpdate', (p) => p.busId === 'b1');
    expect(own).toEqual({ busId: 'b1', lat: 26.2, lng: 75.2, speed: 10 });

    d2.emit('driver:location', { busId: 'b2', lat: 26.3, lng: 75.3, speed: 10 });
    await sleep(NEGATIVE_WAIT_MS);
    expect(received).toHaveLength(1);
    expect(received.every((p) => p.busId === 'b1')).toBe(true);
  });

  test('joinBus for its own bus is allowed', async () => {
    const conductor = await connect({ token: tokenFor('conductor1') });
    const errors = record(conductor, 'error');

    conductor.emit('joinBus', { busId: 'b1' });
    await sleep(NEGATIVE_WAIT_MS);
    expect(errors).toHaveLength(0);
    expect(await serverRoomsOf(conductor)).toEqual(['bus_b1']);
  });

  test.each([
    ['joinBus', { busId: 'b2' }],
    ['joinAsDriver', { busId: 'b1' }],
    ['joinAsAdmin', undefined],
    ['joinAdmin', undefined],
  ])('%s is refused with FORBIDDEN and joins nothing', async (event, payload) => {
    const conductor = await connect({ token: tokenFor('conductor1') });

    const err = waitFor(conductor, 'error');
    conductor.emit(event, payload);
    expect(await err).toEqual({ code: 'FORBIDDEN', message: 'forbidden' });
    expect(await serverRoomsOf(conductor)).toEqual(['bus_b1']);
  });

  const BROADCASTS = ['locationUpdate', 'tripStarted', 'tripEnded', 'sosAlert'];

  test.each([
    ['sendLocation', { busId: 'b1', lat: 26.9, lng: 75.8, speed: 80 }],
    ['driver:location', { busId: 'b1', lat: 26.9, lng: 75.8, speed: 80 }],
    ['startTrip', { busId: 'b1' }],
    ['endTrip', { busId: 'b1' }],
    ['sos', { busId: 'b1', driverName: 'Sunil', lat: 26.9, lng: 75.8 }],
    // An omitted busId must not fall back to the conductor's bus either.
    ['sendLocation', { lat: 26.9, lng: 75.8, speed: 10 }],
    ['sos', {}],
  ])('%s %j from a conductor is refused with no side effects', async (event, payload) => {
    const conductor = await connect({ token: tokenFor('conductor1') });
    const parent = await connect({ token: tokenFor('parent1') });
    const admin = await connect({ token: tokenFor('admin1') });
    const seen = [conductor, parent, admin].flatMap((s) => BROADCASTS.map((e) => record(s, e)));
    jest.clearAllMocks(); // ignore the handshake's access lookups

    const err = waitFor(conductor, 'error');
    conductor.emit(event, payload);
    expect(await err).toEqual({ code: 'FORBIDDEN', message: 'forbidden' });

    await sleep(NEGATIVE_WAIT_MS);
    expect(seen.every((list) => list.length === 0)).toBe(true);
    expect(fakePrisma.liveLocation.create).not.toHaveBeenCalled();
    expect(fakePrisma.bus.update).not.toHaveBeenCalled();
    expect(fakePrisma.emergency.create).not.toHaveBeenCalled();
    expect(fakePrisma.$queryRaw).not.toHaveBeenCalled();
    expect(fakePrisma.user.findMany).not.toHaveBeenCalled();
    expect(sendMulticast).not.toHaveBeenCalled();
  });
});

// Task 6.2: every driver fix goes through Location_Service.ingest, which
// broadcasts bus:location + legacy locationUpdate to the bus room and admins.
describe('location intake through Location_Service (Req 7.9)', () => {
  test('driver:location is ingested and broadcast as bus:location and locationUpdate to both rooms', async () => {
    activeTrips = { b1: ACTIVE_B1 };
    const ingest = jest.spyOn(locationService, 'ingest');
    const parent = await connect({ token: tokenFor('parent1') });
    const admin = await connect({ token: tokenFor('admin1') });
    const d1 = await connect({ token: tokenFor('driver1') });

    const recordedAt = new Date(Date.now() - 1000).toISOString();
    const waits = [parent, admin].flatMap((s) => [waitFor(s, 'bus:location'), waitFor(s, 'locationUpdate')]);
    d1.emit('driver:location', { lat: 26.8, lng: 75.7, speed: 5, heading: 90, accuracy: 8, recordedAt });
    const [pBus, pLegacy, aBus, aLegacy] = await Promise.all(waits);

    const expected = {
      busId: 'b1', tripId: 't1', lat: 26.8, lng: 75.7, speed: 5, heading: 90, accuracy: 8, recordedAt,
    };
    expect(pBus).toEqual(expected);
    expect(aBus).toEqual(expected);
    expect(pLegacy).toEqual({ busId: 'b1', lat: 26.8, lng: 75.7, speed: 18 }); // km/h
    expect(aLegacy).toEqual(pLegacy);

    expect(ingest).toHaveBeenCalledTimes(1);
    expect(ingest).toHaveBeenCalledWith('b1', expect.objectContaining({ lat: 26.8, lng: 75.7, speed: 5, recordedAt }));
    expect(locationService.getLatest('b1')).toMatchObject({ lat: 26.8, lng: 75.7, speed: 5 });
  });

  test('legacy sendLocation (km/h, no recordedAt) is ingested with server time and m/s speed', async () => {
    const ingest = jest.spyOn(locationService, 'ingest');
    const d1 = await connect({ token: tokenFor('driver1') });
    const before = Date.now();

    const got = waitFor(d1, 'bus:location');
    d1.emit('sendLocation', { busId: 'b1', lat: 26.9, lng: 75.8, speed: 36, heading: 10 });
    const payload = await got;

    expect(ingest).toHaveBeenCalledTimes(1);
    const [busId, fix] = ingest.mock.calls[0];
    expect(busId).toBe('b1');
    expect(fix.speed).toBeCloseTo(10);
    expect(fix.recordedAt).toBeGreaterThanOrEqual(before);
    expect(payload).toMatchObject({ busId: 'b1', tripId: null, lat: 26.9, lng: 75.8, heading: 10 });
    expect(payload.speed).toBeCloseTo(10);
  });

  test('a dropped fix is not broadcast or saved', async () => {
    const parent = await connect({ token: tokenFor('parent1') });
    const d1 = await connect({ token: tokenFor('driver1') });
    const seen = ['bus:location', 'locationUpdate'].map((e) => record(parent, e));

    d1.emit('driver:location', { lat: 26.8, lng: 75.7, accuracy: 500, recordedAt: new Date().toISOString() });
    await sleep(NEGATIVE_WAIT_MS);

    expect(seen.every((list) => list.length === 0)).toBe(true);
    expect(fakePrisma.liveLocation.create).not.toHaveBeenCalled();
    expect(locationService.getDrops('b1')).toEqual({ low_accuracy: 1 });
    expect(locationService.getLatest('b1')).toBeNull();
  });
});

// Task 6.2: a connecting (or reconnecting) socket gets trip:state for each
// bus room it joined.
describe('trip:state on connect and reconnect (Req 8.4)', () => {
  test('parent gets the active trip state of its bus on connect', async () => {
    activeTrips = { b1: ACTIVE_B1 };
    let states;
    await connect({ token: tokenFor('parent1') }, (s) => { states = record(s, 'trip:state'); });
    await until(() => states.length > 0);

    expect(states).toHaveLength(1);
    expect(states[0]).toEqual(tripState('b1', ACTIVE_B1));
    expect(states[0].currentStop).toMatchObject({ id: 'ts1' });
  });

  test('a bus with no active trip gets a null trip state', async () => {
    let first;
    await connect({ token: tokenFor('driver2') }, (s) => { first = waitFor(s, 'trip:state'); });
    await expect(first).resolves.toEqual({
      busId: 'b2', trip: null, currentStop: null, destination: null, safetyChecks: [],
    });
  });

  test('admin (no bus room) gets no trip:state on connect, but does after joinBus', async () => {
    activeTrips = { b1: ACTIVE_B1 };
    let states;
    const admin = await connect({ token: tokenFor('admin1') }, (s) => { states = record(s, 'trip:state'); });
    await sleep(NEGATIVE_WAIT_MS);
    expect(states).toHaveLength(0);

    const joined = waitFor(admin, 'trip:state');
    admin.emit('joinBus', { busId: 'b1' });
    await expect(joined).resolves.toEqual(tripState('b1', ACTIVE_B1));
  });

  test('reconnect delivers the fresh trip state again', async () => {
    activeTrips = { b1: ACTIVE_B1 };
    let states;
    const parent = await connect({ token: tokenFor('parent1') }, (s) => { states = record(s, 'trip:state'); });
    await until(() => states.length > 0);

    // The first stop is completed while the parent is offline.
    const progressed = {
      ...ACTIVE_B1,
      stops: [{ ...ACTIVE_B1.stops[0], status: 'COMPLETED' }, ACTIVE_B1.stops[1]],
    };
    activeTrips = { b1: progressed };
    parent.disconnect();
    const reconnected = new Promise((resolve) => parent.once('connect', resolve));
    parent.connect();
    await reconnected;
    await until(() => states.length >= 2);

    expect(states).toHaveLength(2);
    expect(states[1]).toEqual(tripState('b1', progressed));
    expect(states[1].currentStop).toMatchObject({ id: 'ts2' });
  });

  // Scenario 10 (task 6.6): a socket in several bus rooms gets one trip:state
  // per joined room on connect and again, fresh, on reconnect.
  test('reconnect delivers one fresh trip:state per joined bus room', async () => {
    activeTrips = { b1: ACTIVE_B1 };
    let states;
    const parent = await connect({ token: tokenFor('parent2') }, (s) => { states = record(s, 'trip:state'); });
    expect(await serverRoomsOf(parent)).toEqual(['bus_b1', 'bus_b2']);
    await until(() => states.length >= 2);
    const byBus = (list) => Object.fromEntries(list.map((s) => [s.busId, s]));
    expect(byBus(states)).toEqual({
      b1: tripState('b1', ACTIVE_B1),
      b2: { busId: 'b2', trip: null, currentStop: null, destination: null, safetyChecks: [] },
    });

    // While offline, b1 progresses and b2 starts a trip.
    const progressed = { ...ACTIVE_B1, stops: [{ ...ACTIVE_B1.stops[0], status: 'COMPLETED' }, ACTIVE_B1.stops[1]] };
    const activeB2 = { ...ACTIVE_B1, id: 't2', busId: 'b2', direction: 'DROP' };
    activeTrips = { b1: progressed, b2: activeB2 };
    parent.disconnect();
    const reconnected = new Promise((resolve) => parent.once('connect', resolve));
    parent.connect();
    await reconnected;
    await until(() => states.length >= 4);
    await sleep(NEGATIVE_WAIT_MS);

    expect(states).toHaveLength(4);
    expect(byBus(states.slice(2))).toEqual({ b1: tripState('b1', progressed), b2: tripState('b2', activeB2) });
    expect(await serverRoomsOf(parent)).toEqual(['bus_b1', 'bus_b2']);
  });

  test('a driver reconnecting mid-trip gets its bus trip:state again', async () => {
    activeTrips = { b1: ACTIVE_B1 };
    let states;
    const d1 = await connect({ token: tokenFor('driver1') }, (s) => { states = record(s, 'trip:state'); });
    await until(() => states.length > 0);

    d1.disconnect();
    const reconnected = new Promise((resolve) => d1.once('connect', resolve));
    d1.connect();
    await reconnected;
    await until(() => states.length >= 2);

    expect([...states]).toEqual([tripState('b1', ACTIVE_B1), tripState('b1', ACTIVE_B1)]);
    expect(await serverRoomsOf(d1)).toEqual(['bus_b1']);
  });
});

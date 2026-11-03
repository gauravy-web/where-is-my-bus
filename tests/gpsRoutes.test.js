// GPS device HTTP API: admin-only management, device credentials, activation
// rules, unlink safety, and trip independence. Prisma is a small in-memory
// fake; no database.
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/testdb';
process.env.JWT_SECRET = 'test-jwt-secret';

jest.mock('../src/db', () => {
  let seq = 0;
  const tables = { buses: [], devices: [] };
  const clone = (x) => (x ? { ...x } : null);
  const find = (rows, where = {}) => rows.find((r) => Object.entries(where).every(([k, v]) => r[k] === v));
  const bus = {
    findUnique: jest.fn(async ({ where }) => clone(find(tables.buses, where))),
    findMany: jest.fn(async () => tables.buses.map(clone)),
    update: jest.fn(async ({ where, data }) => {
      const r = find(tables.buses, where);
      Object.assign(r, data);
      return clone(r);
    }),
  };
  const gpsDevice = {
    findUnique: jest.fn(async ({ where }) => clone(find(tables.devices, where))),
    findMany: jest.fn(async () => tables.devices.map(clone)),
    create: jest.fn(async ({ data }) => {
      seq += 1;
      const row = {
        id: `d${seq}`, name: null, busId: null, revokedAt: null, verifiedAt: null, validFixCount: 0,
        lastSeenAt: null, lastFixAt: null, credentialIssuedAt: new Date(), createdAt: new Date(), ...data,
      };
      tables.devices.push(row);
      return clone(row);
    }),
    update: jest.fn(async ({ where, data }) => {
      const r = find(tables.devices, where);
      Object.assign(r, data);
      return clone(r);
    }),
    delete: jest.fn(async ({ where }) => {
      const i = tables.devices.findIndex((r) => r.id === where.id);
      const [row] = tables.devices.splice(i, 1);
      return clone(row);
    }),
  };
  const client = { bus, gpsDevice, $transaction: async (ops) => Promise.all(ops), $disconnect: jest.fn() };
  client.__tables = tables;
  return client;
});

const request = require('supertest');
const jwt = require('jsonwebtoken');
const prisma = require('../src/db');
const app = require('../src/app');
const locationService = require('../src/services/locationService');
const tripService = require('../src/services/tripService');
const locationSource = require('../src/services/locationSourceService');

const sign = (payload) => `Bearer ${jwt.sign(payload, 'test-jwt-secret')}`;
const ADMIN = sign({ id: 'a1', role: 'ADMIN' });
const PARENT = sign({ id: 'p1', role: 'PARENT' });
const DRIVER = sign({ id: 'dr1', role: 'DRIVER' });

let ingestSpy;
let startSpy;
let endSpy;
let ctr = 0;
let sec = 0;
const nextFix = () => {
  ctr += 1;
  return { lat: 12 + ctr * 0.00001, lng: 77 + ctr * 0.00001, speed: 4, recordedAt: new Date(Date.now() - 5000 + ctr * 100).toISOString() };
};
const postFix = (deviceId, secret, body = nextFix()) => {
  const r = request(app).post('/api/gps/ingest').send(body);
  if (deviceId) r.set('X-Device-Id', deviceId);
  if (secret) r.set('Authorization', `Bearer ${secret}`);
  return r;
};

async function registerDevice(busId = 'bus1') {
  sec += 1;
  const res = await request(app).post('/api/gps/devices').set('Authorization', ADMIN)
    .send({ busId, deviceId: `tracker-${sec}-${Date.now()}`, name: 'Front' });
  return res;
}

beforeEach(() => {
  prisma.__tables.buses.splice(0, prisma.__tables.buses.length,
    { id: 'bus1', busNo: '101', driverName: 'D', locationMode: 'MOBILE_PRIMARY', activeSource: 'MOBILE', sourceChangedAt: null },
    { id: 'bus2', busNo: '102', driverName: 'E', locationMode: 'MOBILE_PRIMARY', activeSource: 'MOBILE', sourceChangedAt: null });
  prisma.__tables.devices.splice(0);
  locationSource.reset();
  ingestSpy = jest.spyOn(locationService, 'ingest').mockResolvedValue({ accepted: true, broadcast: true });
  startSpy = jest.spyOn(tripService, 'startTrip');
  endSpy = jest.spyOn(tripService, 'endTrip');
});
afterEach(() => jest.restoreAllMocks());

async function verify(deviceId, secret, count = 3) {
  for (let i = 0; i < count; i += 1) {
    const r = await postFix(deviceId, secret);
    expect(r.status).toBe(200);
    expect(r.body.accepted).toBe(true);
  }
}

describe('authorization', () => {
  test.each([
    ['get', '/api/gps/overview'],
    ['post', '/api/gps/devices'],
    ['post', '/api/gps/devices/x/activate'],
    ['delete', '/api/gps/devices/x'],
  ])('%s %s requires a token', async (method, url) => {
    expect((await request(app)[method](url)).status).toBe(401);
  });

  test.each([['PARENT', PARENT], ['DRIVER', DRIVER]])('%s cannot manage devices', async (_n, token) => {
    expect((await request(app).get('/api/gps/overview').set('Authorization', token)).status).toBe(403);
    expect((await request(app).post('/api/gps/devices').set('Authorization', token).send({ busId: 'bus1' })).status).toBe(403);
  });
});

describe('registration', () => {
  test('returns the secret once and never exposes the hash', async () => {
    const res = await registerDevice();
    expect(res.status).toBe(201);
    expect(res.body.secret).toMatch(/^gps_/);
    expect(JSON.stringify(res.body)).not.toMatch(/credentialHash/);
    expect(prisma.__tables.devices[0].credentialHash).not.toContain(res.body.secret);

    const ov = await request(app).get('/api/gps/overview').set('Authorization', ADMIN);
    expect(ov.status).toBe(200);
    expect(JSON.stringify(ov.body)).not.toMatch(/credentialHash|gps_/);
    expect(ov.body.summary).toMatchObject({ totalBuses: 2, devicesInstalled: 1, devicesNotInstalled: 1 });
    const row = ov.body.buses.find((b) => b.busId === 'bus1');
    expect(row).toMatchObject({ busNo: '101', activeSource: 'MOBILE', locationMode: 'MOBILE_PRIMARY' });
    expect(row.device.connection).toBe('NEVER_SEEN');
  });

  test('rejects a second device for the same bus, unknown bus, and bad ids', async () => {
    await registerDevice('bus1');
    expect((await registerDevice('bus1')).status).toBe(409);
    expect((await registerDevice('nope')).status).toBe(404);
    const bad = await request(app).post('/api/gps/devices').set('Authorization', ADMIN).send({ busId: 'bus2', deviceId: 'a b' });
    expect(bad.status).toBe(400);
  });
});

describe('device credentials', () => {
  test('missing, wrong, unknown and revoked credentials all get the same 401', async () => {
    const { body } = await registerDevice();
    const id = body.device.deviceId;
    const bodies = [];
    for (const [d, s] of [[null, null], [id, 'gps_wrong'], ['ghost-device', body.secret]]) {
      const r = await postFix(d, s);
      expect(r.status).toBe(401);
      bodies.push(r.body);
    }
    await request(app).post(`/api/gps/devices/${body.device.id}/revoke`).set('Authorization', ADMIN);
    const revoked = await postFix(id, body.secret);
    expect(revoked.status).toBe(401);
    bodies.push(revoked.body);
    expect(new Set(bodies.map((b) => JSON.stringify(b))).size).toBe(1);
  });

  test('rotate-credential invalidates the old secret and restores access', async () => {
    const { body } = await registerDevice();
    const id = body.device.deviceId;
    await request(app).post(`/api/gps/devices/${body.device.id}/revoke`).set('Authorization', ADMIN);
    const rot = await request(app).post(`/api/gps/devices/${body.device.id}/rotate-credential`).set('Authorization', ADMIN);
    expect(rot.status).toBe(200);
    expect(rot.body.secret).not.toBe(body.secret);
    expect((await postFix(id, body.secret)).status).toBe(401);
    expect((await postFix(id, rot.body.secret)).status).toBe(200);
  });

  test('a device cannot report for another bus', async () => {
    const { body } = await registerDevice('bus1');
    const r = await postFix(body.device.deviceId, body.secret, { ...nextFix(), busId: 'bus2' });
    expect(r.status).toBe(403);
    expect(ingestSpy).not.toHaveBeenCalled();
  });

  test('blocks repeated failures with 429', async () => {
    let last;
    for (let i = 0; i < 12; i += 1) last = await postFix('brute-force-target', 'gps_nope');
    expect(last.status).toBe(429);
  });
});

describe('fix validation', () => {
  test('malformed coordinates are 400, stale fixes are soft rejections', async () => {
    const { body } = await registerDevice();
    const bad = await postFix(body.device.deviceId, body.secret, { lat: 120, lng: 5, recordedAt: Date.now() });
    expect(bad.status).toBe(400);
    expect(bad.body.reason).toBe('invalid_coordinates');
    const noTs = await postFix(body.device.deviceId, body.secret, { lat: 1, lng: 5 });
    expect(noTs.status).toBe(400);
    const stale = await postFix(body.device.deviceId, body.secret, { lat: 1, lng: 5, recordedAt: Date.now() - 3600 * 1000 });
    expect(stale.status).toBe(200);
    expect(stale.body).toMatchObject({ accepted: false, reason: 'stale' });
  });
});

describe('activation and source switching', () => {
  test('cannot activate before the device is verified and online', async () => {
    const { body } = await registerDevice();
    const early = await request(app).post(`/api/gps/devices/${body.device.id}/activate`).set('Authorization', ADMIN);
    expect(early.status).toBe(409);
    expect(early.body.code).toBe('not_verified');
    await postFix(body.device.deviceId, body.secret);
    const still = await request(app).post(`/api/gps/devices/${body.device.id}/activate`).set('Authorization', ADMIN);
    expect(still.status).toBe(409);
    expect(prisma.__tables.buses[0].locationMode).toBe('MOBILE_PRIMARY');
  });

  test('registered device fixes are not forwarded until it is activated', async () => {
    const { body } = await registerDevice();
    await verify(body.device.deviceId, body.secret);
    expect(ingestSpy).not.toHaveBeenCalled();

    const test = await request(app).post(`/api/gps/devices/${body.device.id}/test`).set('Authorization', ADMIN);
    expect(test.body).toMatchObject({ connection: 'ONLINE', verified: true, canActivate: true });

    const act = await request(app).post(`/api/gps/devices/${body.device.id}/activate`).set('Authorization', ADMIN);
    expect(act.status).toBe(200);
    expect(act.body).toMatchObject({ locationMode: 'DEVICE_PRIMARY', locationSource: 'DEVICE' });
    expect(prisma.__tables.buses[0]).toMatchObject({ locationMode: 'DEVICE_PRIMARY', activeSource: 'DEVICE' });

    const r = await postFix(body.device.deviceId, body.secret);
    expect(r.body).toMatchObject({ accepted: true, used: true, activeSource: 'DEVICE' });
    expect(ingestSpy).toHaveBeenCalledTimes(1);

    // Phone fix is now a backup only.
    ingestSpy.mockClear();
    const m = await locationSource.ingestMobile('bus1', { ...nextFix(), recordedAt: Date.now() });
    expect(m.backup).toBe(true);
    expect(ingestSpy).not.toHaveBeenCalled();

    const dea = await request(app).post(`/api/gps/devices/${body.device.id}/deactivate`).set('Authorization', ADMIN);
    expect(dea.status).toBe(200);
    expect(prisma.__tables.buses[0]).toMatchObject({ locationMode: 'MOBILE_PRIMARY', activeSource: 'MOBILE' });
  });

  test('device ingest never starts or ends a trip and never changes Bus.status', async () => {
    const { body } = await registerDevice();
    await verify(body.device.deviceId, body.secret);
    await request(app).post(`/api/gps/devices/${body.device.id}/activate`).set('Authorization', ADMIN);
    await postFix(body.device.deviceId, body.secret);
    expect(startSpy).not.toHaveBeenCalled();
    expect(endSpy).not.toHaveBeenCalled();
    for (const [arg] of prisma.bus.update.mock.calls) expect(arg.data).not.toHaveProperty('status');
  });
});

describe('unlink', () => {
  test('refuses while primary, succeeds with deactivate=true and restores mobile', async () => {
    const { body } = await registerDevice();
    await verify(body.device.deviceId, body.secret);
    await request(app).post(`/api/gps/devices/${body.device.id}/activate`).set('Authorization', ADMIN);

    const refused = await request(app).delete(`/api/gps/devices/${body.device.id}`).set('Authorization', ADMIN);
    expect(refused.status).toBe(409);
    expect(refused.body.code).toBe('device_is_primary');
    expect(prisma.__tables.devices).toHaveLength(1);

    const ok = await request(app).delete(`/api/gps/devices/${body.device.id}?deactivate=true`).set('Authorization', ADMIN);
    expect(ok.status).toBe(200);
    expect(prisma.__tables.devices).toHaveLength(0);
    expect(prisma.__tables.buses[0]).toMatchObject({ locationMode: 'MOBILE_PRIMARY', activeSource: 'MOBILE' });
    expect((await postFix(body.device.deviceId, body.secret)).status).toBe(401);
  });

  test('unlinking a non-primary device is allowed directly; unknown id is 404', async () => {
    const { body } = await registerDevice();
    expect((await request(app).delete(`/api/gps/devices/${body.device.id}`).set('Authorization', ADMIN)).status).toBe(200);
    expect((await request(app).delete('/api/gps/devices/missing').set('Authorization', ADMIN)).status).toBe(404);
  });
});

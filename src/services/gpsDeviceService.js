// GPS device registry: credentials, assignment, verification, activation.
// Registration and activation are deliberately separate. A device can only be
// activated (made the bus's primary source) after it has sent enough valid
// fixes (verified) and is currently online.
//
// Secrets are random opaque strings. Only their SHA-256 hash is stored, the
// plain secret is returned once on create/rotate, and public views never
// include credentialHash.

const crypto = require('crypto');

class GpsDeviceError extends Error {
  constructor(status, code, message) {
    super(message || code);
    this.name = 'GpsDeviceError';
    this.status = status;
    this.code = code;
  }
}

const DEVICE_ID_RE = /^[A-Za-z0-9][A-Za-z0-9_.:-]{2,63}$/;
const AUTH_CACHE_MS = 10000;
const FAIL_WINDOW_MS = 60000;
const FAIL_LIMIT = 10;

const generateSecret = () => `gps_${crypto.randomBytes(24).toString('base64url')}`;
const hashSecret = (secret) => crypto.createHash('sha256').update(String(secret)).digest('hex');

function safeEqualHex(a, b) {
  const ba = Buffer.from(String(a), 'utf8');
  const bb = Buffer.from(String(b), 'utf8');
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

const iso = (d) => (d ? new Date(d).toISOString() : null);

// Never includes credentialHash.
function publicDevice(d) {
  if (!d) return null;
  return {
    id: d.id,
    deviceId: d.deviceId,
    name: d.name || null,
    busId: d.busId || null,
    revoked: !!d.revokedAt,
    revokedAt: iso(d.revokedAt),
    verified: !!d.verifiedAt,
    verifiedAt: iso(d.verifiedAt),
    validFixCount: d.validFixCount || 0,
    lastSeenAt: iso(d.lastSeenAt),
    lastFixAt: iso(d.lastFixAt),
    credentialIssuedAt: iso(d.credentialIssuedAt),
    createdAt: iso(d.createdAt),
  };
}

function createGpsDeviceService({
  prisma,
  source,
  locationService,
  now = () => Date.now(),
} = {}) {
  const db = () => (typeof prisma === 'function' ? prisma() : prisma);
  const src = () => (typeof source === 'function' ? source() : source);
  const loc = () => (typeof locationService === 'function' ? locationService() : locationService);

  const authCache = new Map(); // deviceId -> { row, at }
  const failures = new Map(); // key -> { count, since }

  const dropAuth = (deviceId) => authCache.delete(deviceId);

  function checkRate(key) {
    const f = failures.get(key);
    if (f && now() - f.since > FAIL_WINDOW_MS) failures.delete(key);
    const cur = failures.get(key);
    if (cur && cur.count >= FAIL_LIMIT) {
      throw new GpsDeviceError(429, 'rate_limited', 'Too many failed attempts. Try again later.');
    }
  }
  function noteFailure(key) {
    const f = failures.get(key);
    if (!f) failures.set(key, { count: 1, since: now() });
    else f.count += 1;
  }

  // Throws GpsDeviceError. Unknown device, wrong secret and revoked device all
  // produce the same 401 so callers cannot probe which device ids exist.
  async function authenticate(deviceId, secret, ip = '') {
    const key = `${ip}|${String(deviceId || '').slice(0, 64)}`;
    checkRate(key);
    const fail = () => {
      noteFailure(key);
      return new GpsDeviceError(401, 'unauthorized', 'Invalid device credentials');
    };
    if (typeof deviceId !== 'string' || !deviceId || typeof secret !== 'string' || !secret) throw fail();

    let row;
    const cached = authCache.get(deviceId);
    if (cached && now() - cached.at < AUTH_CACHE_MS) {
      row = cached.row;
    } else {
      row = await db().gpsDevice.findUnique({ where: { deviceId } });
      authCache.set(deviceId, { row: row || null, at: now() });
    }
    // Always compare, even for unknown devices, to keep timing uniform.
    const expected = row ? row.credentialHash : hashSecret('dummy-credential');
    const ok = safeEqualHex(hashSecret(secret), expected);
    if (!row || !ok || row.revokedAt) throw fail();

    failures.delete(key);
    if (!row.busId) {
      throw new GpsDeviceError(403, 'unassigned', 'Device is not assigned to a bus');
    }
    return { deviceId: row.deviceId, busId: row.busId };
  }

  async function getDeviceOr404(id) {
    const d = await db().gpsDevice.findUnique({ where: { id: String(id) } });
    if (!d) throw new GpsDeviceError(404, 'not_found', 'Device not found');
    return d;
  }

  async function registerDevice({ busId, deviceId, name } = {}) {
    if (!busId || typeof busId !== 'string') throw new GpsDeviceError(400, 'bus_required', 'busId is required');
    const bus = await db().bus.findUnique({ where: { id: busId }, select: { id: true } });
    if (!bus) throw new GpsDeviceError(404, 'bus_not_found', 'Bus not found');
    const existingForBus = await db().gpsDevice.findUnique({ where: { busId } });
    if (existingForBus) throw new GpsDeviceError(409, 'bus_has_device', 'This bus already has a GPS device');

    let id = deviceId;
    if (id === undefined || id === null || id === '') {
      id = `gps-${crypto.randomBytes(5).toString('hex')}`;
    } else if (typeof id !== 'string' || !DEVICE_ID_RE.test(id)) {
      throw new GpsDeviceError(400, 'invalid_device_id', 'deviceId must be 3-64 characters: letters, digits, . _ : -');
    }
    const dup = await db().gpsDevice.findUnique({ where: { deviceId: id } });
    if (dup) throw new GpsDeviceError(409, 'device_exists', 'A device with this id already exists');

    const cleanName = typeof name === 'string' && name.trim() ? name.trim().slice(0, 80) : null;
    const secret = generateSecret();
    let created;
    try {
      created = await db().gpsDevice.create({
        data: { deviceId: id, name: cleanName, busId, credentialHash: hashSecret(secret) },
      });
    } catch (err) {
      if (err && err.code === 'P2002') throw new GpsDeviceError(409, 'conflict', 'Device or bus is already registered');
      throw err;
    }
    dropAuth(id);
    src().invalidate(busId);
    return { device: publicDevice(created), secret };
  }

  async function rotateCredential(id) {
    const d = await getDeviceOr404(id);
    const secret = generateSecret();
    const updated = await db().gpsDevice.update({
      where: { id: d.id },
      data: { credentialHash: hashSecret(secret), credentialIssuedAt: new Date(now()), revokedAt: null },
    });
    dropAuth(d.deviceId);
    if (d.busId) src().invalidate(d.busId);
    return { device: publicDevice(updated), secret };
  }

  // Sets the bus back to mobile when the device was its primary source.
  async function fallbackToMobile(d) {
    if (!d.busId) return;
    await db().bus.update({
      where: { id: d.busId },
      data: { locationMode: 'MOBILE_PRIMARY', activeSource: 'MOBILE', sourceChangedAt: new Date(now()) },
    });
    src().applyAdminChange(d.busId, { mode: 'MOBILE_PRIMARY', deviceId: d.deviceId });
  }

  async function revoke(id) {
    const d = await getDeviceOr404(id);
    const updated = await db().gpsDevice.update({ where: { id: d.id }, data: { revokedAt: new Date(now()) } });
    dropAuth(d.deviceId);
    if (d.busId) {
      const bus = await db().bus.findUnique({ where: { id: d.busId }, select: { locationMode: true } });
      if (bus && bus.locationMode === 'DEVICE_PRIMARY') await fallbackToMobile(d);
      else src().invalidate(d.busId);
    }
    return { device: publicDevice(updated) };
  }

  async function readiness(d) {
    const tel = d.busId ? src().telemetry(d.busId) : null;
    const verifiedAt = (tel && tel.verifiedAt) || d.verifiedAt;
    const connection = d.busId ? src().deviceConnection(d.busId, d.lastFixAt) : 'NEVER_SEEN';
    return { verified: !!verifiedAt, connection };
  }

  async function test(id) {
    const d = await getDeviceOr404(id);
    const { verified, connection } = await readiness(d);
    const tel = d.busId ? src().telemetry(d.busId) : null;
    const lastFixMs = (tel && tel.deviceSeenAt) || (d.lastFixAt ? new Date(d.lastFixAt).getTime() : null);
    let message;
    if (d.revokedAt) message = 'Credential is revoked. Rotate it to reconnect the device.';
    else if (connection === 'NEVER_SEEN') message = 'No valid GPS update received yet.';
    else if (connection === 'OFFLINE') message = 'Device has stopped sending valid GPS updates.';
    else if (!verified) message = 'Device is online but not verified yet. Wait for more valid updates.';
    else message = 'Device is online and verified. It can be activated.';
    return {
      deviceId: d.deviceId,
      connection,
      verified,
      canActivate: !d.revokedAt && !!d.busId && verified && connection === 'ONLINE',
      lastFixAt: lastFixMs ? new Date(lastFixMs).toISOString() : null,
      ageSeconds: lastFixMs ? Math.max(0, Math.round((now() - lastFixMs) / 1000)) : null,
      message,
    };
  }

  async function activate(id) {
    const d = await getDeviceOr404(id);
    if (d.revokedAt) throw new GpsDeviceError(409, 'revoked', 'Device credential is revoked');
    if (!d.busId) throw new GpsDeviceError(409, 'unassigned', 'Device is not assigned to a bus');
    const { verified, connection } = await readiness(d);
    if (!verified) throw new GpsDeviceError(409, 'not_verified', 'Device has not sent enough valid GPS updates yet');
    if (connection !== 'ONLINE') throw new GpsDeviceError(409, 'not_online', 'Device is not currently sending valid GPS updates');
    const t = new Date(now());
    await db().bus.update({
      where: { id: d.busId },
      data: { locationMode: 'DEVICE_PRIMARY', activeSource: 'DEVICE', sourceChangedAt: t },
    });
    if (!d.verifiedAt) {
      await db().gpsDevice.update({ where: { id: d.id }, data: { verifiedAt: t } }).catch(() => {});
    }
    const state = src().applyAdminChange(d.busId, { mode: 'DEVICE_PRIMARY', deviceId: d.deviceId, deviceLive: true });
    return { busId: d.busId, ...state };
  }

  async function deactivate(id) {
    const d = await getDeviceOr404(id);
    if (!d.busId) throw new GpsDeviceError(409, 'unassigned', 'Device is not assigned to a bus');
    await fallbackToMobile(d);
    return { busId: d.busId, locationMode: 'MOBILE_PRIMARY', locationSource: 'MOBILE', locationStatus: undefined };
  }

  // Removes the device row. Refuses while the device is the bus's primary
  // source unless deactivate=true, in which case the bus is switched back to
  // the driver's phone in the same transaction.
  async function unlink(id, { deactivate: deact = false } = {}) {
    const d = await getDeviceOr404(id);
    if (d.busId) {
      const bus = await db().bus.findUnique({ where: { id: d.busId }, select: { locationMode: true } });
      const primary = bus && bus.locationMode === 'DEVICE_PRIMARY';
      if (primary && !deact) {
        throw new GpsDeviceError(409, 'device_is_primary', 'Device is the primary location source. Deactivate it first.');
      }
      await db().$transaction([
        db().bus.update({
          where: { id: d.busId },
          data: { locationMode: 'MOBILE_PRIMARY', activeSource: 'MOBILE', sourceChangedAt: new Date(now()) },
        }),
        db().gpsDevice.delete({ where: { id: d.id } }),
      ]);
      src().applyAdminChange(d.busId, { mode: 'MOBILE_PRIMARY', deviceId: null });
      src().forgetBus(d.busId);
    } else {
      await db().gpsDevice.delete({ where: { id: d.id } });
    }
    dropAuth(d.deviceId);
    return { removed: true, deviceId: d.deviceId };
  }

  async function overview() {
    const [buses, devices] = await Promise.all([
      db().bus.findMany({
        select: { id: true, busNo: true, label: true, driverName: true, locationMode: true, activeSource: true, sourceChangedAt: true },
        orderBy: { busNo: 'asc' },
      }),
      db().gpsDevice.findMany(),
    ]);
    const byBus = new Map(devices.filter((x) => x.busId).map((x) => [x.busId, x]));
    const rows = buses.map((b) => {
      const d = byBus.get(b.id) || null;
      const latest = loc().getLatest(b.id);
      const live = src().describe(b.id, { bus: b, latestRecordedAt: latest ? latest.recordedAt : null });
      const connection = d ? src().deviceConnection(b.id, d.lastFixAt) : null;
      const tel = d ? src().telemetry(b.id) : null;
      const verified = d ? !!((tel && tel.verifiedAt) || d.verifiedAt) : false;
      const lastSeen = d ? Math.max(
        (tel && tel.lastContactAt) || 0,
        d.lastSeenAt ? new Date(d.lastSeenAt).getTime() : 0,
      ) : 0;
      return {
        busId: b.id,
        busNo: b.busNo,
        label: b.label || null,
        driverName: b.driverName,
        device: d ? { ...publicDevice(d), verified, connection, lastSeenAt: lastSeen ? new Date(lastSeen).toISOString() : null } : null,
        locationMode: live.locationMode,
        activeSource: live.locationSource,
        locationStatus: live.locationStatus,
        lastUpdate: latest ? new Date(latest.recordedAt).toISOString() : null,
        sourceChangedAt: iso(b.sourceChangedAt),
      };
    });
    const withDevice = rows.filter((r) => r.device);
    const summary = {
      totalBuses: rows.length,
      devicesInstalled: withDevice.length,
      devicesNotInstalled: rows.length - withDevice.length,
      devicesOnline: withDevice.filter((r) => r.device.connection === 'ONLINE').length,
      devicesOffline: withDevice.filter((r) => r.device.connection !== 'ONLINE').length,
    };
    return { summary, buses: rows, settings: src().settings() };
  }

  return {
    authenticate,
    registerDevice,
    rotateCredential,
    revoke,
    test,
    activate,
    deactivate,
    unlink,
    overview,
  };
}

const defaultService = createGpsDeviceService({
  prisma: () => require('../db'),
  source: () => require('./locationSourceService'),
  locationService: () => require('./locationService'),
});

module.exports = {
  ...defaultService,
  createGpsDeviceService,
  GpsDeviceError,
  generateSecret,
  hashSecret,
  publicDevice,
};

// Per-bus location source selection (mobile phone vs hardware GPS device).
//
// Sits in front of locationService.ingest, which is unchanged. Only the fix of
// the currently authoritative source is forwarded to ingest, so every
// existing consumer (trip updates, arrival detection, ETA, bus:location
// broadcasts) keeps working on one location stream per bus.
//
// Rules (all thresholds from config, backend controlled, independent per bus):
//   MOBILE_PRIMARY  mobile is forwarded; device fixes are validated and
//                   counted (verification) but never forwarded.
//   DEVICE_PRIMARY  device is forwarded while healthy; mobile fixes are
//                   validated as a backup and not forwarded. After
//                   deviceTimeoutMs of device silence the fresh mobile fix
//                   is used; after switchbackCount consecutive valid device
//                   fixes the device takes over again. If neither is
//                   available the source is NONE and the last position is
//                   kept, but it is reported as OFFLINE rather than live.
//
// This module never starts or ends trips and never touches Bus.status.

const MALFORMED = new Set(['invalid_fix', 'invalid_coordinates', 'invalid_timestamp']);
const CACHE_TTL_MS = 10000;
const FLUSH_INTERVAL_MS = 5000;
const SWEEP_INTERVAL_MS = 5000;
const LOCATION_STALE_MS = 60000; // mirrors the client's LIVE_STALE_MS

const DEFAULT_SETTINGS = Object.freeze({
  deviceTimeoutMs: 30000,
  mobileFreshMs: 30000,
  switchbackCount: 3,
  verifyCount: 3,
  locationStaleMs: LOCATION_STALE_MS,
});

const toMs = (v) => {
  if (v === null || v === undefined) return null;
  if (v instanceof Date) return v.getTime();
  if (typeof v === 'number') return v;
  const n = Date.parse(v);
  return Number.isFinite(n) ? n : null;
};

// Pure. Maps a device payload to a fix for validateFix. recordedAt may be an
// ISO string, epoch ms, or epoch seconds (< 1e11). Missing recordedAt stays
// missing (and is rejected as invalid_timestamp). speedKmh is converted to m/s.
function normalizeDeviceFix(body) {
  const src = body && typeof body === 'object' ? body : null;
  if (!src) return null;
  let recordedAt = src.recordedAt !== undefined ? src.recordedAt : src.timestamp;
  if (typeof recordedAt === 'string' && /^\d+(\.\d+)?$/.test(recordedAt.trim())) {
    recordedAt = Number(recordedAt);
  }
  if (typeof recordedAt === 'number' && Number.isFinite(recordedAt) && recordedAt < 1e11) {
    recordedAt *= 1000;
  }
  let speed = src.speed;
  if ((speed === undefined || speed === null) && src.speedKmh !== undefined && src.speedKmh !== null) {
    const kmh = Number(src.speedKmh);
    speed = Number.isFinite(kmh) ? kmh / 3.6 : undefined;
  }
  return { lat: src.lat, lng: src.lng, speed, heading: src.heading, accuracy: src.accuracy, recordedAt };
}

function createLocationSourceService({
  prisma,
  locationService,
  validateFix,
  now = () => Date.now(),
  emit = () => {},
  settings = () => DEFAULT_SETTINGS,
  logger = console,
} = {}) {
  const db = () => (typeof prisma === 'function' ? prisma() : prisma);
  // Resolved at call time so jest.spyOn(locationService, 'ingest') works.
  const loc = () => (typeof locationService === 'function' ? locationService() : locationService);
  const validate = (...a) => (validateFix || loc().validateFix)(...a);
  const cfg = () => ({ ...DEFAULT_SETTINGS, ...(settings() || {}) });

  const states = new Map();
  let emitter = emit;
  let timer = null;

  const safe = (fn) => {
    try { return fn(); } catch (err) { logger.error && logger.error('[locationSource]', err && err.message); return undefined; }
  };
  const fireAndForget = (p) => {
    if (p && typeof p.catch === 'function') p.catch((err) => logger.error && logger.error('[locationSource]', err && err.message));
  };

  const newState = (busId) => ({
    busId,
    mode: 'MOBILE_PRIMARY',
    active: 'MOBILE',
    deviceId: null,
    deviceSeenAt: null,
    mobileSeenAt: null,
    deviceLast: null,
    mobileLast: null,
    consecutive: 0,
    validCount: 0,
    verifiedAt: null,
    lastContactAt: null,
    changedAt: null,
    loadedAt: 0,
    flushedAt: 0,
    dirty: false,
  });

  const payload = (s) => ({
    busId: s.busId,
    locationMode: s.mode,
    locationSource: s.active,
    changedAt: s.changedAt ? new Date(s.changedAt).toISOString() : null,
  });

  function setActive(s, next, { persist = true } = {}) {
    if (s.active === next) return;
    s.active = next;
    s.changedAt = now();
    if (next !== 'DEVICE') s.consecutive = 0;
    if (persist) {
      safe(() => fireAndForget(db().bus.update({
        where: { id: s.busId },
        data: { activeSource: next, sourceChangedAt: new Date(s.changedAt) },
      })));
    }
    safe(() => emitter('bus:source', s.busId, payload(s)));
  }

  function evaluate(s) {
    if (s.mode !== 'DEVICE_PRIMARY') {
      if (s.active !== 'MOBILE') setActive(s, 'MOBILE');
      return;
    }
    const c = cfg();
    const t = now();
    const deviceOk = s.deviceSeenAt != null && t - s.deviceSeenAt <= c.deviceTimeoutMs;
    const mobileOk = s.mobileSeenAt != null && t - s.mobileSeenAt <= c.mobileFreshMs;
    if (s.active === 'DEVICE') {
      if (!deviceOk) setActive(s, mobileOk ? 'MOBILE' : 'NONE');
    } else if (s.consecutive >= c.switchbackCount && deviceOk) {
      setActive(s, 'DEVICE');
    } else if (s.active === 'MOBILE' && !mobileOk) {
      setActive(s, 'NONE');
    } else if (s.active === 'NONE' && mobileOk) {
      setActive(s, 'MOBILE');
    }
  }

  // Loads (or refreshes) the bus's mode and device assignment. Fails open:
  // on any error the bus behaves as MOBILE_PRIMARY pass-through.
  async function ensureState(busId) {
    let s = states.get(busId);
    const t = now();
    if (s && t - s.loadedAt < CACHE_TTL_MS) return s;
    const first = !s;
    if (first) { s = newState(busId); states.set(busId, s); }
    s.loadedAt = t;
    try {
      const prismaDb = db();
      const bus = await prismaDb.bus.findUnique({
        where: { id: busId },
        select: { locationMode: true, activeSource: true },
      });
      const device = bus && prismaDb.gpsDevice
        ? await prismaDb.gpsDevice.findUnique({ where: { busId } })
        : null;
      if (bus && bus.locationMode) {
        const mode = device && !device.revokedAt ? bus.locationMode : 'MOBILE_PRIMARY';
        s.mode = mode;
        s.deviceId = device ? device.deviceId : null;
        if (first) {
          s.active = mode === 'DEVICE_PRIMARY' ? (bus.activeSource || 'DEVICE') : 'MOBILE';
          s.deviceSeenAt = device ? toMs(device.lastFixAt) : null;
          s.validCount = device ? device.validFixCount || 0 : 0;
          s.verifiedAt = device ? toMs(device.verifiedAt) : null;
        }
        if (mode !== 'DEVICE_PRIMARY') s.active = 'MOBILE';
      }
    } catch (err) {
      logger.error && logger.error('[locationSource] config load failed, using mobile pass-through');
    }
    return s;
  }

  function flush(s, force = false) {
    if (!s.deviceId || !s.dirty) return;
    const t = now();
    if (!force && t - s.flushedAt < FLUSH_INTERVAL_MS) return;
    s.flushedAt = t;
    s.dirty = false;
    const data = {
      lastSeenAt: new Date(s.lastContactAt || t),
      validFixCount: s.validCount,
    };
    if (s.deviceSeenAt != null) data.lastFixAt = new Date(s.deviceSeenAt);
    if (s.deviceLast) { data.lastLat = s.deviceLast.lat; data.lastLng = s.deviceLast.lng; }
    if (s.verifiedAt != null) data.verifiedAt = new Date(s.verifiedAt);
    safe(() => fireAndForget(db().gpsDevice.update({ where: { deviceId: s.deviceId }, data })));
  }

  async function ingestMobile(busId, rawFix) {
    const s = await ensureState(busId);
    if (s.mode !== 'DEVICE_PRIMARY') {
      const result = await loc().ingest(busId, rawFix);
      if (result && result.accepted) s.mobileSeenAt = now();
      return result;
    }
    evaluate(s);
    const t = now();
    const v = validate(rawFix, s.mobileLast, t);
    if (!v.ok) return { accepted: false, reason: v.reason };
    s.mobileLast = v.fix;
    s.mobileSeenAt = t;
    evaluate(s);
    if (s.active === 'MOBILE') return loc().ingest(busId, rawFix);
    return { accepted: true, broadcast: false, backup: true, activeSource: s.active };
  }

  // `rawFix` should already be passed through normalizeDeviceFix.
  async function ingestDevice(busId, deviceId, rawFix) {
    const s = await ensureState(busId);
    if (deviceId) s.deviceId = deviceId;
    evaluate(s);
    const t = now();
    const c = cfg();
    s.lastContactAt = t;
    s.dirty = true;
    const v = validate(rawFix, s.deviceLast, t);
    if (!v.ok) {
      s.consecutive = 0;
      flush(s);
      return { accepted: false, reason: v.reason, malformed: MALFORMED.has(v.reason), activeSource: s.active };
    }
    if (s.deviceSeenAt == null || t - s.deviceSeenAt > c.deviceTimeoutMs) s.consecutive = 0;
    s.deviceLast = v.fix;
    s.deviceSeenAt = t;
    s.consecutive += 1;
    s.validCount += 1;
    let justVerified = false;
    if (s.verifiedAt == null && s.validCount >= c.verifyCount) {
      s.verifiedAt = t;
      justVerified = true;
    }
    evaluate(s);
    flush(s, justVerified);
    if (s.mode === 'DEVICE_PRIMARY' && s.active === 'DEVICE') {
      const result = await loc().ingest(busId, v.fix);
      const out = { accepted: !!(result && result.accepted), used: true, activeSource: s.active };
      if (result && !result.accepted && result.reason) out.reason = result.reason;
      return out;
    }
    return { accepted: true, used: false, activeSource: s.active };
  }

  // Synchronous, cache-only. Safe to call from snapshot builders.
  function describe(busId, { bus, latestRecordedAt } = {}) {
    const s = states.get(busId);
    if (s) evaluate(s);
    const mode = (s && s.mode) || (bus && bus.locationMode) || 'MOBILE_PRIMARY';
    const source = (s && s.active) || (bus && bus.activeSource) || 'MOBILE';
    const at = toMs(latestRecordedAt);
    let status;
    if (source === 'NONE') status = 'OFFLINE';
    else if (at == null || now() - at > cfg().locationStaleMs) status = 'STALE';
    else status = 'LIVE';
    return { locationMode: mode, locationSource: source, locationStatus: status };
  }

  // Admin changed the bus's mode / device assignment: apply immediately.
  function applyAdminChange(busId, { mode, deviceId = null, deviceLive = false } = {}) {
    let s = states.get(busId);
    if (!s) { s = newState(busId); states.set(busId, s); }
    s.loadedAt = now();
    s.mode = mode;
    s.deviceId = deviceId;
    if (mode === 'DEVICE_PRIMARY') {
      if (deviceLive) s.deviceSeenAt = s.deviceSeenAt != null ? s.deviceSeenAt : now();
      setActive(s, 'DEVICE', { persist: false });
    } else {
      s.consecutive = 0;
      setActive(s, 'MOBILE', { persist: false });
    }
    safe(() => emitter('bus:source', busId, payload(s)));
    return describe(busId);
  }

  function forgetBus(busId) { states.delete(busId); }
  function invalidate(busId) { const s = states.get(busId); if (s) s.loadedAt = 0; }

  function telemetry(busId) {
    const s = states.get(busId);
    if (!s) return null;
    return {
      mode: s.mode,
      activeSource: s.active,
      deviceSeenAt: s.deviceSeenAt,
      mobileSeenAt: s.mobileSeenAt,
      consecutive: s.consecutive,
      validCount: s.validCount,
      verifiedAt: s.verifiedAt,
      lastContactAt: s.lastContactAt,
    };
  }

  // ONLINE if the device sent a valid fix within the timeout.
  function deviceConnection(busId, fallbackLastFixAt = null) {
    const s = states.get(busId);
    const seen = s && s.deviceSeenAt != null ? s.deviceSeenAt : toMs(fallbackLastFixAt);
    if (seen == null) return 'NEVER_SEEN';
    return now() - seen <= cfg().deviceTimeoutMs ? 'ONLINE' : 'OFFLINE';
  }

  function sweep() {
    for (const s of states.values()) {
      safe(() => evaluate(s));
      safe(() => flush(s));
    }
  }

  function start() {
    if (timer) return;
    timer = setInterval(sweep, SWEEP_INTERVAL_MS);
    if (timer.unref) timer.unref();
  }
  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }
  const setEmitter = (fn) => { emitter = typeof fn === 'function' ? fn : () => {}; };
  const reset = () => { states.clear(); };

  return {
    ingestMobile,
    ingestDevice,
    describe,
    applyAdminChange,
    forgetBus,
    invalidate,
    telemetry,
    deviceConnection,
    sweep,
    start,
    stop,
    setEmitter,
    settings: cfg,
    reset,
  };
}

const getSettings = () => {
  try {
    const c = require('../config/env').getConfig();
    return {
      deviceTimeoutMs: c.GPS_DEVICE_TIMEOUT_MS,
      mobileFreshMs: c.GPS_MOBILE_FRESH_MS,
      switchbackCount: c.GPS_SWITCHBACK_COUNT,
      verifyCount: c.GPS_VERIFY_COUNT,
    };
  } catch (_) {
    return DEFAULT_SETTINGS;
  }
};

let sharedEmit = null;
const defaultService = createLocationSourceService({
  prisma: () => require('../db'),
  locationService: () => require('./locationService'),
  emit: (event, busId, p) => { if (sharedEmit) sharedEmit(event, busId, p); },
  settings: getSettings,
});
const setSharedEmitter = (fn) => { sharedEmit = typeof fn === 'function' ? fn : null; };

module.exports = {
  ...defaultService,
  setEmitter: setSharedEmitter,
  createLocationSourceService,
  normalizeDeviceFix,
  MALFORMED,
  DEFAULT_SETTINGS,
  LOCATION_STALE_MS,
};

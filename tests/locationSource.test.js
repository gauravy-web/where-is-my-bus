// Location source selection: mobile-only, device-primary, fallback,
// switch-back, both offline, invalid fixes and trip independence.
// Clock is controlled; Prisma and the ingest pipeline are fakes. No DB.
const { createLocationSourceService, normalizeDeviceFix } = require('../src/services/locationSourceService');
const { validateFix } = require('../src/services/locationService');

const T0 = 1_700_000_000_000;

function setup({ mode = 'MOBILE_PRIMARY', active = 'MOBILE', device = null, bus = true } = {}) {
  const clock = { t: T0 };
  const busUpdates = [];
  const deviceUpdates = [];
  const prisma = {
    bus: {
      findUnique: jest.fn(async () => (bus ? { locationMode: mode, activeSource: active } : null)),
      update: jest.fn(async (args) => { busUpdates.push(args); return {}; }),
    },
    gpsDevice: {
      findUnique: jest.fn(async () => device),
      update: jest.fn(async (args) => { deviceUpdates.push(args); return {}; }),
    },
  };
  const locationService = { ingest: jest.fn(async () => ({ accepted: true, broadcast: true })) };
  const events = [];
  const svc = createLocationSourceService({
    prisma,
    locationService,
    validateFix,
    now: () => clock.t,
    emit: (event, busId, payload) => events.push({ event, busId, payload }),
    logger: { error: jest.fn() },
  });
  return { svc, clock, prisma, locationService, events, busUpdates, deviceUpdates };
}

const DEVICE = { deviceId: 'gps-1', revokedAt: null, lastFixAt: null, validFixCount: 0, verifiedAt: null };
let n = 0;
const fixAt = (t) => { n += 1; return { lat: 12 + n * 0.00001, lng: 77 + n * 0.00001, speed: 5, recordedAt: t }; };
const advance = (ctx, ms) => { ctx.clock.t += ms; };
const devicePrimary = () => setup({ mode: 'DEVICE_PRIMARY', active: 'DEVICE', device: { ...DEVICE, lastFixAt: new Date(T0) } });

beforeEach(() => { n = 0; });

describe('mobile only (no device)', () => {
  test('mobile fixes are forwarded to ingest unchanged', async () => {
    const c = setup();
    const f = fixAt(c.clock.t);
    const r = await c.svc.ingestMobile('b1', f);
    expect(r).toEqual({ accepted: true, broadcast: true });
    expect(c.locationService.ingest).toHaveBeenCalledWith('b1', f);
    expect(c.svc.describe('b1')).toMatchObject({ locationMode: 'MOBILE_PRIMARY', locationSource: 'MOBILE' });
  });

  test('device fixes before activation are counted but never forwarded', async () => {
    const c = setup({ device: DEVICE });
    for (let i = 0; i < 3; i += 1) {
      advance(c, 5000);
      const r = await c.svc.ingestDevice('b1', 'gps-1', fixAt(c.clock.t));
      expect(r).toMatchObject({ accepted: true, used: false, activeSource: 'MOBILE' });
    }
    expect(c.locationService.ingest).not.toHaveBeenCalled();
    expect(c.svc.telemetry('b1').verifiedAt).not.toBeNull();
    expect(c.svc.deviceConnection('b1')).toBe('ONLINE');
  });

  test('falls back to mobile pass-through when the config lookup fails', async () => {
    const c = setup();
    c.prisma.bus.findUnique.mockRejectedValue(new Error('db down'));
    await c.svc.ingestMobile('b1', fixAt(c.clock.t));
    expect(c.locationService.ingest).toHaveBeenCalledTimes(1);
  });
});

describe('device primary', () => {
  test('device is authoritative, mobile is only a validated backup', async () => {
    const c = devicePrimary();
    const d = await c.svc.ingestDevice('b1', 'gps-1', fixAt(c.clock.t));
    expect(d).toMatchObject({ accepted: true, used: true, activeSource: 'DEVICE' });
    expect(c.locationService.ingest).toHaveBeenCalledTimes(1);

    advance(c, 1000);
    const m = await c.svc.ingestMobile('b1', fixAt(c.clock.t));
    expect(m).toMatchObject({ accepted: true, backup: true });
    expect(c.locationService.ingest).toHaveBeenCalledTimes(1);
    expect(c.svc.describe('b1').locationSource).toBe('DEVICE');
  });

  test('invalid backup mobile fixes are rejected', async () => {
    const c = devicePrimary();
    const m = await c.svc.ingestMobile('b1', { lat: 999, lng: 0, recordedAt: c.clock.t });
    expect(m).toEqual({ accepted: false, reason: 'invalid_coordinates' });
  });
});

describe('automatic fallback and switch-back', () => {
  async function toMobileFallback() {
    const c = devicePrimary();
    await c.svc.ingestDevice('b1', 'gps-1', fixAt(c.clock.t));
    advance(c, 25000);
    await c.svc.ingestMobile('b1', fixAt(c.clock.t)); // backup, device still healthy
    advance(c, 10000); // device silent for 35 s
    c.svc.sweep();
    return c;
  }

  test('device silent past the timeout switches to a fresh mobile fix', async () => {
    const c = await toMobileFallback();
    expect(c.svc.describe('b1').locationSource).toBe('MOBILE');
    expect(c.events.some((e) => e.event === 'bus:source' && e.payload.locationSource === 'MOBILE')).toBe(true);
    expect(c.busUpdates.some((u) => u.data.activeSource === 'MOBILE')).toBe(true);

    c.locationService.ingest.mockClear();
    advance(c, 2000);
    await c.svc.ingestMobile('b1', fixAt(c.clock.t));
    expect(c.locationService.ingest).toHaveBeenCalledTimes(1);
  });

  test('does not switch before the timeout', async () => {
    const c = devicePrimary();
    await c.svc.ingestDevice('b1', 'gps-1', fixAt(c.clock.t));
    advance(c, 29000);
    c.svc.sweep();
    expect(c.svc.describe('b1').locationSource).toBe('DEVICE');
  });

  test('switches back only after three consecutive valid device fixes', async () => {
    const c = await toMobileFallback();
    c.locationService.ingest.mockClear();
    advance(c, 1000);
    const r1 = await c.svc.ingestDevice('b1', 'gps-1', fixAt(c.clock.t));
    advance(c, 1000);
    const r2 = await c.svc.ingestDevice('b1', 'gps-1', fixAt(c.clock.t));
    expect(r1.used).toBe(false);
    expect(r2.used).toBe(false);
    expect(c.svc.describe('b1').locationSource).toBe('MOBILE');
    advance(c, 1000);
    const r3 = await c.svc.ingestDevice('b1', 'gps-1', fixAt(c.clock.t));
    expect(r3).toMatchObject({ used: true, activeSource: 'DEVICE' });
    expect(c.locationService.ingest).toHaveBeenCalledTimes(1);
  });

  test('an invalid fix or a long gap resets the consecutive count', async () => {
    const c = await toMobileFallback();
    advance(c, 1000);
    await c.svc.ingestDevice('b1', 'gps-1', fixAt(c.clock.t));
    advance(c, 1000);
    await c.svc.ingestDevice('b1', 'gps-1', fixAt(c.clock.t));
    advance(c, 1000);
    await c.svc.ingestDevice('b1', 'gps-1', { lat: 'x', lng: 1, recordedAt: c.clock.t }); // resets
    advance(c, 1000);
    await c.svc.ingestDevice('b1', 'gps-1', fixAt(c.clock.t));
    advance(c, 1000);
    await c.svc.ingestDevice('b1', 'gps-1', fixAt(c.clock.t));
    expect(c.svc.describe('b1').locationSource).toBe('MOBILE');

    advance(c, 40000); // gap longer than the timeout
    await c.svc.ingestDevice('b1', 'gps-1', fixAt(c.clock.t));
    expect(c.svc.telemetry('b1').consecutive).toBe(1);
  });
});

describe('both sources unavailable', () => {
  test('source becomes NONE and status OFFLINE; ingest is not called', async () => {
    const c = devicePrimary();
    await c.svc.ingestDevice('b1', 'gps-1', fixAt(c.clock.t));
    c.locationService.ingest.mockClear();
    advance(c, 40000);
    c.svc.sweep();
    const d = c.svc.describe('b1', { latestRecordedAt: T0 });
    expect(d).toEqual({ locationMode: 'DEVICE_PRIMARY', locationSource: 'NONE', locationStatus: 'OFFLINE' });
    expect(c.locationService.ingest).not.toHaveBeenCalled();
  });

  test('a recovering mobile fix leaves NONE', async () => {
    const c = devicePrimary();
    await c.svc.ingestDevice('b1', 'gps-1', { lat: 'x', lng: 0 }); // loads bus state
    advance(c, 40000);
    c.svc.sweep();
    expect(c.svc.describe('b1').locationSource).toBe('NONE');
    await c.svc.ingestMobile('b1', fixAt(c.clock.t));
    expect(c.svc.describe('b1').locationSource).toBe('MOBILE');
  });

  test('a live source with an old last position is STALE, a recent one LIVE', () => {
    const c = setup();
    expect(c.svc.describe('b1', { latestRecordedAt: T0 - 120000 }).locationStatus).toBe('STALE');
    expect(c.svc.describe('b1', { latestRecordedAt: T0 - 5000 }).locationStatus).toBe('LIVE');
  });
});

describe('invalid device fixes', () => {
  test.each([
    [{ lat: 91, lng: 0 }, 'invalid_coordinates', true],
    [{ lat: 'abc', lng: 0 }, 'invalid_coordinates', true],
    [{ lat: 1, lng: 1 }, 'invalid_timestamp', true],
    [{ lat: 1, lng: 1, recordedAt: T0 - 10 * 60 * 1000 }, 'stale', false],
    [{ lat: 1, lng: 1, recordedAt: T0 + 5 * 60 * 1000 }, 'future', false],
  ])('%j -> %s', async (fix, reason, malformed) => {
    const c = devicePrimary();
    const r = await c.svc.ingestDevice('b1', 'gps-1', fix);
    expect(r).toMatchObject({ accepted: false, reason, malformed });
    expect(c.locationService.ingest).not.toHaveBeenCalled();
  });

  test('normalizeDeviceFix handles epoch seconds and km/h', () => {
    const f = normalizeDeviceFix({ lat: 1, lng: 2, recordedAt: 1_700_000_000, speedKmh: 36 });
    expect(f.recordedAt).toBe(1_700_000_000_000);
    expect(f.speed).toBeCloseTo(10);
    expect(normalizeDeviceFix(null)).toBeNull();
  });
});

describe('trip independence', () => {
  test('ingest never touches Bus.status or any trip API', async () => {
    const c = devicePrimary();
    c.prisma.trip = { create: jest.fn(), update: jest.fn(), updateMany: jest.fn() };
    await c.svc.ingestDevice('b1', 'gps-1', fixAt(c.clock.t));
    advance(c, 40000);
    c.svc.sweep();
    await c.svc.ingestMobile('b1', fixAt(c.clock.t));
    for (const u of c.busUpdates) expect(Object.keys(u.data)).not.toContain('status');
    expect(c.prisma.trip.create).not.toHaveBeenCalled();
    expect(c.prisma.trip.update).not.toHaveBeenCalled();
    expect(c.prisma.trip.updateMany).not.toHaveBeenCalled();
  });
});

/**
 * Trip simulator for manual end-to-end checks (Requirement 16.4).
 *
 * Logs in as a DRIVER (phone + password), starts a trip in the given
 * direction, then streams `driver:location` fixes interpolated along the
 * trip's TripStop snapshot (and on to the school on PICKUP trips). At every
 * stop the bus dwells with speed 0 so arrival detection can fire, then the
 * script completes that stop so the trip moves on. Optionally the socket is
 * dropped after N fixes and reconnected later.
 *
 * Usage (from backend/):
 *   node scripts/simulateTrip.js --phone <driverPhone> --direction PICKUP
 *   node scripts/simulateTrip.js --dry-run --stops "28.61,77.20;28.62,77.21"
 *
 * Options (CLI wins over env):
 *   --base-url <url>           SIM_BASE_URL            default http://localhost:5000
 *   --phone <phone>            SIM_PHONE               driver phone (required unless --dry-run)
 *   --password <password>   SIM_PASSWORD           driver password (required unless --dry-run; env preferred)
 *   --direction PICKUP|DROP    SIM_DIRECTION           default PICKUP
 *   --interval-ms <ms>         SIM_INTERVAL_MS         default 2000 (min 100)
 *   --speed-mps <m/s>          SIM_SPEED_MPS           default 10 (max 50)
 *   --dwell-fixes <n>          SIM_DWELL_FIXES         speed-0 fixes at each stop, default 2
 *   --accuracy <m>             SIM_ACCURACY            reported accuracy, default 10 (0..100)
 *   --disconnect-at <n>        SIM_DISCONNECT_AT       drop the socket after n fixes were sent
 *   --reconnect-after-ms <ms>  SIM_RECONNECT_AFTER_MS  offline time, default 10000
 *   --stops "lat,lng;..."      SIM_STOPS               dry-run stop list (default: built-in sample)
 *   --school "lat,lng"         SIM_SCHOOL              school fallback when the trip has none (PICKUP only)
 *   --no-complete                                      do not complete stops after dwelling
 *   --end-trip                                         end the trip after the last fix
 *   --allow-remote                                     allow a non-local base URL
 *   --dry-run                                          print the planned fixes, no network
 *   --help
 *
 * Safety: the password and JWT are never printed. A base URL that is not local or
 * on a private network is refused unless --allow-remote is given.
 */

const DEFAULTS = Object.freeze({
  baseUrl: 'http://localhost:5000',
  direction: 'PICKUP',
  intervalMs: 2000,
  speedMps: 10,
  dwellFixes: 2,
  accuracy: 10,
  reconnectAfterMs: 10000,
});

const MIN_INTERVAL_MS = 100;
const MAX_SPEED_MPS = 50; // 180 km/h, below the 200 km/h ingest cap
const DIRECTIONS = ['PICKUP', 'DROP'];
const OPEN_STATUSES = ['PENDING', 'ARRIVED'];
const EARTH_RADIUS_M = 6371000;

// Generic sample route used by --dry-run when no --stops are given.
const SAMPLE_STOPS = Object.freeze([
  { lat: 28.6139, lng: 77.209 },
  { lat: 28.6165, lng: 77.2122 },
  { lat: 28.6201, lng: 77.2148 },
  { lat: 28.6232, lng: 77.2189 },
]);
const SAMPLE_SCHOOL = Object.freeze({ lat: 28.6268, lng: 77.2215 });

const BOOLEAN_FLAGS = {
  'dry-run': 'dryRun',
  'allow-remote': 'allowRemote',
  'end-trip': 'endTrip',
  'no-complete': 'noComplete',
  help: 'help',
};

const VALUE_FLAGS = {
  'base-url': 'baseUrl',
  phone: 'phone',
  password: 'password',
  direction: 'direction',
  'interval-ms': 'intervalMs',
  'speed-mps': 'speedMps',
  'dwell-fixes': 'dwellFixes',
  accuracy: 'accuracy',
  'disconnect-at': 'disconnectAt',
  'reconnect-after-ms': 'reconnectAfterMs',
  stops: 'stops',
  school: 'school',
};

const ENV_KEYS = {
  baseUrl: ['SIM_BASE_URL'],
  phone: ['SIM_PHONE'],
  password: ['SIM_PASSWORD'],
  direction: ['SIM_DIRECTION'],
  intervalMs: ['SIM_INTERVAL_MS'],
  speedMps: ['SIM_SPEED_MPS'],
  dwellFixes: ['SIM_DWELL_FIXES'],
  accuracy: ['SIM_ACCURACY'],
  disconnectAt: ['SIM_DISCONNECT_AT'],
  reconnectAfterMs: ['SIM_RECONNECT_AFTER_MS'],
  stops: ['SIM_STOPS'],
  school: ['SIM_SCHOOL'],
};

const isBlank = (v) => v === undefined || v === null || String(v).trim() === '';

// ── Geometry (pure) ──

const toRad = (deg) => (deg * Math.PI) / 180;
const toDeg = (rad) => (rad * 180) / Math.PI;

function haversineMeters(a, b) {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

// Initial bearing from a to b in degrees, 0..360.
function bearingDegrees(a, b) {
  const phi1 = toRad(a.lat);
  const phi2 = toRad(b.lat);
  const dLng = toRad(b.lng - a.lng);
  const y = Math.sin(dLng) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

// Linear lat/lng interpolation; fine for the short legs between bus stops.
function interpolate(a, b, t) {
  return { lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t };
}

// ── Argument parsing (pure) ──

function parseLatLng(text) {
  if (isBlank(text)) return null;
  const parts = String(text).split(',').map((p) => p.trim());
  if (parts.length !== 2 || parts.some((p) => p === '')) return null;
  const lat = Number(parts[0]);
  const lng = Number(parts[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

// "lat,lng;lat,lng" -> [{lat,lng}], or null if any entry is invalid.
function parseLatLngList(text) {
  if (isBlank(text)) return null;
  const entries = String(text).split(';').map((e) => e.trim()).filter(Boolean);
  if (entries.length === 0) return null;
  const points = entries.map(parseLatLng);
  return points.every(Boolean) ? points : null;
}

const PRIVATE_IPV4 = [/^127\./, /^10\./, /^192\.168\./, /^172\.(1[6-9]|2\d|3[01])\./, /^0\.0\.0\.0$/];

// True for localhost, *.localhost, *.local, loopback and private IPv4 hosts.
// Anything else is treated as possibly production.
function isLocalBaseUrl(baseUrl) {
  let url;
  try {
    url = new URL(baseUrl);
  } catch (err) {
    return false;
  }
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local')) return true;
  if (host === '::1') return true;
  return PRIVATE_IPV4.some((re) => re.test(host));
}

function readRaw(argv, env) {
  const raw = {};
  const errors = [];
  const args = Array.isArray(argv) ? argv : [];

  for (let i = 0; i < args.length; i += 1) {
    const arg = String(args[i]);
    if (!arg.startsWith('--')) {
      errors.push(`Unexpected argument: ${arg}`);
      continue;
    }
    const eq = arg.indexOf('=');
    const name = arg.slice(2, eq === -1 ? undefined : eq);
    if (BOOLEAN_FLAGS[name]) {
      if (eq !== -1) errors.push(`--${name} does not take a value`);
      else raw[BOOLEAN_FLAGS[name]] = true;
      continue;
    }
    if (!VALUE_FLAGS[name]) {
      errors.push(`Unknown option: --${name}`);
      continue;
    }
    let value;
    if (eq !== -1) {
      value = arg.slice(eq + 1);
    } else if (i + 1 < args.length && !String(args[i + 1]).startsWith('--')) {
      i += 1;
      value = String(args[i]);
    } else {
      errors.push(`--${name} requires a value`);
      continue;
    }
    raw[VALUE_FLAGS[name]] = value;
  }

  const source = env || {};
  for (const [key, envNames] of Object.entries(ENV_KEYS)) {
    if (!isBlank(raw[key])) continue;
    const envName = envNames.find((n) => !isBlank(source[n]));
    if (envName) raw[key] = source[envName];
  }
  return { raw, errors };
}

function parseIntOption(raw, key, label, { min, fallback }, errors) {
  if (isBlank(raw[key])) return fallback;
  const text = String(raw[key]).trim();
  const n = Number(text);
  if (!/^-?\d+$/.test(text) || !Number.isSafeInteger(n) || n < min) {
    errors.push(`${label} must be an integer >= ${min}`);
    return fallback;
  }
  return n;
}

function parseNumberOption(raw, key, label, { min, max, minExclusive, fallback }, errors) {
  if (isBlank(raw[key])) return fallback;
  const n = Number(String(raw[key]).trim());
  const tooLow = minExclusive ? n <= min : n < min;
  if (!Number.isFinite(n) || tooLow || n > max) {
    errors.push(`${label} must be a number ${minExclusive ? '>' : '>='} ${min} and <= ${max}`);
    return fallback;
  }
  return n;
}

/**
 * Pure. Parses CLI args (process.argv.slice(2)) with env fallbacks.
 * @returns {{ ok: boolean, errors: string[], options: object }}
 */
function parseArgs(argv, env = {}) {
  const { raw, errors } = readRaw(argv, env);

  const options = {
    baseUrl: (isBlank(raw.baseUrl) ? DEFAULTS.baseUrl : String(raw.baseUrl).trim()).replace(/\/+$/, ''),
    phone: isBlank(raw.phone) ? null : String(raw.phone).trim(),
    password: isBlank(raw.password) ? null : String(raw.password).trim(),
    direction: isBlank(raw.direction) ? DEFAULTS.direction : String(raw.direction).trim().toUpperCase(),
    intervalMs: parseIntOption(raw, 'intervalMs', '--interval-ms', { min: MIN_INTERVAL_MS, fallback: DEFAULTS.intervalMs }, errors),
    speedMps: parseNumberOption(raw, 'speedMps', '--speed-mps', { min: 0, max: MAX_SPEED_MPS, minExclusive: true, fallback: DEFAULTS.speedMps }, errors),
    dwellFixes: parseIntOption(raw, 'dwellFixes', '--dwell-fixes', { min: 1, fallback: DEFAULTS.dwellFixes }, errors),
    accuracy: parseNumberOption(raw, 'accuracy', '--accuracy', { min: 0, max: 100, fallback: DEFAULTS.accuracy }, errors),
    disconnectAt: parseIntOption(raw, 'disconnectAt', '--disconnect-at', { min: 1, fallback: null }, errors),
    reconnectAfterMs: parseIntOption(raw, 'reconnectAfterMs', '--reconnect-after-ms', { min: 0, fallback: DEFAULTS.reconnectAfterMs }, errors),
    stops: null,
    school: null,
    dryRun: raw.dryRun === true,
    allowRemote: raw.allowRemote === true,
    endTrip: raw.endTrip === true,
    completeStops: raw.noComplete !== true,
    help: raw.help === true,
  };

  if (!DIRECTIONS.includes(options.direction)) errors.push('--direction must be PICKUP or DROP');

  if (!isBlank(raw.stops)) {
    options.stops = parseLatLngList(raw.stops);
    if (!options.stops) errors.push('--stops must look like "lat,lng;lat,lng" with valid coordinates');
  }
  if (!isBlank(raw.school)) {
    options.school = parseLatLng(raw.school);
    if (!options.school) errors.push('--school must look like "lat,lng" with valid coordinates');
  }

  if (!options.dryRun && !options.help) {
    let validUrl = true;
    try {
      const { protocol } = new URL(options.baseUrl);
      if (protocol !== 'http:' && protocol !== 'https:') validUrl = false;
    } catch (err) {
      validUrl = false;
    }
    if (!validUrl) {
      errors.push('--base-url must be an http(s) URL');
    } else if (!isLocalBaseUrl(options.baseUrl) && !options.allowRemote) {
      errors.push('Refusing a non-local --base-url (it may be production); pass --allow-remote to override');
    }
    if (!options.phone) errors.push('--phone (or SIM_PHONE) is required');
    if (!options.password) errors.push('--password (or SIM_PASSWORD) is required');
  }

  return { ok: errors.length === 0, errors, options };
}

// ── Route planning (pure) ──

// Open TripStops in snapshot order (order asc, id asc), then the school on
// PICKUP trips: the trip's snapshot, else the fallback when given.
function buildWaypoints(trip, schoolFallback = null) {
  const stops = Array.isArray(trip?.stops) ? trip.stops : [];
  const waypoints = stops
    .filter((s) => OPEN_STATUSES.includes(s.status) && Number.isFinite(s.lat) && Number.isFinite(s.lng))
    .sort((a, b) => (a.order - b.order) || String(a.id).localeCompare(String(b.id)))
    .map((s) => ({ kind: 'STOP', tripStopId: s.id, name: s.name ?? null, lat: s.lat, lng: s.lng }));

  if (trip?.direction === 'PICKUP') {
    if (Number.isFinite(trip.destLat) && Number.isFinite(trip.destLng)) {
      waypoints.push({ kind: 'SCHOOL', tripStopId: null, name: trip.destName ?? null, lat: trip.destLat, lng: trip.destLng });
    } else if (schoolFallback && Number.isFinite(schoolFallback.lat) && Number.isFinite(schoolFallback.lng)) {
      waypoints.push({ kind: 'SCHOOL', tripStopId: null, name: 'School', lat: schoolFallback.lat, lng: schoolFallback.lng });
    }
  }
  return waypoints;
}

// A trip-like object for --dry-run, built from a plain stop list.
function dryRunTrip(direction, stops) {
  const list = stops && stops.length ? stops : SAMPLE_STOPS;
  return {
    id: 'dry-run',
    busId: 'dry-run-bus',
    direction,
    stops: list.map((p, i) => ({
      id: `dry-stop-${i + 1}`, order: i + 1, name: `Stop ${i + 1}`, lat: p.lat, lng: p.lng, status: 'PENDING',
    })),
  };
}

/**
 * Pure. Fixes along the waypoints, one per interval. The first fix sits on
 * the first waypoint; consecutive fixes are never further apart than
 * speedMps * intervalMs. Each STOP waypoint gets `dwellFixes` speed-0 fixes
 * (the last one flagged `arrived`), the SCHOOL waypoint one speed-0 fix.
 * `offsetMs` is the planned send time relative to the first fix.
 */
function generateFixes(waypoints, { speedMps, intervalMs, dwellFixes = 1, accuracy = DEFAULTS.accuracy }) {
  const list = Array.isArray(waypoints) ? waypoints : [];
  const fixes = [];
  if (list.length === 0) return fixes;

  const step = (speedMps * intervalMs) / 1000;
  let heading = list.length > 1 ? bearingDegrees(list[0], list[1]) : 0;

  const push = (point, speed, extra) => {
    fixes.push({
      index: fixes.length,
      offsetMs: fixes.length * intervalMs,
      lat: point.lat,
      lng: point.lng,
      speed,
      heading,
      accuracy,
      ...extra,
    });
  };

  list.forEach((wp, i) => {
    if (i > 0) {
      const prev = list[i - 1];
      const dist = haversineMeters(prev, wp);
      if (dist > 0) heading = bearingDegrees(prev, wp);
      const legs = Math.max(1, Math.ceil(dist / step));
      for (let k = 1; k < legs; k += 1) {
        push(interpolate(prev, wp, k / legs), speedMps, { waypointIndex: null, kind: 'MOVING', tripStopId: null, arrived: false });
      }
    }
    const dwell = wp.kind === 'STOP' ? Math.max(1, dwellFixes) : 1;
    for (let d = 0; d < dwell; d += 1) {
      push(wp, 0, {
        waypointIndex: i,
        kind: wp.kind,
        name: wp.name ?? null,
        tripStopId: wp.tripStopId ?? null,
        arrived: d === dwell - 1,
      });
    }
  });
  return fixes;
}

// Pure. The `driver:location` payload for a fix sent at `recordedAtMs`.
function toPayload(fix, busId, recordedAtMs) {
  return {
    busId,
    lat: fix.lat,
    lng: fix.lng,
    recordedAt: new Date(recordedAtMs).toISOString(),
    accuracy: fix.accuracy,
    speed: fix.speed,
    heading: fix.heading,
  };
}

// Pure. Index to resume from after being offline from `fromIndex` for
// `offlineMs`: the bus kept moving, so movement fixes covering that time are
// skipped, but never past a waypoint fix (stops must still be dwelt at and
// completed).
function resumeIndex(fixes, fromIndex, offlineMs, intervalMs) {
  const skip = Math.max(0, Math.floor(offlineMs / intervalMs));
  let i = fromIndex;
  while (i < fixes.length && i - fromIndex < skip && fixes[i].waypointIndex === null) i += 1;
  return i;
}

// "+91 98765 43210" -> "******3210" (logs never show full phone numbers).
function maskPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits.length <= 4 ? '****' : `${'*'.repeat(digits.length - 4)}${digits.slice(-4)}`;
}

function formatFix(fix, recordedAtMs) {
  const at = new Date(recordedAtMs).toISOString();
  const tag = fix.waypointIndex === null
    ? 'moving'
    : `${fix.kind.toLowerCase()} ${fix.name ?? fix.waypointIndex + 1}${fix.arrived ? ' (arrived)' : ' (dwell)'}`;
  return `#${String(fix.index).padStart(3, ' ')} ${at} ${fix.lat.toFixed(6)},${fix.lng.toFixed(6)} ` +
    `speed=${fix.speed.toFixed(1)}m/s heading=${Math.round(fix.heading)} acc=${fix.accuracy}m ${tag}`;
}

// --help text: the header comment of this file.
function usage() {
  const header = require('fs').readFileSync(__filename, 'utf8').match(/\/\*\*([\s\S]*?)\*\//);
  return header ? header[1].replace(/^\s*\* ?/gm, '').trim() : 'See scripts/simulateTrip.js';
}

// ── Network (main only) ──

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function api(baseUrl, path, { method = 'GET', token, body } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let json = null;
  try {
    json = await res.json();
  } catch (err) {
    json = null;
  }
  return { status: res.status, ok: res.ok, json };
}

function connectSocket(baseUrl, token) {
  const { io } = require('socket.io-client');
  const socket = io(baseUrl, { auth: { token }, transports: ['websocket'], reconnection: false, autoConnect: false });

  socket.on('error', (err) => console.log(`[socket] error event: ${JSON.stringify(err)}`));
  socket.on('disconnect', (reason) => console.log(`[socket] disconnected (${reason})`));
  socket.on('trip:state', (s) => {
    const cur = s && s.currentStop ? `${s.currentStop.name} [${s.currentStop.status}]` : 'none';
    console.log(`[event] trip:state status=${s?.trip?.status ?? 'none'} currentStop=${cur}`);
  });
  socket.on('trip:eta', (e) => {
    const n = Array.isArray(e?.perStop) ? e.perStop.length : 0;
    const first = n ? Math.round(e.perStop[0].etaSeconds) : null;
    console.log(`[event] trip:eta stops=${n}${first !== null ? ` next=${first}s` : ''}${e?.school ? ` school=${Math.round(e.school.etaSeconds)}s` : ''}`);
  });
  for (const name of ['bus:location', 'tripStarted', 'tripEnded', 'trip:alert', 'trip:safety']) {
    socket.on(name, () => console.log(`[event] ${name}`));
  }
  return socket;
}

function waitForConnect(socket, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('socket connect timed out'));
    }, timeoutMs);
    const onConnect = () => { cleanup(); resolve(); };
    const onError = (err) => { cleanup(); reject(new Error(`socket connect failed: ${err?.message || err}`)); };
    const cleanup = () => {
      clearTimeout(timer);
      socket.off('connect', onConnect);
      socket.off('connect_error', onError);
    };
    socket.once('connect', onConnect);
    socket.once('connect_error', onError);
    socket.connect();
  });
}

function runDryRun(options) {
  const trip = dryRunTrip(options.direction, options.stops);
  const school = options.school || (options.stops ? null : SAMPLE_SCHOOL);
  const waypoints = buildWaypoints(trip, school);
  const fixes = generateFixes(waypoints, options);
  const start = Date.now();

  console.log(`Dry run: ${options.direction}, ${waypoints.length} waypoint(s), ${fixes.length} fix(es), ` +
    `every ${options.intervalMs} ms at ${options.speedMps} m/s`);
  for (const fix of fixes) {
    console.log(formatFix(fix, start + fix.offsetMs));
    if (options.disconnectAt !== null && fix.index + 1 === options.disconnectAt) {
      const next = resumeIndex(fixes, fix.index + 1, options.reconnectAfterMs, options.intervalMs);
      console.log(`  -- disconnect for ${options.reconnectAfterMs} ms, resume at #${next}`);
    }
  }
}

async function runLive(options) {
  const { baseUrl } = options;
  console.log(`Logging in as driver ${maskPhone(options.phone)} at ${baseUrl}`);
  const login = await api(baseUrl, '/api/auth/login', {
    method: 'POST',
    body: { phone: options.phone, password: options.password, role: 'DRIVER' },
  });
  if (!login.ok || !login.json?.token) {
    throw new Error(`login failed (${login.status}): ${login.json?.message ?? 'no token'}`);
  }
  const token = login.json.token;
  if (login.json.user?.role !== 'DRIVER') {
    throw new Error(`logged in as ${login.json.user?.role ?? 'unknown role'}, expected DRIVER`);
  }

  const started = await api(baseUrl, '/api/trips/start', { method: 'POST', token, body: { direction: options.direction } });
  if (!started.ok || !started.json?.trip) {
    throw new Error(`trip start failed (${started.status}): ${started.json?.message ?? 'no trip'}`);
  }
  const trip = started.json.trip;
  console.log(`Trip ${trip.id} ${started.json.resumed ? 'resumed' : 'started'}: bus ${trip.busId}, ${trip.direction}, ` +
    `${(trip.stops || []).length} stop(s)`);
  if (trip.direction !== options.direction) {
    console.log(`Note: an ACTIVE ${trip.direction} trip was resumed instead of ${options.direction}`);
  }

  const waypoints = buildWaypoints(trip, options.school);
  const fixes = generateFixes(waypoints, options);
  if (fixes.length === 0) {
    console.log('No open stops left on this trip; nothing to stream.');
  } else {
    console.log(`Streaming ${fixes.length} fix(es) to ${waypoints.length} waypoint(s) every ${options.intervalMs} ms`);
  }

  const socket = connectSocket(baseUrl, token);
  const stop = () => {
    console.log('Interrupted; closing socket.');
    socket.disconnect();
    process.exit(130);
  };
  process.once('SIGINT', stop);

  try {
    await waitForConnect(socket);
    console.log('[socket] connected');

    let i = 0;
    let sent = 0;
    let disconnected = false;
    while (i < fixes.length) {
      const fix = fixes[i];
      const now = Date.now();
      socket.emit('driver:location', toPayload(fix, trip.busId, now));
      sent += 1;
      console.log(formatFix(fix, now));

      if (fix.arrived && fix.tripStopId && options.completeStops) {
        const res = await api(baseUrl, `/api/trips/${encodeURIComponent(trip.id)}/stops/${encodeURIComponent(fix.tripStopId)}/complete`, {
          method: 'POST', token,
        });
        console.log(`  complete ${fix.name ?? fix.tripStopId}: ${res.status}${res.ok ? '' : ` ${res.json?.message ?? ''}`}`);
      }

      i += 1;
      if (!disconnected && options.disconnectAt !== null && sent === options.disconnectAt && i < fixes.length) {
        disconnected = true;
        console.log(`[sim] disconnecting for ${options.reconnectAfterMs} ms`);
        socket.disconnect();
        await sleep(options.reconnectAfterMs);
        await waitForConnect(socket);
        const next = resumeIndex(fixes, i, options.reconnectAfterMs, options.intervalMs);
        console.log(`[socket] reconnected; skipped ${next - i} fix(es) covered while offline`);
        i = next;
        continue;
      }
      if (i < fixes.length) await sleep(options.intervalMs);
    }

    if (options.endTrip) {
      const res = await api(baseUrl, `/api/trips/${encodeURIComponent(trip.id)}/end`, { method: 'POST', token });
      console.log(`End trip: ${res.status}${res.ok ? '' : ` ${res.json?.message ?? ''}`}`);
    }

    const current = await api(baseUrl, '/api/trips/current', { token });
    const cur = current.json?.currentStop;
    console.log(`Current trip: ${current.json?.trip ? `${current.json.trip.id} ${current.json.trip.status}` : 'none'}; ` +
      `current stop: ${cur ? `${cur.name} [${cur.status}]` : 'none'}`);
    // Give late events (trip:state, trip:eta) a moment to arrive.
    await sleep(1000);
  } finally {
    process.off('SIGINT', stop);
    socket.disconnect();
  }
}

async function main(argv = process.argv.slice(2), env = process.env) {
  const { ok, errors, options } = parseArgs(argv, env);
  if (options.help) {
    console.log(usage());
    return 0;
  }
  if (!ok) {
    for (const e of errors) console.error(`Error: ${e}`);
    console.error('Run with --help for usage.');
    return 2;
  }
  if (options.dryRun) {
    runDryRun(options);
    return 0;
  }
  await runLive(options);
  return 0;
}

if (require.main === module) {
  main()
    .then((code) => process.exit(code))
    .catch((err) => {
      console.error('simulateTrip failed:', err && err.message ? err.message : err);
      process.exit(1);
    });
}

module.exports = {
  DEFAULTS,
  SAMPLE_STOPS,
  parseArgs,
  parseLatLng,
  parseLatLngList,
  isLocalBaseUrl,
  haversineMeters,
  bearingDegrees,
  interpolate,
  buildWaypoints,
  dryRunTrip,
  generateFixes,
  toPayload,
  resumeIndex,
  maskPhone,
  formatFix,
};

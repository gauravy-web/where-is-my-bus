// Unit tests for the pure helpers of scripts/simulateTrip.js (task 6.4,
// Requirement 16.4). No network: only arg parsing, route planning and fix
// generation are exercised.
const {
  DEFAULTS,
  parseArgs,
  parseLatLngList,
  isLocalBaseUrl,
  haversineMeters,
  buildWaypoints,
  dryRunTrip,
  generateFixes,
  toPayload,
  resumeIndex,
  maskPhone,
} = require('../scripts/simulateTrip');

const LIVE = ['--phone', '9000000001', '--password', '111111'];

describe('parseArgs', () => {
  test('applies defaults and requires phone and password for live runs', () => {
    const { ok, errors, options } = parseArgs([], {});
    expect(ok).toBe(false);
    expect(errors.join('\n')).toMatch(/--phone/);
    expect(errors.join('\n')).toMatch(/--password/);
    expect(options).toMatchObject({
      baseUrl: DEFAULTS.baseUrl,
      direction: 'PICKUP',
      intervalMs: DEFAULTS.intervalMs,
      speedMps: DEFAULTS.speedMps,
      disconnectAt: null,
      dryRun: false,
      completeStops: true,
    });
  });

  test('parses CLI values in both --key value and --key=value form', () => {
    const { ok, options } = parseArgs([
      ...LIVE, '--direction=drop', '--interval-ms', '500', '--speed-mps=12.5',
      '--disconnect-at', '3', '--reconnect-after-ms=4000', '--base-url', 'http://192.168.1.20:5000/',
      '--no-complete', '--end-trip',
    ]);
    expect(ok).toBe(true);
    expect(options).toMatchObject({
      phone: '9000000001',
      password: '111111',
      direction: 'DROP',
      intervalMs: 500,
      speedMps: 12.5,
      disconnectAt: 3,
      reconnectAfterMs: 4000,
      baseUrl: 'http://192.168.1.20:5000',
      completeStops: false,
      endTrip: true,
    });
  });

  test('reads env fallbacks, with CLI taking precedence', () => {
    const env = { SIM_PHONE: '9000000002', SIM_PASSWORD: '222222', SIM_DIRECTION: 'DROP', SIM_INTERVAL_MS: '750' };
    const { ok, options } = parseArgs(['--interval-ms', '900'], env);
    expect(ok).toBe(true);
    expect(options).toMatchObject({ phone: '9000000002', password: '222222', direction: 'DROP', intervalMs: 900 });
  });

  test('rejects invalid values and unknown options', () => {
    const { ok, errors } = parseArgs([
      ...LIVE, '--direction', 'SIDEWAYS', '--interval-ms', '10', '--speed-mps', '0',
      '--disconnect-at', '0', '--stops', '91,0', '--bogus', '--accuracy', '150',
    ]);
    expect(ok).toBe(false);
    const all = errors.join('\n');
    for (const fragment of ['--direction', '--interval-ms', '--speed-mps', '--disconnect-at', '--stops', '--bogus', '--accuracy']) {
      expect(all).toContain(fragment);
    }
  });

  test('refuses a non-local base URL unless --allow-remote is given', () => {
    const remote = [...LIVE, '--base-url', 'https://api.example.com'];
    const refused = parseArgs(remote);
    expect(refused.ok).toBe(false);
    expect(refused.errors.join('\n')).toMatch(/allow-remote/);
    expect(parseArgs([...remote, '--allow-remote']).ok).toBe(true);
  });

  test('a dry run needs no phone, password or local URL', () => {
    const { ok, options } = parseArgs(['--dry-run', '--base-url', 'https://api.example.com', '--stops', '1,2;1.001,2.001', '--school', '1.002,2.002']);
    expect(ok).toBe(true);
    expect(options.dryRun).toBe(true);
    expect(options.stops).toEqual([{ lat: 1, lng: 2 }, { lat: 1.001, lng: 2.001 }]);
    expect(options.school).toEqual({ lat: 1.002, lng: 2.002 });
  });
});

describe('isLocalBaseUrl / parseLatLngList / maskPhone', () => {
  test.each([
    ['http://localhost:5000', true],
    ['http://127.0.0.1:5000', true],
    ['http://[::1]:5000', true],
    ['http://10.0.2.2:5000', true],
    ['http://172.20.1.5:5000', true],
    ['http://192.168.0.10', true],
    ['http://devbox.local:5000', true],
    ['http://172.32.0.1', false],
    ['https://whereismybus.onrender.com', false],
    ['not a url', false],
  ])('%s -> %p', (url, expected) => {
    expect(isLocalBaseUrl(url)).toBe(expected);
  });

  test('parseLatLngList accepts a list and rejects any bad entry', () => {
    expect(parseLatLngList(' 28.6,77.2 ; 28.7,77.3 ;')).toEqual([{ lat: 28.6, lng: 77.2 }, { lat: 28.7, lng: 77.3 }]);
    expect(parseLatLngList('28.6,77.2;oops')).toBeNull();
    expect(parseLatLngList('28.6,181')).toBeNull();
  });

  test('maskPhone keeps only the last four digits', () => {
    expect(maskPhone('+91 90000 01234')).toBe('********1234');
    expect(maskPhone('12')).toBe('****');
  });
});

describe('buildWaypoints', () => {
  const trip = {
    direction: 'PICKUP',
    destName: 'School',
    destLat: 1.01,
    destLng: 2.01,
    stops: [
      { id: 'c', order: 3, name: 'C', lat: 1.003, lng: 2.003, status: 'PENDING' },
      { id: 'a', order: 1, name: 'A', lat: 1.001, lng: 2.001, status: 'COMPLETED' },
      { id: 'b', order: 2, name: 'B', lat: 1.002, lng: 2.002, status: 'ARRIVED' },
      { id: 'd', order: 4, name: 'D', lat: 1.004, lng: 2.004, status: 'SKIPPED' },
    ],
  };

  test('keeps open stops in snapshot order and appends the school on PICKUP', () => {
    const wps = buildWaypoints(trip);
    expect(wps.map((w) => w.tripStopId ?? w.kind)).toEqual(['b', 'c', 'SCHOOL']);
    expect(wps[2]).toMatchObject({ kind: 'SCHOOL', lat: 1.01, lng: 2.01 });
  });

  test('uses the school fallback only when the trip has no destination, and never on DROP', () => {
    const noDest = { ...trip, destLat: null, destLng: null };
    expect(buildWaypoints(noDest).map((w) => w.kind)).toEqual(['STOP', 'STOP']);
    expect(buildWaypoints(noDest, { lat: 5, lng: 6 }).at(-1)).toMatchObject({ kind: 'SCHOOL', lat: 5, lng: 6 });
    expect(buildWaypoints({ ...trip, direction: 'DROP' }, { lat: 5, lng: 6 }).map((w) => w.kind)).toEqual(['STOP', 'STOP']);
  });
});

describe('generateFixes', () => {
  const options = { speedMps: 10, intervalMs: 1000, dwellFixes: 2, accuracy: 10 };
  const waypoints = buildWaypoints(dryRunTrip('PICKUP', [
    { lat: 28.6139, lng: 77.209 },
    { lat: 28.6165, lng: 77.2122 },
    { lat: 28.6201, lng: 77.2148 },
  ]), { lat: 28.6232, lng: 77.2189 });
  const fixes = generateFixes(waypoints, options);

  test('starts on the first waypoint and ends on the last', () => {
    expect(fixes[0]).toMatchObject({ lat: waypoints[0].lat, lng: waypoints[0].lng, waypointIndex: 0 });
    expect(fixes.at(-1)).toMatchObject({ lat: waypoints.at(-1).lat, lng: waypoints.at(-1).lng, kind: 'SCHOOL', speed: 0 });
  });

  test('never moves further than speed * interval between fixes, at evenly spaced offsets', () => {
    const maxStep = (options.speedMps * options.intervalMs) / 1000;
    for (let i = 1; i < fixes.length; i += 1) {
      expect(haversineMeters(fixes[i - 1], fixes[i])).toBeLessThanOrEqual(maxStep * 1.01);
      expect(fixes[i].offsetMs - fixes[i - 1].offsetMs).toBe(options.intervalMs);
    }
  });

  test('dwells at each stop with speed 0 and flags exactly one arrival per stop, in order', () => {
    const arrivals = fixes.filter((f) => f.arrived && f.kind === 'STOP').map((f) => f.tripStopId);
    expect(arrivals).toEqual(['dry-stop-1', 'dry-stop-2', 'dry-stop-3']);
    for (const id of arrivals) {
      const dwell = fixes.filter((f) => f.tripStopId === id);
      expect(dwell).toHaveLength(2);
      expect(dwell.every((f) => f.speed === 0)).toBe(true);
    }
    expect(fixes.filter((f) => f.kind === 'SCHOOL')).toHaveLength(1);
    expect(fixes.filter((f) => f.kind === 'MOVING').every((f) => f.speed === options.speedMps)).toBe(true);
  });

  test('handles empty and single-waypoint routes', () => {
    expect(generateFixes([], options)).toEqual([]);
    const single = generateFixes([{ kind: 'STOP', tripStopId: 's1', lat: 1, lng: 2 }], options);
    expect(single).toHaveLength(2);
    expect(single[1]).toMatchObject({ arrived: true, tripStopId: 's1', heading: 0 });
  });

  test('toPayload builds the driver:location shape', () => {
    const payload = toPayload(fixes[1], 'bus-1', Date.UTC(2026, 0, 1));
    expect(payload).toEqual({
      busId: 'bus-1',
      lat: fixes[1].lat,
      lng: fixes[1].lng,
      recordedAt: '2026-01-01T00:00:00.000Z',
      accuracy: 10,
      speed: fixes[1].speed,
      heading: fixes[1].heading,
    });
  });
});

describe('resumeIndex', () => {
  const moving = (n) => Array.from({ length: n }, () => ({ waypointIndex: null }));
  const fixes = [...moving(5), { waypointIndex: 1 }, ...moving(3)];

  test('skips the movement fixes covered while offline', () => {
    expect(resumeIndex(fixes, 1, 2500, 1000)).toBe(3);
    expect(resumeIndex(fixes, 1, 0, 1000)).toBe(1);
  });

  test('never skips past a waypoint fix or the end', () => {
    expect(resumeIndex(fixes, 1, 60000, 1000)).toBe(5);
    expect(resumeIndex(fixes, 6, 60000, 1000)).toBe(fixes.length);
  });
});

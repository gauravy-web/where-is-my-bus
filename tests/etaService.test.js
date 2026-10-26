// Smoke tests for etaService (task 7.1). Full property/example suites are
// tasks 7.3 and 7.4. OSRM is faked through the injected fetch.
const {
  createEtaService, buildRouteUrl, parseRoute, shouldRecompute,
} = require('../src/services/etaService');

const trip = {
  id: 't1',
  status: 'ACTIVE',
  direction: 'PICKUP',
  destName: 'School',
  destLat: 12.9,
  destLng: 77.9,
  stops: [
    { id: 'ts2', stopId: 's2', order: 2, status: 'PENDING', lat: 12.2, lng: 77.2, name: 'B' },
    { id: 'ts1', stopId: 's1', order: 1, status: 'COMPLETED', lat: 12.1, lng: 77.1, name: 'A' },
    { id: 'ts3', stopId: 's3', order: 3, status: 'PENDING', lat: 12.3, lng: 77.3, name: 'C' },
  ],
};
const fix = { lat: 12.0, lng: 77.0, recordedAt: 1000 };
const okBody = {
  code: 'Ok',
  routes: [{ legs: [{ duration: 60 }, { duration: 30 }, { duration: 120 }], geometry: { type: 'LineString', coordinates: [] } }],
};
const okResponse = (body) => ({ ok: true, status: 200, json: async () => body });

describe('etaService', () => {
  test('buildRouteUrl uses the route service with the fix first and saved order', () => {
    const wps = [{ lat: 1, lng: 2 }, { lat: 3, lng: 4 }];
    expect(buildRouteUrl('http://osrm/', { lat: 0, lng: 9 }, wps))
      .toBe('http://osrm/route/v1/driving/9,0;2,1;4,3?overview=full&geometries=geojson');
    expect(buildRouteUrl('http://osrm', fix, [])).toBeNull();
  });

  test('parseRoute gives cumulative ETAs and keeps the school out of perStop', () => {
    const wps = [{ kind: 'STOP', tripStopId: 'a' }, { kind: 'STOP', tripStopId: 'b' }, { kind: 'SCHOOL' }];
    expect(parseRoute(okBody, wps)).toEqual({
      perStop: [{ tripStopId: 'a', etaSeconds: 60 }, { tripStopId: 'b', etaSeconds: 90 }],
      school: { etaSeconds: 210 },
      geometry: okBody.routes[0].geometry,
    });
    expect(parseRoute({ ...okBody, code: 'NoRoute' }, wps)).toBeNull();
    expect(parseRoute(okBody, wps.slice(0, 2))).toBeNull();
    expect(parseRoute({ code: 'Ok', routes: [{ legs: [{ duration: 1 }, { duration: NaN }, { duration: 1 }] }] }, wps)).toBeNull();
  });

  test('computeEta routes open stops then the school and returns the ETA', async () => {
    const fetch = jest.fn(async () => okResponse(okBody));
    const eta = createEtaService({ fetch, now: () => 5000, osrmUrl: 'http://osrm', logger: null });
    const result = await eta.computeEta(trip, fix);
    expect(fetch.mock.calls[0][0]).toBe(
      'http://osrm/route/v1/driving/77,12;77.2,12.2;77.3,12.3;77.9,12.9?overview=full&geometries=geojson',
    );
    expect(fetch.mock.calls[0][0]).not.toContain('/trip/');
    expect(result.perStop).toEqual([{ tripStopId: 'ts2', etaSeconds: 60 }, { tripStopId: 'ts3', etaSeconds: 90 }]);
    expect(result.school).toEqual({ etaSeconds: 210 });
    expect(result.computedAt).toBe(5000);
  });

  test('breaker opens after 3 failures for 60 s, then recovers', async () => {
    let t = 0;
    let fail = true;
    const fetch = jest.fn(async () => {
      if (fail) throw new Error('down');
      return okResponse(okBody);
    });
    const eta = createEtaService({ fetch, now: () => t, osrmUrl: 'http://osrm', logger: null });
    for (let i = 0; i < 3; i += 1) expect(await eta.computeEta(trip, fix)).toBeNull();
    expect(fetch).toHaveBeenCalledTimes(3);
    t = 59_999;
    expect(await eta.computeEta(trip, fix)).toBeNull();
    expect(fetch).toHaveBeenCalledTimes(3);
    t = 60_000;
    fail = false;
    expect(await eta.computeEta(trip, fix)).not.toBeNull();
    expect(eta.breakerState().failures).toBe(0);
  });

  test('shouldRecompute after 15 s or 100 m', () => {
    const last = { at: 0, lat: 12, lng: 77 };
    expect(shouldRecompute(null, fix, 0)).toBe(true);
    expect(shouldRecompute(last, { lat: 12, lng: 77 }, 14_999)).toBe(false);
    expect(shouldRecompute(last, { lat: 12, lng: 77 }, 15_000)).toBe(true);
    expect(shouldRecompute(last, { lat: 12.001, lng: 77 }, 1000)).toBe(true); // ~111 m
  });
});

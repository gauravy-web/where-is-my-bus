// Fleet snapshot for the Admin "See all buses together" page.
// One read-only query round that joins data the app already stores:
// buses, drivers, conductors, Route (assigned route name), Stop (the saved,
// ordered pickup/drop stops), School, recent Trips, the live location cache
// and the location source. It never changes any data.
//
// Trip status per bus:
//   ACTIVE       an ACTIVE trip exists
//   COMPLETED    the latest trip finished within COMPLETED_WINDOW_MS
//   NOT_STARTED  anything else
// Location status (never reports a stale fix as live):
//   LIVE     authoritative source present and last fix <= LIVE_MS old
//   STALE    last fix older than LIVE_MS but <= OFFLINE_MS
//   OFFLINE  no fix, a fix older than OFFLINE_MS, or no available source

const LIVE_MS = 60 * 1000; // same as the client's LIVE_STALE_MS
const OFFLINE_MS = 10 * 60 * 1000;
const COMPLETED_WINDOW_MS = 12 * 60 * 60 * 1000;
const TRIP_LOOKBACK_MS = 48 * 60 * 60 * 1000;

const text = (v) => (v === undefined || v === null ? '' : String(v).trim());
const isCoord = (lat, lng) =>
  Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180
  && !(lat === 0 && lng === 0);

const toMs = (v) => {
  if (v === null || v === undefined || v === '') return null;
  const n = v instanceof Date ? v.getTime() : typeof v === 'number' ? v : Date.parse(v);
  return Number.isFinite(n) ? n : null;
};

function locationStatusOf(source, recordedAtMs, nowMs) {
  if (source === 'NONE' || recordedAtMs === null || recordedAtMs === undefined) return 'OFFLINE';
  const age = nowMs - recordedAtMs;
  if (age <= LIVE_MS) return 'LIVE';
  if (age <= OFFLINE_MS) return 'STALE';
  return 'OFFLINE';
}

const person = (p) => (p ? { id: p.id, name: p.name, phone: p.phone || null } : null);

function stopList(stops, busId, direction) {
  return stops
    .filter((s) => text(s.busId) === busId && (s.direction || 'PICKUP') === direction && isCoord(s.lat, s.lng))
    .sort((a, b) => ((Number(a.order) || 0) - (Number(b.order) || 0)) || text(a.id).localeCompare(text(b.id)))
    .map((s, i) => ({ id: s.id, name: text(s.name) || `Stop ${i + 1}`, lat: s.lat, lng: s.lng, seq: i + 1 }));
}

async function buildFleet({ prisma, locationService, locationSource, now = () => Date.now() }) {
  const nowMs = now();
  const [buses, drivers, conductors, routes, stops, school, trips] = await Promise.all([
    prisma.bus.findMany({ orderBy: { busNo: 'asc' } }),
    prisma.driver.findMany(),
    prisma.conductor.findMany(),
    prisma.route.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.stop.findMany({ where: { needsLocation: false } }),
    prisma.school.findFirst(),
    prisma.trip.findMany({
      where: { startedAt: { gte: new Date(nowMs - TRIP_LOOKBACK_MS) } },
      orderBy: { startedAt: 'desc' },
    }),
  ]);

  const firstBy = (rows, busId) => rows.find((r) => text(r.busId) === busId) || null;
  const tripsByBus = new Map();
  trips.forEach((t) => {
    const k = text(t.busId);
    if (!tripsByBus.has(k)) tripsByBus.set(k, []);
    tripsByBus.get(k).push(t);
  });

  const out = buses.map((bus) => {
    const busId = text(bus.id);
    const busTrips = tripsByBus.get(busId) || [];
    const active = busTrips.find((t) => t.status === 'ACTIVE') || null;
    const latestTrip = busTrips[0] || null;

    let tripStatus = 'NOT_STARTED';
    let trip = null;
    if (active) {
      tripStatus = 'ACTIVE';
      trip = active;
    } else if (latestTrip && latestTrip.status === 'COMPLETED') {
      const ended = toMs(latestTrip.endedAt);
      if (ended !== null && nowMs - ended <= COMPLETED_WINDOW_MS) {
        tripStatus = 'COMPLETED';
        trip = latestTrip;
      }
    }

    // Latest fix: the live cache first, else the last position stored on the trip.
    let location = null;
    const fix = locationService.getLatest(busId);
    if (fix && isCoord(fix.lat, fix.lng) && toMs(fix.recordedAt) !== null) {
      location = {
        lat: fix.lat, lng: fix.lng,
        speed: Number.isFinite(fix.speed) ? fix.speed : null,
        heading: Number.isFinite(fix.heading) ? fix.heading : null,
        recordedAt: new Date(toMs(fix.recordedAt)).toISOString(),
      };
    } else {
      const t = busTrips.find((x) => isCoord(x.lastLat, x.lastLng) && toMs(x.lastLocationAt) !== null);
      if (t) {
        location = {
          lat: t.lastLat, lng: t.lastLng,
          speed: Number.isFinite(t.lastSpeed) ? t.lastSpeed : null,
          heading: Number.isFinite(t.lastHeading) ? t.lastHeading : null,
          recordedAt: new Date(toMs(t.lastLocationAt)).toISOString(),
        };
      }
    }

    const src = locationSource.describe(busId, { bus, latestRecordedAt: location ? location.recordedAt : null });
    const route = firstBy(routes, busId);

    return {
      busId,
      busNo: text(bus.busNo) || busId,
      label: bus.label || null,
      driver: person(firstBy(drivers, busId)),
      conductor: person(firstBy(conductors, busId)),
      route: route ? { id: route.id, name: route.name, startPoint: route.startPoint, endPoint: route.endPoint || null } : null,
      pickupStops: stopList(stops, busId, 'PICKUP'),
      dropStops: stopList(stops, busId, 'DROP'),
      tripStatus,
      tripDirection: trip ? trip.direction : null,
      tripStartedAt: trip && trip.startedAt ? new Date(trip.startedAt).toISOString() : null,
      tripEndedAt: trip && trip.endedAt ? new Date(trip.endedAt).toISOString() : null,
      location,
      locationMode: src.locationMode,
      locationSource: src.locationSource,
      locationStatus: locationStatusOf(src.locationSource, location ? toMs(location.recordedAt) : null, nowMs),
    };
  });

  const schoolPoint = school && isCoord(school.lat, school.lng)
    ? { name: text(school.name) || 'School', lat: school.lat, lng: school.lng }
    : null;

  return { serverTime: new Date(nowMs).toISOString(), school: schoolPoint, buses: out };
}

module.exports = {
  buildFleet,
  locationStatusOf,
  LIVE_MS,
  OFFLINE_MS,
  COMPLETED_WINDOW_MS,
};

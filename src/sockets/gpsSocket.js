// Socket_Gateway: authenticated Socket.IO handlers (Requirement 4).
// - Handshake must carry a valid JWT (auth.token or Authorization: Bearer).
// - Rooms come from accessService.roomsForUser; legacy join events are only
//   honored when the user is authorized for the requested room.
// - Location/trip/SOS events are accepted only from the DRIVER assigned to
//   the bus; anything else gets an 'error' event and is discarded.
//
// Dependencies are injectable for tests:
//   const { createGpsSocket } = require('../src/sockets/gpsSocket');
//   createGpsSocket({ prisma: fakePrisma, accessService, sendMulticast, getJwtSecret,
//                     locationService, tripService, now })(io);
// server.js keeps calling `gpsSocket(io)` with the real defaults.
const jwt = require('jsonwebtoken');

const { toIngestFix } = require('../services/locationService');
const { tripState } = require('../services/tripService');
const { busRoom } = require('../services/accessService');

const FORBIDDEN = { code: 'FORBIDDEN', message: 'forbidden' };

// 'bus_<id>' -> '<id>', anything else -> null.
const busIdOfRoom = (room) => {
  const prefix = busRoom('');
  return typeof room === 'string' && room.startsWith(prefix) && room.length > prefix.length
    ? room.slice(prefix.length)
    : null;
};

// Location_Service emitter: every event goes to the bus room and `admins`
// (Requirement 7.9). Arrival `trip:state` events are reshaped to the common
// tripState shape so clients see one payload for every trip:state.
const createRoomEmitter = (io) => (event, busId, payload) => {
  const out = event === 'trip:state' ? tripState(busId, payload && payload.trip) : payload;
  io.to(busRoom(busId)).emit(event, out);
  io.to('admins').emit(event, out);
};

// Token from handshake auth, falling back to an Authorization: Bearer header.
const extractToken = (handshake) => {
  const authToken = handshake?.auth?.token;
  if (typeof authToken === 'string' && authToken.trim()) return authToken.trim();
  const header = handshake?.headers?.authorization;
  if (typeof header === 'string') {
    const match = header.match(/^Bearer\s+(.+)$/i);
    if (match && match[1].trim()) return match[1].trim();
  }
  return null;
};

function createGpsSocket(deps = {}) {
  const getPrisma = () => deps.prisma || require('../db');
  const getAccess = () => deps.accessService || require('../services/accessService');
  const getSendMulticast = () =>
    deps.sendMulticast || require('../services/notificationService').sendMulticast;
  const getJwtSecret = deps.getJwtSecret || (() => require('../config/env').getConfig().JWT_SECRET);
  // Object or zero-arg getter; defaults to the shared Location_Service.
  const getLocation = () => {
    const svc = typeof deps.locationService === 'function' ? deps.locationService() : deps.locationService;
    return svc || require('../services/locationService');
  };
  const getTrips = () => deps.tripService || require('../services/tripService');
  const now = deps.now || (() => Date.now());

  // ── Helper: sirf usi bus ke students ke parents ke FCM tokens lao ──
  const getParentTokensForBus = async (busId) => {
    try {
      const rows = await getPrisma().$queryRaw`
        SELECT DISTINCT u."fcmToken"
        FROM "Student" s
        JOIN "User" u ON u.phone = s."parentPhone"
        WHERE s."busId" = ${busId} AND u."fcmToken" IS NOT NULL
      `;
      return rows.map(r => r.fcmToken).filter(Boolean);
    } catch (err) {
      console.log('getParentTokensForBus error:', err.message);
      return [];
    }
  };

  const getAdminTokens = async () => {
    const admins = await getPrisma().user.findMany({
      where: { role: 'ADMIN', fcmToken: { not: null } }
    });
    return admins.map(a => a.fcmToken).filter(Boolean);
  };

  return (io) => {
    // ── Handshake auth: verify JWT, resolve rooms and the driver's bus ──
    // Resolving here (before 'connection') means rooms and socket.data.busId
    // are ready before any client event can arrive.
    io.use(async (socket, next) => {
      const token = extractToken(socket.handshake);
      if (!token) return next(new Error('unauthorized'));

      let user;
      try {
        user = jwt.verify(token, getJwtSecret());
      } catch (err) {
        return next(new Error('unauthorized'));
      }
      if (!user || typeof user !== 'object' || !user.role) {
        return next(new Error('unauthorized'));
      }

      try {
        const access = getAccess();
        socket.data.user = user;
        socket.data.rooms = await access.roomsForUser(user);
        if (user.role === 'DRIVER') {
          const driver = await access.getDriverForUser(user);
          socket.data.busId = driver?.busId || null;
        }
        return next();
      } catch (err) {
        console.log('Socket auth lookup error:', err.message);
        return next(new Error('unavailable'));
      }
    });

    io.on('connection', (socket) => {
      const user = socket.data.user;
      console.log('Client connected:', socket.id, user.role);

      for (const room of socket.data.rooms || []) socket.join(room);

      const forbid = () => socket.emit('error', FORBIDDEN);

      // Requirement 8.4: send the current trip state of a joined bus. A
      // reconnect is a new connection, so it gets fresh states too.
      const sendTripState = async (busId) => {
        try {
          const trips = getTrips();
          const trip = await trips.getCurrentTrip(busId);
          socket.emit('trip:state', tripState(busId, trip));
        } catch (err) {
          console.log(`trip:state on join failed for bus ${busId}:`, err.message);
        }
      };
      for (const room of socket.data.rooms || []) {
        const busId = busIdOfRoom(room);
        if (busId) sendTripState(busId);
      }

      // Returns the bus id this socket may act for, or null (and emits error).
      // Only a DRIVER assigned to the bus qualifies; an omitted busId means
      // the driver's own assigned bus.
      const authorizeDriverBus = (data) => {
        const assigned = socket.data.busId;
        if (user.role !== 'DRIVER' || !assigned) {
          forbid();
          return null;
        }
        const requested = data && data.busId;
        if (requested !== undefined && requested !== null && requested !== '' &&
            String(requested) !== String(assigned)) {
          forbid();
          return null;
        }
        return assigned;
      };

      // ── Legacy: join a bus room, only if Access_Service allows it ──
      socket.on('joinBus', async (data) => {
        const busId = data && data.busId;
        try {
          if (!busId || !(await getAccess().canViewBus(user, busId))) return forbid();
          socket.join(`bus_${busId}`);
          console.log(`${user.role} ${socket.id} joined room: bus_${busId}`);
          await sendTripState(String(busId));
        } catch (err) {
          console.log('joinBus error:', err.message);
          forbid();
        }
      });

      // ── Legacy: DRIVER joins only their assigned bus room ──
      socket.on('joinAsDriver', (data) => {
        const busId = data && data.busId;
        if (user.role !== 'DRIVER' || !busId || !socket.data.busId ||
            String(busId) !== String(socket.data.busId)) {
          return forbid();
        }
        socket.join(`bus_${socket.data.busId}`);
        console.log(`Driver ${socket.id} joined room: bus_${socket.data.busId}`);
        sendTripState(String(socket.data.busId));
      });

      // ── Legacy: ADMIN joins the admins room ──
      const joinAdmin = () => {
        if (user.role !== 'ADMIN') return forbid();
        socket.join('admins');
        console.log(`Admin ${socket.id} joined admins room`);
      };
      socket.on('joinAsAdmin', joinAdmin);
      socket.on('joinAdmin', joinAdmin);

      // ── Driver GPS → Location_Service.ingest (Requirement 7) ──
      // Validation, throttled persistence, the bus:location + legacy
      // locationUpdate broadcast (bus room + admins) and arrival detection
      // all happen in ingest. Dropped fixes are silently discarded.
      const handleLocation = async (data) => {
        const busId = authorizeDriverBus(data);
        if (!busId) return;
        try {
          const fix = toIngestFix(data, now());
          const result = await getLocation().ingest(busId, fix);
          if (!result.accepted) return;

          // Speed alert — 60+ km/h pe sirf admin ko notify karo
          const kmh = Math.round(Number(fix.speed) * 3.6);
          if (kmh > 60) {
            getAdminTokens().then(adminTokens => {
              if (adminTokens.length > 0) {
                getSendMulticast()(
                  adminTokens,
                  '⚠️ Speed Alert!',
                  `Bus ${busId} overspeeding — ${kmh} km/h`,
                  { busId, type: 'SPEED_ALERT', speed: String(kmh) }
                ).catch(err => console.log('Speed alert error:', err.message));
              }
            }).catch(err => console.log('Admin token error:', err.message));
          }
        } catch (err) {
          console.log('GPS Error:', err.message);
        }
      };
      socket.on('sendLocation', handleLocation);
      socket.on('driver:location', handleLocation);

      // ── Driver trip start karta hai ──
      socket.on('startTrip', async (data) => {
        const busId = authorizeDriverBus(data);
        if (!busId) return;
        try {
          await getPrisma().bus.update({
            where: { id: busId },
            data: { status: 'ON_TRIP' }
          });

          // ✅ Sirf isi bus ke students ke parents ko notify karo
          const tokens = await getParentTokensForBus(busId);
          if (tokens.length > 0) {
            await getSendMulticast()(
              tokens,
              '🚌 Bus Trip Started!',
              `Aapki bus ne apna safar shuru kar diya.`,
              { busId, type: 'TRIP_STARTED' }
            );
          }

          io.to(`bus_${busId}`).emit('tripStarted', { busId });
          io.to('admins').emit('tripStarted', { busId });
          console.log(`Trip started: Bus ${busId}`);
        } catch (err) {
          console.log('Start trip error:', err.message);
        }
      });

      // ── Driver trip end karta hai ──
      socket.on('endTrip', async (data) => {
        const busId = authorizeDriverBus(data);
        if (!busId) return;
        try {
          await getPrisma().bus.update({
            where: { id: busId },
            data: { status: 'ACTIVE' }
          });

          const tokens = await getParentTokensForBus(busId);
          if (tokens.length > 0) {
            await getSendMulticast()(
              tokens,
              '✅ Trip Ended',
              `Aapki bus ka safar khatam ho gaya.`,
              { busId, type: 'TRIP_ENDED' }
            );
          }

          io.to(`bus_${busId}`).emit('tripEnded', { busId });
          io.to('admins').emit('tripEnded', { busId });
          console.log(`Trip ended: Bus ${busId}`);
        } catch (err) {
          console.log('End trip error:', err.message);
        }
      });

      // ── SOS Emergency — sirf isi bus ke parents + admin ko ──
      socket.on('sos', async (data) => {
        const busId = authorizeDriverBus(data);
        if (!busId) return;
        const { driverName, lat, lng } = data || {};
        console.log('SOS triggered:', busId);

        try {
          // Database mein save emergency log
          getPrisma().emergency.create({
            data: { busId, driverName: driverName || 'Driver', notes: 'SOS Emergency Alert', status: 'open' }
          }).catch(err => console.log('Emergency DB save error:', err.message));

          // Sirf isi bus ke students ke parents ko alert
          const tokens = await getParentTokensForBus(busId);
          if (tokens.length > 0) {
            await getSendMulticast()(
              tokens,
              '🚨 SOS EMERGENCY!',
              `Aapki bus mein emergency! Driver: ${driverName || 'Unknown'}`,
              { busId, type: 'SOS', lat: String(lat), lng: String(lng) }
            );
          }

          // Admins ko bhi alert
          const adminTokens = await getAdminTokens();
          if (adminTokens.length > 0) {
            await getSendMulticast()(
              adminTokens,
              '🚨 SOS EMERGENCY ALERT!',
              `Bus ${busId} — Driver: ${driverName} — Turant action lo!`,
              { busId, type: 'SOS_ADMIN', lat: String(lat), lng: String(lng) }
            );
          }

          // Socket broadcast — sirf isi bus ke room + admins
          const alert = { busId, driverName, lat, lng, timestamp: new Date().toISOString() };
          io.to(`bus_${busId}`).emit('sosAlert', alert);
          io.to('admins').emit('sosAlert', alert);

          console.log(`SOS broadcast done for bus: ${busId} [room: bus_${busId}]`);
        } catch (err) {
          console.log('SOS error:', err.message);
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  };
}

// Default setup used by server.js: gpsSocket(io). Also points the shared
// Location_Service broadcasts (socket and HTTP intake) and the shared ETA
// coordinator's `trip:eta` events at this io, and feeds accepted fixes to the
// ETA coordinator (Requirements 9.6, 9.7). The ETA runs in the background so
// an OSRM call (up to 4 s) never delays location intake.
// Every ETA computation is also handed to the shared Notifier (Requirement
// 10.1). The listener is registered once: a second gpsSocket(io) call
// replaces the previous registration instead of adding another one.
let detachNotifier = null;

function wireNotifier(etaCoordinator) {
  if (detachNotifier) detachNotifier();
  detachNotifier = etaCoordinator.addEtaListener((event) => {
    // Looked up per call so the notifier module is loaded lazily. onEta never
    // rejects; the catch only guards against a replaced implementation.
    const notifier = require('../services/proximityNotifier');
    return Promise.resolve(notifier.onEta(event)).catch((err) =>
      console.log('Notifier onEta error:', err && err.message ? err.message : err));
  });
}

// Requirements 18.5, 18.6: newly recorded Safety_Checks alert the student's
// Linked_Parents. setOnSafetyCheck replaces the previous hook, so calling
// gpsSocket(io) again never sends an alert twice.
function wireSafetyAlerts() {
  require('../services/safetyCheckService').setOnSafetyCheck((check, ctx) =>
    require('../services/safetyAlerts').onSafetyCheck(check, ctx));
}

const gpsSocket = (io) => {
  const emitter = createRoomEmitter(io);
  const locationService = require('../services/locationService');
  const etaCoordinator = require('../services/etaCoordinator');
  locationService.setEmitter(emitter);
  etaCoordinator.setEmitter(emitter);
  locationService.setOnFix((busId, fix, trip) => {
    etaCoordinator.onFix(busId, fix, trip); // never rejects
  });
  wireNotifier(etaCoordinator);
  wireSafetyAlerts();
  return createGpsSocket()(io);
};

module.exports = gpsSocket;
module.exports.gpsSocket = gpsSocket;
module.exports.createGpsSocket = createGpsSocket;
module.exports.createRoomEmitter = createRoomEmitter;
module.exports.extractToken = extractToken;

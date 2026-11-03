// HTTP handlers for GPS devices.
//   POST /api/gps/ingest          device endpoint (X-Device-Id + Bearer secret)
//   /api/gps/overview, /devices…  ADMIN only (protect + requireRole in routes)
// Responses never include credentialHash. The plain secret appears only in the
// create / rotate-credential responses.
const gpsDevices = require('../services/gpsDeviceService');
const locationSource = require('../services/locationSourceService');

const { GpsDeviceError } = gpsDevices;

function sendError(res, err, label) {
  if (err instanceof GpsDeviceError) {
    return res.status(err.status).json({ message: err.message, code: err.code });
  }
  console.error(`[gpsController] ${label} failed:`, err && err.message);
  return res.status(500).json({ message: 'GPS service unavailable' });
}

function bearer(req) {
  const h = req.get('authorization');
  const m = typeof h === 'string' ? h.match(/^Bearer\s+(\S+)$/i) : null;
  return m ? m[1] : null;
}

const ingest = async (req, res) => {
  try {
    const auth = await gpsDevices.authenticate(req.get('x-device-id'), bearer(req), req.ip || '');
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    if (body.busId !== undefined && body.busId !== null && String(body.busId) !== String(auth.busId)) {
      return res.status(403).json({ message: 'Device is not assigned to this bus', code: 'bus_mismatch' });
    }
    const result = await locationSource.ingestDevice(
      auth.busId,
      auth.deviceId,
      locationSource.normalizeDeviceFix(body),
    );
    if (!result.accepted) {
      if (result.malformed) {
        return res.status(400).json({ message: 'Invalid location fix', reason: result.reason });
      }
      return res.json({ success: true, accepted: false, reason: result.reason });
    }
    return res.json({ success: true, accepted: true, used: result.used, activeSource: result.activeSource });
  } catch (err) {
    return sendError(res, err, 'ingest');
  }
};

const wrap = (label, fn) => async (req, res) => {
  try {
    return res.json({ success: true, ...(await fn(req)) });
  } catch (err) {
    return sendError(res, err, label);
  }
};

const overview = wrap('overview', () => gpsDevices.overview());
const register = async (req, res) => {
  try {
    const out = await gpsDevices.registerDevice(req.body || {});
    return res.status(201).json({ success: true, ...out });
  } catch (err) {
    return sendError(res, err, 'register');
  }
};
const rotate = wrap('rotate', (req) => gpsDevices.rotateCredential(req.params.id));
const revoke = wrap('revoke', (req) => gpsDevices.revoke(req.params.id));
const testConnection = wrap('test', (req) => gpsDevices.test(req.params.id));
const activate = wrap('activate', (req) => gpsDevices.activate(req.params.id));
const deactivate = wrap('deactivate', (req) => gpsDevices.deactivate(req.params.id));
const unlink = wrap('unlink', (req) =>
  gpsDevices.unlink(req.params.id, { deactivate: String(req.query.deactivate) === 'true' }));

module.exports = { ingest, overview, register, rotate, revoke, testConnection, activate, deactivate, unlink };

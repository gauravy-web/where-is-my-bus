const express = require('express');
const router = express.Router();
const c = require('../controllers/gpsController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/requireRole');

// Device endpoint: authenticated by its own revocable credential, not a JWT.
router.post('/ingest', c.ingest);

// Everything below is ADMIN only.
const admin = [protect, requireRole('ADMIN')];
router.get('/overview', ...admin, c.overview);
router.post('/devices', ...admin, c.register);
router.post('/devices/:id/rotate-credential', ...admin, c.rotate);
router.post('/devices/:id/revoke', ...admin, c.revoke);
router.post('/devices/:id/test', ...admin, c.testConnection);
router.post('/devices/:id/activate', ...admin, c.activate);
router.post('/devices/:id/deactivate', ...admin, c.deactivate);
router.delete('/devices/:id', ...admin, c.unlink);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getBusState, getParentState, getAdminLive } = require('../controllers/trackingController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/requireRole');

// State snapshots (Requirements 8.1–8.3). Bus state is authorized per bus in
// the controller via accessService.canViewBus (CONDUCTOR read-only included).
router.get('/bus/:busId/state', protect, getBusState);
router.get('/parent', protect, requireRole('PARENT'), getParentState);
router.get('/admin/live', protect, requireRole('ADMIN'), getAdminLive);

module.exports = router;

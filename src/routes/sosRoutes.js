const express = require('express');
const router = express.Router();
const {
  getSosAlerts,
  createSosAlert,
  updateSosStatus,
  acknowledgeSosAlert,
  resolveSosAlert
} = require('../controllers/sosController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/requireRole');
const { requireBusAccess } = require('../middleware/busAccess');

router.get('/', protect, requireRole('ADMIN'), getSosAlerts);

router.post(
  '/',
  protect,
  requireBusAccess('busId', { from: 'body', roles: ['ADMIN', 'DRIVER'] }),
  createSosAlert,
);

router.patch('/:id', protect, requireRole('ADMIN'), updateSosStatus);
router.post('/:id/acknowledge', protect, requireRole('ADMIN'), acknowledgeSosAlert);
router.post('/:id/resolve', protect, requireRole('ADMIN'), resolveSosAlert);

module.exports = router;

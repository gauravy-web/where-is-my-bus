const express = require('express');
const router = express.Router();
const { getSosAlerts, createSosAlert, updateSosStatus } = require('../controllers/sosController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/requireRole');
const { requireBusAccess } = require('../middleware/busAccess');
router.get('/', protect, requireRole('ADMIN'), getSosAlerts);
// ADMIN or the DRIVER assigned to body.busId.
router.post(
  '/',
  protect,
  requireBusAccess('busId', { from: 'body', roles: ['ADMIN', 'DRIVER'] }),
  createSosAlert,
);
router.patch('/:id', protect, requireRole('ADMIN'), updateSosStatus);
module.exports = router;

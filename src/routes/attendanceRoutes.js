const express = require('express');
const router = express.Router();
const { markAttendance, getAttendance } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/requireRole');
const { requireBusAccess } = require('../middleware/busAccess');
router.get('/', protect, requireRole('ADMIN'), getAttendance);
// ADMIN, the DRIVER, or the CONDUCTOR assigned to body.busId.
router.post(
  '/',
  protect,
  requireBusAccess('busId', { from: 'body', roles: ['ADMIN', 'DRIVER', 'CONDUCTOR'] }),
  markAttendance,
);
module.exports = router;

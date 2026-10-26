const express = require('express');
const router = express.Router();
const { markAttendance, getAttendance } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/requireRole');
const { requireBusAccess } = require('../middleware/busAccess');
router.get('/', protect, requireRole('ADMIN'), getAttendance);
// ADMIN or the DRIVER assigned to body.busId.
router.post(
  '/',
  protect,
  requireBusAccess('busId', { from: 'body', roles: ['ADMIN', 'DRIVER'] }),
  markAttendance,
);
module.exports = router;

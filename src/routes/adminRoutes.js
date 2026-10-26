const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/requireRole');
const {
  getStudents, addStudent, deleteStudent,
  getDrivers, addDriver, deleteDriver,
  getAttendance, markAttendance,
  getEmergencies, addEmergency, deleteEmergency,
} = require('../controllers/adminController');

// Mounted at '/api', so guards are applied per route (never router.use) to
// avoid intercepting unrelated /api/* paths that fall through this router.
const adminOnly = [protect, requireRole('ADMIN')];

// Students
router.get('/students',        ...adminOnly, getStudents);
router.post('/students',       ...adminOnly, addStudent);
router.delete('/students/:id', ...adminOnly, deleteStudent);

// Drivers
router.get('/drivers',         ...adminOnly, getDrivers);
router.post('/drivers',        ...adminOnly, addDriver);
router.delete('/drivers/:id',  ...adminOnly, deleteDriver);

// Attendance (normally served first by attendanceRoutes, which applies
// the ADMIN / assigned-DRIVER rule for POST)
router.get('/attendance',  ...adminOnly, getAttendance);
router.post('/attendance', ...adminOnly, markAttendance);

// Emergency
router.get('/emergencies',         ...adminOnly, getEmergencies);
router.post('/emergencies',        ...adminOnly, addEmergency);
router.delete('/emergencies/:id',  ...adminOnly, deleteEmergency);

module.exports = router;

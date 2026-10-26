const express = require('express');
const router = express.Router();
const {
  getStudents, addStudent, updateStudent, deleteStudent, getStudentsByBus,
} = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/requireRole');
const { requireBusAccess } = require('../middleware/busAccess');

const adminOnly = [protect, requireRole('ADMIN')];

router.get('/', ...adminOnly, getStudents);
router.post('/', ...adminOnly, addStudent);
// Assign or clear the student's drop stop (and optionally pickup stop).
router.put('/:id', ...adminOnly, updateStudent);
router.delete('/:id', ...adminOnly, deleteStudent);
// ADMIN, the DRIVER assigned to the bus, or the CONDUCTOR assigned to the bus
// (needed for safety checks, Requirement 3.9). Parents are excluded so they
// cannot list other families' children on the same bus.
router.get(
  '/bus/:busId',
  protect,
  requireBusAccess('busId', { roles: ['ADMIN', 'DRIVER', 'CONDUCTOR'] }),
  getStudentsByBus,
);

module.exports = router;

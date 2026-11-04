const express = require('express');
const router = express.Router();
const { getMaintenanceLogs, addMaintenanceLog, deleteMaintenanceLog } = require('../controllers/maintenanceController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/requireRole');
router.get('/', protect, requireRole('ADMIN'), getMaintenanceLogs);
router.post('/', protect, requireRole('ADMIN'), addMaintenanceLog);
router.delete('/:id', protect, requireRole('ADMIN'), deleteMaintenanceLog);
module.exports = router;

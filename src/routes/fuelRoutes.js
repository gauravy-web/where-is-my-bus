const express = require('express');
const router = express.Router();
const { getFuelLogs, addFuelLog, deleteFuelLog } = require('../controllers/fuelController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/requireRole');
router.get('/', protect, requireRole('ADMIN'), getFuelLogs);
router.post('/', protect, requireRole('ADMIN'), addFuelLog);
router.delete('/:id', protect, requireRole('ADMIN'), deleteFuelLog);
module.exports = router;

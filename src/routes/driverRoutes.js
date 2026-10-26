const express = require('express');
const router = express.Router();
const {
  getDrivers, getDriverById, createDriver, updateDriver, deleteDriver, assignBus,
} = require('../controllers/driverController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/requireRole');

const adminOnly = [protect, requireRole('ADMIN')];

router.get('/', ...adminOnly, getDrivers);
router.get('/:id', ...adminOnly, getDriverById);
router.post('/', ...adminOnly, createDriver);
router.put('/:id', ...adminOnly, updateDriver);
router.delete('/:id', ...adminOnly, deleteDriver);
router.patch('/:id/assign-bus', ...adminOnly, assignBus);

module.exports = router;

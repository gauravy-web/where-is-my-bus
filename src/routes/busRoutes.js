const express = require('express');
const router = express.Router();
const {
  createBus, getAllBuses, updateBus, deactivateBus, getBusLocation, getBusFullInfo,
  getLiveBuses, updateLocationHttp,
} = require('../controllers/busController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/requireRole');
const { requireBusAccess } = require('../middleware/busAccess');

const adminOnly = [protect, requireRole('ADMIN')];

// IMPORTANT: literal paths like '/live' and '/location' MUST come before any ':id' /
// ':busId' pattern route — otherwise Express treats "live" or "location" as an id
// value and the wrong handler fires.
router.get('/live', ...adminOnly, getLiveBuses);
// Only the DRIVER assigned to body.busId may post its location (Requirement 3.3).
router.post(
  '/location',
  protect,
  requireBusAccess('busId', { from: 'body', roles: ['DRIVER'] }),
  updateLocationHttp,
);

router.get('/', ...adminOnly, getAllBuses);
router.post('/', ...adminOnly, createBus);
router.put('/:id', ...adminOnly, updateBus);
router.delete('/:id', ...adminOnly, deactivateBus);
// Per-bus reads: ADMIN, the assigned DRIVER or CONDUCTOR, or a linked PARENT
// (Requirements 3.7, 3.8, 3.9). CONDUCTOR is rejected on POST /location (3.10).
router.get('/:busId/location', protect, requireBusAccess('busId'), getBusLocation);
router.get('/:busId/full', protect, requireBusAccess('busId'), getBusFullInfo);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  startTrip,
  getCurrentTrip,
  completeStop,
  skipStop,
  cancelStop,
  endTripById,
  endTrip,
  getActiveBuses,
} = require('../controllers/tripController');
const { recordSafetyCheck, undoSafetyCheck } = require('../controllers/safetyCheckController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/requireRole');
const { requireBusAccess } = require('../middleware/busAccess');

// Legacy end { busId } from the old app: ADMIN or the DRIVER assigned to body.busId.
const driverOfBodyBus = requireBusAccess('busId', { from: 'body', roles: ['ADMIN', 'DRIVER'] });

// Trip mutations are DRIVER (plus ADMIN where noted); a CONDUCTOR gets 403
// (Requirement 3.10). The controller checks the driver's own bus.
router.post('/start', protect, requireRole('DRIVER'), startTrip);
router.post('/end', protect, driverOfBodyBus, endTrip);
router.get('/current', protect, requireRole('DRIVER', 'CONDUCTOR', 'ADMIN'), getCurrentTrip);
router.get('/active', protect, requireRole('ADMIN'), getActiveBuses);
router.post('/:id/stops/:tripStopId/complete', protect, requireRole('DRIVER'), completeStop);
router.post('/:id/stops/:tripStopId/skip', protect, requireRole('DRIVER'), skipStop);
router.post('/:id/stops/:tripStopId/cancel', protect, requireRole('ADMIN'), cancelStop);
router.post('/:id/end', protect, requireRole('DRIVER', 'ADMIN'), endTripById);

// Safety checks (Requirement 18): the conductor of the trip's bus, or ADMIN.
// The service checks the conductor's bus assignment.
router.post('/:id/safety-checks', protect, requireRole('CONDUCTOR', 'ADMIN'), recordSafetyCheck);
router.delete('/:id/safety-checks/:checkId', protect, requireRole('CONDUCTOR', 'ADMIN'), undoSafetyCheck);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getStops, getAllStops, createStop, deleteStop, reorderStops,
} = require('../controllers/stopController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/requireRole');
const { requireBusAccess } = require('../middleware/busAccess');

const adminOnly = [protect, requireRole('ADMIN')];

// Literal paths FIRST so they are not swallowed by the '/:busId' catch-all
// below (Express matches routes top to bottom).
router.get('/', ...adminOnly, getAllStops);
router.post('/', ...adminOnly, createStop);
router.patch('/reorder', ...adminOnly, reorderStops); // legacy verb, same handler
router.put('/reorder', ...adminOnly, reorderStops);
// ADMIN, the assigned DRIVER or CONDUCTOR, or a linked PARENT. ?direction=PICKUP|DROP
router.get('/bus/:busId', protect, requireBusAccess('busId'), getStops);
router.delete('/:id', ...adminOnly, deleteStop);

// LEGACY: GET /api/stops/:busId, same access and ?direction= as /bus/:busId.
router.get('/:busId', protect, requireBusAccess('busId'), getStops);

module.exports = router;

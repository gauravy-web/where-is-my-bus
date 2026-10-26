const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/requireRole');
const { requireBusAccess } = require('../middleware/busAccess');
const {
  getRoutes,
  getRouteById,
  getRouteByBus,
  createRoute,
  updateRoute,
  addStopToRoute,
  deleteRouteStop,
  deleteRoute,
} = require('../controllers/routeController');

const adminOnly = [protect, requireRole('ADMIN')];

router.get('/',                 ...adminOnly, getRoutes);
router.get('/bus/:busId',       protect, requireBusAccess('busId'), getRouteByBus);
router.get('/:id',              ...adminOnly, getRouteById);
router.post('/',                ...adminOnly, createRoute);
router.put('/:id',              ...adminOnly, updateRoute);
router.post('/:id/stops',       ...adminOnly, addStopToRoute);
router.delete('/stops/:stopId', ...adminOnly, deleteRouteStop);
router.delete('/:id',           ...adminOnly, deleteRoute);

module.exports = router;

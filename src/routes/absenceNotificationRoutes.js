const express = require('express');
const router = express.Router();
const {
  createNotification,
  cancelNotification,
  getTripNotifications,
  getAdminNotifications,
  getParentNotifications
} = require('../controllers/absenceNotificationController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/requireRole');

// Parent routes
router.post(
  '/',
  protect,
  requireRole('PARENT'),
  createNotification
);

router.delete(
  '/:id',
  protect,
  requireRole('PARENT'),
  cancelNotification
);

router.get(
  '/parent',
  protect,
  requireRole('PARENT'),
  getParentNotifications
);

// Driver routes
router.get(
  '/trip/:tripId',
  protect,
  requireRole('DRIVER'),
  getTripNotifications
);

// Admin routes (must come after specific routes)
router.get(
  '/',
  protect,
  requireRole('ADMIN'),
  getAdminNotifications
);

module.exports = router;

const express = require('express');
const router = express.Router();
const { sendNotification, sendMulticast } = require('../services/notificationService');
const prisma = require('../db');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/requireRole');
const { notInProduction } = require('../middleware/devOnly');

// Token save karo — always for the authenticated user (req.user.id from the
// verified JWT); any phone in the body is ignored (Requirement 3.6).
router.post('/save-token', protect, async (req, res) => {
  try {
    const { fcmToken } = req.body || {};
    if (typeof fcmToken !== 'string' || fcmToken.trim() === '') {
      return res.status(400).json({ message: 'fcmToken required' });
    }
    await prisma.user.update({
      where: { id: req.user.id },
      data: { fcmToken }
    });
    res.json({ success: true, message: 'Token saved!' });
  } catch (err) {
    if (err && err.code === 'P2025') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Notification bhejo — ADMIN only, hidden in production (Requirements 3.4, 3.5)
router.post('/send', notInProduction, protect, requireRole('ADMIN'), async (req, res) => {
  try {
    const { token, title, body } = req.body || {};
    await sendNotification(token, title, body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

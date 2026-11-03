const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getMessages,
  editMessage,
  deleteMessage,
  createAnnouncement,
  getMyGroups,
  markAsRead,
  getUnreadCounts,
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/requireRole');
const { chatRateLimiter } = require('../middleware/rateLimiter');

// Send message to a bus group (with rate limiting)
router.post('/buses/:busId/messages', protect, chatRateLimiter, sendMessage);

// Get message history for a bus group
router.get('/buses/:busId/messages', protect, getMessages);

// Edit a message (within 5 minutes, owner only)
router.patch('/messages/:messageId', protect, editMessage);

// Delete a message (admin only)
router.delete('/messages/:messageId', protect, requireRole('ADMIN'), deleteMessage);

// Create an announcement (admin only)
router.post('/buses/:busId/announcements', protect, requireRole('ADMIN'), createAnnouncement);

// Get user's accessible bus groups
router.get('/my-groups', protect, getMyGroups);

// Mark messages as read for a bus group
router.post('/buses/:busId/mark-read', protect, markAsRead);

// Get unread counts for all user's bus groups
router.get('/unread-counts', protect, getUnreadCounts);

module.exports = router;

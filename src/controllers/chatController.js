const chatService = require('../services/chatService');
const accessService = require('../services/accessService');
const { busRoom } = require('../services/accessService');

/**
 * Send a message to a bus group
 * POST /api/chat/buses/:busId/messages
 */
const sendMessage = async (req, res) => {
  try {
    const { busId } = req.params;
    const { content } = req.body;
    const user = req.user; // From auth middleware

    // Validate authorization
    const hasAccess = await accessService.canViewBus(user, busId);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Validate content
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }
    if (content.length > 500) {
      return res.status(400).json({ message: 'Message exceeds 500 characters' });
    }

    // Create message via service
    const message = await chatService.createMessage({
      busId,
      senderId: user.id,
      senderRole: user.role,
      content: content.trim(),
    });

    // Broadcast via Socket.IO
    if (req.io) {
      req.io.to(busRoom(busId)).emit('chat:message', message);
      req.io.to('admins').emit('chat:message', message);
    }

    // Send FCM notifications (async, don't wait)
    chatService.sendMessageNotifications(busId, message, user.id).catch(err => {
      console.error('FCM notification error:', err);
    });

    res.status(201).json({ success: true, message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

/**
 * Get message history for a bus group
 * GET /api/chat/buses/:busId/messages?page=1&limit=50
 */
const getMessages = async (req, res) => {
  try {
    const { busId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const user = req.user;

    // Validate authorization
    const hasAccess = await accessService.canViewBus(user, busId);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Validate pagination
    const parsedLimit = Math.min(parseInt(limit) || 50, 100);
    const parsedPage = Math.max(parseInt(page) || 1, 1);

    // Fetch messages and announcements
    const { messages, pagination, announcements } = await chatService.getMessages({
      busId,
      page: parsedPage,
      limit: parsedLimit,
    });

    res.json({ success: true, messages, pagination, announcements });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};

/**
 * Edit a message (within 5 minutes, owner only)
 * PATCH /api/chat/messages/:messageId
 */
const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const user = req.user;

    // Validate content
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }
    if (content.length > 500) {
      return res.status(400).json({ message: 'Message exceeds 500 characters' });
    }

    // Edit via service (checks ownership and time limit)
    const updated = await chatService.editMessage({
      messageId,
      userId: user.id,
      content: content.trim(),
    });

    // Broadcast edit
    if (req.io && updated) {
      req.io.to(busRoom(updated.busId)).emit('chat:edited', {
        messageId: updated.id,
        content: updated.content,
        editedAt: updated.editedAt,
      });
      req.io.to('admins').emit('chat:edited', {
        messageId: updated.id,
        content: updated.content,
        editedAt: updated.editedAt,
      });
    }

    res.json({ success: true, message: updated });
  } catch (error) {
    if (error.message === 'MESSAGE_NOT_FOUND') {
      return res.status(404).json({ message: 'Message not found' });
    }
    if (error.message === 'EDIT_FORBIDDEN') {
      return res.status(403).json({ message: 'Cannot edit this message' });
    }
    console.error('Edit message error:', error);
    res.status(500).json({ message: 'Failed to edit message' });
  }
};

/**
 * Delete a message (admin only)
 * DELETE /api/chat/messages/:messageId
 */
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const user = req.user;

    // Admin check is done by middleware (requireRole)
    const deleted = await chatService.deleteMessage({
      messageId,
      adminId: user.id,
    });

    // Broadcast deletion
    if (req.io && deleted) {
      req.io.to(busRoom(deleted.busId)).emit('chat:deleted', {
        messageId: deleted.id,
      });
      req.io.to('admins').emit('chat:deleted', {
        messageId: deleted.id,
      });
    }

    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    if (error.message === 'MESSAGE_NOT_FOUND') {
      return res.status(404).json({ message: 'Message not found' });
    }
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Failed to delete message' });
  }
};

/**
 * Create an announcement (admin only)
 * POST /api/chat/buses/:busId/announcements
 */
const createAnnouncement = async (req, res) => {
  try {
    const { busId } = req.params;
    const { content } = req.body;
    const user = req.user;

    // Validate content
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Announcement cannot be empty' });
    }
    if (content.length > 500) {
      return res.status(400).json({ message: 'Announcement exceeds 500 characters' });
    }

    // Create announcement
    const announcement = await chatService.createMessage({
      busId,
      senderId: user.id,
      senderRole: 'ADMIN',
      content: content.trim(),
      type: 'ANNOUNCEMENT',
    });

    // Broadcast via Socket.IO
    if (req.io) {
      req.io.to(busRoom(busId)).emit('chat:announcement', announcement);
      req.io.to('admins').emit('chat:announcement', announcement);
    }

    // Send FCM notifications
    chatService.sendMessageNotifications(busId, announcement, user.id).catch(err => {
      console.error('FCM notification error:', err);
    });

    res.status(201).json({ success: true, announcement });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ message: 'Failed to create announcement' });
  }
};

/**
 * Get user's accessible bus groups
 * GET /api/chat/my-groups
 */
const getMyGroups = async (req, res) => {
  try {
    const user = req.user;

    let busIds = [];
    
    if (user.role === 'PARENT') {
      const students = await accessService.getParentStudents(user);
      busIds = [...new Set(students.map(s => s.busId).filter(Boolean))];
    } else if (user.role === 'DRIVER') {
      const driver = await accessService.getDriverForUser(user);
      if (driver?.busId) busIds = [driver.busId];
    } else if (user.role === 'CONDUCTOR') {
      const conductor = await accessService.getConductorForUser(user);
      if (conductor?.busId) busIds = [conductor.busId];
    } else if (user.role === 'ADMIN') {
      const buses = await require('../db').bus.findMany({ select: { id: true } });
      busIds = buses.map(b => b.id);
    }

    // Get bus details and unread counts
    const prisma = require('../db');
    const groups = await Promise.all(
      busIds.map(async busId => {
        const bus = await prisma.bus.findUnique({
          where: { id: busId },
          select: { id: true, busNo: true },
        });
        
        const unreadCount = await chatService.getUnreadCount(busId, user.id);
        
        return {
          busId: bus.id,
          busNo: bus.busNo,
          unreadCount,
        };
      })
    );

    res.json({ success: true, groups });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ message: 'Failed to fetch groups' });
  }
};

/**
 * Mark messages as read for a bus group
 * POST /api/chat/buses/:busId/mark-read
 */
const markAsRead = async (req, res) => {
  try {
    const { busId } = req.params;
    const user = req.user;

    const hasAccess = await accessService.canViewBus(user, busId);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await chatService.markAsRead(busId, user.id);

    res.json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Failed to mark messages as read' });
  }
};

/**
 * Get unread counts for all user's bus groups
 * GET /api/chat/unread-counts
 */
const getUnreadCounts = async (req, res) => {
  try {
    const user = req.user;

    let busIds = [];
    
    if (user.role === 'PARENT') {
      const students = await accessService.getParentStudents(user);
      busIds = [...new Set(students.map(s => s.busId).filter(Boolean))];
    } else if (user.role === 'DRIVER') {
      const driver = await accessService.getDriverForUser(user);
      if (driver?.busId) busIds = [driver.busId];
    } else if (user.role === 'CONDUCTOR') {
      const conductor = await accessService.getConductorForUser(user);
      if (conductor?.busId) busIds = [conductor.busId];
    } else if (user.role === 'ADMIN') {
      const prisma = require('../db');
      const buses = await prisma.bus.findMany({ select: { id: true } });
      busIds = buses.map(b => b.id);
    }

    // Get unread counts
    const unreadCounts = {};
    let totalUnread = 0;

    for (const busId of busIds) {
      const count = await chatService.getUnreadCount(busId, user.id);
      unreadCounts[busId] = count;
      totalUnread += count;
    }

    res.json({ success: true, unreadCounts, totalUnread });
  } catch (error) {
    console.error('Get unread counts error:', error);
    res.status(500).json({ message: 'Failed to fetch unread counts' });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  editMessage,
  deleteMessage,
  createAnnouncement,
  getMyGroups,
  markAsRead,
  getUnreadCounts,
};

const prisma = require('../db');
const { busRoom } = require('./accessService');
const { sendMulticast } = require('./notificationService');
const { sanitizeHtml } = require('../utils/sanitizer');

/**
 * Get sender display name based on role
 * Parents: "Name (Child's Parent)"
 * Others: Role-specific name from database
 */
async function getSenderDisplayName(senderId, senderRole) {
  try {
    if (senderRole === 'ADMIN') {
      const admin = await prisma.admin.findUnique({
        where: { id: senderId },
        select: { name: true },
      });
      return admin?.name || 'Admin';
    }

    // For DRIVER, CONDUCTOR, PARENT - need to get user first
    const user = await prisma.user.findUnique({
      where: { id: senderId },
      select: { name: true, phone: true },
    });

    if (!user) return 'User';

    if (senderRole === 'DRIVER') {
      const driver = await prisma.driver.findFirst({
        where: { phone: user.phone },
        select: { name: true },
      });
      return driver?.name || user.name || 'Driver';
    }

    if (senderRole === 'CONDUCTOR') {
      const conductor = await prisma.conductor.findFirst({
        where: { phone: user.phone },
        select: { name: true },
      });
      return conductor?.name || user.name || 'Conductor';
    }

    if (senderRole === 'PARENT') {
      // Find first child to create "Parent (Child's Parent)" format
      const normalizePhone = (p) => {
        if (!p) return '';
        const digits = String(p).replace(/\D/g, '');
        return digits.slice(-10);
      };

      const phone = normalizePhone(user.phone);
      const students = await prisma.student.findMany();
      const child = students.find(
        s => normalizePhone(s.parentPhone) === phone || normalizePhone(s.parentPhone2) === phone
      );

      if (user && child) {
        return `${user.name || 'Parent'} (${child.name}'s Parent)`;
      }
      return user.name || 'Parent';
    }

    return user.name || 'User';
  } catch (error) {
    console.error('getSenderDisplayName error:', error);
    return 'User';
  }
}

/**
 * Create a new message
 */
async function createMessage({ busId, senderId, senderRole, content, type = 'MESSAGE' }) {
  // Sanitize content
  const sanitized = sanitizeHtml(content);

  // Get sender display name
  const senderName = await getSenderDisplayName(senderId, senderRole);

  // Create message
  const message = await prisma.chatMessage.create({
    data: {
      busId,
      senderId,
      senderRole,
      senderName,
      content: sanitized,
      type,
      isPinned: type === 'ANNOUNCEMENT',
    },
  });

  return formatMessage(message);
}

/**
 * Get message history with pagination
 */
async function getMessages({ busId, page, limit }) {
  const skip = (page - 1) * limit;

  // Get regular messages (not deleted, not announcements)
  const [messages, totalCount] = await Promise.all([
    prisma.chatMessage.findMany({
      where: {
        busId,
        type: 'MESSAGE',
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.chatMessage.count({
      where: {
        busId,
        type: 'MESSAGE',
        deletedAt: null,
      },
    }),
  ]);

  // Get active announcements (pinned)
  const announcements = await prisma.chatMessage.findMany({
    where: {
      busId,
      type: 'ANNOUNCEMENT',
      isPinned: true,
      deletedAt: null,
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalPages = Math.ceil(totalCount / limit);

  return {
    messages: messages.reverse().map(formatMessage), // Reverse for chronological order
    pagination: {
      page,
      limit,
      totalMessages: totalCount,
      totalPages,
      hasMore: page < totalPages,
    },
    announcements: announcements.map(formatMessage),
  };
}

/**
 * Edit a message (within 5 minutes, owner only)
 */
async function editMessage({ messageId, userId, content }) {
  const message = await prisma.chatMessage.findUnique({
    where: { id: messageId },
  });

  if (!message) {
    throw new Error('MESSAGE_NOT_FOUND');
  }

  // Check ownership
  if (message.senderId !== userId) {
    throw new Error('EDIT_FORBIDDEN');
  }

  // Check time limit (5 minutes = 300000ms)
  const now = new Date();
  const ageMs = now - message.createdAt;
  if (ageMs > 300000) {
    throw new Error('EDIT_FORBIDDEN');
  }

  // Check if already edited (max 1 edit)
  if (message.editedAt) {
    throw new Error('EDIT_FORBIDDEN');
  }

  // Update message
  const updated = await prisma.chatMessage.update({
    where: { id: messageId },
    data: {
      content: sanitizeHtml(content),
      editedAt: now,
    },
  });

  return formatMessage(updated);
}

/**
 * Delete a message (admin only, soft delete)
 */
async function deleteMessage({ messageId, adminId }) {
  const message = await prisma.chatMessage.findUnique({
    where: { id: messageId },
  });

  if (!message) {
    throw new Error('MESSAGE_NOT_FOUND');
  }

  const updated = await prisma.chatMessage.update({
    where: { id: messageId },
    data: {
      content: '[Message deleted by admin]',
      deletedAt: new Date(),
      deletedBy: adminId,
    },
  });

  return formatMessage(updated);
}

/**
 * Get unread count for a user in a bus group
 */
async function getUnreadCount(busId, userId) {
  // Get last read timestamp
  const readStatus = await prisma.chatReadStatus.findUnique({
    where: {
      busId_userId: { busId, userId },
    },
  });

  const lastReadAt = readStatus?.lastReadAt || new Date(0);

  // Count unread messages
  const count = await prisma.chatMessage.count({
    where: {
      busId,
      createdAt: { gt: lastReadAt },
      senderId: { not: userId },
      deletedAt: null,
    },
  });

  return count;
}

/**
 * Mark all messages as read for a user in a bus group
 */
async function markAsRead(busId, userId) {
  await prisma.chatReadStatus.upsert({
    where: {
      busId_userId: { busId, userId },
    },
    create: {
      busId,
      userId,
      lastReadAt: new Date(),
    },
    update: {
      lastReadAt: new Date(),
    },
  });
}

/**
 * Send FCM notifications for new message
 */
async function sendMessageNotifications(busId, message, senderId) {
  try {
    // Get FCM tokens for bus members (exclude sender)
    const students = await prisma.student.findMany({
      where: { busId },
      select: { parentPhone: true, parentPhone2: true },
    });

    const parentPhones = new Set();
    students.forEach(s => {
      if (s.parentPhone) parentPhones.add(s.parentPhone);
      if (s.parentPhone2) parentPhones.add(s.parentPhone2);
    });

    const parentTokens = await prisma.user.findMany({
      where: {
        phone: { in: Array.from(parentPhones) },
        fcmToken: { not: null },
        id: { not: senderId }, // Exclude sender
      },
      select: { fcmToken: true },
    });

    // Get driver token
    const driver = await prisma.driver.findFirst({
      where: { busId },
      select: { phone: true },
    });

    let driverToken = null;
    if (driver?.phone) {
      const driverUser = await prisma.user.findFirst({
        where: { phone: driver.phone, fcmToken: { not: null }, id: { not: senderId } },
        select: { fcmToken: true },
      });
      driverToken = driverUser?.fcmToken;
    }

    // Get conductor token
    const conductor = await prisma.conductor.findFirst({
      where: { busId },
      select: { phone: true },
    });

    let conductorToken = null;
    if (conductor?.phone) {
      const conductorUser = await prisma.user.findFirst({
        where: { phone: conductor.phone, fcmToken: { not: null }, id: { not: senderId } },
        select: { fcmToken: true },
      });
      conductorToken = conductorUser?.fcmToken;
    }

    // Combine tokens
    const tokens = [
      ...parentTokens.map(p => p.fcmToken),
      driverToken,
      conductorToken,
    ].filter(Boolean);

    if (tokens.length === 0) return;

    // Get bus number for notification
    const bus = await prisma.bus.findUnique({
      where: { id: busId },
      select: { busNo: true },
    });

    // Send notification
    const preview = message.content.substring(0, 50) + (message.content.length > 50 ? '...' : '');
    
    await sendMulticast(
      tokens,
      `Bus ${bus?.busNo || ''} Chat`,
      `${message.senderName}: ${preview}`,
      {
        type: 'CHAT',
        busId,
        messageId: message.id,
      }
    );
  } catch (error) {
    console.error('Send message notifications error:', error);
    // Don't throw - notifications are non-critical
  }
}

/**
 * Format message for API response
 */
function formatMessage(message) {
  return {
    id: message.id,
    busId: message.busId,
    senderId: message.senderId,
    senderRole: message.senderRole,
    senderName: message.senderName,
    content: message.content,
    type: message.type,
    createdAt: message.createdAt.toISOString(),
    editedAt: message.editedAt?.toISOString() || null,
    isPinned: message.isPinned,
    isDeleted: !!message.deletedAt,
  };
}

module.exports = {
  createMessage,
  getMessages,
  editMessage,
  deleteMessage,
  getUnreadCount,
  markAsRead,
  sendMessageNotifications,
  getSenderDisplayName,
};

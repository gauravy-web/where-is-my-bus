const request = require('supertest');
const express = require('express');
const chatRoutes = require('../src/routes/chatRoutes');
const chatService = require('../src/services/chatService');
const accessService = require('../src/services/accessService');

// Mock dependencies
jest.mock('../src/services/chatService');
jest.mock('../src/services/accessService', () => ({
  canViewBus: jest.fn(),
  busRoom: jest.fn((busId) => `bus_${busId}`),
}));

// Mock auth middleware
jest.mock('../src/middleware/authMiddleware', () => ({
  protect: (req, res, next) => {
    req.user = {
      id: 'admin-123',
      role: 'ADMIN',
    };
    next();
  },
}));

// Mock rate limiter
jest.mock('../src/middleware/rateLimiter', () => ({
  chatRateLimiter: (req, res, next) => next(),
}));

// Mock requireRole middleware
jest.mock('../src/middleware/requireRole', () => ({
  requireRole: () => (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
      next();
    } else {
      res.status(403).json({ message: 'Forbidden' });
    }
  },
}));

/**
 * Integration tests for deleteMessage endpoint
 * Task 4.4: Implement deleteMessage endpoint (admin only)
 * Requirements: REQ-MSG-008
 */
describe('deleteMessage endpoint', () => {
  let app;
  let mockIo;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock Socket.IO
    mockIo = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };

    app = express();
    app.use(express.json());
    app.use((req, res, next) => {
      req.io = mockIo;
      next();
    });
    app.use('/api/chat', chatRoutes);
  });

  describe('DELETE /api/chat/messages/:messageId', () => {
    it('should delete message successfully as admin', async () => {
      const messageId = 'msg-123';
      const deletedMessage = {
        id: messageId,
        busId: 'bus-456',
        senderId: 'user-789',
        senderRole: 'PARENT',
        senderName: 'John (Alice\'s Parent)',
        content: '[Message deleted by admin]',
        type: 'MESSAGE',
        createdAt: new Date().toISOString(),
        editedAt: null,
        isPinned: false,
        isDeleted: true,
      };

      chatService.deleteMessage.mockResolvedValue(deletedMessage);

      const response = await request(app)
        .delete(`/api/chat/messages/${messageId}`)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Message deleted',
      });

      expect(chatService.deleteMessage).toHaveBeenCalledWith({
        messageId,
        adminId: 'admin-123',
      });

      // Verify Socket.IO broadcast
      expect(mockIo.to).toHaveBeenCalledWith('bus_bus-456');
      expect(mockIo.emit).toHaveBeenCalledWith('chat:deleted', {
        messageId: deletedMessage.id,
      });

      expect(mockIo.to).toHaveBeenCalledWith('admins');
    });

    it('should return 404 when message not found', async () => {
      const messageId = 'nonexistent-msg';

      chatService.deleteMessage.mockRejectedValue(new Error('MESSAGE_NOT_FOUND'));

      const response = await request(app)
        .delete(`/api/chat/messages/${messageId}`)
        .expect(404);

      expect(response.body).toEqual({
        message: 'Message not found',
      });
    });

    it('should broadcast deletion to both bus room and admins room', async () => {
      const messageId = 'msg-123';
      const deletedMessage = {
        id: messageId,
        busId: 'bus-789',
        senderId: 'user-456',
        senderRole: 'DRIVER',
        senderName: 'Driver Name',
        content: '[Message deleted by admin]',
        type: 'MESSAGE',
        createdAt: new Date().toISOString(),
        editedAt: null,
        isPinned: false,
        isDeleted: true,
      };

      chatService.deleteMessage.mockResolvedValue(deletedMessage);

      await request(app)
        .delete(`/api/chat/messages/${messageId}`)
        .expect(200);

      // Verify both rooms received the broadcast
      expect(mockIo.to).toHaveBeenCalledWith('bus_bus-789');
      expect(mockIo.to).toHaveBeenCalledWith('admins');
      expect(mockIo.emit).toHaveBeenCalledTimes(2);
      expect(mockIo.emit).toHaveBeenCalledWith('chat:deleted', {
        messageId: deletedMessage.id,
      });
    });

    it('should handle internal server errors', async () => {
      const messageId = 'msg-123';

      chatService.deleteMessage.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .delete(`/api/chat/messages/${messageId}`)
        .expect(500);

      expect(response.body).toEqual({
        message: 'Failed to delete message',
      });
    });

    it('should successfully delete an announcement', async () => {
      const messageId = 'announce-123';
      const deletedAnnouncement = {
        id: messageId,
        busId: 'bus-456',
        senderId: 'admin-999',
        senderRole: 'ADMIN',
        senderName: 'Admin Name',
        content: '[Message deleted by admin]',
        type: 'ANNOUNCEMENT',
        createdAt: new Date().toISOString(),
        editedAt: null,
        isPinned: true,
        isDeleted: true,
      };

      chatService.deleteMessage.mockResolvedValue(deletedAnnouncement);

      const response = await request(app)
        .delete(`/api/chat/messages/${messageId}`)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Message deleted',
      });

      expect(chatService.deleteMessage).toHaveBeenCalledWith({
        messageId,
        adminId: 'admin-123',
      });
    });

    it('should pass adminId from authenticated user', async () => {
      const messageId = 'msg-123';
      const deletedMessage = {
        id: messageId,
        busId: 'bus-456',
        senderId: 'user-789',
        senderRole: 'PARENT',
        senderName: 'Parent Name',
        content: '[Message deleted by admin]',
        type: 'MESSAGE',
        createdAt: new Date().toISOString(),
        editedAt: null,
        isPinned: false,
        isDeleted: true,
      };

      chatService.deleteMessage.mockResolvedValue(deletedMessage);

      await request(app)
        .delete(`/api/chat/messages/${messageId}`)
        .expect(200);

      // Verify adminId comes from req.user
      expect(chatService.deleteMessage).toHaveBeenCalledWith({
        messageId: 'msg-123',
        adminId: 'admin-123',
      });
    });

    it('should handle deletion when Socket.IO is not available', async () => {
      // Create app without Socket.IO
      const appNoSocket = express();
      appNoSocket.use(express.json());
      appNoSocket.use('/api/chat', chatRoutes);

      const messageId = 'msg-123';
      const deletedMessage = {
        id: messageId,
        busId: 'bus-456',
        senderId: 'user-789',
        senderRole: 'PARENT',
        senderName: 'Parent Name',
        content: '[Message deleted by admin]',
        type: 'MESSAGE',
        createdAt: new Date().toISOString(),
        editedAt: null,
        isPinned: false,
        isDeleted: true,
      };

      chatService.deleteMessage.mockResolvedValue(deletedMessage);

      const response = await request(appNoSocket)
        .delete(`/api/chat/messages/${messageId}`)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Message deleted',
      });

      // Should still work even without Socket.IO
      expect(chatService.deleteMessage).toHaveBeenCalled();
    });

    it('should delete already deleted message (idempotent)', async () => {
      const messageId = 'msg-123';
      const deletedMessage = {
        id: messageId,
        busId: 'bus-456',
        senderId: 'user-789',
        senderRole: 'PARENT',
        senderName: 'Parent Name',
        content: '[Message deleted by admin]',
        type: 'MESSAGE',
        createdAt: new Date().toISOString(),
        editedAt: null,
        isPinned: false,
        isDeleted: true,
      };

      chatService.deleteMessage.mockResolvedValue(deletedMessage);

      // First deletion
      await request(app)
        .delete(`/api/chat/messages/${messageId}`)
        .expect(200);

      // Second deletion (should succeed)
      const response = await request(app)
        .delete(`/api/chat/messages/${messageId}`)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Message deleted',
      });
    });
  });

  describe('Authorization (requireRole middleware)', () => {
    it('should allow admin users to delete messages', async () => {
      const messageId = 'msg-123';
      const deletedMessage = {
        id: messageId,
        busId: 'bus-456',
        senderId: 'user-789',
        senderRole: 'PARENT',
        senderName: 'Parent Name',
        content: '[Message deleted by admin]',
        type: 'MESSAGE',
        createdAt: new Date().toISOString(),
        editedAt: null,
        isPinned: false,
        isDeleted: true,
      };

      chatService.deleteMessage.mockResolvedValue(deletedMessage);

      const response = await request(app)
        .delete(`/api/chat/messages/${messageId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(chatService.deleteMessage).toHaveBeenCalled();
    });
  });
});

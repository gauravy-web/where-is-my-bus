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
      id: 'user-123',
      role: 'PARENT',
      phone: '1234567890',
    };
    next();
  },
}));

// Mock rate limiter
jest.mock('../src/middleware/rateLimiter', () => ({
  chatRateLimiter: (req, res, next) => next(),
}));

// Mock role middleware
jest.mock('../src/middleware/requireRole', () => ({
  requireRole: () => (req, res, next) => next(),
}));

describe('PATCH /api/chat/messages/:messageId - Integration Test', () => {
  let app;
  let mockIo;

  beforeAll(() => {
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PATCH /api/chat/messages/:messageId', () => {
    it('should edit message successfully', async () => {
      const messageId = 'msg-123';
      const updatedMessage = {
        id: messageId,
        busId: 'bus-456',
        senderId: 'user-123',
        senderRole: 'PARENT',
        senderName: 'John (Alice\'s Parent)',
        content: 'Updated message content',
        type: 'MESSAGE',
        createdAt: new Date().toISOString(),
        editedAt: new Date().toISOString(),
        isPinned: false,
        isDeleted: false,
      };

      chatService.editMessage.mockResolvedValue(updatedMessage);

      const response = await request(app)
        .patch(`/api/chat/messages/${messageId}`)
        .send({ content: 'Updated message content' })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: updatedMessage,
      });

      expect(chatService.editMessage).toHaveBeenCalledWith({
        messageId,
        userId: 'user-123',
        content: 'Updated message content',
      });

      // Verify Socket.IO broadcast
      expect(mockIo.to).toHaveBeenCalledWith('bus_bus-456');
      expect(mockIo.emit).toHaveBeenCalledWith('chat:edited', {
        messageId: updatedMessage.id,
        content: updatedMessage.content,
        editedAt: updatedMessage.editedAt,
      });

      expect(mockIo.to).toHaveBeenCalledWith('admins');
    });

    it('should reject empty message content', async () => {
      const messageId = 'msg-123';

      const response = await request(app)
        .patch(`/api/chat/messages/${messageId}`)
        .send({ content: '   ' })
        .expect(400);

      expect(response.body).toEqual({
        message: 'Message cannot be empty',
      });

      expect(chatService.editMessage).not.toHaveBeenCalled();
    });

    it('should reject message exceeding 500 characters', async () => {
      const messageId = 'msg-123';
      const longContent = 'a'.repeat(501);

      const response = await request(app)
        .patch(`/api/chat/messages/${messageId}`)
        .send({ content: longContent })
        .expect(400);

      expect(response.body).toEqual({
        message: 'Message exceeds 500 characters',
      });

      expect(chatService.editMessage).not.toHaveBeenCalled();
    });

    it('should return 404 when message not found', async () => {
      const messageId = 'nonexistent-msg';

      chatService.editMessage.mockRejectedValue(new Error('MESSAGE_NOT_FOUND'));

      const response = await request(app)
        .patch(`/api/chat/messages/${messageId}`)
        .send({ content: 'Updated content' })
        .expect(404);

      expect(response.body).toEqual({
        message: 'Message not found',
      });
    });

    it('should return 403 when edit is forbidden', async () => {
      const messageId = 'msg-123';

      chatService.editMessage.mockRejectedValue(new Error('EDIT_FORBIDDEN'));

      const response = await request(app)
        .patch(`/api/chat/messages/${messageId}`)
        .send({ content: 'Updated content' })
        .expect(403);

      expect(response.body).toEqual({
        message: 'Cannot edit this message',
      });
    });

    it('should trim whitespace from content', async () => {
      const messageId = 'msg-123';
      const updatedMessage = {
        id: messageId,
        busId: 'bus-456',
        senderId: 'user-123',
        senderRole: 'PARENT',
        senderName: 'John (Alice\'s Parent)',
        content: 'Trimmed content',
        type: 'MESSAGE',
        createdAt: new Date().toISOString(),
        editedAt: new Date().toISOString(),
        isPinned: false,
        isDeleted: false,
      };

      chatService.editMessage.mockResolvedValue(updatedMessage);

      await request(app)
        .patch(`/api/chat/messages/${messageId}`)
        .send({ content: '  Trimmed content  ' })
        .expect(200);

      expect(chatService.editMessage).toHaveBeenCalledWith({
        messageId,
        userId: 'user-123',
        content: 'Trimmed content',
      });
    });

    it('should broadcast to both bus room and admins room', async () => {
      const messageId = 'msg-123';
      const updatedMessage = {
        id: messageId,
        busId: 'bus-789',
        senderId: 'user-123',
        senderRole: 'PARENT',
        senderName: 'John (Alice\'s Parent)',
        content: 'Updated message',
        type: 'MESSAGE',
        createdAt: new Date().toISOString(),
        editedAt: new Date().toISOString(),
        isPinned: false,
        isDeleted: false,
      };

      chatService.editMessage.mockResolvedValue(updatedMessage);

      await request(app)
        .patch(`/api/chat/messages/${messageId}`)
        .send({ content: 'Updated message' })
        .expect(200);

      // Verify both rooms received the broadcast
      expect(mockIo.to).toHaveBeenCalledWith('bus_bus-789');
      expect(mockIo.to).toHaveBeenCalledWith('admins');
      expect(mockIo.emit).toHaveBeenCalledTimes(2);
      expect(mockIo.emit).toHaveBeenCalledWith('chat:edited', {
        messageId: updatedMessage.id,
        content: updatedMessage.content,
        editedAt: updatedMessage.editedAt,
      });
    });

    it('should handle internal server errors', async () => {
      const messageId = 'msg-123';

      chatService.editMessage.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .patch(`/api/chat/messages/${messageId}`)
        .send({ content: 'Updated content' })
        .expect(500);

      expect(response.body).toEqual({
        message: 'Failed to edit message',
      });
    });
  });
});

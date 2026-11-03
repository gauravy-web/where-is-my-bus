const request = require('supertest');
const express = require('express');
const chatController = require('../src/controllers/chatController');
const chatService = require('../src/services/chatService');
const accessService = require('../src/services/accessService');

// Mock dependencies
jest.mock('../src/services/chatService');
jest.mock('../src/services/accessService');

describe('chatController - sendMessage', () => {
  let app;

  beforeEach(() => {
    // Setup Express app
    app = express();
    app.use(express.json());

    // Mock auth middleware - set req.user
    app.use((req, res, next) => {
      req.user = { id: 'user123', role: 'PARENT' };
      next();
    });

    // Mock Socket.IO
    app.use((req, res, next) => {
      req.io = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      };
      next();
    });

    // Add the route
    app.post('/api/chat/buses/:busId/messages', chatController.sendMessage);

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('Authorization validation', () => {
    it('should return 403 if user does not have access to the bus', async () => {
      accessService.canViewBus.mockResolvedValue(false);

      const response = await request(app)
        .post('/api/chat/buses/bus123/messages')
        .send({ content: 'Hello' });

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ message: 'Access denied' });
      expect(accessService.canViewBus).toHaveBeenCalledWith(
        { id: 'user123', role: 'PARENT' },
        'bus123'
      );
      expect(chatService.createMessage).not.toHaveBeenCalled();
    });

    it('should proceed if user has access to the bus', async () => {
      accessService.canViewBus.mockResolvedValue(true);
      chatService.createMessage.mockResolvedValue({
        id: 'msg123',
        busId: 'bus123',
        senderId: 'user123',
        senderRole: 'PARENT',
        senderName: 'John (Sarah\'s Parent)',
        content: 'Hello',
        type: 'MESSAGE',
        createdAt: '2025-01-15T10:00:00.000Z',
        editedAt: null,
        isPinned: false,
        isDeleted: false,
      });
      chatService.sendMessageNotifications.mockResolvedValue();

      const response = await request(app)
        .post('/api/chat/buses/bus123/messages')
        .send({ content: 'Hello' });

      expect(response.status).toBe(201);
      expect(accessService.canViewBus).toHaveBeenCalledWith(
        { id: 'user123', role: 'PARENT' },
        'bus123'
      );
    });
  });

  describe('Content validation', () => {
    beforeEach(() => {
      accessService.canViewBus.mockResolvedValue(true);
    });

    it('should return 400 if content is empty string', async () => {
      const response = await request(app)
        .post('/api/chat/buses/bus123/messages')
        .send({ content: '' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Message cannot be empty' });
      expect(chatService.createMessage).not.toHaveBeenCalled();
    });

    it('should return 400 if content is only whitespace', async () => {
      const response = await request(app)
        .post('/api/chat/buses/bus123/messages')
        .send({ content: '   ' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Message cannot be empty' });
      expect(chatService.createMessage).not.toHaveBeenCalled();
    });

    it('should return 400 if content is missing', async () => {
      const response = await request(app)
        .post('/api/chat/buses/bus123/messages')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Message cannot be empty' });
      expect(chatService.createMessage).not.toHaveBeenCalled();
    });

    it('should return 400 if content exceeds 500 characters', async () => {
      const longContent = 'a'.repeat(501);

      const response = await request(app)
        .post('/api/chat/buses/bus123/messages')
        .send({ content: longContent });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Message exceeds 500 characters' });
      expect(chatService.createMessage).not.toHaveBeenCalled();
    });

    it('should accept content with exactly 500 characters', async () => {
      const maxContent = 'a'.repeat(500);
      chatService.createMessage.mockResolvedValue({
        id: 'msg123',
        busId: 'bus123',
        content: maxContent,
      });
      chatService.sendMessageNotifications.mockResolvedValue();

      const response = await request(app)
        .post('/api/chat/buses/bus123/messages')
        .send({ content: maxContent });

      expect(response.status).toBe(201);
      expect(chatService.createMessage).toHaveBeenCalled();
    });

    it('should trim whitespace before validation', async () => {
      chatService.createMessage.mockResolvedValue({
        id: 'msg123',
        busId: 'bus123',
        content: 'Hello',
      });
      chatService.sendMessageNotifications.mockResolvedValue();

      const response = await request(app)
        .post('/api/chat/buses/bus123/messages')
        .send({ content: '  Hello  ' });

      expect(response.status).toBe(201);
      expect(chatService.createMessage).toHaveBeenCalledWith({
        busId: 'bus123',
        senderId: 'user123',
        senderRole: 'PARENT',
        content: 'Hello', // Trimmed
      });
    });
  });

  describe('Message creation', () => {
    beforeEach(() => {
      accessService.canViewBus.mockResolvedValue(true);
    });

    it('should create message with correct parameters', async () => {
      const mockMessage = {
        id: 'msg123',
        busId: 'bus123',
        senderId: 'user123',
        senderRole: 'PARENT',
        senderName: 'John (Sarah\'s Parent)',
        content: 'Hello everyone',
        type: 'MESSAGE',
        createdAt: '2025-01-15T10:00:00.000Z',
        editedAt: null,
        isPinned: false,
        isDeleted: false,
      };

      chatService.createMessage.mockResolvedValue(mockMessage);
      chatService.sendMessageNotifications.mockResolvedValue();

      const response = await request(app)
        .post('/api/chat/buses/bus123/messages')
        .send({ content: 'Hello everyone' });

      expect(response.status).toBe(201);
      expect(chatService.createMessage).toHaveBeenCalledWith({
        busId: 'bus123',
        senderId: 'user123',
        senderRole: 'PARENT',
        content: 'Hello everyone',
      });
    });

    it('should return 201 with message data on success', async () => {
      const mockMessage = {
        id: 'msg123',
        busId: 'bus123',
        senderId: 'user123',
        senderRole: 'PARENT',
        senderName: 'John (Sarah\'s Parent)',
        content: 'Hello',
        type: 'MESSAGE',
        createdAt: '2025-01-15T10:00:00.000Z',
        editedAt: null,
        isPinned: false,
        isDeleted: false,
      };

      chatService.createMessage.mockResolvedValue(mockMessage);
      chatService.sendMessageNotifications.mockResolvedValue();

      const response = await request(app)
        .post('/api/chat/buses/bus123/messages')
        .send({ content: 'Hello' });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        success: true,
        message: mockMessage,
      });
    });
  });

  describe('Socket.IO broadcasting', () => {
    let mockIo;

    beforeEach(() => {
      accessService.canViewBus.mockResolvedValue(true);
      mockIo = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      };
    });

    it('should broadcast to bus room and admins room', async () => {
      const mockMessage = {
        id: 'msg123',
        busId: 'bus123',
        content: 'Hello',
      };

      chatService.createMessage.mockResolvedValue(mockMessage);
      chatService.sendMessageNotifications.mockResolvedValue();

      // Create a new app instance with updated Socket.IO mock
      const testApp = express();
      testApp.use(express.json());
      testApp.use((req, res, next) => {
        req.user = { id: 'user123', role: 'PARENT' };
        req.io = mockIo;
        next();
      });
      testApp.post('/api/chat/buses/:busId/messages', chatController.sendMessage);

      const response = await request(testApp)
        .post('/api/chat/buses/bus123/messages')
        .send({ content: 'Hello' });

      // Verify Socket.IO was called
      expect(response.status).toBe(201);
      expect(mockIo.to).toHaveBeenCalledTimes(2);
      expect(mockIo.emit).toHaveBeenCalledTimes(2);
      expect(mockIo.emit).toHaveBeenCalledWith('chat:message', mockMessage);
      
      // Verify at least one call was to 'admins'
      const calls = mockIo.to.mock.calls;
      expect(calls.some(call => call[0] === 'admins')).toBe(true);
    });

    it('should handle missing Socket.IO gracefully', async () => {
      const mockMessage = {
        id: 'msg123',
        busId: 'bus123',
        content: 'Hello',
      };

      chatService.createMessage.mockResolvedValue(mockMessage);
      chatService.sendMessageNotifications.mockResolvedValue();

      // Create a new app instance without Socket.IO
      const testApp = express();
      testApp.use(express.json());
      testApp.use((req, res, next) => {
        req.user = { id: 'user123', role: 'PARENT' };
        req.io = null;
        next();
      });
      testApp.post('/api/chat/buses/:busId/messages', chatController.sendMessage);

      const response = await request(testApp)
        .post('/api/chat/buses/bus123/messages')
        .send({ content: 'Hello' });

      expect(response.status).toBe(201);
      // Should still succeed even without Socket.IO
    });
  });

  describe('FCM notifications', () => {
    beforeEach(() => {
      accessService.canViewBus.mockResolvedValue(true);
    });

    it('should trigger FCM notifications asynchronously', async () => {
      const mockMessage = {
        id: 'msg123',
        busId: 'bus123',
        senderId: 'user123',
        content: 'Hello',
      };

      chatService.createMessage.mockResolvedValue(mockMessage);
      chatService.sendMessageNotifications.mockResolvedValue();

      const response = await request(app)
        .post('/api/chat/buses/bus123/messages')
        .send({ content: 'Hello' });

      expect(response.status).toBe(201);
      expect(chatService.sendMessageNotifications).toHaveBeenCalledWith(
        'bus123',
        mockMessage,
        'user123'
      );
    });

    it('should not fail request if FCM notification fails', async () => {
      const mockMessage = {
        id: 'msg123',
        busId: 'bus123',
        content: 'Hello',
      };

      chatService.createMessage.mockResolvedValue(mockMessage);
      chatService.sendMessageNotifications.mockRejectedValue(new Error('FCM error'));

      const response = await request(app)
        .post('/api/chat/buses/bus123/messages')
        .send({ content: 'Hello' });

      expect(response.status).toBe(201);
      // Should still succeed even if notifications fail
    });
  });

  describe('Error handling', () => {
    beforeEach(() => {
      accessService.canViewBus.mockResolvedValue(true);
    });

    it('should return 500 if chatService.createMessage throws', async () => {
      chatService.createMessage.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/chat/buses/bus123/messages')
        .send({ content: 'Hello' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: 'Failed to send message' });
    });

    it('should return 500 if accessService.canViewBus throws', async () => {
      accessService.canViewBus.mockRejectedValue(new Error('Auth error'));

      const response = await request(app)
        .post('/api/chat/buses/bus123/messages')
        .send({ content: 'Hello' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: 'Failed to send message' });
    });
  });
});

const request = require('supertest');
const express = require('express');
const chatRoutes = require('../src/routes/chatRoutes');
const chatService = require('../src/services/chatService');
const accessService = require('../src/services/accessService');

// Mock dependencies
jest.mock('../src/services/chatService');
jest.mock('../src/services/accessService');

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

describe('GET /api/chat/buses/:busId/messages - Integration Test', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/chat', chatRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return messages with pagination when user has access', async () => {
    const busId = 'bus-123';
    
    // Mock authorization
    accessService.canViewBus.mockResolvedValue(true);

    // Mock service response
    const mockResponse = {
      messages: [
        {
          id: 'msg-1',
          busId,
          senderId: 'user-1',
          senderRole: 'PARENT',
          senderName: 'John (Amy\'s Parent)',
          content: 'Hello everyone',
          type: 'MESSAGE',
          createdAt: '2025-01-15T10:00:00.000Z',
          editedAt: null,
          isPinned: false,
          isDeleted: false,
        },
        {
          id: 'msg-2',
          busId,
          senderId: 'user-2',
          senderRole: 'DRIVER',
          senderName: 'Driver Mike',
          content: 'On my way',
          type: 'MESSAGE',
          createdAt: '2025-01-15T10:05:00.000Z',
          editedAt: null,
          isPinned: false,
          isDeleted: false,
        },
      ],
      pagination: {
        page: 1,
        limit: 50,
        totalMessages: 2,
        totalPages: 1,
        hasMore: false,
      },
      announcements: [
        {
          id: 'ann-1',
          busId,
          senderId: 'admin-1',
          senderRole: 'ADMIN',
          senderName: 'Admin',
          content: 'Important announcement',
          type: 'ANNOUNCEMENT',
          createdAt: '2025-01-15T09:00:00.000Z',
          editedAt: null,
          isPinned: true,
          isDeleted: false,
        },
      ],
    };

    chatService.getMessages.mockResolvedValue(mockResponse);

    // Make request
    const response = await request(app)
      .get(`/api/chat/buses/${busId}/messages`)
      .expect(200);

    // Verify response
    expect(response.body).toEqual({
      success: true,
      ...mockResponse,
    });

    // Verify service was called correctly
    expect(accessService.canViewBus).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'user-123' }),
      busId
    );

    expect(chatService.getMessages).toHaveBeenCalledWith({
      busId,
      page: 1,
      limit: 50,
    });
  });

  test('should handle custom pagination parameters', async () => {
    const busId = 'bus-123';
    
    accessService.canViewBus.mockResolvedValue(true);
    chatService.getMessages.mockResolvedValue({
      messages: [],
      pagination: {
        page: 2,
        limit: 25,
        totalMessages: 100,
        totalPages: 4,
        hasMore: true,
      },
      announcements: [],
    });

    await request(app)
      .get(`/api/chat/buses/${busId}/messages?page=2&limit=25`)
      .expect(200);

    expect(chatService.getMessages).toHaveBeenCalledWith({
      busId,
      page: 2,
      limit: 25,
    });
  });

  test('should enforce maximum limit of 100', async () => {
    const busId = 'bus-123';
    
    accessService.canViewBus.mockResolvedValue(true);
    chatService.getMessages.mockResolvedValue({
      messages: [],
      pagination: {
        page: 1,
        limit: 100,
        totalMessages: 0,
        totalPages: 0,
        hasMore: false,
      },
      announcements: [],
    });

    await request(app)
      .get(`/api/chat/buses/${busId}/messages?limit=200`)
      .expect(200);

    // Should be capped at 100
    expect(chatService.getMessages).toHaveBeenCalledWith({
      busId,
      page: 1,
      limit: 100,
    });
  });

  test('should enforce minimum page of 1', async () => {
    const busId = 'bus-123';
    
    accessService.canViewBus.mockResolvedValue(true);
    chatService.getMessages.mockResolvedValue({
      messages: [],
      pagination: {
        page: 1,
        limit: 50,
        totalMessages: 0,
        totalPages: 0,
        hasMore: false,
      },
      announcements: [],
    });

    await request(app)
      .get(`/api/chat/buses/${busId}/messages?page=0`)
      .expect(200);

    // Should be set to minimum of 1
    expect(chatService.getMessages).toHaveBeenCalledWith({
      busId,
      page: 1,
      limit: 50,
    });
  });

  test('should return 403 when user does not have access to bus', async () => {
    const busId = 'bus-123';
    
    // Mock authorization failure
    accessService.canViewBus.mockResolvedValue(false);

    const response = await request(app)
      .get(`/api/chat/buses/${busId}/messages`)
      .expect(403);

    expect(response.body).toEqual({
      message: 'Access denied',
    });

    // Service should not be called
    expect(chatService.getMessages).not.toHaveBeenCalled();
  });

  test('should return 500 when service throws error', async () => {
    const busId = 'bus-123';
    
    accessService.canViewBus.mockResolvedValue(true);
    chatService.getMessages.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .get(`/api/chat/buses/${busId}/messages`)
      .expect(500);

    expect(response.body).toEqual({
      message: 'Failed to fetch messages',
    });
  });

  test('should handle invalid pagination parameters gracefully', async () => {
    const busId = 'bus-123';
    
    accessService.canViewBus.mockResolvedValue(true);
    chatService.getMessages.mockResolvedValue({
      messages: [],
      pagination: {
        page: 1,
        limit: 50,
        totalMessages: 0,
        totalPages: 0,
        hasMore: false,
      },
      announcements: [],
    });

    // Invalid parameters should fall back to defaults
    await request(app)
      .get(`/api/chat/buses/${busId}/messages?page=invalid&limit=abc`)
      .expect(200);

    expect(chatService.getMessages).toHaveBeenCalledWith({
      busId,
      page: 1, // Default
      limit: 50, // Default
    });
  });
});

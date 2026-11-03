const request = require('supertest');
const express = require('express');

// Mock dependencies BEFORE importing modules that use them
jest.mock('../src/services/chatService');
jest.mock('../src/services/accessService');
jest.mock('../src/db.js', () => ({
  bus: {
    findMany: jest.fn(),
  },
}));

const chatController = require('../src/controllers/chatController');
const chatService = require('../src/services/chatService');
const accessService = require('../src/services/accessService');
const mockPrisma = require('../src/db.js');

describe('GET /api/chat/unread-counts - Integration Tests', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup Express app
    app = express();
    app.use(express.json());

    // Mock auth middleware - set req.user
    app.use((req, res, next) => {
      req.user = { id: 'user-123', role: 'PARENT' };
      next();
    });

    // Add the route
    app.get('/api/chat/unread-counts', chatController.getUnreadCounts);
  });

  describe('Parent User', () => {
    test('should return unread counts for all buses where parent has children', async () => {
      // Mock parent with children on two buses
      accessService.getParentStudents.mockResolvedValue([
        { id: 'student-1', busId: 'bus-101' },
        { id: 'student-2', busId: 'bus-101' },
        { id: 'student-3', busId: 'bus-202' },
      ]);

      // Mock unread counts
      chatService.getUnreadCount
        .mockResolvedValueOnce(5) // bus-101
        .mockResolvedValueOnce(3); // bus-202

      const response = await request(app)
        .get('/api/chat/unread-counts')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.unreadCounts).toEqual({
        'bus-101': 5,
        'bus-202': 3,
      });
      expect(response.body.totalUnread).toBe(8);

      expect(accessService.getParentStudents).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'user-123', role: 'PARENT' })
      );
      expect(chatService.getUnreadCount).toHaveBeenCalledTimes(2);
      expect(chatService.getUnreadCount).toHaveBeenCalledWith('bus-101', 'user-123');
      expect(chatService.getUnreadCount).toHaveBeenCalledWith('bus-202', 'user-123');
    });

    test('should handle parent with children on same bus (deduplicate busIds)', async () => {
      // Mock parent with two children on the same bus
      accessService.getParentStudents.mockResolvedValue([
        { id: 'student-1', busId: 'bus-101' },
        { id: 'student-2', busId: 'bus-101' },
      ]);

      chatService.getUnreadCount.mockResolvedValue(7);

      const response = await request(app)
        .get('/api/chat/unread-counts')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.unreadCounts).toEqual({
        'bus-101': 7,
      });
      expect(response.body.totalUnread).toBe(7);

      // Should only call getUnreadCount once for the unique bus
      expect(chatService.getUnreadCount).toHaveBeenCalledTimes(1);
    });

    test('should handle parent with no children assigned to buses', async () => {
      // Mock parent with children but no bus assignment
      accessService.getParentStudents.mockResolvedValue([
        { id: 'student-1', busId: null },
        { id: 'student-2', busId: null },
      ]);

      const response = await request(app)
        .get('/api/chat/unread-counts')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.unreadCounts).toEqual({});
      expect(response.body.totalUnread).toBe(0);

      expect(chatService.getUnreadCount).not.toHaveBeenCalled();
    });

    test('should handle parent with no children at all', async () => {
      accessService.getParentStudents.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/chat/unread-counts')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.unreadCounts).toEqual({});
      expect(response.body.totalUnread).toBe(0);
    });
  });

  describe('Driver User', () => {
    beforeEach(() => {
      // Override user role for driver tests
      app = express();
      app.use(express.json());
      app.use((req, res, next) => {
        req.user = { id: 'driver-123', role: 'DRIVER' };
        next();
      });
      app.get('/api/chat/unread-counts', chatController.getUnreadCounts);
    });

    test('should return unread count for driver\'s assigned bus', async () => {
      accessService.getDriverForUser.mockResolvedValue({
        id: 'driver-123',
        busId: 'bus-101',
      });

      chatService.getUnreadCount.mockResolvedValue(12);

      const response = await request(app)
        .get('/api/chat/unread-counts')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.unreadCounts).toEqual({
        'bus-101': 12,
      });
      expect(response.body.totalUnread).toBe(12);

      expect(accessService.getDriverForUser).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'driver-123', role: 'DRIVER' })
      );
      expect(chatService.getUnreadCount).toHaveBeenCalledWith('bus-101', 'driver-123');
    });

    test('should return empty counts for driver with no bus assignment', async () => {
      accessService.getDriverForUser.mockResolvedValue({
        id: 'driver-123',
        busId: null,
      });

      const response = await request(app)
        .get('/api/chat/unread-counts')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.unreadCounts).toEqual({});
      expect(response.body.totalUnread).toBe(0);
    });

    test('should return empty counts when driver record not found', async () => {
      accessService.getDriverForUser.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/chat/unread-counts')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.unreadCounts).toEqual({});
      expect(response.body.totalUnread).toBe(0);
    });
  });

  describe('Conductor User', () => {
    beforeEach(() => {
      // Override user role for conductor tests
      app = express();
      app.use(express.json());
      app.use((req, res, next) => {
        req.user = { id: 'conductor-123', role: 'CONDUCTOR' };
        next();
      });
      app.get('/api/chat/unread-counts', chatController.getUnreadCounts);
    });

    test('should return unread count for conductor\'s assigned bus', async () => {
      accessService.getConductorForUser.mockResolvedValue({
        id: 'conductor-123',
        busId: 'bus-202',
      });

      chatService.getUnreadCount.mockResolvedValue(8);

      const response = await request(app)
        .get('/api/chat/unread-counts')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.unreadCounts).toEqual({
        'bus-202': 8,
      });
      expect(response.body.totalUnread).toBe(8);

      expect(accessService.getConductorForUser).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'conductor-123', role: 'CONDUCTOR' })
      );
    });

    test('should return empty counts for conductor with no bus assignment', async () => {
      accessService.getConductorForUser.mockResolvedValue({
        id: 'conductor-123',
        busId: null,
      });

      const response = await request(app)
        .get('/api/chat/unread-counts')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.unreadCounts).toEqual({});
      expect(response.body.totalUnread).toBe(0);
    });
  });

  describe('Admin User', () => {
    beforeEach(() => {
      // Override user role for admin tests
      app = express();
      app.use(express.json());
      app.use((req, res, next) => {
        req.user = { id: 'admin-123', role: 'ADMIN' };
        next();
      });
      app.get('/api/chat/unread-counts', chatController.getUnreadCounts);
    });

    test('should return unread counts for all buses', async () => {
      mockPrisma.bus.findMany.mockResolvedValue([
        { id: 'bus-101' },
        { id: 'bus-202' },
        { id: 'bus-303' },
      ]);

      chatService.getUnreadCount
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(15);

      const response = await request(app)
        .get('/api/chat/unread-counts')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.unreadCounts).toEqual({
        'bus-101': 5,
        'bus-202': 0,
        'bus-303': 15,
      });
      expect(response.body.totalUnread).toBe(20);

      expect(mockPrisma.bus.findMany).toHaveBeenCalledWith({ select: { id: true } });
      expect(chatService.getUnreadCount).toHaveBeenCalledTimes(3);
    });

    test('should handle system with no buses', async () => {
      mockPrisma.bus.findMany.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/chat/unread-counts')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.unreadCounts).toEqual({});
      expect(response.body.totalUnread).toBe(0);
    });
  });

  describe('Authorization', () => {
    beforeEach(() => {
      // Create app without auth middleware
      app = express();
      app.use(express.json());
      app.get('/api/chat/unread-counts', chatController.getUnreadCounts);
    });

    test('should handle missing req.user gracefully', async () => {
      const response = await request(app)
        .get('/api/chat/unread-counts')
        .expect(500);

      expect(response.body.message).toBe('Failed to fetch unread counts');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      // Setup app with parent user
      app = express();
      app.use(express.json());
      app.use((req, res, next) => {
        req.user = { id: 'user-123', role: 'PARENT' };
        next();
      });
      app.get('/api/chat/unread-counts', chatController.getUnreadCounts);
    });

    test('should return 500 when accessService throws error', async () => {
      accessService.getParentStudents.mockRejectedValue(
        new Error('Database connection failed')
      );

      const response = await request(app)
        .get('/api/chat/unread-counts')
        .expect(500);

      expect(response.body.message).toBe('Failed to fetch unread counts');
    });

    test('should return 500 when chatService throws error', async () => {
      accessService.getParentStudents.mockResolvedValue([
        { id: 'student-1', busId: 'bus-101' },
      ]);

      chatService.getUnreadCount.mockRejectedValue(
        new Error('Failed to calculate unread count')
      );

      const response = await request(app)
        .get('/api/chat/unread-counts')
        .expect(500);

      expect(response.body.message).toBe('Failed to fetch unread counts');
    });
  });

  describe('REQ-NOT-005: Unread Count Tracking', () => {
    beforeEach(() => {
      // Setup app with parent user
      app = express();
      app.use(express.json());
      app.use((req, res, next) => {
        req.user = { id: 'parent-multi', role: 'PARENT' };
        next();
      });
      app.get('/api/chat/unread-counts', chatController.getUnreadCounts);
    });

    test('should correctly calculate totalUnread as sum of all bus unread counts', async () => {
      accessService.getParentStudents.mockResolvedValue([
        { id: 'student-1', busId: 'bus-101' },
        { id: 'student-2', busId: 'bus-202' },
        { id: 'student-3', busId: 'bus-303' },
      ]);

      chatService.getUnreadCount
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(25)
        .mockResolvedValueOnce(5);

      const response = await request(app)
        .get('/api/chat/unread-counts')
        .expect(200);

      expect(response.body.totalUnread).toBe(40); // 10 + 25 + 5
      expect(response.body.unreadCounts).toEqual({
        'bus-101': 10,
        'bus-202': 25,
        'bus-303': 5,
      });
    });
  });
});

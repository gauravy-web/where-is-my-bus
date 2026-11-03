const request = require('supertest');
const express = require('express');
const chatController = require('../src/controllers/chatController');
const accessService = require('../src/services/accessService');
const chatService = require('../src/services/chatService');

// Mock dependencies
jest.mock('../src/services/accessService');
jest.mock('../src/services/chatService');
jest.mock('../src/db', () => ({
  bus: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
}));

describe('ChatController - getMyGroups', () => {
  let app;
  
  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Middleware to inject mock user
    app.use((req, res, next) => {
      req.user = { id: 'test-user-id', role: 'PARENT', phone: '1234567890' };
      next();
    });
    
    app.get('/my-groups', chatController.getMyGroups);
    
    jest.clearAllMocks();
  });

  describe('PARENT role', () => {
    it('should return bus groups for parent with students', async () => {
      const mockStudents = [
        { id: 'student1', name: 'Student 1', busId: 'bus1' },
        { id: 'student2', name: 'Student 2', busId: 'bus2' },
        { id: 'student3', name: 'Student 3', busId: 'bus1' }, // Same bus
      ];

      const prisma = require('../src/db');
      
      accessService.getParentStudents.mockResolvedValue(mockStudents);
      
      prisma.bus.findUnique
        .mockResolvedValueOnce({ id: 'bus1', busNo: '101' })
        .mockResolvedValueOnce({ id: 'bus2', busNo: '102' });
      
      chatService.getUnreadCount
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(0);

      const response = await request(app).get('/my-groups');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.groups).toHaveLength(2);
      expect(response.body.groups).toEqual([
        { busId: 'bus1', busNo: '101', unreadCount: 5 },
        { busId: 'bus2', busNo: '102', unreadCount: 0 },
      ]);
      
      expect(accessService.getParentStudents).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'PARENT' })
      );
    });

    it('should return empty array for parent with no students', async () => {
      accessService.getParentStudents.mockResolvedValue([]);

      const response = await request(app).get('/my-groups');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.groups).toEqual([]);
    });

    it('should filter out students with no bus assignment', async () => {
      const mockStudents = [
        { id: 'student1', name: 'Student 1', busId: 'bus1' },
        { id: 'student2', name: 'Student 2', busId: null },
        { id: 'student3', name: 'Student 3', busId: undefined },
      ];

      const prisma = require('../src/db');
      
      accessService.getParentStudents.mockResolvedValue(mockStudents);
      
      prisma.bus.findUnique.mockResolvedValueOnce({ id: 'bus1', busNo: '101' });
      chatService.getUnreadCount.mockResolvedValueOnce(3);

      const response = await request(app).get('/my-groups');

      expect(response.status).toBe(200);
      expect(response.body.groups).toHaveLength(1);
      expect(response.body.groups[0].busId).toBe('bus1');
    });
  });

  describe('DRIVER role', () => {
    beforeEach(() => {
      app = express();
      app.use(express.json());
      app.use((req, res, next) => {
        req.user = { id: 'driver-id', role: 'DRIVER', phone: '9876543210' };
        next();
      });
      app.get('/my-groups', chatController.getMyGroups);
    });

    it('should return bus group for driver with assigned bus', async () => {
      const mockDriver = { id: 'driver1', phone: '9876543210', busId: 'bus1' };
      const prisma = require('../src/db');
      
      accessService.getDriverForUser.mockResolvedValue(mockDriver);
      prisma.bus.findUnique.mockResolvedValueOnce({ id: 'bus1', busNo: '101' });
      chatService.getUnreadCount.mockResolvedValueOnce(2);

      const response = await request(app).get('/my-groups');

      expect(response.status).toBe(200);
      expect(response.body.groups).toEqual([
        { busId: 'bus1', busNo: '101', unreadCount: 2 },
      ]);
    });

    it('should return empty array for driver with no bus assignment', async () => {
      const mockDriver = { id: 'driver1', phone: '9876543210', busId: null };
      
      accessService.getDriverForUser.mockResolvedValue(mockDriver);

      const response = await request(app).get('/my-groups');

      expect(response.status).toBe(200);
      expect(response.body.groups).toEqual([]);
    });

    it('should return empty array when driver not found', async () => {
      accessService.getDriverForUser.mockResolvedValue(null);

      const response = await request(app).get('/my-groups');

      expect(response.status).toBe(200);
      expect(response.body.groups).toEqual([]);
    });
  });

  describe('CONDUCTOR role', () => {
    beforeEach(() => {
      app = express();
      app.use(express.json());
      app.use((req, res, next) => {
        req.user = { id: 'conductor-id', role: 'CONDUCTOR', phone: '5555555555' };
        next();
      });
      app.get('/my-groups', chatController.getMyGroups);
    });

    it('should return bus group for conductor with assigned bus', async () => {
      const mockConductor = { id: 'conductor1', phone: '5555555555', busId: 'bus2' };
      const prisma = require('../src/db');
      
      accessService.getConductorForUser.mockResolvedValue(mockConductor);
      prisma.bus.findUnique.mockResolvedValueOnce({ id: 'bus2', busNo: '202' });
      chatService.getUnreadCount.mockResolvedValueOnce(7);

      const response = await request(app).get('/my-groups');

      expect(response.status).toBe(200);
      expect(response.body.groups).toEqual([
        { busId: 'bus2', busNo: '202', unreadCount: 7 },
      ]);
    });

    it('should return empty array for conductor with no bus assignment', async () => {
      const mockConductor = { id: 'conductor1', phone: '5555555555', busId: null };
      
      accessService.getConductorForUser.mockResolvedValue(mockConductor);

      const response = await request(app).get('/my-groups');

      expect(response.status).toBe(200);
      expect(response.body.groups).toEqual([]);
    });
  });

  describe('ADMIN role', () => {
    beforeEach(() => {
      app = express();
      app.use(express.json());
      app.use((req, res, next) => {
        req.user = { id: 'admin-id', role: 'ADMIN' };
        next();
      });
      app.get('/my-groups', chatController.getMyGroups);
    });

    it('should return all bus groups for admin', async () => {
      const prisma = require('../src/db');
      
      prisma.bus.findMany.mockResolvedValueOnce([
        { id: 'bus1' },
        { id: 'bus2' },
        { id: 'bus3' },
      ]);
      
      prisma.bus.findUnique
        .mockResolvedValueOnce({ id: 'bus1', busNo: '101' })
        .mockResolvedValueOnce({ id: 'bus2', busNo: '102' })
        .mockResolvedValueOnce({ id: 'bus3', busNo: '103' });
      
      chatService.getUnreadCount
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(0);

      const response = await request(app).get('/my-groups');

      expect(response.status).toBe(200);
      expect(response.body.groups).toHaveLength(3);
      expect(response.body.groups).toEqual([
        { busId: 'bus1', busNo: '101', unreadCount: 5 },
        { busId: 'bus2', busNo: '102', unreadCount: 3 },
        { busId: 'bus3', busNo: '103', unreadCount: 0 },
      ]);
    });

    it('should return empty array when no buses exist', async () => {
      const prisma = require('../src/db');
      
      prisma.bus.findMany.mockResolvedValueOnce([]);

      const response = await request(app).get('/my-groups');

      expect(response.status).toBe(200);
      expect(response.body.groups).toEqual([]);
    });
  });

  describe('Error handling', () => {
    it('should return 500 when service throws error', async () => {
      accessService.getParentStudents.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/my-groups');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Failed to fetch groups');
    });
  });
});

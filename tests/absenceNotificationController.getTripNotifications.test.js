// Unit tests for absenceNotificationController.js - getTripNotifications endpoint
// Task 3.3: Implement getTripNotifications endpoint for drivers
// Requirements: 5.2, 5.3, 5.4, 5.6, 6.5, 13.4, 13.5, 14.4

// Create mock prisma client
const mockPrisma = {
  trip: {
    findUnique: jest.fn()
  },
  absenceNotification: {
    findMany: jest.fn()
  },
  stop: {
    findUnique: jest.fn()
  }
};

// Mock accessService with both function exports and createAccessService
const mockAccessService = {
  getDriverForUser: jest.fn(),
  createAccessService: jest.fn(() => ({
    getDriverForUser: jest.fn(),
    getParentStudents: jest.fn()
  }))
};

// Mock dependencies before importing
jest.mock('../src/db', () => mockPrisma);
jest.mock('../src/services/accessService', () => mockAccessService);

// Import controller after mocks are set up
const absenceController = require('../src/controllers/absenceNotificationController');

describe('absenceNotificationController - getTripNotifications', () => {
  let req, res;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup request and response mocks
    req = {
      params: { tripId: 'trip-123' },
      user: { id: 'driver-user-123', role: 'DRIVER' }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('Authorization', () => {
    it('should return 404 if trip not found', async () => {
      mockPrisma.trip.findUnique.mockResolvedValue(null);

      await absenceController.getTripNotifications(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Trip not found' });
    });

    it('should return 403 if driver not authorized for trip bus', async () => {
      // Mock trip
      mockPrisma.trip.findUnique.mockResolvedValue({
        busId: 'bus-456',
        status: 'ACTIVE',
        startedAt: new Date('2024-01-15T08:00:00Z')
      });

      // Mock driver - assigned to different bus
      mockAccessService.getDriverForUser.mockResolvedValue({
        id: 'driver-123',
        busId: 'bus-999' // Different bus
      });

      await absenceController.getTripNotifications(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden' });
    });

    it('should return 403 if driver not found', async () => {
      mockPrisma.trip.findUnique.mockResolvedValue({
        busId: 'bus-456',
        status: 'ACTIVE',
        startedAt: new Date('2024-01-15T08:00:00Z')
      });

      mockAccessService.getDriverForUser.mockResolvedValue(null);

      await absenceController.getTripNotifications(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden' });
    });
  });

  describe('Query and Response', () => {
    it('should query active notifications for trip bus and date', async () => {
      const tripStartDate = new Date('2024-01-15T08:00:00Z');
      
      mockPrisma.trip.findUnique.mockResolvedValue({
        busId: 'bus-456',
        status: 'ACTIVE',
        startedAt: tripStartDate
      });

      mockAccessService.getDriverForUser.mockResolvedValue({
        id: 'driver-123',
        busId: 'bus-456'
      });

      mockPrisma.absenceNotification.findMany.mockResolvedValue([]);
      
      await absenceController.getTripNotifications(req, res);

      expect(mockPrisma.absenceNotification.findMany).toHaveBeenCalledWith({
        where: {
          busId: 'bus-456',
          date: '2024-01-15',
          status: 'ACTIVE'
        },
        include: {
          student: {
            select: {
              name: true,
              admissionNo: true
            }
          }
        }
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ notifications: [] });
    });

    it('should enrich notifications with stop details', async () => {
      mockPrisma.trip.findUnique.mockResolvedValue({
        busId: 'bus-456',
        status: 'ACTIVE',
        startedAt: new Date('2024-01-15T08:00:00Z')
      });

      mockAccessService.getDriverForUser.mockResolvedValue({
        id: 'driver-123',
        busId: 'bus-456'
      });

      const mockNotifications = [
        {
          id: 'notif-1',
          studentId: 'student-1',
          student: { name: 'John Doe', admissionNo: 'A001' },
          stopId: 'stop-1',
          reason: 'Sick',
          createdAt: new Date('2024-01-15T07:00:00Z')
        }
      ];

      mockPrisma.absenceNotification.findMany.mockResolvedValue(mockNotifications);
      
      mockPrisma.stop.findUnique.mockResolvedValue({
        name: 'Main Street Stop',
        order: 2
      });

      await absenceController.getTripNotifications(req, res);

      expect(mockPrisma.stop.findUnique).toHaveBeenCalledWith({
        where: { id: 'stop-1' },
        select: { name: true, order: true }
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        notifications: [{
          id: 'notif-1',
          studentId: 'student-1',
          studentName: 'John Doe',
          studentAdmissionNo: 'A001',
          stopId: 'stop-1',
          stopName: 'Main Street Stop',
          stopOrder: 2,
          reason: 'Sick',
          createdAt: expect.any(String)
        }]
      });
    });

    it('should sort notifications by stop order then student name', async () => {
      mockPrisma.trip.findUnique.mockResolvedValue({
        busId: 'bus-456',
        status: 'ACTIVE',
        startedAt: new Date('2024-01-15T08:00:00Z')
      });

      mockAccessService.getDriverForUser.mockResolvedValue({
        id: 'driver-123',
        busId: 'bus-456'
      });

      const mockNotifications = [
        {
          id: 'notif-1',
          studentId: 'student-1',
          student: { name: 'Charlie', admissionNo: 'A003' },
          stopId: 'stop-2',
          reason: null,
          createdAt: new Date('2024-01-15T07:00:00Z')
        },
        {
          id: 'notif-2',
          studentId: 'student-2',
          student: { name: 'Alice', admissionNo: 'A001' },
          stopId: 'stop-1',
          reason: null,
          createdAt: new Date('2024-01-15T07:00:00Z')
        },
        {
          id: 'notif-3',
          studentId: 'student-3',
          student: { name: 'Bob', admissionNo: 'A002' },
          stopId: 'stop-1',
          reason: null,
          createdAt: new Date('2024-01-15T07:00:00Z')
        }
      ];

      mockPrisma.absenceNotification.findMany.mockResolvedValue(mockNotifications);

      // Mock stop lookups
      mockPrisma.stop.findUnique
        .mockResolvedValueOnce({ name: 'Stop 2', order: 2 })
        .mockResolvedValueOnce({ name: 'Stop 1', order: 1 })
        .mockResolvedValueOnce({ name: 'Stop 1', order: 1 });

      await absenceController.getTripNotifications(req, res);

      const result = res.json.mock.calls[0][0];
      
      // Should be sorted: Stop 1 (Alice, Bob), then Stop 2 (Charlie)
      expect(result.notifications[0].studentName).toBe('Alice');
      expect(result.notifications[0].stopOrder).toBe(1);
      expect(result.notifications[1].studentName).toBe('Bob');
      expect(result.notifications[1].stopOrder).toBe(1);
      expect(result.notifications[2].studentName).toBe('Charlie');
      expect(result.notifications[2].stopOrder).toBe(2);
    });

    it('should handle missing stop gracefully', async () => {
      mockPrisma.trip.findUnique.mockResolvedValue({
        busId: 'bus-456',
        status: 'ACTIVE',
        startedAt: new Date('2024-01-15T08:00:00Z')
      });

      mockAccessService.getDriverForUser.mockResolvedValue({
        id: 'driver-123',
        busId: 'bus-456'
      });

      mockPrisma.absenceNotification.findMany.mockResolvedValue([{
        id: 'notif-1',
        studentId: 'student-1',
        student: { name: 'John Doe', admissionNo: 'A001' },
        stopId: 'stop-missing',
        reason: null,
        createdAt: new Date('2024-01-15T07:00:00Z')
      }]);

      mockPrisma.stop.findUnique.mockResolvedValue(null);

      await absenceController.getTripNotifications(req, res);

      const result = res.json.mock.calls[0][0];
      expect(result.notifications[0].stopName).toBe('Unknown Stop');
      expect(result.notifications[0].stopOrder).toBe(999);
    });

    it('should handle empty notifications array', async () => {
      mockPrisma.trip.findUnique.mockResolvedValue({
        busId: 'bus-456',
        status: 'ACTIVE',
        startedAt: new Date('2024-01-15T08:00:00Z')
      });

      mockAccessService.getDriverForUser.mockResolvedValue({
        id: 'driver-123',
        busId: 'bus-456'
      });

      mockPrisma.absenceNotification.findMany.mockResolvedValue([]);

      await absenceController.getTripNotifications(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ notifications: [] });
    });
  });

  describe('Error Handling', () => {
    it('should return 500 on database error', async () => {
      mockPrisma.trip.findUnique.mockRejectedValue(new Error('Database error'));

      await absenceController.getTripNotifications(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Failed to fetch trip notifications'
      });
    });

    it('should return 500 on accessService error', async () => {
      mockPrisma.trip.findUnique.mockResolvedValue({
        busId: 'bus-456',
        status: 'ACTIVE',
        startedAt: new Date('2024-01-15T08:00:00Z')
      });

      mockAccessService.getDriverForUser.mockRejectedValue(new Error('Access service error'));

      await absenceController.getTripNotifications(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Failed to fetch trip notifications'
      });
    });
  });
});

// Unit tests for absenceNotificationController.js - getAdminNotifications endpoint
// Task 3.4: Implement getAdminNotifications endpoint
// Requirements: 10.2, 10.3, 10.4, 10.5, 10.6, 13.7

// Create mock prisma client
const mockPrisma = {
  absenceNotification: {
    findMany: jest.fn()
  }
};

// Mock dependencies before importing
jest.mock('../src/db', () => mockPrisma);

// Import controller after mocks are set up
const absenceController = require('../src/controllers/absenceNotificationController');

describe('absenceNotificationController - getAdminNotifications', () => {
  let req, res;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup request and response mocks
    req = {
      query: {},
      user: { id: 'admin-user-123', role: 'ADMIN' }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('Filtering (Requirements 10.2, 10.3)', () => {
    it('should query all notifications with no filters', async () => {
      mockPrisma.absenceNotification.findMany.mockResolvedValue([]);

      await absenceController.getAdminNotifications(req, res);

      expect(mockPrisma.absenceNotification.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          student: {
            select: {
              name: true,
              admissionNo: true,
              parentPhone: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should filter by date when provided', async () => {
      req.query.date = '2024-01-15';
      mockPrisma.absenceNotification.findMany.mockResolvedValue([]);

      await absenceController.getAdminNotifications(req, res);

      expect(mockPrisma.absenceNotification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { date: '2024-01-15' }
        })
      );
    });

    it('should filter by busId when provided', async () => {
      req.query.busId = 'bus-456';
      mockPrisma.absenceNotification.findMany.mockResolvedValue([]);

      await absenceController.getAdminNotifications(req, res);

      expect(mockPrisma.absenceNotification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { busId: 'bus-456' }
        })
      );
    });

    it('should filter by studentId when provided', async () => {
      req.query.studentId = 'student-123';
      mockPrisma.absenceNotification.findMany.mockResolvedValue([]);

      await absenceController.getAdminNotifications(req, res);

      expect(mockPrisma.absenceNotification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { studentId: 'student-123' }
        })
      );
    });

    it('should filter by status when provided', async () => {
      req.query.status = 'ACTIVE';
      mockPrisma.absenceNotification.findMany.mockResolvedValue([]);

      await absenceController.getAdminNotifications(req, res);

      expect(mockPrisma.absenceNotification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'ACTIVE' }
        })
      );
    });

    it('should combine multiple filters', async () => {
      req.query.date = '2024-01-15';
      req.query.busId = 'bus-456';
      req.query.status = 'ACTIVE';
      mockPrisma.absenceNotification.findMany.mockResolvedValue([]);

      await absenceController.getAdminNotifications(req, res);

      expect(mockPrisma.absenceNotification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            date: '2024-01-15',
            busId: 'bus-456',
            status: 'ACTIVE'
          }
        })
      );
    });
  });

  describe('Response Format (Requirement 10.4)', () => {
    it('should return notifications with all required details', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          studentId: 'student-1',
          busId: 'bus-456',
          stopId: 'stop-1',
          date: '2024-01-15',
          reason: 'Sick',
          status: 'ACTIVE',
          createdAt: new Date('2024-01-15T07:00:00Z'),
          cancelledAt: null,
          student: {
            name: 'John Doe',
            admissionNo: 'A001',
            parentPhone: '+1234567890'
          },
          stop: {
            name: 'Main Street Stop'
          }
        }
      ];

      mockPrisma.absenceNotification.findMany.mockResolvedValue(mockNotifications);

      await absenceController.getAdminNotifications(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        notifications: [{
          id: 'notif-1',
          studentId: 'student-1',
          studentName: 'John Doe',
          studentAdmissionNo: 'A001',
          parentPhone: '+1234567890',
          busId: 'bus-456',
          stopId: 'stop-1',
          stopName: 'Main Street Stop',
          date: '2024-01-15',
          reason: 'Sick',
          status: 'ACTIVE',
          createdAt: '2024-01-15T07:00:00.000Z',
          cancelledAt: null
        }],
        summary: {
          total: 1,
          active: 1,
          cancelled: 0,
          late: 0
        }
      });
    });

    it('should include cancelledAt timestamp when notification is cancelled', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          studentId: 'student-1',
          busId: 'bus-456',
          stopId: 'stop-1',
          date: '2024-01-15',
          reason: null,
          status: 'CANCELLED',
          createdAt: new Date('2024-01-15T07:00:00Z'),
          cancelledAt: new Date('2024-01-15T07:30:00Z'),
          student: {
            name: 'Jane Smith',
            admissionNo: 'A002',
            parentPhone: '+0987654321'
          },
          stop: {
            name: 'School Stop'
          }
        }
      ];

      mockPrisma.absenceNotification.findMany.mockResolvedValue(mockNotifications);

      await absenceController.getAdminNotifications(req, res);

      const result = res.json.mock.calls[0][0];
      expect(result.notifications[0].cancelledAt).toBe('2024-01-15T07:30:00.000Z');
    });
  });

  describe('Summary Statistics (Requirement 10.6)', () => {
    it('should calculate correct summary statistics', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          studentId: 'student-1',
          busId: 'bus-456',
          stopId: 'stop-1',
          date: '2024-01-15',
          reason: null,
          status: 'ACTIVE',
          createdAt: new Date('2024-01-15T07:00:00Z'),
          cancelledAt: null,
          student: { name: 'Student 1', admissionNo: 'A001', parentPhone: '+111' },
          stop: { name: 'Stop 1' }
        },
        {
          id: 'notif-2',
          studentId: 'student-2',
          busId: 'bus-456',
          stopId: 'stop-2',
          date: '2024-01-15',
          reason: null,
          status: 'ACTIVE',
          createdAt: new Date('2024-01-15T07:00:00Z'),
          cancelledAt: null,
          student: { name: 'Student 2', admissionNo: 'A002', parentPhone: '+222' },
          stop: { name: 'Stop 2' }
        },
        {
          id: 'notif-3',
          studentId: 'student-3',
          busId: 'bus-456',
          stopId: 'stop-3',
          date: '2024-01-15',
          reason: null,
          status: 'CANCELLED',
          createdAt: new Date('2024-01-15T07:00:00Z'),
          cancelledAt: new Date('2024-01-15T07:30:00Z'),
          student: { name: 'Student 3', admissionNo: 'A003', parentPhone: '+333' },
          stop: { name: 'Stop 3' }
        },
        {
          id: 'notif-4',
          studentId: 'student-4',
          busId: 'bus-456',
          stopId: 'stop-4',
          date: '2024-01-15',
          reason: null,
          status: 'LATE',
          createdAt: new Date('2024-01-15T08:00:00Z'),
          cancelledAt: null,
          student: { name: 'Student 4', admissionNo: 'A004', parentPhone: '+444' },
          stop: { name: 'Stop 4' }
        }
      ];

      mockPrisma.absenceNotification.findMany.mockResolvedValue(mockNotifications);

      await absenceController.getAdminNotifications(req, res);

      const result = res.json.mock.calls[0][0];
      expect(result.summary).toEqual({
        total: 4,
        active: 2,
        cancelled: 1,
        late: 1
      });
    });

    it('should return zero counts for empty result set', async () => {
      mockPrisma.absenceNotification.findMany.mockResolvedValue([]);

      await absenceController.getAdminNotifications(req, res);

      const result = res.json.mock.calls[0][0];
      expect(result.summary).toEqual({
        total: 0,
        active: 0,
        cancelled: 0,
        late: 0
      });
    });
  });

  describe('Ordering (Requirement 10.4)', () => {
    it('should order results by createdAt descending', async () => {
      const mockNotifications = [
        {
          id: 'notif-3',
          studentId: 'student-3',
          busId: 'bus-456',
          stopId: 'stop-1',
          date: '2024-01-15',
          reason: null,
          status: 'ACTIVE',
          createdAt: new Date('2024-01-15T09:00:00Z'),
          cancelledAt: null,
          student: { name: 'Latest', admissionNo: 'A003', parentPhone: '+333' },
          stop: { name: 'Stop 1' }
        },
        {
          id: 'notif-2',
          studentId: 'student-2',
          busId: 'bus-456',
          stopId: 'stop-1',
          date: '2024-01-15',
          reason: null,
          status: 'ACTIVE',
          createdAt: new Date('2024-01-15T08:00:00Z'),
          cancelledAt: null,
          student: { name: 'Middle', admissionNo: 'A002', parentPhone: '+222' },
          stop: { name: 'Stop 1' }
        },
        {
          id: 'notif-1',
          studentId: 'student-1',
          busId: 'bus-456',
          stopId: 'stop-1',
          date: '2024-01-15',
          reason: null,
          status: 'ACTIVE',
          createdAt: new Date('2024-01-15T07:00:00Z'),
          cancelledAt: null,
          student: { name: 'Oldest', admissionNo: 'A001', parentPhone: '+111' },
          stop: { name: 'Stop 1' }
        }
      ];

      mockPrisma.absenceNotification.findMany.mockResolvedValue(mockNotifications);

      await absenceController.getAdminNotifications(req, res);

      expect(mockPrisma.absenceNotification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' }
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should return 500 on database error', async () => {
      mockPrisma.absenceNotification.findMany.mockRejectedValue(
        new Error('Database connection failed')
      );

      await absenceController.getAdminNotifications(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Failed to fetch absence notifications'
      });
    });

    it('should handle null/undefined values gracefully', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          studentId: 'student-1',
          busId: 'bus-456',
          stopId: 'stop-1',
          date: '2024-01-15',
          reason: null,
          status: 'ACTIVE',
          createdAt: new Date('2024-01-15T07:00:00Z'),
          cancelledAt: null,
          student: {
            name: 'John Doe',
            admissionNo: 'A001',
            parentPhone: null // Null parent phone
          },
          stop: {
            name: 'Main Street Stop'
          }
        }
      ];

      mockPrisma.absenceNotification.findMany.mockResolvedValue(mockNotifications);

      await absenceController.getAdminNotifications(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const result = res.json.mock.calls[0][0];
      expect(result.notifications[0].parentPhone).toBeNull();
    });
  });
});

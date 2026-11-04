const request = require('supertest');
const prisma = require('../src/db');

jest.setTimeout(30000);

// Mock Express app for testing
const express = require('express');
const app = express();
app.use(express.json());

// Mock notification service
const mockSendMulticast = jest.fn();
jest.mock('../src/services/notificationService', () => ({
  sendNotification: jest.fn(),
  sendMulticast: mockSendMulticast
}));

// Mock io and user middleware
let currentIo = {
  to: (room) => ({
    emit: (event, data) => {
      // Mock emit for testing
    }
  })
};
let currentUser = null;

app.use((req, res, next) => {
  req.io = currentIo;
  if (currentUser) {
    req.user = currentUser;
  }
  next();
});

// Import controller
const { markAttendance } = require('../src/controllers/attendanceController');

// Setup routes
app.post('/api/attendance', markAttendance);

describe('attendanceController - markAttendance', () => {
  let testStudent, testBus, testDriver, testTrip, testConductor;

  beforeAll(async () => {
    // Pre-cleanup any leftover data from previous interrupted runs
    const existingBus = await prisma.bus.findUnique({ where: { busNo: 'TEST-BUS-001' } });
    if (existingBus) {
      await prisma.attendance.deleteMany({ where: { busId: existingBus.id } });
      await prisma.tripStop.deleteMany({ where: { trip: { busId: existingBus.id } } });
      await prisma.trip.deleteMany({ where: { busId: existingBus.id } });
      await prisma.student.deleteMany({ where: { busId: existingBus.id } });
      await prisma.conductor.deleteMany({ where: { busId: existingBus.id } });
      await prisma.driver.deleteMany({ where: { busId: existingBus.id } });
      await prisma.bus.deleteMany({ where: { id: existingBus.id } });
    }
    await prisma.student.deleteMany({ where: { admissionNo: { in: ['ADM001', 'ADM002', 'ADM003', 'ADM004'] } } });
    await prisma.conductor.deleteMany({ where: { phone: '9876543210' } });
    await prisma.driver.deleteMany({ where: { phone: '1234567890' } });
    await prisma.user.deleteMany({ where: { phone: { in: ['1111111111', '2222222222', '3333333333'] } } });

    // Create test data
    testBus = await prisma.bus.create({
      data: {
        busNo: 'TEST-BUS-001',
        driverName: 'Test Driver',
        status: 'ACTIVE'
      }
    });

    testDriver = await prisma.driver.create({
      data: {
        name: 'Test Driver',
        phone: '1234567890',
        busId: testBus.id
      }
    });

    testConductor = await prisma.conductor.create({
      data: {
        name: 'Test Conductor',
        phone: '9876543210',
        busId: testBus.id
      }
    });

    testStudent = await prisma.student.create({
      data: {
        name: 'Test Student',
        admissionNo: 'ADM001',
        busId: testBus.id,
        parentPhone: '5555555555',
        class: '5A'
      }
    });

    testTrip = await prisma.trip.create({
      data: {
        busId: testBus.id,
        driverId: testDriver.id,
        direction: 'PICKUP',
        status: 'ACTIVE'
      }
    });
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.attendance.deleteMany({ where: { studentId: testStudent.id } });
    await prisma.trip.deleteMany({ where: { id: testTrip.id } });
    await prisma.student.deleteMany({ where: { id: testStudent.id } });
    await prisma.conductor.deleteMany({ where: { id: testConductor.id } });
    await prisma.driver.deleteMany({ where: { id: testDriver.id } });
    await prisma.bus.deleteMany({ where: { id: testBus.id } });
    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Clean up attendance records after each test
    await prisma.attendance.deleteMany({ where: { studentId: testStudent.id } });
    // Clear mock calls
    mockSendMulticast.mockClear();
    currentUser = null;
  });

  describe('Trip Validation (Requirements 19.1, 19.2, 19.3, 19.4)', () => {
    test('should successfully mark attendance with valid tripId', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const response = await request(app)
        .post('/api/attendance')
        .send({
          studentId: testStudent.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'PICKUP',
          boarded: true
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.attendance).toBeDefined();
      expect(response.body.attendance.tripId).toBe(testTrip.id);
      expect(response.body.attendance.boarded).toBe(true);
      expect(response.body.attendance.checkedAt).toBeDefined();
    });

    test('should return 404 when tripId does not exist', async () => {
      const today = new Date().toISOString().split('T')[0];
      const invalidTripId = '00000000-0000-0000-0000-000000000000';
      
      const response = await request(app)
        .post('/api/attendance')
        .send({
          studentId: testStudent.id,
          busId: testBus.id,
          tripId: invalidTripId,
          date: today,
          tripType: 'PICKUP',
          boarded: true
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Trip not found');
    });

    test('should return 400 when trip does not belong to specified busId', async () => {
      const today = new Date().toISOString().split('T')[0];
      const otherBusId = '00000000-0000-0000-0000-000000000001';
      
      const response = await request(app)
        .post('/api/attendance')
        .send({
          studentId: testStudent.id,
          busId: otherBusId,
          tripId: testTrip.id,
          date: today,
          tripType: 'PICKUP',
          boarded: true
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Trip does not belong to specified bus');
    });

    test('should return 409 when trip status is not ACTIVE', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Create an inactive trip
      const inactiveTrip = await prisma.trip.create({
        data: {
          busId: testBus.id,
          driverId: testDriver.id,
          direction: 'PICKUP',
          status: 'COMPLETED'
        }
      });

      const response = await request(app)
        .post('/api/attendance')
        .send({
          studentId: testStudent.id,
          busId: testBus.id,
          tripId: inactiveTrip.id,
          date: today,
          tripType: 'PICKUP',
          boarded: true
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toBe('Invalid or inactive trip');

      // Cleanup
      await prisma.trip.delete({ where: { id: inactiveTrip.id } });
    });
  });

  describe('Conductor Authorization (Requirement 14.4)', () => {
    test('should successfully mark attendance with valid conductorId', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Mock req.user for conductor
      currentUser = { role: 'CONDUCTOR', phone: testConductor.phone };

      const response = await request(app)
        .post('/api/attendance')
        .send({
          studentId: testStudent.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'PICKUP',
          boarded: true,
          conductorId: testConductor.id
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.attendance.conductorId).toBe(testConductor.id);
    });
  });

  describe('Upsert Logic (Requirements 10.1, 10.2, 10.3)', () => {
    test('should create new attendance record when none exists', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const response = await request(app)
        .post('/api/attendance')
        .send({
          studentId: testStudent.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'PICKUP',
          boarded: true
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      const attendance = await prisma.attendance.findFirst({
        where: {
          tripId: testTrip.id,
          studentId: testStudent.id,
          type: 'PICKUP'
        }
      });

      expect(attendance).toBeDefined();
      expect(attendance.boarded).toBe(true);
    });

    test('should update existing attendance record instead of creating duplicate', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Create first attendance record
      await request(app)
        .post('/api/attendance')
        .send({
          studentId: testStudent.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'PICKUP',
          boarded: true
        });

      // Try to create another with same tripId, studentId, type
      const response = await request(app)
        .post('/api/attendance')
        .send({
          studentId: testStudent.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'PICKUP',
          boarded: false
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // Verify only one record exists
      const attendanceRecords = await prisma.attendance.findMany({
        where: {
          tripId: testTrip.id,
          studentId: testStudent.id,
          type: 'PICKUP'
        }
      });

      expect(attendanceRecords.length).toBe(1);
      expect(attendanceRecords[0].boarded).toBe(false);
    });

    test('should set checkedAt timestamp when creating attendance', async () => {
      const today = new Date().toISOString().split('T')[0];
      const beforeTime = new Date();
      
      const response = await request(app)
        .post('/api/attendance')
        .send({
          studentId: testStudent.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'PICKUP',
          boarded: true
        });

      const afterTime = new Date();

      expect(response.status).toBe(200);
      expect(response.body.attendance.checkedAt).toBeDefined();
      
      const checkedAt = new Date(response.body.attendance.checkedAt);
      expect(checkedAt.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(checkedAt.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });

    test('should update checkedAt timestamp when updating attendance', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Create initial record
      await request(app)
        .post('/api/attendance')
        .send({
          studentId: testStudent.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'PICKUP',
          boarded: true
        });

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));

      const beforeUpdate = new Date();
      
      // Update the record
      const response = await request(app)
        .post('/api/attendance')
        .send({
          studentId: testStudent.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'PICKUP',
          boarded: false
        });

      const afterUpdate = new Date();

      expect(response.status).toBe(200);
      const updatedCheckedAt = new Date(response.body.attendance.checkedAt);
      expect(updatedCheckedAt.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
      expect(updatedCheckedAt.getTime()).toBeLessThanOrEqual(afterUpdate.getTime());
    });
  });

  describe('Basic Validation', () => {
    test('should return 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/api/attendance')
        .send({
          busId: testBus.id
          // Missing studentId and date
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('studentId, busId, date required');
    });
  });

  describe('Socket.IO Event Emission (Requirement 16.1, 16.2, 19.2)', () => {
    let emittedEvents;
    let emitToSpy;

    beforeEach(() => {
      emittedEvents = [];
      
      // Create a mock implementation that captures emit calls
      emitToSpy = jest.fn((event, data) => {
        emittedEvents.push({ event, data });
      });

      // Override the mock io middleware
      currentIo = {
        to: jest.fn((room) => ({
          emit: (event, data) => {
            emittedEvents.push({ room, event, data });
            emitToSpy(event, data);
          }
        }))
      };
    });

    test('should emit attendance:updated event to bus room when attendance is marked', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const response = await request(app)
        .post('/api/attendance')
        .send({
          studentId: testStudent.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'PICKUP',
          boarded: true
        });

      expect(response.status).toBe(200);
      
      // Wait a moment for event emission
      await new Promise(resolve => setTimeout(resolve, 50));

      // Verify event was emitted to bus room
      const busRoomEvent = emittedEvents.find(e => e.room === `bus_${testBus.id}`);
      expect(busRoomEvent).toBeDefined();
      expect(busRoomEvent.event).toBe('attendance:updated');
    });

    test('should emit attendance:updated event to admins room', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      await request(app)
        .post('/api/attendance')
        .send({
          studentId: testStudent.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'PICKUP',
          boarded: true
        });

      await new Promise(resolve => setTimeout(resolve, 50));

      // Verify event was emitted to admins room
      const adminsRoomEvent = emittedEvents.find(e => e.room === 'admins');
      expect(adminsRoomEvent).toBeDefined();
      expect(adminsRoomEvent.event).toBe('attendance:updated');
    });

    test('should include tripId, studentId, type, boarded, checkedAt in event payload', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const response = await request(app)
        .post('/api/attendance')
        .send({
          studentId: testStudent.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'PICKUP',
          boarded: true
        });

      await new Promise(resolve => setTimeout(resolve, 50));

      const busRoomEvent = emittedEvents.find(e => e.room === `bus_${testBus.id}`);
      expect(busRoomEvent.data).toMatchObject({
        tripId: testTrip.id,
        studentId: testStudent.id,
        type: 'PICKUP',
        boarded: true
      });
      expect(busRoomEvent.data.checkedAt).toBeDefined();
    });

    test('should include conductorId in event payload when marked by conductor', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Mock req.user for conductor
      currentUser = { role: 'CONDUCTOR', phone: testConductor.phone };

      await request(app)
        .post('/api/attendance')
        .send({
          studentId: testStudent.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'PICKUP',
          boarded: true,
          conductorId: testConductor.id
        });

      await new Promise(resolve => setTimeout(resolve, 50));

      const busRoomEvent = emittedEvents.find(e => e.room === `bus_${testBus.id}`);
      expect(busRoomEvent.data.conductorId).toBe(testConductor.id);
    });

    test('should NOT emit event when tripId is not provided (legacy mode)', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      await request(app)
        .post('/api/attendance')
        .send({
          studentId: testStudent.id,
          busId: testBus.id,
          date: today,
          tripType: 'PICKUP',
          boarded: true
          // No tripId
        });

      await new Promise(resolve => setTimeout(resolve, 50));

      // Verify no events were emitted
      expect(emittedEvents.length).toBe(0);
    });

    test('should emit updated boarded status when updating existing attendance', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Create initial attendance
      await request(app)
        .post('/api/attendance')
        .send({
          studentId: testStudent.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'PICKUP',
          boarded: true
        });

      // Clear previous events
      emittedEvents = [];

      // Update attendance
      await request(app)
        .post('/api/attendance')
        .send({
          studentId: testStudent.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'PICKUP',
          boarded: false
        });

      await new Promise(resolve => setTimeout(resolve, 50));

      const busRoomEvent = emittedEvents.find(e => e.room === `bus_${testBus.id}`);
      expect(busRoomEvent.data.boarded).toBe(false);
    });
  });

  describe('Backward Compatibility', () => {
    test('should work without tripId for legacy clients', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const response = await request(app)
        .post('/api/attendance')
        .send({
          studentId: testStudent.id,
          busId: testBus.id,
          date: today,
          tripType: 'PICKUP',
          boarded: true
          // No tripId provided
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.attendance.tripId).toBeNull();
    });
  });

  describe('Parent Notifications (Requirements 8.1-8.5, 9.1-9.5)', () => {
    let parentUser1, parentUser2, studentWithParents;

    beforeAll(async () => {
      // Create parent users with FCM tokens
      parentUser1 = await prisma.user.create({
        data: {
          phone: '1111111111',
          password: 'hashed',
          role: 'PARENT',
          fcmToken: 'token_parent_1'
        }
      });

      parentUser2 = await prisma.user.create({
        data: {
          phone: '2222222222',
          password: 'hashed',
          role: 'PARENT',
          fcmToken: 'token_parent_2'
        }
      });

      // Create student with both parent phones
      studentWithParents = await prisma.student.create({
        data: {
          name: 'Student With Parents',
          admissionNo: 'ADM002',
          busId: testBus.id,
          parentPhone: parentUser1.phone,
          parentPhone2: parentUser2.phone,
          class: '6B'
        }
      });
    });

    afterAll(async () => {
      await prisma.attendance.deleteMany({ where: { studentId: studentWithParents.id } });
      await prisma.student.delete({ where: { id: studentWithParents.id } });
      await prisma.user.deleteMany({ 
        where: { 
          phone: { in: [parentUser1.phone, parentUser2.phone] } 
        } 
      });
    });

    beforeEach(() => {
      mockSendMulticast.mockClear();
      mockSendMulticast.mockResolvedValue({
        successCount: 2,
        failureCount: 0
      });
    });

    test('should retrieve student with both parentPhone and parentPhone2 (Req 8.1, 8.5, 9.1, 9.5)', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      await request(app)
        .post('/api/attendance')
        .send({
          studentId: studentWithParents.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'PICKUP',
          boarded: true
        });

      // Wait for async notification
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify sendMulticast was called
      expect(mockSendMulticast).toHaveBeenCalled();
    });

    test('should retrieve FCM tokens for all parent phones (Req 8.2, 9.2)', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      await request(app)
        .post('/api/attendance')
        .send({
          studentId: studentWithParents.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'PICKUP',
          boarded: true
        });

      // Wait for async notification
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify both tokens were sent
      expect(mockSendMulticast).toHaveBeenCalledWith(
        expect.arrayContaining(['token_parent_1', 'token_parent_2']),
        expect.any(String),
        expect.any(String),
        expect.any(Object)
      );
    });

    test('should send PICKUP notification with correct title and message (Req 8.3)', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      await request(app)
        .post('/api/attendance')
        .send({
          studentId: studentWithParents.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'PICKUP',
          boarded: true
        });

      // Wait for async notification
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify notification content
      expect(mockSendMulticast).toHaveBeenCalledWith(
        expect.any(Array),
        'Student Picked Up',
        expect.stringContaining('Student With Parents'),
        expect.objectContaining({
          studentId: studentWithParents.id,
          tripType: 'PICKUP',
          boarded: 'true'
        })
      );

      // Verify message contains emoji and action
      const callArgs = mockSendMulticast.mock.calls[0];
      expect(callArgs[2]).toMatch(/🚌/); // Bus emoji for pickup
      expect(callArgs[2]).toMatch(/picked up/i);
    });

    test('should send DROP notification with correct title and message (Req 9.3)', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Create a DROP trip
      const dropTrip = await prisma.trip.create({
        data: {
          busId: testBus.id,
          driverId: testDriver.id,
          direction: 'DROP',
          status: 'ACTIVE'
        }
      });

      await request(app)
        .post('/api/attendance')
        .send({
          studentId: studentWithParents.id,
          busId: testBus.id,
          tripId: dropTrip.id,
          date: today,
          tripType: 'DROP',
          boarded: true
        });

      // Wait for async notification
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify notification content
      expect(mockSendMulticast).toHaveBeenCalledWith(
        expect.any(Array),
        'Student Dropped Off',
        expect.stringContaining('Student With Parents'),
        expect.objectContaining({
          studentId: studentWithParents.id,
          tripType: 'DROP',
          boarded: 'true'
        })
      );

      // Verify message contains emoji and action
      const callArgs = mockSendMulticast.mock.calls[0];
      expect(callArgs[2]).toMatch(/🏠/); // Home emoji for drop
      expect(callArgs[2]).toMatch(/dropped off/i);

      // Cleanup
      await prisma.trip.delete({ where: { id: dropTrip.id } });
    });

    test('should handle boarded=false with correct message', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      await request(app)
        .post('/api/attendance')
        .send({
          studentId: studentWithParents.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'PICKUP',
          boarded: false
        });

      // Wait for async notification
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify message contains "not picked up"
      const callArgs = mockSendMulticast.mock.calls[0];
      expect(callArgs[2]).toMatch(/not picked up/i);
    });

    test('should only send to parents with valid FCM tokens', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Create a parent without FCM token
      const parentNoToken = await prisma.user.create({
        data: {
          phone: '3333333333',
          password: 'hashed',
          role: 'PARENT',
          fcmToken: null
        }
      });

      // Create student with one parent having token and one without
      const studentMixedParents = await prisma.student.create({
        data: {
          name: 'Student Mixed Parents',
          admissionNo: 'ADM003',
          busId: testBus.id,
          parentPhone: parentUser1.phone,
          parentPhone2: parentNoToken.phone,
          class: '7C'
        }
      });

      await request(app)
        .post('/api/attendance')
        .send({
          studentId: studentMixedParents.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'PICKUP',
          boarded: true
        });

      // Wait for async notification
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify only one token was sent
      expect(mockSendMulticast).toHaveBeenCalledWith(
        expect.arrayContaining(['token_parent_1']),
        expect.any(String),
        expect.any(String),
        expect.any(Object)
      );

      const callArgs = mockSendMulticast.mock.calls[0];
      expect(callArgs[0].length).toBe(1);
      expect(callArgs[0]).not.toContain('token_parent_2');

      // Cleanup
      await prisma.attendance.deleteMany({ where: { studentId: studentMixedParents.id } });
      await prisma.student.delete({ where: { id: studentMixedParents.id } });
      await prisma.user.delete({ where: { phone: parentNoToken.phone } });
    });

    test('should not send notification when no FCM tokens available', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Create student with no parent phones
      const studentNoParents = await prisma.student.create({
        data: {
          name: 'Student No Parents',
          admissionNo: 'ADM004',
          busId: testBus.id,
          parentPhone: '',
          parentPhone2: null,
          class: '8D'
        }
      });

      await request(app)
        .post('/api/attendance')
        .send({
          studentId: studentNoParents.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'PICKUP',
          boarded: true
        });

      // Wait for async notification
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify sendMulticast was not called
      expect(mockSendMulticast).not.toHaveBeenCalled();

      // Cleanup
      await prisma.attendance.deleteMany({ where: { studentId: studentNoParents.id } });
      await prisma.student.delete({ where: { id: studentNoParents.id } });
    });

    test('should send notification within 5 seconds (Req 8.4, 9.4)', async () => {
      const today = new Date().toISOString().split('T')[0];
      const startTime = Date.now();
      
      await request(app)
        .post('/api/attendance')
        .send({
          studentId: studentWithParents.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'PICKUP',
          boarded: true
        });

      // Wait for async notification
      await new Promise(resolve => setTimeout(resolve, 100));

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Verify notification was sent within 5 seconds (5000ms)
      expect(duration).toBeLessThan(5000);
      expect(mockSendMulticast).toHaveBeenCalled();
    });

    test('should handle notification errors gracefully without blocking response', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Mock sendMulticast to throw error
      mockSendMulticast.mockRejectedValue(new Error('FCM service unavailable'));

      const response = await request(app)
        .post('/api/attendance')
        .send({
          studentId: studentWithParents.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'PICKUP',
          boarded: true
        });

      // Verify attendance was still saved successfully
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.attendance).toBeDefined();

      // Wait a bit for async notification attempt
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify notification was attempted
      expect(mockSendMulticast).toHaveBeenCalled();
    });

    test('should use sendMulticast for efficient batch notification', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      await request(app)
        .post('/api/attendance')
        .send({
          studentId: studentWithParents.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'PICKUP',
          boarded: true
        });

      // Wait for async notification
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify sendMulticast was called (not sendNotification in a loop)
      expect(mockSendMulticast).toHaveBeenCalledTimes(1);
      
      // Verify it was called with an array of tokens
      const callArgs = mockSendMulticast.mock.calls[0];
      expect(Array.isArray(callArgs[0])).toBe(true);
      expect(callArgs[0].length).toBe(2); // Both parent tokens
    });
  });
});

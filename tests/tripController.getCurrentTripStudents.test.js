const request = require('supertest');
const prisma = require('../src/db');

jest.setTimeout(30000);

// Mock Express app for testing
const express = require('express');
const app = express();
app.use(express.json());

// Mock user middleware to set req.user
let mockUser = null;
app.use((req, res, next) => {
  if (mockUser) {
    req.user = mockUser;
  }
  next();
});

// Import controller
const { getCurrentTripStudents } = require('../src/controllers/tripController');

// Setup route
app.get('/api/trips/current/students', getCurrentTripStudents);

describe('tripController - getCurrentTripStudents', () => {
  let testBus, testDriver, testConductor, testUser, testConductorUser;
  let testTrip, testStop1, testStop2, testStop3;
  let testStudent1, testStudent2, testStudent3, testStudent4, testStudent5;

  beforeAll(async () => {
    // Pre-cleanup any leftover data from previous interrupted runs
    const existingBus = await prisma.bus.findUnique({ where: { busNo: 'TEST-BUS-TRIP-001' } });
    if (existingBus) {
      await prisma.attendance.deleteMany({ where: { busId: existingBus.id } });
      await prisma.student.deleteMany({ where: { busId: existingBus.id } });
      await prisma.tripStop.deleteMany({ where: { trip: { busId: existingBus.id } } });
      await prisma.trip.deleteMany({ where: { busId: existingBus.id } });
      await prisma.stop.deleteMany({ where: { busId: existingBus.id } });
      await prisma.conductor.deleteMany({ where: { busId: existingBus.id } });
      await prisma.driver.deleteMany({ where: { busId: existingBus.id } });
      await prisma.bus.deleteMany({ where: { id: existingBus.id } });
    }
    await prisma.student.deleteMany({ where: { admissionNo: { in: ['ADM001', 'ADM002', 'ADM003', 'ADM004', 'ADM005'] } } });
    await prisma.conductor.deleteMany({ where: { phone: '2222222222' } });
    await prisma.driver.deleteMany({ where: { phone: '1111111111' } });
    await prisma.user.deleteMany({ where: { phone: { in: ['1111111111', '2222222222', '7777777777', '8888888888', '9999999999'] } } });

    // Create test bus
    testBus = await prisma.bus.create({
      data: {
        busNo: 'TEST-BUS-TRIP-001',
        driverName: 'Test Driver',
        status: 'ON_TRIP'
      }
    });

    // Create test users
    testUser = await prisma.user.create({
      data: {
        phone: '1111111111',
        role: 'DRIVER',
        password: 'test123'
      }
    });

    testConductorUser = await prisma.user.create({
      data: {
        phone: '2222222222',
        role: 'CONDUCTOR',
        password: 'test123'
      }
    });

    // Create test driver
    testDriver = await prisma.driver.create({
      data: {
        name: 'Test Driver',
        phone: testUser.phone,
        busId: testBus.id
      }
    });

    // Create test conductor
    testConductor = await prisma.conductor.create({
      data: {
        name: 'Test Conductor',
        phone: testConductorUser.phone,
        busId: testBus.id
      }
    });

    // Create test stops
    const stop1 = await prisma.stop.create({
      data: {
        busId: testBus.id,
        name: 'Stop 1 - School Gate',
        lat: 12.9716,
        lng: 77.5946,
        order: 1
      }
    });

    const stop2 = await prisma.stop.create({
      data: {
        busId: testBus.id,
        name: 'Stop 2 - Main Street',
        lat: 12.9720,
        lng: 77.5950,
        order: 2
      }
    });

    const stop3 = await prisma.stop.create({
      data: {
        busId: testBus.id,
        name: 'Stop 3 - Park Avenue',
        lat: 12.9730,
        lng: 77.5960,
        order: 3
      }
    });

    // Create active pickup trip
    testTrip = await prisma.trip.create({
      data: {
        busId: testBus.id,
        driverId: testDriver.id,
        direction: 'PICKUP',
        status: 'ACTIVE'
      }
    });

    // Create trip stops
    testStop1 = await prisma.tripStop.create({
      data: {
        tripId: testTrip.id,
        stopId: stop1.id,
        name: stop1.name,
        lat: stop1.lat,
        lng: stop1.lng,
        order: 1,
        status: 'PENDING'
      }
    });

    testStop2 = await prisma.tripStop.create({
      data: {
        tripId: testTrip.id,
        stopId: stop2.id,
        name: stop2.name,
        lat: stop2.lat,
        lng: stop2.lng,
        order: 2,
        status: 'PENDING'
      }
    });

    testStop3 = await prisma.tripStop.create({
      data: {
        tripId: testTrip.id,
        stopId: stop3.id,
        name: stop3.name,
        lat: stop3.lat,
        lng: stop3.lng,
        order: 3,
        status: 'PENDING'
      }
    });

    // Create test students
    testStudent1 = await prisma.student.create({
      data: {
        name: 'Student 1 - Stop 1',
        admissionNo: 'ADM001',
        busId: testBus.id,
        stopId: stop1.id,
        dropStopId: stop1.id,
        parentPhone: '5551111111',
        class: '5A'
      }
    });

    testStudent2 = await prisma.student.create({
      data: {
        name: 'Student 2 - Stop 2',
        admissionNo: 'ADM002',
        busId: testBus.id,
        stopId: stop2.id,
        dropStopId: stop2.id,
        parentPhone: '5552222222',
        class: '6B'
      }
    });

    testStudent3 = await prisma.student.create({
      data: {
        name: 'Student 3 - Stop 3',
        admissionNo: 'ADM003',
        busId: testBus.id,
        stopId: stop3.id,
        dropStopId: stop3.id,
        parentPhone: '5553333333',
        class: '7C'
      }
    });

    // Student without pickup stop
    testStudent4 = await prisma.student.create({
      data: {
        name: 'Student 4 - No Pickup Stop',
        admissionNo: 'ADM004',
        busId: testBus.id,
        stopId: null,
        dropStopId: stop2.id,
        parentPhone: '5554444444',
        class: '8A'
      }
    });

    // Student without drop stop
    testStudent5 = await prisma.student.create({
      data: {
        name: 'Student 5 - No Drop Stop',
        admissionNo: 'ADM005',
        busId: testBus.id,
        stopId: stop1.id,
        dropStopId: null,
        parentPhone: '5555555555',
        class: '9B'
      }
    });
  });

  afterAll(async () => {
    // Cleanup in reverse order of dependencies
    await prisma.attendance.deleteMany({ where: { busId: testBus.id } });
    await prisma.student.deleteMany({ where: { busId: testBus.id } });
    await prisma.tripStop.deleteMany({ where: { tripId: testTrip.id } });
    await prisma.trip.deleteMany({ where: { id: testTrip.id } });
    await prisma.stop.deleteMany({ where: { busId: testBus.id } });
    await prisma.conductor.deleteMany({ where: { id: testConductor.id } });
    await prisma.driver.deleteMany({ where: { id: testDriver.id } });
    await prisma.user.deleteMany({ where: { phone: { in: [testUser.phone, testConductorUser.phone] } } });
    await prisma.bus.deleteMany({ where: { id: testBus.id } });
    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Clean up attendance records after each test
    await prisma.attendance.deleteMany({ where: { busId: testBus.id } });
    mockUser = null;
  });

  describe('BusId Resolution - DRIVER Role (Requirement 11.1)', () => {
    test('should resolve busId from driver role', async () => {
      mockUser = { id: testUser.id, phone: testUser.phone, role: 'DRIVER' };

      const response = await request(app)
        .get('/api/trips/current/students');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.trip).toBeDefined();
      expect(response.body.trip.busId).toBe(testBus.id);
    });

    test('should return empty response when driver has no bus assignment', async () => {
      // Create driver without bus
      const noBusUser = await prisma.user.create({
        data: {
          phone: '9999999999',
          role: 'DRIVER',
          password: 'test123'
        }
      });

      const noBusDriver = await prisma.driver.create({
        data: {
          name: 'No Bus Driver',
          phone: noBusUser.phone,
          busId: null
        }
      });

      mockUser = { id: noBusUser.id, phone: noBusUser.phone, role: 'DRIVER' };

      const response = await request(app)
        .get('/api/trips/current/students');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.students).toEqual([]);
      expect(response.body.stops).toEqual([]);
      expect(response.body.trip).toBeNull();
      expect(response.body.noStopStudents).toEqual([]);

      // Cleanup
      await prisma.driver.delete({ where: { id: noBusDriver.id } });
      await prisma.user.delete({ where: { id: noBusUser.id } });
    });
  });

  describe('BusId Resolution - CONDUCTOR Role (Requirement 11.1)', () => {
    test('should resolve busId from conductor role', async () => {
      mockUser = { id: testConductorUser.id, phone: testConductorUser.phone, role: 'CONDUCTOR' };

      const response = await request(app)
        .get('/api/trips/current/students');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.trip).toBeDefined();
      expect(response.body.trip.busId).toBe(testBus.id);
    });

    test('should return empty response when conductor has no bus assignment', async () => {
      // Create conductor without bus
      const noBusUser = await prisma.user.create({
        data: {
          phone: '8888888888',
          role: 'CONDUCTOR',
          password: 'test123'
        }
      });

      const noBusConductor = await prisma.conductor.create({
        data: {
          name: 'No Bus Conductor',
          phone: noBusUser.phone,
          busId: null
        }
      });

      mockUser = { id: noBusUser.id, phone: noBusUser.phone, role: 'CONDUCTOR' };

      const response = await request(app)
        .get('/api/trips/current/students');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.students).toEqual([]);
      expect(response.body.stops).toEqual([]);
      expect(response.body.trip).toBeNull();
      expect(response.body.noStopStudents).toEqual([]);

      // Cleanup
      await prisma.conductor.delete({ where: { id: noBusConductor.id } });
      await prisma.user.delete({ where: { id: noBusUser.id } });
    });
  });

  describe('Non-Driver/Conductor Role Access (Security)', () => {
    test('should reject access for non-driver/conductor roles', async () => {
      const parentUser = await prisma.user.create({
        data: {
          phone: '7777777777',
          role: 'PARENT',
          password: 'test123'
        }
      });

      mockUser = { id: parentUser.id, phone: parentUser.phone, role: 'PARENT' };

      const response = await request(app)
        .get('/api/trips/current/students');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Only drivers and conductors can access this endpoint');

      // Cleanup
      await prisma.user.delete({ where: { id: parentUser.id } });
    });
  });

  describe('Student Grouping by Pickup Stops (Requirements 11.3, 11.4)', () => {
    test('should group students by pickup stops for PICKUP trip', async () => {
      mockUser = { id: testUser.id, phone: testUser.phone, role: 'DRIVER' };

      const response = await request(app)
        .get('/api/trips/current/students');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.trip.direction).toBe('PICKUP');
      expect(response.body.stops).toHaveLength(3);

      // Check Stop 1 has 2 students (Student 1 and Student 5)
      const stop1Data = response.body.stops.find(s => s.order === 1);
      expect(stop1Data).toBeDefined();
      expect(stop1Data.students).toHaveLength(2);
      expect(stop1Data.students.map(s => s.name)).toContain('Student 1 - Stop 1');
      expect(stop1Data.students.map(s => s.name)).toContain('Student 5 - No Drop Stop');

      // Check Stop 2 has 1 student (Student 2)
      const stop2Data = response.body.stops.find(s => s.order === 2);
      expect(stop2Data).toBeDefined();
      expect(stop2Data.students).toHaveLength(1);
      expect(stop2Data.students[0].name).toBe('Student 2 - Stop 2');

      // Check Stop 3 has 1 student (Student 3)
      const stop3Data = response.body.stops.find(s => s.order === 3);
      expect(stop3Data).toBeDefined();
      expect(stop3Data.students).toHaveLength(1);
      expect(stop3Data.students[0].name).toBe('Student 3 - Stop 3');
    });

    test('should include student details in pickup stop grouping', async () => {
      mockUser = { id: testUser.id, phone: testUser.phone, role: 'DRIVER' };

      const response = await request(app)
        .get('/api/trips/current/students');

      const stop1Data = response.body.stops.find(s => s.order === 1);
      const student = stop1Data.students.find(s => s.admissionNo === 'ADM001');

      expect(student).toBeDefined();
      expect(student.name).toBe('Student 1 - Stop 1');
      expect(student.admissionNo).toBe('ADM001');
      expect(student.class).toBe('5A');
      expect(student.relevantStop).toBeDefined();
      expect(student.attendance).toBeNull(); // No attendance marked yet
    });
  });

  describe('Student Grouping by Drop Stops (Requirements 11.3, 11.4)', () => {
    test('should group students by drop stops for DROP trip', async () => {
      // Create a DROP trip
      const dropTrip = await prisma.trip.create({
        data: {
          busId: testBus.id,
          driverId: testDriver.id,
          direction: 'DROP',
          status: 'ACTIVE'
        }
      });

      // Create trip stops for drop trip
      await prisma.tripStop.create({
        data: {
          tripId: dropTrip.id,
          stopId: testStop1.stopId,
          name: testStop1.name,
          lat: testStop1.lat,
          lng: testStop1.lng,
          order: 1,
          status: 'PENDING'
        }
      });

      await prisma.tripStop.create({
        data: {
          tripId: dropTrip.id,
          stopId: testStop2.stopId,
          name: testStop2.name,
          lat: testStop2.lat,
          lng: testStop2.lng,
          order: 2,
          status: 'PENDING'
        }
      });

      // End the PICKUP trip first
      await prisma.trip.update({
        where: { id: testTrip.id },
        data: { status: 'COMPLETED' }
      });

      mockUser = { id: testUser.id, phone: testUser.phone, role: 'DRIVER' };

      const response = await request(app)
        .get('/api/trips/current/students');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.trip.direction).toBe('DROP');

      // Check Stop 1 has 1 student (Student 1, Student 5 has no drop stop)
      const stop1Data = response.body.stops.find(s => s.order === 1);
      expect(stop1Data).toBeDefined();
      expect(stop1Data.students).toHaveLength(1);
      expect(stop1Data.students[0].name).toBe('Student 1 - Stop 1');

      // Check Stop 2 has 2 students (Student 2 and Student 4)
      const stop2Data = response.body.stops.find(s => s.order === 2);
      expect(stop2Data).toBeDefined();
      expect(stop2Data.students).toHaveLength(2);
      expect(stop2Data.students.map(s => s.name)).toContain('Student 2 - Stop 2');
      expect(stop2Data.students.map(s => s.name)).toContain('Student 4 - No Pickup Stop');

      // Cleanup
      await prisma.tripStop.deleteMany({ where: { tripId: dropTrip.id } });
      await prisma.trip.delete({ where: { id: dropTrip.id } });

      // Restore PICKUP trip status
      await prisma.trip.update({
        where: { id: testTrip.id },
        data: { status: 'ACTIVE' }
      });
    });
  });

  describe('Handling Students Without Relevant Stops (Requirements 11.5, 13.1)', () => {
    test('should include students without pickup stop in noStopStudents for PICKUP trip', async () => {
      mockUser = { id: testUser.id, phone: testUser.phone, role: 'DRIVER' };

      const response = await request(app)
        .get('/api/trips/current/students');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.noStopStudents).toHaveLength(1);
      expect(response.body.noStopStudents[0].name).toBe('Student 4 - No Pickup Stop');
      expect(response.body.noStopStudents[0].stopId).toBeNull();
    });

    test('should include students without drop stop in noStopStudents for DROP trip', async () => {
      // Create a DROP trip
      const dropTrip = await prisma.trip.create({
        data: {
          busId: testBus.id,
          driverId: testDriver.id,
          direction: 'DROP',
          status: 'ACTIVE'
        }
      });

      await prisma.tripStop.create({
        data: {
          tripId: dropTrip.id,
          stopId: testStop1.stopId,
          name: testStop1.name,
          lat: testStop1.lat,
          lng: testStop1.lng,
          order: 1,
          status: 'PENDING'
        }
      });

      await prisma.tripStop.create({
        data: {
          tripId: dropTrip.id,
          stopId: testStop2.stopId,
          name: testStop2.name,
          lat: testStop2.lat,
          lng: testStop2.lng,
          order: 2,
          status: 'PENDING'
        }
      });

      // End the PICKUP trip
      await prisma.trip.update({
        where: { id: testTrip.id },
        data: { status: 'COMPLETED' }
      });

      mockUser = { id: testUser.id, phone: testUser.phone, role: 'DRIVER' };

      const response = await request(app)
        .get('/api/trips/current/students');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.noStopStudents).toHaveLength(2);
      
      const noStopNames = response.body.noStopStudents.map(s => s.name);
      expect(noStopNames).toContain('Student 5 - No Drop Stop');
      expect(noStopNames).toContain('Student 3 - Stop 3'); // Stop 3 not in trip stops

      // Cleanup
      await prisma.tripStop.deleteMany({ where: { tripId: dropTrip.id } });
      await prisma.trip.delete({ where: { id: dropTrip.id } });

      // Restore PICKUP trip
      await prisma.trip.update({
        where: { id: testTrip.id },
        data: { status: 'ACTIVE' }
      });
    });
  });

  describe('Empty Trip Scenario (Requirement 11.1)', () => {
    test('should return empty data when no active trip exists', async () => {
      // End the active trip temporarily
      await prisma.trip.update({
        where: { id: testTrip.id },
        data: { status: 'COMPLETED' }
      });

      mockUser = { id: testUser.id, phone: testUser.phone, role: 'DRIVER' };

      const response = await request(app)
        .get('/api/trips/current/students');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.students).toEqual([]);
      expect(response.body.stops).toEqual([]);
      expect(response.body.trip).toBeNull();
      expect(response.body.noStopStudents).toEqual([]);

      // Restore trip status
      await prisma.trip.update({
        where: { id: testTrip.id },
        data: { status: 'ACTIVE' }
      });
    });
  });

  describe('Attendance Status Integration (Requirement 12.1)', () => {
    test('should include attendance status when attendance records exist', async () => {
      const today = new Date().toISOString().split('T')[0];

      // Mark attendance for Student 1
      await prisma.attendance.create({
        data: {
          studentId: testStudent1.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          type: 'PICKUP',
          tripType: 'PICKUP',
          boarded: true,
          checkedAt: new Date()
        }
      });

      mockUser = { id: testUser.id, phone: testUser.phone, role: 'DRIVER' };

      const response = await request(app)
        .get('/api/trips/current/students');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Find Student 1 in the response
      const stop1Data = response.body.stops.find(s => s.order === 1);
      const student1 = stop1Data.students.find(s => s.admissionNo === 'ADM001');

      expect(student1).toBeDefined();
      expect(student1.attendance).toBeDefined();
      expect(student1.attendance.boarded).toBe(true);
      expect(student1.attendance.checkedAt).toBeDefined();
      expect(student1.attendance.conductorId).toBeNull();

      // Verify Student 2 has no attendance
      const stop2Data = response.body.stops.find(s => s.order === 2);
      const student2 = stop2Data.students.find(s => s.admissionNo === 'ADM002');
      expect(student2.attendance).toBeNull();
    });

    test('should include conductorId when attendance marked by conductor', async () => {
      const today = new Date().toISOString().split('T')[0];

      // Mark attendance by conductor
      await prisma.attendance.create({
        data: {
          studentId: testStudent2.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          type: 'PICKUP',
          tripType: 'PICKUP',
          boarded: true,
          conductorId: testConductor.id,
          checkedAt: new Date()
        }
      });

      mockUser = { id: testUser.id, phone: testUser.phone, role: 'DRIVER' };

      const response = await request(app)
        .get('/api/trips/current/students');

      const stop2Data = response.body.stops.find(s => s.order === 2);
      const student2 = stop2Data.students.find(s => s.admissionNo === 'ADM002');

      expect(student2.attendance).toBeDefined();
      expect(student2.attendance.boarded).toBe(true);
      expect(student2.attendance.conductorId).toBe(testConductor.id);
    });
  });

  describe('Response Structure (Requirement 11.5)', () => {
    test('should return correct response structure', async () => {
      mockUser = { id: testUser.id, phone: testUser.phone, role: 'DRIVER' };

      const response = await request(app)
        .get('/api/trips/current/students');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('trip');
      expect(response.body).toHaveProperty('stops');
      expect(response.body).toHaveProperty('noStopStudents');

      expect(response.body.trip).toHaveProperty('id');
      expect(response.body.trip).toHaveProperty('busId');
      expect(response.body.trip).toHaveProperty('direction');
      expect(response.body.trip).toHaveProperty('status');
      expect(response.body.trip).toHaveProperty('currentStopId');

      expect(Array.isArray(response.body.stops)).toBe(true);
      expect(Array.isArray(response.body.noStopStudents)).toBe(true);
    });

    test('should return stops sorted by order', async () => {
      mockUser = { id: testUser.id, phone: testUser.phone, role: 'DRIVER' };

      const response = await request(app)
        .get('/api/trips/current/students');

      expect(response.status).toBe(200);
      const orders = response.body.stops.map(s => s.order);
      
      // Check if orders are sorted in ascending order
      for (let i = 1; i < orders.length; i++) {
        expect(orders[i]).toBeGreaterThan(orders[i - 1]);
      }
    });

    test('should include all required student fields', async () => {
      mockUser = { id: testUser.id, phone: testUser.phone, role: 'DRIVER' };

      const response = await request(app)
        .get('/api/trips/current/students');

      const stop1Data = response.body.stops.find(s => s.order === 1);
      const student = stop1Data.students[0];

      expect(student).toHaveProperty('id');
      expect(student).toHaveProperty('name');
      expect(student).toHaveProperty('admissionNo');
      expect(student).toHaveProperty('class');
      expect(student).toHaveProperty('stopId');
      expect(student).toHaveProperty('dropStopId');
      expect(student).toHaveProperty('relevantStop');
      expect(student).toHaveProperty('attendance');
    });
  });

  describe('Error Handling', () => {
    test('should return 500 on database error', async () => {
      mockUser = { id: testUser.id, phone: testUser.phone, role: 'DRIVER' };

      // Mock prisma to throw an error
      const originalFindFirst = prisma.trip.findFirst;
      prisma.trip.findFirst = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/trips/current/students');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Failed to fetch trip students');

      // Restore original function
      prisma.trip.findFirst = originalFindFirst;
    });
  });
});

// Test suite to verify conductor role has proper access to attendance-related API endpoints
// Task 10.1: Verify conductor role access in backend

const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/db');
const jwt = require('jsonwebtoken');
const { getConfig } = require('../src/config/env');

jest.setTimeout(30000);

describe('Conductor Attendance Access', () => {
  let conductorToken;
  let driverToken;
  let adminToken;
  let conductorUser;
  let driverUser;
  let adminUser;
  let testBus;
  let testRoute;
  let testStop;
  let testStudent;
  let testConductor;
  let testDriver;
  let activeTrip;

  beforeAll(async () => {
    // Clean up test data
    await prisma.attendance.deleteMany({
      where: {
        busId: { startsWith: 'test-conductor-' }
      }
    });
    await prisma.tripStop.deleteMany({
      where: {
        trip: {
          busId: { startsWith: 'test-conductor-' }
        }
      }
    });
    await prisma.trip.deleteMany({
      where: {
        busId: { startsWith: 'test-conductor-' }
      }
    });
    await prisma.student.deleteMany({
      where: {
        busId: { startsWith: 'test-conductor-' }
      }
    });
    await prisma.conductor.deleteMany({
      where: {
        phone: { in: ['1234567890', '0987654321'] }
      }
    });
    await prisma.driver.deleteMany({
      where: {
        phone: '1111111111'
      }
    });
    await prisma.bus.deleteMany({
      where: {
        id: { startsWith: 'test-conductor-' }
      }
    });
    await prisma.stop.deleteMany({
      where: {
        id: { startsWith: 'test-conductor-stop-' }
      }
    });
    await prisma.route.deleteMany({
      where: {
        id: { startsWith: 'test-conductor-route-' }
      }
    });
    await prisma.user.deleteMany({
      where: {
        phone: { in: ['1234567890', '0987654321', '1111111111', '2222222222'] }
      }
    });

    // Create test users
    conductorUser = await prisma.user.create({
      data: {
        id: 'test-conductor-user-1',
        phone: '1234567890',
        role: 'CONDUCTOR',
        fcmToken: 'conductor-fcm-token'
      }
    });

    driverUser = await prisma.user.create({
      data: {
        id: 'test-driver-user-1',
        phone: '1111111111',
        role: 'DRIVER',
        fcmToken: 'driver-fcm-token'
      }
    });

    adminUser = await prisma.user.create({
      data: {
        id: 'test-admin-user-1',
        phone: '2222222222',
        role: 'ADMIN',
        fcmToken: 'admin-fcm-token'
      }
    });

    // Create test bus
    testBus = await prisma.bus.create({
      data: {
        id: 'test-conductor-bus-1',
        busNo: 'TEST-COND-001',
        driverName: 'Test Driver',
        status: 'ACTIVE'
      }
    });

    // Create test conductor
    testConductor = await prisma.conductor.create({
      data: {
        id: 'test-conductor-1',
        name: 'Test Conductor',
        phone: '1234567890',
        busId: testBus.id
      }
    });

    // Create test driver
    testDriver = await prisma.driver.create({
      data: {
        id: 'test-driver-1',
        name: 'Test Driver',
        phone: '1111111111',
        busId: testBus.id
      }
    });

    // Create test route and stop
    testRoute = await prisma.route.create({
      data: {
        id: 'test-conductor-route-1',
        name: 'Test Route',
        busId: testBus.id,
        startPoint: 'Start',
        endPoint: 'End'
      }
    });

    testStop = await prisma.stop.create({
      data: {
        id: 'test-conductor-stop-1',
        name: 'Test Stop',
        lat: 28.7041,
        lng: 77.1025,
        order: 1,
        busId: testBus.id
      }
    });

    // Create test student
    testStudent = await prisma.student.create({
      data: {
        id: 'test-conductor-student-1',
        name: 'Test Student',
        admissionNo: 'TEST001',
        class: '5',
        busId: testBus.id,
        stopId: testStop.id,
        dropStopId: testStop.id,
        parentPhone: '9999999999'
      }
    });

    // Create active trip
    activeTrip = await prisma.trip.create({
      data: {
        id: 'test-conductor-trip-1',
        busId: testBus.id,
        driverId: testDriver.id,
        direction: 'PICKUP',
        status: 'ACTIVE',
        startedAt: new Date()
      }
    });

    // Create trip stop
    await prisma.tripStop.create({
      data: {
        id: 'test-conductor-trip-stop-1',
        tripId: activeTrip.id,
        stopId: testStop.id,
        name: testStop.name,
        order: 1,
        status: 'PENDING',
        lat: testStop.lat,
        lng: testStop.lng
      }
    });

    // Generate JWT tokens
    const JWT_SECRET = getConfig().JWT_SECRET;
    conductorToken = jwt.sign(
      { id: conductorUser.id, role: 'CONDUCTOR', phone: conductorUser.phone },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    driverToken = jwt.sign(
      { id: driverUser.id, role: 'DRIVER', phone: driverUser.phone },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    adminToken = jwt.sign(
      { id: adminUser.id, role: 'ADMIN', phone: adminUser.phone },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.attendance.deleteMany({
      where: {
        busId: { startsWith: 'test-conductor-' }
      }
    });
    await prisma.tripStop.deleteMany({
      where: {
        trip: {
          busId: { startsWith: 'test-conductor-' }
        }
      }
    });
    await prisma.trip.deleteMany({
      where: {
        busId: { startsWith: 'test-conductor-' }
      }
    });
    await prisma.student.deleteMany({
      where: {
        busId: { startsWith: 'test-conductor-' }
      }
    });
    await prisma.conductor.deleteMany({
      where: {
        phone: { in: ['1234567890', '0987654321'] }
      }
    });
    await prisma.driver.deleteMany({
      where: {
        phone: '1111111111'
      }
    });
    await prisma.bus.deleteMany({
      where: {
        id: { startsWith: 'test-conductor-' }
      }
    });
    await prisma.stop.deleteMany({
      where: {
        id: { startsWith: 'test-conductor-stop-' }
      }
    });
    await prisma.route.deleteMany({
      where: {
        id: { startsWith: 'test-conductor-route-' }
      }
    });
    await prisma.user.deleteMany({
      where: {
        phone: { in: ['1234567890', '0987654321', '1111111111', '2222222222'] }
      }
    });

    await prisma.$disconnect();
  });

  describe('POST /api/attendance (Mark Attendance)', () => {
    test('Conductor can mark student attendance for their assigned bus', async () => {
      const response = await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${conductorToken}`)
        .send({
          studentId: testStudent.id,
          busId: testBus.id,
          tripId: activeTrip.id,
          date: new Date().toISOString().split('T')[0],
          tripType: 'PICKUP',
          type: 'PICKUP',
          boarded: true,
          conductorId: testConductor.id
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.attendance).toBeDefined();
      expect(response.body.attendance.studentId).toBe(testStudent.id);
      expect(response.body.attendance.boarded).toBe(true);
    });

    test('Conductor cannot mark attendance for a bus they are not assigned to', async () => {
      // Create another bus
      const otherBus = await prisma.bus.create({
        data: {
          id: 'test-conductor-bus-2',
          busNo: 'TEST-COND-002',
          driverName: 'Other Driver'
        }
      });

      const response = await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${conductorToken}`)
        .send({
          studentId: testStudent.id,
          busId: otherBus.id,
          date: new Date().toISOString().split('T')[0],
          tripType: 'PICKUP',
          boarded: true
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('Forbidden');

      // Cleanup
      await prisma.bus.delete({ where: { id: otherBus.id } });
    });

    test('Driver can mark attendance for their assigned bus', async () => {
      const response = await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          studentId: testStudent.id,
          busId: testBus.id,
          tripId: activeTrip.id,
          date: new Date().toISOString().split('T')[0],
          tripType: 'PICKUP',
          type: 'PICKUP',
          boarded: true
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('Admin can mark attendance for any bus', async () => {
      const response = await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId: testStudent.id,
          busId: testBus.id,
          tripId: activeTrip.id,
          date: new Date().toISOString().split('T')[0],
          tripType: 'PICKUP',
          type: 'PICKUP',
          boarded: true
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('Unauthenticated user cannot mark attendance', async () => {
      const response = await request(app)
        .post('/api/attendance')
        .send({
          studentId: testStudent.id,
          busId: testBus.id,
          date: new Date().toISOString().split('T')[0],
          tripType: 'PICKUP',
          boarded: true
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/trips/current/students', () => {
    test('Conductor can access current trip students for their assigned bus', async () => {
      const response = await request(app)
        .get('/api/trips/current/students')
        .set('Authorization', `Bearer ${conductorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.trip).toBeDefined();
      expect(response.body.trip.id).toBe(activeTrip.id);
      expect(response.body.stops).toBeDefined();
      expect(Array.isArray(response.body.stops)).toBe(true);
    });

    test('Driver can access current trip students for their assigned bus', async () => {
      const response = await request(app)
        .get('/api/trips/current/students')
        .set('Authorization', `Bearer ${driverToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.trip).toBeDefined();
    });

    test('Conductor without bus assignment gets empty response', async () => {
      // Create conductor without bus
      const noBusConductor = await prisma.conductor.create({
        data: {
          id: 'test-conductor-2',
          name: 'No Bus Conductor',
          phone: '0987654321',
          busId: null
        }
      });

      const noBusUser = await prisma.user.create({
        data: {
          id: 'test-conductor-user-2',
          phone: '0987654321',
          role: 'CONDUCTOR'
        }
      });

      const noBusToken = jwt.sign(
        { id: noBusUser.id, role: 'CONDUCTOR', phone: noBusUser.phone },
        getConfig().JWT_SECRET,
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/api/trips/current/students')
        .set('Authorization', `Bearer ${noBusToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.students).toEqual([]);
      expect(response.body.trip).toBeNull();

      // Cleanup
      await prisma.conductor.delete({ where: { id: noBusConductor.id } });
      await prisma.user.delete({ where: { id: noBusUser.id } });
    });

    test('Unauthenticated user cannot access trip students', async () => {
      const response = await request(app)
        .get('/api/trips/current/students');

      expect(response.status).toBe(401);
    });

    test('Parent role cannot access trip students endpoint', async () => {
      const parentUser = await prisma.user.create({
        data: {
          id: 'test-parent-user-1',
          phone: '3333333333',
          role: 'PARENT'
        }
      });

      const parentToken = jwt.sign(
        { id: parentUser.id, role: 'PARENT', phone: parentUser.phone },
        getConfig().JWT_SECRET,
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/api/trips/current/students')
        .set('Authorization', `Bearer ${parentToken}`);

      expect(response.status).toBe(403);

      // Cleanup
      await prisma.user.delete({ where: { id: parentUser.id } });
    });
  });

  describe('GET /api/trips/current', () => {
    test('Conductor can access current trip information', async () => {
      const response = await request(app)
        .get('/api/trips/current')
        .set('Authorization', `Bearer ${conductorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('Driver can access current trip information', async () => {
      const response = await request(app)
        .get('/api/trips/current')
        .set('Authorization', `Bearer ${driverToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Access Service - Conductor Bus Access', () => {
    test('Conductor can view their assigned bus', async () => {
      const { canViewBus } = require('../src/services/accessService');
      
      const canView = await canViewBus(
        { id: conductorUser.id, role: 'CONDUCTOR', phone: conductorUser.phone },
        testBus.id
      );

      expect(canView).toBe(true);
    });

    test('Conductor cannot view a bus they are not assigned to', async () => {
      const { canViewBus } = require('../src/services/accessService');
      
      const otherBus = await prisma.bus.create({
        data: {
          id: 'test-conductor-bus-3',
          busNo: 'TEST-COND-003',
          driverName: 'Other Driver'
        }
      });

      const canView = await canViewBus(
        { id: conductorUser.id, role: 'CONDUCTOR', phone: conductorUser.phone },
        otherBus.id
      );

      expect(canView).toBe(false);

      // Cleanup
      await prisma.bus.delete({ where: { id: otherBus.id } });
    });

    test('Conductor gets correct Socket.IO room for their bus', async () => {
      const { roomsForUser, busRoom } = require('../src/services/accessService');
      
      const rooms = await roomsForUser({
        id: conductorUser.id,
        role: 'CONDUCTOR',
        phone: conductorUser.phone
      });

      expect(rooms).toContain(busRoom(testBus.id));
      expect(rooms.length).toBe(1);
    });
  });

  describe('requireRole Middleware - Conductor Access', () => {
    test('requireRole allows CONDUCTOR for protected endpoints', () => {
      const { requireRole } = require('../src/middleware/requireRole');
      
      const req = { user: { id: conductorUser.id, role: 'CONDUCTOR' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      requireRole('CONDUCTOR', 'DRIVER')(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('requireRole blocks CONDUCTOR when not in allowed roles', () => {
      const { requireRole } = require('../src/middleware/requireRole');
      
      const req = { user: { id: conductorUser.id, role: 'CONDUCTOR' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      requireRole('ADMIN', 'DRIVER')(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('Attendance with Conductor ID', () => {
    test('Attendance record includes conductorId when marked by conductor', async () => {
      const response = await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${conductorToken}`)
        .send({
          studentId: testStudent.id,
          busId: testBus.id,
          tripId: activeTrip.id,
          date: new Date().toISOString().split('T')[0],
          tripType: 'PICKUP',
          type: 'PICKUP',
          boarded: true,
          conductorId: testConductor.id
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.attendance.conductorId).toBe(testConductor.id);

      // Verify in database
      const attendance = await prisma.attendance.findFirst({
        where: {
          studentId: testStudent.id,
          tripId: activeTrip.id,
          type: 'PICKUP'
        }
      });

      expect(attendance).toBeDefined();
      expect(attendance.conductorId).toBe(testConductor.id);
    });

    test('Conductor cannot use another conductors ID', async () => {
      // Create another conductor
      const otherConductor = await prisma.conductor.create({
        data: {
          id: 'test-conductor-3',
          name: 'Other Conductor',
          phone: '5555555555',
          busId: null
        }
      });

      const response = await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${conductorToken}`)
        .send({
          studentId: testStudent.id,
          busId: testBus.id,
          tripId: activeTrip.id,
          date: new Date().toISOString().split('T')[0],
          tripType: 'PICKUP',
          type: 'PICKUP',
          boarded: true,
          conductorId: otherConductor.id
        });

      // Should fail authorization
      expect(response.status).toBe(403);

      // Cleanup
      await prisma.conductor.delete({ where: { id: otherConductor.id } });
    });
  });
});

/**
 * Integration Test for Task 13.3: Complete DROP Trip Flow
 * 
 * End-to-end integration test covering the DROP direction specifically:
 * 1. Driver starts a DROP trip
 * 2. System loads students using dropStopId
 * 3. Driver/Conductor marks attendance at drop stops
 * 4. Real-time updates propagate to other devices
 * 5. Attendance tracking uses DROP type
 * 6. Parent notifications sent for drop-offs
 * 7. Trip completes at all drop locations
 * 
 * This test validates the complete workflow from school to home with attendance marking.
 * 
 * Validates Requirements: 3.3, 3.4, 5.1, 5.2, 5.3, 9.1, 9.2, 9.3, 9.4, 9.5, 16.1, 16.2, 16.3
 */

const request = require('supertest');
const prisma = require('../src/db');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { io: ioClient } = require('socket.io-client');
const jwt = require('jsonwebtoken');

const SECRET = 'test-secret-drop-flow';
const TIMEOUT_MS = 5000;
const WAIT_MS = 500;

describe('Complete DROP Trip Flow (Task 13.3)', () => {
  let httpServer, io, app, url;
  let testBus, testDriver, testConductor, testTrip;
  let stop1, stop2, stop3; // Drop stops
  let student1, student2, student3, student4; // Students at different stops
  let parentUser1, parentUser2, parentUser3, parentUser4;
  let socketClients = [];
  let mockSendMulticast;

  // Helper to create socket client
  const createSocketClient = (role, phone) => {
    const token = jwt.sign({ id: `user-${phone}`, role }, SECRET);
    return new Promise((resolve, reject) => {
      const socket = ioClient(url, {
        auth: { token },
        transports: ['websocket'],
        reconnection: false,
        forceNew: true
      });
      
      const timer = setTimeout(() => {
        reject(new Error('Socket connection timeout'));
      }, TIMEOUT_MS);

      socket.once('connect', () => {
        clearTimeout(timer);
        socketClients.push(socket);
        resolve(socket);
      });

      socket.once('connect_error', (err) => {
        clearTimeout(timer);
        reject(err);
      });
    });
  };

  // Helper to wait for socket event with predicate
  const waitForEvent = (socket, eventName, predicate = () => true, timeout = TIMEOUT_MS) => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        socket.off(eventName, handler);
        reject(new Error(`Timeout waiting for ${eventName}`));
      }, timeout);

      const handler = (data) => {
        if (predicate(data)) {
          clearTimeout(timer);
          socket.off(eventName, handler);
          resolve(data);
        }
      };

      socket.on(eventName, handler);
    });
  };

  // Helper to record all events
  const recordEvents = (socket, eventName) => {
    const events = [];
    const handler = (data) => events.push({ timestamp: Date.now(), data });
    socket.on(eventName, handler);
    events.cleanup = () => socket.off(eventName, handler);
    return events;
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  beforeAll(async () => {
    // Mock notification service
    mockSendMulticast = jest.fn().mockResolvedValue({
      successCount: 1,
      failureCount: 0
    });
    jest.mock('../src/services/notificationService', () => ({
      sendNotification: jest.fn(),
      sendMulticast: mockSendMulticast
    }));

    // Create HTTP server with Socket.IO
    httpServer = http.createServer();
    io = new Server(httpServer, {
      cors: { origin: '*' }
    });

    // Socket.IO authentication middleware
    io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('unauthorized'));
      
      try {
        const decoded = jwt.verify(token, SECRET);
        socket.user = decoded;
        next();
      } catch (err) {
        next(new Error('unauthorized'));
      }
    });

    // Auto-join bus rooms
    io.on('connection', async (socket) => {
      try {
        const { role, id } = socket.user;
        
        if (role === 'DRIVER') {
          const driver = await prisma.driver.findFirst({
            where: { phone: id.replace('user-', '') }
          });
          if (driver?.busId) {
            socket.join(`bus_${driver.busId}`);
          }
        } else if (role === 'CONDUCTOR') {
          const conductor = await prisma.conductor.findFirst({
            where: { phone: id.replace('user-', '') }
          });
          if (conductor?.busId) {
            socket.join(`bus_${conductor.busId}`);
          }
        } else if (role === 'ADMIN') {
          socket.join('admins');
        }
      } catch (err) {
        console.error('Socket connection error:', err);
      }
    });

    await new Promise(resolve => httpServer.listen(0, '127.0.0.1', resolve));
    url = `http://127.0.0.1:${httpServer.address().port}`;

    // Create Express app
    app = express();
    app.use(express.json());

    // Mock Socket.IO middleware
    app.use((req, res, next) => {
      req.io = io;
      next();
    });

    // Mock authentication middleware
    app.use((req, res, next) => {
      const auth = req.headers.authorization;
      if (auth && auth.startsWith('Bearer ')) {
        try {
          const token = auth.substring(7);
          const decoded = jwt.verify(token, SECRET);
          req.user = {
            id: decoded.id,
            role: decoded.role,
            phone: decoded.id.replace('user-', '')
          };
        } catch (err) {
          // Continue without user
        }
      }
      next();
    });

    // Import and setup routes
    const { markAttendance } = require('../src/controllers/attendanceController');
    const { getCurrentTripStudents } = require('../src/controllers/tripController');
    
    app.post('/api/attendance', markAttendance);
    app.get('/api/trips/current/students', getCurrentTripStudents);

    // Create test data
    testBus = await prisma.bus.create({
      data: {
        busNo: 'DROP-TEST-BUS-01',
        driverName: 'Drop Flow Driver',
        status: 'ACTIVE'
      }
    });

    testDriver = await prisma.driver.create({
      data: {
        name: 'Drop Flow Driver',
        phone: '4000000001',
        busId: testBus.id
      }
    });

    testConductor = await prisma.conductor.create({
      data: {
        name: 'Drop Flow Conductor',
        phone: '4000000002',
        busId: testBus.id
      }
    });

    // Create drop stops
    stop1 = await prisma.stop.create({
      data: {
        name: 'Drop Stop 1 - Riverside',
        latitude: 13.0001,
        longitude: 77.5001
      }
    });

    stop2 = await prisma.stop.create({
      data: {
        name: 'Drop Stop 2 - Oakwood',
        latitude: 13.0002,
        longitude: 77.5002
      }
    });

    stop3 = await prisma.stop.create({
      data: {
        name: 'Drop Stop 3 - Hillcrest',
        latitude: 13.0003,
        longitude: 77.5003
      }
    });

    // Create parent users with FCM tokens
    parentUser1 = await prisma.user.create({
      data: {
        phone: '4000000011',
        password: 'hashed',
        role: 'PARENT',
        fcmToken: 'drop_token_parent_1'
      }
    });

    parentUser2 = await prisma.user.create({
      data: {
        phone: '4000000012',
        password: 'hashed',
        role: 'PARENT',
        fcmToken: 'drop_token_parent_2'
      }
    });

    parentUser3 = await prisma.user.create({
      data: {
        phone: '4000000013',
        password: 'hashed',
        role: 'PARENT',
        fcmToken: 'drop_token_parent_3'
      }
    });

    parentUser4 = await prisma.user.create({
      data: {
        phone: '4000000014',
        password: 'hashed',
        role: 'PARENT',
        fcmToken: 'drop_token_parent_4'
      }
    });

    // Create students assigned to different drop stops
    student1 = await prisma.student.create({
      data: {
        name: 'Alice Chen',
        admissionNo: 'DROP001',
        busId: testBus.id,
        dropStopId: stop1.id,
        parentPhone: parentUser1.phone,
        class: '8A'
      }
    });

    student2 = await prisma.student.create({
      data: {
        name: 'Bob Martinez',
        admissionNo: 'DROP002',
        busId: testBus.id,
        dropStopId: stop1.id,
        parentPhone: parentUser2.phone,
        class: '8A'
      }
    });

    student3 = await prisma.student.create({
      data: {
        name: 'Carol Singh',
        admissionNo: 'DROP003',
        busId: testBus.id,
        dropStopId: stop2.id,
        parentPhone: parentUser3.phone,
        class: '7B'
      }
    });

    student4 = await prisma.student.create({
      data: {
        name: 'David Lee',
        admissionNo: 'DROP004',
        busId: testBus.id,
        dropStopId: stop3.id,
        parentPhone: parentUser4.phone,
        class: '9C'
      }
    });

    // Create ACTIVE DROP trip with stops
    testTrip = await prisma.trip.create({
      data: {
        busId: testBus.id,
        driverId: testDriver.id,
        direction: 'DROP',
        status: 'ACTIVE'
      }
    });

    // Create trip stops in order
    await prisma.tripStop.create({
      data: {
        tripId: testTrip.id,
        stopId: stop1.id,
        name: stop1.name,
        latitude: stop1.latitude,
        longitude: stop1.longitude,
        order: 1,
        status: 'PENDING'
      }
    });

    await prisma.tripStop.create({
      data: {
        tripId: testTrip.id,
        stopId: stop2.id,
        name: stop2.name,
        latitude: stop2.latitude,
        longitude: stop2.longitude,
        order: 2,
        status: 'PENDING'
      }
    });

    await prisma.tripStop.create({
      data: {
        tripId: testTrip.id,
        stopId: stop3.id,
        name: stop3.name,
        latitude: stop3.latitude,
        longitude: stop3.longitude,
        order: 3,
        status: 'PENDING'
      }
    });
  });

  afterAll(async () => {
    // Disconnect all socket clients
    socketClients.forEach(socket => socket.disconnect());
    
    // Close Socket.IO server
    await new Promise(resolve => {
      io.close(() => {
        httpServer.close(resolve);
      });
    });

    // Cleanup database
    await prisma.attendance.deleteMany({ 
      where: { 
        studentId: { in: [student1.id, student2.id, student3.id, student4.id] }
      }
    });
    await prisma.tripStop.deleteMany({ where: { tripId: testTrip.id } });
    await prisma.trip.deleteMany({ where: { id: testTrip.id } });
    await prisma.student.deleteMany({ 
      where: { id: { in: [student1.id, student2.id, student3.id, student4.id] } }
    });
    await prisma.user.deleteMany({ 
      where: { phone: { in: [
        parentUser1.phone, parentUser2.phone, 
        parentUser3.phone, parentUser4.phone
      ] } }
    });
    await prisma.conductor.deleteMany({ where: { id: testConductor.id } });
    await prisma.driver.deleteMany({ where: { id: testDriver.id } });
    await prisma.stop.deleteMany({ 
      where: { id: { in: [stop1.id, stop2.id, stop3.id] } }
    });
    await prisma.bus.deleteMany({ where: { id: testBus.id } });
    await prisma.$disconnect();
  });

  beforeEach(() => {
    mockSendMulticast.mockClear();
  });

  afterEach(async () => {
    // Disconnect any remaining socket clients
    while (socketClients.length > 0) {
      const socket = socketClients.pop();
      socket.disconnect();
    }

    // Clean up attendance records
    await prisma.attendance.deleteMany({ 
      where: { 
        studentId: { in: [student1.id, student2.id, student3.id, student4.id] }
      }
    });
  });

  describe('Step 1: System loads students using dropStopId', () => {
    test('GET /api/trips/current/students returns students grouped by dropStopId for DROP trip', async () => {
      const driverToken = jwt.sign({ id: 'user-4000000001', role: 'DRIVER' }, SECRET);
      
      const response = await request(app)
        .get('/api/trips/current/students')
        .set('Authorization', `Bearer ${driverToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.trip).toBeDefined();
      expect(response.body.trip.direction).toBe('DROP');
      expect(response.body.trip.status).toBe('ACTIVE');

      // Verify stops are returned in order
      expect(response.body.stops).toBeDefined();
      expect(response.body.stops.length).toBe(3);
      expect(response.body.stops[0].name).toBe('Drop Stop 1 - Riverside');
      expect(response.body.stops[1].name).toBe('Drop Stop 2 - Oakwood');
      expect(response.body.stops[2].name).toBe('Drop Stop 3 - Hillcrest');

      // Verify students are grouped by dropStopId
      const stop1Students = response.body.stops[0].students;
      const stop2Students = response.body.stops[1].students;
      const stop3Students = response.body.stops[2].students;

      expect(stop1Students.length).toBe(2); // Alice and Bob
      expect(stop2Students.length).toBe(1); // Carol
      expect(stop3Students.length).toBe(1); // David

      // Verify student details include relevantStop (dropStopId)
      expect(stop1Students.find(s => s.name === 'Alice Chen')).toBeDefined();
      expect(stop1Students.find(s => s.name === 'Bob Martinez')).toBeDefined();
      expect(stop2Students.find(s => s.name === 'Carol Singh')).toBeDefined();
      expect(stop3Students.find(s => s.name === 'David Lee')).toBeDefined();

      // Verify attendance is null initially
      stop1Students.forEach(student => {
        expect(student.attendance).toBeNull();
      });
    });

    test('conductor can also fetch students for DROP trip', async () => {
      const conductorToken = jwt.sign({ id: 'user-4000000002', role: 'CONDUCTOR' }, SECRET);
      
      const response = await request(app)
        .get('/api/trips/current/students')
        .set('Authorization', `Bearer ${conductorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.trip.direction).toBe('DROP');
      expect(response.body.stops.length).toBe(3);
    });
  });

  describe('Step 2-7: Complete DROP flow with attendance marking', () => {
    test('full DROP trip workflow from school to home', async () => {
      // Connect driver and conductor sockets
      const driverSocket = await createSocketClient('DRIVER', '4000000001');
      const conductorSocket = await createSocketClient('CONDUCTOR', '4000000002');

      const driverEvents = recordEvents(driverSocket, 'attendance:updated');
      const conductorEvents = recordEvents(conductorSocket, 'attendance:updated');

      const today = new Date().toISOString().split('T')[0];
      const driverToken = jwt.sign({ id: 'user-4000000001', role: 'DRIVER' }, SECRET);
      const conductorToken = jwt.sign({ id: 'user-4000000002', role: 'CONDUCTOR' }, SECRET);

      // ===== STOP 1: Drop Stop 1 - Riverside (Alice and Bob) =====
      
      // Driver marks Alice as dropped off
      const aliceResponse = await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          studentId: student1.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'DROP',
          type: 'DROP',
          boarded: true
        });

      expect(aliceResponse.status).toBe(200);
      expect(aliceResponse.body.success).toBe(true);
      expect(aliceResponse.body.attendance.type).toBe('DROP');
      expect(aliceResponse.body.attendance.boarded).toBe(true);
      expect(aliceResponse.body.attendance.checkedAt).toBeDefined();

      await sleep(WAIT_MS);

      // Verify parent notification sent for Alice
      expect(mockSendMulticast).toHaveBeenCalledWith(
        expect.arrayContaining(['drop_token_parent_1']),
        'Student Dropped Off',
        expect.stringContaining('Alice Chen'),
        expect.objectContaining({
          studentId: student1.id,
          tripType: 'DROP',
          boarded: 'true'
        })
      );

      // Verify real-time updates propagated
      expect(driverEvents.length).toBeGreaterThanOrEqual(1);
      expect(conductorEvents.length).toBeGreaterThanOrEqual(1);

      const aliceEvent = driverEvents.find(e => e.data.studentId === student1.id);
      expect(aliceEvent).toBeDefined();
      expect(aliceEvent.data.type).toBe('DROP');
      expect(aliceEvent.data.boarded).toBe(true);
      expect(aliceEvent.data.tripId).toBe(testTrip.id);

      mockSendMulticast.mockClear();

      // Conductor marks Bob as dropped off
      const bobResponse = await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${conductorToken}`)
        .send({
          studentId: student2.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'DROP',
          type: 'DROP',
          boarded: true,
          conductorId: testConductor.id
        });

      expect(bobResponse.status).toBe(200);
      expect(bobResponse.body.success).toBe(true);
      expect(bobResponse.body.attendance.conductorId).toBe(testConductor.id);

      await sleep(WAIT_MS);

      // Verify Bob's notification
      expect(mockSendMulticast).toHaveBeenCalledWith(
        expect.arrayContaining(['drop_token_parent_2']),
        'Student Dropped Off',
        expect.stringContaining('Bob Martinez'),
        expect.any(Object)
      );

      mockSendMulticast.mockClear();

      // ===== STOP 2: Drop Stop 2 - Oakwood (Carol) =====

      const carolResponse = await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          studentId: student3.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'DROP',
          type: 'DROP',
          boarded: true
        });

      expect(carolResponse.status).toBe(200);

      await sleep(WAIT_MS);

      expect(mockSendMulticast).toHaveBeenCalledWith(
        expect.arrayContaining(['drop_token_parent_3']),
        'Student Dropped Off',
        expect.stringContaining('Carol Singh'),
        expect.any(Object)
      );

      mockSendMulticast.mockClear();

      // ===== STOP 3: Drop Stop 3 - Hillcrest (David) =====

      const davidResponse = await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${conductorToken}`)
        .send({
          studentId: student4.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'DROP',
          type: 'DROP',
          boarded: true,
          conductorId: testConductor.id
        });

      expect(davidResponse.status).toBe(200);

      await sleep(WAIT_MS);

      expect(mockSendMulticast).toHaveBeenCalledWith(
        expect.arrayContaining(['drop_token_parent_4']),
        'Student Dropped Off',
        expect.stringContaining('David Lee'),
        expect.any(Object)
      );

      // ===== VERIFICATION: All students dropped off =====

      // Verify all attendance records created with DROP type
      const allAttendance = await prisma.attendance.findMany({
        where: {
          tripId: testTrip.id,
          type: 'DROP'
        },
        orderBy: { createdAt: 'asc' }
      });

      expect(allAttendance.length).toBe(4);
      expect(allAttendance.every(a => a.boarded === true)).toBe(true);
      expect(allAttendance.every(a => a.type === 'DROP')).toBe(true);
      expect(allAttendance.every(a => a.tripType === 'DROP')).toBe(true);

      // Verify each student has one record
      const studentIds = allAttendance.map(a => a.studentId);
      expect(studentIds).toContain(student1.id);
      expect(studentIds).toContain(student2.id);
      expect(studentIds).toContain(student3.id);
      expect(studentIds).toContain(student4.id);

      // Verify conductor marks are recorded
      const conductorMarks = allAttendance.filter(a => a.conductorId === testConductor.id);
      expect(conductorMarks.length).toBe(2); // Bob and David

      // Verify all events were broadcast
      expect(driverEvents.length).toBe(4);
      expect(conductorEvents.length).toBe(4);

      // Verify each student ID appears in events
      const driverEventStudentIds = driverEvents.map(e => e.data.studentId);
      expect(driverEventStudentIds).toContain(student1.id);
      expect(driverEventStudentIds).toContain(student2.id);
      expect(driverEventStudentIds).toContain(student3.id);
      expect(driverEventStudentIds).toContain(student4.id);

      driverEvents.cleanup();
      conductorEvents.cleanup();
    });

    test('fetch students after marking shows updated attendance status', async () => {
      const driverToken = jwt.sign({ id: 'user-4000000001', role: 'DRIVER' }, SECRET);
      const today = new Date().toISOString().split('T')[0];

      // Mark Alice as dropped off
      await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          studentId: student1.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'DROP',
          type: 'DROP',
          boarded: true
        });

      // Fetch students again
      const response = await request(app)
        .get('/api/trips/current/students')
        .set('Authorization', `Bearer ${driverToken}`);

      expect(response.status).toBe(200);

      // Find Alice in the response
      const stop1Students = response.body.stops[0].students;
      const alice = stop1Students.find(s => s.name === 'Alice Chen');

      expect(alice).toBeDefined();
      expect(alice.attendance).not.toBeNull();
      expect(alice.attendance.boarded).toBe(true);
      expect(alice.attendance.checkedAt).toBeDefined();

      // Bob should still be null
      const bob = stop1Students.find(s => s.name === 'Bob Martinez');
      expect(bob.attendance).toBeNull();
    });

    test('drop notification message contains correct emoji and wording', async () => {
      const driverToken = jwt.sign({ id: 'user-4000000001', role: 'DRIVER' }, SECRET);
      const today = new Date().toISOString().split('T')[0];

      await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          studentId: student1.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'DROP',
          type: 'DROP',
          boarded: true
        });

      await sleep(WAIT_MS);

      expect(mockSendMulticast).toHaveBeenCalled();
      const callArgs = mockSendMulticast.mock.calls[0];
      
      // Verify title
      expect(callArgs[1]).toBe('Student Dropped Off');
      
      // Verify message contains home emoji and student name
      expect(callArgs[2]).toMatch(/🏠/);
      expect(callArgs[2]).toMatch(/Alice Chen/);
      expect(callArgs[2]).toMatch(/dropped off/i);
    });

    test('upsert prevents duplicate DROP attendance records', async () => {
      const driverToken = jwt.sign({ id: 'user-4000000001', role: 'DRIVER' }, SECRET);
      const today = new Date().toISOString().split('T')[0];

      // Mark Alice as dropped off
      await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          studentId: student1.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'DROP',
          type: 'DROP',
          boarded: true
        });

      // Try to mark Alice again (e.g., correction)
      await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          studentId: student1.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'DROP',
          type: 'DROP',
          boarded: false // Changed status
        });

      // Verify only one record exists
      const attendanceRecords = await prisma.attendance.findMany({
        where: {
          tripId: testTrip.id,
          studentId: student1.id,
          type: 'DROP'
        }
      });

      expect(attendanceRecords.length).toBe(1);
      expect(attendanceRecords[0].boarded).toBe(false); // Updated value
    });

    test('marking boarded=false still sends notification with correct message', async () => {
      const driverToken = jwt.sign({ id: 'user-4000000001', role: 'DRIVER' }, SECRET);
      const today = new Date().toISOString().split('T')[0];

      await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          studentId: student1.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'DROP',
          type: 'DROP',
          boarded: false
        });

      await sleep(WAIT_MS);

      expect(mockSendMulticast).toHaveBeenCalled();
      const callArgs = mockSendMulticast.mock.calls[0];
      
      // Verify message contains "Not Dropped Off"
      expect(callArgs[2]).toMatch(/not dropped off/i);
      expect(callArgs[2]).toMatch(/Alice Chen/);
    });
  });

  describe('Error Scenarios', () => {
    test('cannot mark attendance for inactive DROP trip', async () => {
      const driverToken = jwt.sign({ id: 'user-4000000001', role: 'DRIVER' }, SECRET);
      const today = new Date().toISOString().split('T')[0];

      // Create completed DROP trip
      const completedTrip = await prisma.trip.create({
        data: {
          busId: testBus.id,
          driverId: testDriver.id,
          direction: 'DROP',
          status: 'COMPLETED'
        }
      });

      const response = await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          studentId: student1.id,
          busId: testBus.id,
          tripId: completedTrip.id,
          date: today,
          tripType: 'DROP',
          type: 'DROP',
          boarded: true
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toBe('Invalid or inactive trip');

      // Cleanup
      await prisma.trip.delete({ where: { id: completedTrip.id } });
    });

    test('student without dropStopId can still be marked (e.g., added later)', async () => {
      const driverToken = jwt.sign({ id: 'user-4000000001', role: 'DRIVER' }, SECRET);
      const today = new Date().toISOString().split('T')[0];

      // Create student without dropStopId
      const studentNoStop = await prisma.student.create({
        data: {
          name: 'Emergency Rider',
          admissionNo: 'DROP999',
          busId: testBus.id,
          dropStopId: null,
          parentPhone: null,
          class: '10A'
        }
      });

      const response = await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          studentId: studentNoStop.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'DROP',
          type: 'DROP',
          boarded: true
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Cleanup
      await prisma.attendance.deleteMany({ where: { studentId: studentNoStop.id } });
      await prisma.student.delete({ where: { id: studentNoStop.id } });
    });

    test('no notification sent when parent has no FCM token', async () => {
      const driverToken = jwt.sign({ id: 'user-4000000001', role: 'DRIVER' }, SECRET);
      const today = new Date().toISOString().split('T')[0];

      // Create parent without FCM token
      const parentNoToken = await prisma.user.create({
        data: {
          phone: '4000000099',
          password: 'hashed',
          role: 'PARENT',
          fcmToken: null
        }
      });

      // Create student with this parent
      const studentNoToken = await prisma.student.create({
        data: {
          name: 'Student No Token',
          admissionNo: 'DROP998',
          busId: testBus.id,
          dropStopId: stop1.id,
          parentPhone: parentNoToken.phone,
          class: '6C'
        }
      });

      mockSendMulticast.mockClear();

      await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          studentId: studentNoToken.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'DROP',
          type: 'DROP',
          boarded: true
        });

      await sleep(WAIT_MS);

      // Verify no notification was sent
      expect(mockSendMulticast).not.toHaveBeenCalled();

      // Cleanup
      await prisma.attendance.deleteMany({ where: { studentId: studentNoToken.id } });
      await prisma.student.delete({ where: { id: studentNoToken.id } });
      await prisma.user.delete({ where: { phone: parentNoToken.phone } });
    });
  });

  describe('Performance and Real-time Updates', () => {
    test('socket.io events propagate within 1 second', async () => {
      const driverSocket = await createSocketClient('DRIVER', '4000000001');
      const conductorSocket = await createSocketClient('CONDUCTOR', '4000000002');

      const eventPromise = waitForEvent(
        conductorSocket,
        'attendance:updated',
        (data) => data.studentId === student1.id
      );

      const driverToken = jwt.sign({ id: 'user-4000000001', role: 'DRIVER' }, SECRET);
      const today = new Date().toISOString().split('T')[0];

      const startTime = Date.now();

      await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          studentId: student1.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'DROP',
          type: 'DROP',
          boarded: true
        });

      const event = await eventPromise;
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(event).toBeDefined();
      expect(event.studentId).toBe(student1.id);
      expect(duration).toBeLessThan(1000); // Within 1 second
    });

    test('multiple rapid drop-offs are processed correctly', async () => {
      const driverToken = jwt.sign({ id: 'user-4000000001', role: 'DRIVER' }, SECRET);
      const today = new Date().toISOString().split('T')[0];

      // Mark all students rapidly
      const promises = [student1, student2, student3, student4].map(student =>
        request(app)
          .post('/api/attendance')
          .set('Authorization', `Bearer ${driverToken}`)
          .send({
            studentId: student.id,
            busId: testBus.id,
            tripId: testTrip.id,
            date: today,
            tripType: 'DROP',
            type: 'DROP',
            boarded: true
          })
      );

      const responses = await Promise.all(promises);

      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      // Verify all records created
      const records = await prisma.attendance.findMany({
        where: {
          tripId: testTrip.id,
          type: 'DROP'
        }
      });

      expect(records.length).toBe(4);
    });
  });
});

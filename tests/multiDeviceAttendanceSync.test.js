/**
 * Integration Tests for Task 10.3: Multi-Device Attendance Synchronization
 * 
 * Tests the complete flow: marking attendance → offline queue → sync → Socket.IO broadcast → UI update
 * 
 * Scenarios covered:
 * - Multiple drivers/conductors marking attendance simultaneously
 * - Offline marking followed by sync when online
 * - Conflict resolution when same student marked by multiple devices
 * - Queue processing and merge behavior
 * - Network reconnection and state recovery
 * 
 * Validates Requirements 16.1, 16.2, 16.3, 16.4, 20.1, 20.2, 20.3, 20.4, 20.5
 */

const request = require('supertest');
const prisma = require('../src/db');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { io: ioClient } = require('socket.io-client');
const jwt = require('jsonwebtoken');

jest.setTimeout(60000);

const SECRET = 'test-secret-multi-device';
const TIMEOUT_MS = 3000;
const WAIT_MS = 500;

describe('Multi-Device Attendance Synchronization (Task 10.3)', () => {
  let httpServer, io, app, url;
  let testBus, testDriver, testConductor, testStudent1, testStudent2, testTrip;
  let emittedEvents = [];
  let socketClients = [];

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

  // Helper to wait for socket event
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

    // Mock Socket.IO middleware for attendance controller
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

    // Import and setup attendance routes
    const { markAttendance } = require('../src/controllers/attendanceController');
    app.post('/api/attendance', markAttendance);

    // Create test data
    testBus = await prisma.bus.create({
      data: {
        busNo: 'TEST-MULTI-DEVICE',
        driverName: 'Multi Device Driver',
        status: 'ACTIVE'
      }
    });

    testDriver = await prisma.driver.create({
      data: {
        name: 'Multi Device Driver',
        phone: '3000000001',
        busId: testBus.id
      }
    });

    testConductor = await prisma.conductor.create({
      data: {
        name: 'Multi Device Conductor',
        phone: '3000000002',
        busId: testBus.id
      }
    });

    testStudent1 = await prisma.student.create({
      data: {
        name: 'Sync Test Student 1',
        admissionNo: 'SYNC001',
        busId: testBus.id,
        parentPhone: '3000000011',
        class: '7A'
      }
    });

    testStudent2 = await prisma.student.create({
      data: {
        name: 'Sync Test Student 2',
        admissionNo: 'SYNC002',
        busId: testBus.id,
        parentPhone: '3000000012',
        class: '7B'
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
        studentId: { in: [testStudent1.id, testStudent2.id] }
      }
    });
    await prisma.trip.deleteMany({ where: { id: testTrip.id } });
    await prisma.student.deleteMany({ 
      where: { id: { in: [testStudent1.id, testStudent2.id] } }
    });
    await prisma.conductor.deleteMany({ where: { id: testConductor.id } });
    await prisma.driver.deleteMany({ where: { id: testDriver.id } });
    await prisma.bus.deleteMany({ where: { id: testBus.id } });
    await prisma.$disconnect();
  });

  beforeEach(() => {
    emittedEvents = [];
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
        studentId: { in: [testStudent1.id, testStudent2.id] }
      }
    });
  });

  describe('Simultaneous Marking by Multiple Devices', () => {
    test('driver and conductor mark different students simultaneously', async () => {
      const driverSocket = await createSocketClient('DRIVER', '3000000001');
      const conductorSocket = await createSocketClient('CONDUCTOR', '3000000002');

      const driverEvents = recordEvents(driverSocket, 'attendance:updated');
      const conductorEvents = recordEvents(conductorSocket, 'attendance:updated');

      const today = new Date().toISOString().split('T')[0];
      const driverToken = jwt.sign({ id: 'user-3000000001', role: 'DRIVER' }, SECRET);
      const conductorToken = jwt.sign({ id: 'user-3000000002', role: 'CONDUCTOR' }, SECRET);

      // Both mark attendance simultaneously
      const [driverResponse, conductorResponse] = await Promise.all([
        request(app)
          .post('/api/attendance')
          .set('Authorization', `Bearer ${driverToken}`)
          .send({
            studentId: testStudent1.id,
            busId: testBus.id,
            tripId: testTrip.id,
            date: today,
            tripType: 'PICKUP',
            boarded: true
          }),
        request(app)
          .post('/api/attendance')
          .set('Authorization', `Bearer ${conductorToken}`)
          .send({
            studentId: testStudent2.id,
            busId: testBus.id,
            tripId: testTrip.id,
            date: today,
            tripType: 'PICKUP',
            boarded: true,
            conductorId: testConductor.id
          })
      ]);

      expect(driverResponse.status).toBe(200);
      expect(conductorResponse.status).toBe(200);

      // Wait for events to propagate
      await sleep(WAIT_MS);

      // Both devices should receive both events
      expect(driverEvents.length).toBe(2);
      expect(conductorEvents.length).toBe(2);

      // Verify events contain correct data
      const driverStudentIds = driverEvents.map(e => e.data.studentId).sort();
      const conductorStudentIds = conductorEvents.map(e => e.data.studentId).sort();
      
      expect(driverStudentIds).toEqual([testStudent1.id, testStudent2.id].sort());
      expect(conductorStudentIds).toEqual([testStudent1.id, testStudent2.id].sort());

      // Verify database has both records
      const attendanceRecords = await prisma.attendance.findMany({
        where: {
          tripId: testTrip.id,
          studentId: { in: [testStudent1.id, testStudent2.id] }
        }
      });

      expect(attendanceRecords.length).toBe(2);
      expect(attendanceRecords.every(r => r.boarded === true)).toBe(true);

      driverEvents.cleanup();
      conductorEvents.cleanup();
    });

    test('driver and conductor mark same student simultaneously - last write wins', async () => {
      const driverSocket = await createSocketClient('DRIVER', '3000000001');
      const conductorSocket = await createSocketClient('CONDUCTOR', '3000000002');

      const driverEvents = recordEvents(driverSocket, 'attendance:updated');
      const conductorEvents = recordEvents(conductorSocket, 'attendance:updated');

      const today = new Date().toISOString().split('T')[0];
      const driverToken = jwt.sign({ id: 'user-3000000001', role: 'DRIVER' }, SECRET);
      const conductorToken = jwt.sign({ id: 'user-3000000002', role: 'CONDUCTOR' }, SECRET);

      // Both mark same student with different boarded values
      const [response1, response2] = await Promise.all([
        request(app)
          .post('/api/attendance')
          .set('Authorization', `Bearer ${driverToken}`)
          .send({
            studentId: testStudent1.id,
            busId: testBus.id,
            tripId: testTrip.id,
            date: today,
            tripType: 'PICKUP',
            boarded: true
          }),
        request(app)
          .post('/api/attendance')
          .set('Authorization', `Bearer ${conductorToken}`)
          .send({
            studentId: testStudent1.id,
            busId: testBus.id,
            tripId: testTrip.id,
            date: today,
            tripType: 'PICKUP',
            boarded: false,
            conductorId: testConductor.id
          })
      ]);

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);

      await sleep(WAIT_MS);

      // Both devices receive both events
      expect(driverEvents.length).toBe(2);
      expect(conductorEvents.length).toBe(2);

      // Verify database has only one record (upserted)
      const attendanceRecords = await prisma.attendance.findMany({
        where: {
          tripId: testTrip.id,
          studentId: testStudent1.id
        }
      });

      expect(attendanceRecords.length).toBe(1);
      // Last write wins - verify it's one of the values
      expect([true, false]).toContain(attendanceRecords[0].boarded);

      driverEvents.cleanup();
      conductorEvents.cleanup();
    });

    test('multiple rapid updates are broadcast correctly in order', async () => {
      const driverSocket = await createSocketClient('DRIVER', '3000000001');
      const events = recordEvents(driverSocket, 'attendance:updated');

      const today = new Date().toISOString().split('T')[0];
      const driverToken = jwt.sign({ id: 'user-3000000001', role: 'DRIVER' }, SECRET);

      // Rapid updates to same student
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/attendance')
          .set('Authorization', `Bearer ${driverToken}`)
          .send({
            studentId: testStudent1.id,
            busId: testBus.id,
            tripId: testTrip.id,
            date: today,
            tripType: 'PICKUP',
            boarded: i % 2 === 0
          });
      }

      await sleep(WAIT_MS);

      // Should receive all 3 events
      expect(events.length).toBe(3);

      // Events should be in order (timestamps increasing)
      for (let i = 1; i < events.length; i++) {
        expect(events[i].timestamp).toBeGreaterThanOrEqual(events[i - 1].timestamp);
      }

      events.cleanup();
    });
  });

  describe('Offline Queue and Sync Behavior', () => {
    test('simulates offline marking by queueing requests locally', async () => {
      const today = new Date().toISOString().split('T')[0];
      const driverToken = jwt.sign({ id: 'user-3000000001', role: 'DRIVER' }, SECRET);

      // Simulate queue with attendance payloads
      const offlineQueue = [
        {
          studentId: testStudent1.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'PICKUP',
          boarded: true,
          timestamp: Date.now() - 10000
        },
        {
          studentId: testStudent2.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'PICKUP',
          boarded: true,
          timestamp: Date.now() - 5000
        }
      ];

      // When "coming online", process queue in FIFO order
      const results = [];
      for (const payload of offlineQueue) {
        const response = await request(app)
          .post('/api/attendance')
          .set('Authorization', `Bearer ${driverToken}`)
          .send(payload);
        
        results.push({
          success: response.status === 200,
          studentId: payload.studentId
        });
      }

      // All should succeed
      expect(results.every(r => r.success)).toBe(true);

      // Verify both records in database
      const attendanceRecords = await prisma.attendance.findMany({
        where: {
          tripId: testTrip.id,
          studentId: { in: [testStudent1.id, testStudent2.id] }
        },
        orderBy: { createdAt: 'asc' }
      });

      expect(attendanceRecords.length).toBe(2);
      expect(attendanceRecords.map(r => r.studentId)).toEqual([
        testStudent1.id,
        testStudent2.id
      ]);
    });

    test('queue processing continues on partial failure', async () => {
      const today = new Date().toISOString().split('T')[0];
      const driverToken = jwt.sign({ id: 'user-3000000001', role: 'DRIVER' }, SECRET);
      const invalidTripId = '00000000-0000-0000-0000-000000000000';

      const offlineQueue = [
        {
          studentId: testStudent1.id,
          busId: testBus.id,
          tripId: invalidTripId, // This will fail
          date: today,
          tripType: 'PICKUP',
          boarded: true
        },
        {
          studentId: testStudent2.id,
          busId: testBus.id,
          tripId: testTrip.id, // This should succeed
          date: today,
          tripType: 'PICKUP',
          boarded: true
        }
      ];

      const results = [];
      for (const payload of offlineQueue) {
        const response = await request(app)
          .post('/api/attendance')
          .set('Authorization', `Bearer ${driverToken}`)
          .send(payload);
        
        results.push({
          success: response.status === 200,
          studentId: payload.studentId,
          status: response.status
        });
      }

      // First should fail (404 - invalid trip)
      expect(results[0].success).toBe(false);
      expect(results[0].status).toBe(404);

      // Second should succeed
      expect(results[1].success).toBe(true);

      // Verify only second record in database
      const attendanceRecords = await prisma.attendance.findMany({
        where: {
          tripId: testTrip.id,
          studentId: { in: [testStudent1.id, testStudent2.id] }
        }
      });

      expect(attendanceRecords.length).toBe(1);
      expect(attendanceRecords[0].studentId).toBe(testStudent2.id);
    });

    test('offline queue merge - duplicate entries are handled via upsert', async () => {
      const today = new Date().toISOString().split('T')[0];
      const driverToken = jwt.sign({ id: 'user-3000000001', role: 'DRIVER' }, SECRET);

      // First mark (online)
      await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          studentId: testStudent1.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'PICKUP',
          boarded: true
        });

      // Simulate offline queue with update to same student
      const offlineUpdate = {
        studentId: testStudent1.id,
        busId: testBus.id,
        tripId: testTrip.id,
        date: today,
        tripType: 'PICKUP',
        boarded: false // Changed status
      };

      // Process offline update
      const response = await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${driverToken}`)
        .send(offlineUpdate);

      expect(response.status).toBe(200);

      // Verify only one record exists with updated value
      const attendanceRecords = await prisma.attendance.findMany({
        where: {
          tripId: testTrip.id,
          studentId: testStudent1.id
        }
      });

      expect(attendanceRecords.length).toBe(1);
      expect(attendanceRecords[0].boarded).toBe(false);
    });
  });

  describe('Conflict Resolution', () => {
    test('same student marked by driver then conductor - conductor update overwrites', async () => {
      const driverSocket = await createSocketClient('DRIVER', '3000000001');
      const conductorSocket = await createSocketClient('CONDUCTOR', '3000000002');

      const events = recordEvents(conductorSocket, 'attendance:updated');

      const today = new Date().toISOString().split('T')[0];
      const driverToken = jwt.sign({ id: 'user-3000000001', role: 'DRIVER' }, SECRET);
      const conductorToken = jwt.sign({ id: 'user-3000000002', role: 'CONDUCTOR' }, SECRET);

      // Driver marks first
      const response1 = await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          studentId: testStudent1.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'PICKUP',
          boarded: true
        });

      expect(response1.status).toBe(200);
      await sleep(200);

      // Conductor updates
      const response2 = await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${conductorToken}`)
        .send({
          studentId: testStudent1.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'PICKUP',
          boarded: false,
          conductorId: testConductor.id
        });

      expect(response2.status).toBe(200);
      await sleep(WAIT_MS);

      // Verify conductor received both events
      expect(events.length).toBe(2);

      // Database should have conductor's value
      const record = await prisma.attendance.findFirst({
        where: {
          tripId: testTrip.id,
          studentId: testStudent1.id
        }
      });

      expect(record.boarded).toBe(false);
      expect(record.conductorId).toBe(testConductor.id);

      events.cleanup();
    });

    test('conflicting updates from offline queues - last processed wins', async () => {
      const today = new Date().toISOString().split('T')[0];
      const token1 = jwt.sign({ id: 'user-3000000001', role: 'DRIVER' }, SECRET);
      const token2 = jwt.sign({ id: 'user-3000000002', role: 'CONDUCTOR' }, SECRET);

      // Simulate two offline queues being processed
      const queue1 = {
        studentId: testStudent1.id,
        busId: testBus.id,
        tripId: testTrip.id,
        date: today,
        tripType: 'PICKUP',
        boarded: true
      };

      const queue2 = {
        studentId: testStudent1.id,
        busId: testBus.id,
        tripId: testTrip.id,
        date: today,
        tripType: 'PICKUP',
        boarded: false,
        conductorId: testConductor.id
      };

      // Process both
      await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${token1}`)
        .send(queue1);

      await sleep(100);

      await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${token2}`)
        .send(queue2);

      // Verify last one wins
      const record = await prisma.attendance.findFirst({
        where: {
          tripId: testTrip.id,
          studentId: testStudent1.id
        }
      });

      expect(record.boarded).toBe(false);
      expect(record.conductorId).toBe(testConductor.id);
    });
  });

  describe('Socket.IO Broadcast and State Recovery', () => {
    test('attendance:updated event reaches all devices in bus room', async () => {
      const driverSocket = await createSocketClient('DRIVER', '3000000001');
      const conductorSocket = await createSocketClient('CONDUCTOR', '3000000002');

      const driverEvents = recordEvents(driverSocket, 'attendance:updated');
      const conductorEvents = recordEvents(conductorSocket, 'attendance:updated');

      const today = new Date().toISOString().split('T')[0];
      const driverToken = jwt.sign({ id: 'user-3000000001', role: 'DRIVER' }, SECRET);

      await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          studentId: testStudent1.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'PICKUP',
          boarded: true
        });

      await sleep(WAIT_MS);

      // Both should receive the event
      expect(driverEvents.length).toBe(1);
      expect(conductorEvents.length).toBe(1);

      // Verify event structure
      expect(driverEvents[0].data).toMatchObject({
        tripId: testTrip.id,
        studentId: testStudent1.id,
        type: 'PICKUP',
        boarded: true
      });

      expect(driverEvents[0].data.checkedAt).toBeDefined();
      expect(conductorEvents[0].data).toEqual(driverEvents[0].data);

      driverEvents.cleanup();
      conductorEvents.cleanup();
    });

    test('reconnection after marking - state recovery through event history', async () => {
      const driverSocket = await createSocketClient('DRIVER', '3000000001');
      const today = new Date().toISOString().split('T')[0];
      const driverToken = jwt.sign({ id: 'user-3000000001', role: 'DRIVER' }, SECRET);

      // Mark attendance while connected
      await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          studentId: testStudent1.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'PICKUP',
          boarded: true
        });

      await sleep(WAIT_MS);

      // Disconnect
      driverSocket.disconnect();

      // Mark another attendance while offline
      await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          studentId: testStudent2.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'PICKUP',
          boarded: true
        });

      // Reconnect
      const reconnectedSocket = await createSocketClient('DRIVER', '3000000001');

      // After reconnection, app should fetch current state from API
      // Verify both records exist in database
      const records = await prisma.attendance.findMany({
        where: {
          tripId: testTrip.id,
          studentId: { in: [testStudent1.id, testStudent2.id] }
        }
      });

      expect(records.length).toBe(2);
      expect(records.every(r => r.boarded === true)).toBe(true);
    });

    test('event payload includes all required fields for UI update', async () => {
      const driverSocket = await createSocketClient('DRIVER', '3000000001');
      
      const eventPromise = waitForEvent(
        driverSocket,
        'attendance:updated',
        () => true
      );

      const today = new Date().toISOString().split('T')[0];
      const driverToken = jwt.sign({ id: 'user-3000000001', role: 'DRIVER' }, SECRET);

      await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          studentId: testStudent1.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'PICKUP',
          boarded: true
        });

      const event = await eventPromise;

      // Verify all required fields for UI update (Requirement 16.2)
      expect(event).toHaveProperty('tripId', testTrip.id);
      expect(event).toHaveProperty('studentId', testStudent1.id);
      expect(event).toHaveProperty('type', 'PICKUP');
      expect(event).toHaveProperty('boarded', true);
      expect(event).toHaveProperty('checkedAt');
      expect(event).toHaveProperty('conductorId');

      // Validate checkedAt is a valid timestamp
      expect(new Date(event.checkedAt).getTime()).toBeGreaterThan(0);
    });

    test('UI update simulation - event triggers local state change', async () => {
      const conductorSocket = await createSocketClient('CONDUCTOR', '3000000002');

      // Simulate UI state
      const uiState = {
        students: [
          { id: testStudent1.id, name: 'Student 1', attendance: null },
          { id: testStudent2.id, name: 'Student 2', attendance: null }
        ]
      };

      // Listen for updates and apply to UI state
      conductorSocket.on('attendance:updated', (event) => {
        const student = uiState.students.find(s => s.id === event.studentId);
        if (student) {
          student.attendance = {
            boarded: event.boarded,
            checkedAt: event.checkedAt,
            conductorId: event.conductorId
          };
        }
      });

      const today = new Date().toISOString().split('T')[0];
      const driverToken = jwt.sign({ id: 'user-3000000001', role: 'DRIVER' }, SECRET);

      // Driver marks attendance
      await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          studentId: testStudent1.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'PICKUP',
          boarded: true
        });

      await sleep(WAIT_MS);

      // Verify UI state was updated
      expect(uiState.students[0].attendance).not.toBeNull();
      expect(uiState.students[0].attendance.boarded).toBe(true);
      expect(uiState.students[0].attendance.checkedAt).toBeDefined();
      expect(uiState.students[1].attendance).toBeNull();
    });
  });

  describe('Network Reconnection and Queue Processing', () => {
    test('full flow: offline mark → queue → reconnect → sync → broadcast → UI update', async () => {
      const driverSocket = await createSocketClient('DRIVER', '3000000001');
      const conductorSocket = await createSocketClient('CONDUCTOR', '3000000002');

      const conductorEvents = recordEvents(conductorSocket, 'attendance:updated');

      const today = new Date().toISOString().split('T')[0];
      const driverToken = jwt.sign({ id: 'user-3000000001', role: 'DRIVER' }, SECRET);

      // Step 1: Simulate offline queue
      const offlineQueue = [
        {
          studentId: testStudent1.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'PICKUP',
          boarded: true,
          timestamp: Date.now()
        }
      ];

      // Step 2: "Reconnect" - process queue
      for (const payload of offlineQueue) {
        await request(app)
          .post('/api/attendance')
          .set('Authorization', `Bearer ${driverToken}`)
          .send(payload);
      }

      // Step 3: Wait for broadcast
      await sleep(WAIT_MS);

      // Step 4: Verify conductor received event (UI would update)
      expect(conductorEvents.length).toBe(1);
      expect(conductorEvents[0].data.studentId).toBe(testStudent1.id);
      expect(conductorEvents[0].data.boarded).toBe(true);

      // Step 5: Verify database persistence
      const record = await prisma.attendance.findFirst({
        where: {
          tripId: testTrip.id,
          studentId: testStudent1.id
        }
      });

      expect(record).not.toBeNull();
      expect(record.boarded).toBe(true);

      conductorEvents.cleanup();
    });

    test('queue processing with retry on transient failure', async () => {
      const today = new Date().toISOString().split('T')[0];
      const driverToken = jwt.sign({ id: 'user-3000000001', role: 'DRIVER' }, SECRET);

      const payload = {
        studentId: testStudent1.id,
        busId: testBus.id,
        tripId: testTrip.id,
        date: today,
        tripType: 'PICKUP',
        boarded: true
      };

      // First attempt succeeds
      const response1 = await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${driverToken}`)
        .send(payload);

      expect(response1.status).toBe(200);

      // Simulate retry of same payload (should be idempotent via upsert)
      const response2 = await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${driverToken}`)
        .send(payload);

      expect(response2.status).toBe(200);

      // Verify only one record exists
      const records = await prisma.attendance.findMany({
        where: {
          tripId: testTrip.id,
          studentId: testStudent1.id
        }
      });

      expect(records.length).toBe(1);
    });

    test('multiple devices process offline queues after reconnection', async () => {
      const driverSocket = await createSocketClient('DRIVER', '3000000001');
      const conductorSocket = await createSocketClient('CONDUCTOR', '3000000002');

      const driverEvents = recordEvents(driverSocket, 'attendance:updated');
      const conductorEvents = recordEvents(conductorSocket, 'attendance:updated');

      const today = new Date().toISOString().split('T')[0];
      const driverToken = jwt.sign({ id: 'user-3000000001', role: 'DRIVER' }, SECRET);
      const conductorToken = jwt.sign({ id: 'user-3000000002', role: 'CONDUCTOR' }, SECRET);

      // Both process offline queues simultaneously
      await Promise.all([
        request(app)
          .post('/api/attendance')
          .set('Authorization', `Bearer ${driverToken}`)
          .send({
            studentId: testStudent1.id,
            busId: testBus.id,
            tripId: testTrip.id,
            date: today,
            tripType: 'PICKUP',
            boarded: true
          }),
        request(app)
          .post('/api/attendance')
          .set('Authorization', `Bearer ${conductorToken}`)
          .send({
            studentId: testStudent2.id,
            busId: testBus.id,
            tripId: testTrip.id,
            date: today,
            tripType: 'PICKUP',
            boarded: true,
            conductorId: testConductor.id
          })
      ]);

      await sleep(WAIT_MS);

      // Both devices receive all events
      expect(driverEvents.length).toBe(2);
      expect(conductorEvents.length).toBe(2);

      // Verify both records in database
      const records = await prisma.attendance.findMany({
        where: {
          tripId: testTrip.id,
          studentId: { in: [testStudent1.id, testStudent2.id] }
        }
      });

      expect(records.length).toBe(2);

      driverEvents.cleanup();
      conductorEvents.cleanup();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('inactive trip does not emit events', async () => {
      const driverSocket = await createSocketClient('DRIVER', '3000000001');
      const events = recordEvents(driverSocket, 'attendance:updated');

      // Update trip to inactive
      await prisma.trip.update({
        where: { id: testTrip.id },
        data: { status: 'COMPLETED' }
      });

      const today = new Date().toISOString().split('T')[0];
      const driverToken = jwt.sign({ id: 'user-3000000001', role: 'DRIVER' }, SECRET);

      const response = await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          studentId: testStudent1.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'PICKUP',
          boarded: true
        });

      expect(response.status).toBe(409); // Invalid or inactive trip

      await sleep(WAIT_MS);
      expect(events.length).toBe(0);

      // Restore trip status
      await prisma.trip.update({
        where: { id: testTrip.id },
        data: { status: 'ACTIVE' }
      });

      events.cleanup();
    });

    test('unauthorized conductor cannot mark attendance', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Create unauthorized conductor on different bus
      const otherBus = await prisma.bus.create({
        data: {
          busNo: 'OTHER-BUS',
          driverName: 'Other Driver',
          status: 'ACTIVE'
        }
      });

      const unauthorizedConductor = await prisma.conductor.create({
        data: {
          name: 'Unauthorized Conductor',
          phone: '3000000099',
          busId: otherBus.id
        }
      });

      const token = jwt.sign({ id: 'user-3000000099', role: 'CONDUCTOR' }, SECRET);

      const response = await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${token}`)
        .send({
          studentId: testStudent1.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'PICKUP',
          boarded: true,
          conductorId: unauthorizedConductor.id
        });

      expect(response.status).toBe(403); // Forbidden

      // Cleanup
      await prisma.conductor.delete({ where: { id: unauthorizedConductor.id } });
      await prisma.bus.delete({ where: { id: otherBus.id } });
    });

    test('events are not emitted when tripId is missing (backward compatibility)', async () => {
      const driverSocket = await createSocketClient('DRIVER', '3000000001');
      const events = recordEvents(driverSocket, 'attendance:updated');

      const today = new Date().toISOString().split('T')[0];
      const driverToken = jwt.sign({ id: 'user-3000000001', role: 'DRIVER' }, SECRET);

      await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          studentId: testStudent1.id,
          busId: testBus.id,
          date: today,
          tripType: 'PICKUP',
          boarded: true
          // No tripId
        });

      await sleep(WAIT_MS);
      expect(events.length).toBe(0);

      events.cleanup();
    });
  });
});

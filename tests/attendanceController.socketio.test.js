/**
 * Test Suite: Real-time Socket.IO Multi-Device Synchronization
 * Task 10.2: Test real-time sync between devices
 * 
 * Additional test scenarios complementing socketAttendance.test.js:
 * - Multiple devices (driver + conductor) connected to same bus room
 * - Real Socket.IO client connections
 * - Event reception on different devices
 * - Device-to-device synchronization flow
 * - Concurrent attendance marking from multiple devices
 * ../src/controllers/attendanceController
 * Validates Requirement../src/db1, 16.2, 16.3:
 * - Real-time event emission to bus and admin rooms
 * - Event payload includes all required fields
 * - Connected clients receive updates within 1 second
 */

const request = require('supertest');
const http = require('http');
const { Server } = require('socket.io');
const { io: ioClient } = require('socket.io-client');
const express = require('express');
const prisma = require('../src/db');

describe('Socket.IO Multi-Device Synchronization Tests', () => {
  let app, server, io;
  let driverClient, conductorClient, adminClient;
  let testBus, testDriver, testConductor, testStudent, testTrip;
  const PORT = 0; // Random available port

  beforeAll(async () => {
    // Create Express app with Socket.IO
    app = express();
    app.use(express.json());
    
    server = http.createServer(app);
    io = new Server(server, {
      cors: { origin: '*' }
    });

    // Attach Socket.IO to requests
    app.use((req, res, next) => {
      req.io = io;
      next();
    });

    // Import attendance routes
    const { markAttendance } = require('../src/controllers/attendanceController');
    app.post('/api/attendance', markAttendance);

    // Start server
    await new Promise((resolve) => {
      server.listen(PORT, resolve);
    });

    const address = server.address();
    const socketUrl = `http://localhost:${address.port}`;

    // Setup Socket.IO connection handler (simulates server-side logic)
    io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);
      
      // Join bus-specific room on request
      socket.on('join-bus-room', (busId) => {
        socket.join(`bus_${busId}`);
        console.log(`Socket ${socket.id} joined room: bus_${busId}`);
      });

      // Join admin room on request
      socket.on('join-admin-room', () => {
        socket.join('admins');
        console.log(`Socket ${socket.id} joined room: admins`);
      });
    });

    // Create test database records
    testBus = await prisma.bus.create({
      data: {
        busNo: 'MULTI-DEVICE-TEST',
        driverName: 'Multi Device Driver',
        status: 'ACTIVE'
      }
    });

    testDriver = await prisma.driver.create({
      data: {
        name: 'Test Driver',
        phone: '5551234567',
        busId: testBus.id
      }
    });

    testConductor = await prisma.conductor.create({
      data: {
        name: 'Test Conductor',
        phone: '5557654321',
        busId: testBus.id
      }
    });

    testStudent = await prisma.student.create({
      data: {
        name: 'Test Student Multi Device',
        admissionNo: 'MD-001',
        busId: testBus.id,
        parentPhone: '5559876543',
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

    // Create Socket.IO client connections
    driverClient = ioClient(socketUrl, {
      transports: ['websocket'],
      reconnection: false
    });

    conductorClient = ioClient(socketUrl, {
      transports: ['websocket'],
      reconnection: false
    });

    adminClient = ioClient(socketUrl, {
      transports: ['websocket'],
      reconnection: false
    });

    // Wait for all clients to connect
    await Promise.all([
      new Promise((resolve) => driverClient.on('connect', resolve)),
      new Promise((resolve) => conductorClient.on('connect', resolve)),
      new Promise((resolve) => adminClient.on('connect', resolve))
    ]);

    // Join appropriate rooms
    driverClient.emit('join-bus-room', testBus.id);
    conductorClient.emit('join-bus-room', testBus.id);
    adminClient.emit('join-admin-room');

    // Give time for room joins
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  afterAll(async () => {
    // Disconnect clients
    if (driverClient) driverClient.disconnect();
    if (conductorClient) conductorClient.disconnect();
    if (adminClient) adminClient.disconnect();

    // Close server
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    if (io) {
      io.close();
    }

    // Cleanup database
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
  });

  describe('Driver to Conductor Synchronization (Requirement 16.3)', () => {
    test('should notify conductor when driver marks attendance', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Setup listener on conductor device
      const conductorReceivedEvent = new Promise((resolve) => {
        conductorClient.once('attendance:updated', (data) => {
          resolve(data);
        });
      });

      // Driver marks attendance
      const startTime = Date.now();
      const response = await request(server)
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

      // Wait for conductor to receive event
      const receivedData = await conductorReceivedEvent;
      const endTime = Date.now();

      // Verify event received
      expect(receivedData.tripId).toBe(testTrip.id);
      expect(receivedData.studentId).toBe(testStudent.id);
      expect(receivedData.type).toBe('PICKUP');
      expect(receivedData.boarded).toBe(true);

      // Verify received within 1 second (Requirement 16.3)
      expect(endTime - startTime).toBeLessThan(1000);
    });

    test('should notify driver when conductor marks attendance', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Setup listener on driver device
      const driverReceivedEvent = new Promise((resolve) => {
        driverClient.once('attendance:updated', (data) => {
          resolve(data);
        });
      });

      // Conductor marks attendance
      const startTime = Date.now();
      const response = await request(server)
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

      // Wait for driver to receive event
      const receivedData = await driverReceivedEvent;
      const endTime = Date.now();

      // Verify event received with conductorId
      expect(receivedData.conductorId).toBe(testConductor.id);
      expect(receivedData.tripId).toBe(testTrip.id);

      // Verify received within 1 second
      expect(endTime - startTime).toBeLessThan(1000);
    });

    test('should notify both driver and conductor when either marks attendance', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Setup listeners on both devices
      let driverReceived = false;
      let conductorReceived = false;

      const bothReceived = new Promise((resolve) => {
        driverClient.once('attendance:updated', () => {
          driverReceived = true;
          if (conductorReceived) resolve();
        });
        conductorClient.once('attendance:updated', () => {
          conductorReceived = true;
          if (driverReceived) resolve();
        });
      });

      // Driver marks attendance
      await request(server)
        .post('/api/attendance')
        .send({
          studentId: testStudent.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'PICKUP',
          boarded: true
        });

      // Wait for both to receive
      await bothReceived;

      expect(driverReceived).toBe(true);
      expect(conductorReceived).toBe(true);
    });
  });

  describe('Admin Room Synchronization', () => {
    test('should notify admin dashboard when attendance is marked', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Setup listener on admin client
      const adminReceivedEvent = new Promise((resolve) => {
        adminClient.once('attendance:updated', (data) => {
          resolve(data);
        });
      });

      // Mark attendance
      await request(server)
        .post('/api/attendance')
        .send({
          studentId: testStudent.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'PICKUP',
          boarded: true
        });

      // Wait for admin to receive event
      const receivedData = await adminReceivedEvent;

      expect(receivedData.tripId).toBe(testTrip.id);
      expect(receivedData.studentId).toBe(testStudent.id);
    });

    test('should notify admins of updates from any bus', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const adminReceivedEvent = new Promise((resolve) => {
        adminClient.once('attendance:updated', (data) => {
          resolve(data);
        });
      });

      await request(server)
        .post('/api/attendance')
        .send({
          studentId: testStudent.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'DROP',
          boarded: false
        });

      const receivedData = await adminReceivedEvent;
      expect(receivedData).toBeDefined();
      expect(receivedData.type).toBe('DROP');
    });
  });

  describe('Multiple Devices on Same Bus (Requirement 16.4)', () => {
    let secondDriverClient;

    beforeAll(async () => {
      // Create a second driver device connected to same bus
      const address = server.address();
      const socketUrl = `http://localhost:${address.port}`;
      
      secondDriverClient = ioClient(socketUrl, {
        transports: ['websocket'],
        reconnection: false
      });

      await new Promise((resolve) => {
        secondDriverClient.on('connect', resolve);
      });

      secondDriverClient.emit('join-bus-room', testBus.id);
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    afterAll(() => {
      if (secondDriverClient) secondDriverClient.disconnect();
    });

    test('should notify all devices in bus room simultaneously', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      let device1Received = false;
      let device2Received = false;
      let device3Received = false;

      const allReceived = new Promise((resolve) => {
        driverClient.once('attendance:updated', () => {
          device1Received = true;
          if (device2Received && device3Received) resolve();
        });
        secondDriverClient.once('attendance:updated', () => {
          device2Received = true;
          if (device1Received && device3Received) resolve();
        });
        conductorClient.once('attendance:updated', () => {
          device3Received = true;
          if (device1Received && device2Received) resolve();
        });
      });

      await request(server)
        .post('/api/attendance')
        .send({
          studentId: testStudent.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'PICKUP',
          boarded: true
        });

      await allReceived;

      expect(device1Received).toBe(true);
      expect(device2Received).toBe(true);
      expect(device3Received).toBe(true);
    });

    test('should not update devices connected to different bus', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Create another bus and connect a device to it
      const otherBus = await prisma.bus.create({
        data: {
          busNo: 'OTHER-BUS',
          driverName: 'Other Driver',
          status: 'ACTIVE'
        }
      });

      const address = server.address();
      const socketUrl = `http://localhost:${address.port}`;
      
      const otherBusClient = ioClient(socketUrl, {
        transports: ['websocket'],
        reconnection: false
      });

      await new Promise((resolve) => {
        otherBusClient.on('connect', resolve);
      });

      otherBusClient.emit('join-bus-room', otherBus.id);
      await new Promise(resolve => setTimeout(resolve, 100));

      let otherBusReceived = false;
      otherBusClient.once('attendance:updated', () => {
        otherBusReceived = true;
      });

      // Mark attendance on testBus
      await request(server)
        .post('/api/attendance')
        .send({
          studentId: testStudent.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'PICKUP',
          boarded: true
        });

      // Wait a bit to see if other bus receives (it shouldn't)
      await new Promise(resolve => setTimeout(resolve, 500));

      expect(otherBusReceived).toBe(false);

      // Cleanup
      otherBusClient.disconnect();
      await prisma.bus.deleteMany({ where: { id: otherBus.id } });
    });
  });

  describe('Event Payload Validation (Requirement 16.2)', () => {
    test('should include all required fields in real-time event', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const receivedEvent = new Promise((resolve) => {
        driverClient.once('attendance:updated', (data) => {
          resolve(data);
        });
      });

      await request(server)
        .post('/api/attendance')
        .send({
          studentId: testStudent.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'DROP',
          boarded: false
        });

      const data = await receivedEvent;

      // Verify all required fields present
      expect(data).toHaveProperty('tripId');
      expect(data).toHaveProperty('studentId');
      expect(data).toHaveProperty('type');
      expect(data).toHaveProperty('boarded');
      expect(data).toHaveProperty('checkedAt');
      expect(data).toHaveProperty('conductorId');

      // Verify field values
      expect(data.tripId).toBe(testTrip.id);
      expect(data.studentId).toBe(testStudent.id);
      expect(data.type).toBe('DROP');
      expect(data.boarded).toBe(false);
      expect(data.conductorId).toBeNull();
    });
  });

  describe('Concurrent Attendance Marking', () => {
    test('should handle simultaneous marking from multiple devices', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Create multiple students
      const student2 = await prisma.student.create({
        data: {
          name: 'Student 2',
          admissionNo: 'MD-002',
          busId: testBus.id,
          parentPhone: '5559999999',
          class: '5B'
        }
      });

      const student3 = await prisma.student.create({
        data: {
          name: 'Student 3',
          admissionNo: 'MD-003',
          busId: testBus.id,
          parentPhone: '5558888888',
          class: '5C'
        }
      });

      let eventsReceived = 0;
      const allEventsReceived = new Promise((resolve) => {
        driverClient.on('attendance:updated', () => {
          eventsReceived++;
          if (eventsReceived === 3) resolve();
        });
      });

      // Mark attendance concurrently from different devices
      await Promise.all([
        request(server)
          .post('/api/attendance')
          .send({
            studentId: testStudent.id,
            busId: testBus.id,
            tripId: testTrip.id,
            date: today,
            tripType: 'PICKUP',
            boarded: true
          }),
        request(server)
          .post('/api/attendance')
          .send({
            studentId: student2.id,
            busId: testBus.id,
            tripId: testTrip.id,
            date: today,
            tripType: 'PICKUP',
            boarded: true
          }),
        request(server)
          .post('/api/attendance')
          .send({
            studentId: student3.id,
            busId: testBus.id,
            tripId: testTrip.id,
            date: today,
            tripType: 'PICKUP',
            boarded: true
          })
      ]);

      await allEventsReceived;
      expect(eventsReceived).toBe(3);

      // Cleanup
      await prisma.attendance.deleteMany({ 
        where: { studentId: { in: [student2.id, student3.id] } }
      });
      await prisma.student.deleteMany({ 
        where: { id: { in: [student2.id, student3.id] } }
      });
    });
  });
});

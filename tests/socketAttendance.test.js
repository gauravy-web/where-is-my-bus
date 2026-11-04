/**
 * Integration tests for Task 3.2: Socket.IO Event Emission in Attendance
 * 
 * Validates Requirements 16.1, 16.2:
 * - Emit "attendance:updated" event to bus room
 * - Emit "attendance:updated" event to admins room
 * - Include tripId, studentId, type, boarded, checkedAt, conductorId in payload
 */

const request = require('supertest');
const prisma = require('../src/db');
const express = require('express');

jest.setTimeout(30000);

describe('Socket.IO Attendance Events (Requirements 16.1, 16.2)', () => {
  let app;
  let testStudent, testBus, testDriver, testTrip;
  let emittedEvents = [];

  beforeAll(async () => {
    // Create Express app
    app = express();
    app.use(express.json());

    // Mock Socket.IO with event capture
    app.use((req, res, next) => {
      req.io = {
        to: (room) => ({
          emit: (event, data) => {
            emittedEvents.push({ room, event, data });
          }
        })
      };
      next();
    });

    // Import and setup routes
    const { markAttendance } = require('../src/controllers/attendanceController');
    app.post('/api/attendance', markAttendance);

    // Create test data
    testBus = await prisma.bus.create({
      data: {
        busNo: 'TEST-SOCKET-BUS',
        driverName: 'Socket Test Driver',
        status: 'ACTIVE'
      }
    });

    testDriver = await prisma.driver.create({
      data: {
        name: 'Socket Test Driver',
        phone: '1111111111',
        busId: testBus.id
      }
    });

    testStudent = await prisma.student.create({
      data: {
        name: 'Socket Test Student',
        admissionNo: 'SOCKET001',
        busId: testBus.id,
        parentPhone: '2222222222',
        class: '6B'
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
    // Cleanup
    await prisma.attendance.deleteMany({ where: { studentId: testStudent.id } });
    await prisma.trip.deleteMany({ where: { id: testTrip.id } });
    await prisma.student.deleteMany({ where: { id: testStudent.id } });
    await prisma.driver.deleteMany({ where: { id: testDriver.id } });
    await prisma.bus.deleteMany({ where: { id: testBus.id } });
    await prisma.$disconnect();
  });

  beforeEach(() => {
    // Clear events before each test
    emittedEvents = [];
  });

  afterEach(async () => {
    // Clean up attendance records
    await prisma.attendance.deleteMany({ where: { studentId: testStudent.id } });
  });

  describe('Event Emission to Rooms (Requirement 16.1)', () => {
    test('should emit attendance:updated event to bus room', async () => {
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
      
      // Find event emitted to bus room
      const busEvent = emittedEvents.find(e => e.room === `bus_${testBus.id}`);
      expect(busEvent).toBeDefined();
      expect(busEvent.event).toBe('attendance:updated');
    });

    test('should emit attendance:updated event to admins room', async () => {
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
      
      // Find event emitted to admins room
      const adminEvent = emittedEvents.find(e => e.room === 'admins');
      expect(adminEvent).toBeDefined();
      expect(adminEvent.event).toBe('attendance:updated');
    });

    test('should emit to both bus and admins rooms simultaneously', async () => {
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

      expect(emittedEvents.length).toBe(2);
      
      const rooms = emittedEvents.map(e => e.room);
      expect(rooms).toContain(`bus_${testBus.id}`);
      expect(rooms).toContain('admins');
    });
  });

  describe('Event Payload Structure (Requirement 16.2)', () => {
    test('should include tripId in event payload', async () => {
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

      const busEvent = emittedEvents.find(e => e.room === `bus_${testBus.id}`);
      expect(busEvent.data.tripId).toBe(testTrip.id);
    });

    test('should include studentId in event payload', async () => {
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

      const busEvent = emittedEvents.find(e => e.room === `bus_${testBus.id}`);
      expect(busEvent.data.studentId).toBe(testStudent.id);
    });

    test('should include type in event payload', async () => {
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

      const busEvent = emittedEvents.find(e => e.room === `bus_${testBus.id}`);
      expect(busEvent.data.type).toBe('PICKUP');
    });

    test('should include boarded status in event payload', async () => {
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

      const busEvent = emittedEvents.find(e => e.room === `bus_${testBus.id}`);
      expect(busEvent.data.boarded).toBe(true);
    });

    test('should include checkedAt timestamp in event payload', async () => {
      const today = new Date().toISOString().split('T')[0];
      const beforeTime = new Date();
      
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

      const afterTime = new Date();
      const busEvent = emittedEvents.find(e => e.room === `bus_${testBus.id}`);
      
      expect(busEvent.data.checkedAt).toBeDefined();
      const checkedAt = new Date(busEvent.data.checkedAt);
      expect(checkedAt.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(checkedAt.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });

    test('should include conductorId in event payload when provided', async () => {
      const today = new Date().toISOString().split('T')[0];
      const testConductorId = 'conductor-123';
      
      // Mock conductor
      app.use((req, res, next) => {
        req.user = { role: 'CONDUCTOR', phone: '3333333333' };
        next();
      });

      const conductor = await prisma.conductor.create({
        data: {
          id: testConductorId,
          name: 'Test Conductor',
          phone: '3333333333',
          busId: testBus.id
        }
      });

      await request(app)
        .post('/api/attendance')
        .send({
          studentId: testStudent.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'PICKUP',
          boarded: true,
          conductorId: testConductorId
        });

      const busEvent = emittedEvents.find(e => e.room === `bus_${testBus.id}`);
      expect(busEvent.data.conductorId).toBe(testConductorId);

      // Cleanup
      await prisma.conductor.delete({ where: { id: testConductorId } });
    });

    test('should include null conductorId when not provided', async () => {
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

      const busEvent = emittedEvents.find(e => e.room === `bus_${testBus.id}`);
      expect(busEvent.data.conductorId).toBeNull();
    });
  });

  describe('Event Emission Conditions', () => {
    test('should NOT emit events when tripId is not provided (backward compatibility)', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      await request(app)
        .post('/api/attendance')
        .send({
          studentId: testStudent.id,
          busId: testBus.id,
          date: today,
          tripType: 'PICKUP',
          boarded: true
          // No tripId provided
        });

      expect(emittedEvents.length).toBe(0);
    });

    test('should NOT emit events when trip validation fails', async () => {
      const today = new Date().toISOString().split('T')[0];
      const invalidTripId = '00000000-0000-0000-0000-000000000000';
      
      await request(app)
        .post('/api/attendance')
        .send({
          studentId: testStudent.id,
          busId: testBus.id,
          tripId: invalidTripId,
          date: today,
          tripType: 'PICKUP',
          boarded: true
        });

      expect(emittedEvents.length).toBe(0);
    });

    test('should emit events on both create and update operations', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // First mark (create)
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

      expect(emittedEvents.length).toBe(2);
      emittedEvents = [];

      // Second mark (update)
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

      expect(emittedEvents.length).toBe(2);
    });
  });

  describe('Event Payload Consistency', () => {
    test('should emit same data to both bus and admins rooms', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      await request(app)
        .post('/api/attendance')
        .send({
          studentId: testStudent.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'DROP',
          boarded: false
        });

      const busEvent = emittedEvents.find(e => e.room === `bus_${testBus.id}`);
      const adminEvent = emittedEvents.find(e => e.room === 'admins');

      expect(busEvent.data).toEqual(adminEvent.data);
    });

    test('should use attendance type from request', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      await request(app)
        .post('/api/attendance')
        .send({
          studentId: testStudent.id,
          busId: testBus.id,
          tripId: testTrip.id,
          date: today,
          tripType: 'DROP',
          boarded: true
        });

      const busEvent = emittedEvents.find(e => e.room === `bus_${testBus.id}`);
      expect(busEvent.data.type).toBe('DROP');
    });
  });
});

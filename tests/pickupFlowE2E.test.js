/**
 * End-to-End Integration Test for Complete Pickup Trip Flow (Task 13.2)
 * 
 * Tests the complete pickup workflow from trip start to completion with
 * stop-wise attendance marking, real-time updates, and parent notifications.
 * 
 * Validates Requirements:
 * - 1: Display attendance section during active trip
 * - 2: Identify current stop automatically
 * - 3: Display students for current stop
 * - 4: Mark student pickup attendance
 * - 8: Send parent notifications on pickup
 * - 10: Prevent duplicate attendance records
 * - 11: Fetch students with trip context
 * - 12: Load existing attendance status
 * - 16: Sync attendance across driver and conductor devices
 * - 17: Display attendance summary
 * - 18: Parse attendance API response
 * - 19: Validate trip context for attendance
 */

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/testdb';
process.env.JWT_SECRET = 'test-jwt-secret';

// Shared "database" for fake Prisma instances
const mockShared = { state: {}, seq: 0 };

// Builds a fake Prisma client over mockShared.state
function mockMakePrisma() {
  const shared = mockShared;
  const clone = (x) => (x ? { ...x } : null);
  
  // Prisma model name -> state key
  const plural = { bus: 'buses' };
  const table = (modelName) => {
    const key = plural[modelName] || `${modelName}s`;
    if (!shared.state[key]) shared.state[key] = [];
    return shared.state[key];
  };
  
  const cmp = (a, b) => {
    const x = a instanceof Date ? a.getTime() : a;
    const y = b instanceof Date ? b.getTime() : b;
    if (x < y) return -1;
    if (x > y) return 1;
    return 0;
  };
  
  const matches = (row, where = {}) => Object.entries(where || {}).every(([k, v]) => {
    if (k === 'OR') return v.some((w) => matches(row, w));
    if (k === 'AND') return (Array.isArray(v) ? v : [v]).every((w) => matches(row, w));
    if (k === 'NOT') return !matches(row, v);
    if (v && typeof v === 'object' && !(v instanceof Date)) {
      if ('in' in v && !v.in.includes(row[k])) return false;
      if ('notIn' in v && v.notIn.includes(row[k])) return false;
      if ('not' in v && row[k] === v.not) return false;
      if ('equals' in v && row[k] !== v.equals) return false;
      if ('gt' in v && !(cmp(row[k], v.gt) > 0)) return false;
      if ('gte' in v && !(cmp(row[k], v.gte) >= 0)) return false;
      if ('lt' in v && !(cmp(row[k], v.lt) < 0)) return false;
      if ('lte' in v && !(cmp(row[k], v.lte) <= 0)) return false;
      return true;
    }
    return (row[k] === undefined ? null : row[k]) === v;
  });
  
  const applyOrderBy = (rows, orderBy) => {
    const ks = (Array.isArray(orderBy) ? orderBy : orderBy ? [orderBy] : []).map((o) => Object.entries(o)[0]);
    return [...rows].sort((a, b) => {
      for (const [k, dir] of ks) {
        const c = cmp(a[k], b[k]);
        if (c !== 0) return dir === 'desc' ? -c : c;
      }
      return 0;
    });
  };
  
  const notFound = () => Object.assign(new Error('Record not found'), { code: 'P2025' });
  
  const model = (key) => ({
    findMany: jest.fn(async (args = {}) => {
      let rows = applyOrderBy(table(key).filter((r) => matches(r, args.where)), args.orderBy);
      if (Number.isInteger(args.skip)) rows = rows.slice(args.skip);
      if (Number.isInteger(args.take)) rows = rows.slice(0, args.take);
      
      // Handle includes
      if (args.include) {
        return rows.map(row => {
          const enriched = clone(row);
          Object.entries(args.include).forEach(([rel, config]) => {
            if (rel === 'stops' && config.orderBy) {
              const relatedStops = table('tripStop').filter(s => s.tripId === row.id);
              enriched.stops = applyOrderBy(relatedStops, config.orderBy).map(clone);
            }
          });
          return enriched;
        });
      }
      
      return rows.map(clone);
    }),
    
    findUnique: jest.fn(async (args = {}) => {
      const row = table(key).find((r) => matches(r, args.where));
      if (!row) return null;
      
      const result = clone(row);
      
      // Handle includes
      if (args.include) {
        Object.entries(args.include).forEach(([rel, config]) => {
          if (rel === 'stops' && config.orderBy) {
            const relatedStops = table('tripStop').filter(s => s.tripId === row.id);
            result.stops = applyOrderBy(relatedStops, config.orderBy).map(clone);
          }
        });
      }
      
      // Handle select
      if (args.select) {
        const selected = {};
        Object.keys(args.select).forEach(k => {
          if (args.select[k]) selected[k] = result[k];
        });
        return selected;
      }
      
      return result;
    }),
    
    findFirst: jest.fn(async (args = {}) => {
      const filtered = table(key).filter((r) => matches(r, args.where));
      const sorted = applyOrderBy(filtered, args.orderBy);
      const row = sorted[0];
      
      if (!row) return null;
      
      const result = clone(row);
      
      // Handle includes
      if (args.include) {
        Object.entries(args.include).forEach(([rel, config]) => {
          if (rel === 'stops' && config.orderBy) {
            const relatedStops = table('tripStop').filter(s => s.tripId === row.id);
            result.stops = applyOrderBy(relatedStops, config.orderBy).map(clone);
          }
        });
      }
      
      // Handle select
      if (args.select) {
        const selected = {};
        Object.keys(args.select).forEach(k => {
          if (args.select[k]) selected[k] = result[k];
        });
        return selected;
      }
      
      return result;
    }),
    
    count: jest.fn(async (args = {}) => table(key).filter((r) => matches(r, args.where)).length),
    
    create: jest.fn(async ({ data }) => {
      shared.seq += 1;
      const row = { 
        id: `${key}-${String(shared.seq).padStart(4, '0')}`, 
        createdAt: new Date(),
        ...data 
      };
      table(key).push(row);
      return clone(row);
    }),
    
    createMany: jest.fn(async ({ data }) => {
      const created = (Array.isArray(data) ? data : [data]).map(d => {
        shared.seq += 1;
        const row = { 
          id: `${key}-${String(shared.seq).padStart(4, '0')}`, 
          createdAt: new Date(),
          ...d 
        };
        table(key).push(row);
        return row;
      });
      return { count: created.length };
    }),
    
    update: jest.fn(async ({ where, data }) => {
      const row = table(key).find((r) => matches(r, where));
      if (!row) throw notFound();
      Object.assign(row, data);
      return clone(row);
    }),
    
    updateMany: jest.fn(async ({ where, data }) => {
      const rows = table(key).filter((r) => matches(r, where));
      rows.forEach((r) => Object.assign(r, data));
      return { count: rows.length };
    }),
    
    upsert: jest.fn(async ({ where, create, update }) => {
      const row = table(key).find((r) => matches(r, where));
      if (row) { 
        Object.assign(row, update); 
        return clone(row); 
      }
      shared.seq += 1;
      const created = { 
        id: `${key}-${String(shared.seq).padStart(4, '0')}`, 
        createdAt: new Date(),
        ...create 
      };
      table(key).push(created);
      return clone(created);
    }),
    
    delete: jest.fn(async ({ where }) => {
      const rows = table(key);
      const i = rows.findIndex((r) => matches(r, where));
      if (i < 0) throw notFound();
      return clone(rows.splice(i, 1)[0]);
    }),
    
    deleteMany: jest.fn(async ({ where } = {}) => {
      const rows = table(key);
      const keep = rows.filter((r) => !matches(r, where));
      const count = rows.length - keep.length;
      rows.splice(0, rows.length, ...keep);
      return { count };
    }),
  });

  const base = { $disconnect: jest.fn(), $connect: jest.fn() };
  const client = new Proxy(base, {
    get(target, prop) {
      if (prop in target) return target[prop];
      if (typeof prop !== 'string' || prop === 'then' || prop.startsWith('$') || prop.startsWith('_')) {
        return undefined;
      }
      target[prop] = model(prop);
      return target[prop];
    },
  });
  
  base.$transaction = async (arg) => {
    if (Array.isArray(arg)) return Promise.all(arg);
    const snapshot = Object.fromEntries(
      Object.entries(shared.state).map(([k, rows]) => [k, rows.map((r) => ({ ...r }))])
    );
    try {
      return await arg(client);
    } catch (err) {
      Object.keys(shared.state).forEach((k) => { shared.state[k] = snapshot[k] || []; });
      throw err;
    }
  };
  
  return client;
}

jest.mock('../src/db', () => mockMakePrisma());

// Mock notification service to track notifications
const notificationMock = {
  sendNotification: jest.fn(async () => undefined),
  sendMulticast: jest.fn(async () => undefined),
};

jest.mock('../src/services/notificationService', () => notificationMock);

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');

const sign = (payload) => `Bearer ${jwt.sign(payload, 'test-jwt-secret')}`;

const TOKENS = {
  ADMIN: sign({ id: 'admin-1', role: 'ADMIN' }),
  DRIVER: sign({ id: 'driver-user', role: 'DRIVER', phone: '9111111111' }),
  CONDUCTOR: sign({ id: 'conductor-user', role: 'CONDUCTOR', phone: '9222222222' }),
  PARENT1: sign({ id: 'parent-1', role: 'PARENT', phone: '9876543210' }),
  PARENT2: sign({ id: 'parent-2', role: 'PARENT', phone: '9876543211' }),
  PARENT3: sign({ id: 'parent-3', role: 'PARENT', phone: '9876543213' }),
};

const SCHOOL = {
  id: 'school-001',
  name: 'Test School',
  lat: 21.24,
  lng: 81.32,
  contactPhone: '1234567890'
};

// Test data: Bus with 3 stops and students
const SEED = {
  buses: [
    { id: 'bus-001', busNo: 'TEST-BUS-01', status: 'ACTIVE' }
  ],
  drivers: [
    { id: 'driver-001', name: 'Test Driver', phone: '+91 91111 11111', busId: 'bus-001' }
  ],
  conductors: [
    { id: 'conductor-001', name: 'Test Conductor', phone: '9222222222', busId: 'bus-001' }
  ],
  users: [
    { id: 'driver-user', phone: '9111111111', role: 'DRIVER', fcmToken: null },
    { id: 'conductor-user', phone: '9222222222', role: 'CONDUCTOR', fcmToken: null },
    { id: 'parent-1', phone: '9876543210', role: 'PARENT', fcmToken: 'fcm-token-parent1' },
    { id: 'parent-2', phone: '9876543211', role: 'PARENT', fcmToken: 'fcm-token-parent2' },
    { id: 'parent-3', phone: '9876543213', role: 'PARENT', fcmToken: 'fcm-token-parent3' },
  ],
  schools: [SCHOOL],
  students: [
    { 
      id: 'student-001', 
      name: 'Alice Johnson', 
      admissionNo: 'STU001',
      class: '5A',
      busId: 'bus-001', 
      parentPhone: '9876543210', 
      parentPhone2: null,
      stopId: 'stop-001', 
      dropStopId: 'drop-001' 
    },
    { 
      id: 'student-002', 
      name: 'Bob Smith', 
      admissionNo: 'STU002',
      class: '6B',
      busId: 'bus-001', 
      parentPhone: '9876543211', 
      parentPhone2: '9876543212',
      stopId: 'stop-002', 
      dropStopId: 'drop-002' 
    },
    { 
      id: 'student-003', 
      name: 'Charlie Brown', 
      admissionNo: 'STU003',
      class: '7C',
      busId: 'bus-001', 
      parentPhone: '9876543213', 
      parentPhone2: null,
      stopId: 'stop-003', 
      dropStopId: 'drop-003' 
    },
  ],
  stops: [
    { id: 'stop-001', busId: 'bus-001', direction: 'PICKUP', order: 1, name: 'Stop 1 - Alice', lat: 21.30, lng: 81.40, studentId: 'student-001' },
    { id: 'stop-002', busId: 'bus-001', direction: 'PICKUP', order: 2, name: 'Stop 2 - Bob', lat: 21.28, lng: 81.38, studentId: 'student-002' },
    { id: 'stop-003', busId: 'bus-001', direction: 'PICKUP', order: 3, name: 'Stop 3 - Charlie', lat: 21.26, lng: 81.36, studentId: 'student-003' },
  ],
};

function resetDb() {
  mockShared.seq = 0;
  Object.keys(mockShared.state).forEach((k) => { delete mockShared.state[k]; });
  Object.entries(SEED).forEach(([k, rows]) => { 
    mockShared.state[k] = rows.map((r) => ({ ...r })); 
  });
}

const db = () => mockShared.state;

// Fake Socket.IO that records all emitted events
let socketEvents = [];
const fakeIo = {
  to: (room) => ({
    emit: (event, payload) => {
      socketEvents.push({ 
        room, 
        event, 
        payload: JSON.parse(JSON.stringify(payload)) 
      });
    }
  }),
};

const takeSocketEvents = () => {
  const events = socketEvents;
  socketEvents = [];
  return events;
};

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

beforeEach(() => {
  resetDb();
  socketEvents = [];
  notificationMock.sendNotification.mockClear();
  notificationMock.sendMulticast.mockClear();
  app.set('io', fakeIo);
});

describe('Complete Pickup Trip Flow E2E', () => {
  describe('Scenario: Full pickup workflow from start to completion', () => {
    test('should complete entire pickup trip with stop-wise attendance marking', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // ==========================================
      // Step 1: Driver starts PICKUP trip
      // ==========================================
      const startRes = await request(app)
        .post('/api/trips/start')
        .set('Authorization', TOKENS.DRIVER)
        .send({ direction: 'PICKUP' });

      expect(startRes.status).toBe(201);
      expect(startRes.body).toMatchObject({
        success: true,
        resumed: false,
        trip: {
          busId: 'bus-001',
          direction: 'PICKUP',
          status: 'ACTIVE',
        }
      });

      const tripId = startRes.body.trip.id;
      const trip = startRes.body.trip;
      
      // Verify trip has 3 stops in correct order
      expect(trip.stops).toHaveLength(3);
      expect(trip.stops.map(s => s.stopId)).toEqual(['stop-001', 'stop-002', 'stop-003']);
      expect(trip.stops.map(s => s.status)).toEqual(['PENDING', 'PENDING', 'PENDING']);
      
      // Verify trip:state and tripStarted events emitted
      const startEvents = takeSocketEvents();
      const tripStateEvents = startEvents.filter(e => e.event === 'trip:state');
      expect(tripStateEvents).toHaveLength(2); // bus room + admins room
      expect(tripStateEvents.map(e => e.room).sort()).toEqual(['admins', 'bus_bus-001']);
      
      const tripStartedEvents = startEvents.filter(e => e.event === 'tripStarted');
      expect(tripStartedEvents).toHaveLength(2);
      
      // ==========================================
      // Step 2: System loads students for the trip grouped by stops
      // ==========================================
      const studentsRes = await request(app)
        .get('/api/trips/current/students')
        .set('Authorization', TOKENS.DRIVER);

      expect(studentsRes.status).toBe(200);
      expect(studentsRes.body).toMatchObject({
        success: true,
        trip: {
          id: tripId,
          busId: 'bus-001',
          direction: 'PICKUP',
          status: 'ACTIVE',
          currentStopId: 'stop-001' // First stop is current
        }
      });

      // Verify stops with students
      expect(studentsRes.body.stops).toHaveLength(3);
      expect(studentsRes.body.stops[0]).toMatchObject({
        id: 'stop-001',
        name: 'Stop 1 - Alice',
        order: 1,
        status: 'PENDING',
      });
      expect(studentsRes.body.stops[0].students).toHaveLength(1);
      expect(studentsRes.body.stops[0].students[0]).toMatchObject({
        id: 'student-001',
        name: 'Alice Johnson',
        relevantStop: 'stop-001',
        attendance: null // No attendance yet
      });

      // ==========================================
      // Step 3: Driver marks attendance at Stop 1 (Alice)
      // ==========================================
      const mark1Res = await request(app)
        .post('/api/attendance')
        .set('Authorization', TOKENS.DRIVER)
        .send({
          studentId: 'student-001',
          busId: 'bus-001',
          tripId: tripId,
          date: today,
          tripType: 'PICKUP',
          boarded: true
        });

      expect(mark1Res.status).toBe(200);
      expect(mark1Res.body).toMatchObject({
        success: true,
        attendance: {
          studentId: 'student-001',
          busId: 'bus-001',
          tripId: tripId,
          boarded: true,
          type: 'PICKUP'
        }
      });

      // ==========================================
      // Step 4: Real-time updates propagate via Socket.IO
      // ==========================================
      const mark1Events = takeSocketEvents();
      const attendanceEvents = mark1Events.filter(e => e.event === 'attendance:updated');
      
      expect(attendanceEvents).toHaveLength(2); // bus room + admins room
      expect(attendanceEvents.map(e => e.room).sort()).toEqual(['admins', 'bus_bus-001']);
      
      const busRoomEvent = attendanceEvents.find(e => e.room === 'bus_bus-001');
      expect(busRoomEvent.payload).toMatchObject({
        tripId: tripId,
        studentId: 'student-001',
        type: 'PICKUP',
        boarded: true,
        conductorId: null
      });
      expect(busRoomEvent.payload.checkedAt).toBeDefined();

      // ==========================================
      // Step 5: Attendance summary updates correctly
      // ==========================================
      const summary1Res = await request(app)
        .get('/api/trips/current/students')
        .set('Authorization', TOKENS.DRIVER);

      expect(summary1Res.status).toBe(200);
      const stop1AfterMark = summary1Res.body.stops[0];
      expect(stop1AfterMark.students[0].attendance).toMatchObject({
        boarded: true
      });

      // ==========================================
      // Step 6: Parent notifications are sent
      // ==========================================
      expect(notificationMock.sendMulticast).toHaveBeenCalledWith(
        ['fcm-token-parent1'],
        expect.stringContaining('Student Update'),
        expect.stringContaining('Alice Johnson'),
        expect.objectContaining({
          studentId: 'student-001',
          tripType: 'PICKUP',
          boarded: 'true'
        })
      );

      // ==========================================
      // Step 7: Trip progresses to next stop (complete Stop 1)
      // ==========================================
      const tripStopId1 = trip.stops[0].id;
      const completeStop1Res = await request(app)
        .post(`/api/trips/${tripId}/stops/${tripStopId1}/complete`)
        .set('Authorization', TOKENS.DRIVER);

      expect(completeStop1Res.status).toBe(200);
      expect(completeStop1Res.body.currentStop).toMatchObject({
        stopId: 'stop-002' // Moved to Stop 2
      });
      
      takeSocketEvents(); // Clear trip:state events

      // ==========================================
      // Step 8: Conductor marks attendance at Stop 2 (Bob)
      // ==========================================
      const mark2Res = await request(app)
        .post('/api/attendance')
        .set('Authorization', TOKENS.CONDUCTOR)
        .send({
          studentId: 'student-002',
          busId: 'bus-001',
          tripId: tripId,
          date: today,
          tripType: 'PICKUP',
          boarded: true,
          conductorId: 'conductor-001'
        });

      expect(mark2Res.status).toBe(200);
      expect(mark2Res.body.attendance).toMatchObject({
        studentId: 'student-002',
        boarded: true,
        conductorId: 'conductor-001'
      });

      // Verify Socket.IO event includes conductorId
      const mark2Events = takeSocketEvents();
      const mark2AttendanceEvent = mark2Events.find(
        e => e.event === 'attendance:updated' && e.room === 'bus_bus-001'
      );
      expect(mark2AttendanceEvent.payload).toMatchObject({
        studentId: 'student-002',
        conductorId: 'conductor-001'
      });

      // Verify parent notification for Bob (2 phones)
      expect(notificationMock.sendMulticast).toHaveBeenCalledWith(
        expect.arrayContaining(['fcm-token-parent2']),
        expect.stringContaining('Student Update'),
        expect.stringContaining('Bob Smith'),
        expect.any(Object)
      );

      // ==========================================
      // Step 9: Complete Stop 2, move to Stop 3
      // ==========================================
      const tripStopId2 = trip.stops[1].id;
      const completeStop2Res = await request(app)
        .post(`/api/trips/${tripId}/stops/${tripStopId2}/complete`)
        .set('Authorization', TOKENS.DRIVER);

      expect(completeStop2Res.status).toBe(200);
      expect(completeStop2Res.body.currentStop.stopId).toBe('stop-003');
      
      takeSocketEvents();

      // ==========================================
      // Step 10: Mark attendance at Stop 3 (Charlie)
      // ==========================================
      const mark3Res = await request(app)
        .post('/api/attendance')
        .set('Authorization', TOKENS.DRIVER)
        .send({
          studentId: 'student-003',
          busId: 'bus-001',
          tripId: tripId,
          date: today,
          tripType: 'PICKUP',
          boarded: true
        });

      expect(mark3Res.status).toBe(200);
      
      takeSocketEvents();

      // ==========================================
      // Step 11: Verify no duplicate attendance records
      // ==========================================
      // Try marking Alice again
      const duplicateRes = await request(app)
        .post('/api/attendance')
        .set('Authorization', TOKENS.DRIVER)
        .send({
          studentId: 'student-001',
          busId: 'bus-001',
          tripId: tripId,
          date: today,
          tripType: 'PICKUP',
          boarded: true
        });

      expect(duplicateRes.status).toBe(200); // Should update, not create
      
      // Verify only 3 attendance records exist (one per student)
      const attendanceRecords = db().attendances.filter(a => a.tripId === tripId);
      expect(attendanceRecords).toHaveLength(3);
      expect(attendanceRecords.map(a => a.studentId).sort()).toEqual([
        'student-001',
        'student-002',
        'student-003'
      ]);

      takeSocketEvents();

      // ==========================================
      // Step 12: Complete final stop
      // ==========================================
      const tripStopId3 = trip.stops[2].id;
      const completeStop3Res = await request(app)
        .post(`/api/trips/${tripId}/stops/${tripStopId3}/complete`)
        .set('Authorization', TOKENS.DRIVER);

      expect(completeStop3Res.status).toBe(200);
      expect(completeStop3Res.body.currentStop).toBeNull(); // No more stops
      expect(completeStop3Res.body.destination).toMatchObject({
        kind: 'SCHOOL',
        name: SCHOOL.name
      });

      takeSocketEvents();

      // ==========================================
      // Step 13: Trip completes successfully
      // ==========================================
      const endRes = await request(app)
        .post(`/api/trips/${tripId}/end`)
        .set('Authorization', TOKENS.DRIVER);

      expect(endRes.status).toBe(200);
      expect(endRes.body.trip.status).toBe('COMPLETED');
      expect(endRes.body.trip.stops.map(s => s.status)).toEqual([
        'COMPLETED',
        'COMPLETED',
        'COMPLETED'
      ]);

      // Verify trip:state and tripEnded events
      const endEvents = takeSocketEvents();
      const tripEndedEvents = endEvents.filter(e => e.event === 'tripEnded');
      expect(tripEndedEvents).toHaveLength(2);

      // ==========================================
      // Verify final state
      // ==========================================
      const finalStudentsRes = await request(app)
        .get('/api/trips/current/students')
        .set('Authorization', TOKENS.DRIVER);

      expect(finalStudentsRes.status).toBe(200);
      expect(finalStudentsRes.body.trip).toBeNull(); // No active trip

      // Verify all notifications were sent (3 students)
      expect(notificationMock.sendMulticast).toHaveBeenCalledTimes(4); // 3 marks + 1 duplicate
    });
  });

  describe('Attendance validation and error handling', () => {
    test('should reject attendance for invalid trip', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const res = await request(app)
        .post('/api/attendance')
        .set('Authorization', TOKENS.DRIVER)
        .send({
          studentId: 'student-001',
          busId: 'bus-001',
          tripId: 'invalid-trip-id',
          date: today,
          tripType: 'PICKUP',
          boarded: true
        });

      expect(res.status).toBe(404);
      expect(res.body.message).toContain('Trip not found');
    });

    test('should reject attendance for inactive trip', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Create completed trip
      const completedTrip = {
        id: 'completed-trip',
        busId: 'bus-001',
        direction: 'PICKUP',
        status: 'COMPLETED'
      };
      db().trips.push(completedTrip);

      const res = await request(app)
        .post('/api/attendance')
        .set('Authorization', TOKENS.DRIVER)
        .send({
          studentId: 'student-001',
          busId: 'bus-001',
          tripId: 'completed-trip',
          date: today,
          tripType: 'PICKUP',
          boarded: true
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toContain('Invalid or inactive trip');
    });

    test('should reject attendance for mismatched bus', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Create trip for different bus
      const otherTrip = {
        id: 'other-trip',
        busId: 'bus-999',
        direction: 'PICKUP',
        status: 'ACTIVE'
      };
      db().trips.push(otherTrip);

      const res = await request(app)
        .post('/api/attendance')
        .set('Authorization', TOKENS.DRIVER)
        .send({
          studentId: 'student-001',
          busId: 'bus-001', // Different from trip's busId
          tripId: 'other-trip',
          date: today,
          tripType: 'PICKUP',
          boarded: true
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('does not belong to specified bus');
    });
  });

  describe('Real-time synchronization', () => {
    test('should sync attendance updates across driver and conductor devices', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Start trip
      const startRes = await request(app)
        .post('/api/trips/start')
        .set('Authorization', TOKENS.DRIVER)
        .send({ direction: 'PICKUP' });

      const tripId = startRes.body.trip.id;
      takeSocketEvents();

      // Driver marks attendance
      await request(app)
        .post('/api/attendance')
        .set('Authorization', TOKENS.DRIVER)
        .send({
          studentId: 'student-001',
          busId: 'bus-001',
          tripId: tripId,
          date: today,
          tripType: 'PICKUP',
          boarded: true
        });

      const events = takeSocketEvents();
      const busEvents = events.filter(e => e.room === 'bus_bus-001');
      const adminEvents = events.filter(e => e.room === 'admins');

      // Both bus room (for conductor to receive) and admins room should get update
      expect(busEvents).toHaveLength(1);
      expect(adminEvents).toHaveLength(1);
      
      // Verify payload structure for real-time sync
      expect(busEvents[0].payload).toMatchObject({
        tripId: tripId,
        studentId: 'student-001',
        type: 'PICKUP',
        boarded: true,
        conductorId: null
      });
      expect(busEvents[0].payload.checkedAt).toBeDefined();
    });
  });

  describe('Attendance summary and reporting', () => {
    test('should provide accurate attendance summary throughout trip', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Start trip
      const startRes = await request(app)
        .post('/api/trips/start')
        .set('Authorization', TOKENS.DRIVER)
        .send({ direction: 'PICKUP' });

      const tripId = startRes.body.trip.id;
      takeSocketEvents();

      // Check initial summary - no attendance
      let summaryRes = await request(app)
        .get('/api/trips/current/students')
        .set('Authorization', TOKENS.DRIVER);

      let allStudents = summaryRes.body.stops.flatMap(s => s.students);
      let markedCount = allStudents.filter(s => s.attendance?.boarded).length;
      expect(markedCount).toBe(0);
      expect(allStudents.length).toBe(3);

      // Mark first student
      await request(app)
        .post('/api/attendance')
        .set('Authorization', TOKENS.DRIVER)
        .send({
          studentId: 'student-001',
          busId: 'bus-001',
          tripId: tripId,
          date: today,
          tripType: 'PICKUP',
          boarded: true
        });

      // Check summary - 1/3 marked
      summaryRes = await request(app)
        .get('/api/trips/current/students')
        .set('Authorization', TOKENS.DRIVER);

      allStudents = summaryRes.body.stops.flatMap(s => s.students);
      markedCount = allStudents.filter(s => s.attendance?.boarded).length;
      expect(markedCount).toBe(1);

      // Mark second student
      await request(app)
        .post('/api/attendance')
        .set('Authorization', TOKENS.DRIVER)
        .send({
          studentId: 'student-002',
          busId: 'bus-001',
          tripId: tripId,
          date: today,
          tripType: 'PICKUP',
          boarded: true
        });

      // Check summary - 2/3 marked
      summaryRes = await request(app)
        .get('/api/trips/current/students')
        .set('Authorization', TOKENS.DRIVER);

      allStudents = summaryRes.body.stops.flatMap(s => s.students);
      markedCount = allStudents.filter(s => s.attendance?.boarded).length;
      expect(markedCount).toBe(2);

      // Mark third student
      await request(app)
        .post('/api/attendance')
        .set('Authorization', TOKENS.DRIVER)
        .send({
          studentId: 'student-003',
          busId: 'bus-001',
          tripId: tripId,
          date: today,
          tripType: 'PICKUP',
          boarded: true
        });

      // Check final summary - 3/3 marked (all students accounted for)
      summaryRes = await request(app)
        .get('/api/trips/current/students')
        .set('Authorization', TOKENS.DRIVER);

      allStudents = summaryRes.body.stops.flatMap(s => s.students);
      markedCount = allStudents.filter(s => s.attendance?.boarded).length;
      expect(markedCount).toBe(3);
      expect(allStudents.length).toBe(3);
    });
  });

  describe('Parent notifications', () => {
    test('should send notifications to all parent phones', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Start trip
      const startRes = await request(app)
        .post('/api/trips/start')
        .set('Authorization', TOKENS.DRIVER)
        .send({ direction: 'PICKUP' });

      const tripId = startRes.body.trip.id;
      takeSocketEvents();
      notificationMock.sendMulticast.mockClear();

      // Mark student with 2 parent phones (Bob)
      await request(app)
        .post('/api/attendance')
        .set('Authorization', TOKENS.DRIVER)
        .send({
          studentId: 'student-002',
          busId: 'bus-001',
          tripId: tripId,
          date: today,
          tripType: 'PICKUP',
          boarded: true
        });

      // Wait for async notification
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should send to parent2's token (parentPhone2 doesn't have fcmToken in our mock)
      expect(notificationMock.sendMulticast).toHaveBeenCalled();
      const call = notificationMock.sendMulticast.mock.calls[0];
      expect(call[0]).toContain('fcm-token-parent2');
      expect(call[1]).toContain('Student Update');
      expect(call[2]).toContain('Bob Smith');
    });
  });
});

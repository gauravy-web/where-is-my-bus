// Tests that chatRoutes are correctly defined with proper middleware
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/testdb';
process.env.JWT_SECRET = 'test-jwt-secret';

// Mock database
jest.mock('../src/db', () => {
  const tables = { users: [], buses: [], students: [], drivers: [], conductors: [] };
  const find = (rows, where = {}) => rows.find((r) => Object.entries(where).every(([k, v]) => r[k] === v));
  const clone = (x) => (x ? { ...x } : null);
  
  const client = {
    user: {
      findUnique: jest.fn(async ({ where }) => clone(find(tables.users, where))),
      findMany: jest.fn(async () => tables.users.map(clone)),
    },
    bus: {
      findUnique: jest.fn(async ({ where }) => clone(find(tables.buses, where))),
      findMany: jest.fn(async () => tables.buses.map(clone)),
    },
    student: {
      findMany: jest.fn(async () => tables.students.map(clone)),
    },
    driver: {
      findUnique: jest.fn(async ({ where }) => clone(find(tables.drivers, where))),
    },
    conductor: {
      findUnique: jest.fn(async ({ where }) => clone(find(tables.conductors, where))),
    },
    chatMessage: {
      create: jest.fn(async ({ data }) => ({ id: 'msg1', ...data, createdAt: new Date() })),
      findMany: jest.fn(async () => []),
      update: jest.fn(async ({ where, data }) => ({ id: where.id, ...data })),
      delete: jest.fn(async ({ where }) => ({ id: where.id })),
    },
    chatReadStatus: {
      upsert: jest.fn(async ({ where, create, update }) => ({ id: 'status1', ...create, ...update })),
      findUnique: jest.fn(async () => null),
    },
    $disconnect: jest.fn(),
    __tables: tables,
  };
  return client;
});

// Mock chatService
jest.mock('../src/services/chatService', () => ({
  createMessage: jest.fn(async (data) => ({ id: 'msg1', ...data, createdAt: new Date() })),
  getMessages: jest.fn(async () => ({
    messages: [],
    pagination: { page: 1, limit: 50, totalMessages: 0, totalPages: 0, hasMore: false },
    announcements: [],
  })),
  editMessage: jest.fn(async (data) => ({ id: data.messageId, content: data.content, editedAt: new Date() })),
  deleteMessage: jest.fn(async (data) => ({ id: data.messageId, busId: 'bus1' })),
  markAsRead: jest.fn(async () => {}),
  getUnreadCount: jest.fn(async () => 0),
  sendMessageNotifications: jest.fn(async () => {}),
}));

// Mock accessService
jest.mock('../src/services/accessService', () => {
  const createAccessService = jest.fn(() => ({
    canViewBus: jest.fn(async () => true),
    getParentStudents: jest.fn(async () => []),
    getDriverForUser: jest.fn(async () => null),
    getConductorForUser: jest.fn(async () => null),
    busRoom: jest.fn((busId) => `bus_${busId}`),
  }));
  
  return {
    createAccessService,
    canViewBus: jest.fn(async () => true),
    getParentStudents: jest.fn(async () => []),
    getDriverForUser: jest.fn(async () => null),
    getConductorForUser: jest.fn(async () => null),
    busRoom: jest.fn((busId) => `bus_${busId}`),
  };
});

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');

const sign = (payload) => `Bearer ${jwt.sign(payload, 'test-jwt-secret')}`;
const ADMIN = sign({ id: 'admin1', role: 'ADMIN' });
const PARENT = sign({ id: 'parent1', role: 'PARENT' });
const DRIVER = sign({ id: 'driver1', role: 'DRIVER' });

describe('Chat Routes - Authorization', () => {
  test('POST /api/chat/buses/:busId/messages requires authentication', async () => {
    const res = await request(app)
      .post('/api/chat/buses/bus1/messages')
      .send({ content: 'Hello' });
    expect(res.status).toBe(401);
  });

  test('GET /api/chat/buses/:busId/messages requires authentication', async () => {
    const res = await request(app)
      .get('/api/chat/buses/bus1/messages');
    expect(res.status).toBe(401);
  });

  test('PATCH /api/chat/messages/:messageId requires authentication', async () => {
    const res = await request(app)
      .patch('/api/chat/messages/msg1')
      .send({ content: 'Updated' });
    expect(res.status).toBe(401);
  });

  test('DELETE /api/chat/messages/:messageId requires authentication', async () => {
    const res = await request(app)
      .delete('/api/chat/messages/msg1');
    expect(res.status).toBe(401);
  });

  test('POST /api/chat/buses/:busId/announcements requires authentication', async () => {
    const res = await request(app)
      .post('/api/chat/buses/bus1/announcements')
      .send({ content: 'Announcement' });
    expect(res.status).toBe(401);
  });

  test('GET /api/chat/my-groups requires authentication', async () => {
    const res = await request(app)
      .get('/api/chat/my-groups');
    expect(res.status).toBe(401);
  });

  test('POST /api/chat/buses/:busId/mark-read requires authentication', async () => {
    const res = await request(app)
      .post('/api/chat/buses/bus1/mark-read');
    expect(res.status).toBe(401);
  });

  test('GET /api/chat/unread-counts requires authentication', async () => {
    const res = await request(app)
      .get('/api/chat/unread-counts');
    expect(res.status).toBe(401);
  });
});

describe('Chat Routes - Admin-Only Endpoints', () => {
  test('DELETE /api/chat/messages/:messageId requires ADMIN role', async () => {
    const res = await request(app)
      .delete('/api/chat/messages/msg1')
      .set('Authorization', PARENT);
    expect(res.status).toBe(403);
  });

  test('POST /api/chat/buses/:busId/announcements requires ADMIN role', async () => {
    const res = await request(app)
      .post('/api/chat/buses/bus1/announcements')
      .set('Authorization', DRIVER)
      .send({ content: 'Announcement' });
    expect(res.status).toBe(403);
  });

  test('ADMIN can delete messages', async () => {
    const res = await request(app)
      .delete('/api/chat/messages/msg1')
      .set('Authorization', ADMIN);
    expect(res.status).toBe(200);
  });

  test('ADMIN can create announcements', async () => {
    const res = await request(app)
      .post('/api/chat/buses/bus1/announcements')
      .set('Authorization', ADMIN)
      .send({ content: 'Official announcement' });
    expect(res.status).toBe(201);
  });
});

describe('Chat Routes - HTTP Methods', () => {
  test('POST /api/chat/buses/:busId/messages accepts POST', async () => {
    const res = await request(app)
      .post('/api/chat/buses/bus1/messages')
      .set('Authorization', PARENT)
      .send({ content: 'Hello everyone!' });
    expect(res.status).toBe(201);
  });

  test('GET /api/chat/buses/:busId/messages accepts GET', async () => {
    const res = await request(app)
      .get('/api/chat/buses/bus1/messages')
      .set('Authorization', PARENT);
    expect(res.status).toBe(200);
  });

  test('PATCH /api/chat/messages/:messageId accepts PATCH', async () => {
    const res = await request(app)
      .patch('/api/chat/messages/msg1')
      .set('Authorization', PARENT)
      .send({ content: 'Updated message' });
    expect(res.status).toBe(200);
  });

  test('GET /api/chat/my-groups accepts GET', async () => {
    const res = await request(app)
      .get('/api/chat/my-groups')
      .set('Authorization', PARENT);
    expect(res.status).toBe(200);
  });

  test('POST /api/chat/buses/:busId/mark-read accepts POST', async () => {
    const res = await request(app)
      .post('/api/chat/buses/bus1/mark-read')
      .set('Authorization', PARENT);
    expect(res.status).toBe(200);
  });

  test('GET /api/chat/unread-counts accepts GET', async () => {
    const res = await request(app)
      .get('/api/chat/unread-counts')
      .set('Authorization', PARENT);
    expect(res.status).toBe(200);
  });
});

describe('Chat Routes - Rate Limiting', () => {
  test('POST /api/chat/buses/:busId/messages applies rate limiter', async () => {
    // Send 11 messages rapidly (rate limit is 10 per minute)
    const requests = [];
    for (let i = 0; i < 11; i++) {
      requests.push(
        request(app)
          .post('/api/chat/buses/bus1/messages')
          .set('Authorization', PARENT)
          .send({ content: `Message ${i}` })
      );
    }
    
    const responses = await Promise.all(requests);
    
    // First 10 should succeed or be rate limited
    const rateLimited = responses.filter(r => r.status === 429);
    
    // At least one should be rate limited
    expect(rateLimited.length).toBeGreaterThan(0);
  });
});

// Smoke test for src/app.js (Requirement 1.6). Prisma and FCM are mocked so
// no database or network connection is made (Requirement 16.3).
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/testdb';
process.env.JWT_SECRET = 'test-jwt-secret';

jest.mock('../src/db', () => ({
  user: { findMany: jest.fn(), findUnique: jest.fn() },
  $queryRaw: jest.fn(),
  $disconnect: jest.fn(),
}));

jest.mock('../src/services/notificationService', () => ({
  sendNotification: jest.fn(),
  sendMulticast: jest.fn(),
}));

const request = require('supertest');
const prisma = require('../src/db');
const app = require('../src/app');

describe('app.js', () => {
  test('exports an Express app without starting a server', () => {
    expect(typeof app).toBe('function');
    expect(typeof app.listen).toBe('function');
  });

  test('GET / returns the health message', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Where Is My Bus Backend Running ✅' });
  });

  test('loading the app makes no database calls', () => {
    expect(prisma.user.findMany).not.toHaveBeenCalled();
    expect(prisma.$queryRaw).not.toHaveBeenCalled();
  });
});

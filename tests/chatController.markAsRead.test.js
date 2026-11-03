/**
 * Integration tests for chatController.markAsRead
 * Tests the POST /api/chat/buses/:busId/mark-read endpoint
 * 
 * Task 4.7: Implement markAsRead endpoint
 * Requirements: REQ-NOT-005
 */

const request = require('supertest');
const express = require('express');
const { protect } = require('../src/middleware/authMiddleware');
const { markAsRead } = require('../src/controllers/chatController');
const chatService = require('../src/services/chatService');
const accessService = require('../src/services/accessService');

// Mock dependencies
jest.mock('../src/services/chatService');
jest.mock('../src/services/accessService');

describe('POST /api/chat/buses/:busId/mark-read', () => {
  let app;

  beforeEach(() => {
    // Create Express app
    app = express();
    app.use(express.json());

    // Mock auth middleware
    app.use((req, res, next) => {
      req.user = {
        id: 'test-user-id',
        role: 'PARENT',
        phone: '1234567890',
      };
      next();
    });

    // Mount route
    app.post('/api/chat/buses/:busId/mark-read', markAsRead);

    // Reset mocks
    jest.clearAllMocks();
  });

  /**
   * Test: Returns 200 OK when user has access to bus
   */
  test('returns 200 OK when user has access to bus', async () => {
    const busId = 'test-bus-123';

    // Mock authorization check
    accessService.canViewBus.mockResolvedValue(true);

    // Mock markAsRead service
    chatService.markAsRead.mockResolvedValue(undefined);

    const response = await request(app)
      .post(`/api/chat/buses/${busId}/mark-read`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: 'Messages marked as read',
    });

    // Verify authorization was checked
    expect(accessService.canViewBus).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'test-user-id' }),
      busId
    );

    // Verify service was called
    expect(chatService.markAsRead).toHaveBeenCalledWith(busId, 'test-user-id');
  });

  /**
   * Test: Returns 403 Forbidden when user does not have access to bus
   */
  test('returns 403 Forbidden when user does not have access to bus', async () => {
    const busId = 'test-bus-456';

    // Mock authorization check to deny access
    accessService.canViewBus.mockResolvedValue(false);

    const response = await request(app)
      .post(`/api/chat/buses/${busId}/mark-read`)
      .send();

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      message: 'Access denied',
    });

    // Verify authorization was checked
    expect(accessService.canViewBus).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'test-user-id' }),
      busId
    );

    // Verify service was NOT called
    expect(chatService.markAsRead).not.toHaveBeenCalled();
  });

  /**
   * Test: Validates authorization using accessService.canViewBus()
   */
  test('validates authorization using accessService.canViewBus()', async () => {
    const busId = 'test-bus-789';

    accessService.canViewBus.mockResolvedValue(true);
    chatService.markAsRead.mockResolvedValue(undefined);

    await request(app)
      .post(`/api/chat/buses/${busId}/mark-read`)
      .send();

    // Verify canViewBus was called with correct parameters
    expect(accessService.canViewBus).toHaveBeenCalledTimes(1);
    expect(accessService.canViewBus).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'test-user-id',
        role: 'PARENT',
        phone: '1234567890',
      }),
      busId
    );
  });

  /**
   * Test: Calls chatService.markAsRead() with correct parameters
   */
  test('calls chatService.markAsRead() with correct parameters', async () => {
    const busId = 'test-bus-abc';
    const userId = 'test-user-id';

    accessService.canViewBus.mockResolvedValue(true);
    chatService.markAsRead.mockResolvedValue(undefined);

    await request(app)
      .post(`/api/chat/buses/${busId}/mark-read`)
      .send();

    // Verify markAsRead was called with correct parameters
    expect(chatService.markAsRead).toHaveBeenCalledTimes(1);
    expect(chatService.markAsRead).toHaveBeenCalledWith(busId, userId);
  });

  /**
   * Test: Handles service errors gracefully
   */
  test('returns 500 when service throws error', async () => {
    const busId = 'test-bus-error';

    accessService.canViewBus.mockResolvedValue(true);
    chatService.markAsRead.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .post(`/api/chat/buses/${busId}/mark-read`)
      .send();

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: 'Failed to mark messages as read',
    });
  });

  /**
   * Test: Works for different user roles (DRIVER)
   */
  test('works for DRIVER role with access', async () => {
    // Update mock user to be a driver
    app = express();
    app.use(express.json());
    app.use((req, res, next) => {
      req.user = {
        id: 'driver-id',
        role: 'DRIVER',
        phone: '9876543210',
      };
      next();
    });
    app.post('/api/chat/buses/:busId/mark-read', markAsRead);

    const busId = 'test-bus-driver';

    accessService.canViewBus.mockResolvedValue(true);
    chatService.markAsRead.mockResolvedValue(undefined);

    const response = await request(app)
      .post(`/api/chat/buses/${busId}/mark-read`)
      .send();

    expect(response.status).toBe(200);
    expect(chatService.markAsRead).toHaveBeenCalledWith(busId, 'driver-id');
  });

  /**
   * Test: Works for ADMIN role
   */
  test('works for ADMIN role with access to all buses', async () => {
    // Update mock user to be an admin
    app = express();
    app.use(express.json());
    app.use((req, res, next) => {
      req.user = {
        id: 'admin-id',
        role: 'ADMIN',
      };
      next();
    });
    app.post('/api/chat/buses/:busId/mark-read', markAsRead);

    const busId = 'any-bus';

    accessService.canViewBus.mockResolvedValue(true);
    chatService.markAsRead.mockResolvedValue(undefined);

    const response = await request(app)
      .post(`/api/chat/buses/${busId}/mark-read`)
      .send();

    expect(response.status).toBe(200);
    expect(chatService.markAsRead).toHaveBeenCalledWith(busId, 'admin-id');
  });

  /**
   * Test: Handles special characters in busId
   */
  test('handles busId with special characters', async () => {
    const busId = 'bus-123-xyz';

    accessService.canViewBus.mockResolvedValue(true);
    chatService.markAsRead.mockResolvedValue(undefined);

    const response = await request(app)
      .post(`/api/chat/buses/${busId}/mark-read`)
      .send();

    expect(response.status).toBe(200);
    expect(chatService.markAsRead).toHaveBeenCalledWith(busId, 'test-user-id');
  });
});

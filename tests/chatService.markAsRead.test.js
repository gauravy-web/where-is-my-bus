/**
 * Unit tests for chatService.markAsRead
 * Tests the mark as read functionality
 */

const { createChatService } = require('../src/services/chatService');
const { PrismaClient } = require('../src/generated/prisma');

describe('chatService.markAsRead', () => {
  let prisma;
  let chatService;

  // Increase timeout for all tests in this suite
  jest.setTimeout(10000);

  beforeAll(() => {
    prisma = new PrismaClient();
    const module = require('../src/services/chatService');
    chatService = {
      markAsRead: module.markAsRead,
    };
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  /**
   * Test: markAsRead creates a new ChatReadStatus record when none exists
   */
  test('creates new ChatReadStatus when none exists', async () => {
    const busId = 'test-bus-' + Date.now();
    const userId = 'test-user-' + Date.now();

    // Mark as read
    await chatService.markAsRead(busId, userId);

    // Verify the record was created
    const readStatus = await prisma.chatReadStatus.findUnique({
      where: {
        busId_userId: { busId, userId },
      },
    });

    expect(readStatus).toBeTruthy();
    expect(readStatus.busId).toBe(busId);
    expect(readStatus.userId).toBe(userId);
    expect(readStatus.lastReadAt).toBeInstanceOf(Date);

    // Clean up
    await prisma.chatReadStatus.delete({
      where: { id: readStatus.id },
    });
  });

  /**
   * Test: markAsRead updates existing ChatReadStatus record
   */
  test('updates existing ChatReadStatus when one exists', async () => {
    const busId = 'test-bus-' + Date.now();
    const userId = 'test-user-' + Date.now();

    // Create initial record
    const initialTime = new Date('2024-01-01T00:00:00Z');
    const initial = await prisma.chatReadStatus.create({
      data: {
        busId,
        userId,
        lastReadAt: initialTime,
      },
    });

    // Wait a moment to ensure timestamp changes
    await new Promise(resolve => setTimeout(resolve, 10));

    // Mark as read again
    await chatService.markAsRead(busId, userId);

    // Verify the record was updated
    const updated = await prisma.chatReadStatus.findUnique({
      where: {
        busId_userId: { busId, userId },
      },
    });

    expect(updated).toBeTruthy();
    expect(updated.id).toBe(initial.id); // Same record
    expect(updated.lastReadAt.getTime()).toBeGreaterThan(initialTime.getTime());

    // Clean up
    await prisma.chatReadStatus.delete({
      where: { id: updated.id },
    });
  });

  /**
   * Test: markAsRead sets lastReadAt to current timestamp
   */
  test('sets lastReadAt to current timestamp', async () => {
    const busId = 'test-bus-' + Date.now();
    const userId = 'test-user-' + Date.now();

    const before = new Date();
    await chatService.markAsRead(busId, userId);
    const after = new Date();

    const readStatus = await prisma.chatReadStatus.findUnique({
      where: {
        busId_userId: { busId, userId },
      },
    });

    expect(readStatus.lastReadAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(readStatus.lastReadAt.getTime()).toBeLessThanOrEqual(after.getTime());

    // Clean up
    await prisma.chatReadStatus.delete({
      where: { id: readStatus.id },
    });
  });

  /**
   * Test: markAsRead is idempotent - calling multiple times doesn't fail
   */
  test('is idempotent - can be called multiple times', async () => {
    const busId = 'test-bus-' + Date.now();
    const userId = 'test-user-' + Date.now();

    // Call multiple times
    await chatService.markAsRead(busId, userId);
    await chatService.markAsRead(busId, userId);
    await chatService.markAsRead(busId, userId);

    // Verify only one record exists
    const count = await prisma.chatReadStatus.count({
      where: { busId, userId },
    });

    expect(count).toBe(1);

    // Clean up
    await prisma.chatReadStatus.deleteMany({
      where: { busId, userId },
    });
  });
});

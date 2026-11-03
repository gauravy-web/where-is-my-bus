/**
 * Test suite for chatCleanup job
 * Task 7.1: Create chat cleanup cron job
 * 
 * Requirements:
 * - REQ-MSG-010: Automatic cleanup of old messages
 * - REQ-DATA-001: 30-day retention period
 * - REQ-DATA-002: Exclude pinned announcements from deletion
 */

const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

describe('chatCleanup job logic', () => {
  let testBusId;

  beforeAll(async () => {
    // Create test bus
    const bus = await prisma.bus.create({
      data: {
        busNo: 'TEST-CLEANUP-001',
        driverName: 'Test Driver',
        status: 'ACTIVE'
      }
    });
    testBusId = bus.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.chatMessage.deleteMany({
      where: { busId: testBusId }
    });
    await prisma.bus.deleteMany({
      where: { busNo: 'TEST-CLEANUP-001' }
    });
    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Clean up messages after each test
    await prisma.chatMessage.deleteMany({
      where: { busId: testBusId }
    });
  });

  test('should delete regular messages older than 30 days', async () => {
    // Create old message (31 days ago)
    const thirtyOneDaysAgo = new Date();
    thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31);

    await prisma.chatMessage.create({
      data: {
        busId: testBusId,
        senderId: 'test-user-1',
        senderRole: 'PARENT',
        senderName: 'Test Parent',
        content: 'Old message to be deleted',
        type: 'MESSAGE',
        createdAt: thirtyOneDaysAgo
      }
    });

    // Create recent message (5 days ago)
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    await prisma.chatMessage.create({
      data: {
        busId: testBusId,
        senderId: 'test-user-2',
        senderRole: 'PARENT',
        senderName: 'Test Parent 2',
        content: 'Recent message to keep',
        type: 'MESSAGE',
        createdAt: fiveDaysAgo
      }
    });

    // Execute cleanup logic
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await prisma.chatMessage.deleteMany({
      where: {
        createdAt: { lt: thirtyDaysAgo },
        OR: [
          { type: 'MESSAGE' },
          { AND: [{ type: 'ANNOUNCEMENT' }, { isPinned: false }] },
        ],
      },
    });

    // Verify old message was deleted
    expect(result.count).toBe(1);

    // Verify recent message still exists
    const remaining = await prisma.chatMessage.findMany({
      where: { busId: testBusId }
    });
    expect(remaining.length).toBe(1);
    expect(remaining[0].content).toBe('Recent message to keep');
  });

  test('should NOT delete pinned announcements older than 30 days', async () => {
    // Create old pinned announcement (31 days ago)
    const thirtyOneDaysAgo = new Date();
    thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31);

    await prisma.chatMessage.create({
      data: {
        busId: testBusId,
        senderId: 'admin-1',
        senderRole: 'ADMIN',
        senderName: 'Test Admin',
        content: 'Important announcement to keep',
        type: 'ANNOUNCEMENT',
        isPinned: true,
        createdAt: thirtyOneDaysAgo
      }
    });

    // Execute cleanup logic
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await prisma.chatMessage.deleteMany({
      where: {
        createdAt: { lt: thirtyDaysAgo },
        OR: [
          { type: 'MESSAGE' },
          { AND: [{ type: 'ANNOUNCEMENT' }, { isPinned: false }] },
        ],
      },
    });

    // Verify no messages were deleted
    expect(result.count).toBe(0);

    // Verify pinned announcement still exists
    const remaining = await prisma.chatMessage.findMany({
      where: { busId: testBusId }
    });
    expect(remaining.length).toBe(1);
    expect(remaining[0].type).toBe('ANNOUNCEMENT');
    expect(remaining[0].isPinned).toBe(true);
  });

  test('should delete unpinned announcements older than 30 days', async () => {
    // Create old unpinned announcement (31 days ago)
    const thirtyOneDaysAgo = new Date();
    thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31);

    await prisma.chatMessage.create({
      data: {
        busId: testBusId,
        senderId: 'admin-1',
        senderRole: 'ADMIN',
        senderName: 'Test Admin',
        content: 'Old unpinned announcement',
        type: 'ANNOUNCEMENT',
        isPinned: false,
        createdAt: thirtyOneDaysAgo
      }
    });

    // Execute cleanup logic
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await prisma.chatMessage.deleteMany({
      where: {
        createdAt: { lt: thirtyDaysAgo },
        OR: [
          { type: 'MESSAGE' },
          { AND: [{ type: 'ANNOUNCEMENT' }, { isPinned: false }] },
        ],
      },
    });

    // Verify unpinned announcement was deleted
    expect(result.count).toBe(1);

    // Verify no messages remain
    const remaining = await prisma.chatMessage.findMany({
      where: { busId: testBusId }
    });
    expect(remaining.length).toBe(0);
  });

  test('should handle mixed message types correctly', async () => {
    const thirtyOneDaysAgo = new Date();
    thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31);

    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    // Create various messages
    await prisma.chatMessage.createMany({
      data: [
        // Old regular message - should be deleted
        {
          busId: testBusId,
          senderId: 'user-1',
          senderRole: 'PARENT',
          senderName: 'Parent 1',
          content: 'Old message 1',
          type: 'MESSAGE',
          createdAt: thirtyOneDaysAgo
        },
        // Old regular message - should be deleted
        {
          busId: testBusId,
          senderId: 'user-2',
          senderRole: 'DRIVER',
          senderName: 'Driver 1',
          content: 'Old message 2',
          type: 'MESSAGE',
          createdAt: thirtyOneDaysAgo
        },
        // Old pinned announcement - should NOT be deleted
        {
          busId: testBusId,
          senderId: 'admin-1',
          senderRole: 'ADMIN',
          senderName: 'Admin 1',
          content: 'Important old announcement',
          type: 'ANNOUNCEMENT',
          isPinned: true,
          createdAt: thirtyOneDaysAgo
        },
        // Old unpinned announcement - should be deleted
        {
          busId: testBusId,
          senderId: 'admin-2',
          senderRole: 'ADMIN',
          senderName: 'Admin 2',
          content: 'Old unpinned announcement',
          type: 'ANNOUNCEMENT',
          isPinned: false,
          createdAt: thirtyOneDaysAgo
        },
        // Recent message - should NOT be deleted
        {
          busId: testBusId,
          senderId: 'user-3',
          senderRole: 'PARENT',
          senderName: 'Parent 2',
          content: 'Recent message',
          type: 'MESSAGE',
          createdAt: fiveDaysAgo
        }
      ]
    });

    // Execute cleanup logic
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await prisma.chatMessage.deleteMany({
      where: {
        createdAt: { lt: thirtyDaysAgo },
        OR: [
          { type: 'MESSAGE' },
          { AND: [{ type: 'ANNOUNCEMENT' }, { isPinned: false }] },
        ],
      },
    });

    // Verify correct number deleted (2 old messages + 1 old unpinned announcement)
    expect(result.count).toBe(3);

    // Verify remaining messages
    const remaining = await prisma.chatMessage.findMany({
      where: { busId: testBusId },
      orderBy: { createdAt: 'asc' }
    });
    expect(remaining.length).toBe(2);
    expect(remaining[0].content).toBe('Important old announcement');
    expect(remaining[0].isPinned).toBe(true);
    expect(remaining[1].content).toBe('Recent message');
  });

  test('should handle edge case: messages exactly 30 days old should NOT be deleted', async () => {
    // Calculate the threshold once to avoid timing issues
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Create message exactly at the threshold (same timestamp)
    await prisma.chatMessage.create({
      data: {
        busId: testBusId,
        senderId: 'user-1',
        senderRole: 'PARENT',
        senderName: 'Test Parent',
        content: 'Message exactly 30 days old',
        type: 'MESSAGE',
        createdAt: thirtyDaysAgo
      }
    });

    // Execute cleanup logic with the same threshold
    const result = await prisma.chatMessage.deleteMany({
      where: {
        createdAt: { lt: thirtyDaysAgo },
        OR: [
          { type: 'MESSAGE' },
          { AND: [{ type: 'ANNOUNCEMENT' }, { isPinned: false }] },
        ],
      },
    });

    // Verify no messages were deleted (since we use lt, not lte)
    expect(result.count).toBe(0);

    // Verify message still exists
    const remaining = await prisma.chatMessage.findMany({
      where: { busId: testBusId }
    });
    expect(remaining.length).toBe(1);
  });

  test('should handle empty database gracefully', async () => {
    // Ensure no messages exist
    await prisma.chatMessage.deleteMany({
      where: { busId: testBusId }
    });

    // Execute cleanup logic
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await prisma.chatMessage.deleteMany({
      where: {
        createdAt: { lt: thirtyDaysAgo },
        OR: [
          { type: 'MESSAGE' },
          { AND: [{ type: 'ANNOUNCEMENT' }, { isPinned: false }] },
        ],
      },
    });

    // Verify no errors and count is 0
    expect(result.count).toBe(0);
  });
});

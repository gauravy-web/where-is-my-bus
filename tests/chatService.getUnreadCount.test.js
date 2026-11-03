const chatService = require('../src/services/chatService');
const prisma = require('../src/db');

// Mock the prisma client
jest.mock('../src/db', () => ({
  chatMessage: {
    count: jest.fn(),
  },
  chatReadStatus: {
    findUnique: jest.fn(),
  },
}));

describe('chatService.getUnreadCount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return unread count for messages created after lastReadAt', async () => {
    const busId = 'test-bus-id';
    const userId = 'test-user-id';
    const lastReadAt = new Date('2025-01-15T10:00:00Z');

    // Mock ChatReadStatus with lastReadAt timestamp
    prisma.chatReadStatus.findUnique.mockResolvedValue({
      id: 'read-status-1',
      busId,
      userId,
      lastReadAt,
      lastMessageId: null,
    });

    // Mock count of unread messages (3 messages after lastReadAt)
    prisma.chatMessage.count.mockResolvedValue(3);

    // Execute
    const result = await chatService.getUnreadCount(busId, userId);

    // Verify
    expect(result).toBe(3);

    // Verify ChatReadStatus query
    expect(prisma.chatReadStatus.findUnique).toHaveBeenCalledWith({
      where: {
        busId_userId: { busId, userId },
      },
    });

    // Verify message count query with correct filters
    expect(prisma.chatMessage.count).toHaveBeenCalledWith({
      where: {
        busId,
        createdAt: { gt: lastReadAt },
        senderId: { not: userId },
        deletedAt: null,
      },
    });
  });

  test('should return 0 when no unread messages exist', async () => {
    const busId = 'test-bus-id';
    const userId = 'test-user-id';
    const lastReadAt = new Date('2025-01-15T12:00:00Z');

    prisma.chatReadStatus.findUnique.mockResolvedValue({
      id: 'read-status-1',
      busId,
      userId,
      lastReadAt,
      lastMessageId: null,
    });

    prisma.chatMessage.count.mockResolvedValue(0);

    const result = await chatService.getUnreadCount(busId, userId);

    expect(result).toBe(0);
  });

  test('should exclude messages from the same user (senderId != userId)', async () => {
    const busId = 'test-bus-id';
    const userId = 'test-user-id';
    const lastReadAt = new Date('2025-01-15T10:00:00Z');

    prisma.chatReadStatus.findUnique.mockResolvedValue({
      id: 'read-status-1',
      busId,
      userId,
      lastReadAt,
      lastMessageId: null,
    });

    // User's own messages should not be counted
    prisma.chatMessage.count.mockResolvedValue(2); // Only messages from others

    const result = await chatService.getUnreadCount(busId, userId);

    expect(result).toBe(2);

    // Verify that the query excludes the user's own messages
    expect(prisma.chatMessage.count).toHaveBeenCalledWith({
      where: {
        busId,
        createdAt: { gt: lastReadAt },
        senderId: { not: userId },
        deletedAt: null,
      },
    });
  });

  test('should exclude deleted messages (deletedAt = null)', async () => {
    const busId = 'test-bus-id';
    const userId = 'test-user-id';
    const lastReadAt = new Date('2025-01-15T10:00:00Z');

    prisma.chatReadStatus.findUnique.mockResolvedValue({
      id: 'read-status-1',
      busId,
      userId,
      lastReadAt,
      lastMessageId: null,
    });

    prisma.chatMessage.count.mockResolvedValue(1);

    const result = await chatService.getUnreadCount(busId, userId);

    expect(result).toBe(1);

    // Verify that deleted messages are excluded
    expect(prisma.chatMessage.count).toHaveBeenCalledWith({
      where: {
        busId,
        createdAt: { gt: lastReadAt },
        senderId: { not: userId },
        deletedAt: null,
      },
    });
  });

  test('should use epoch date when no ChatReadStatus exists for user', async () => {
    const busId = 'test-bus-id';
    const userId = 'new-user-id';

    // No read status exists for this user
    prisma.chatReadStatus.findUnique.mockResolvedValue(null);

    // All messages should be unread (5 messages in total)
    prisma.chatMessage.count.mockResolvedValue(5);

    const result = await chatService.getUnreadCount(busId, userId);

    expect(result).toBe(5);

    // Verify query uses epoch date (new Date(0))
    expect(prisma.chatMessage.count).toHaveBeenCalledWith({
      where: {
        busId,
        createdAt: { gt: new Date(0) },
        senderId: { not: userId },
        deletedAt: null,
      },
    });
  });

  test('should handle multiple unread messages correctly', async () => {
    const busId = 'test-bus-id';
    const userId = 'test-user-id';
    const lastReadAt = new Date('2025-01-15T09:00:00Z');

    prisma.chatReadStatus.findUnique.mockResolvedValue({
      id: 'read-status-1',
      busId,
      userId,
      lastReadAt,
      lastMessageId: null,
    });

    // 10 unread messages
    prisma.chatMessage.count.mockResolvedValue(10);

    const result = await chatService.getUnreadCount(busId, userId);

    expect(result).toBe(10);
  });

  test('should only count messages for the specified bus', async () => {
    const busId = 'bus-123';
    const userId = 'test-user-id';
    const lastReadAt = new Date('2025-01-15T10:00:00Z');

    prisma.chatReadStatus.findUnique.mockResolvedValue({
      id: 'read-status-1',
      busId,
      userId,
      lastReadAt,
      lastMessageId: null,
    });

    prisma.chatMessage.count.mockResolvedValue(4);

    const result = await chatService.getUnreadCount(busId, userId);

    expect(result).toBe(4);

    // Verify query is scoped to specific busId
    expect(prisma.chatMessage.count).toHaveBeenCalledWith({
      where: {
        busId: 'bus-123',
        createdAt: { gt: lastReadAt },
        senderId: { not: userId },
        deletedAt: null,
      },
    });
  });

  test('should handle cases when user has never read any messages', async () => {
    const busId = 'test-bus-id';
    const userId = 'brand-new-user';

    // User has never read messages - findUnique returns null
    prisma.chatReadStatus.findUnique.mockResolvedValue(null);

    // All 15 messages in the bus are unread for this user
    prisma.chatMessage.count.mockResolvedValue(15);

    const result = await chatService.getUnreadCount(busId, userId);

    expect(result).toBe(15);
    expect(prisma.chatReadStatus.findUnique).toHaveBeenCalledWith({
      where: {
        busId_userId: { busId, userId },
      },
    });
  });

  test('should correctly filter with all three conditions together', async () => {
    const busId = 'test-bus-id';
    const userId = 'user-123';
    const lastReadAt = new Date('2025-01-15T11:30:00Z');

    prisma.chatReadStatus.findUnique.mockResolvedValue({
      id: 'status-1',
      busId,
      userId,
      lastReadAt,
    });

    prisma.chatMessage.count.mockResolvedValue(7);

    await chatService.getUnreadCount(busId, userId);

    // Verify all three conditions are applied:
    // 1. createdAt > lastReadAt (time filter)
    // 2. senderId != userId (exclude own messages)
    // 3. deletedAt = null (exclude deleted messages)
    expect(prisma.chatMessage.count).toHaveBeenCalledWith({
      where: {
        busId: 'test-bus-id',
        createdAt: { gt: lastReadAt },
        senderId: { not: 'user-123' },
        deletedAt: null,
      },
    });
  });
});

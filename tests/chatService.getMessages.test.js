const chatService = require('../src/services/chatService');
const prisma = require('../src/db');

// Mock the prisma client
jest.mock('../src/db', () => ({
  chatMessage: {
    findMany: jest.fn(),
    count: jest.fn(),
  },
}));

describe('chatService.getMessages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should retrieve messages with pagination and announcements', async () => {
    const busId = 'test-bus-id';
    const page = 1;
    const limit = 50;

    // Mock regular messages (in descending order from DB)
    const mockMessages = [
      {
        id: 'msg-3',
        busId,
        senderId: 'user-1',
        senderRole: 'PARENT',
        senderName: 'John (Amy\'s Parent)',
        content: 'Third message',
        type: 'MESSAGE',
        createdAt: new Date('2025-01-15T10:30:00Z'),
        editedAt: null,
        deletedAt: null,
        isPinned: false,
      },
      {
        id: 'msg-2',
        busId,
        senderId: 'user-2',
        senderRole: 'DRIVER',
        senderName: 'Driver Mike',
        content: 'Second message',
        type: 'MESSAGE',
        createdAt: new Date('2025-01-15T10:20:00Z'),
        editedAt: null,
        deletedAt: null,
        isPinned: false,
      },
      {
        id: 'msg-1',
        busId,
        senderId: 'user-3',
        senderRole: 'PARENT',
        senderName: 'Sarah (Bob\'s Parent)',
        content: 'First message',
        type: 'MESSAGE',
        createdAt: new Date('2025-01-15T10:10:00Z'),
        editedAt: null,
        deletedAt: null,
        isPinned: false,
      },
    ];

    // Mock announcements
    const mockAnnouncements = [
      {
        id: 'ann-1',
        busId,
        senderId: 'admin-1',
        senderRole: 'ADMIN',
        senderName: 'Admin',
        content: 'Important announcement',
        type: 'ANNOUNCEMENT',
        createdAt: new Date('2025-01-15T09:00:00Z'),
        editedAt: null,
        deletedAt: null,
        isPinned: true,
      },
    ];

    // Setup mocks
    prisma.chatMessage.findMany
      .mockResolvedValueOnce(mockMessages) // First call for regular messages
      .mockResolvedValueOnce(mockAnnouncements); // Second call for announcements

    prisma.chatMessage.count.mockResolvedValue(150); // Total message count

    // Execute
    const result = await chatService.getMessages({ busId, page, limit });

    // Verify
    expect(result).toBeDefined();
    expect(result.messages).toHaveLength(3);
    expect(result.announcements).toHaveLength(1);

    // Verify messages are in chronological order (oldest first)
    expect(result.messages[0].id).toBe('msg-1');
    expect(result.messages[1].id).toBe('msg-2');
    expect(result.messages[2].id).toBe('msg-3');

    // Verify pagination metadata
    expect(result.pagination).toEqual({
      page: 1,
      limit: 50,
      totalMessages: 150,
      totalPages: 3,
      hasMore: true,
    });

    // Verify correct queries were made
    expect(prisma.chatMessage.findMany).toHaveBeenCalledWith({
      where: {
        busId,
        type: 'MESSAGE',
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      skip: 0,
      take: 50,
    });

    expect(prisma.chatMessage.findMany).toHaveBeenCalledWith({
      where: {
        busId,
        type: 'ANNOUNCEMENT',
        isPinned: true,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    expect(prisma.chatMessage.count).toHaveBeenCalledWith({
      where: {
        busId,
        type: 'MESSAGE',
        deletedAt: null,
      },
    });
  });

  test('should handle pagination correctly for page 2', async () => {
    const busId = 'test-bus-id';
    const page = 2;
    const limit = 50;

    prisma.chatMessage.findMany
      .mockResolvedValueOnce([]) // Messages
      .mockResolvedValueOnce([]); // Announcements

    prisma.chatMessage.count.mockResolvedValue(100);

    const result = await chatService.getMessages({ busId, page, limit });

    // Verify skip calculation
    expect(prisma.chatMessage.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 50, // (page - 1) * limit = (2 - 1) * 50 = 50
        take: 50,
      })
    );

    // Verify pagination metadata
    expect(result.pagination).toEqual({
      page: 2,
      limit: 50,
      totalMessages: 100,
      totalPages: 2,
      hasMore: false, // page 2 of 2, no more pages
    });
  });

  test('should return empty arrays when no messages exist', async () => {
    const busId = 'empty-bus-id';
    const page = 1;
    const limit = 50;

    prisma.chatMessage.findMany
      .mockResolvedValueOnce([]) // No messages
      .mockResolvedValueOnce([]); // No announcements

    prisma.chatMessage.count.mockResolvedValue(0);

    const result = await chatService.getMessages({ busId, page, limit });

    expect(result.messages).toEqual([]);
    expect(result.announcements).toEqual([]);
    expect(result.pagination).toEqual({
      page: 1,
      limit: 50,
      totalMessages: 0,
      totalPages: 0,
      hasMore: false,
    });
  });

  test('should correctly format message data', async () => {
    const busId = 'test-bus-id';
    const mockMessage = {
      id: 'msg-1',
      busId,
      senderId: 'user-1',
      senderRole: 'PARENT',
      senderName: 'John (Amy\'s Parent)',
      content: 'Test message',
      type: 'MESSAGE',
      createdAt: new Date('2025-01-15T10:00:00Z'),
      editedAt: new Date('2025-01-15T10:05:00Z'),
      deletedAt: null,
      isPinned: false,
    };

    prisma.chatMessage.findMany
      .mockResolvedValueOnce([mockMessage])
      .mockResolvedValueOnce([]);

    prisma.chatMessage.count.mockResolvedValue(1);

    const result = await chatService.getMessages({ busId, page: 1, limit: 50 });

    expect(result.messages[0]).toEqual({
      id: 'msg-1',
      busId,
      senderId: 'user-1',
      senderRole: 'PARENT',
      senderName: 'John (Amy\'s Parent)',
      content: 'Test message',
      type: 'MESSAGE',
      createdAt: '2025-01-15T10:00:00.000Z',
      editedAt: '2025-01-15T10:05:00.000Z',
      isPinned: false,
      isDeleted: false,
    });
  });
});

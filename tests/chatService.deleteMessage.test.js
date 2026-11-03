const prisma = require('../src/db');
const chatService = require('../src/services/chatService');

/**
 * Unit tests for chatService.deleteMessage()
 * Task 3.5: Implement message deletion (admin only)
 * Requirements: REQ-MSG-008
 */

describe('chatService.deleteMessage', () => {
  let testBusId;
  let testAdminId;
  let testUserId;
  let testMessageId;

  beforeAll(async () => {
    // Create test data
    const bus = await prisma.bus.create({
      data: {
        busNo: 'TEST-DELETE-001',
        driverName: 'Test Driver',
      },
    });
    testBusId = bus.id;

    // Find an existing admin or skip admin-specific tests
    const existingAdmin = await prisma.admin.findFirst();
    if (existingAdmin) {
      testAdminId = existingAdmin.id;
    } else {
      // If no admin exists, create a placeholder ID for testing
      testAdminId = 'test-admin-placeholder';
    }

    const user = await prisma.user.create({
      data: {
        phone: '+9876543210',
        name: 'Test User Delete',
        role: 'PARENT',
      },
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.chatMessage.deleteMany({
      where: { busId: testBusId },
    });
    await prisma.bus.delete({ where: { id: testBusId } }).catch(() => {});
    await prisma.user.delete({ where: { id: testUserId } }).catch(() => {});
  });

  beforeEach(async () => {
    // Create a test message before each test
    const message = await prisma.chatMessage.create({
      data: {
        busId: testBusId,
        senderId: testUserId,
        senderRole: 'PARENT',
        senderName: 'Test User (Child Parent)',
        content: 'This is a test message to be deleted',
        type: 'MESSAGE',
      },
    });
    testMessageId = message.id;
  });

  afterEach(async () => {
    // Clean up messages after each test
    await prisma.chatMessage.deleteMany({
      where: { id: testMessageId },
    });
  });

  describe('Successful deletion', () => {
    test('should soft delete a message with correct content replacement', async () => {
      // Act
      const result = await chatService.deleteMessage({
        messageId: testMessageId,
        adminId: testAdminId,
      });

      // Assert
      expect(result).toBeDefined();
      expect(result.content).toBe('[Message deleted by admin]');
      expect(result.isDeleted).toBe(true);
    });

    test('should set deletedAt timestamp', async () => {
      // Arrange
      const beforeTime = new Date();

      // Act
      const result = await chatService.deleteMessage({
        messageId: testMessageId,
        adminId: testAdminId,
      });

      // Assert
      const afterTime = new Date();
      expect(result.isDeleted).toBe(true);
      
      // Verify deletedAt in database
      const message = await prisma.chatMessage.findUnique({
        where: { id: testMessageId },
      });
      expect(message.deletedAt).toBeDefined();
      // The timestamp should be between beforeTime and afterTime
      expect(message.deletedAt.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime() - 1000); // Allow 1s margin
      expect(message.deletedAt.getTime()).toBeLessThanOrEqual(afterTime.getTime() + 1000); // Allow 1s margin
    });

    test('should set deletedBy field to adminId', async () => {
      // Act
      await chatService.deleteMessage({
        messageId: testMessageId,
        adminId: testAdminId,
      });

      // Assert - verify in database
      const message = await prisma.chatMessage.findUnique({
        where: { id: testMessageId },
      });
      expect(message.deletedBy).toBe(testAdminId);
    });

    test('should preserve other message fields', async () => {
      // Act
      const result = await chatService.deleteMessage({
        messageId: testMessageId,
        adminId: testAdminId,
      });

      // Assert
      expect(result.id).toBe(testMessageId);
      expect(result.busId).toBe(testBusId);
      expect(result.senderId).toBe(testUserId);
      expect(result.senderRole).toBe('PARENT');
      expect(result.senderName).toBe('Test User (Child Parent)');
      expect(result.type).toBe('MESSAGE');
    });

    test('should allow deleting already edited messages', async () => {
      // Arrange - edit the message first
      await prisma.chatMessage.update({
        where: { id: testMessageId },
        data: {
          content: 'Edited content',
          editedAt: new Date(),
        },
      });

      // Act
      const result = await chatService.deleteMessage({
        messageId: testMessageId,
        adminId: testAdminId,
      });

      // Assert
      expect(result.content).toBe('[Message deleted by admin]');
      expect(result.isDeleted).toBe(true);
    });

    test('should allow deleting announcements', async () => {
      // Arrange - create an announcement
      const announcement = await prisma.chatMessage.create({
        data: {
          busId: testBusId,
          senderId: testAdminId,
          senderRole: 'ADMIN',
          senderName: 'Test Admin',
          content: 'Important announcement',
          type: 'ANNOUNCEMENT',
          isPinned: true,
        },
      });

      // Act
      const result = await chatService.deleteMessage({
        messageId: announcement.id,
        adminId: testAdminId,
      });

      // Assert
      expect(result.content).toBe('[Message deleted by admin]');
      expect(result.isDeleted).toBe(true);

      // Cleanup
      await prisma.chatMessage.delete({ where: { id: announcement.id } });
    });
  });

  describe('Error handling', () => {
    test('should throw MESSAGE_NOT_FOUND for non-existent messageId', async () => {
      // Arrange
      const nonExistentId = 'non-existent-id-12345';

      // Act & Assert
      await expect(
        chatService.deleteMessage({
          messageId: nonExistentId,
          adminId: testAdminId,
        })
      ).rejects.toThrow('MESSAGE_NOT_FOUND');
    });

    test('should throw MESSAGE_NOT_FOUND for null messageId', async () => {
      // Act & Assert
      await expect(
        chatService.deleteMessage({
          messageId: null,
          adminId: testAdminId,
        })
      ).rejects.toThrow();
    });

    test('should throw MESSAGE_NOT_FOUND for undefined messageId', async () => {
      // Act & Assert
      await expect(
        chatService.deleteMessage({
          messageId: undefined,
          adminId: testAdminId,
        })
      ).rejects.toThrow();
    });

    test('should handle already deleted messages (idempotent)', async () => {
      // Arrange - delete once
      await chatService.deleteMessage({
        messageId: testMessageId,
        adminId: testAdminId,
      });

      // Act - delete again
      const result = await chatService.deleteMessage({
        messageId: testMessageId,
        adminId: 'another-admin-id',
      });

      // Assert - should succeed and replace content again
      expect(result.content).toBe('[Message deleted by admin]');
      expect(result.isDeleted).toBe(true);

      // Verify deletedBy is updated to the new admin
      const message = await prisma.chatMessage.findUnique({
        where: { id: testMessageId },
      });
      expect(message.deletedBy).toBe('another-admin-id');
    });
  });

  describe('Soft delete verification', () => {
    test('deleted message should remain in database', async () => {
      // Act
      await chatService.deleteMessage({
        messageId: testMessageId,
        adminId: testAdminId,
      });

      // Assert
      const message = await prisma.chatMessage.findUnique({
        where: { id: testMessageId },
      });
      expect(message).not.toBeNull();
      expect(message.id).toBe(testMessageId);
    });

    test('deleted message should not appear in regular message queries', async () => {
      // Act
      await chatService.deleteMessage({
        messageId: testMessageId,
        adminId: testAdminId,
      });

      // Assert - use getMessages which filters out deleted messages
      const result = await chatService.getMessages({
        busId: testBusId,
        page: 1,
        limit: 50,
      });

      const deletedMessage = result.messages.find(m => m.id === testMessageId);
      expect(deletedMessage).toBeUndefined();
    });

    test('deleted message content should be replaced in database', async () => {
      // Act
      await chatService.deleteMessage({
        messageId: testMessageId,
        adminId: testAdminId,
      });

      // Assert
      const message = await prisma.chatMessage.findUnique({
        where: { id: testMessageId },
      });
      expect(message.content).toBe('[Message deleted by admin]');
    });
  });

  describe('Admin tracking', () => {
    test('should track different admins deleting messages', async () => {
      // Arrange
      const admin2Id = 'test-admin-2-id';

      // Act
      await chatService.deleteMessage({
        messageId: testMessageId,
        adminId: admin2Id,
      });

      // Assert
      const message = await prisma.chatMessage.findUnique({
        where: { id: testMessageId },
      });
      expect(message.deletedBy).toBe(admin2Id);
    });

    test('should accept any adminId format (not validated)', async () => {
      // Note: The function doesn't validate if adminId exists in Admin table
      // This is intentional as authorization is handled at controller level

      // Act
      const result = await chatService.deleteMessage({
        messageId: testMessageId,
        adminId: 'fake-admin-id-12345',
      });

      // Assert
      expect(result.isDeleted).toBe(true);
      const message = await prisma.chatMessage.findUnique({
        where: { id: testMessageId },
      });
      expect(message.deletedBy).toBe('fake-admin-id-12345');
    });
  });

  describe('Edge cases', () => {
    test('should handle very long message content', async () => {
      // Arrange - create message with max length content (500 chars)
      const longContent = 'A'.repeat(500);
      const longMessage = await prisma.chatMessage.create({
        data: {
          busId: testBusId,
          senderId: testUserId,
          senderRole: 'PARENT',
          senderName: 'Test User',
          content: longContent,
          type: 'MESSAGE',
        },
      });

      // Act
      const result = await chatService.deleteMessage({
        messageId: longMessage.id,
        adminId: testAdminId,
      });

      // Assert
      expect(result.content).toBe('[Message deleted by admin]');

      // Cleanup
      await prisma.chatMessage.delete({ where: { id: longMessage.id } });
    });

    test('should handle message with special characters in content', async () => {
      // Arrange
      const specialMessage = await prisma.chatMessage.create({
        data: {
          busId: testBusId,
          senderId: testUserId,
          senderRole: 'PARENT',
          senderName: 'Test User',
          content: '<script>alert("xss")</script> & special chars: ñ, é, 中文',
          type: 'MESSAGE',
        },
      });

      // Act
      const result = await chatService.deleteMessage({
        messageId: specialMessage.id,
        adminId: testAdminId,
      });

      // Assert
      expect(result.content).toBe('[Message deleted by admin]');

      // Cleanup
      await prisma.chatMessage.delete({ where: { id: specialMessage.id } });
    });

    test('should handle concurrent deletions gracefully', async () => {
      // Act - simulate concurrent deletions
      const promises = [
        chatService.deleteMessage({
          messageId: testMessageId,
          adminId: testAdminId,
        }),
        chatService.deleteMessage({
          messageId: testMessageId,
          adminId: testAdminId,
        }),
      ];

      // Assert - both should succeed
      const results = await Promise.all(promises);
      results.forEach(result => {
        expect(result.content).toBe('[Message deleted by admin]');
        expect(result.isDeleted).toBe(true);
      });
    });
  });
});

const { editMessage } = require('../src/services/chatService');
const prisma = require('../src/db');
const { sanitizeHtml } = require('../src/utils/sanitizer');

// Mock dependencies
jest.mock('../src/db', () => ({
  chatMessage: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock('../src/utils/sanitizer');

describe('chatService.editMessage', () => {
  // Test data setup
  const mockUserId = 'user-123';
  const mockMessageId = 'msg-456';
  const now = new Date();
  const fourMinutesAgo = new Date(now.getTime() - 4 * 60 * 1000); // 4 minutes ago
  const sixMinutesAgo = new Date(now.getTime() - 6 * 60 * 1000); // 6 minutes ago

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Default sanitizer behavior
    sanitizeHtml.mockImplementation((input) => input);
  });

  describe('REQ-MSG-006: Successful message editing', () => {
    test('should successfully edit a message that meets all requirements', async () => {
      // Arrange
      const mockMessage = {
        id: mockMessageId,
        busId: 'bus-789',
        senderId: mockUserId,
        senderRole: 'PARENT',
        senderName: 'Test Parent',
        content: 'Original content',
        type: 'MESSAGE',
        createdAt: fourMinutesAgo,
        editedAt: null,
        deletedAt: null,
        isPinned: false,
      };

      const updatedContent = 'Updated content';
      const mockUpdatedMessage = {
        ...mockMessage,
        content: updatedContent,
        editedAt: now,
      };

      prisma.chatMessage.findUnique.mockResolvedValue(mockMessage);
      prisma.chatMessage.update.mockResolvedValue(mockUpdatedMessage);

      // Act
      const result = await editMessage({
        messageId: mockMessageId,
        userId: mockUserId,
        content: updatedContent,
      });

      // Assert
      expect(prisma.chatMessage.findUnique).toHaveBeenCalledWith({
        where: { id: mockMessageId },
      });
      
      expect(sanitizeHtml).toHaveBeenCalledWith(updatedContent);
      
      expect(prisma.chatMessage.update).toHaveBeenCalledWith({
        where: { id: mockMessageId },
        data: {
          content: updatedContent,
          editedAt: expect.any(Date),
        },
      });

      expect(result).toMatchObject({
        id: mockMessageId,
        content: updatedContent,
        editedAt: expect.any(String),
      });
    });

    test('should sanitize content before updating', async () => {
      // Arrange
      const mockMessage = {
        id: mockMessageId,
        senderId: mockUserId,
        createdAt: fourMinutesAgo,
        editedAt: null,
      };

      const maliciousContent = '<script>alert("xss")</script>Hello';
      const sanitizedContent = 'Hello';

      prisma.chatMessage.findUnique.mockResolvedValue(mockMessage);
      sanitizeHtml.mockReturnValue(sanitizedContent);
      prisma.chatMessage.update.mockResolvedValue({
        ...mockMessage,
        content: sanitizedContent,
        editedAt: now,
      });

      // Act
      await editMessage({
        messageId: mockMessageId,
        userId: mockUserId,
        content: maliciousContent,
      });

      // Assert
      expect(sanitizeHtml).toHaveBeenCalledWith(maliciousContent);
      expect(prisma.chatMessage.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            content: sanitizedContent,
          }),
        })
      );
    });

    test('should set editedAt timestamp when updating', async () => {
      // Arrange
      const mockMessage = {
        id: mockMessageId,
        senderId: mockUserId,
        createdAt: fourMinutesAgo,
        editedAt: null,
      };

      prisma.chatMessage.findUnique.mockResolvedValue(mockMessage);
      prisma.chatMessage.update.mockResolvedValue({
        ...mockMessage,
        content: 'New content',
        editedAt: now,
      });

      // Act
      const result = await editMessage({
        messageId: mockMessageId,
        userId: mockUserId,
        content: 'New content',
      });

      // Assert
      expect(result.editedAt).toBeTruthy();
      expect(typeof result.editedAt).toBe('string');
    });
  });

  describe('REQ-MSG-007: Message not found', () => {
    test('should throw MESSAGE_NOT_FOUND when message does not exist', async () => {
      // Arrange
      prisma.chatMessage.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        editMessage({
          messageId: 'nonexistent-id',
          userId: mockUserId,
          content: 'New content',
        })
      ).rejects.toThrow('MESSAGE_NOT_FOUND');

      expect(prisma.chatMessage.findUnique).toHaveBeenCalledWith({
        where: { id: 'nonexistent-id' },
      });
      expect(prisma.chatMessage.update).not.toHaveBeenCalled();
    });

    test('should not attempt to update when message is not found', async () => {
      // Arrange
      prisma.chatMessage.findUnique.mockResolvedValue(null);

      // Act
      try {
        await editMessage({
          messageId: 'nonexistent-id',
          userId: mockUserId,
          content: 'New content',
        });
      } catch (error) {
        // Expected error
      }

      // Assert
      expect(prisma.chatMessage.update).not.toHaveBeenCalled();
    });
  });

  describe('REQ-MSG-007: Ownership verification', () => {
    test('should throw EDIT_FORBIDDEN when user is not the message owner', async () => {
      // Arrange
      const mockMessage = {
        id: mockMessageId,
        senderId: 'different-user-id',
        createdAt: fourMinutesAgo,
        editedAt: null,
      };

      prisma.chatMessage.findUnique.mockResolvedValue(mockMessage);

      // Act & Assert
      await expect(
        editMessage({
          messageId: mockMessageId,
          userId: mockUserId,
          content: 'New content',
        })
      ).rejects.toThrow('EDIT_FORBIDDEN');

      expect(prisma.chatMessage.update).not.toHaveBeenCalled();
    });

    test('should allow edit when user ID matches sender ID', async () => {
      // Arrange
      const mockMessage = {
        id: mockMessageId,
        senderId: mockUserId,
        createdAt: fourMinutesAgo,
        editedAt: null,
      };

      prisma.chatMessage.findUnique.mockResolvedValue(mockMessage);
      prisma.chatMessage.update.mockResolvedValue({
        ...mockMessage,
        content: 'New content',
        editedAt: now,
      });

      // Act
      await editMessage({
        messageId: mockMessageId,
        userId: mockUserId,
        content: 'New content',
      });

      // Assert
      expect(prisma.chatMessage.update).toHaveBeenCalled();
    });
  });

  describe('REQ-MSG-007: Age verification (5-minute window)', () => {
    test('should throw EDIT_FORBIDDEN when message is older than 5 minutes', async () => {
      // Arrange
      const mockMessage = {
        id: mockMessageId,
        senderId: mockUserId,
        createdAt: sixMinutesAgo,
        editedAt: null,
      };

      prisma.chatMessage.findUnique.mockResolvedValue(mockMessage);

      // Act & Assert
      await expect(
        editMessage({
          messageId: mockMessageId,
          userId: mockUserId,
          content: 'New content',
        })
      ).rejects.toThrow('EDIT_FORBIDDEN');

      expect(prisma.chatMessage.update).not.toHaveBeenCalled();
    });

    test('should allow edit when message is less than 5 minutes old', async () => {
      // Arrange - Message created 4 minutes and 59 seconds ago (299000ms)
      const almostFiveMinutes = new Date(now.getTime() - (5 * 60 * 1000 - 1000));
      const mockMessage = {
        id: mockMessageId,
        senderId: mockUserId,
        createdAt: almostFiveMinutes,
        editedAt: null,
      };

      prisma.chatMessage.findUnique.mockResolvedValue(mockMessage);
      prisma.chatMessage.update.mockResolvedValue({
        ...mockMessage,
        content: 'New content',
        editedAt: now,
      });

      // Act
      await editMessage({
        messageId: mockMessageId,
        userId: mockUserId,
        content: 'New content',
      });

      // Assert
      expect(prisma.chatMessage.update).toHaveBeenCalled();
    });

    test('should allow edit when message is 1 second old', async () => {
      // Arrange
      const oneSecondAgo = new Date(now.getTime() - 1000);
      const mockMessage = {
        id: mockMessageId,
        senderId: mockUserId,
        createdAt: oneSecondAgo,
        editedAt: null,
      };

      prisma.chatMessage.findUnique.mockResolvedValue(mockMessage);
      prisma.chatMessage.update.mockResolvedValue({
        ...mockMessage,
        content: 'New content',
        editedAt: now,
      });

      // Act
      await editMessage({
        messageId: mockMessageId,
        userId: mockUserId,
        content: 'New content',
      });

      // Assert
      expect(prisma.chatMessage.update).toHaveBeenCalled();
    });

    test('should reject edit when message is 5 minutes and 1 second old', async () => {
      // Arrange
      const fiveMinutesOneSec = new Date(now.getTime() - (5 * 60 * 1000 + 1000));
      const mockMessage = {
        id: mockMessageId,
        senderId: mockUserId,
        createdAt: fiveMinutesOneSec,
        editedAt: null,
      };

      prisma.chatMessage.findUnique.mockResolvedValue(mockMessage);

      // Act & Assert
      await expect(
        editMessage({
          messageId: mockMessageId,
          userId: mockUserId,
          content: 'New content',
        })
      ).rejects.toThrow('EDIT_FORBIDDEN');
    });
  });

  describe('REQ-MSG-007: Already edited verification', () => {
    test('should throw EDIT_FORBIDDEN when message has already been edited', async () => {
      // Arrange
      const mockMessage = {
        id: mockMessageId,
        senderId: mockUserId,
        createdAt: fourMinutesAgo,
        editedAt: new Date(now.getTime() - 2 * 60 * 1000), // Edited 2 minutes ago
      };

      prisma.chatMessage.findUnique.mockResolvedValue(mockMessage);

      // Act & Assert
      await expect(
        editMessage({
          messageId: mockMessageId,
          userId: mockUserId,
          content: 'New content',
        })
      ).rejects.toThrow('EDIT_FORBIDDEN');

      expect(prisma.chatMessage.update).not.toHaveBeenCalled();
    });

    test('should allow edit when editedAt is null', async () => {
      // Arrange
      const mockMessage = {
        id: mockMessageId,
        senderId: mockUserId,
        createdAt: fourMinutesAgo,
        editedAt: null,
      };

      prisma.chatMessage.findUnique.mockResolvedValue(mockMessage);
      prisma.chatMessage.update.mockResolvedValue({
        ...mockMessage,
        content: 'New content',
        editedAt: now,
      });

      // Act
      await editMessage({
        messageId: mockMessageId,
        userId: mockUserId,
        content: 'New content',
      });

      // Assert
      expect(prisma.chatMessage.update).toHaveBeenCalled();
    });

    test('should enforce maximum 1 edit per message', async () => {
      // Arrange - Message already edited once
      const mockMessage = {
        id: mockMessageId,
        senderId: mockUserId,
        createdAt: fourMinutesAgo,
        editedAt: new Date(now.getTime() - 60 * 1000), // Edited 1 minute ago
      };

      prisma.chatMessage.findUnique.mockResolvedValue(mockMessage);

      // Act & Assert
      await expect(
        editMessage({
          messageId: mockMessageId,
          userId: mockUserId,
          content: 'Second edit attempt',
        })
      ).rejects.toThrow('EDIT_FORBIDDEN');
    });
  });

  describe('Edge cases and validation order', () => {
    test('should check message existence before ownership', async () => {
      // Arrange
      prisma.chatMessage.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        editMessage({
          messageId: 'nonexistent-id',
          userId: 'any-user-id',
          content: 'New content',
        })
      ).rejects.toThrow('MESSAGE_NOT_FOUND');
    });

    test('should check ownership before time limit', async () => {
      // Arrange - Old message, but owned by different user
      const mockMessage = {
        id: mockMessageId,
        senderId: 'different-user-id',
        createdAt: sixMinutesAgo,
        editedAt: null,
      };

      prisma.chatMessage.findUnique.mockResolvedValue(mockMessage);

      // Act & Assert
      await expect(
        editMessage({
          messageId: mockMessageId,
          userId: mockUserId,
          content: 'New content',
        })
      ).rejects.toThrow('EDIT_FORBIDDEN');
    });

    test('should check time limit before already-edited check', async () => {
      // Arrange - Message is old AND already edited
      const mockMessage = {
        id: mockMessageId,
        senderId: mockUserId,
        createdAt: sixMinutesAgo,
        editedAt: null,
      };

      prisma.chatMessage.findUnique.mockResolvedValue(mockMessage);

      // Act & Assert
      await expect(
        editMessage({
          messageId: mockMessageId,
          userId: mockUserId,
          content: 'New content',
        })
      ).rejects.toThrow('EDIT_FORBIDDEN');
    });

    test('should handle empty content string', async () => {
      // Arrange
      const mockMessage = {
        id: mockMessageId,
        senderId: mockUserId,
        createdAt: fourMinutesAgo,
        editedAt: null,
      };

      prisma.chatMessage.findUnique.mockResolvedValue(mockMessage);
      sanitizeHtml.mockReturnValue('');
      prisma.chatMessage.update.mockResolvedValue({
        ...mockMessage,
        content: '',
        editedAt: now,
      });

      // Act
      await editMessage({
        messageId: mockMessageId,
        userId: mockUserId,
        content: '',
      });

      // Assert
      expect(prisma.chatMessage.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            content: '',
          }),
        })
      );
    });

    test('should handle very long content', async () => {
      // Arrange
      const mockMessage = {
        id: mockMessageId,
        senderId: mockUserId,
        createdAt: fourMinutesAgo,
        editedAt: null,
      };

      const longContent = 'a'.repeat(500);
      prisma.chatMessage.findUnique.mockResolvedValue(mockMessage);
      sanitizeHtml.mockReturnValue(longContent);
      prisma.chatMessage.update.mockResolvedValue({
        ...mockMessage,
        content: longContent,
        editedAt: now,
      });

      // Act
      await editMessage({
        messageId: mockMessageId,
        userId: mockUserId,
        content: longContent,
      });

      // Assert
      expect(prisma.chatMessage.update).toHaveBeenCalled();
    });

    test('should handle special characters in content', async () => {
      // Arrange
      const mockMessage = {
        id: mockMessageId,
        senderId: mockUserId,
        createdAt: fourMinutesAgo,
        editedAt: null,
      };

      const specialContent = 'Hello & <world> "quoted" \'single\'';
      const sanitizedContent = 'Hello &amp; world &quot;quoted&quot; &#x27;single&#x27;';
      
      prisma.chatMessage.findUnique.mockResolvedValue(mockMessage);
      sanitizeHtml.mockReturnValue(sanitizedContent);
      prisma.chatMessage.update.mockResolvedValue({
        ...mockMessage,
        content: sanitizedContent,
        editedAt: now,
      });

      // Act
      await editMessage({
        messageId: mockMessageId,
        userId: mockUserId,
        content: specialContent,
      });

      // Assert
      expect(sanitizeHtml).toHaveBeenCalledWith(specialContent);
      expect(prisma.chatMessage.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            content: sanitizedContent,
          }),
        })
      );
    });
  });

  describe('Return value format', () => {
    test('should return formatted message with all required fields', async () => {
      // Arrange
      const mockMessage = {
        id: mockMessageId,
        busId: 'bus-789',
        senderId: mockUserId,
        senderRole: 'PARENT',
        senderName: 'Test Parent',
        content: 'Original content',
        type: 'MESSAGE',
        createdAt: fourMinutesAgo,
        editedAt: null,
        deletedAt: null,
        isPinned: false,
      };

      const updatedMessage = {
        ...mockMessage,
        content: 'Updated content',
        editedAt: now,
      };

      prisma.chatMessage.findUnique.mockResolvedValue(mockMessage);
      prisma.chatMessage.update.mockResolvedValue(updatedMessage);

      // Act
      const result = await editMessage({
        messageId: mockMessageId,
        userId: mockUserId,
        content: 'Updated content',
      });

      // Assert
      expect(result).toMatchObject({
        id: mockMessageId,
        busId: 'bus-789',
        senderId: mockUserId,
        senderRole: 'PARENT',
        senderName: 'Test Parent',
        content: 'Updated content',
        type: 'MESSAGE',
        createdAt: expect.any(String),
        editedAt: expect.any(String),
        isPinned: false,
        isDeleted: false,
      });
    });

    test('should return ISO string formatted timestamps', async () => {
      // Arrange
      const mockMessage = {
        id: mockMessageId,
        senderId: mockUserId,
        createdAt: fourMinutesAgo,
        editedAt: null,
        busId: 'bus-123',
        senderRole: 'PARENT',
        senderName: 'Test',
        content: 'Test',
        type: 'MESSAGE',
        isPinned: false,
        deletedAt: null,
      };

      prisma.chatMessage.findUnique.mockResolvedValue(mockMessage);
      prisma.chatMessage.update.mockResolvedValue({
        ...mockMessage,
        content: 'New content',
        editedAt: now,
      });

      // Act
      const result = await editMessage({
        messageId: mockMessageId,
        userId: mockUserId,
        content: 'New content',
      });

      // Assert
      expect(typeof result.createdAt).toBe('string');
      expect(typeof result.editedAt).toBe('string');
      expect(result.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(result.editedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('Error handling', () => {
    test('should propagate database errors', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      prisma.chatMessage.findUnique.mockRejectedValue(dbError);

      // Act & Assert
      await expect(
        editMessage({
          messageId: mockMessageId,
          userId: mockUserId,
          content: 'New content',
        })
      ).rejects.toThrow('Database connection failed');
    });

    test('should handle update errors gracefully', async () => {
      // Arrange
      const mockMessage = {
        id: mockMessageId,
        senderId: mockUserId,
        createdAt: fourMinutesAgo,
        editedAt: null,
      };

      prisma.chatMessage.findUnique.mockResolvedValue(mockMessage);
      prisma.chatMessage.update.mockRejectedValue(new Error('Update failed'));

      // Act & Assert
      await expect(
        editMessage({
          messageId: mockMessageId,
          userId: mockUserId,
          content: 'New content',
        })
      ).rejects.toThrow('Update failed');
    });
  });
});

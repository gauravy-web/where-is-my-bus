const fc = require('fast-check');
const prisma = require('../src/db');
const chatService = require('../src/services/chatService');

/**
 * Property-based tests for chatService.deleteMessage()
 * Task 3.5: Implement message deletion (admin only)
 * Requirements: REQ-MSG-008
 * 
 * **Validates: Requirements REQ-MSG-008**
 */

describe('chatService.deleteMessage - Property-Based Tests', () => {
  let testBusId;
  let testUserId;

  beforeAll(async () => {
    // Create test data
    const bus = await prisma.bus.create({
      data: {
        busNo: 'TEST-PBT-DELETE-001',
        driverName: 'Test Driver PBT',
      },
    });
    testBusId = bus.id;

    const user = await prisma.user.create({
      data: {
        phone: '+1111111111',
        name: 'Test User PBT',
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

  /**
   * Property: Deletion is idempotent
   * Deleting a message multiple times should produce the same result
   */
  test('property: deletion is idempotent', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 500 }), // message content
        fc.string({ minLength: 5, maxLength: 50 }), // adminId
        fc.integer({ min: 1, max: 5 }), // number of deletion attempts
        async (content, adminId, deletionCount) => {
          // Arrange - create a message
          const message = await prisma.chatMessage.create({
            data: {
              busId: testBusId,
              senderId: testUserId,
              senderRole: 'PARENT',
              senderName: 'Test User',
              content: content.trim() || 'test',
              type: 'MESSAGE',
            },
          });

          try {
            // Act - delete multiple times
            const results = [];
            for (let i = 0; i < deletionCount; i++) {
              const result = await chatService.deleteMessage({
                messageId: message.id,
                adminId,
              });
              results.push(result);
            }

            // Assert - all results should be the same
            results.forEach(result => {
              expect(result.content).toBe('[Message deleted by admin]');
              expect(result.isDeleted).toBe(true);
              expect(result.id).toBe(message.id);
            });

            // Verify final state in database
            const finalMessage = await prisma.chatMessage.findUnique({
              where: { id: message.id },
            });
            expect(finalMessage.content).toBe('[Message deleted by admin]');
            expect(finalMessage.deletedAt).toBeDefined();
            expect(finalMessage.deletedBy).toBe(adminId);
          } finally {
            // Cleanup
            await prisma.chatMessage.delete({ where: { id: message.id } }).catch(() => {});
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property: Deletion preserves message identity
   * All original fields except content should remain unchanged
   */
  test('property: deletion preserves message identity', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 500 }),
        fc.constantFrom('PARENT', 'DRIVER', 'CONDUCTOR', 'ADMIN'),
        fc.constantFrom('MESSAGE', 'ANNOUNCEMENT'),
        fc.string({ minLength: 5, maxLength: 50 }),
        async (content, senderRole, messageType, adminId) => {
          // Arrange
          const message = await prisma.chatMessage.create({
            data: {
              busId: testBusId,
              senderId: testUserId,
              senderRole,
              senderName: 'Test User',
              content: content.trim() || 'test',
              type: messageType,
              isPinned: messageType === 'ANNOUNCEMENT',
            },
          });

          const originalId = message.id;
          const originalBusId = message.busId;
          const originalSenderId = message.senderId;
          const originalSenderRole = message.senderRole;
          const originalType = message.type;
          const originalCreatedAt = message.createdAt;

          try {
            // Act
            await chatService.deleteMessage({
              messageId: message.id,
              adminId,
            });

            // Assert - verify identity fields preserved
            const deletedMessage = await prisma.chatMessage.findUnique({
              where: { id: message.id },
            });

            expect(deletedMessage.id).toBe(originalId);
            expect(deletedMessage.busId).toBe(originalBusId);
            expect(deletedMessage.senderId).toBe(originalSenderId);
            expect(deletedMessage.senderRole).toBe(originalSenderRole);
            expect(deletedMessage.type).toBe(originalType);
            expect(deletedMessage.createdAt.getTime()).toBe(originalCreatedAt.getTime());
            expect(deletedMessage.content).toBe('[Message deleted by admin]');
          } finally {
            // Cleanup
            await prisma.chatMessage.delete({ where: { id: message.id } }).catch(() => {});
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property: Deleted messages have required metadata
   * deletedAt and deletedBy must always be set
   */
  test('property: deleted messages have required metadata', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 500 }),
        fc.string({ minLength: 5, maxLength: 50 }),
        async (content, adminId) => {
          // Arrange
          const message = await prisma.chatMessage.create({
            data: {
              busId: testBusId,
              senderId: testUserId,
              senderRole: 'PARENT',
              senderName: 'Test User',
              content: content.trim() || 'test',
              type: 'MESSAGE',
            },
          });

          try {
            // Act
            await chatService.deleteMessage({
              messageId: message.id,
              adminId,
            });

            // Assert
            const deletedMessage = await prisma.chatMessage.findUnique({
              where: { id: message.id },
            });

            expect(deletedMessage.deletedAt).toBeDefined();
            expect(deletedMessage.deletedAt).toBeInstanceOf(Date);
            expect(deletedMessage.deletedBy).toBe(adminId);
            expect(deletedMessage.deletedBy).not.toBeNull();
          } finally {
            // Cleanup
            await prisma.chatMessage.delete({ where: { id: message.id } }).catch(() => {});
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property: Soft delete ensures message persists
   * Message should always remain in database after deletion
   */
  test('property: soft delete ensures message persists in database', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 500 }),
        fc.string({ minLength: 5, maxLength: 50 }),
        async (content, adminId) => {
          // Arrange
          const message = await prisma.chatMessage.create({
            data: {
              busId: testBusId,
              senderId: testUserId,
              senderRole: 'PARENT',
              senderName: 'Test User',
              content: content.trim() || 'test',
              type: 'MESSAGE',
            },
          });

          const messageId = message.id;

          try {
            // Act
            await chatService.deleteMessage({
              messageId,
              adminId,
            });

            // Assert - message still exists in database
            const deletedMessage = await prisma.chatMessage.findUnique({
              where: { id: messageId },
            });

            expect(deletedMessage).not.toBeNull();
            expect(deletedMessage.id).toBe(messageId);
          } finally {
            // Cleanup
            await prisma.chatMessage.delete({ where: { id: messageId } }).catch(() => {});
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property: Content replacement is consistent
   * All deleted messages have exactly the same replacement text
   */
  test('property: content replacement is always "[Message deleted by admin]"', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 500 }),
        fc.string({ minLength: 5, maxLength: 50 }),
        async (originalContent, adminId) => {
          // Arrange
          const message = await prisma.chatMessage.create({
            data: {
              busId: testBusId,
              senderId: testUserId,
              senderRole: 'PARENT',
              senderName: 'Test User',
              content: originalContent.trim() || 'test',
              type: 'MESSAGE',
            },
          });

          try {
            // Act
            const result = await chatService.deleteMessage({
              messageId: message.id,
              adminId,
            });

            // Assert
            expect(result.content).toBe('[Message deleted by admin]');
            
            const dbMessage = await prisma.chatMessage.findUnique({
              where: { id: message.id },
            });
            expect(dbMessage.content).toBe('[Message deleted by admin]');
          } finally {
            // Cleanup
            await prisma.chatMessage.delete({ where: { id: message.id } }).catch(() => {});
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property: Last admin wins
   * When multiple admins delete the same message, the last admin's ID is stored
   */
  test('property: last admin ID is stored when multiple admins delete', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 500 }),
        fc.array(fc.string({ minLength: 5, maxLength: 50 }), { minLength: 1, maxLength: 5 }),
        async (content, adminIds) => {
          // Arrange
          const message = await prisma.chatMessage.create({
            data: {
              busId: testBusId,
              senderId: testUserId,
              senderRole: 'PARENT',
              senderName: 'Test User',
              content: content.trim() || 'test',
              type: 'MESSAGE',
            },
          });

          try {
            // Act - delete sequentially with different admin IDs
            for (const adminId of adminIds) {
              await chatService.deleteMessage({
                messageId: message.id,
                adminId,
              });
            }

            // Assert - last admin ID should be stored
            const finalMessage = await prisma.chatMessage.findUnique({
              where: { id: message.id },
            });
            
            const lastAdminId = adminIds[adminIds.length - 1];
            expect(finalMessage.deletedBy).toBe(lastAdminId);
          } finally {
            // Cleanup
            await prisma.chatMessage.delete({ where: { id: message.id } }).catch(() => {});
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property: Deletion works for all message types
   * Both MESSAGE and ANNOUNCEMENT types can be deleted
   */
  test('property: deletion works for all message types', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 500 }),
        fc.constantFrom('MESSAGE', 'ANNOUNCEMENT'),
        fc.string({ minLength: 5, maxLength: 50 }),
        async (content, messageType, adminId) => {
          // Arrange
          const message = await prisma.chatMessage.create({
            data: {
              busId: testBusId,
              senderId: testUserId,
              senderRole: 'ADMIN',
              senderName: 'Test Admin',
              content: content.trim() || 'test',
              type: messageType,
              isPinned: messageType === 'ANNOUNCEMENT',
            },
          });

          try {
            // Act
            const result = await chatService.deleteMessage({
              messageId: message.id,
              adminId,
            });

            // Assert
            expect(result.content).toBe('[Message deleted by admin]');
            expect(result.isDeleted).toBe(true);
            expect(result.type).toBe(messageType);
          } finally {
            // Cleanup
            await prisma.chatMessage.delete({ where: { id: message.id } }).catch(() => {});
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property: Deletion timestamp is monotonic
   * When deleting multiple times, deletedAt should always move forward or stay same
   */
  test('property: deletion timestamp is monotonic', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 500 }),
        fc.array(fc.string({ minLength: 5, maxLength: 50 }), { minLength: 2, maxLength: 5 }),
        async (content, adminIds) => {
          // Arrange
          const message = await prisma.chatMessage.create({
            data: {
              busId: testBusId,
              senderId: testUserId,
              senderRole: 'PARENT',
              senderName: 'Test User',
              content: content.trim() || 'test',
              type: 'MESSAGE',
            },
          });

          try {
            let lastDeletedAt = null;

            // Act - delete multiple times
            for (const adminId of adminIds) {
              await chatService.deleteMessage({
                messageId: message.id,
                adminId,
              });

              const current = await prisma.chatMessage.findUnique({
                where: { id: message.id },
                select: { deletedAt: true },
              });

              // Assert - timestamp should not go backward
              if (lastDeletedAt !== null) {
                expect(current.deletedAt.getTime()).toBeGreaterThanOrEqual(lastDeletedAt.getTime());
              }

              lastDeletedAt = current.deletedAt;
            }
          } finally {
            // Cleanup
            await prisma.chatMessage.delete({ where: { id: message.id } }).catch(() => {});
          }
        }
      ),
      { numRuns: 10 }
    );
  });
});

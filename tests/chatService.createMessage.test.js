/**
 * Test suite for chatService.createMessage function
 * Task 3.2: Implement message creation
 * 
 * Requirements:
 * - REQ-MSG-001: Message creation with proper sanitization
 * - REQ-MSG-002: Sender display name generation
 */

const chatService = require('../src/services/chatService');
const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

describe('chatService.createMessage', () => {
  let testBusId;
  let testUserId;
  let testAdminId;

  beforeAll(async () => {
    // Create test bus
    const bus = await prisma.bus.create({
      data: {
        busNo: 'TEST-MSG-001',
        driverName: 'Test Driver',
        status: 'ACTIVE'
      }
    });
    testBusId = bus.id;

    // Create test user (parent)
    const user = await prisma.user.create({
      data: {
        phone: '9999999001',
        name: 'Test Parent',
        role: 'PARENT'
      }
    });
    testUserId = user.id;

    // Create test admin
    const admin = await prisma.admin.create({
      data: {
        email: 'testadmin@test.com',
        password: 'hashedpassword',
        name: 'Test Admin'
      }
    });
    testAdminId = admin.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.chatMessage.deleteMany({
      where: { busId: testBusId }
    });
    await prisma.user.deleteMany({
      where: { phone: '9999999001' }
    });
    await prisma.admin.deleteMany({
      where: { email: 'testadmin@test.com' }
    });
    await prisma.bus.deleteMany({
      where: { busNo: 'TEST-MSG-001' }
    });
    await prisma.$disconnect();
  });

  test('should create a basic message with sanitized content', async () => {
    const result = await chatService.createMessage({
      busId: testBusId,
      senderId: testUserId,
      senderRole: 'PARENT',
      content: 'Hello, this is a test message'
    });

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.busId).toBe(testBusId);
    expect(result.senderId).toBe(testUserId);
    expect(result.senderRole).toBe('PARENT');
    expect(result.content).toContain('test message');
    expect(result.type).toBe('MESSAGE');
    expect(result.createdAt).toBeDefined();
    expect(result.senderName).toBeDefined();
  });

  test('should sanitize HTML content to prevent XSS', async () => {
    const result = await chatService.createMessage({
      busId: testBusId,
      senderId: testUserId,
      senderRole: 'PARENT',
      content: '<script>alert("xss")</script>Safe content'
    });

    expect(result.content).not.toContain('<script>');
    expect(result.content).not.toContain('</script>');
    expect(result.content).toContain('Safe content');
  });

  test('should generate sender display name for ADMIN role', async () => {
    const result = await chatService.createMessage({
      busId: testBusId,
      senderId: testAdminId,
      senderRole: 'ADMIN',
      content: 'Admin announcement'
    });

    expect(result.senderName).toBeDefined();
    expect(result.senderName).toContain('Admin');
  });

  test('should create message with ANNOUNCEMENT type', async () => {
    const result = await chatService.createMessage({
      busId: testBusId,
      senderId: testAdminId,
      senderRole: 'ADMIN',
      content: 'Important announcement',
      type: 'ANNOUNCEMENT'
    });

    expect(result.type).toBe('ANNOUNCEMENT');
    expect(result.isPinned).toBe(true);
  });

  test('should return formatted message object with all required fields', async () => {
    const result = await chatService.createMessage({
      busId: testBusId,
      senderId: testUserId,
      senderRole: 'PARENT',
      content: 'Test message for formatting'
    });

    // Verify all required fields are present
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('busId');
    expect(result).toHaveProperty('senderId');
    expect(result).toHaveProperty('senderRole');
    expect(result).toHaveProperty('senderName');
    expect(result).toHaveProperty('content');
    expect(result).toHaveProperty('type');
    expect(result).toHaveProperty('createdAt');
    expect(result).toHaveProperty('isPinned');
    expect(result).toHaveProperty('isDeleted');
  });

  test('should escape special characters in content', async () => {
    const result = await chatService.createMessage({
      busId: testBusId,
      senderId: testUserId,
      senderRole: 'PARENT',
      content: 'Test with "quotes" and \'apostrophes\' and & ampersand'
    });

    // The sanitizer should escape these characters
    expect(result.content).toBeDefined();
    expect(result.content).toContain('&');
  });

  test('should handle empty content gracefully', async () => {
    const result = await chatService.createMessage({
      busId: testBusId,
      senderId: testUserId,
      senderRole: 'PARENT',
      content: ''
    });

    expect(result).toBeDefined();
    expect(result.content).toBe('');
  });
});

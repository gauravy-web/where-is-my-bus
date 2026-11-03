/**
 * Manual test script for createAnnouncement endpoint
 * Run with: node test-announcement.js
 * 
 * Requirements tested: REQ-ANN-001, REQ-ANN-002
 */

const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

async function testCreateAnnouncement() {
  console.log('🧪 Testing createAnnouncement endpoint...\n');

  // Note: You need to replace these with valid values from your database
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'YOUR_ADMIN_JWT_TOKEN';
  const BUS_ID = process.env.TEST_BUS_ID || 'YOUR_BUS_ID';

  if (ADMIN_TOKEN === 'YOUR_ADMIN_JWT_TOKEN' || BUS_ID === 'YOUR_BUS_ID') {
    console.error('❌ Please set ADMIN_TOKEN and TEST_BUS_ID environment variables');
    console.log('\nExample:');
    console.log('  ADMIN_TOKEN=your_jwt_token TEST_BUS_ID=your_bus_id node test-announcement.js');
    process.exit(1);
  }

  const tests = [
    {
      name: 'Valid announcement creation',
      data: {
        content: 'Important: School will be closed tomorrow due to maintenance.',
      },
      expectedStatus: 201,
      shouldPass: true,
    },
    {
      name: 'Empty content (should fail)',
      data: {
        content: '',
      },
      expectedStatus: 400,
      shouldPass: false,
    },
    {
      name: 'Content too long (should fail)',
      data: {
        content: 'A'.repeat(501),
      },
      expectedStatus: 400,
      shouldPass: false,
    },
    {
      name: 'Whitespace only content (should fail)',
      data: {
        content: '   ',
      },
      expectedStatus: 400,
      shouldPass: false,
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`\n📝 Test: ${test.name}`);
      console.log(`   Content length: ${test.data.content.length} chars`);

      const response = await axios.post(
        `${BASE_URL}/api/chat/buses/${BUS_ID}/announcements`,
        test.data,
        {
          headers: {
            Authorization: `Bearer ${ADMIN_TOKEN}`,
            'Content-Type': 'application/json',
          },
          validateStatus: () => true, // Don't throw on any status
        }
      );

      console.log(`   Response status: ${response.status}`);

      if (response.status === test.expectedStatus) {
        console.log(`   ✅ Status matches expected (${test.expectedStatus})`);

        if (test.shouldPass) {
          // Verify response structure
          if (response.data.success && response.data.announcement) {
            console.log(`   ✅ Response has correct structure`);
            console.log(`   📢 Announcement ID: ${response.data.announcement.id}`);
            console.log(`   📢 Type: ${response.data.announcement.type}`);
            console.log(`   📢 Pinned: ${response.data.announcement.isPinned}`);
            passed++;
          } else {
            console.log(`   ❌ Response structure invalid`);
            console.log(`   Response:`, JSON.stringify(response.data, null, 2));
            failed++;
          }
        } else {
          // Verify error message exists
          if (response.data.message) {
            console.log(`   ✅ Error message present: ${response.data.message}`);
            passed++;
          } else {
            console.log(`   ❌ Error message missing`);
            failed++;
          }
        }
      } else {
        console.log(`   ❌ Status mismatch (expected ${test.expectedStatus}, got ${response.status})`);
        console.log(`   Response:`, JSON.stringify(response.data, null, 2));
        failed++;
      }
    } catch (error) {
      console.log(`   ❌ Request failed: ${error.message}`);
      if (error.response) {
        console.log(`   Response status: ${error.response.status}`);
        console.log(`   Response data:`, error.response.data);
      }
      failed++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`\n📊 Test Results:`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   Total: ${tests.length}`);
  console.log('');

  if (failed === 0) {
    console.log('🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed');
    process.exit(1);
  }
}

// Additional test: Verify Socket.IO broadcast (manual check)
console.log('\n📡 Socket.IO Broadcast Check:');
console.log('   The endpoint should broadcast to:');
console.log('   - bus_<busId> room with event: chat:announcement');
console.log('   - admins room with event: chat:announcement');
console.log('   Please verify this manually by monitoring Socket.IO connections');
console.log('');

// Run tests
testCreateAnnouncement().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

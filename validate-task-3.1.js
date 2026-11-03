/**
 * Validation script for Task 3.1: Update markAttendance function
 * 
 * This script validates that the implementation meets all requirements:
 * - Requirements 10.1, 10.2, 10.3: Prevent duplicate attendance records
 * - Requirements 19.1, 19.2, 19.3, 19.4: Validate trip context for attendance
 * - Requirement 14.4: Implement conductor authorization check
 */

const fs = require('fs');
const path = require('path');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

function log(message, color = RESET) {
  console.log(`${color}${message}${RESET}`);
}

function checkImplementation() {
  log('\n========================================', YELLOW);
  log('Task 3.1 Implementation Validation', YELLOW);
  log('========================================\n', YELLOW);

  const controllerPath = path.join(__dirname, 'src', 'controllers', 'attendanceController.js');
  const routesPath = path.join(__dirname, 'src', 'routes', 'attendanceRoutes.js');
  
  // Read controller file
  const controllerContent = fs.readFileSync(controllerPath, 'utf8');
  
  // Read routes file
  const routesContent = fs.readFileSync(routesPath, 'utf8');

  let passed = 0;
  let failed = 0;

  // Check 1: tripId parameter extraction
  if (controllerContent.includes('const { studentId, busId, tripId, date, tripType, boarded, conductorId }')) {
    log('✓ tripId parameter is extracted from request body', GREEN);
    passed++;
  } else {
    log('✗ tripId parameter is NOT extracted from request body', RED);
    failed++;
  }

  // Check 2: Trip validation
  if (controllerContent.includes('await prisma.trip.findUnique') && 
      controllerContent.includes('where: { id: tripId }')) {
    log('✓ Trip validation logic is implemented', GREEN);
    passed++;
  } else {
    log('✗ Trip validation logic is MISSING', RED);
    failed++;
  }

  // Check 3: Trip belongs to busId validation
  if (controllerContent.includes('trip.busId !== busId')) {
    log('✓ Trip busId validation is implemented', GREEN);
    passed++;
  } else {
    log('✗ Trip busId validation is MISSING', RED);
    failed++;
  }

  // Check 4: Trip status check
  if (controllerContent.includes('trip.status !== \'ACTIVE\'') &&
      controllerContent.includes('409')) {
    log('✓ Trip status ACTIVE check is implemented', GREEN);
    passed++;
  } else {
    log('✗ Trip status ACTIVE check is MISSING', RED);
    failed++;
  }

  // Check 5: Conductor authorization
  if (controllerContent.includes('if (conductorId && req.user') &&
      controllerContent.includes('req.user.role === \'CONDUCTOR\'')) {
    log('✓ Conductor authorization check is implemented', GREEN);
    passed++;
  } else {
    log('✗ Conductor authorization check is MISSING', RED);
    failed++;
  }

  // Check 6: Upsert logic with tripId
  if (controllerContent.includes('tripId: validatedTripId, studentId, type')) {
    log('✓ Upsert logic uses tripId in where clause', GREEN);
    passed++;
  } else {
    log('✗ Upsert logic does NOT use tripId in where clause', RED);
    failed++;
  }

  // Check 7: checkedAt timestamp
  if (controllerContent.includes('checkedAt: now') || 
      controllerContent.includes('checkedAt:')) {
    log('✓ checkedAt timestamp is set on mark', GREEN);
    passed++;
  } else {
    log('✗ checkedAt timestamp is NOT set', RED);
    failed++;
  }

  // Check 8: Socket.IO event emission
  if (controllerContent.includes('req.io.to') && 
      controllerContent.includes('attendance:updated')) {
    log('✓ Socket.IO event emission is implemented', GREEN);
    passed++;
  } else {
    log('✗ Socket.IO event emission is MISSING', RED);
    failed++;
  }

  // Check 9: Parent notification helper
  if (controllerContent.includes('notifyParents') &&
      controllerContent.includes('parentPhone2')) {
    log('✓ Parent notification helper with parentPhone2 support', GREEN);
    passed++;
  } else {
    log('✗ Parent notification helper is incomplete', RED);
    failed++;
  }

  // Check 10: CONDUCTOR role in routes
  if (routesContent.includes('CONDUCTOR')) {
    log('✓ CONDUCTOR role is added to attendance routes', GREEN);
    passed++;
  } else {
    log('✗ CONDUCTOR role is NOT added to attendance routes', RED);
    failed++;
  }

  // Check 11: Error handling for 404 (trip not found)
  if (controllerContent.includes('404') && 
      controllerContent.includes('Trip not found')) {
    log('✓ 404 error handling for trip not found', GREEN);
    passed++;
  } else {
    log('✗ 404 error handling is MISSING', RED);
    failed++;
  }

  // Check 12: Error handling for 409 (inactive trip)
  if (controllerContent.includes('409') && 
      controllerContent.includes('Invalid or inactive trip')) {
    log('✓ 409 error handling for inactive trip', GREEN);
    passed++;
  } else {
    log('✗ 409 error handling is MISSING', RED);
    failed++;
  }

  // Check 13: Error handling for 403 (conductor unauthorized)
  if (controllerContent.includes('403') && 
      controllerContent.includes('Conductor not authorized')) {
    log('✓ 403 error handling for conductor authorization', GREEN);
    passed++;
  } else {
    log('✗ 403 error handling is MISSING', RED);
    failed++;
  }

  // Check 14: Backward compatibility (works without tripId)
  if (controllerContent.includes('let validatedTripId = tripId') &&
      controllerContent.includes('if (tripId)')) {
    log('✓ Backward compatibility maintained (optional tripId)', GREEN);
    passed++;
  } else {
    log('✗ Backward compatibility NOT maintained', RED);
    failed++;
  }

  // Summary
  log('\n========================================', YELLOW);
  log(`Results: ${passed} passed, ${failed} failed`, YELLOW);
  log('========================================\n', YELLOW);

  if (failed === 0) {
    log('✓ All checks passed! Task 3.1 implementation is complete.', GREEN);
    return 0;
  } else {
    log('✗ Some checks failed. Please review the implementation.', RED);
    return 1;
  }
}

// Run validation
const exitCode = checkImplementation();
process.exit(exitCode);

/**
 * Validation script for Task 3.2: Add Socket.IO event emission
 * 
 * This script validates that the Socket.IO event emission meets all requirements:
 * - Requirements 16.1, 16.2: Emit "attendance:updated" event to bus room and admins room
 * - Verify event payload includes: tripId, studentId, type, boarded, checkedAt, conductorId
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

function checkSocketIOImplementation() {
  log('\n========================================', YELLOW);
  log('Task 3.2 Socket.IO Event Validation', YELLOW);
  log('========================================\n', YELLOW);

  const controllerPath = path.join(__dirname, 'src', 'controllers', 'attendanceController.js');
  
  if (!fs.existsSync(controllerPath)) {
    log('✗ attendanceController.js not found', RED);
    return 1;
  }

  const controllerContent = fs.readFileSync(controllerPath, 'utf8');

  let passed = 0;
  let failed = 0;

  // Check 1: Socket.IO instance check
  if (controllerContent.includes('if (req.io && validatedTripId)')) {
    log('✓ Socket.IO instance check is implemented', GREEN);
    passed++;
  } else {
    log('✗ Socket.IO instance check is MISSING', RED);
    failed++;
  }

  // Check 2: Event object creation with required fields
  const requiredFields = ['tripId', 'studentId', 'type', 'boarded', 'checkedAt', 'conductorId'];
  const eventObjectRegex = /const event = \{[\s\S]*?\}/;
  const eventMatch = controllerContent.match(eventObjectRegex);
  
  if (eventMatch) {
    const eventObject = eventMatch[0];
    let allFieldsPresent = true;
    const missingFields = [];

    requiredFields.forEach(field => {
      if (!eventObject.includes(field)) {
        allFieldsPresent = false;
        missingFields.push(field);
      }
    });

    if (allFieldsPresent) {
      log(`✓ Event payload includes all required fields: ${requiredFields.join(', ')}`, GREEN);
      passed++;
    } else {
      log(`✗ Event payload is MISSING fields: ${missingFields.join(', ')}`, RED);
      failed++;
    }
  } else {
    log('✗ Event payload object NOT found', RED);
    failed++;
  }

  // Check 3: Emit to bus room
  const busRoomRegex = /req\.io\.to\(`bus_\$\{busId\}`\)\.emit\('attendance:updated'/;
  if (busRoomRegex.test(controllerContent)) {
    log('✓ Event emission to bus room (bus_{busId}) is implemented', GREEN);
    passed++;
  } else {
    log('✗ Event emission to bus room is MISSING', RED);
    failed++;
  }

  // Check 4: Emit to admins room
  const adminsRoomRegex = /req\.io\.to\('admins'\)\.emit\('attendance:updated'/;
  if (adminsRoomRegex.test(controllerContent)) {
    log('✓ Event emission to admins room is implemented', GREEN);
    passed++;
  } else {
    log('✗ Event emission to admins room is MISSING', RED);
    failed++;
  }

  // Check 5: Event name is correct
  if (controllerContent.includes("emit('attendance:updated'")) {
    log('✓ Event name "attendance:updated" is correct', GREEN);
    passed++;
  } else {
    log('✗ Event name "attendance:updated" is MISSING or incorrect', RED);
    failed++;
  }

  // Check 6: Event emission happens after attendance is saved
  const codeOrder = controllerContent.indexOf('await prisma.attendance.create') || 
                    controllerContent.indexOf('await prisma.attendance.update');
  const emitOrder = controllerContent.indexOf('req.io.to');
  
  if (codeOrder > 0 && emitOrder > 0 && emitOrder > codeOrder) {
    log('✓ Event emission occurs AFTER attendance is saved', GREEN);
    passed++;
  } else {
    log('✗ Event emission order may be incorrect', RED);
    failed++;
  }

  // Check 7: Verify tripId is validated before emission
  const validationBeforeEmit = controllerContent.indexOf('validatedTripId');
  if (validationBeforeEmit > 0 && validationBeforeEmit < emitOrder) {
    log('✓ Trip validation occurs before event emission', GREEN);
    passed++;
  } else {
    log('✗ Trip validation before emission is unclear', RED);
    failed++;
  }

  // Check 8: Event payload uses validated tripId
  if (controllerContent.includes('tripId: validatedTripId')) {
    log('✓ Event payload uses validated tripId', GREEN);
    passed++;
  } else {
    log('✗ Event payload does NOT use validated tripId', RED);
    failed++;
  }

  // Check 9: Event payload includes attendance data
  if (eventMatch) {
    const eventObject = eventMatch[0];
    if (eventObject.includes('attendance.boarded') && 
        eventObject.includes('attendance.checkedAt') &&
        eventObject.includes('attendance.conductorId')) {
      log('✓ Event payload uses saved attendance data', GREEN);
      passed++;
    } else {
      log('✗ Event payload does NOT use saved attendance data', RED);
      failed++;
    }
  }

  // Check 10: Non-blocking parent notification (doesn't block Socket emission)
  if (controllerContent.includes('notifyParents') && 
      controllerContent.includes('.catch(e => console.log')) {
    log('✓ Parent notification is non-blocking', GREEN);
    passed++;
  } else {
    log('✗ Parent notification may be blocking', RED);
    failed++;
  }

  // Summary
  log('\n========================================', YELLOW);
  log(`Results: ${passed} passed, ${failed} failed`, YELLOW);
  log('========================================\n', YELLOW);

  if (failed === 0) {
    log('✓ All checks passed! Task 3.2 Socket.IO implementation is complete.', GREEN);
    log('\nSocket.IO Event Structure:', YELLOW);
    log('{', YELLOW);
    log('  tripId: string,', YELLOW);
    log('  studentId: string,', YELLOW);
    log('  type: "PICKUP" | "DROP",', YELLOW);
    log('  boarded: boolean,', YELLOW);
    log('  checkedAt: Date,', YELLOW);
    log('  conductorId: string | null', YELLOW);
    log('}', YELLOW);
    log('\nEmitted to:', YELLOW);
    log('  - bus_{busId} room', YELLOW);
    log('  - admins room\n', YELLOW);
    return 0;
  } else {
    log('✗ Some checks failed. Please review the implementation.', RED);
    return 1;
  }
}

// Run validation
const exitCode = checkSocketIOImplementation();
process.exit(exitCode);

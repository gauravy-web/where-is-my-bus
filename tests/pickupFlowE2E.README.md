# End-to-End Integration Test for Complete Pickup Trip Flow (Task 13.2)

## Overview

This test file (`pickupFlowE2E.test.js`) provides comprehensive end-to-end integration testing for the complete pickup trip flow with stop-wise attendance marking functionality.

## Test Coverage

### Requirements Validated

The test validates the following requirements from the stop-wise student attendance specification:

- **Requirement 1**: Display attendance section during active trip
- **Requirement 2**: Identify current stop automatically  
- **Requirement 3**: Display students for current stop
- **Requirement 4**: Mark student pickup attendance
- **Requirement 8**: Send parent notifications on pickup
- **Requirement 10**: Prevent duplicate attendance records
- **Requirement 11**: Fetch students with trip context
- **Requirement 12**: Load existing attendance status
- **Requirement 16**: Sync attendance across driver and conductor devices
- **Requirement 17**: Display attendance summary
- **Requirement 18**: Parse attendance API response
- **Requirement 19**: Validate trip context for attendance

## Test Scenarios

### 1. Complete Pickup Workflow (Main E2E Test)

**Scenario**: Full pickup workflow from start to completion

This test covers the entire journey:

1. **Driver starts PICKUP trip**
   - POST `/api/trips/start` with direction: PICKUP
   - Verifies trip created with status ACTIVE
   - Verifies 3 stops created in correct order
   - Validates Socket.IO events (`trip:state`, `tripStarted`) emitted to bus room and admins room

2. **System loads students for the trip grouped by stops**
   - GET `/api/trips/current/students`
   - Verifies students grouped by stops
   - Validates current stop identified correctly
   - Confirms attendance status is initially null

3. **Driver marks attendance at Stop 1 (Alice)**
   - POST `/api/attendance` with student and trip context
   - Verifies attendance record created successfully
   - Validates response includes complete attendance data

4. **Real-time updates propagate via Socket.IO**
   - Validates `attendance:updated` event emitted to bus room (for conductor sync)
   - Validates `attendance:updated` event emitted to admins room
   - Confirms event payload includes tripId, studentId, type, boarded, checkedAt, conductorId

5. **Attendance summary updates correctly**
   - GET `/api/trips/current/students` after marking
   - Verifies student now shows attendance: { boarded: true }
   - Confirms attendance count updated

6. **Parent notifications are sent**
   - Validates `sendMulticast` called with parent's FCM token
   - Confirms notification message includes student name
   - Verifies notification data includes tripType and boarded status

7. **Trip progresses through all stops**
   - POST `/api/trips/{tripId}/stops/{tripStopId}/complete` for Stop 1
   - Verifies current stop advances to Stop 2
   - Conductor marks attendance at Stop 2 (Bob) with conductorId
   - Validates conductorId included in Socket.IO event
   - Verifies notifications sent to multiple parent phones (parentPhone + parentPhone2)
   - Complete Stop 2, advance to Stop 3
   - Mark attendance at Stop 3 (Charlie)

8. **Trip completes successfully**
   - Complete final stop
   - Verifies currentStop becomes null
   - Validates destination shows SCHOOL
   - POST `/api/trips/{tripId}/end`
   - Confirms trip status becomes COMPLETED
   - Validates `tripEnded` event emitted

### 2. Attendance Validation and Error Handling

Tests various error scenarios:

- **Invalid trip ID**: Returns 404 with "Trip not found"
- **Inactive trip**: Returns 409 with "Invalid or inactive trip"  
- **Mismatched bus**: Returns 400 with "does not belong to specified bus"

### 3. Real-time Synchronization

Tests Socket.IO event synchronization:

- Validates events emitted to both `bus_{busId}` room (for driver/conductor sync)
- Validates events emitted to `admins` room (for admin dashboard)
- Confirms event payload structure for real-time updates

### 4. Attendance Summary and Reporting

Tests progressive attendance tracking:

- Initially 0/3 students marked
- After first mark: 1/3
- After second mark: 2/3
- After third mark: 3/3 (all students accounted for)

### 5. Parent Notifications

Tests notification delivery:

- Sends to primary parent phone (parentPhone)
- Sends to secondary parent phone (parentPhone2) when available
- Validates FCM tokens retrieved correctly
- Confirms notification content includes student name and action

### 6. Duplicate Prevention

Tests that duplicate attendance records are prevented:

- Mark attendance for student
- Attempt to mark again
- Verifies update instead of duplicate creation
- Confirms only 3 attendance records exist (one per student)

## Test Data

### Bus and Personnel
- 1 Bus: TEST-BUS-01
- 1 Driver: Test Driver (phone: 9111111111)
- 1 Conductor: Test Conductor (phone: 9222222222)

### Stops (PICKUP direction)
- Stop 1: Alice's pickup location (order: 1)
- Stop 2: Bob's pickup location (order: 2)
- Stop 3: Charlie's pickup location (order: 3)

### Students
- Alice Johnson (STU001, Class 5A) → Stop 1, Parent: 9876543210
- Bob Smith (STU002, Class 6B) → Stop 2, Parents: 9876543211, 9876543212
- Charlie Brown (STU003, Class 7C) → Stop 3, Parent: 9876543213

## Mock Infrastructure

The test uses a fake in-memory Prisma client that:

- Maintains state in `mockShared.state` object
- Supports all CRUD operations (findMany, findUnique, create, update, etc.)
- Handles complex queries (where clauses, orderBy, includes)
- Supports transactions with rollback on error
- Implements unique constraints

## Socket.IO Mocking

The test uses a fake Socket.IO instance that:

- Records all emitted events with room and payload
- Allows verification of real-time event propagation
- Validates event structure and content

## Notification Mocking

The notification service is mocked to:

- Track all `sendMulticast` calls
- Verify FCM tokens
- Validate notification content
- Test parent notification delivery

## Running the Test

```bash
# Run this specific test
npm test -- pickupFlowE2E.test.js

# Run with verbose output
npm test -- pickupFlowE2E.test.js --verbose

# Run using the test runner
node run-test.js pickupFlowE2E.test.js

# Run using jest directly
npx jest tests/pickupFlowE2E.test.js --runInBand --verbose
```

## Expected Results

All tests should pass, validating:

- ✓ Complete pickup trip workflow from start to finish
- ✓ Stop-wise attendance marking functionality
- ✓ Real-time Socket.IO synchronization
- ✓ Parent notification delivery
- ✓ Attendance summary tracking
- ✓ Duplicate prevention
- ✓ Error handling for invalid inputs

## Integration Points

This test integrates and validates:

1. **Trip Service**: Trip lifecycle management
2. **Trip Controller**: Trip start, current trip, stop progression, trip end
3. **Attendance Controller**: Mark attendance, fetch students
4. **Notification Service**: Parent FCM notifications
5. **Socket.IO**: Real-time event broadcasting
6. **Database**: Prisma ORM operations
7. **Authentication**: JWT token validation
8. **Authorization**: Role-based access (DRIVER, CONDUCTOR)

## Test Execution Flow

```
Start PICKUP Trip
       ↓
Load Students (grouped by stops)
       ↓
Mark Attendance at Stop 1 → Socket.IO Event → Parent Notification
       ↓
Complete Stop 1
       ↓
Move to Stop 2 (Conductor marks) → Socket.IO Event → Parent Notification
       ↓
Complete Stop 2
       ↓
Move to Stop 3 (Mark attendance) → Socket.IO Event → Parent Notification
       ↓
Complete Stop 3 (Destination: SCHOOL)
       ↓
End Trip (Status: COMPLETED)
```

## Notes

- This is an integration test, not a unit test
- Tests real workflow scenarios end-to-end
- Uses mocked external dependencies (Prisma, Socket.IO, Notifications)
- Validates complete user journey from driver perspective
- Ensures data consistency across the full flow
- Tests both driver and conductor roles

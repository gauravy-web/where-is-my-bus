const fs = require("fs");
const f = "d:/where is my bus/.kiro/specs/student-absence-notification/requirements.md";
let c = fs.readFileSync(f, "utf8");

console.log("Updating requirements with corrections...\n");

// 1. Fix Trip validation - remove requirement for ACTIVE trip status before submission
c = c.replace(
  /WHEN the Backend receives an absence notification request, THE Backend SHALL verify that the trip status is ACTIVE/g,
  "WHEN the Backend receives an absence notification request, THE Backend SHALL verify that a valid pickup trip exists or is scheduled for the student on the specified date"
);

c = c.replace(
  /WHEN the Backend receives an absence notification request, THE Backend SHALL verify that the specified tripId exists and has status ACTIVE/g,
  "WHEN the Backend receives an absence notification request, THE Backend SHALL verify that the specified date matches today or a future date for which a pickup trip is expected"
);

c = c.replace(
  /IF validation fails because the trip is not ACTIVE, THEN THE Backend SHALL return status code 409 with message "Trip is not active"/g,
  "IF validation fails because no valid pickup date is specified, THEN THE Backend SHALL return status code 400 with message \"Invalid date or no pickup scheduled\""
);

// 2. Fix late notification handling - clarify it's visible to parent/admin with warning
c = c.replace(
  /WHEN an Absence_Notification has status LATE, THE Backend SHALL NOT broadcast it to the driver/g,
  "WHEN an Absence_Notification has status LATE, THE Backend SHALL NOT broadcast it to the driver and SHALL mark it as informational only"
);

c = c.replace(
  /WHEN an Absence_Notification has status LATE, THE Backend SHALL return a success response with a warning message "Notification received but bus has already passed this stop"/g,
  "WHEN an Absence_Notification has status LATE, THE Backend SHALL return a success response with warning \"Notification received but bus has already passed this stop. This will be recorded but not sent to the driver.\""
);

// 3. Fix expected boarding count calculation
c = c.replace(
  /THE Backend SHALL calculate expected boarding count by subtracting absence notification count from total students assigned to that stop/g,
  "THE Backend SHALL calculate expected boarding count by identifying students actually scheduled at that particular TripStop for the active trip, then subtracting the count of students with active absence notifications"
);

// 4. Fix parent authorization to use authenticated relationship
c = c.replace(
  /WHEN the Backend receives an absence notification request, THE Backend SHALL verify that the requesting parent's phone number matches the student's parentPhone or parentPhone2/g,
  "WHEN the Backend receives an absence notification request, THE Backend SHALL use the accessService.getParentStudents method to verify that the authenticated user has a valid parent-student relationship with the specified student based on normalized phone number matching"
);

c = c.replace(
  /FOR ALL Absence_Notification creation requests, the requesting parent's phone number SHALL match either parentPhone or parentPhone2 of the referenced Student./g,
  "FOR ALL Absence_Notification creation requests, the authenticated parent user SHALL be verified through accessService.getParentStudents to have a normalized phone match with the referenced Student\\'s parentPhone or parentPhone2."
);

// 5. Add real-time reliability clarifications
c = c.replace(
  /WHEN the Backend sends a socket event for an absence notification, THE Backend SHALL not fail the HTTP request if the socket broadcast fails/g,
  "WHEN the Backend sends a socket event for an absence notification, THE Backend SHALL not fail the HTTP request if the socket broadcast fails. For drivers who are offline, the system SHALL rely on the database as source of truth and the Driver_App SHALL retrieve notifications on reconnect"
);

c = c.replace(
  /THE Socket_Server SHALL join drivers to a bus-specific room matching their assigned busId/g,
  "THE Socket_Server SHALL join connected drivers to a bus-specific room matching their assigned busId using Socket.IO. For offline drivers, push notifications via Firebase FCM MAY be sent where supported, but the Driver_App MUST retrieve active notifications from the database endpoint when reconnecting"
);

// 6. Add note about trip lifecycle
const introSection = c.indexOf("## Introduction");
const glossarySection = c.indexOf("## Glossary");
const tripNote = "\n\n**Note on Trip Lifecycle:** In this system, trips are created on-demand when drivers start them using the startTrip endpoint. There are no pre-scheduled Trip records in the database. Parents submit absence notifications for a specific date and pickup scenario, and the system validates against the student\\'s bus assignment and pickup stop. When a driver starts a trip, active absence notifications for that date and bus are retrieved and displayed.\n";
c = c.substring(0, glossarySection) + tripNote + c.substring(glossarySection);

// 7. Update glossary
c = c.replace(
  /- \*\*Trip\*\*: A scheduled bus journey with a specific direction \(PICKUP or DROP\) and sequence of stops/g,
  "- **Trip**: An on-demand bus journey created when a driver starts a trip, with a specific direction (PICKUP or DROP) and sequence of stops populated from the bus\\'s assigned Stop records"
);

// 8. Clarify that tripId may be null at submission time
c = c.replace(
  /WHEN a parent confirms the absence notification, THE Parent_App SHALL submit a request to the Backend containing studentId, busId, tripId, stopId, date, reason, and parentId/g,
  "WHEN a parent confirms the absence notification, THE Parent_App SHALL submit a request to the Backend containing studentId, busId, stopId, date, and optional reason. The tripId will be associated when the driver starts the trip for that date"
);

// 9. Update database schema requirement to reflect actual implementation
c = c.replace(
  /THE Database SHALL contain an AbsenceNotification table with columns id, studentId, parentId, busId, tripId, stopId, date, reason, status, createdAt, updatedAt, and cancelledAt/g,
  "THE Database SHALL contain an AbsenceNotification table with columns id, studentId, parentUserId, busId, tripId (nullable), stopId, date, reason (nullable), status, createdAt, updatedAt, and cancelledAt (nullable)"
);

c = c.replace(
  /THE Database SHALL enforce a unique constraint on the combination of studentId, tripId, and date in the AbsenceNotification table/g,
  "THE Database SHALL enforce a unique constraint on the combination of studentId, busId, and date in the AbsenceNotification table to prevent duplicate notifications for the same student and date"
);

fs.writeFileSync(f, c);
console.log("✅ Requirements updated with corrections");
console.log("\nKey changes made:");
console.log("  1. Trip validation: Allow submission before trip starts");
console.log("  2. Late notifications: Clarified visibility and warning");
console.log("  3. Expected boarding: Calculate from actual trip stops");
console.log("  4. Authorization: Use accessService.getParentStudents");
console.log("  5. Real-time: Socket.IO + FCM + database as source of truth");
console.log("  6. Added note about on-demand trip lifecycle");
console.log("  7. Updated database schema to match actual implementation");

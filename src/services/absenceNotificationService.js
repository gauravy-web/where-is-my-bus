// absenceNotificationService.js
// Business logic for absence notification feature
// Handles validation, status determination, and authorization checks

const { createAccessService } = require('./accessService');

/**
 * Creates an absence notification service with injected dependencies
 * @param {Object|Function} prismaOrGetter - Prisma client or getter function
 * @param {Object} accessSvc - Optional access service instance (defaults to creating one)
 */
function createAbsenceService(prismaOrGetter, accessSvc) {
  const db = () => (typeof prismaOrGetter === 'function' ? prismaOrGetter() : prismaOrGetter);
  const access = accessSvc || createAccessService(prismaOrGetter);

  /**
   * Verify parent owns student (Requirement 13.2)
   * Uses accessService.getParentStudents() which validates phone number matching
   * @param {Object} user - Authenticated user object with { id, role, phone? }
   * @param {string} studentId - Student ID to verify
   * @returns {Promise<Object|null>} Student object if parent authorized, null otherwise
   */
  async function verifyParentStudent(user, studentId) {
    if (!user || user.role !== 'PARENT') return null;
    const students = await access.getParentStudents(user);
    return students.find(s => s.id === studentId) || null;
  }

  /**
   * Comprehensive validation for absence notification requests
   * Requirements: 1.5, 1.6, 7.1, 7.2, 7.3, 7.4, 13.2
   * @param {Object} user - Authenticated user
   * @param {Object} data - Request data { studentId, busId, stopId, date }
   * @returns {Promise<Object>} { valid: boolean, status?: number, message?: string, student?: Object }
   */
  async function validateNotificationRequest(user, { studentId, busId, stopId, date }) {
    // 1. Verify parent authorization (Requirement 13.2)
    const student = await verifyParentStudent(user, studentId);
    if (!student) {
      return { 
        valid: false, 
        status: 403, 
        message: 'Forbidden' 
      };
    }

    // 2. Verify student assigned to bus (Requirement 7.3)
    if (student.busId !== busId) {
      return { 
        valid: false, 
        status: 400, 
        message: 'Student is not assigned to this bus' 
      };
    }

    // 3. Verify stopId matches pickup stop (Requirement 7.4)
    if (student.stopId !== stopId) {
      return { 
        valid: false, 
        status: 400, 
        message: "Stop does not match student's pickup stop" 
      };
    }

    // 4. Verify date is not in the past (Requirement 7.1)
    const today = new Date().toISOString().split('T')[0];
    if (date < today) {
      return { 
        valid: false, 
        status: 400, 
        message: 'Date cannot be in the past' 
      };
    }

    return { valid: true, student };
  }

  /**
   * Determine notification status based on trip and stop state
   * Requirements: 9.2, 1.5, 7.2, 7.5
   * @param {string} busId - Bus ID
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {string} stopId - Stop ID
   * @returns {Promise<Object>} { status: 'ACTIVE'|'LATE', tripId: string|null }
   */
  async function determineStatus(busId, date, stopId) {
    // Check if an ACTIVE PICKUP trip exists for this bus and date
    const trip = await db().trip.findFirst({
      where: {
        busId,
        direction: 'PICKUP',
        status: 'ACTIVE',
        startedAt: {
          gte: new Date(date),
          lt: new Date(date + 'T23:59:59')
        }
      },
      include: {
        stops: {
          where: { stopId },
          select: { id: true, status: true }
        }
      }
    });

    // No active trip found - notification is ACTIVE
    if (!trip) {
      return { status: 'ACTIVE', tripId: null };
    }

    // Trip exists - check if stop already passed (Requirement 9.2)
    const tripStop = trip.stops[0];
    if (tripStop && ['COMPLETED', 'SKIPPED'].includes(tripStop.status)) {
      // Stop already passed - notification is LATE
      return { status: 'LATE', tripId: trip.id };
    }

    // Trip active but stop not yet passed - notification is ACTIVE
    return { status: 'ACTIVE', tripId: trip.id };
  }

  /**
   * Check if notification can be cancelled based on timing constraints
   * Requirements: 3.3, 3.4, 3.7, 3.8
   * @param {string} notificationId - Notification ID to check
   * @returns {Promise<Object>} { allowed: boolean, status?: number, message?: string, notification?: Object }
   */
  async function canCancelNotification(notificationId) {
    // First, load the notification without trip details
    const notification = await db().absenceNotification.findUnique({
      where: { id: notificationId }
    });

    if (!notification) {
      return { 
        allowed: false, 
        status: 404, 
        message: 'Notification not found' 
      };
    }

    // If there's a tripId, load the trip and check its status
    if (notification.tripId) {
      const trip = await db().trip.findUnique({
        where: { id: notification.tripId },
        select: {
          status: true,
          stops: {
            where: { stopId: notification.stopId },
            select: { status: true }
          }
        }
      });

      // Check if trip has ended (Requirement 3.8)
      if (trip && trip.status !== 'ACTIVE') {
        return { 
          allowed: false, 
          status: 409, 
          message: 'Cannot edit - Trip ended' 
        };
      }

      // Check if bus already passed the stop (Requirement 3.7)
      if (trip && trip.stops.length > 0) {
        const tripStop = trip.stops[0];
        if (['COMPLETED', 'SKIPPED'].includes(tripStop.status)) {
          return { 
            allowed: false, 
            status: 409, 
            message: 'Cannot edit - Bus passed stop' 
          };
        }
      }
    }

    return { allowed: true, notification };
  }

  /**
   * Group notifications by stop for driver display
   * Requirements: 15.1, 15.2
   * @param {Array} notifications - Array of notification objects with stop info
   * @param {Array} tripStops - Array of trip stops with student counts
   * @returns {Array} Grouped notifications sorted by stop order
   */
  function groupByStop(notifications, tripStops = []) {
    const grouped = {};
    
    notifications.forEach(notification => {
      const stopId = notification.stopId;
      if (!grouped[stopId]) {
        const tripStop = tripStops.find(ts => ts.stopId === stopId);
        grouped[stopId] = {
          stopId,
          stopName: notification.stop?.name || 'Unknown Stop',
          order: notification.stop?.order || 0,
          notifications: [],
          totalAtStop: tripStop?.studentCount || 0
        };
      }
      grouped[stopId].notifications.push(notification);
    });

    // Sort by stop order (Requirement 15.1)
    return Object.values(grouped).sort((a, b) => a.order - b.order);
  }

  return {
    verifyParentStudent,
    validateNotificationRequest,
    determineStatus,
    canCancelNotification,
    groupByStop
  };
}

// Default service instance using lazy-loaded Prisma client
const defaultService = createAbsenceService(() => require('../db'));

module.exports = {
  ...defaultService,
  createAbsenceService
};

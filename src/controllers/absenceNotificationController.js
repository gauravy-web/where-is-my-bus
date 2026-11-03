// absenceNotificationController.js
// Controller for absence notification API endpoints
// Handles parent notification creation, cancellation, driver queries, and admin queries

const prisma = require('../db');
const absenceService = require('../services/absenceNotificationService');

/**
 * POST /api/absence-notifications
 * Create a new absence notification (PARENT role only)
 * Requirements: 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 1.11, 1.12, 1.13, 1.14,
 *               9.1, 9.2, 9.3, 9.4, 12.1, 12.3, 14.1, 14.2
 */
const createNotification = async (req, res) => {
  try {
    const { studentId, busId, stopId, date, reason } = req.body;

    // Validate required fields
    if (!studentId || !busId || !stopId || !date) {
      return res.status(400).json({ 
        message: 'Missing required fields: studentId, busId, stopId, date' 
      });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ 
        message: 'Invalid date format. Expected YYYY-MM-DD' 
      });
    }

    // Step 1: Comprehensive validation (Requirements 1.5, 1.6, 7.1, 7.2, 7.3, 7.4, 13.2)
    const validation = await absenceService.validateNotificationRequest(
      req.user, 
      { studentId, busId, stopId, date }
    );

    if (!validation.valid) {
      return res.status(validation.status).json({ 
        message: validation.message 
      });
    }

    // Step 2: Determine notification status (ACTIVE or LATE) (Requirements 9.2, 1.5, 7.2, 7.5)
    const { status, tripId } = await absenceService.determineStatus(busId, date, stopId);

    // Step 3: Create AbsenceNotification record with transaction (Requirement 12.1, 14.1)
    let notification;
    try {
      notification = await prisma.absenceNotification.create({
        data: {
          studentId,
          parentUserId: req.user.id,
          busId,
          tripId,
          stopId,
          date,
          reason: reason || null,
          status
        },
        include: {
          student: {
            select: { name: true }
          }
        }
      });
    } catch (error) {
      // Handle unique constraint violation (Requirement 12.3)
      if (error.code === 'P2002') {
        return res.status(409).json({ 
          message: 'An absence notification already exists for this student and date' 
        });
      }
      throw error;
    }

    // Step 4: Broadcast Socket.IO event only for ACTIVE notifications (Requirements 6.1, 9.3, 14.2)
    if (status === 'ACTIVE' && req.io) {
      try {
        const eventPayload = {
          id: notification.id,
          studentId: notification.studentId,
          studentName: notification.student?.name || 'Unknown Student',
          busId: notification.busId,
          tripId: notification.tripId,
          stopId: notification.stopId,
          date: notification.date,
          reason: notification.reason,
          createdAt: notification.createdAt.toISOString()
        };
        
        // Broadcast to bus-specific room (Requirement 6.7)
        req.io.to(`bus_${busId}`).emit('absence:created', eventPayload);
      } catch (socketError) {
        // Log but don't fail the request (Requirement 14.2)
        console.error('[absenceNotificationController] Socket broadcast failed:', socketError.message);
      }
    }

    // Step 5: Return appropriate response (Requirements 1.11, 9.4)
    const response = { 
      success: true,
      notification: {
        id: notification.id,
        studentId: notification.studentId,
        studentName: notification.student?.name || 'Unknown Student',
        busId: notification.busId,
        tripId: notification.tripId,
        stopId: notification.stopId,
        date: notification.date,
        reason: notification.reason,
        status: notification.status,
        createdAt: notification.createdAt.toISOString()
      }
    };

    // Add warning message for LATE notifications (Requirement 9.4)
    if (status === 'LATE') {
      response.warning = 'Notification received but bus has already passed this stop. This will be recorded but not sent to the driver.';
    }

    return res.status(201).json(response);

  } catch (error) {
    console.error('[absenceNotificationController] createNotification error:', error);
    return res.status(500).json({ 
      message: 'Failed to create absence notification' 
    });
  }
};

/**
 * DELETE /api/absence-notifications/:id
 * Cancel an absence notification (PARENT role only)
 * Requirements: 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 12.2, 13.3, 14.1
 */
const cancelNotification = async (req, res) => {
  try {
    const { id } = req.params;

    // Step 1: Load notification (Requirement 3.2)
    const notification = await prisma.absenceNotification.findUnique({
      where: { id },
      select: { 
        id: true, 
        parentUserId: true, 
        busId: true, 
        studentId: true, 
        tripId: true,
        stopId: true,
        status: true
      }
    });

    if (!notification) {
      return res.status(404).json({ 
        message: 'Notification not found' 
      });
    }

    // Step 2: Verify ownership (Requirement 13.3)
    if (notification.parentUserId !== req.user.id) {
      return res.status(403).json({ 
        message: 'Forbidden' 
      });
    }

    // Step 3: Check if already cancelled
    if (notification.status === 'CANCELLED') {
      return res.status(400).json({ 
        message: 'Notification is already cancelled' 
      });
    }

    // Step 4: Check timing constraints using service (Requirements 3.3, 3.4, 3.7, 3.8)
    const check = await absenceService.canCancelNotification(id);
    if (!check.allowed) {
      return res.status(check.status).json({ 
        message: check.message 
      });
    }

    // Step 5: Update notification status to CANCELLED with transaction (Requirements 3.5, 12.2, 14.1)
    const updated = await prisma.absenceNotification.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date()
      },
      include: {
        student: {
          select: { name: true }
        }
      }
    });

    // Step 6: Broadcast Socket.IO cancellation event (Requirement 3.6)
    if (req.io) {
      try {
        const eventPayload = {
          id: updated.id,
          studentId: updated.studentId,
          studentName: updated.student?.name || 'Unknown Student',
          busId: updated.busId,
          tripId: updated.tripId,
          stopId: updated.stopId,
          cancelledAt: updated.cancelledAt.toISOString()
        };
        
        // Broadcast to bus-specific room
        req.io.to(`bus_${notification.busId}`).emit('absence:cancelled', eventPayload);
      } catch (socketError) {
        // Log but don't fail the request
        console.error('[absenceNotificationController] Socket broadcast failed:', socketError.message);
      }
    }

    // Step 7: Return success response (Requirement 3.9)
    return res.status(200).json({ 
      success: true,
      notification: {
        id: updated.id,
        studentId: updated.studentId,
        studentName: updated.student?.name || 'Unknown Student',
        busId: updated.busId,
        tripId: updated.tripId,
        stopId: updated.stopId,
        status: updated.status,
        cancelledAt: updated.cancelledAt.toISOString()
      }
    });

  } catch (error) {
    console.error('[absenceNotificationController] cancelNotification error:', error);
    return res.status(500).json({ 
      message: 'Failed to cancel absence notification' 
    });
  }
};

/**
 * GET /api/absence-notifications/trip/:tripId
 * Get active absence notifications for a trip (DRIVER role only)
 * Requirements: 5.2, 5.3, 5.4, 5.6, 6.5, 13.4, 13.5, 14.4
 */
const getTripNotifications = async (req, res) => {
  try {
    const { tripId } = req.params;

    // Step 1: Load trip to get busId and date (Requirement 5.2)
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: { 
        busId: true, 
        status: true, 
        startedAt: true 
      }
    });

    if (!trip) {
      return res.status(404).json({ 
        message: 'Trip not found' 
      });
    }

    // Step 2: Verify driver authorization for the trip's bus (Requirements 13.4, 13.5)
    const accessService = require('../services/accessService');
    const driver = await accessService.getDriverForUser(req.user);
    
    if (!driver || driver.busId !== trip.busId) {
      return res.status(403).json({ 
        message: 'Forbidden' 
      });
    }

    // Step 3: Query active notifications for the trip's bus and date (Requirements 5.3, 6.5, 14.4)
    const date = trip.startedAt.toISOString().split('T')[0];
    const notifications = await prisma.absenceNotification.findMany({
      where: {
        busId: trip.busId,
        date,
        status: 'ACTIVE'
      },
      include: {
        student: { 
          select: { 
            name: true, 
            admissionNo: true 
          } 
        }
      }
    });

    // Step 4: Enrich with stop details using Stop model (Requirement 5.4)
    // We need to fetch stop information separately and join it
    const enrichedNotifications = await Promise.all(
      notifications.map(async (notification) => {
        const stop = await prisma.stop.findUnique({
          where: { id: notification.stopId },
          select: { 
            name: true, 
            order: true 
          }
        });

        return {
          id: notification.id,
          studentId: notification.studentId,
          studentName: notification.student.name,
          studentAdmissionNo: notification.student.admissionNo,
          stopId: notification.stopId,
          stopName: stop?.name || 'Unknown Stop',
          stopOrder: stop?.order || 999,
          reason: notification.reason,
          createdAt: notification.createdAt.toISOString()
        };
      })
    );

    // Step 5: Sort by stop order ascending, then student name ascending (Requirements 5.4, 5.6)
    enrichedNotifications.sort((a, b) => {
      if (a.stopOrder !== b.stopOrder) {
        return a.stopOrder - b.stopOrder;
      }
      return a.studentName.localeCompare(b.studentName);
    });

    return res.status(200).json({ 
      notifications: enrichedNotifications 
    });

  } catch (error) {
    console.error('[absenceNotificationController] getTripNotifications error:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch trip notifications' 
    });
  }
};

/**
 * GET /api/absence-notifications
 * Get absence notifications with filtering and summary statistics (ADMIN role only)
 * Requirements: 10.2, 10.3, 10.4, 10.5, 10.6, 13.7
 */
const getAdminNotifications = async (req, res) => {
  try {
    const { date, busId, studentId, status } = req.query;

    // Build filter object (Requirements 10.2, 10.3)
    const where = {};
    if (date) where.date = date;
    if (busId) where.busId = busId;
    if (studentId) where.studentId = studentId;
    if (status) where.status = status;

    // Query notifications with full details (Requirements 10.4, 10.5)
    const notifications = await prisma.absenceNotification.findMany({
      where,
      include: {
        student: {
          select: {
            name: true,
            admissionNo: true,
            parentPhone: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate summary statistics (Requirement 10.6)
    const summary = {
      total: notifications.length,
      active: notifications.filter(n => n.status === 'ACTIVE').length,
      cancelled: notifications.filter(n => n.status === 'CANCELLED').length,
      late: notifications.filter(n => n.status === 'LATE').length
    };

    // Format response with complete details (Requirement 10.4)
    const formattedNotifications = notifications.map(n => ({
      id: n.id,
      studentId: n.studentId,
      studentName: n.student.name,
      studentAdmissionNo: n.student.admissionNo,
      parentPhone: n.student.parentPhone,
      busId: n.busId,
      stopId: n.stopId,
      stopName: n.stop.name,
      date: n.date,
      reason: n.reason,
      status: n.status,
      createdAt: n.createdAt.toISOString(),
      cancelledAt: n.cancelledAt ? n.cancelledAt.toISOString() : null
    }));

    return res.status(200).json({
      notifications: formattedNotifications,
      summary
    });

  } catch (error) {
    console.error('[absenceNotificationController] getAdminNotifications error:', error);
    return res.status(500).json({
      message: 'Failed to fetch absence notifications'
    });
  }
};

module.exports = {
  createNotification,
  cancelNotification,
  getTripNotifications,
  getAdminNotifications,
  getParentNotifications: async (req, res) => {
    try {
      const { date } = req.query;
      const parentUserId = req.user.id;

      // Build filter for parent's notifications
      const where = {
        parentUserId
      };
      if (date) where.date = date;

      // Query notifications for this parent
      const notifications = await prisma.absenceNotification.findMany({
        where,
        include: {
          student: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Format response
      const formattedNotifications = notifications.map(n => ({
        id: n.id,
        studentId: n.studentId,
        studentName: n.student.name,
        busId: n.busId,
        tripId: n.tripId,
        stopId: n.stopId,
        stopName: null,  // Stop relation not in schema
        date: n.date,
        reason: n.reason,
        status: n.status,
        createdAt: n.createdAt.toISOString(),
        cancelledAt: n.cancelledAt ? n.cancelledAt.toISOString() : null
      }));

      return res.status(200).json({
        notifications: formattedNotifications
      });

    } catch (error) {
      console.error('[absenceNotificationController] getParentNotifications error:', error);
      return res.status(500).json({
        message: 'Failed to fetch absence notifications'
      });
    }
  }
};

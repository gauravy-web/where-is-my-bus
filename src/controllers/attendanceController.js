const prisma = require('../db');
const { sendNotification, sendMulticast } = require('../services/notificationService');

// Mark attendance — fixed upsert with real-time Parent notification
const markAttendance = async (req, res) => {
  try {
    const { studentId, busId, tripId, date, tripType, boarded, conductorId } = req.body;
    if (!studentId || !busId || !date)
      return res.status(400).json({ message: 'studentId, busId, date required' });

    const type = tripType || 'PICKUP';

    // Validate trip if tripId provided (Requirements 19.1, 19.2, 19.3, 19.4)
    let validatedTripId = tripId;
    if (tripId) {
      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        select: { id: true, busId: true, status: true }
      });

      if (!trip) {
        return res.status(404).json({ message: 'Trip not found' });
      }

      if (trip.busId !== busId) {
        return res.status(400).json({ message: 'Trip does not belong to specified bus' });
      }

      if (trip.status !== 'ACTIVE') {
        return res.status(409).json({ message: 'Invalid or inactive trip' });
      }

      validatedTripId = trip.id;
    }

    // Validate conductor access if conductorId provided (Requirement 14.4)
    if (conductorId && req.user && req.user.role === 'CONDUCTOR') {
      const conductor = await prisma.conductor.findFirst({
        where: {
          id: conductorId,
          phone: req.user.phone
        }
      });

      if (!conductor || conductor.busId !== busId) {
        return res.status(403).json({ message: 'Conductor not authorized for this bus' });
      }
    }

    // Upsert attendance with unique constraint on tripId + studentId + type (Requirements 10.1, 10.2, 10.3)
    const whereClause = validatedTripId 
      ? { tripId: validatedTripId, studentId, type }
      : { busId, studentId, date, tripType: type };

    const existing = await prisma.attendance.findFirst({ where: whereClause });

    let attendance;
    const now = new Date();
    
    if (existing) {
      attendance = await prisma.attendance.update({
        where: { id: existing.id },
        data: { 
          boarded: boarded ?? false,
          checkedAt: now,
          conductorId: conductorId || existing.conductorId
        },
      });
    } else {
      attendance = await prisma.attendance.create({
        data: { 
          studentId, 
          busId, 
          date, 
          tripType: type,
          type,
          tripId: validatedTripId,
          boarded: boarded ?? false,
          checkedAt: now,
          conductorId
        },
      });
    }

    // Emit Socket.IO event to bus room and admins (handled by socket middleware)
    if (req.io && validatedTripId) {
      const event = {
        tripId: validatedTripId,
        studentId,
        type,
        boarded: attendance.boarded,
        checkedAt: attendance.checkedAt,
        conductorId: attendance.conductorId
      };
      req.io.to(`bus_${busId}`).emit('attendance:updated', event);
      req.io.to('admins').emit('attendance:updated', event);
    }

    // Send push notification to Parent (non-blocking)
    notifyParents(studentId, type, boarded, attendance.createdAt)
      .catch(e => console.log('Parent notification error:', e.message));

    res.json({ success: true, attendance });
  } catch (err) {
    console.error('[attendanceController] markAttendance error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Helper to notify parents (Requirements 8.1-8.5, 9.1-9.5)
const notifyParents = async (studentId, tripType, boarded, timestamp) => {
  // Requirement 8.1, 9.1: Retrieve student with parentPhone
  const student = await prisma.student.findUnique({ 
    where: { id: studentId },
    select: { name: true, parentPhone: true, parentPhone2: true }
  });

  if (!student) return;

  // Requirement 8.5, 9.5: Handle both parentPhone and parentPhone2
  const phones = [student.parentPhone, student.parentPhone2].filter(Boolean);
  const tokens = [];

  // Requirement 8.2, 9.2: Find users with matching phone and valid fcmToken
  for (const phone of phones) {
    const user = await prisma.user.findFirst({
      where: { phone, fcmToken: { not: null } },
      select: { fcmToken: true }
    });
    if (user?.fcmToken) tokens.push(user.fcmToken);
  }

  if (tokens.length === 0) return;

  // Message formatting differs for PICKUP vs DROP scenarios
  const action = tripType === 'PICKUP' ? 'Picked Up' : 'Dropped Off';
  const statusEmoji = boarded ? (tripType === 'PICKUP' ? '🚌' : '🏠') : '❌';
  const statusText = boarded ? action : `Not ${action}`;
  
  // Requirement 8.3, 9.3: Format notification with appropriate title and body
  const title = tripType === 'PICKUP' ? 'Student Picked Up' : 'Student Dropped Off';
  const body = `${statusEmoji} ${student.name} was ${statusText.toLowerCase()} at ${timestamp.toLocaleTimeString()}`;

  // Requirement 8.4, 9.4: Send notification within 5 seconds (using multicast for efficiency)
  await sendMulticast(tokens, title, body, { 
    studentId, 
    tripType, 
    boarded: String(boarded) 
  });
};

// GET attendance by bus + date (enhanced for Date-Wise History)
const getAttendance = async (req, res) => {
  try {
    const { busId, date } = req.query;

    if (!busId) {
      return res.status(400).json({ error: 'busId is required' });
    }

    // If date is provided, return detailed attendance with trips/routes
    if (date) {
      const attendance = await prisma.attendance.findMany({
        where: {
          busId,
          date,
        },
        include: {
          student: true,
          trip: {
            include: {
              stops: {
                orderBy: { order: 'asc' },
              },
            },
          },
        },
      });

      // Calculate summary
      const total = attendance.length;
      const present = attendance.filter(a => a.boarded === true).length;
      const absent = attendance.filter(a => a.boarded === false).length;
      const notMarked = total - present - absent;

      // Group by trip type (pickup/drop)
      const pickupTrip = attendance.find(a => a.tripType === 'PICKUP')?.trip || null;
      const dropTrip = attendance.find(a => a.tripType === 'DROP')?.trip || null;

      const dayTrips = {
        pickup: pickupTrip ? {
          id: pickupTrip.id,
          direction: pickupTrip.direction,
          startedAt: pickupTrip.startedAt,
          endedAt: pickupTrip.endedAt,
          stops: pickupTrip.stops || [],
        } : null,
        drop: dropTrip ? {
          id: dropTrip.id,
          direction: dropTrip.direction,
          startedAt: dropTrip.startedAt,
          endedAt: dropTrip.endedAt,
          stops: dropTrip.stops || [],
        } : null,
      };

      return res.json({
        success: true,
        summary: { total, present, absent, notMarked },
        dayTrips,
        attendance,
      });
    }

    // Default: return today's or filtered attendance
    const attendance = await prisma.attendance.findMany({
      where: {
        busId,
        date: date || new Date().toISOString().split('T')[0],
      },
    });
    res.json({ success: true, attendance });
  } catch (err) {
    console.error('[attendanceController] getAttendance error:', err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { markAttendance, getAttendance };
const prisma = require('../db');
const { sendNotification, sendMulticast } = require('../services/notificationService');

// Mark attendance — fixed upsert with real-time Parent notification
const markAttendance = async (req, res) => {
  try {
    const { studentId, busId, tripId, date, tripType, boarded, conductorId, absenceReason } = req.body;
    if (!studentId || !busId || !date)
      return res.status(400).json({ message: 'studentId, busId, date required' });

    // Validate absenceReason if provided
    const validReasons = ['Sick', 'Own Transport', 'Leave', 'Not Traveling Today', 'Other'];
    if (absenceReason && !validReasons.includes(absenceReason)) {
      return res.status(400).json({ message: 'Invalid absence reason' });
    }

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
          conductorId: conductorId || existing.conductorId,
          absenceReason: absenceReason || null
        },
      });
    } else {
      try {
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
            conductorId,
            absenceReason: absenceReason || null
          },
        });
      } catch (createErr) {
        if (createErr.code === 'P2002') {
          const raceExisting = await prisma.attendance.findFirst({ where: whereClause });
          if (raceExisting) {
            attendance = await prisma.attendance.update({
              where: { id: raceExisting.id },
              data: { 
                boarded: boarded ?? false,
                checkedAt: now,
                conductorId: conductorId || raceExisting.conductorId,
                absenceReason: absenceReason || null
              },
            });
          } else {
            throw createErr;
          }
        } else {
          throw createErr;
        }
      }
    }

    // Emit Socket.IO event to bus room and admins (handled by socket middleware)
    if (req.io && validatedTripId) {
      const event = {
        tripId: validatedTripId,
        studentId,
        type,
        boarded: attendance.boarded,
        checkedAt: attendance.checkedAt,
        conductorId: attendance.conductorId ?? null,
        absenceReason: attendance.absenceReason ?? null
      };
      req.io.to(`bus_${busId}`).emit('attendance:updated', event);
      req.io.to('admins').emit('attendance:updated', event);
    }

    // Send push notification to Parent (errors caught so response is not blocked)
    await notifyParents(studentId, type, boarded, attendance.createdAt || now, absenceReason)
      .catch(e => console.log('Parent notification error:', e.message));

    res.json({ success: true, attendance });
  } catch (err) {
    console.error('[attendanceController] markAttendance error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Helper to notify parents (Requirements 8.1-8.5, 9.1-9.5)
const notifyParents = async (studentId, tripType, boarded, timestamp, absenceReason) => {
  // Requirement 8.1, 9.1: Retrieve student with parentPhone
  const student = await prisma.student.findUnique({ 
    where: { id: studentId },
    select: { name: true, parentPhone: true, parentPhone2: true }
  });

  if (!student) return;

  // Requirement 8.5, 9.5: Handle both parentPhone and parentPhone2
  const phones = [student.parentPhone, student.parentPhone2].filter(Boolean);
  if (phones.length === 0) return;

  // Requirement 8.2, 9.2: Find users with matching phone and valid fcmToken
  const parentUsers = await Promise.all(
    phones.map(phone =>
      prisma.user.findFirst({
        where: { phone, fcmToken: { not: null } },
        select: { fcmToken: true }
      })
    )
  );
  const tokens = parentUsers.map(u => u?.fcmToken).filter(Boolean);

  if (tokens.length === 0) return;

  // Message formatting differs for PICKUP vs DROP scenarios and absence
  const action = tripType === 'PICKUP' ? 'Picked Up' : 'Dropped Off';
  const statusEmoji = boarded ? (tripType === 'PICKUP' ? '🚌' : '🏠') : (absenceReason ? '🚫' : '❌');
  const statusText = boarded ? action : `Not ${action}`;
  const reasonText = (!boarded && absenceReason) ? ` (Reason: ${absenceReason})` : '';

  // Requirement 8.3, 9.3: Format notification with appropriate title and body
  const title = (!boarded && absenceReason)
    ? 'Student Marked Absent'
    : (tripType === 'PICKUP' ? 'Student Picked Up' : 'Student Dropped Off');
  const body = `${statusEmoji} ${student.name} was ${statusText.toLowerCase()}${reasonText} at ${timestamp.toLocaleTimeString()}`;

  // Requirement 8.4, 9.4: Send notification within 5 seconds (using multicast for efficiency)
  await sendMulticast(tokens, title, body, { 
    studentId, 
    tripType, 
    boarded: String(boarded),
    ...(absenceReason ? { absenceReason } : {})
  });
};

// GET attendance by bus + date (enhanced for Date-Wise History)
const getAttendance = async (req, res) => {
  try {
    const { busId, date } = req.query;

    if (!busId) {
      const attendance = await prisma.attendance.findMany({
        where: {
          date: date || new Date().toISOString().split('T')[0],
        },
      });
      return res.json({ success: true, attendance });
    }

    // If date is provided, return detailed attendance with trips/routes
    if (date) {
      const attendanceRecords = await prisma.attendance.findMany({
        where: {
          busId,
          date,
        },
      });

      const [busStudents, busTrips] = await Promise.all([
        typeof prisma.student?.findMany === 'function'
          ? prisma.student.findMany({ where: { busId } })
          : Promise.resolve([]),
        typeof prisma.trip?.findMany === 'function'
          ? prisma.trip.findMany({
              where: { busId },
              include: { stops: { orderBy: { order: 'asc' } } },
              orderBy: { startTime: 'desc' },
            })
          : Promise.resolve([]),
      ]);

      const studentMap = new Map(
        (Array.isArray(busStudents) ? busStudents : []).map(s => [s.id, s])
      );
      const tripMap = new Map(
        (Array.isArray(busTrips) ? busTrips : []).map(t => [t.id, t])
      );

      // Filter trips that occurred on the requested YYYY-MM-DD date or were referenced by attendance
      const dayTripsList = (Array.isArray(busTrips) ? busTrips : []).filter(t => {
        if (!t.startTime) return false;
        const tDate = new Date(t.startTime).toISOString().split('T')[0];
        return tDate === date;
      });

      const attendance = (Array.isArray(attendanceRecords) ? attendanceRecords : []).map(a => ({
        ...a,
        student: a.student || studentMap.get(a.studentId) || null,
        trip: a.trip || (a.tripId ? tripMap.get(a.tripId) : null) || null,
      }));

      // Calculate summary
      const totalStudentsOnBus = Array.isArray(busStudents) && busStudents.length > 0
        ? busStudents.length
        : attendance.length;
      const present = attendance.filter(a => a.boarded === true).length;
      const absent = attendance.filter(a => a.boarded === false).length;
      const markedStudentIds = new Set(attendance.map(a => a.studentId));
      const notMarked = Math.max(0, totalStudentsOnBus - markedStudentIds.size);
      const total = Math.max(totalStudentsOnBus, attendance.length);

      // Group by trip type (pickup/drop)
      const pickupTrip =
        attendance.find(a => a.tripType === 'PICKUP' && a.trip)?.trip ||
        dayTripsList.find(t => t.direction === 'PICKUP') ||
        null;
      const dropTrip =
        attendance.find(a => a.tripType === 'DROP' && a.trip)?.trip ||
        dayTripsList.find(t => t.direction === 'DROP') ||
        null;

      const dayTrips = {
        pickup: pickupTrip ? {
          id: pickupTrip.id,
          direction: pickupTrip.direction,
          startTime: pickupTrip.startTime || pickupTrip.startedAt || null,
          endTime: pickupTrip.endTime || pickupTrip.endedAt || null,
          startedAt: pickupTrip.startedAt || pickupTrip.startTime || null,
          endedAt: pickupTrip.endedAt || pickupTrip.endTime || null,
          stops: pickupTrip.stops || [],
        } : null,
        drop: dropTrip ? {
          id: dropTrip.id,
          direction: dropTrip.direction,
          startTime: dropTrip.startTime || dropTrip.startedAt || null,
          endTime: dropTrip.endTime || dropTrip.endedAt || null,
          startedAt: dropTrip.startedAt || dropTrip.startTime || null,
          endedAt: dropTrip.endedAt || dropTrip.endTime || null,
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

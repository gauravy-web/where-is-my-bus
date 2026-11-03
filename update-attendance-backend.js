const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'controllers', 'attendanceController.js');
let content = fs.readFileSync(filePath, 'utf8');

console.log('Updating attendanceController.js for Date-Wise Attendance History...');

// Find the getAttendance function (it uses const, not exports directly)
const getAttendanceStart = content.indexOf('// GET attendance by bus + date');
const getAttendanceFunctionStart = content.indexOf('const getAttendance = async (req, res) => {', getAttendanceStart);

if (getAttendanceFunctionStart === -1) {
  console.log('✗ Could not find getAttendance function');
  process.exit(1);
}

console.log('✓ Found getAttendance function');

// Find the end of the function (looking for the closing bracket before module.exports)
const moduleExportsIndex = content.indexOf('module.exports = {', getAttendanceFunctionStart);
const functionEnd = content.lastIndexOf('};', moduleExportsIndex);

// The new enhanced getAttendance function
const newGetAttendance = `// GET attendance by bus + date (enhanced for Date-Wise History)
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
};`;

// Replace the function
content =
  content.substring(0, getAttendanceStart) +
  newGetAttendance +
  '\n\n' +
  content.substring(moduleExportsIndex);

// Backup
const backupPath = filePath + '.backup-attendance';
fs.writeFileSync(backupPath, fs.readFileSync(filePath, 'utf8'), 'utf8');
console.log('✓ Backup created: attendanceController.js.backup-attendance');

// Write updated file
fs.writeFileSync(filePath, content, 'utf8');
console.log('✓ Updated: attendanceController.js');
console.log('✓ Enhanced getAttendance to return summary and dayTrips with route data');
console.log('\nChanges made:');
console.log('  - Added date parameter support with detailed response');
console.log('  - Return summary (total/present/absent/notMarked)');
console.log('  - Return dayTrips (pickup/drop) with TripStop data');
console.log('  - Include trip stops ordered by sequence for route display');
console.log('\nRestart your backend server to apply changes!');

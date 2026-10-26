// Builds the Express application (middleware + routes) without starting an
// HTTP server, Socket.IO or a database connection, so tests can require it.
// server.js attaches the Socket.IO instance with `app.set('io', io)`; it is
// exposed to handlers as `req.io` (undefined when no Socket.IO is attached).
const express = require('express');
const cors = require('cors');

const prisma = require('./db');
const { Prisma } = require('./generated/prisma');
const { getConfig } = require('./config/env');

const app = express();

// Public, credential-free build marker. It lets a mobile client or browser
// prove which backend is handling a request without exposing database details.
const runtimeInfo = Object.freeze({
  service: 'where-is-my-bus',
  prismaClient: 'standard-engine',
  prismaVersion: Prisma.prismaVersion.client,
  build: process.env.RENDER_GIT_COMMIT
    ? String(process.env.RENDER_GIT_COMMIT).slice(0, 12)
    : 'local',
});

// Middleware
app.use(cors());
app.use(express.json());

// Development-only request telemetry. It intentionally records no request
// body, authorization header, OTP, password, token, or database information.
if (getConfig().NODE_ENV === 'development') {
  app.use((req, res, next) => {
    const startedAt = Date.now();
    res.on('finish', () => {
      console.log(`[HTTP] ${req.method} ${req.path} -> ${res.statusCode} (${Date.now() - startedAt}ms)`);
    });
    next();
  });
}

// Attach Socket.IO instance to requests
app.use((req, res, next) => {
  req.io = req.app.get('io');
  next();
});

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'Where Is My Bus Backend Running ✅'
  });
});

// Confirms the deployed/local runtime without revealing credentials, database
// hostnames, OTPs, or user data. It also verifies the two auth objects needed
// by login, which makes a stale deployment or a wrong database target visible.
app.get('/api/runtime', async (req, res) => {
  try {
    const rows = await prisma.$queryRaw`
      SELECT
        current_database()::text AS database,
        current_schema()::text AS schema,
        current_setting('search_path')::text AS search_path,
        to_regtype('public."Role"')::text IS NOT NULL AS role_type_present,
        to_regclass('public."Admin"')::text IS NOT NULL AS admin_table_present
    `;
    const database = rows[0];
    res.json({ ...runtimeInfo, database });
  } catch (err) {
    res.status(503).json({
      ...runtimeInfo,
      database: { available: false },
    });
  }
});

// Auth routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Bus routes
const busRoutes = require('./routes/busRoutes');
app.use('/api/buses', busRoutes);

// Trip routes
const tripRoutes = require('./routes/tripRoutes');
app.use('/api/trips', tripRoutes);

// Stop routes
const stopRoutes = require('./routes/stopRoutes');
app.use('/api/stops', stopRoutes);

// Notification routes
const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api/notifications', notificationRoutes);

// Driver routes
const driverRoutes = require('./routes/driverRoutes');
app.use('/api/drivers', driverRoutes);

// Student routes
const studentRoutes = require('./routes/studentRoutes');
app.use('/api/students', studentRoutes);

// Attendance routes
const attendanceRoutes = require('./routes/attendanceRoutes');
app.use('/api/attendance', attendanceRoutes);

// Maintenance routes
const maintenanceRoutes = require('./routes/maintenanceRoutes');
app.use('/api/maintenance', maintenanceRoutes);

// Fuel routes
const fuelRoutes = require('./routes/fuelRoutes');
app.use('/api/fuel', fuelRoutes);

// SOS routes
const sosRoutes = require('./routes/sosRoutes');
app.use('/api/sos', sosRoutes);

// Bus routes and admin routes
const routeRoutes = require('./routes/routeRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/routes', routeRoutes);

// School_Sheet import (ADMIN). Mounted before the '/api' admin catch-all.
app.use('/api/import', require('./routes/importRoutes'));

// School settings (ADMIN). Mounted before the '/api' admin catch-all.
app.use('/api/school', require('./routes/schoolRoutes'));

// State snapshots (Requirements 8.1–8.3). Mounted before the '/api' admin catch-all.
app.use('/api/tracking', require('./routes/trackingRoutes'));

app.use('/api', adminRoutes);

// Test SOS endpoint — ADMIN only, hidden in production (Requirements 3.4, 3.5)
const { protect } = require('./middleware/authMiddleware');
const { requireRole } = require('./middleware/requireRole');
const { notInProduction } = require('./middleware/devOnly');

app.post('/api/test-sos', notInProduction, protect, requireRole('ADMIN'), async (req, res) => {
  try {
    const { busId } = req.body || {};

    const { sendMulticast } = require('./services/notificationService');

    const users = await prisma.user.findMany({
      where: {
        fcmToken: {
          not: null
        }
      }
    });

    const tokens = users
      .map(user => user.fcmToken)
      .filter(Boolean);

    console.log('Tokens found:', tokens.length);

    if (tokens.length === 0) {
      return res.json({
        success: false,
        message: 'No FCM tokens found in the database'
      });
    }

    await sendMulticast(
      tokens,
      '🚨 SOS EMERGENCY!',
      `Bus ${busId} mein emergency!`,
      {
        busId,
        type: 'SOS'
      }
    );

    return res.json({
      success: true,
      message: 'Notification sent!',
      tokenCount: tokens.length
    });
  } catch (err) {
    console.error('Test SOS Error:', err);

    return res.status(500).json({
      error: err.message
    });
  }
});

module.exports = app;

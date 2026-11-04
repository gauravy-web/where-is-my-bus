const prisma = require('../db');
const { sendMulticast } = require('../services/notificationService');

const getSosAlerts = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};

    if (status === 'active') {
      where.status = { in: ['open', 'acknowledged'] };
    } else if (status === 'resolved') {
      where.status = 'resolved';
    } else if (status) {
      where.status = status;
    }

    const alerts = await prisma.emergency.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, alerts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const coord = (v, max) => (typeof v === 'number' && Number.isFinite(v) && Math.abs(v) <= max ? v : null);

const createSosAlert = async (req, res) => {
  try {
    const { busId, driverName, message, notes } = req.body;
    if (!busId) return res.status(400).json({ message: 'busId required' });
    let lat = coord(req.body.lat, 90);
    let lng = coord(req.body.lng, 180);
    if (lat === null || lng === null) { lat = null; lng = null; }

    const alert = await prisma.emergency.create({
      data: {
        busId,
        driverName: driverName || 'Driver',
        notes: notes || message || 'SOS Emergency!',
        status: 'open'
      },
    });

    if (req.io) {
      const payload = {
        ...alert,
        busId,
        driverName: driverName || 'Driver',
        lat,
        lng,
        timestamp: new Date().toISOString()
      };
      req.io.to(`bus_${busId}`).emit('sosAlert', payload);
      req.io.to('admins').emit('sosAlert', payload);
    }
    const coordData = lat !== null ? { lat: String(lat), lng: String(lng) } : {};

    try {
      const parentRows = await prisma.$queryRaw`
        SELECT DISTINCT u."fcmToken"
        FROM "Student" s
        JOIN "User" u ON u.phone = s."parentPhone"
        WHERE s."busId" = ${busId} AND u."fcmToken" IS NOT NULL
      `;
      const tokens = parentRows.map(r => r.fcmToken).filter(Boolean);
      if (tokens.length > 0) {
        sendMulticast(
          tokens,
          '🚨 SOS EMERGENCY ALERT!',
          `Emergency alert triggered on Bus ${busId}! Driver: ${driverName || 'Driver'}`,
          { busId, type: 'SOS', ...coordData }
        ).catch(e => console.log('SOS push error:', e.message));
      }
    } catch (e) {
      console.log('SOS notify error:', e.message);
    }

    res.json({ success: true, alert });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateSosStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const alert = await prisma.emergency.update({
      where: { id: req.params.id },
      data: { status },
    });

    if (req.io) {
      req.io.to('admins').emit('sosStatusUpdate', alert);
    }

    res.json({ success: true, alert });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const acknowledgeSosAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminName, adminId } = req.body;

    if (!adminName && !adminId) {
      return res.status(400).json({ message: 'Admin identification required' });
    }

    const existing = await prisma.emergency.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'SOS alert not found' });
    }

    if (existing.status !== 'open') {
      return res.status(400).json({
        message: `Cannot acknowledge: alert is already ${existing.status}`
      });
    }

    const noteSuffix = ` [Ack: ${adminName || adminId}]`;
    const updatedNotes = existing.notes ? `${existing.notes}${noteSuffix}` : noteSuffix.trim();

    const alert = await prisma.emergency.update({
      where: { id },
      data: {
        status: 'acknowledged',
        notes: updatedNotes,
      },
    });

    const payload = {
      ...alert,
      acknowledgedBy: adminName || adminId,
      acknowledgedAt: new Date().toISOString(),
    };

    if (req.io) {
      req.io.to('admins').emit('sosStatusUpdate', payload);
    }

    res.json({ success: true, alert: payload });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const resolveSosAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminName, adminId, resolutionNote } = req.body;

    if (!adminName && !adminId) {
      return res.status(400).json({ message: 'Admin identification required' });
    }

    if (!resolutionNote || resolutionNote.trim().length === 0) {
      return res.status(400).json({ message: 'Resolution note is required' });
    }

    const existing = await prisma.emergency.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'SOS alert not found' });
    }

    if (existing.status === 'resolved') {
      return res.status(400).json({
        message: 'Alert is already resolved'
      });
    }

    const noteSuffix = ` [Resolved by ${adminName || adminId}: ${resolutionNote.trim()}]`;
    const updatedNotes = existing.notes ? `${existing.notes}${noteSuffix}` : noteSuffix.trim();

    const alert = await prisma.emergency.update({
      where: { id },
      data: {
        status: 'resolved',
        notes: updatedNotes,
      },
    });

    const payload = {
      ...alert,
      status: 'resolved',
      resolvedBy: adminName || adminId,
      resolvedAt: new Date().toISOString(),
      resolutionNote: resolutionNote.trim(),
    };

    if (req.io) {
      req.io.to('admins').emit('sosStatusUpdate', payload);
    }

    res.json({ success: true, alert: payload });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getSosAlerts,
  createSosAlert,
  updateSosStatus,
  acknowledgeSosAlert,
  resolveSosAlert
};

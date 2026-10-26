// Conductor safety check endpoints (Requirements 18.4, 18.7, 18.8). The rules
// live in services/safetyCheckService.js; this file maps errors to HTTP and
// broadcasts `trip:safety` to the bus room and admins. req.io is absent in
// tests that do not attach Socket.IO.
const safetyCheckService = require('../services/safetyCheckService');

const { SafetyCheckError } = safetyCheckService;

const sendError = (res, err, label) => {
  if (err instanceof SafetyCheckError) {
    return res.status(err.status).json({ message: err.message });
  }
  console.error(`[safetyCheckController] ${label} failed:`, err);
  return res.status(500).json({ message: 'Safety check failed' });
};

// `trip:safety { busId, tripId, action, check, safetyChecks }` — the full list
// lets clients replace their copy instead of patching it.
function emitSafety(io, action, { trip, check, safetyChecks }) {
  if (!io || !trip) return;
  const payload = { busId: String(trip.busId), tripId: trip.id, action, check, safetyChecks };
  io.to(`bus_${trip.busId}`).emit('trip:safety', payload);
  io.to('admins').emit('trip:safety', payload);
}

// POST /api/trips/:id/safety-checks { studentId, type } — 201 when recorded,
// 200 with the existing record when repeated (no event, no alert).
const recordSafetyCheck = async (req, res) => {
  try {
    const { studentId, type } = req.body || {};
    const result = await safetyCheckService.recordCheck(req.user, req.params.id, studentId, type);
    if (result.created) emitSafety(req.io, 'RECORDED', result);
    return res.status(result.created ? 201 : 200).json({
      success: true,
      created: result.created,
      check: result.check,
      safetyChecks: result.safetyChecks,
    });
  } catch (err) {
    return sendError(res, err, 'recordSafetyCheck');
  }
};

// DELETE /api/trips/:id/safety-checks/:checkId — within 2 minutes, no alert.
const undoSafetyCheck = async (req, res) => {
  try {
    const result = await safetyCheckService.undoCheck(req.user, req.params.id, req.params.checkId);
    emitSafety(req.io, 'UNDONE', result);
    return res.json({ success: true, check: result.check, safetyChecks: result.safetyChecks });
  } catch (err) {
    return sendError(res, err, 'undoSafetyCheck');
  }
};

module.exports = { recordSafetyCheck, undoSafetyCheck };

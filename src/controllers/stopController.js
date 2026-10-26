// Stop routes. Validation and the per-bus, per-direction ordering rules live
// in services/stopService.js; this file maps them onto HTTP. Response shapes
// are the ones the app already uses ({ success, stops } / { success, stop }).
const stopService = require('../services/stopService');

const { StopServiceError } = stopService;

// 400/404 from the service keep their status and message; anything else is
// an unexpected failure.
const handleError = (res, err) => {
  if (err instanceof StopServiceError) {
    const body = { message: err.message };
    if (err.details) body.details = err.details;
    return res.status(err.status).json(body);
  }
  return res.status(500).json({ message: err.message });
};

// GET /api/stops/:busId and GET /api/stops/bus/:busId?direction=PICKUP|DROP
// One bus and one direction (PICKUP when omitted), in saved order.
const getStops = async (req, res) => {
  try {
    const direction = stopService.parseDirection(req.query?.direction);
    const stops = await stopService.listStops({ busId: req.params.busId, direction });
    res.json({ success: true, direction, stops });
  } catch (err) {
    handleError(res, err);
  }
};

// GET /api/stops: every stop across all buses for the Admin dashboard, each
// row including its direction.
const getAllStops = async (req, res) => {
  try {
    const stops = await stopService.listAllStops();
    res.json({ success: true, stops });
  } catch (err) {
    handleError(res, err);
  }
};

// POST /api/stops { busId, name, lat, lng, direction? }: appended to the end
// of that bus+direction sequence.
const createStop = async (req, res) => {
  try {
    const stop = await stopService.createStop(req.body || {});
    res.status(201).json({ success: true, stop });
  } catch (err) {
    handleError(res, err);
  }
};

// DELETE /api/stops/:id: removes the stop and renumbers the rest of the same
// bus and direction.
const deleteStop = async (req, res) => {
  try {
    await stopService.deleteStop(req.params.id);
    res.json({ success: true });
  } catch (err) {
    handleError(res, err);
  }
};

// PATCH|PUT /api/stops/reorder { busId, direction?, stopIds[] }: the full
// ordered id list for one bus and direction.
const reorderStops = async (req, res) => {
  try {
    const { busId, direction, stopIds } = req.body || {};
    const stops = await stopService.reorderStops({ busId, direction, stopIds });
    res.json({ success: true, stops });
  } catch (err) {
    handleError(res, err);
  }
};

module.exports = { getStops, getAllStops, createStop, deleteStop, reorderStops };

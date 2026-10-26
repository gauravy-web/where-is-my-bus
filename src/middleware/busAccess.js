// Per-bus authorization. Use after `protect`, which sets req.user.
//
//   // ADMIN, the bus's assigned DRIVER, or a PARENT whose child rides the bus
//   router.get('/:busId/full', protect, requireBusAccess('busId'), handler)
//
//   // Only the DRIVER assigned to req.body.busId
//   router.post('/location', protect, requireBusAccess('busId', { from: 'body', roles: ['DRIVER'] }), handler)
//
// Responses: 401 without req.user, 403 when the role is not in `roles` or
// accessService.canViewBus denies the bus, 400 when the bus id is missing.
// canViewBus already encodes the per-role rule (ADMIN: any bus, DRIVER: the
// assigned bus only, PARENT: their children's buses only), so `roles` only
// narrows which roles may reach the bus check.
const accessService = require('../services/accessService');

const requireBusAccess = (paramName = 'busId', { roles, from = 'params' } = {}) =>
  async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    if (Array.isArray(roles) && roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const raw = req[from]?.[paramName];
    const busId = raw === undefined || raw === null ? '' : String(raw).trim();
    if (!busId) {
      return res.status(400).json({ message: `${paramName} required` });
    }

    try {
      const allowed = await accessService.canViewBus(req.user, busId);
      if (!allowed) {
        return res.status(403).json({ message: 'Forbidden: no access to this bus' });
      }
      return next();
    } catch (err) {
      console.log('requireBusAccess error:', err.message);
      return res.status(500).json({ message: 'Access check failed' });
    }
  };

module.exports = { requireBusAccess };

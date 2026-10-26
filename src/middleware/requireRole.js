// Role guard. Use after `protect`, which verifies the JWT and sets req.user.
//   router.post('/', protect, requireRole('ADMIN'), handler)
// 401 when there is no authenticated user, 403 when the role is not allowed.
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  return next();
};

module.exports = { requireRole };

// Hides development/test-only endpoints in production (Requirement 3.5).
// The config is read per request (getConfig is lazy and cached; tests call
// resetConfig() after changing process.env).
const { getConfig } = require('../config/env');

const notInProduction = (req, res, next) => {
  if (getConfig().NODE_ENV === 'production') {
    return res.status(404).json({ message: 'Not found' });
  }
  return next();
};

module.exports = { notInProduction };

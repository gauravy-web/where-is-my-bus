const rateLimit = require('express-rate-limit');

// Chat rate limiter: 10 messages per minute per user
const chatRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: { message: 'Too many messages. Please wait a moment.' },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip custom keyGenerator - use default which handles IPv6 properly
  // The default uses req.ip which is already IPv6-safe
  skip: (req) => !req.user?.id, // Only rate limit authenticated users
});

module.exports = { chatRateLimiter };

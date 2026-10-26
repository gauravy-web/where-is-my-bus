const express = require('express');
const router = express.Router();
const { register, login, adminLogin, updateFcmToken } = require('../controllers/authController');
// Note: OTP auth removed. All phone users now log in with phone + password.
const { protect } = require('../middleware/authMiddleware');

// Public
router.post('/register', register);
router.post('/login', login);
router.post('/admin-login', adminLogin);
// Authenticated: the token is stored on req.user (Requirement 3.6)
router.post('/fcm-token', protect, updateFcmToken);

module.exports = router;

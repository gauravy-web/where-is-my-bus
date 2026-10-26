// School settings routes (Requirements 6.11, 6.13). ADMIN only.
//   GET /api/school
//   PUT /api/school   { name, address?, lat, lng, contactPhone? }
const express = require('express');

const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/requireRole');
const { getSchool, updateSchool } = require('../controllers/schoolController');

const router = express.Router();
const adminOnly = [protect, requireRole('ADMIN')];

router.get('/', ...adminOnly, getSchool);
router.put('/', ...adminOnly, updateSchool);

module.exports = router;

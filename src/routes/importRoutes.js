// School_Sheet import routes (Requirement 17.1, 17.4, 17.12, 17.14). ADMIN only.
//   POST /api/import/school-sheet/preview   multipart, field "file" (.xlsx or .csv, max 2 MB)
//   POST /api/import/school-sheet/confirm   { previewToken }
const express = require('express');
const multer = require('multer');

const prisma = require('../db');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/requireRole');
const { createImportService, ImportError } = require('../services/importService');

const router = express.Router();
const importService = createImportService({ prisma });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 1, fields: 5, parts: 6 },
});

// Wrap multer so its errors become JSON responses instead of reaching the default handler.
const uploadFile = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ message: 'The file is larger than 2 MB' });
    }
    return res.status(400).json({ message: 'Invalid upload' });
  });
};

const sendError = (res, err) => {
  if (err instanceof ImportError) {
    return res.status(err.status).json({ message: err.message, ...(err.details || {}) });
  }
  console.error('School sheet import failed:', err && err.message);
  return res.status(500).json({ message: 'Import failed' });
};

const adminOnly = [protect, requireRole('ADMIN')];

router.post('/school-sheet/preview', ...adminOnly, uploadFile, async (req, res) => {
  if (!req.file || !req.file.buffer) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  try {
    const preview = await importService.preview({
      buffer: req.file.buffer,
      filename: req.file.originalname,
      adminId: req.user.id,
    });
    return res.status(200).json(preview);
  } catch (err) {
    return sendError(res, err);
  }
});

router.post('/school-sheet/confirm', ...adminOnly, async (req, res) => {
  try {
    const previewToken = req.body ? req.body.previewToken : undefined;
    const result = await importService.confirm({ previewToken, adminId: req.user.id });
    return res.status(200).json({ success: true, result });
  } catch (err) {
    return sendError(res, err);
  }
});

module.exports = router;

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
    const resolveConflicts = req.body ? Boolean(req.body.resolveConflicts) : false;
    const result = await importService.confirm({ previewToken, adminId: req.user.id, resolveConflicts });
    return res.status(200).json({ success: true, result });
  } catch (err) {
    return sendError(res, err);
  }
});

router.get('/school-sheet/sample', ...adminOnly, async (req, res) => {
  try {
    const ExcelJS = require('exceljs');
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Where Is My Bus Admin';
    const ws = wb.addWorksheet('Bus Import', { properties: { defaultRowHeight: 22 } });

    ws.columns = [
      { header: 'Serial Number', key: 'serialNo', width: 14 },
      { header: 'Name of the Student', key: 'name', width: 22 },
      { header: 'Roll Number', key: 'rollNo', width: 16 },
      { header: "Father's Name", key: 'fatherName', width: 20 },
      { header: "Mother's Name", key: 'motherName', width: 20 },
      { header: 'Parent Contact Number 1', key: 'parentPhone1', width: 24 },
      { header: 'Parent Contact Number 2', key: 'parentPhone2', width: 24 },
      { header: 'Bus Alloted', key: 'busLabel', width: 14 },
      { header: 'Bus Number', key: 'busNo', width: 18 },
      { header: 'Driver Name', key: 'driverName', width: 18 },
      { header: 'Assistant Driver Name', key: 'conductorName', width: 22 },
      { header: 'Pick up Location With (Coordinates From Google Map)', key: 'pickupLocation', width: 35 },
      { header: 'Drop Location with (Coordinates From Google Map)', key: 'dropLocation', width: 35 },
      { header: 'School Name', key: 'schoolName', width: 26 },
      { header: 'Driver Contact Number', key: 'driverPhone', width: 22 },
      { header: 'Assistant Driver Contact Number', key: 'conductorPhone', width: 24 },
      { header: 'School Authorities Contact Number', key: 'schoolPhone', width: 26 },
      { header: 'Pick up order', key: 'pickupOrder', width: 14 },
      { header: 'Drop Order', key: 'dropOrder', width: 14 },
    ];

    ws.addRow([
      1, 'Aarav Sharma', 'DPS-101', 'Ramesh Sharma', 'Sunita Sharma',
      '9876543210', '9876543211', 'Bus 5', 'RJ 37 PJ 5689', 'Rajesh Kumar', 'Sunil Singh',
      '21.244718, 81.334927', '21.244718, 81.334927', 'Delhi Public School',
      '9876500001', '9876500002', '9876500003', 1, 3,
    ]);
    ws.addRow([
      2, 'Diya Patel', 'DPS-102', 'Mahesh Patel', 'Geeta Patel',
      '9876543212', '9876543213', 'Bus 5', 'RJ 37 PJ 5689', 'Rajesh Kumar', 'Sunil Singh',
      '21.250100, 81.338200', '21.250100, 81.338200', 'Delhi Public School',
      '9876500001', '9876500002', '9876500003', 2, 2,
    ]);
    ws.addRow([
      3, 'Kabir Verma', 'DPS-103', 'Vikram Verma', 'Pooja Verma',
      '9876543214', '9876543215', 'Bus 5', 'RJ 37 PJ 5689', 'Rajesh Kumar', 'Sunil Singh',
      '21.255400, 81.341500', '21.255400, 81.341500', 'Delhi Public School',
      '9876500001', '9876500002', '9876500003', 3, 1,
    ]);

    const headerRow = ws.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A73E8' } };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Sample_School_Bus_Sheet.xlsx"');
    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    return sendError(res, err);
  }
});

module.exports = router;

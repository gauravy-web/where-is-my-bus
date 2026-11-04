const prisma = require('../db');
const { validateDropStop, validatePickupStop } = require('../services/stopService');
const { offsetPaginate, paginationResponse } = require('../utils/pagination');

const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

// Read an optional nullable string from the body (stop ids, parentPhone2,
// fatherName, motherName).
function readNullableString(body, key) {
  if (!has(body, key) || body[key] === undefined) return { given: false };
  const raw = body[key];
  if (raw === null) return { given: true, value: null };
  if (typeof raw !== 'string') return { error: `${key} must be a string or null` };
  return { given: true, value: raw.trim() || null };
}

// Check requested stop links against the student's bus.
async function resolveStopLinks(student, pickup, drop) {
  const data = {};
  const checks = [
    { field: 'stopId', input: pickup, validate: validatePickupStop },
    { field: 'dropStopId', input: drop, validate: validateDropStop },
  ];
  for (const { field, input, validate } of checks) {
    if (!input.given) continue;
    if (input.value !== null) {
      const stop = await prisma.stop.findUnique({ where: { id: input.value } });
      const check = validate(student, stop);
      if (!check.ok) return { error: check.reason };
    }
    data[field] = input.value;
  }
  return { data };
}

// GET /api/students?page=1&limit=50&busId=xxx (with pagination)
const getStudents = async (req, res) => {
  try {
    const { page, limit, busId, search } = req.query;
    const isPaginated = page !== undefined || limit !== undefined;
    const { skip, take, page: pageNum, limit: limitNum } = offsetPaginate(page, limit);

    // Build where clause
    const where = {};
    if (busId) where.busId = busId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { admissionNo: { contains: search, mode: 'insensitive' } },
        { parentPhone: { contains: search } },
      ];
    }

    const queryOptions = {
      where,
      ...(isPaginated ? { skip, take } : {}),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        admissionNo: true,
        busId: true,
        parentPhone: true,
        parentPhone2: true,
        class: true,
        stopId: true,
        dropStopId: true,
        fatherName: true,
        motherName: true,
        createdAt: true,
      },
    };

    const students = await prisma.student.findMany(queryOptions);
    const total =
      isPaginated && typeof prisma.student.count === 'function'
        ? await prisma.student.count({ where })
        : students.length;

    const effectiveLimit = isPaginated ? limitNum : Math.max(total, limitNum);
    res.json({
      success: true,
      students,
      ...paginationResponse(students, total, isPaginated ? pageNum : 1, effectiveLimit),
    });
  } catch (err) {
    console.error('[studentController] getStudents error:', err);
    res.status(500).json({ message: err.message });
  }
};

const addStudent = async (req, res) => {
  try {
    const body = req.body || {};
    const { name, admissionNo, busId, parentPhone, class: className } = body;
    if (!name || !busId || !parentPhone)
      return res.status(400).json({ message: 'Name, busId and parentPhone required' });

    const pickup = readNullableString(body, 'stopId');
    const drop = readNullableString(body, 'dropStopId');
    const extras = ['parentPhone2', 'fatherName', 'motherName'].map((k) => [k, readNullableString(body, k)]);
    const invalid = [pickup, drop, ...extras.map(([, v]) => v)].find((v) => v.error);
    if (invalid) return res.status(400).json({ message: invalid.error });

    const links = await resolveStopLinks({ busId }, pickup, drop);
    if (links.error) return res.status(400).json({ message: links.error });

    const optional = {};
    for (const [key, v] of extras) if (v.given) optional[key] = v.value;

    const student = await prisma.student.create({
      data: {
        name,
        admissionNo: admissionNo || '',
        busId,
        parentPhone,
        class: className || '',
        stopId: links.data.stopId ?? null,
        ...(has(links.data, 'dropStopId') ? { dropStopId: links.data.dropStopId } : {}),
        ...optional,
      },
    });
    res.json({ success: true, student });
  } catch (err) {
    console.error('[studentController] addStudent error:', err);
    res.status(500).json({ message: err.message });
  }
};

const updateStudent = async (req, res) => {
  try {
    const body = req.body || {};
    const pickup = readNullableString(body, 'stopId');
    const drop = readNullableString(body, 'dropStopId');
    const invalid = [pickup, drop].find((v) => v.error);
    if (invalid) return res.status(400).json({ message: invalid.error });
    if (!pickup.given && !drop.given) {
      return res.status(400).json({ message: 'dropStopId or stopId required' });
    }

    const student = await prisma.student.findUnique({ where: { id: req.params.id } });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const links = await resolveStopLinks(student, pickup, drop);
    if (links.error) return res.status(400).json({ message: links.error });

    const updated = await prisma.student.update({ where: { id: student.id }, data: links.data });
    res.json({ success: true, student: updated });
  } catch (err) {
    console.error('[studentController] updateStudent error:', err);
    res.status(500).json({ message: err.message });
  }
};

const deleteStudent = async (req, res) => {
  try {
    await prisma.student.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    console.error('[studentController] deleteStudent error:', err);
    res.status(500).json({ message: err.message });
  }
};

const conductorView = (s) => ({
  id: s.id,
  name: s.name,
  busId: s.busId,
  stopId: s.stopId ?? null,
  dropStopId: s.dropStopId ?? null,
});

const getStudentsByBus = async (req, res) => {
  try {
    const rows = await prisma.student.findMany({
      where: { busId: req.params.busId },
      orderBy: { name: 'asc' },
    });
    const students = req.user && req.user.role === 'CONDUCTOR' ? rows.map(conductorView) : rows;
    res.json({ success: true, students });
  } catch (err) {
    console.error('[studentController] getStudentsByBus error:', err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getStudents, addStudent, updateStudent, deleteStudent, getStudentsByBus };

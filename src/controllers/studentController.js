const prisma = require('../db');
const { validateDropStop, validatePickupStop } = require('../services/stopService');

const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

// Read an optional nullable string from the body (stop ids, parentPhone2,
// fatherName, motherName).
//   absent          -> { given: false }
//   null or blank   -> { given: true, value: null }  (clear the field)
//   non-empty text  -> { given: true, value: '<trimmed>' }
//   anything else   -> { error }
function readNullableString(body, key) {
  if (!has(body, key) || body[key] === undefined) return { given: false };
  const raw = body[key];
  if (raw === null) return { given: true, value: null };
  if (typeof raw !== 'string') return { error: `${key} must be a string or null` };
  return { given: true, value: raw.trim() || null };
}

// Check requested stop links against the student's bus. `student` only needs
// busId. Returns { data } with the fields to write, or { error } for a 400.
// Student.stopId is the pickup stop; dropStopId must be a DROP stop of the
// same bus (Requirements 5.7, 5.8).
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

const getStudents = async (req, res) => {
  try {
    const students = await prisma.student.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, students });
  } catch (err) { res.status(500).json({ message: err.message }); }
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
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PUT /api/students/:id { dropStopId?, stopId? } (ADMIN). null clears a link.
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
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteStudent = async (req, res) => {
  try {
    await prisma.student.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// A CONDUCTOR sees only names and Relevant_Stops (Requirement 3.9): no
// parent phones or other family details.
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
      where: { busId: req.params.busId }, orderBy: { name: 'asc' },
    });
    const students = req.user && req.user.role === 'CONDUCTOR' ? rows.map(conductorView) : rows;
    res.json({ success: true, students });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getStudents, addStudent, updateStudent, deleteStudent, getStudentsByBus };

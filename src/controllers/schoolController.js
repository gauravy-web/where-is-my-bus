// School settings (single-school deployment). ADMIN only, see schoolRoutes.js.
//   GET /api/school   -> { success, school }   (school is null until configured)
//   PUT /api/school   { name, address?, lat, lng, contactPhone? } -> { success, school }
// The School row is the School_Destination: the end point of every PICKUP trip
// (Requirements 6.11, 6.13). Coordinates are entered by the admin, never hardcoded.
const prisma = require('../db');
const { normalizeImportPhone } = require('../services/schoolSheetImporter');

// Number from a number or numeric string; NaN for anything else (including '').
const toNumber = (v) => {
  if (typeof v === 'number') return v;
  if (typeof v === 'string' && v.trim() !== '') return Number(v.trim());
  return NaN;
};

const isBlank = (v) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '');

// Validate the PUT body. Returns { data } or { error }.
// Optional fields left out of the body are not included in `data`, so an update
// keeps their stored value; null or '' clears them.
function validateSchool(body) {
  const b = body && typeof body === 'object' ? body : {};

  if (typeof b.name !== 'string' || b.name.trim() === '') {
    return { error: 'School name is required' };
  }
  const lat = toNumber(b.lat);
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    return { error: 'Latitude must be a number between -90 and 90' };
  }
  const lng = toNumber(b.lng);
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    return { error: 'Longitude must be a number between -180 and 180' };
  }

  const data = { name: b.name.trim(), lat, lng };

  if (b.address !== undefined) {
    if (!isBlank(b.address) && typeof b.address !== 'string') return { error: 'Address must be text' };
    data.address = isBlank(b.address) ? null : b.address.trim();
  }

  if (b.contactPhone !== undefined) {
    if (isBlank(b.contactPhone)) {
      data.contactPhone = null;
    } else {
      const res = normalizeImportPhone(b.contactPhone);
      if (res.error || !res.phone) return { error: 'Contact phone must be a 10-digit number' };
      data.contactPhone = res.phone;
    }
  }

  return { data };
}

const getSchool = async (req, res) => {
  try {
    const school = await prisma.school.findFirst();
    return res.json({ success: true, school: school || null });
  } catch (err) {
    console.error('Get school failed:', err && err.message);
    return res.status(500).json({ message: 'Could not load school settings' });
  }
};

const updateSchool = async (req, res) => {
  const { data, error } = validateSchool(req.body);
  if (error) return res.status(400).json({ message: error });

  try {
    const existing = await prisma.school.findFirst();
    const school = existing
      ? await prisma.school.update({ where: { id: existing.id }, data })
      : await prisma.school.create({
        data: { address: null, contactPhone: null, ...data },
      });
    return res.json({ success: true, school });
  } catch (err) {
    console.error('Update school failed:', err && err.message);
    return res.status(500).json({ message: 'Could not save school settings' });
  }
};

module.exports = { getSchool, updateSchool, validateSchool };

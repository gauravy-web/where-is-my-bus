const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const prisma = require('../db');
const { getConfig } = require('../config/env');
const accessService = require('../services/accessService');

const { normalizePhone } = accessService;

// JWT secret comes from the environment (read lazily so tests can inject it)
const jwtSecret = () => getConfig().JWT_SECRET;

const BCRYPT_COST = 10;
const BCRYPT_HASH_RE = /^\$2[aby]\$/;

const NOT_REGISTERED_MSG = 'This phone number is not registered with the school';

// ── Server-derived role (Requirements 2.1–2.4, 2.10, 2.11) ──
// DRIVER when a Driver row has this phone, CONDUCTOR when a Conductor row has
// it, PARENT when a Student has it as parentPhone or parentPhone2 (all
// compared on the normalized last-10-digit value). The client's requestedRole
// is only a hint to choose between derived roles; otherwise the priority is
// DRIVER > CONDUCTOR > PARENT.
// Returns { ok: true, role } or { ok: false, status: 403, message }.
async function deriveRole(phone, requestedRole) {
  const normalized = normalizePhone(phone);
  const requested = requestedRole ? String(requestedRole).toUpperCase() : null;

  if (requested === 'ADMIN') {
    return { ok: false, status: 403, message: 'Admin access is only available through admin login' };
  }
  if (!normalized) {
    return { ok: false, status: 403, message: NOT_REGISTERED_MSG };
  }

  const [drivers, conductors, students] = await Promise.all([
    prisma.driver.findMany({ select: { phone: true } }),
    prisma.conductor.findMany({ select: { phone: true } }),
    prisma.student.findMany({ select: { parentPhone: true, parentPhone2: true } }),
  ]);
  const isDriver = drivers.some((d) => normalizePhone(d.phone) === normalized);
  const isConductor = conductors.some((c) => normalizePhone(c.phone) === normalized);
  const isParent = students.some(
    (s) => normalizePhone(s.parentPhone) === normalized || normalizePhone(s.parentPhone2) === normalized,
  );

  if (requested === 'DRIVER' && !isDriver) {
    return { ok: false, status: 403, message: 'This phone number is not registered as a driver' };
  }
  if (requested === 'CONDUCTOR' && !isConductor) {
    return { ok: false, status: 403, message: 'This phone number is not registered as a conductor' };
  }

  // Priority order: DRIVER > CONDUCTOR > PARENT.
  const derived = [];
  if (isDriver) derived.push('DRIVER');
  if (isConductor) derived.push('CONDUCTOR');
  if (isParent) derived.push('PARENT');
  if (derived.length === 0) {
    return { ok: false, status: 403, message: NOT_REGISTERED_MSG };
  }
  const role = derived.includes(requested) ? requested : derived[0];
  return { ok: true, role };
}

// Find the User row: exact phone first, then a normalized-phone match so
// "+91 96800 02257" and "9680002257" resolve to the same person.
async function findUserByPhone(phone) {
  const exact = await prisma.user.findUnique({ where: { phone } });
  if (exact) return exact;
  const normalized = normalizePhone(phone);
  if (!normalized) return null;
  const users = await prisma.user.findMany();
  return users.find((u) => normalizePhone(u.phone) === normalized) || null;
}

// ── Parent ya Driver ke login/register response mein busId attach karo ──
// IMPORTANT: this must be called with `user.role` already set to the
// role the person is CURRENTLY logging in as. If role is stale (e.g. a
// user row created earlier under a different role), busId will be
// attached for the WRONG role — that was the root cause of the
// "existing driver shows No Bus Assigned" bug.
const attachBusInfo = async (user) => {
  try {
    console.log('[attachBusInfo] role:', user.role);

    // ── PARENT ── every child linked by parentPhone OR parentPhone2, matched
    // on the normalized phone (same rule as deriveRole and accessService).
    // The top-level student fields come from the FIRST child for older
    // clients; `children` lists them all.
    if (user.role === 'PARENT') {
      const students = await accessService.getParentStudents(user);
      if (students.length === 0) {
        return { ...user, busId: null, studentId: null, children: [] };
      }

      const busIds = [...new Set(students.map((s) => s.busId).filter(Boolean))];
      const buses = busIds.length
        ? await prisma.bus.findMany({ where: { id: { in: busIds } } })
        : [];
      const busNoById = new Map(buses.map((b) => [b.id, b.busNo]));

      const children = students.map((s) => ({
        id:         s.id,
        name:       s.name,
        busId:      s.busId || null,
        busNo:      s.busId ? busNoById.get(s.busId) ?? null : null,
        stopId:     s.stopId || null,
        dropStopId: s.dropStopId || null,
        class:      s.class ?? null,
      }));
      const first = children[0];
      return {
        ...user,
        studentId:   first.id,
        studentName: first.name,
        busId:       first.busId,
        busNo:       first.busNo,
        stopId:      first.stopId,
        dropStopId:  first.dropStopId,
        class:       first.class,
        children,
      };
    }

    // ── CONDUCTOR ── the Conductor row's assigned bus, matched on the
    // normalized phone (same rule as deriveRole). A row with a bus is
    // preferred when several rows share the phone.
    if (user.role === 'CONDUCTOR') {
      const normalized = normalizePhone(user.phone);
      const conductors = await prisma.conductor.findMany();
      const matches = conductors.filter((c) => normalizePhone(c.phone) === normalized);
      const conductor = matches.find((c) => c.busId) || matches[0] || null;

      if (conductor && conductor.busId) {
        const bus = await prisma.bus.findUnique({ where: { id: conductor.busId } });
        return {
          ...user,
          conductorId: conductor.id,
          name:        conductor.name || user.name, // prefer admin-entered conductor name
          busId:       conductor.busId,
          busNo:       bus ? bus.busNo : null,
        };
      }
      // conductor row exists but no bus assigned yet, or no conductor row at all
      return {
        ...user,
        conductorId: conductor ? conductor.id : null,
        name:        (conductor && conductor.name) || user.name,
        busId:       null,
        busNo:       null,
      };
    }

    // ── DRIVER ── admin ne Driver table mein jo bus assign
    // kiya hai. Match on a NORMALIZED phone so formatting differences
    // between the Admin panel and the app's login don't cause a false "no match".
    if (user.role === 'DRIVER') {
      const normalized = normalizePhone(user.phone);

      const rows = await prisma.$queryRaw`
        SELECT d.id as "driverId", d.name as "driverName", d.phone as "driverPhone",
               d."busId", b."busNo"
        FROM "Driver" d
        LEFT JOIN "Bus" b ON b.id = d."busId"
        WHERE regexp_replace(d.phone, '\\D', '', 'g') LIKE '%' || ${normalized}
        LIMIT 1
      `;
      const driver = rows[0];

      console.log('[LOGIN] driver id:', driver?.driverId, 'busId:', driver?.busId);

      if (driver && driver.busId) {
        return {
          ...user,
          driverId: driver.driverId,
          name:     driver.driverName || user.name, // prefer admin-entered driver name
          busId:    driver.busId,
          busNo:    driver.busNo,
        };
      }
      // driver row exists but no bus assigned yet, or no driver row at all
      return { ...user, busId: null, busNo: null };
    }

    // ── ADMIN ── kuch attach nahi karna
    return user;

  } catch (err) {
    console.log('attachBusInfo error:', err.message);
    return { ...user, busId: null };
  }
};

const signUserToken = (user) =>
  jwt.sign({ id: user.id, role: user.role, phone: user.phone }, jwtSecret(), { expiresIn: '7d' });

// Hash a password if it is not already a bcrypt hash.
async function hashPassword(password) {
  if (BCRYPT_HASH_RE.test(password)) return password;
  return bcrypt.hash(String(password), BCRYPT_COST);
}

// Shared phone flow for login and register: verify password, derive the
// role (403), then find or create the User and persist the DERIVED role.
// The client-sent role is never stored. Returns { status, body }.
async function phoneAuth({ phone, password, role, name, fcmToken }) {
  if (!phone || !normalizePhone(phone)) {
    return { status: 400, body: { message: 'Phone number is required' } };
  }
  if (!password || String(password).trim() === '') {
    return { status: 400, body: { message: 'Password is required' } };
  }

  const derived = await deriveRole(phone, role);
  if (!derived.ok) {
    return { status: derived.status, body: { message: derived.message } };
  }

  let user = await findUserByPhone(phone);
  let created = false;

  if (!user) {
    // First sign-in: create the User row with a hashed password.
    const hash = await hashPassword(password);
    user = await prisma.user.create({
      data: { phone, name: name || null, role: derived.role, password: hash, fcmToken: fcmToken || null },
    });
    created = true;
  } else {
    // Verify password against the stored hash.
    const stored = typeof user.password === 'string' ? user.password : '';
    let valid = false;
    if (stored === '') {
      // No password set yet — accept and store hash (migration path).
      valid = true;
    } else if (BCRYPT_HASH_RE.test(stored)) {
      valid = await bcrypt.compare(String(password), stored);
    } else {
      // Legacy plaintext — compare and rehash on success.
      valid = stored === String(password);
    }
    if (!valid) {
      return { status: 401, body: { message: 'Incorrect password' } };
    }

    const updateData = {};
    if (user.role !== derived.role) updateData.role = derived.role;
    if (fcmToken && user.fcmToken !== fcmToken) updateData.fcmToken = fcmToken;
    if (name && !user.name) updateData.name = name;
    // Rehash plaintext password on successful login.
    if (stored !== '' && !BCRYPT_HASH_RE.test(stored)) {
      updateData.password = await hashPassword(password);
    }
    // Store password on first login if previously unset.
    if (stored === '') {
      updateData.password = await hashPassword(password);
    }

    if (Object.keys(updateData).length > 0) {
      user = await prisma.user.update({ where: { id: user.id }, data: updateData });
    }
  }

  const token = signUserToken(user);
  const fullUser = await attachBusInfo(user);
  return { status: created ? 201 : 200, body: { success: true, token, user: fullUser } };
}

const register = async (req, res) => {
  try {
    const { phone, name, role, fcmToken, password } = req.body || {};
    const result = await phoneAuth({ phone, password, role, name, fcmToken });
    res.status(result.status).json(result.body);
  } catch (err) {
    console.log('Register Error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { phone, role, name, fcmToken, password } = req.body || {};
    const result = await phoneAuth({ phone, password, role, name, fcmToken });
    // Login answers 200 whether the User row already existed or was just created.
    res.status(result.status === 201 ? 200 : result.status).json(result.body);
  } catch (err) {
    console.log('Login Error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// Used behind `protect`: the token is stored on the User from the verified
// JWT (req.user.id). Any phone in the body is ignored (Requirement 3.6).
const updateFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body || {};
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    if (typeof fcmToken !== 'string' || fcmToken.trim() === '') {
      return res.status(400).json({ message: 'fcmToken required' });
    }
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { fcmToken }
    });
    res.json({ success: true, user });
  } catch (err) {
    if (err && err.code === 'P2025') {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('updateFcmToken error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// ── Admin email/password login (Requirements 2.7, 2.8) ──
// Verified with bcrypt. A legacy plaintext password is compared once and,
// if correct, replaced with a bcrypt hash (lazy rehash).
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email aur password dono chahiye' });
    }

    const admin = await prisma.admin.findUnique({
      where: { email: String(email).trim() },
    });
    if (!admin) return res.status(401).json({ message: 'Admin not found' });

    const stored = typeof admin.password === 'string' ? admin.password : '';
    let valid = false;
    if (BCRYPT_HASH_RE.test(stored)) {
      valid = await bcrypt.compare(String(password), stored);
    } else if (stored !== '' && stored === String(password)) {
      valid = true;
      const hash = await bcrypt.hash(String(password), BCRYPT_COST);
      await prisma.admin.update({ where: { id: admin.id }, data: { password: hash } });
    }
    if (!valid) return res.status(401).json({ message: 'Wrong password' });

    const token = jwt.sign({ id: admin.id, role: 'ADMIN' }, jwtSecret(), { expiresIn: '30d' });
    res.json({
      success: true,
      token,
      user: { id: admin.id, email: admin.email, name: admin.name, role: 'ADMIN' }
    });
  } catch (err) {
    console.log('Admin Login Error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, login, adminLogin, updateFcmToken, deriveRole };

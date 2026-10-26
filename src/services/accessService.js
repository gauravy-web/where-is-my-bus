// Access_Service: decides which buses/students a user may access and which
// Socket.IO rooms they belong to. Prisma is injectable so tests can pass a fake:
//   const access = createAccessService(fakePrisma);
// The default export functions use ../db, loaded lazily on first call.

// Same rule as authController.normalizePhone: digits only, last 10 digits.
// "+91 96800 02257", "919680002257" and "9680002257" all compare equal.
const normalizePhone = (p) => {
  if (!p) return '';
  const digits = String(p).replace(/\D/g, '');
  return digits.slice(-10);
};

const busRoom = (busId) => `bus_${busId}`;

function createAccessService(prismaOrGetter) {
  const db = () => (typeof prismaOrGetter === 'function' ? prismaOrGetter() : prismaOrGetter);

  // The JWT payload currently carries only { id, role }, so fall back to
  // looking up User.phone by id when the payload has no phone.
  async function getUserPhone(user) {
    if (!user) return '';
    if (user.phone) return normalizePhone(user.phone);
    if (!user.id) return '';
    const row = await db().user.findUnique({ where: { id: user.id }, select: { phone: true } });
    return normalizePhone(row?.phone);
  }

  // Students whose parentPhone OR parentPhone2 matches the PARENT user's phone
  // (normalized). Phones may be stored with different formatting, so matching
  // is done on the normalized value rather than by exact SQL equality.
  async function getParentStudents(user) {
    if (!user || user.role !== 'PARENT') return [];
    const phone = await getUserPhone(user);
    if (!phone) return [];
    const students = await db().student.findMany();
    return students.filter(
      (s) => normalizePhone(s.parentPhone) === phone || normalizePhone(s.parentPhone2) === phone,
    );
  }

  // Staff row (Driver/Conductor) for a user, matched by normalized phone. If
  // several rows share the phone, prefer one that has a bus assigned.
  async function findStaffRow(user, role, model) {
    if (!user || user.role !== role) return null;
    const phone = await getUserPhone(user);
    if (!phone) return null;
    const rows = await db()[model].findMany();
    const matches = rows.filter((r) => normalizePhone(r.phone) === phone);
    return matches.find((r) => r.busId) || matches[0] || null;
  }

  const getDriverForUser = (user) => findStaffRow(user, 'DRIVER', 'driver');
  const getConductorForUser = (user) => findStaffRow(user, 'CONDUCTOR', 'conductor');

  async function canViewBus(user, busId) {
    if (!user || busId === undefined || busId === null || busId === '') return false;
    const target = String(busId);
    switch (user.role) {
      case 'ADMIN':
        return true;
      case 'DRIVER': {
        const driver = await getDriverForUser(user);
        return !!driver?.busId && String(driver.busId) === target;
      }
      case 'CONDUCTOR': {
        const conductor = await getConductorForUser(user);
        return !!conductor?.busId && String(conductor.busId) === target;
      }
      case 'PARENT': {
        const students = await getParentStudents(user);
        return students.some((s) => s.busId && String(s.busId) === target);
      }
      default:
        return false;
    }
  }

  async function roomsForUser(user) {
    if (!user) return [];
    switch (user.role) {
      case 'ADMIN':
        return ['admins'];
      case 'DRIVER': {
        const driver = await getDriverForUser(user);
        return driver?.busId ? [busRoom(driver.busId)] : [];
      }
      case 'CONDUCTOR': {
        const conductor = await getConductorForUser(user);
        return conductor?.busId ? [busRoom(conductor.busId)] : [];
      }
      case 'PARENT': {
        const students = await getParentStudents(user);
        const busIds = [...new Set(students.map((s) => s.busId).filter(Boolean))];
        return busIds.map(busRoom);
      }
      default:
        return [];
    }
  }

  return { getParentStudents, getDriverForUser, getConductorForUser, canViewBus, roomsForUser };
}

const defaultService = createAccessService(() => require('../db'));

module.exports = {
  ...defaultService,
  createAccessService,
  normalizePhone,
  busRoom,
};

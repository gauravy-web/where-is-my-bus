// Feature: live-tracking-fixed-routes, Property 4: Parent access and room isolation
// **Validates: Requirements 3.7, 3.8, 4.2, 4.3**
//
// For any generated set of students, drivers and a PARENT user (phones stored in
// varying formats), getParentStudents(parent) returns exactly the students whose
// parentPhone OR parentPhone2 matches the parent's phone, canViewBus(parent, busId)
// is true iff one of those students rides busId, and roomsForUser(parent) is
// exactly the set of bus_<busId> rooms for those students (never 'admins').
// The expected values are computed from the underlying 10-digit numbers the
// generator chose, not via normalizePhone, so the oracle is independent.
const fc = require('fast-check');
const { createAccessService } = require('../src/services/accessService');

const BUS_POOL = ['bus-1', 'bus-2', 'bus-3', 'bus-4', 'bus-5'];

// Fake Prisma: only the calls accessService makes.
function fakePrisma({ users = [], students = [], drivers = [], conductors = [] }) {
  return {
    user: {
      findUnique: async ({ where }) => {
        const u = users.find((x) => x.id === where.id);
        return u ? { phone: u.phone } : null;
      },
    },
    student: { findMany: async () => students.map((s) => ({ ...s })) },
    driver: { findMany: async () => drivers.map((d) => ({ ...d })) },
    conductor: { findMany: async () => conductors.map((c) => ({ ...c })) },
  };
}

// A 10-digit Indian mobile number. A small fixed pool forces phone collisions
// between parents and students; random ones add unrelated numbers.
const basePhoneArb = fc.oneof(
  fc.constantFrom('9680002257', '9876543210', '9123456780', '7000000001'),
  fc
    .tuple(fc.constantFrom('6', '7', '8', '9'), fc.stringOf(fc.constantFrom(...'0123456789'), { minLength: 9, maxLength: 9 }))
    .map(([a, b]) => a + b)
);

// Render the same number in the formats seen in real data.
const formatArb = fc.constantFrom(
  (d) => d,
  (d) => `+91 ${d}`,
  (d) => `91${d}`,
  (d) => `+91-${d.slice(0, 5)}-${d.slice(5)}`,
  (d) => `${d.slice(0, 5)} ${d.slice(5)}`,
  (d) => `+91 ${d.slice(0, 5)} ${d.slice(5)}`,
  (d) => `0${d}`,
  (d) => `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`
);

const formattedPhoneArb = fc.tuple(basePhoneArb, formatArb).map(([base, fmt]) => ({ base, text: fmt(base) }));

// parentPhone2 is often absent (null or empty), otherwise any formatted number.
const secondPhoneArb = fc.oneof(
  { weight: 1, arbitrary: fc.constant(null) },
  { weight: 1, arbitrary: fc.constant({ base: null, text: '' }) },
  { weight: 3, arbitrary: formattedPhoneArb }
);

const studentsArb = fc.array(
  fc.record({
    phone: formattedPhoneArb,
    phone2: secondPhoneArb,
    busId: fc.option(fc.constantFrom(...BUS_POOL), { nil: null, freq: 4 }),
  }),
  { maxLength: 12 }
);

const driversArb = fc.array(
  fc.record({ phone: formattedPhoneArb, busId: fc.option(fc.constantFrom(...BUS_POOL), { nil: null }) }),
  { maxLength: 5 }
);

// Parent phone either carried on the JWT payload or looked up from User by id.
const scenarioArb = fc.record({
  parentPhone: formattedPhoneArb,
  phoneInPayload: fc.boolean(),
  students: studentsArb,
  drivers: driversArb,
});

describe('Property 4: Parent access and room isolation', () => {
  test('canViewBus and roomsForUser for a PARENT reflect exactly their children\'s buses', async () => {
    await fc.assert(
      fc.asyncProperty(scenarioArb, async ({ parentPhone, phoneInPayload, students, drivers }) => {
        const studentRows = students.map((s, i) => ({
          id: `stu-${i}`,
          name: `Student ${i}`,
          parentPhone: s.phone.text,
          parentPhone2: s.phone2 ? s.phone2.text : null,
          busId: s.busId,
        }));
        const driverRows = drivers.map((d, i) => ({ id: `drv-${i}`, phone: d.phone.text, busId: d.busId }));
        const users = [{ id: 'parent-1', role: 'PARENT', phone: parentPhone.text }];
        const access = createAccessService(fakePrisma({ users, students: studentRows, drivers: driverRows }));

        const parent = phoneInPayload
          ? { id: 'parent-1', role: 'PARENT', phone: parentPhone.text }
          : { id: 'parent-1', role: 'PARENT' };

        // Oracle: children are students whose first or second parent number
        // was generated from the parent's base number.
        const isChild = (s) => s.phone.base === parentPhone.base || (s.phone2 && s.phone2.base === parentPhone.base);
        const children = students.filter(isChild);
        const expectedBuses = new Set(children.map((s) => s.busId).filter(Boolean));

        // getParentStudents returns exactly those children.
        const got = await access.getParentStudents(parent);
        const expectedIds = studentRows.filter((_, i) => isChild(students[i])).map((s) => s.id);
        expect(got.map((s) => s.id).sort()).toEqual(expectedIds.sort());

        // canViewBus iff a child rides the bus; unknown buses are always denied.
        for (const busId of [...BUS_POOL, 'bus-unknown']) {
          expect(await access.canViewBus(parent, busId)).toBe(expectedBuses.has(busId));
        }

        // roomsForUser is exactly the children's bus rooms, no duplicates, no 'admins'.
        const rooms = await access.roomsForUser(parent);
        expect(new Set(rooms).size).toBe(rooms.length);
        expect(rooms).not.toContain('admins');
        expect([...rooms].sort()).toEqual([...expectedBuses].map((b) => `bus_${b}`).sort());
      }),
      { numRuns: 200 }
    );
  });
});

// Conductor access is not part of the Property 4 statement, so it is covered by
// example tests: a conductor sees only its assigned bus (Requirements 3.9, 4.2).
describe('Conductor access and rooms (examples)', () => {
  const conductors = [
    { id: 'c-1', phone: '+91 96800 02257', busId: 'bus-2' },
    { id: 'c-2', phone: '9876543210', busId: null },
    // Two rows share a number; the row with a bus wins.
    { id: 'c-3a', phone: '912345678 0', busId: null },
    { id: 'c-3b', phone: '+91-91234-56780', busId: 'bus-4' },
  ];
  const students = [
    { id: 's-1', parentPhone: '9680002257', parentPhone2: null, busId: 'bus-1' },
  ];
  const users = [{ id: 'cu-1', role: 'CONDUCTOR', phone: '9680002257' }];
  const access = createAccessService(fakePrisma({ users, conductors, students }));

  const cases = [
    { name: 'assigned conductor (phone on payload)', user: { id: 'x', role: 'CONDUCTOR', phone: '919680002257' }, bus: 'bus-2' },
    { name: 'assigned conductor (phone looked up by id)', user: { id: 'cu-1', role: 'CONDUCTOR' }, bus: 'bus-2' },
    { name: 'conductor without a bus', user: { id: 'x', role: 'CONDUCTOR', phone: '98765 43210' }, bus: null },
    { name: 'duplicate rows prefer the assigned one', user: { id: 'x', role: 'CONDUCTOR', phone: '9123456780' }, bus: 'bus-4' },
    { name: 'no conductor row', user: { id: 'x', role: 'CONDUCTOR', phone: '7000000001' }, bus: null },
  ];

  test.each(cases)('$name: rooms are exactly its bus room and canViewBus only that bus', async ({ user, bus }) => {
    const rooms = await access.roomsForUser(user);
    expect(rooms).toEqual(bus ? [`bus_${bus}`] : []);
    for (const busId of [...BUS_POOL, 'bus-unknown']) {
      expect(await access.canViewBus(user, busId)).toBe(busId === bus);
    }
  });

  test('a CONDUCTOR never gets parent access through a matching student phone', async () => {
    const user = { id: 'cu-1', role: 'CONDUCTOR' };
    expect(await access.getParentStudents(user)).toEqual([]);
    expect(await access.canViewBus(user, 'bus-1')).toBe(false);
  });
});

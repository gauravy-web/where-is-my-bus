// Example tests for the School_Sheet importer pure functions (Requirement 17).
const {
  normalizeHeader,
  mapHeaders,
  cellToText,
  parseLatLng,
  normalizeImportPhone,
  parseRows,
  findConflicts,
  validateOrders,
  findDuplicateRollNumbers,
  buildPlan,
} = require('../src/services/schoolSheetImporter');

// The exact header row of the school's sample sheet.
const SAMPLE_HEADERS = [
  'Serial Number',
  'Name of the Student',
  'Roll Number',
  "Father's Name",
  "Mother's Name",
  'Parent Contact Number 1',
  'Parent Contact Number 2',
  'Bus Alloted',
  'Bus Number',
  'Driver Name',
  'Assistant Driver Name',
  'Pick up Location With (Coordinates From Google Map)',
  'Drop Location with (Coordinates From Google Map)',
  'School Name',
  'Driver Contact Number',
  'Assistant Driver Contact Number',
  'School Authorities Contact Number',
  'Pick up order',
  'Drop Order',
];

// Sample-layout rows (sheet rows 2..4) with numeric phone cells, a numeric Roll
// Number on row 3, and a different driver/assistant phone on row 4.
function sampleRows() {
  return [
    [1, 'Rahul Sharma', 'KPS-101', 'Ramesh', 'Sita', 9876543210, '', 5, 'RJ 37 PJ 5689', 'kalu', 'Rohan',
      '21.244718, 81.334927', '21.244718, 81.334927', 'Krishna Public School', 9111111111, 9222222222, 9333333333, 1, 2],
    [2, 'Priya Verma', 12345685, 'Mohan', 'Gita', 9876500001, 9876500002, 5, 'RJ 37 PJ 5689', 'kalu', 'Rohan',
      '21.250001, 81.330002', '21.250001,81.330002', 'Krishna Public School', 9111111111, 9222222222, 9333333333, 2, 3],
    [3, 'Amit Kumar', 'KPS-103', 'Suresh', 'Lata', '+91 98765-00003', '', 5, 'RJ 37 PJ 5689', 'kalu', 'Rohan',
      '21.260000, 81.320000', '21.260000, 81.320000', 'Krishna Public School', 9444444444, 9555555555, 9333333333, 3, 1],
  ];
}

function parseSample() {
  const { fieldByColumn, missing } = mapHeaders(SAMPLE_HEADERS);
  const parsed = parseRows(sampleRows(), fieldByColumn, { headerRowNumber: 1 });
  return { ...parsed, missing };
}

const ALL_FIELDS = [
  'serialNo', 'name', 'rollNo', 'fatherName', 'motherName', 'parentPhone1', 'parentPhone2', 'busLabel', 'busNo',
  'driverName', 'conductorName', 'pickupLocation', 'dropLocation', 'schoolName', 'driverPhone', 'conductorPhone',
  'schoolPhone', 'pickupOrder', 'dropOrder',
];

describe('normalizeHeader / mapHeaders', () => {
  test('normalizeHeader lowercases and strips everything but [a-z0-9]', () => {
    expect(normalizeHeader("  Father's   Name ")).toBe('fathersname');
    expect(normalizeHeader('Pick up Location With (Coordinates From Google Map)'))
      .toBe('pickuplocationwithcoordinatesfromgooglemap');
    expect(normalizeHeader(null)).toBe('');
    expect(normalizeHeader(undefined)).toBe('');
  });

  test('maps every exact sample header to its field with nothing missing', () => {
    const { fieldByColumn, missing, duplicates } = mapHeaders(SAMPLE_HEADERS);
    expect(missing).toEqual([]);
    expect(duplicates).toEqual([]);
    const expected = {};
    ALL_FIELDS.forEach((f, i) => { expected[i] = f; });
    expect(fieldByColumn).toEqual(expected);
  });

  test('tolerates casing/punctuation, accepts contact number aliases, ignores unknown and blank columns', () => {
    const { fieldByColumn, missing } = mapHeaders([
      '', 'NAME OF THE STUDENT', 'roll-number', 'Contact Number 1', 'contact number (2)', 'Notes',
      'bus  number', 'DRIVER name', 'Driver Contact No.', 'Driver Contact Number', 'pickup location',
      'Drop-Location', 'Pick-Up Order', 'drop order', null,
    ]);
    expect(fieldByColumn).toEqual({
      1: 'name', 2: 'rollNo', 3: 'parentPhone1', 4: 'parentPhone2', 6: 'busNo', 7: 'driverName',
      9: 'driverPhone', 10: 'pickupLocation', 11: 'dropLocation', 12: 'pickupOrder', 13: 'dropOrder',
    });
    expect(missing).toEqual([]);
  });

  test('reports missing required headers by human name', () => {
    const headers = SAMPLE_HEADERS.filter((h) => !['Roll Number', 'Drop Order', "Mother's Name"].includes(h));
    expect(mapHeaders(headers).missing).toEqual(['Roll Number', 'Drop Order']);
  });

  test('first matching column wins and later duplicates are reported', () => {
    const { fieldByColumn, duplicates } = mapHeaders(['Roll Number', 'Name of the Student', 'Roll No']);
    expect(fieldByColumn).toEqual({ 0: 'rollNo', 1: 'name' });
    expect(duplicates).toEqual([{ field: 'rollNo', header: 'Roll No', column: 2, firstColumn: 0 }]);
  });

  test('reads rich text header cells', () => {
    const { fieldByColumn } = mapHeaders([{ richText: [{ text: 'Roll ' }, { text: 'Number' }] }]);
    expect(fieldByColumn).toEqual({ 0: 'rollNo' });
  });
});

describe('cellToText', () => {
  test('primitives', () => {
    expect(cellToText(null)).toBe('');
    expect(cellToText(undefined)).toBe('');
    expect(cellToText(12345685)).toBe('12345685');
    expect(cellToText(9876543210)).toBe('9876543210');
    expect(cellToText(2.5)).toBe('2.5');
    expect(cellToText(' abc ')).toBe(' abc ');
    expect(cellToText(true)).toBe('true');
  });

  test('dates are rejected', () => {
    expect(cellToText(new Date('2024-01-01'))).toEqual({ error: expect.any(String) });
  });

  test('formula cells use the cached result only', () => {
    expect(cellToText({ formula: 'A1+1', result: 7 })).toBe('7');
    expect(cellToText({ formula: 'NOW()' })).toBe('');
    expect(cellToText({ sharedFormula: 'B2', result: 'x' })).toBe('x');
    expect(cellToText({ formula: 'TODAY()', result: new Date() })).toEqual({ error: expect.any(String) });
  });

  test('rich text, hyperlinks and error cells', () => {
    expect(cellToText({ richText: [{ text: 'Rahul ' }, { text: 'Sharma' }] })).toBe('Rahul Sharma');
    expect(cellToText({ text: 'Map', hyperlink: 'https://maps.example' })).toBe('Map');
    expect(cellToText({ error: '#N/A' })).toBe('');
  });
});

describe('parseLatLng', () => {
  test('accepts two comma-separated numbers with spaces', () => {
    expect(parseLatLng('21.244718, 81.334927')).toEqual({ lat: 21.244718, lng: 81.334927 });
    expect(parseLatLng(' -90 ,180 ')).toEqual({ lat: -90, lng: 180 });
  });

  test.each([
    [''], ['21.24'], ['21.24, 81.33, 5'], ['abc, 81'], ['21.24,'], ['91, 10'], ['10, -180.5'], ['Infinity, 1'],
  ])('rejects %p', (text) => {
    expect(parseLatLng(text)).toEqual({ error: expect.any(String) });
  });
});

describe('normalizeImportPhone', () => {
  test.each([
    [9876543210, '9876543210'],
    ['98765 43210', '9876543210'],
    ['+91 98765-43210', '9876543210'],
    ['919876543210', '9876543210'],
    ['09876543210', '9876543210'],
    ['(98765) 432.10', '9876543210'],
  ])('%p -> %p', (input, phone) => {
    expect(normalizeImportPhone(input)).toEqual({ phone });
  });

  test('empty values', () => {
    expect(normalizeImportPhone('')).toEqual({ empty: true });
    expect(normalizeImportPhone('   ')).toEqual({ empty: true });
    expect(normalizeImportPhone(null)).toEqual({ empty: true });
    expect(normalizeImportPhone(undefined)).toEqual({ empty: true });
  });

  test.each([['12345'], ['98765432101'], ['+1 9876543210'], ['98765abc10'], [98765.4321], [-9876543210]])(
    'rejects %p',
    (input) => {
      expect(normalizeImportPhone(input)).toEqual({ error: expect.any(String) });
    },
  );
});

describe('parseRows', () => {
  test('parses the sample rows with sheet row numbers, text roll numbers and normalized phones', () => {
    const { students, errors } = parseSample();
    expect(errors).toEqual([]);
    expect(students.map((s) => s.row)).toEqual([2, 3, 4]);
    expect(students[1].rollNo).toBe('12345685');
    expect(students[0]).toMatchObject({
      serialNo: '1',
      name: 'Rahul Sharma',
      rollNo: 'KPS-101',
      parentPhone1: '9876543210',
      parentPhone2: null,
      busLabel: '5',
      busNo: 'RJ 37 PJ 5689',
      driverName: 'kalu',
      conductorName: 'Rohan',
      pickup: { lat: 21.244718, lng: 81.334927 },
      drop: { lat: 21.244718, lng: 81.334927 },
      schoolName: 'Krishna Public School',
      driverPhone: '9111111111',
      pickupOrder: 1,
      dropOrder: 2,
    });
    expect(students[2].parentPhone1).toBe('9876500003');
    expect(students.map((s) => [s.pickupOrder, s.dropOrder])).toEqual([[1, 2], [2, 3], [3, 1]]);
  });

  test('skips fully blank rows while keeping sheet row numbers', () => {
    const { fieldByColumn } = mapHeaders(SAMPLE_HEADERS);
    const rows = sampleRows();
    rows.splice(1, 0, new Array(19).fill(''), []);
    const { students } = parseRows(rows, fieldByColumn, { headerRowNumber: 3 });
    expect(students.map((s) => s.row)).toEqual([4, 7, 8]);
  });

  test('reports required, phone, location, order and date errors per row', () => {
    const { fieldByColumn } = mapHeaders(SAMPLE_HEADERS);
    const row = sampleRows()[0];
    row[1] = '   ';               // name missing
    row[5] = '12345';             // bad parent phone
    row[11] = '21.24';            // bad pickup location
    row[17] = '1.5';              // non-integer pickup order
    row[13] = new Date();         // date in school name
    const { students, errors } = parseRows([row], fieldByColumn, { headerRowNumber: 1 });
    expect(students).toHaveLength(1);
    expect(errors.map((e) => [e.row, e.field])).toEqual(expect.arrayContaining([
      [2, 'name'], [2, 'parentPhone1'], [2, 'pickupLocation'], [2, 'pickupOrder'], [2, 'schoolName'],
    ]));
    expect(errors).toHaveLength(5);
    expect(students[0].pickupOrder).toBeNull();
    expect(students[0].pickup).toBeNull();
  });

  test('empty Parent Contact Number 2 and Assistant Driver Contact Number are accepted', () => {
    const { fieldByColumn } = mapHeaders(SAMPLE_HEADERS);
    const row = sampleRows()[0];
    row[6] = '';
    row[15] = null;
    const { students, errors } = parseRows([row], fieldByColumn);
    expect(errors).toEqual([]);
    expect(students[0].parentPhone2).toBeNull();
    expect(students[0].conductorPhone).toBeNull();
  });
});

describe('findConflicts', () => {
  test('sample row 4 driver and assistant phones are reported as two conflicts', () => {
    const conflicts = findConflicts(parseSample().students);
    expect(conflicts).toEqual([
      { field: 'driverPhone', values: [{ value: '9111111111', rows: [2, 3] }, { value: '9444444444', rows: [4] }] },
      { field: 'conductorPhone', values: [{ value: '9222222222', rows: [2, 3] }, { value: '9555555555', rows: [4] }] },
    ]);
  });

  test('names compare trimmed, whitespace-collapsed and case-insensitive; phones by normalized digits', () => {
    const rows = [
      { row: 2, driverName: 'Kalu  Ram', driverPhone: '+91 91111 11111' },
      { row: 3, driverName: ' kalu ram ', driverPhone: '9111111111' },
    ];
    expect(findConflicts(rows)).toEqual([]);
  });

  test('blank values conflict only when another row has a value', () => {
    expect(findConflicts([{ row: 2, conductorName: null }, { row: 3, conductorName: '' }])).toEqual([]);
    expect(findConflicts([{ row: 2, conductorName: 'Rohan' }, { row: 3, conductorName: '' }])).toEqual([
      { field: 'conductorName', values: [{ value: 'Rohan', rows: [2] }, { value: '', rows: [3] }] },
    ]);
  });
});

describe('validateOrders', () => {
  test('accepts exactly 1..N in any row order', () => {
    const rows = parseSample().students;
    expect(validateOrders(rows, 'pickupOrder')).toEqual({ ok: true, errors: [] });
    expect(validateOrders(rows, 'dropOrder')).toEqual({ ok: true, errors: [] });
    expect(validateOrders([], 'pickupOrder')).toEqual({ ok: true, errors: [] });
  });

  test('reports missing, non-integer, out-of-range, duplicate and gap values', () => {
    const rows = [
      { row: 2, pickupOrder: 1 },
      { row: 3, pickupOrder: 1 },
      { row: 4, pickupOrder: null },
      { row: 5, pickupOrder: 2.5 },
      { row: 6, pickupOrder: 9 },
    ];
    const { ok, errors } = validateOrders(rows, 'pickupOrder');
    expect(ok).toBe(false);
    expect(errors.map((e) => e.type).sort()).toEqual(['duplicate', 'gap', 'missing', 'notInteger', 'outOfRange']);
    expect(errors.find((e) => e.type === 'duplicate')).toMatchObject({ value: 1, rows: [2, 3] });
    expect(errors.find((e) => e.type === 'gap').values).toEqual([2, 3, 4, 5]);
  });

  test('accepts integer strings', () => {
    expect(validateOrders([{ dropOrder: '2' }, { dropOrder: '1' }], 'dropOrder').ok).toBe(true);
    expect(validateOrders([{ dropOrder: '0' }], 'dropOrder').ok).toBe(false);
  });
});

describe('findDuplicateRollNumbers', () => {
  test('reports trimmed roll numbers shared by rows', () => {
    const rows = [
      { row: 2, rollNo: '12345685' }, { row: 3, rollNo: ' 12345685 ' }, { row: 4, rollNo: 'A1' }, { row: 5, rollNo: null },
    ];
    expect(findDuplicateRollNumbers(rows)).toEqual([{ rollNo: '12345685', rows: [2, 3] }]);
    expect(findDuplicateRollNumbers(parseSample().students)).toEqual([]);
  });
});

describe('buildPlan', () => {
  function consistentSample() {
    const parsed = parseSample();
    // Make row 4 agree so the plan can be confirmed.
    parsed.students[2].driverPhone = '9111111111';
    parsed.students[2].conductorPhone = '9222222222';
    return parsed;
  }

  test('sample sheet: stops follow the sheet orders exactly and confirmation is blocked by the conflicts', () => {
    const plan = buildPlan(parseSample(), {});
    expect(plan.canConfirm).toBe(false);
    expect(plan.conflicts.map((c) => c.field)).toEqual(['driverPhone', 'conductorPhone']);
    expect(plan.pickupStops.map((s) => s.name)).toEqual([
      'Rahul Sharma – pickup', 'Priya Verma – pickup', 'Amit Kumar – pickup',
    ]);
    expect(plan.pickupStops.map((s) => s.order)).toEqual([1, 2, 3]);
    expect(plan.dropStops.map((s) => s.name)).toEqual([
      'Amit Kumar – drop', 'Rahul Sharma – drop', 'Priya Verma – drop',
    ]);
    expect(plan.dropStops.map((s) => s.order)).toEqual([1, 2, 3]);
    expect(plan.pickupStops[1]).toMatchObject({ admissionNo: '12345685', lat: 21.250001, lng: 81.330002 });
  });

  test('a consistent sheet with no existing data creates everything and can be confirmed', () => {
    const plan = buildPlan(consistentSample(), {});
    expect(plan.blockers).toEqual([]);
    expect(plan.canConfirm).toBe(true);
    expect(plan.bus).toEqual({ action: 'create', busNo: 'RJ 37 PJ 5689', label: '5' });
    expect(plan.driver).toEqual({ action: 'create', name: 'kalu', phone: '9111111111' });
    expect(plan.conductor).toEqual({ action: 'create', name: 'Rohan', phone: '9222222222' });
    expect(plan.school).toEqual({ action: 'create', name: 'Krishna Public School', contactPhone: '9333333333' });
    expect(plan.students.map((s) => s.action)).toEqual(['create', 'create', 'create']);
    expect(plan.students[0]).toMatchObject({
      admissionNo: 'KPS-101', name: 'Rahul Sharma', fatherName: 'Ramesh', motherName: 'Sita',
      parentPhone: '9876543210', parentPhone2: null,
    });
  });

  test('matches existing bus, driver, conductor, school and students; lists students not in the sheet', () => {
    const existing = {
      busByNo: new Map([['RJ 37 PJ 5689', { id: 'bus1', busNo: 'RJ 37 PJ 5689', label: null }]]),
      drivers: [{ id: 'd1', name: 'Kalu', phone: '+919111111111', busId: null }],
      conductors: [{ id: 'c1', name: 'Rohan', phone: '9222222222', busId: 'bus1' }],
      school: { id: 'sch1', name: 'krishna public school', contactPhone: null },
      studentsByAdmissionNo: { 12345685: [{ id: 'st2', name: 'Priya', busId: 'bus1' }] },
      busStudents: [
        { id: 'st2', name: 'Priya', admissionNo: '12345685' },
        { id: 'st9', name: 'Old Student', admissionNo: 'KPS-999' },
      ],
      activeTrip: null,
    };
    const plan = buildPlan(consistentSample(), existing);
    expect(plan.canConfirm).toBe(true);
    expect(plan.bus).toMatchObject({ action: 'update', id: 'bus1', label: '5' });
    expect(plan.driver).toMatchObject({ action: 'update', id: 'd1' });
    expect(plan.conductor).toMatchObject({ action: 'update', id: 'c1' });
    expect(plan.school).toMatchObject({ action: 'update', id: 'sch1', contactPhone: '9333333333' });
    expect(plan.students.map((s) => [s.action, s.id])).toEqual([['create', undefined], ['update', 'st2'], ['create', undefined]]);
    expect(plan.notInSheet).toEqual([{ id: 'st9', name: 'Old Student', admissionNo: 'KPS-999' }]);
  });

  test('identical coordinates still give one stop per student per direction', () => {
    const parsed = consistentSample();
    parsed.students.forEach((s) => {
      s.pickup = { lat: 21.24, lng: 81.33 };
      s.drop = { lat: 21.24, lng: 81.33 };
    });
    const plan = buildPlan(parsed, {});
    expect(plan.pickupStops).toHaveLength(3);
    expect(plan.dropStops).toHaveLength(3);
    expect(plan.dropStops.map((s) => s.admissionNo)).toEqual(['KPS-103', 'KPS-101', '12345685']);
  });

  test.each([
    ['row errors', (p) => { p.errors = [{ row: 2, field: 'name', message: 'x' }]; }, {}],
    ['order errors', (p) => { p.students[0].dropOrder = 3; }, {}],
    ['duplicate roll numbers', (p) => { p.students[2].rollNo = 'KPS-101'; }, {}],
    ['missing headers', (p) => { p.missing = ['Drop Order']; }, {}],
    ['an active trip', () => {}, { activeTrip: { id: 't1' } }],
    ['ambiguous matches', () => {}, { studentsByAdmissionNo: { 'KPS-101': [{ id: 'a' }, { id: 'b' }] } }],
  ])('canConfirm is false with %s', (_label, mutate, existing) => {
    const parsed = consistentSample();
    mutate(parsed);
    const plan = buildPlan(parsed, existing);
    expect(plan.canConfirm).toBe(false);
    expect(plan.blockers.length).toBeGreaterThan(0);
  });

  test('ambiguous existing roll numbers are listed', () => {
    const plan = buildPlan(consistentSample(), {
      studentsByAdmissionNo: { 'KPS-101': [{ id: 'a', name: 'R1', busId: 'x' }, { id: 'b', name: 'R2', busId: 'y' }] },
    });
    expect(plan.ambiguous).toEqual([{
      admissionNo: 'KPS-101', row: 2, name: 'Rahul Sharma',
      matches: [{ id: 'a', name: 'R1', busId: 'x' }, { id: 'b', name: 'R2', busId: 'y' }],
    }]);
    expect(plan.students[0].action).toBe('ambiguous');
  });
});

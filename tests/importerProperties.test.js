// Property tests for the School_Sheet importer pure functions (Requirement 17).
// Pure functions only: no DB, no HTTP, no file system. Expectations come from
// small independent oracles written here, never from the function under test.
const fc = require('fast-check');
const {
  FIELD_LABELS,
  REQUIRED_FIELDS,
  HEADER_ALIASES,
  mapHeaders,
  parseRows,
  findConflicts,
  validateOrders,
  buildPlan,
  normalizeImportPhone,
  parseLatLng,
} = require('../src/services/schoolSheetImporter');

const RUNS = { numRuns: 200 };

// The exact header row of the school's sample sheet and the field of each column.
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
const SAMPLE_FIELDS = [
  'serialNo', 'name', 'rollNo', 'fatherName', 'motherName', 'parentPhone1', 'parentPhone2', 'busLabel', 'busNo',
  'driverName', 'conductorName', 'pickupLocation', 'dropLocation', 'schoolName', 'driverPhone', 'conductorPhone',
  'schoolPhone', 'pickupOrder', 'dropOrder',
];
const REQUIRED = new Set([
  'name', 'rollNo', 'parentPhone1', 'busNo', 'driverName', 'driverPhone',
  'pickupLocation', 'dropLocation', 'pickupOrder', 'dropOrder',
]);

const sortStrings = (xs) => xs.slice().sort();

// ── Property 26 ──────────────────────────────────────────────────────────────

// Test-side header key: lowercase letters and digits only.
const headerKey = (s) => String(s).toLowerCase().split('').filter((c) => /[a-z0-9]/.test(c)).join('');
const KNOWN_KEYS = new Set(Object.keys(HEADER_ALIASES));
const isKnownKey = (k) => KNOWN_KEYS.has(k) || k.startsWith('pickuplocation') || k.startsWith('droplocation');

const NOISE = ['', '', '', ' ', '  ', '-', '.', '(', ')', '()', "'", ' - ', '\t'];

// A header with random casing and punctuation/whitespace inserted between characters.
const headerVariantArb = (header) =>
  fc
    .tuple(
      fc.array(fc.boolean(), { minLength: header.length, maxLength: header.length }),
      fc.array(fc.constantFrom(...NOISE), { minLength: header.length + 1, maxLength: header.length + 1 })
    )
    .map(([upper, noise]) => {
      let out = noise[0];
      for (let i = 0; i < header.length; i += 1) {
        const c = header[i];
        out += (upper[i] ? c.toUpperCase() : c.toLowerCase()) + noise[i + 1];
      }
      return out;
    });

const EXTRA_WORDS = ['Remarks', 'Class', 'Section', 'Address', 'Blood Group', 'Notes', 'Bus', 'Name', 'Order', 'Pick up', 'Drop', ''];
const extraHeaderArb = fc
  .oneof(
    fc.constantFrom(...EXTRA_WORDS),
    fc.array(fc.constantFrom('a', 'x', 'q', 'Z', '7', ' ', '-', '#', '/'), { maxLength: 12 }).map((cs) => cs.join(''))
  )
  .chain((w) => headerVariantArb(w))
  .filter((h) => !isKnownKey(headerKey(h)));

describe('Property 26: Header mapping tolerance', () => {
  // Feature: live-tracking-fixed-routes, Property 26: Header mapping tolerance
  // **Validates: Requirements 17.2**
  test('every kept known header maps to its field and missing equals the dropped required headers', () => {
    const arb = fc
      .tuple(
        fc.tuple(...SAMPLE_HEADERS.map((h) => headerVariantArb(h))),
        fc.array(fc.boolean(), { minLength: SAMPLE_HEADERS.length, maxLength: SAMPLE_HEADERS.length }),
        fc.array(extraHeaderArb, { maxLength: 6 })
      )
      .chain(([variants, keep, extras]) => {
        const items = [
          ...variants.map((text, i) => ({ text, field: SAMPLE_FIELDS[i] })).filter((_, i) => keep[i]),
          ...extras.map((text) => ({ text, field: null })),
        ];
        return fc
          .shuffledSubarray(items, { minLength: items.length, maxLength: items.length })
          .map((row) => ({ row, keep }));
      });

    fc.assert(
      fc.property(arb, ({ row, keep }) => {
        const result = mapHeaders(row.map((c) => c.text));

        const expectedByColumn = {};
        row.forEach((c, col) => { if (c.field) expectedByColumn[col] = c.field; });
        expect(result.fieldByColumn).toEqual(expectedByColumn);

        const dropped = SAMPLE_FIELDS.filter((f, i) => !keep[i] && REQUIRED.has(f));
        expect(sortStrings(result.missing)).toEqual(sortStrings(dropped.map((f) => FIELD_LABELS[f])));
        expect(result.duplicates).toEqual([]);
      }),
      RUNS
    );
  });
});

// ── Property 27 ──────────────────────────────────────────────────────────────

// Oracle: integer value of an order cell, or null.
function oracleOrderInt(v) {
  if (typeof v === 'number') return Number.isInteger(v) ? v : null;
  if (typeof v === 'string') {
    const t = v.trim();
    if (t === '') return null;
    const body = t[0] === '+' || t[0] === '-' ? t.slice(1) : t;
    if (body === '' || body.split('').some((c) => c < '0' || c > '9')) return null;
    return Number(t);
  }
  return null;
}

function oracleOrdersOk(values) {
  const ints = values.map(oracleOrderInt);
  if (ints.some((x) => x === null)) return false;
  const sorted = ints.slice().sort((a, b) => a - b);
  return sorted.every((x, i) => x === i + 1);
}

// Present a valid integer either as a number or as an integer string.
const asCellArb = (n) =>
  fc.constantFrom(n, String(n), ` ${n} `, `+${n}`, `0${n}`);

const NON_INTEGERS = [2.5, '2.5', 'abc', 'one', NaN, Infinity, -Infinity, true, '1 2', '1e0', '#', {}];
const BLANKS = [null, undefined, '', '   '];

describe('Property 27: Order validation', () => {
  const permutationArb = fc
    .integer({ min: 0, max: 12 })
    .chain((n) => fc.shuffledSubarray(Array.from({ length: n }, (_, i) => i + 1), { minLength: n, maxLength: n }));

  const validArb = permutationArb.chain((perm) =>
    perm.length === 0 ? fc.constant([]) : fc.tuple(...perm.map(asCellArb))
  );

  const mutationArb = fc.oneof(
    fc.constantFrom(...BLANKS).map((v) => ({ kind: 'set', v })),
    fc.constantFrom(...NON_INTEGERS).map((v) => ({ kind: 'set', v })),
    fc.constantFrom(0, -1, -5).map((v) => ({ kind: 'set', v })),
    fc.integer({ min: 1, max: 5 }).map((k) => ({ kind: 'over', k })),
    fc.nat().map((j) => ({ kind: 'dup', j }))
  );

  const corruptedArb = validArb
    .filter((vals) => vals.length > 0)
    .chain((vals) =>
      fc
        .array(fc.tuple(fc.nat({ max: vals.length - 1 }), mutationArb), { minLength: 1, maxLength: 3 })
        .map((muts) => {
          const out = vals.slice();
          for (const [i, m] of muts) {
            if (m.kind === 'set') out[i] = m.v;
            else if (m.kind === 'over') out[i] = vals.length + m.k;
            else out[i] = out[m.j % out.length];
          }
          return out;
        })
    );

  const run = (values) => {
    const expected = oracleOrdersOk(values);
    for (const field of ['pickupOrder', 'dropOrder']) {
      const rows = values.map((v, i) => ({ row: i + 2, [field]: v }));
      const result = validateOrders(rows, field);
      expect(result.ok).toBe(expected);
      expect(result.errors.length === 0).toBe(expected);
    }
  };

  // Feature: live-tracking-fixed-routes, Property 27: Order validation
  // **Validates: Requirements 17.6**
  test('valid permutations of 1..N (numbers or integer strings) are accepted', () => {
    fc.assert(fc.property(validArb, (values) => {
      expect(oracleOrdersOk(values)).toBe(true);
      run(values);
    }), RUNS);
  });

  // Feature: live-tracking-fixed-routes, Property 27: Order validation
  // **Validates: Requirements 17.6**
  test('ok iff the values are integers forming exactly {1..N} (corrupted columns)', () => {
    fc.assert(fc.property(fc.oneof(validArb, corruptedArb, corruptedArb), run), RUNS);
  });
});

// ── Property 28 ──────────────────────────────────────────────────────────────

const NAME_PARTS = ['Rahul', 'Priya', 'Amit', 'Sita', 'Kumar', 'Verma', 'Anil', 'Neha', 'Ravi', 'Asha', 'Dev'];
const nameArb = fc
  .array(fc.constantFrom(...NAME_PARTS), { minLength: 1, maxLength: 3 })
  .map((parts) => parts.join(' '));

const coordArb = fc.record({
  lat: fc.integer({ min: -90000000, max: 90000000 }).map((n) => n / 1e6),
  lng: fc.integer({ min: -180000000, max: 180000000 }).map((n) => n / 1e6),
});
const coordText = ({ lat, lng }) => `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

function permArb(n) {
  return fc.shuffledSubarray(Array.from({ length: n }, (_, i) => i + 1), { minLength: n, maxLength: n });
}

// A full sample-layout sheet with valid, consistent bus-level values.
const sheetArb = fc
  .integer({ min: 1, max: 10 })
  .chain((n) =>
    fc.record({
      names: fc.array(nameArb, { minLength: n, maxLength: n }),
      rolls: fc.uniqueArray(fc.integer({ min: 1, max: 99999 }), { minLength: n, maxLength: n }),
      rollAsNumber: fc.array(fc.boolean(), { minLength: n, maxLength: n }),
      pickupOrders: permArb(n),
      dropOrders: permArb(n),
      coordMode: fc.constantFrom('random', 'identical', 'anti'),
      pickups: fc.array(coordArb, { minLength: n, maxLength: n }),
      drops: fc.array(coordArb, { minLength: n, maxLength: n }),
      shared: coordArb,
    })
  )
  .map((g) => {
    const n = g.names.length;
    const students = g.names.map((name, i) => {
      let pickup = g.pickups[i];
      let drop = g.drops[i];
      if (g.coordMode === 'identical') {
        pickup = g.shared;
        drop = g.shared;
      } else if (g.coordMode === 'anti') {
        // Latitude rises as the order falls: sorting by coordinates would reverse the route.
        pickup = { lat: Number((80 - g.pickupOrders[i] * 5).toFixed(6)), lng: g.shared.lng };
        drop = { lat: Number((80 - g.dropOrders[i] * 5).toFixed(6)), lng: g.shared.lng };
      }
      const roll = g.rollAsNumber[i] ? g.rolls[i] : `KPS-${g.rolls[i]}`;
      return {
        name,
        roll,
        admissionNo: String(roll),
        pickup,
        drop,
        pickupOrder: g.pickupOrders[i],
        dropOrder: g.dropOrders[i],
      };
    });
    const cells = students.map((s, i) => [
      i + 1, s.name, s.roll, 'Father', 'Mother', 9876500000 + i, '', 5, 'RJ 37 PJ 5689', 'kalu', 'Rohan',
      coordText(s.pickup), coordText(s.drop), 'Krishna Public School', 9111111111, 9222222222, 9333333333,
      s.pickupOrder, s.dropOrder,
    ]);
    return { n, students, cells };
  });

describe('Property 28: Stop plan follows sheet orders exactly', () => {
  // Feature: live-tracking-fixed-routes, Property 28: Stop plan follows sheet orders exactly
  // **Validates: Requirements 17.12, 17.13, 5.3**
  test('pickupStops/dropStops follow Pick up order / Drop Order, one stop per student per direction', () => {
    fc.assert(
      fc.property(sheetArb, ({ n, students, cells }) => {
        const { fieldByColumn, missing } = mapHeaders(SAMPLE_HEADERS);
        const parsed = parseRows(cells, fieldByColumn, { headerRowNumber: 1 });
        expect(parsed.errors).toEqual([]);
        const plan = buildPlan({ ...parsed, missing });
        expect(plan.canConfirm).toBe(true);

        const check = (stops, orderKey, locKey, suffix) => {
          // Oracle: place each student at index order-1.
          const expected = new Array(n);
          for (const s of students) expected[s[orderKey] - 1] = s;

          expect(stops).toHaveLength(n);
          expect(stops.map((st) => st.admissionNo)).toEqual(expected.map((s) => s.admissionNo));
          expect(stops.map((st) => st.order)).toEqual(Array.from({ length: n }, (_, i) => i + 1));
          expect(new Set(stops.map((st) => st.admissionNo)).size).toBe(n);
          stops.forEach((st, i) => {
            const s = expected[i];
            expect(st.name).toBe(`${s.name} – ${suffix}`);
            expect(st.name.endsWith(` – ${suffix}`)).toBe(true);
            expect(st.lat).toBe(Number(s[locKey].lat.toFixed(6)));
            expect(st.lng).toBe(Number(s[locKey].lng.toFixed(6)));
          });
        };

        check(plan.pickupStops, 'pickupOrder', 'pickup', 'pickup');
        check(plan.dropStops, 'dropOrder', 'drop', 'drop');
      }),
      RUNS
    );
  });
});

// ── Property 29 ──────────────────────────────────────────────────────────────

const PHONE_CONFLICT_FIELDS = new Set(['driverPhone', 'conductorPhone', 'schoolPhone']);

const CONFLICT_POOLS = {
  busNo: ['RJ 37 PJ 5689', ' rj 37  pj 5689 ', 'RJ37PJ5689', 'MH 12 AB 1234', '', null],
  busLabel: [5, '5', ' 5 ', '6', 'Bus 5', 'bus  5', '', null],
  driverName: ['kalu', ' Kalu ', 'KALU', 'kalu  ram', 'Kalu Ram', 'Ramesh', '', '  ', null],
  conductorName: ['Rohan', 'rohan', ' ROHAN  ', 'Mohan', '', null],
  schoolName: ['Krishna Public School', 'krishna  public school', ' KRISHNA PUBLIC SCHOOL ', 'DPS', '', null],
  driverPhone: ['9111111111', '+91 91111-11111', '091111 11111', '91-9111111111', '(911) 111.1111', 9111111111,
    '9222222222', '12345', ' 12345 ', '', null],
  conductorPhone: ['9222222222', '+919222222222', '0 92222 22222', '9333333333', '', null],
  schoolPhone: ['9333333333', '93333-33333', 919333333333, '9444444444', '', null],
};
const CONFLICT_FIELD_LIST = Object.keys(CONFLICT_POOLS);

// Oracle: comparison key for a bus-level value ('' for blank).
function oracleConflictKey(field, raw) {
  if (raw === null || raw === undefined) return '';
  const text = String(raw);
  if (text.trim() === '') return '';
  if (PHONE_CONFLICT_FIELDS.has(field)) {
    const s = text.split('').filter((c) => !' \t-.()'.includes(c)).join('');
    const allDigits = (x) => x.length > 0 && x.split('').every((c) => c >= '0' && c <= '9');
    if (s.length === 10 && allDigits(s)) return s;
    if (s.length === 13 && s.startsWith('+91') && allDigits(s.slice(3))) return s.slice(3);
    if (s.length === 12 && s.startsWith('91') && allDigits(s)) return s.slice(2);
    if (s.length === 11 && s.startsWith('0') && allDigits(s)) return s.slice(1);
    return text.trim();
  }
  return text.trim().split(/\s+/).join(' ').toLowerCase();
}

// Partition of row numbers by key, as sorted arrays sorted by first row.
const partitionOf = (groups) =>
  groups.map((rows) => rows.slice().sort((a, b) => a - b)).sort((a, b) => a[0] - b[0]);

describe('Property 29: Bus-level conflicts', () => {
  const rowArb = fc.record(
    Object.fromEntries(CONFLICT_FIELD_LIST.map((f) => [f, fc.constantFrom(...CONFLICT_POOLS[f])]))
  );
  const rowsArb = fc
    .array(rowArb, { minLength: 1, maxLength: 8 })
    .map((rows) => rows.map((r, i) => ({ row: i + 2, ...r })));

  // Feature: live-tracking-fixed-routes, Property 29: Bus-level conflicts
  // **Validates: Requirements 17.5**
  test('a field is reported iff two rows have different normalized values', () => {
    fc.assert(
      fc.property(rowsArb, (rows) => {
        const conflicts = findConflicts(rows);
        const byField = new Map(conflicts.map((c) => [c.field, c]));
        expect(byField.size).toBe(conflicts.length);

        for (const field of CONFLICT_FIELD_LIST) {
          const groups = new Map();
          for (const r of rows) {
            const k = oracleConflictKey(field, r[field]);
            if (!groups.has(k)) groups.set(k, []);
            groups.get(k).push(r.row);
          }
          const hasNonBlank = [...groups.keys()].some((k) => k !== '');
          const expectConflict = hasNonBlank && groups.size > 1;
          expect(byField.has(field)).toBe(expectConflict);

          if (expectConflict) {
            const reported = byField.get(field);
            // Reported rows are exactly the input rows, grouped by normalized value.
            expect(partitionOf(reported.values.map((v) => v.rows)))
              .toEqual(partitionOf([...groups.values()]));
            // Each reported value is the value of a row in its group.
            for (const v of reported.values) {
              const keys = v.rows.map((rn) => oracleConflictKey(field, rows.find((r) => r.row === rn)[field]));
              expect(new Set(keys).size).toBe(1);
              expect(oracleConflictKey(field, v.value)).toBe(keys[0]);
            }
          }
        }
        // Only bus-level fields are ever reported.
        for (const c of conflicts) expect(CONFLICT_FIELD_LIST).toContain(c.field);
      }),
      RUNS
    );
  });
});

// ── Property 30 ──────────────────────────────────────────────────────────────

// Oracle for normalizeImportPhone on strings and numbers.
function oraclePhone(v) {
  if (v === null || v === undefined) return { empty: true };
  if (typeof v === 'number') {
    if (!Number.isSafeInteger(v) || v < 0) return { error: true };
    v = String(v);
  }
  if (v.trim() === '') return { empty: true };
  const s = v.split('').filter((c) => !' \t-.()'.includes(c)).join('');
  const digitsOnly = (x) => x.length > 0 && x.split('').every((c) => c >= '0' && c <= '9');
  let core = null;
  if (s.length === 10 && digitsOnly(s)) core = s;
  else if (s.length === 13 && s.slice(0, 3) === '+91' && digitsOnly(s.slice(3))) core = s.slice(3);
  else if (s.length === 12 && s.slice(0, 2) === '91' && digitsOnly(s)) core = s.slice(2);
  else if (s.length === 11 && s[0] === '0' && digitsOnly(s)) core = s.slice(1);
  return core === null ? { error: true } : { phone: core };
}

function expectPhone(input) {
  const expected = oraclePhone(input);
  const actual = normalizeImportPhone(input);
  if (expected.phone) {
    expect(actual).toEqual({ phone: expected.phone });
  } else if (expected.empty) {
    expect(actual).toEqual({ empty: true });
  } else {
    expect(typeof actual.error).toBe('string');
    expect(actual.phone).toBeUndefined();
  }
}

const SEPARATORS = ['', '', '', ' ', '-', '.', '(', ')', '  ', '\t'];

// Insert random separators between the characters of a string.
const withSeparatorsArb = (s) =>
  fc
    .array(fc.constantFrom(...SEPARATORS), { minLength: s.length + 1, maxLength: s.length + 1 })
    .map((seps) => seps[0] + s.split('').map((c, i) => c + seps[i + 1]).join(''));

const tenDigitsArb = fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 10, maxLength: 10 }).map((d) => d.join(''));

// Oracle for parseLatLng: exactly two comma-separated finite numbers within range.
function oracleLatLng(text) {
  const parts = String(text).split(',');
  if (parts.length !== 2) return null;
  const nums = parts.map((p) => {
    const t = p.trim();
    if (t === '') return NaN;
    // Only plain decimal notation (no hex/binary/Infinity words).
    if (/[^0-9eE+\-.]/.test(t) || /^[+-]?0[xXbBoO]/.test(t)) return NaN;
    return Number(t);
  });
  if (!nums.every(Number.isFinite)) return null;
  const [lat, lng] = nums;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

function expectLatLng(text) {
  const expected = oracleLatLng(text);
  const actual = parseLatLng(text);
  if (expected) expect(actual).toEqual(expected);
  else {
    expect(typeof actual.error).toBe('string');
    expect(actual.lat).toBeUndefined();
  }
}

const numText = (x) =>
  fc.constantFrom(String(x), x.toFixed(6), x.toFixed(2), x.toFixed(0));

describe('Property 30: Phone and coordinate normalization', () => {
  // Feature: live-tracking-fixed-routes, Property 30: Phone and coordinate normalization
  // **Validates: Requirements 17.7, 17.8**
  test('formatted 10-digit phones with optional +91 / 91 / 0 prefix normalize to the 10 digits', () => {
    const arb = fc
      .tuple(tenDigitsArb, fc.constantFrom('', '+91', '91', '0'))
      .chain(([core, prefix]) => withSeparatorsArb(prefix + core).map((text) => ({ core, text })));
    fc.assert(
      fc.property(arb, ({ core, text }) => {
        expect(normalizeImportPhone(text)).toEqual({ phone: core });
        expectPhone(text);
      }),
      RUNS
    );
  });

  // Feature: live-tracking-fixed-routes, Property 30: Phone and coordinate normalization
  // **Validates: Requirements 17.7, 17.8**
  test('normalizeImportPhone accepts exactly the 10-digit forms; blank -> empty; otherwise error', () => {
    const charArb = fc.constantFrom('0', '1', '9', '9', '8', '+', ' ', '-', '.', '(', ')', 'a', '/', '#', '\t');
    const arb = fc.oneof(
      fc.array(charArb, { maxLength: 16 }).map((cs) => cs.join('')),
      fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 8, maxLength: 14 }).map((d) => d.join('')),
      fc.tuple(fc.constantFrom('', '+91', '91', '0', '+9', '+1', '00', '091', '+091'), fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 9, maxLength: 11 }))
        .chain(([p, d]) => withSeparatorsArb(p + d.join(''))),
      fc.integer({ min: 0, max: 999999999999 }),
      fc.constantFrom(-9876543210, 9876543210.5, 1e21, NaN, Infinity),
      fc.constantFrom(null, undefined, '', '   ', '\t')
    );
    fc.assert(fc.property(arb, expectPhone), RUNS);
  });

  // Feature: live-tracking-fixed-routes, Property 30: Phone and coordinate normalization
  // **Validates: Requirements 17.7, 17.8**
  test('parseLatLng accepts in-range "lat, lng" text and returns those numbers', () => {
    const arb = fc
      .tuple(
        fc.double({ min: -90, max: 90, noNaN: true }),
        fc.double({ min: -180, max: 180, noNaN: true }),
        fc.constantFrom('', ' ', '  '),
        fc.constantFrom('', ' ', '  ')
      )
      .chain(([lat, lng, a, b]) =>
        fc.tuple(numText(lat), numText(lng)).map(([lt, lg]) => `${a}${lt}${a},${b}${lg}${b}`)
      )
      .filter((t) => oracleLatLng(t) !== null); // toFixed rounding can push e.g. 89.999999 -> '90.00' (still valid)
    fc.assert(
      fc.property(arb, (text) => {
        const [lt, lg] = text.split(',').map((p) => Number(p.trim()));
        expect(parseLatLng(text)).toEqual({ lat: lt, lng: lg });
        expectLatLng(text);
      }),
      RUNS
    );
  });

  // Feature: live-tracking-fixed-routes, Property 30: Phone and coordinate normalization
  // **Validates: Requirements 17.7, 17.8**
  test('parseLatLng rejects out-of-range and malformed text', () => {
    const outOfRange = fc.oneof(
      fc.tuple(fc.double({ min: 90, max: 1e6, minExcluded: true, noNaN: true }), fc.double({ min: -180, max: 180, noNaN: true })),
      fc.tuple(fc.double({ min: -1e6, max: -90, maxExcluded: true, noNaN: true }), fc.double({ min: -180, max: 180, noNaN: true })),
      fc.tuple(fc.double({ min: -90, max: 90, noNaN: true }), fc.double({ min: 180, max: 1e6, minExcluded: true, noNaN: true })),
      fc.tuple(fc.double({ min: -90, max: 90, noNaN: true }), fc.double({ min: -1e6, max: -180, maxExcluded: true, noNaN: true }))
    ).map(([lat, lng]) => `${lat}, ${lng}`);
    const malformed = fc.constantFrom(
      '', ' ', '21.24', '21.24 81.33', '21.24,', ',81.33', '21.24,,81.33', '1, 2, 3', 'abc, def',
      'NaN, 81.33', 'Infinity, 81.33', '21.24, -Infinity', '21.24N, 81.33E', '0x10, 5', '1e, 2', '., 2', '-, 2'
    );
    const randomText = fc
      .array(fc.constantFrom('0', '1', '9', '.', ',', '-', '+', ' ', 'e', 'E', '5'), { maxLength: 14 })
      .map((cs) => cs.join(''));
    fc.assert(
      fc.property(fc.oneof(outOfRange, malformed), (text) => {
        expect(oracleLatLng(text)).toBeNull();
        expectLatLng(text);
      }),
      RUNS
    );
    // Random text over number characters: accept iff the oracle accepts.
    fc.assert(fc.property(randomText, expectLatLng), RUNS);
  });
});

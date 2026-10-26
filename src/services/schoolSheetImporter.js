'use strict';

/**
 * School_Sheet importer: pure parsing and planning functions (Requirement 17).
 *
 * Everything in this module is side-effect free: no database, no HTTP, no
 * file system. Upload handling, the preview cache and `applyPlan` live
 * elsewhere (task 15.3) and build on these functions.
 *
 * Cell values are read only. Formula cells contribute their cached result and
 * are never evaluated (Requirement 17.3). Numeric cells are converted to text
 * so Roll Numbers and phone numbers keep their digits (Requirement 17.10).
 */

/** Human-readable header / field names used in messages. */
const FIELD_LABELS = Object.freeze({
  serialNo: 'Serial Number',
  name: 'Name of the Student',
  rollNo: 'Roll Number',
  fatherName: "Father's Name",
  motherName: "Mother's Name",
  parentPhone1: 'Parent Contact Number 1',
  parentPhone2: 'Parent Contact Number 2',
  busLabel: 'Bus Alloted',
  busNo: 'Bus Number',
  driverName: 'Driver Name',
  conductorName: 'Assistant Driver Name',
  pickupLocation: 'Pick up Location',
  dropLocation: 'Drop Location',
  schoolName: 'School Name',
  driverPhone: 'Driver Contact Number',
  conductorPhone: 'Assistant Driver Contact Number',
  schoolPhone: 'School Authorities Contact Number',
  pickupOrder: 'Pick up order',
  dropOrder: 'Drop Order',
});

/** Every field the importer understands, in sheet order. */
const HEADER_FIELDS = Object.freeze(Object.keys(FIELD_LABELS));

/** Fields that must have a header and a value on every row (Requirement 17.2). */
const REQUIRED_FIELDS = Object.freeze([
  'name',
  'rollNo',
  'parentPhone1',
  'busNo',
  'driverName',
  'driverPhone',
  'pickupLocation',
  'dropLocation',
  'pickupOrder',
  'dropOrder',
]);

/** Exact aliases, matched against `normalizeHeader(header)`. */
const HEADER_ALIASES = Object.freeze({
  serialnumber: 'serialNo',
  serialno: 'serialNo',
  nameofthestudent: 'name',
  studentname: 'name',
  rollnumber: 'rollNo',
  rollno: 'rollNo',
  fathersname: 'fatherName',
  fathername: 'fatherName',
  mothersname: 'motherName',
  mothername: 'motherName',
  parentcontactnumber1: 'parentPhone1',
  contactnumber1: 'parentPhone1',
  parentcontactnumber2: 'parentPhone2',
  contactnumber2: 'parentPhone2',
  busalloted: 'busLabel',
  busallotted: 'busLabel',
  busnumber: 'busNo',
  busno: 'busNo',
  drivername: 'driverName',
  assistantdrivername: 'conductorName',
  conductorname: 'conductorName',
  schoolname: 'schoolName',
  drivercontactnumber: 'driverPhone',
  assistantdrivercontactnumber: 'conductorPhone',
  conductorcontactnumber: 'conductorPhone',
  schoolauthoritiescontactnumber: 'schoolPhone',
  pickuporder: 'pickupOrder',
  droporder: 'dropOrder',
});

/** Prefix aliases: "Pick up Location With (Coordinates From Google Map)" etc. */
const HEADER_PREFIXES = Object.freeze([
  ['pickuplocation', 'pickupLocation'],
  ['droplocation', 'dropLocation'],
]);

/** Bus-level fields that must agree across all rows (Requirement 17.5). */
const CONFLICT_FIELDS = Object.freeze([
  'busNo',
  'busLabel',
  'driverName',
  'driverPhone',
  'conductorName',
  'conductorPhone',
  'schoolName',
  'schoolPhone',
]);

const PHONE_FIELDS = new Set(['parentPhone1', 'parentPhone2', 'driverPhone', 'conductorPhone', 'schoolPhone']);
const LOCATION_FIELDS = new Set(['pickupLocation', 'dropLocation']);
const ORDER_FIELDS = new Set(['pickupOrder', 'dropOrder']);

const DATE_ERROR = 'Dates are not allowed';

// ── Small helpers ────────────────────────────────────────────────────────────

function isDate(v) {
  return Object.prototype.toString.call(v) === '[object Date]';
}

function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}

/** Trim and collapse inner whitespace. */
function collapse(v) {
  return String(v ?? '').trim().replace(/\s+/g, ' ');
}

/** Last 10 digits of a stored phone, used to match existing rows. */
function phoneKey(v) {
  const digits = String(v ?? '').replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

/** Look up a key in a Map or plain object. */
function lookup(collection, key) {
  if (!collection || key === null || key === undefined) return undefined;
  if (collection instanceof Map) return collection.get(key);
  return Object.prototype.hasOwnProperty.call(collection, key) ? collection[key] : undefined;
}

function asArray(v) {
  if (v === null || v === undefined) return [];
  return Array.isArray(v) ? v : [v];
}

// ── Header mapping ───────────────────────────────────────────────────────────

/**
 * Normalize a header for matching: lowercase and keep only [a-z0-9].
 * @param {*} h
 * @returns {string}
 */
function normalizeHeader(h) {
  return String(h ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/** Field for a normalized header, or null when unknown. */
function fieldForHeader(normalized) {
  if (!normalized) return null;
  if (Object.prototype.hasOwnProperty.call(HEADER_ALIASES, normalized)) {
    return HEADER_ALIASES[normalized];
  }
  for (const [prefix, field] of HEADER_PREFIXES) {
    if (normalized.startsWith(prefix)) return field;
  }
  return null;
}

/**
 * Map a header row to fields.
 *
 * Unknown and blank columns are ignored. When two columns map to the same
 * field the first one wins and the later one is reported in `duplicates`.
 *
 * @param {Array<*>} headerRow cell values (strings or exceljs values)
 * @returns {{ fieldByColumn: Object<number, string>, missing: string[],
 *             duplicates: Array<{ field: string, header: string, column: number, firstColumn: number }> }}
 */
function mapHeaders(headerRow) {
  const fieldByColumn = {};
  const columnByField = {};
  const duplicates = [];
  const cells = Array.isArray(headerRow) ? headerRow : [];

  for (let col = 0; col < cells.length; col += 1) {
    const text = cellToText(cells[col]);
    const header = typeof text === 'string' ? text : '';
    const field = fieldForHeader(normalizeHeader(header));
    if (!field) continue;
    if (Object.prototype.hasOwnProperty.call(columnByField, field)) {
      duplicates.push({ field, header: header.trim(), column: col, firstColumn: columnByField[field] });
      continue;
    }
    columnByField[field] = col;
    fieldByColumn[col] = field;
  }

  const missing = REQUIRED_FIELDS
    .filter((field) => !Object.prototype.hasOwnProperty.call(columnByField, field))
    .map((field) => FIELD_LABELS[field]);

  return { fieldByColumn, missing, duplicates };
}

// ── Cell values ──────────────────────────────────────────────────────────────

/**
 * Convert an exceljs-style cell value to text without evaluating anything.
 *
 * - null/undefined -> ''
 * - number -> integral ? String(Math.trunc(n)) : String(n)
 * - string -> unchanged; boolean -> String(b)
 * - Date -> { error }
 * - formula `{ formula | sharedFormula, result }` -> cellToText(result)
 * - rich text `{ richText: [{ text }] }` -> joined text
 * - hyperlink `{ text, hyperlink }` -> text
 * - error cell `{ error }` -> ''
 *
 * @param {*} value
 * @returns {string | { error: string }}
 */
function cellToText(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') {
    return Number.isInteger(value) ? String(Math.trunc(value)) : String(value);
  }
  if (typeof value === 'boolean') return String(value);
  if (typeof value === 'bigint') return value.toString();
  if (isDate(value)) return { error: DATE_ERROR };
  if (typeof value === 'object') {
    if ('formula' in value || 'sharedFormula' in value) {
      // Cached result only; formulas are never evaluated.
      return 'result' in value ? cellToText(value.result) : '';
    }
    if (Array.isArray(value.richText)) {
      return value.richText.map((part) => (part && part.text != null ? String(part.text) : '')).join('');
    }
    if ('hyperlink' in value || 'text' in value) {
      return cellToText(value.text);
    }
    if ('error' in value) return '';
  }
  return '';
}

// ── Value parsers ────────────────────────────────────────────────────────────

const NUMBER_RE = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/;

/**
 * Parse "lat, lng" text.
 * @param {*} text
 * @returns {{ lat: number, lng: number } | { error: string }}
 */
function parseLatLng(text) {
  const raw = typeof text === 'number' ? String(text) : String(text ?? '');
  const parts = raw.split(',');
  if (parts.length !== 2) {
    return { error: 'Location must be "latitude, longitude"' };
  }
  const [latText, lngText] = parts.map((p) => p.trim());
  if (!NUMBER_RE.test(latText) || !NUMBER_RE.test(lngText)) {
    return { error: 'Location must be two comma-separated numbers' };
  }
  const lat = Number(latText);
  const lng = Number(lngText);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { error: 'Location must be two comma-separated numbers' };
  }
  if (lat < -90 || lat > 90) return { error: 'Latitude must be between -90 and 90' };
  if (lng < -180 || lng > 180) return { error: 'Longitude must be between -180 and 180' };
  return { lat, lng };
}

/**
 * Normalize a phone cell to 10 digits.
 *
 * Spaces, dashes, dots and parentheses are removed. "+91" or "91" followed by
 * 10 digits drops the country code; "0" followed by 10 digits drops the 0.
 *
 * @param {*} v number or string
 * @returns {{ phone: string } | { error: string } | { empty: true }}
 */
function normalizeImportPhone(v) {
  if (v === null || v === undefined) return { empty: true };
  let text;
  if (typeof v === 'number') {
    if (!Number.isSafeInteger(v) || v < 0) return { error: 'Phone number must be 10 digits' };
    text = String(v);
  } else if (typeof v === 'string') {
    text = v;
  } else {
    const converted = cellToText(v);
    if (typeof converted !== 'string') return { error: 'Phone number must be 10 digits' };
    text = converted;
  }
  if (text.trim() === '') return { empty: true };

  const stripped = text.replace(/[\s\-.()]/g, '');
  let digits;
  if (/^\+91\d{10}$/.test(stripped)) {
    digits = stripped.slice(3);
  } else if (/^91\d{10}$/.test(stripped)) {
    digits = stripped.slice(2);
  } else if (/^0\d{10}$/.test(stripped)) {
    digits = stripped.slice(1);
  } else {
    digits = stripped;
  }
  if (!/^\d{10}$/.test(digits)) return { error: 'Phone number must be 10 digits' };
  return { phone: digits };
}

/** Integer value of an order cell, or null when it is not an integer. */
function toOrderInt(v) {
  if (typeof v === 'number') return Number.isInteger(v) ? v : null;
  if (typeof v === 'string' && /^\s*[+-]?\d+\s*$/.test(v)) {
    const n = Number(v.trim());
    return Number.isSafeInteger(n) ? n : null;
  }
  return null;
}

// ── Rows ─────────────────────────────────────────────────────────────────────

/**
 * Parse data rows into ParsedRow objects.
 *
 * ParsedRow: { row, serialNo, name, rollNo, fatherName, motherName,
 *   parentPhone1, parentPhone2, busLabel, busNo, driverName, conductorName,
 *   pickupLocation, dropLocation, pickup: {lat,lng}|null, drop: {lat,lng}|null,
 *   schoolName, driverPhone, conductorPhone, schoolPhone, pickupOrder, dropOrder }
 *
 * Empty optional values are null. Valid phones are stored as 10 digits; an
 * invalid phone keeps its trimmed text and produces a row error. Orders are
 * integers or null (with a row error).
 *
 * @param {Array<Array<*>>} rows data rows (raw cell values or text)
 * @param {Object<number, string>} fieldByColumn from mapHeaders
 * @param {{ headerRowNumber?: number }} [options] 1-based sheet row of the header
 * @returns {{ students: object[], errors: Array<{ row: number, field: string, message: string }> }}
 */
function parseRows(rows, fieldByColumn, options = {}) {
  const headerRowNumber = Number.isInteger(options.headerRowNumber) ? options.headerRowNumber : 1;
  const columns = Object.keys(fieldByColumn || {}).map(Number);
  const students = [];
  const errors = [];

  (Array.isArray(rows) ? rows : []).forEach((cells, index) => {
    const rowNumber = headerRowNumber + 1 + index;
    const line = Array.isArray(cells) ? cells : [];
    const values = {};
    const dateFields = new Set();

    for (const col of columns) {
      const field = fieldByColumn[col];
      const text = cellToText(line[col]);
      if (typeof text === 'string') {
        values[field] = text;
      } else {
        values[field] = '';
        dateFields.add(field);
      }
    }

    const allBlank = dateFields.size === 0 && Object.values(values).every((t) => t.trim() === '');
    if (allBlank) return;

    const rowErrors = [];
    const addError = (field, message) => rowErrors.push({ row: rowNumber, field, message });
    for (const field of dateFields) addError(field, `${FIELD_LABELS[field]}: ${DATE_ERROR}`);

    const parsed = { row: rowNumber };
    for (const field of HEADER_FIELDS) {
      const text = values[field] ?? '';
      const blank = text.trim() === '';
      if (blank && REQUIRED_FIELDS.includes(field) && !dateFields.has(field)) {
        addError(field, `${FIELD_LABELS[field]} is required`);
      }

      if (PHONE_FIELDS.has(field)) {
        const result = normalizeImportPhone(text);
        if (result.phone) {
          parsed[field] = result.phone;
        } else if (result.error) {
          parsed[field] = text.trim();
          addError(field, `${FIELD_LABELS[field]}: ${result.error}`);
        } else {
          parsed[field] = null;
        }
      } else if (LOCATION_FIELDS.has(field)) {
        const key = field === 'pickupLocation' ? 'pickup' : 'drop';
        parsed[field] = blank ? null : text.trim();
        parsed[key] = null;
        if (!blank) {
          const loc = parseLatLng(text);
          if (loc.error) addError(field, `${FIELD_LABELS[field]}: ${loc.error}`);
          else parsed[key] = { lat: loc.lat, lng: loc.lng };
        }
      } else if (ORDER_FIELDS.has(field)) {
        parsed[field] = null;
        if (!blank) {
          const n = toOrderInt(text);
          if (n === null) addError(field, `${FIELD_LABELS[field]} must be a whole number`);
          else parsed[field] = n;
        }
      } else if (field === 'rollNo') {
        parsed[field] = blank ? null : text.trim();
      } else {
        parsed[field] = blank ? null : collapse(text);
      }
    }

    students.push(parsed);
    errors.push(...rowErrors);
  });

  return { students, errors };
}

// ── File-level checks ────────────────────────────────────────────────────────

/** Comparison key and display value for a bus-level field. */
function conflictValue(field, raw) {
  if (isBlank(raw)) return { key: '', value: '' };
  if (PHONE_FIELDS.has(field)) {
    const result = normalizeImportPhone(typeof raw === 'number' ? raw : String(raw));
    const value = result.phone || String(raw).trim();
    return { key: value, value };
  }
  const value = collapse(raw);
  return { key: value.toLowerCase(), value };
}

/**
 * Report bus-level fields whose rows disagree (Requirement 17.5).
 *
 * Blank values only count as a distinct value when another row has a
 * non-blank value for that field.
 *
 * @param {object[]} rows ParsedRow objects (each with `row`)
 * @returns {Array<{ field: string, values: Array<{ value: string, rows: number[] }> }>}
 */
function findConflicts(rows) {
  const list = Array.isArray(rows) ? rows : [];
  const conflicts = [];
  for (const field of CONFLICT_FIELDS) {
    const groups = new Map();
    list.forEach((r, i) => {
      const rowNumber = r && r.row !== undefined ? r.row : i + 1;
      const { key, value } = conflictValue(field, r ? r[field] : null);
      if (!groups.has(key)) groups.set(key, { value, rows: [] });
      groups.get(key).rows.push(rowNumber);
    });
    const nonBlank = [...groups.keys()].filter((k) => k !== '');
    if (nonBlank.length === 0) continue;
    if (groups.size > 1) {
      conflicts.push({ field, values: [...groups.values()] });
    }
  }
  return conflicts;
}

/**
 * Validate a Pick up order / Drop Order column (Requirement 17.6).
 *
 * ok iff every value is an integer and the values form exactly {1..N}.
 *
 * @param {object[]} rows
 * @param {'pickupOrder'|'dropOrder'} field
 * @returns {{ ok: boolean, errors: Array<{ field: string, type: string, message: string, row?: number, rows?: number[], value?: number, values?: number[] }> }}
 */
function validateOrders(rows, field) {
  const list = Array.isArray(rows) ? rows : [];
  const n = list.length;
  const label = FIELD_LABELS[field] || field;
  const errors = [];
  const rowsByValue = new Map();

  list.forEach((r, i) => {
    const rowNumber = r && r.row !== undefined ? r.row : i + 1;
    const raw = r ? r[field] : undefined;
    if (isBlank(raw)) {
      errors.push({ field, type: 'missing', row: rowNumber, message: `Row ${rowNumber}: ${label} is missing` });
      return;
    }
    const value = toOrderInt(raw);
    if (value === null) {
      errors.push({ field, type: 'notInteger', row: rowNumber, message: `Row ${rowNumber}: ${label} must be a whole number` });
      return;
    }
    if (value < 1 || value > n) {
      errors.push({
        field, type: 'outOfRange', row: rowNumber, value,
        message: `Row ${rowNumber}: ${label} ${value} is outside 1..${n}`,
      });
      return;
    }
    if (!rowsByValue.has(value)) rowsByValue.set(value, []);
    rowsByValue.get(value).push(rowNumber);
  });

  for (const [value, valueRows] of rowsByValue) {
    if (valueRows.length > 1) {
      errors.push({
        field, type: 'duplicate', value, rows: valueRows,
        message: `${label} ${value} is used by rows ${valueRows.join(', ')}`,
      });
    }
  }

  const absent = [];
  for (let v = 1; v <= n; v += 1) if (!rowsByValue.has(v)) absent.push(v);
  if (absent.length > 0) {
    errors.push({ field, type: 'gap', values: absent, message: `${label} is missing ${absent.join(', ')}` });
  }

  return { ok: errors.length === 0, errors };
}

/**
 * Roll Numbers used by more than one row (Requirement 17.11).
 * @param {object[]} rows
 * @returns {Array<{ rollNo: string, rows: number[] }>}
 */
function findDuplicateRollNumbers(rows) {
  const byRoll = new Map();
  (Array.isArray(rows) ? rows : []).forEach((r, i) => {
    if (!r || isBlank(r.rollNo)) return;
    const key = String(r.rollNo).trim();
    if (!byRoll.has(key)) byRoll.set(key, []);
    byRoll.get(key).push(r.row !== undefined ? r.row : i + 1);
  });
  return [...byRoll.entries()]
    .filter(([, rowNumbers]) => rowNumbers.length > 1)
    .map(([rollNo, rowNumbers]) => ({ rollNo, rows: rowNumbers }));
}

// ── Plan ─────────────────────────────────────────────────────────────────────

function firstNonBlank(rows, field) {
  for (const r of rows) if (r && !isBlank(r[field])) return r[field];
  return null;
}

function byOrder(field) {
  return (a, b) => {
    const x = Number.isInteger(a[field]) ? a[field] : Infinity;
    const y = Number.isInteger(b[field]) ? b[field] : Infinity;
    return x === y ? 0 : x < y ? -1 : 1;
  };
}

function buildStops(students, field, suffix) {
  const location = field === 'pickupOrder' ? 'pickup' : 'drop';
  return students
    .slice()
    .sort(byOrder(field)) // Array.prototype.sort is stable
    .map((s) => ({
      admissionNo: s.rollNo,
      studentName: s.name,
      name: `${s.name} – ${suffix}`,
      lat: s[location] ? s[location].lat : null,
      lng: s[location] ? s[location].lng : null,
      order: s[field],
      row: s.row,
    }));
}

/**
 * Build the import plan from parsed rows and the current DB state (pure).
 *
 * existing = {
 *   busByNo: Map|object keyed by busNo -> { id, busNo, label },
 *   drivers: [{ id, name, phone, busId }],
 *   conductors: [{ id, name, phone, busId }],
 *   school: { id, name, contactPhone } | null,
 *   studentsByAdmissionNo: Map|object keyed by trimmed admissionNo -> Student | Student[],
 *   busStudents: [{ id, name, admissionNo }],   // students currently on this bus
 *   activeTrip: object | null,
 * }
 *
 * Stops are ordered exactly by Pick up order / Drop Order, never by
 * coordinates, with one stop per student per direction.
 *
 * @param {{ students: object[], errors?: object[], missing?: string[] }} parsed
 * @param {object} [existing]
 */
function buildPlan(parsed, existing = {}) {
  const students = (parsed && Array.isArray(parsed.students)) ? parsed.students : [];
  const rowErrors = (parsed && Array.isArray(parsed.errors)) ? parsed.errors : [];
  const missingHeaders = (parsed && Array.isArray(parsed.missing)) ? parsed.missing : [];
  const ex = existing || {};

  const conflicts = findConflicts(students);
  const pickupCheck = validateOrders(students, 'pickupOrder');
  const dropCheck = validateOrders(students, 'dropOrder');
  const duplicateRollNumbers = findDuplicateRollNumbers(students);

  // Bus
  const busNo = firstNonBlank(students, 'busNo');
  const busLabel = firstNonBlank(students, 'busLabel');
  const existingBus = busNo ? asArray(lookup(ex.busByNo, busNo))[0] : undefined;
  const bus = busNo
    ? { action: existingBus ? 'update' : 'create', ...(existingBus ? { id: existingBus.id } : {}), busNo, label: busLabel }
    : null;

  // Driver
  const driverName = firstNonBlank(students, 'driverName');
  const driverPhone = firstNonBlank(students, 'driverPhone');
  let driver = null;
  if (driverName || driverPhone) {
    const match = driverPhone
      ? (ex.drivers || []).find((d) => d && phoneKey(d.phone) === phoneKey(driverPhone))
      : undefined;
    driver = { action: match ? 'update' : 'create', ...(match ? { id: match.id } : {}), name: driverName, phone: driverPhone };
  }

  // Conductor (needs a phone to upsert by phone)
  const warnings = [];
  const conductorName = firstNonBlank(students, 'conductorName');
  const conductorPhone = firstNonBlank(students, 'conductorPhone');
  let conductor = null;
  if (conductorPhone) {
    const match = (ex.conductors || []).find((c) => c && phoneKey(c.phone) === phoneKey(conductorPhone));
    conductor = {
      action: match ? 'update' : 'create',
      ...(match ? { id: match.id } : {}),
      name: conductorName || (match ? match.name : null),
      phone: conductorPhone,
    };
  } else if (conductorName) {
    warnings.push(`${FIELD_LABELS.conductorPhone} is empty; the conductor will not be saved`);
  }

  // School (upserted by name; coordinates are never set by the importer)
  const schoolName = firstNonBlank(students, 'schoolName');
  const schoolPhone = firstNonBlank(students, 'schoolPhone');
  let school = null;
  if (schoolName) {
    const current = ex.school;
    const same = current && collapse(current.name).toLowerCase() === collapse(schoolName).toLowerCase();
    school = {
      action: same ? 'update' : 'create',
      ...(same ? { id: current.id } : {}),
      name: schoolName,
      contactPhone: schoolPhone,
    };
  }

  // Students: matched globally by trimmed admissionNo (Roll Number)
  const ambiguous = [];
  const planStudents = students.map((s) => {
    const admissionNo = isBlank(s.rollNo) ? null : String(s.rollNo).trim();
    const matches = admissionNo ? asArray(lookup(ex.studentsByAdmissionNo, admissionNo)) : [];
    const fields = {
      admissionNo,
      name: s.name,
      fatherName: s.fatherName,
      motherName: s.motherName,
      parentPhone: s.parentPhone1,
      parentPhone2: s.parentPhone2,
      pickupOrder: s.pickupOrder,
      dropOrder: s.dropOrder,
      row: s.row,
    };
    if (matches.length > 1) {
      ambiguous.push({
        admissionNo,
        row: s.row,
        name: s.name,
        matches: matches.map((m) => ({ id: m.id, name: m.name, busId: m.busId })),
      });
      return { action: 'ambiguous', ...fields };
    }
    if (matches.length === 1) return { action: 'update', id: matches[0].id, ...fields };
    return { action: 'create', ...fields };
  });

  const pickupStops = buildStops(students, 'pickupOrder', 'pickup');
  const dropStops = buildStops(students, 'dropOrder', 'drop');

  // Students of this bus that the sheet does not mention (kept, links cleared)
  const sheetRolls = new Set(planStudents.map((s) => s.admissionNo).filter(Boolean));
  const notInSheet = (ex.busStudents || [])
    .filter((s) => s && !sheetRolls.has(String(s.admissionNo ?? '').trim()))
    .map((s) => ({ id: s.id, name: s.name, admissionNo: s.admissionNo }));

  // Blockers
  const blockers = [];
  if (missingHeaders.length > 0) blockers.push(`Missing required headers: ${missingHeaders.join(', ')}`);
  if (students.length === 0) blockers.push('The sheet has no student rows');
  if (rowErrors.length > 0) blockers.push(`${rowErrors.length} row error(s)`);
  for (const c of conflicts) {
    blockers.push(`Rows disagree on ${FIELD_LABELS[c.field]}: ${c.values.map((v) => `"${v.value}" (rows ${v.rows.join(', ')})`).join(' vs ')}`);
  }
  for (const e of [...pickupCheck.errors, ...dropCheck.errors]) blockers.push(e.message);
  for (const d of duplicateRollNumbers) blockers.push(`Roll Number ${d.rollNo} is used by rows ${d.rows.join(', ')}`);
  for (const a of ambiguous) blockers.push(`Roll Number ${a.admissionNo} matches ${a.matches.length} existing students`);
  if (ex.activeTrip) blockers.push('The bus has an active trip');

  return {
    bus,
    driver,
    conductor,
    school,
    students: planStudents,
    pickupStops,
    dropStops,
    notInSheet,
    ambiguous,
    errors: rowErrors,
    conflicts,
    orderErrors: { pickup: pickupCheck.errors, drop: dropCheck.errors },
    duplicateRollNumbers,
    warnings,
    canConfirm: blockers.length === 0,
    blockers,
  };
}

module.exports = {
  FIELD_LABELS,
  HEADER_FIELDS,
  HEADER_ALIASES,
  REQUIRED_FIELDS,
  CONFLICT_FIELDS,
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
};

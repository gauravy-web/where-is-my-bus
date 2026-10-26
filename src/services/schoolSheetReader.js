'use strict';

/**
 * Reads an uploaded School_Sheet (.xlsx or .csv) into raw rows (Requirement 17.1, 17.3).
 *
 * Only cell values are read. Formulas are never evaluated: exceljs exposes a
 * formula cell as `{ formula, result }` and `cellToText` (applied later by
 * mapHeaders / parseRows) uses the cached `result` only. Macro-enabled
 * workbooks are rejected.
 *
 * Row numbering: `rows[i]` is sheet row `headerRowNumber + 1 + i`. Blank rows
 * between the header and the last data row are kept as empty arrays so the
 * row numbers in parseRows' errors match the real sheet.
 */

const ExcelJS = require('exceljs');
const { parseCsv } = require('../utils/csv');
const { cellToText } = require('./schoolSheetImporter');

const MAX_DATA_ROWS = 500;
const ZIP_MAGIC = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
const MACRO_ENTRY = 'xl/vbaProject.bin';
const EMPTY_ROW = Object.freeze([]);

class ImportError extends Error {
  /**
   * @param {number} status HTTP status
   * @param {string} message user-facing message
   * @param {object} [details] extra JSON fields merged into the response body
   */
  constructor(status, message, details) {
    super(message);
    this.name = 'ImportError';
    this.status = status;
    if (details !== undefined) this.details = details;
  }
}

/** True when every cell converts to blank text (a Date error cell is not blank). */
function isBlankRow(cells) {
  if (!Array.isArray(cells)) return true;
  for (const v of cells) {
    const text = cellToText(v);
    if (typeof text !== 'string' || text.trim() !== '') return false;
  }
  return true;
}

/**
 * Split numbered rows into header + data rows.
 *
 * @param {Array<{ number: number, cells: Array<*> }>} numbered rows in sheet order
 * @returns {{ headerRow: Array<*>, rows: Array<Array<*>>, headerRowNumber: number }}
 */
function splitHeader(numbered) {
  const headerIndex = numbered.findIndex((r) => !isBlankRow(r.cells));
  if (headerIndex === -1) {
    throw new ImportError(400, 'The file is empty');
  }
  const header = numbered[headerIndex];
  const headerRowNumber = header.number;

  const data = [];
  let lastNumber = headerRowNumber;
  for (let i = headerIndex + 1; i < numbered.length; i += 1) {
    const r = numbered[i];
    if (isBlankRow(r.cells)) continue;
    data.push(r);
    if (data.length > MAX_DATA_ROWS) {
      throw new ImportError(400, `The sheet has more than ${MAX_DATA_ROWS} rows`);
    }
    lastNumber = r.number;
  }

  // Index i <-> sheet row headerRowNumber + 1 + i; gaps are empty rows.
  const rows = new Array(lastNumber - headerRowNumber).fill(EMPTY_ROW);
  for (const r of data) rows[r.number - headerRowNumber - 1] = r.cells;

  return { headerRow: header.cells, rows, headerRowNumber };
}

async function readXlsx(buffer) {
  if (buffer.length < ZIP_MAGIC.length || !buffer.subarray(0, ZIP_MAGIC.length).equals(ZIP_MAGIC)) {
    throw new ImportError(415, 'The file is not a valid .xlsx file');
  }
  // ZIP entry names are stored uncompressed, so a VBA project is visible here.
  if (buffer.includes(MACRO_ENTRY, 0, 'latin1')) {
    throw new ImportError(415, 'Macro-enabled workbooks are not allowed');
  }

  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.load(buffer);
  } catch (err) {
    throw new ImportError(400, 'Could not read the Excel file');
  }

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new ImportError(400, 'The file is empty');
  }

  const numbered = [];
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    // row.values is 1-based with index 0 empty; holes become undefined.
    const values = Array.isArray(row.values) ? row.values : [];
    numbered.push({ number: rowNumber, cells: Array.from(values.slice(1)) });
  });
  numbered.sort((a, b) => a.number - b.number);
  return splitHeader(numbered);
}

function readCsv(buffer) {
  if (buffer.includes(0)) {
    throw new ImportError(400, 'The CSV file must be plain text');
  }
  let text;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(buffer);
  } catch (err) {
    throw new ImportError(400, 'The CSV file must be UTF-8 text');
  }
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);

  let parsed;
  try {
    parsed = parseCsv(text);
  } catch (err) {
    throw new ImportError(400, 'Could not read the CSV file');
  }
  return splitHeader(parsed.map((cells, i) => ({ number: i + 1, cells })));
}

/**
 * Read an uploaded School_Sheet.
 *
 * @param {Buffer} buffer file bytes
 * @param {string} filename original file name (only the extension is used)
 * @returns {Promise<{ headerRow: Array<*>, rows: Array<Array<*>>, headerRowNumber: number }>}
 */
async function readSheet(buffer, filename) {
  if (!Buffer.isBuffer(buffer)) {
    throw new ImportError(400, 'No file uploaded');
  }
  const name = String(filename || '').trim().toLowerCase();
  if (name.endsWith('.xlsx')) return readXlsx(buffer);
  if (name.endsWith('.csv')) return readCsv(buffer);
  if (name.endsWith('.xlsm')) {
    throw new ImportError(415, 'Macro-enabled workbooks are not allowed');
  }
  throw new ImportError(415, 'Only .xlsx and .csv files are supported');
}

module.exports = { ImportError, readSheet, MAX_DATA_ROWS };

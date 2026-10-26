'use strict';

/**
 * Minimal RFC 4180 CSV parser used by the School_Sheet importer.
 *
 * - Fields are separated by commas; rows end with CRLF, LF or CR.
 * - A field that starts with a double quote is a quoted field. Inside it,
 *   commas and CR/LF are literal and "" is an escaped quote.
 * - A quote that appears in the middle of an unquoted field is kept as-is,
 *   and characters after a closing quote are appended to the field (lenient).
 * - A leading UTF-8 BOM is stripped. A final row terminator does not create
 *   an extra empty row. Cell values are NOT trimmed.
 *
 * @param {string} text
 * @returns {string[][]}
 */
function parseCsv(text) {
  if (typeof text !== 'string') {
    throw new TypeError('parseCsv expects a string');
  }
  const src = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const n = src.length;

  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  let fieldStart = true; // next char is the first char of a field
  let pending = false; // current row has consumed at least one char
  let i = 0;

  while (i < n) {
    const c = src[i];

    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i += 2;
        } else {
          inQuotes = false;
          i += 1;
        }
      } else {
        field += c;
        i += 1;
      }
      continue;
    }

    if (c === '\r' || c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      fieldStart = true;
      pending = false;
      i += c === '\r' && src[i + 1] === '\n' ? 2 : 1;
      continue;
    }

    pending = true;

    if (c === '"' && fieldStart) {
      inQuotes = true;
      fieldStart = false;
      i += 1;
      continue;
    }

    if (c === ',') {
      row.push(field);
      field = '';
      fieldStart = true;
      i += 1;
      continue;
    }

    fieldStart = false;
    field += c;
    i += 1;
  }

  if (inQuotes) {
    throw new Error('Unterminated quoted field');
  }
  if (pending) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

module.exports = { parseCsv };

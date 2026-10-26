// Tests for the RFC 4180 CSV parser used by the School_Sheet importer (Requirements 17.1, 17.3).
const fc = require('fast-check');
const { parseCsv } = require('../src/utils/csv');

describe('parseCsv examples', () => {
  test('simple rows with LF, CRLF and CR endings', () => {
    expect(parseCsv('a,b\nc,d')).toEqual([['a', 'b'], ['c', 'd']]);
    expect(parseCsv('a,b\r\nc,d\r\n')).toEqual([['a', 'b'], ['c', 'd']]);
    expect(parseCsv('a,b\rc,d\r')).toEqual([['a', 'b'], ['c', 'd']]);
    expect(parseCsv('a\r\nb\nc\rd')).toEqual([['a'], ['b'], ['c'], ['d']]);
  });

  test('quoted fields with commas, escaped quotes and embedded newlines', () => {
    const text = '"Sharma, Rahul","He said ""hi""","line1\r\nline2\nline3\rline4"\n';
    expect(parseCsv(text)).toEqual([['Sharma, Rahul', 'He said "hi"', 'line1\r\nline2\nline3\rline4']]);
    expect(parseCsv('""')).toEqual([['']]);
    expect(parseCsv('""""')).toEqual([['"']]);
  });

  test('strips a leading BOM and only the leading one', () => {
    expect(parseCsv('\uFEFFName,Roll\n1,2')).toEqual([['Name', 'Roll'], ['1', '2']]);
    expect(parseCsv('\uFEFF"x"')).toEqual([['x']]);
    expect(parseCsv('a,\uFEFFb')).toEqual([['a', '\uFEFFb']]);
  });

  test('does not trim cell values and keeps empty cells', () => {
    expect(parseCsv('  a , b  ,\t\n,,')).toEqual([['  a ', ' b  ', '\t'], ['', '', '']]);
    expect(parseCsv('" padded "')).toEqual([[' padded ']]);
  });

  test('trailing line terminator does not add an empty row; empty input yields no rows', () => {
    expect(parseCsv('a\n')).toEqual([['a']]);
    expect(parseCsv('a\r\n')).toEqual([['a']]);
    expect(parseCsv('')).toEqual([]);
    expect(parseCsv('\uFEFF')).toEqual([]);
    // A blank line in the middle is still a (single empty cell) row
    expect(parseCsv('a\n\nb')).toEqual([['a'], [''], ['b']]);
  });

  test('numeric-looking values stay as text', () => {
    expect(parseCsv('Roll Number,Phone\n007,9876543210\n')).toEqual([
      ['Roll Number', 'Phone'],
      ['007', '9876543210'],
    ]);
  });

  test('throws on an unterminated quoted field', () => {
    expect(() => parseCsv('a,"open\nstill open')).toThrow('Unterminated quoted field');
    expect(() => parseCsv('"')).toThrow('Unterminated quoted field');
    expect(() => parseCsv('"abc""')).toThrow('Unterminated quoted field');
  });

  test('rejects non-string input', () => {
    expect(() => parseCsv(undefined)).toThrow(TypeError);
    expect(() => parseCsv(Buffer.from('a'))).toThrow(TypeError);
  });
});

// Feature: live-tracking-fixed-routes, CSV round-trip
// **Validates: Requirements 17.1, 17.3**
describe('parseCsv round-trip property', () => {
  const needsQuoting = (cell) => /[",\r\n]/.test(cell) || cell.startsWith('\uFEFF');

  const serializeCell = (cell) => (needsQuoting(cell) ? `"${cell.replace(/"/g, '""')}"` : cell);

  // A row with a single empty cell must be quoted, otherwise it is an empty line.
  const serializeRow = (row) =>
    row.length === 1 && row[0] === '' ? '""' : row.map(serializeCell).join(',');

  const specialChar = fc.constantFrom('a', 'Z', '1', ' ', '\t', ',', '"', '\r', '\n', 'é', '–', '\uFEFF');
  const cellArb = fc.oneof(
    fc.string({ unit: specialChar, maxLength: 12 }),
    fc.string({ maxLength: 12 }),
    fc.string({ unit: 'grapheme', maxLength: 6 })
  );
  const rowsArb = fc.array(fc.array(cellArb, { minLength: 1, maxLength: 6 }), { maxLength: 8 });

  test('serialize with RFC 4180 quoting then parseCsv returns the same rows', () => {
    fc.assert(
      fc.property(
        rowsArb,
        fc.constantFrom('\r\n', '\n', '\r'),
        fc.boolean(),
        fc.boolean(),
        (rows, eol, trailingEol, bom) => {
          let text = rows.map(serializeRow).join(eol);
          if (trailingEol && rows.length > 0) text += eol;
          if (bom) text = '\uFEFF' + text;
          expect(parseCsv(text)).toEqual(rows);
        }
      ),
      { numRuns: 200 }
    );
  });
});

// Example tests for the stop-order dry-run analyzer (Requirement 5.11).
// Property 9 is covered separately in task 4.8.
const { analyzeOrders, formatReport } = require('../scripts/checkStopOrder');

const s = (busId, order, direction) => ({ id: `${busId}-${direction}-${order}`, busId, order, direction });

describe('analyzeOrders', () => {
  test('clean 1..N sequences are not reported', () => {
    const stops = [s('b1', 2, 'PICKUP'), s('b1', 1, 'PICKUP'), s('b1', 1, 'DROP'), s('b2', 1, 'PICKUP')];
    expect(analyzeOrders(stops)).toEqual([]);
    expect(analyzeOrders([])).toEqual([]);
  });

  test('reports duplicates and gaps per bus and direction', () => {
    const stops = [
      s('b1', 1, 'PICKUP'),
      s('b1', 1, 'PICKUP'),
      s('b1', 2, 'PICKUP'),
      s('b1', 1, 'DROP'),
      s('b1', 3, 'DROP'),
    ];
    expect(analyzeOrders(stops)).toEqual([
      { busId: 'b1', direction: 'DROP', count: 2, duplicates: [], gaps: [2], nonInteger: [] },
      { busId: 'b1', direction: 'PICKUP', count: 3, duplicates: [1], gaps: [3], nonInteger: [] },
    ]);
  });

  test('missing direction defaults to PICKUP', () => {
    const stops = [s('b1', 1, undefined), s('b1', 1, null), s('b1', 2, 'PICKUP')];
    expect(analyzeOrders(stops)).toEqual([
      { busId: 'b1', direction: 'PICKUP', count: 3, duplicates: [1], gaps: [3], nonInteger: [] },
    ]);
  });

  test('flags non-integer, non-finite and < 1 orders', () => {
    const stops = [s('b1', 1, 'PICKUP'), s('b1', 1.5, 'PICKUP'), s('b1', 0, 'PICKUP'), s('b1', NaN, 'PICKUP')];
    const [group] = analyzeOrders(stops);
    expect(group.count).toBe(4);
    expect(group.nonInteger).toEqual([1.5, 0, NaN]);
    expect(group.gaps).toEqual([2, 3, 4]);
    expect(group.duplicates).toEqual([]);
  });

  test('groups are sorted by busId then direction and input is not mutated', () => {
    const stops = [s('b2', 2, 'PICKUP'), s('b1', 2, 'PICKUP'), s('b1', 2, 'DROP')];
    const snapshot = JSON.parse(JSON.stringify(stops));
    const result = analyzeOrders(stops);
    expect(result.map((g) => [g.busId, g.direction])).toEqual([
      ['b1', 'DROP'],
      ['b1', 'PICKUP'],
      ['b2', 'PICKUP'],
    ]);
    expect(stops).toEqual(snapshot);
  });

  test('formatReport summarises findings', () => {
    expect(formatReport([], 3)).toContain('Nothing to report');
    const text = formatReport(analyzeOrders([s('b1', 1, 'DROP'), s('b1', 1, 'DROP')]), 2);
    expect(text).toContain('bus b1 / DROP');
    expect(text).toContain('duplicates: 1');
    expect(text).toContain('missing:    2');
  });
});

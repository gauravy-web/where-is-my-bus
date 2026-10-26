/**
 * Stop-order dry-run report (Requirement 5.11).
 *
 * Reports every (busId, direction) stop sequence whose `order` values are not
 * exactly 1..N (duplicates, gaps, or invalid values). READ ONLY: this script
 * never writes to the database and never auto-fixes anything.
 *
 * Usage (from backend/):  node scripts/checkStopOrder.js
 */

const DEFAULT_DIRECTION = 'PICKUP';

function compareStrings(a, b) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

function isValidOrder(value) {
  return Number.isInteger(value) && value >= 1;
}

/**
 * Pure analysis of stop orders. Does not mutate its input.
 *
 * @param {Array<{busId: string, direction?: string|null, order: number}>} stops
 * @returns {Array<{busId: string, direction: string, count: number,
 *   duplicates: number[], gaps: number[], nonInteger: number[]}>}
 *   One entry per group whose orders are not exactly 1..N, sorted by busId then direction.
 */
function analyzeOrders(stops) {
  const groups = new Map();

  for (const stop of stops || []) {
    const busId = String(stop.busId);
    const direction = stop.direction || DEFAULT_DIRECTION;
    const key = JSON.stringify([busId, direction]);
    if (!groups.has(key)) groups.set(key, { busId, direction, orders: [] });
    groups.get(key).orders.push(stop.order);
  }

  const report = [];

  for (const { busId, direction, orders } of groups.values()) {
    const count = orders.length;
    const seen = new Map();
    const nonInteger = [];

    for (const value of orders) {
      if (!isValidOrder(value)) {
        nonInteger.push(value);
        continue;
      }
      seen.set(value, (seen.get(value) || 0) + 1);
    }

    const duplicates = [...seen.entries()]
      .filter(([, n]) => n > 1)
      .map(([value]) => value)
      .sort((a, b) => a - b);

    const gaps = [];
    for (let i = 1; i <= count; i += 1) {
      if (!seen.has(i)) gaps.push(i);
    }

    // With N values, "exactly 1..N" holds iff there are no gaps, duplicates or invalid values.
    if (gaps.length || duplicates.length || nonInteger.length) {
      report.push({ busId, direction, count, duplicates, gaps, nonInteger });
    }
  }

  report.sort(
    (a, b) => compareStrings(a.busId, b.busId) || compareStrings(a.direction, b.direction)
  );
  return report;
}

function formatReport(report, totalStops) {
  const lines = [`Checked ${totalStops} stop(s).`];
  if (report.length === 0) {
    lines.push('All stop sequences are exactly 1..N. Nothing to report.');
    return lines.join('\n');
  }
  lines.push(`${report.length} ambiguous sequence(s) found (no changes were made):`);
  for (const g of report) {
    lines.push(`- bus ${g.busId} / ${g.direction} (${g.count} stop(s))`);
    if (g.duplicates.length) lines.push(`    duplicates: ${g.duplicates.join(', ')}`);
    if (g.gaps.length) lines.push(`    missing:    ${g.gaps.join(', ')}`);
    if (g.nonInteger.length) lines.push(`    invalid:    ${g.nonInteger.map(String).join(', ')}`);
  }
  return lines.join('\n');
}

async function main() {
  // Lazy require so importing this module (e.g. in tests) never connects to the DB.
  const prisma = require('../src/db');
  try {
    const stops = await prisma.stop.findMany({
      select: { id: true, busId: true, direction: true, order: true },
    });
    console.log(formatReport(analyzeOrders(stops), stops.length));
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('checkStopOrder failed:', err && err.message ? err.message : err);
      process.exit(1);
    });
}

module.exports = { analyzeOrders, formatReport };

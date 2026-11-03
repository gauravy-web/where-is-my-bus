/**
 * Verification script for stop-wise attendance database schema
 * Run this script to verify all required fields are present in the database
 * 
 * Usage: node verify-attendance-migration.js
 */

const prisma = require('./src/db');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function verifyAttendanceSchema() {
  log('\n=================================', colors.blue);
  log('Attendance Schema Verification', colors.bold + colors.blue);
  log('=================================\n', colors.blue);

  try {
    // Check table exists
    const tableExists = await prisma.$queryRaw`
      SELECT to_regclass('public."Attendance"')::text AS table_name;
    `;

    if (!tableExists[0].table_name) {
      log('✗ CRITICAL: Attendance table does not exist!', colors.red);
      return false;
    }

    log('✓ Attendance table exists', colors.green);

    // Get all columns
    const columns = await prisma.$queryRaw`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' 
        AND table_name = 'Attendance'
      ORDER BY ordinal_position;
    `;

    log('\n--- Column Structure ---\n', colors.blue);
    
    const requiredFields = {
      'id': { required: true, type: 'text', nullable: 'NO' },
      'busId': { required: true, type: 'text', nullable: 'NO' },
      'studentId': { required: true, type: 'text', nullable: 'NO' },
      'date': { required: true, type: 'text', nullable: 'NO' },
      'tripType': { required: true, type: 'text', nullable: 'NO' },
      'boarded': { required: true, type: 'boolean', nullable: 'YES' },
      'createdAt': { required: true, type: 'timestamp without time zone', nullable: 'NO' },
      'tripId': { required: true, type: 'text', nullable: 'YES' },
      'conductorId': { required: true, type: 'text', nullable: 'YES' },
      'checkedAt': { required: true, type: 'timestamp without time zone', nullable: 'YES' },
      'type': { required: true, type: 'text', nullable: 'YES' }
    };

    let allFieldsPresent = true;

    for (const [fieldName, specs] of Object.entries(requiredFields)) {
      const column = columns.find(c => c.column_name === fieldName);
      
      if (!column) {
        log(`✗ ${fieldName}: MISSING`, colors.red);
        allFieldsPresent = false;
      } else {
        const typeMatch = column.data_type.includes(specs.type) || 
                         specs.type.includes(column.data_type);
        const nullableMatch = column.is_nullable === specs.nullable;
        
        if (typeMatch && nullableMatch) {
          log(`✓ ${fieldName}: ${column.data_type}, nullable=${column.is_nullable}`, colors.green);
        } else {
          log(`⚠ ${fieldName}: ${column.data_type}, nullable=${column.is_nullable} (expected: ${specs.type}, ${specs.nullable})`, colors.yellow);
        }
      }
    }

    // Check unique constraints
    log('\n--- Unique Constraints ---\n', colors.blue);

    const constraints = await prisma.$queryRaw`
      SELECT
        con.conname AS constraint_name,
        array_agg(att.attname ORDER BY array_position(con.conkey, att.attnum)) AS column_names
      FROM pg_constraint con
      JOIN pg_class rel ON rel.oid = con.conrelid
      JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
      JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = ANY(con.conkey)
      WHERE nsp.nspname = 'public'
        AND rel.relname = 'Attendance'
        AND con.contype = 'u'
      GROUP BY con.conname;
    `;

    if (constraints.length === 0) {
      log('⚠ No unique constraints found', colors.yellow);
    } else {
      constraints.forEach(constraint => {
        log(`Constraint: ${constraint.constraint_name}`, colors.blue);
        log(`  Columns: ${constraint.column_names.join(', ')}`, colors.reset);
        
        // Check for the critical tripId + studentId + type constraint
        const cols = constraint.column_names;
        if (cols.includes('tripId') && cols.includes('studentId') && cols.includes('type')) {
          log('  ✓ This is the required (tripId, studentId, type) constraint', colors.green);
        }
      });
    }

    // Verify the specific unique constraint exists
    const hasRequiredConstraint = constraints.some(c => {
      const cols = c.column_names;
      return cols.includes('tripId') && cols.includes('studentId') && cols.includes('type');
    });

    log('', colors.reset);
    if (hasRequiredConstraint) {
      log('✓ Required unique constraint (tripId, studentId, type) is present', colors.green);
    } else {
      log('✗ Required unique constraint (tripId, studentId, type) is MISSING', colors.red);
      allFieldsPresent = false;
    }

    // Test basic query
    log('\n--- Functionality Test ---\n', colors.blue);

    const count = await prisma.attendance.count();
    log(`✓ Successfully queried Attendance table: ${count} records`, colors.green);

    // Summary
    log('\n=================================', colors.blue);
    if (allFieldsPresent) {
      log('✓ VERIFICATION PASSED', colors.bold + colors.green);
      log('All required fields and constraints are present', colors.green);
    } else {
      log('✗ VERIFICATION FAILED', colors.bold + colors.red);
      log('Some required fields or constraints are missing', colors.red);
    }
    log('=================================\n', colors.blue);

    return allFieldsPresent;

  } catch (error) {
    log(`\n✗ ERROR: ${error.message}`, colors.red);
    console.error(error);
    return false;
  }
}

async function checkMigrationHistory() {
  log('\n--- Migration History ---\n', colors.blue);

  try {
    const migrations = await prisma.$queryRaw`
      SELECT migration_name, started_at, finished_at, applied_steps_count
      FROM "_prisma_migrations"
      ORDER BY started_at DESC;
    `;

    if (migrations.length === 0) {
      log('No migrations found in database', colors.yellow);
    } else {
      log(`Found ${migrations.length} migration(s):\n`, colors.reset);
      migrations.forEach((migration, index) => {
        log(`${index + 1}. ${migration.migration_name}`, colors.blue);
        log(`   Started: ${migration.started_at}`, colors.reset);
        log(`   Finished: ${migration.finished_at || 'N/A'}`, colors.reset);
        log(`   Steps: ${migration.applied_steps_count || 0}`, colors.reset);
        log('', colors.reset);
      });
    }
  } catch (error) {
    log('⚠ Could not access migration history', colors.yellow);
    log(`  Reason: ${error.message}`, colors.yellow);
  }
}

async function main() {
  log('\nStop-wise Student Attendance - Database Schema Verification', colors.bold);
  log(`Timestamp: ${new Date().toISOString()}`, colors.reset);

  await checkMigrationHistory();
  const passed = await verifyAttendanceSchema();

  process.exitCode = passed ? 0 : 1;
}

main()
  .catch((err) => {
    log(`\n✗ Fatal error: ${err.message}`, colors.bold + colors.red);
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

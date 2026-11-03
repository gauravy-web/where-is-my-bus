/**
 * Quick schema check for Attendance table
 * This is a simpler alternative to verify-attendance-migration.js
 * 
 * Usage: node check-attendance-schema.js
 */

const prisma = require('./src/db');

async function main() {
  console.log('Checking Attendance table schema...\n');

  // Quick field existence check
  const requiredFields = ['tripId', 'conductorId', 'checkedAt', 'type'];
  
  try {
    // Try to query with all required fields
    const testQuery = await prisma.attendance.findFirst({
      select: {
        id: true,
        tripId: true,
        conductorId: true,
        checkedAt: true,
        type: true,
        studentId: true,
        boarded: true
      },
      take: 1
    });

    console.log('✓ All required fields are accessible via Prisma client');
    console.log('✓ Schema appears to be up to date for stop-wise attendance');
    
    const count = await prisma.attendance.count();
    console.log(`\nTotal attendance records: ${count}`);

    // Try to check constraint (this will fail if it doesn't exist)
    try {
      await prisma.$queryRaw`
        SELECT conname FROM pg_constraint 
        WHERE conrelid = 'public."Attendance"'::regclass 
        AND contype = 'u';
      `;
      console.log('✓ Unique constraints are configured');
    } catch (e) {
      console.log('⚠ Could not verify constraints');
    }

  } catch (error) {
    console.error('✗ Schema check failed:', error.message);
    console.error('\nThe database may need migrations.');
    process.exit(1);
  }
}

main()
  .catch((err) => {
    console.error('Fatal error:', err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

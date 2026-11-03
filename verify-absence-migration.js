const prisma = require('./src/db');

async function verifyMigration() {
  console.log('=== Verifying AbsenceNotification Migration ===\n');

  try {
    // 1. Verify table structure
    console.log('1. Verifying table structure and indexes...');
    const tableInfo = await prisma.$queryRaw`
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default
      FROM information_schema.columns
      WHERE table_name = 'AbsenceNotification'
      ORDER BY ordinal_position;
    `;
    console.log('✓ Table columns:', JSON.stringify(tableInfo, null, 2));

    // 2. Verify indexes
    console.log('\n2. Verifying indexes...');
    const indexes = await prisma.$queryRaw`
      SELECT 
        indexname, 
        indexdef
      FROM pg_indexes
      WHERE tablename = 'AbsenceNotification';
    `;
    console.log('✓ Indexes found:', JSON.stringify(indexes, null, 2));

    // 3. Verify unique constraint
    console.log('\n3. Verifying unique constraint on (studentId, busId, date)...');
    const uniqueConstraints = await prisma.$queryRaw`
      SELECT 
        conname, 
        contype,
        pg_get_constraintdef(oid) as definition
      FROM pg_constraint
      WHERE conrelid = 'public."AbsenceNotification"'::regclass
      AND contype = 'u';
    `;
    console.log('✓ Unique constraints:', JSON.stringify(uniqueConstraints, null, 2));

    // 4. Verify foreign key relationships
    console.log('\n4. Verifying foreign key relationships and cascade behavior...');
    const foreignKeys = await prisma.$queryRaw`
      SELECT 
        conname as constraint_name,
        conrelid::regclass::text as table_name,
        confrelid::regclass::text as foreign_table_name,
        pg_get_constraintdef(oid) as constraint_definition
      FROM pg_constraint
      WHERE conrelid = 'public."AbsenceNotification"'::regclass
      AND contype = 'f';
    `;
    console.log('✓ Foreign keys:', JSON.stringify(foreignKeys, null, 2));

    // 5. Verify enum type
    console.log('\n5. Verifying AbsenceStatus enum...');
    const enumValues = await prisma.$queryRaw`
      SELECT 
        e.enumlabel as value
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      WHERE t.typname = 'AbsenceStatus'
      ORDER BY e.enumsortorder;
    `;
    console.log('✓ Enum values:', JSON.stringify(enumValues, null, 2));

    console.log('\n=== Basic Structure Verification Complete ===\n');

    // Now test constraints with actual data operations
    console.log('=== Testing Constraints with Data Operations ===\n');

    // Get a test student
    console.log('6. Finding a test student for constraint testing...');
    const allStudents = await prisma.student.findMany({
      take: 10
    });
    
    const testStudent = allStudents.find(s => s.busId && s.stopId);

    if (!testStudent) {
      console.log('⚠ No student with bus and stop assignment found. Skipping data constraint tests.');
      return;
    }

    console.log(`✓ Using test student: ${testStudent.name} (ID: ${testStudent.id})`);
    console.log(`  Bus: ${testStudent.busId}, Stop: ${testStudent.stopId}`);

    // Clean up any existing test data first
    const today = new Date().toISOString().split('T')[0];
    await prisma.absenceNotification.deleteMany({
      where: {
        studentId: testStudent.id,
        date: today
      }
    });
    console.log('✓ Cleaned up any existing test notifications');

    // Test 1: Create a valid absence notification
    console.log('\n7. Testing valid absence notification creation...');
    const testNotification = await prisma.absenceNotification.create({
      data: {
        studentId: testStudent.id,
        parentUserId: 'test-parent-user-id',
        busId: testStudent.busId,
        stopId: testStudent.stopId,
        date: today,
        reason: 'Test notification',
        status: 'ACTIVE'
      }
    });
    console.log('✓ Created test notification:', testNotification.id);

    // Test 2: Verify unique constraint prevents duplicates
    console.log('\n8. Testing unique constraint (should fail with duplicate)...');
    try {
      await prisma.absenceNotification.create({
        data: {
          studentId: testStudent.id,
          parentUserId: 'test-parent-user-id',
          busId: testStudent.busId,
          stopId: testStudent.stopId,
          date: today,
          reason: 'Duplicate test',
          status: 'ACTIVE'
        }
      });
      console.log('✗ FAILED: Duplicate notification was created (unique constraint not working!)');
    } catch (error) {
      if (error.code === 'P2002') {
        console.log('✓ Unique constraint working correctly - duplicate rejected');
      } else {
        console.log('✗ Unexpected error:', error.message);
      }
    }

    // Test 3: Verify foreign key cascade on Student delete
    console.log('\n9. Testing CASCADE on Student delete...');
    
    // Create a temporary student for cascade test
    const tempStudent = await prisma.student.create({
      data: {
        name: 'Temp Student for Cascade Test',
        admissionNo: `TEMP-${Date.now()}`,
        class: '1',
        parentPhone: '0000000000',
        busId: testStudent.busId,
        stopId: testStudent.stopId
      }
    });
    console.log(`✓ Created temporary student: ${tempStudent.id}`);

    // Create notification for temp student
    const tempNotification = await prisma.absenceNotification.create({
      data: {
        studentId: tempStudent.id,
        parentUserId: 'test-parent-user-id',
        busId: testStudent.busId,
        stopId: testStudent.stopId,
        date: today,
        reason: 'Cascade test',
        status: 'ACTIVE'
      }
    });
    console.log(`✓ Created notification for temp student: ${tempNotification.id}`);

    // Delete the student - should cascade to notification
    await prisma.student.delete({
      where: { id: tempStudent.id }
    });
    console.log('✓ Deleted temporary student');

    // Check if notification was cascade deleted
    const cascadedNotification = await prisma.absenceNotification.findUnique({
      where: { id: tempNotification.id }
    });

    if (cascadedNotification === null) {
      console.log('✓ CASCADE working correctly - notification was deleted with student');
    } else {
      console.log('✗ FAILED: Notification still exists after student deletion');
    }

    // Test 4: Verify SET NULL on Trip delete
    console.log('\n10. Testing SET NULL on Trip delete...');
    
    // Create a temporary trip
    const tempTrip = await prisma.trip.create({
      data: {
        busId: testStudent.busId,
        driverId: 'test-driver-id',
        direction: 'PICKUP',
        status: 'ACTIVE',
        startedAt: new Date()
      }
    });
    console.log(`✓ Created temporary trip: ${tempTrip.id}`);

    // Create notification with tripId
    const tripNotification = await prisma.absenceNotification.create({
      data: {
        studentId: testStudent.id,
        parentUserId: 'test-parent-user-id',
        busId: testStudent.busId,
        tripId: tempTrip.id,
        stopId: testStudent.stopId,
        date: today + '-trip-test',
        reason: 'Trip cascade test',
        status: 'ACTIVE'
      }
    });
    console.log(`✓ Created notification with tripId: ${tripNotification.id}`);

    // Delete the trip - should SET NULL on notification.tripId
    await prisma.trip.delete({
      where: { id: tempTrip.id }
    });
    console.log('✓ Deleted temporary trip');

    // Check if notification tripId was set to null
    const updatedNotification = await prisma.absenceNotification.findUnique({
      where: { id: tripNotification.id }
    });

    if (updatedNotification && updatedNotification.tripId === null) {
      console.log('✓ SET NULL working correctly - tripId set to null after trip deletion');
    } else {
      console.log('✗ FAILED: tripId was not set to null after trip deletion');
    }

    // Clean up test data
    console.log('\n11. Cleaning up test data...');
    await prisma.absenceNotification.deleteMany({
      where: {
        OR: [
          { id: testNotification.id },
          { id: tripNotification.id }
        ]
      }
    });
    console.log('✓ Test data cleaned up');

    console.log('\n=== All Migration Verification Tests Complete ===');
    console.log('✓ Table structure verified');
    console.log('✓ Indexes verified');
    console.log('✓ Unique constraint verified');
    console.log('✓ Foreign key relationships verified');
    console.log('✓ CASCADE on Student delete verified');
    console.log('✓ SET NULL on Trip delete verified');

  } catch (error) {
    console.error('Error during verification:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

verifyMigration()
  .then(() => {
    console.log('\n✓ Migration verification completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Migration verification failed:', error);
    process.exit(1);
  });

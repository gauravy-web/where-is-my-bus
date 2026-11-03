const prisma = require('./src/db');
(async () => {
  try {
    console.log('🔧 Running SOS Alert Lifecycle migration...');
    await prisma.$executeRawUnsafe('ALTER TABLE "Emergency" ADD COLUMN IF NOT EXISTS "acknowledgedBy" TEXT');
    await prisma.$executeRawUnsafe('ALTER TABLE "Emergency" ADD COLUMN IF NOT EXISTS "acknowledgedAt" TIMESTAMP(6)');
    await prisma.$executeRawUnsafe('ALTER TABLE "Emergency" ADD COLUMN IF NOT EXISTS "resolvedBy" TEXT');
    await prisma.$executeRawUnsafe('ALTER TABLE "Emergency" ADD COLUMN IF NOT EXISTS "resolvedAt" TIMESTAMP(6)');
    await prisma.$executeRawUnsafe('ALTER TABLE "Emergency" ADD COLUMN IF NOT EXISTS "resolutionNote" TEXT');
    await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "Emergency_status_idx" ON "Emergency"("status")');
    await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "Emergency_busId_idx" ON "Emergency"("busId")');
    console.log('✅ Migration completed successfully!');
  } catch (e) {
    console.log('❌ Migration error:', e.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();

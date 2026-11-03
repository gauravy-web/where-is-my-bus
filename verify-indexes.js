const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();

async function verifyIndexes() {
  const result = await prisma.$queryRaw
    SELECT indexname, tablename
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND indexname LIKE '%busId%' OR indexname LIKE '%status%'
    ORDER BY tablename, indexname;
  ;
  
  console.log('📊 Database Indexes:');
  console.table(result);
  await prisma.$disconnect();
}

verifyIndexes().catch(console.error);

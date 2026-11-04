const { PrismaClient } = require('./generated/prisma');
const { getConfig } = require('./config/env');

// Optimized Prisma client with connection pooling for Neon
// Neon's pooler handles connection pooling at the proxy level
// Connection limit is configured via DATABASE_URL query parameter
getConfig();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
});

// Query timeout middleware (prevent long-running queries)
prisma.$use(async (params, next) => {
  const timeout = 10000; // 10 second timeout
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error(`Query timeout: ${params.model}.`)),
      timeout
    );
    if (timeoutId && typeof timeoutId.unref === 'function') {
      timeoutId.unref();
    }
  });

  try {
    return await Promise.race([next(params), timeoutPromise]);
  } catch (error) {
    console.error(`[Prisma] Query failed:`, {
      model: params.model,
      action: params.action,
      error: error.message,
    });
    throw error;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
});

// Graceful shutdown handler
async function disconnectPrisma() {
  await prisma.$disconnect();
  console.log('[Prisma] Database connection closed');
}

process.on('SIGINT', disconnectPrisma);
process.on('SIGTERM', disconnectPrisma);

module.exports = prisma;

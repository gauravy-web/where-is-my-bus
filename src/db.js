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
    ? ['error', 'warn']  // Reduced logging to avoid connection spam
    : ['error'],
});

// Add connection retry logic for Neon
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 3;

async function ensureConnection() {
  try {
    await prisma.$connect();
    reconnectAttempts = 0;
  } catch (error) {
    console.error('[Prisma] Connection failed:', error.message);
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      console.log(`[Prisma] Retrying connection (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return ensureConnection();
    }
    throw error;
  }
}

// Handle connection errors gracefully
prisma.$on('error', (e) => {
  console.error('[Prisma] Database error:', e);
  // Don't try to reconnect on every error, just log it
});

// Query timeout middleware (prevent long-running queries)
prisma.$use(async (params, next) => {
  const timeout = 10000; // 10 second timeout
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error(`Query timeout: ${params.model}.${params.action}`)),
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
  try {
    await prisma.$disconnect();
    console.log('[Prisma] Database connection closed gracefully');
  } catch (error) {
    console.error('[Prisma] Error during disconnect:', error.message);
  }
}

process.on('SIGINT', disconnectPrisma);
process.on('SIGTERM', disconnectPrisma);
process.on('beforeExit', disconnectPrisma);

module.exports = prisma;

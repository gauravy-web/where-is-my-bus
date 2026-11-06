const { PrismaClient } = require('./generated/prisma');
const { getConfig } = require('./config/env');

getConfig();

/**
 * Ensures DATABASE_URL has required pgbouncer=true parameter when using Neon's
 * connection pooler endpoint (-pooler). This prevents prepared statement conflicts
 * in transaction pooling mode.
 */
function sanitizeDatabaseUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return rawUrl;
  let url = rawUrl.trim();
  if (url.includes('-pooler.') && !url.includes('pgbouncer=true')) {
    url += (url.includes('?') ? '&' : '?') + 'pgbouncer=true';
  }
  return url;
}

// Singleton pattern to prevent multiple PrismaClient instances during development
const globalForPrisma = global;

function createPrismaClient() {
  const client = new PrismaClient({
    datasources: {
      db: {
        url: sanitizeDatabaseUrl(process.env.DATABASE_URL),
      },
    },
    log: [
      { emit: 'event', level: 'error' },
      { emit: 'stdout', level: 'warn' },
    ],
  });

  // Handle engine error events
  client.$on('error', (e) => {
    const msg = String(e && e.message ? e.message : e);
    // Neon's PgBouncer proxy cleanly terminates idle connections after an inactivity timeout.
    // Quaint surfaces this as 'Error in PostgreSQL connection: Error { kind: Closed, cause: None }'.
    // This is expected serverless behavior; Prisma re-opens connections on the next query.
    if (msg.includes('kind: Closed') || msg.includes('Error in PostgreSQL connection: Error { kind: Closed')) {
      if (process.env.DEBUG_PRISMA) {
        console.warn('[Prisma] Idle connection reaped by serverless pooler (will reconnect on next query)');
      }
      return;
    }
    console.error('[Prisma] Database error:', e);
  });

  // Retry middleware for transient connection drops (e.g. Neon compute cold start or idle reconnect)
  const TRANSIENT_CODES = new Set(['P1001', 'P1017', 'P2024']);

  function isTransientConnectionError(err) {
    if (!err) return false;
    if (err.code && TRANSIENT_CODES.has(err.code)) return true;
    const msg = String(err.message || '');
    return (
      msg.includes('kind: Closed') ||
      msg.includes('Connection closed') ||
      msg.includes('connection was closed') ||
      msg.includes('Connection terminated') ||
      msg.includes('terminating connection due to administrator command') ||
      msg.includes("Can't reach database server")
    );
  }

  client.$use(async (params, next) => {
    try {
      return await next(params);
    } catch (err) {
      if (isTransientConnectionError(err)) {
        // Wait 500ms for Neon compute / pooler to re-establish and retry once
        await new Promise((resolve) => setTimeout(resolve, 500));
        return await next(params);
      }
      throw err;
    }
  });

  return client;
}

const prisma = globalForPrisma.__prismaInstance || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__prismaInstance = prisma;
}

module.exports = prisma;

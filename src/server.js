// Entry point: loads config, creates the HTTP server around the Express app,
// attaches Socket.IO, connects Prisma and listens.
// getConfig() loads backend/.env (outside tests) and validates required keys.
const { getConfig } = require('./config/env');

const config = getConfig();

const http = require('http');
const { Server } = require('socket.io');

const app = require('./app');
const prisma = require('./db');
const gpsSocket = require('./sockets/gpsSocket');

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: config.CORS_ORIGINS.length > 0 ? [...config.CORS_ORIGINS] : '*'
  }
});

// Make Socket.IO reachable from route handlers as req.io
app.set('io', io);

// Initialize GPS Socket.IO handlers
gpsSocket(io);

// Start server after confirming database connection
const PORT = config.PORT;

async function startServer() {
  try {
    await prisma.$connect();
    console.log('Database Connected ✅');

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://0.0.0.0:${PORT} ✅`);
    });
  } catch (err) {
    console.error('Startup Error:', err.message);
    process.exitCode = 1;
  }
}

startServer();

// Graceful shutdown
async function shutdown() {
  console.log('\nShutting down server...');

  server.close(async () => {
    try {
      await prisma.$disconnect();
      console.log('Database disconnected.');
      process.exit(0);
    } catch (err) {
      console.error('Database disconnect error:', err.message);
      process.exit(1);
    }
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

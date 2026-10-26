// Loads and validates backend configuration from environment variables.
// Error messages name the offending key only and never include values.
const path = require('path');

const DEFAULT_OSRM_URL = 'https://router.project-osrm.org';
const DEFAULT_PORT = 5000;
const REQUIRED_KEYS = ['DATABASE_URL', 'JWT_SECRET'];

const isBlank = (v) => v === undefined || v === null || String(v).trim() === '';

const parseBool = (v) => {
  if (isBlank(v)) return false;
  return ['true', '1', 'yes', 'on'].includes(String(v).trim().toLowerCase());
};

const parseList = (v) => {
  if (isBlank(v)) return [];
  return String(v)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
};

const parsePort = (v) => {
  if (isBlank(v)) return DEFAULT_PORT;
  const n = Number(String(v).trim());
  if (!Number.isInteger(n) || n < 0 || n > 65535) {
    throw new Error('Invalid env: PORT must be an integer between 0 and 65535');
  }
  return n;
};

/**
 * Build a validated config object from an env map.
 * Pure: reads only from `env`, never mutates it and never loads files.
 */
function loadEnv(env = process.env) {
  const source = env || {};
  const missing = REQUIRED_KEYS.filter((key) => isBlank(source[key]));
  if (missing.length > 0) {
    throw new Error(`Missing required env: ${missing.join(', ')}`);
  }

  const osrm = isBlank(source.OSRM_URL)
    ? DEFAULT_OSRM_URL
    : String(source.OSRM_URL).trim().replace(/\/+$/, '');

  return Object.freeze({
    DATABASE_URL: String(source.DATABASE_URL).trim(),
    JWT_SECRET: String(source.JWT_SECRET),
    OSRM_URL: osrm,
    NODE_ENV: isBlank(source.NODE_ENV) ? 'development' : String(source.NODE_ENV).trim(),
    PORT: parsePort(source.PORT),
    CORS_ORIGINS: Object.freeze(parseList(source.CORS_ORIGINS)),
    FIREBASE_SERVICE_ACCOUNT: isBlank(source.FIREBASE_SERVICE_ACCOUNT)
      ? null
      : String(source.FIREBASE_SERVICE_ACCOUNT),
  });
}

let cached = null;
let dotenvLoaded = false;

// Load backend/.env once so modules like db.js work even when required
// before server.js. dotenv never overrides variables already set, and it
// is skipped under Jest (NODE_ENV=test) so tests only see injected env.
function ensureDotenv() {
  if (dotenvLoaded) return;
  dotenvLoaded = true;
  if (process.env.NODE_ENV === 'test') return;
  require('dotenv').config({
    path: path.resolve(__dirname, '../../.env'),
    quiet: true,
  });
}

/** Lazily load, validate and cache the config from process.env. */
function getConfig() {
  if (!cached) {
    ensureDotenv();
    cached = loadEnv(process.env);
  }
  return cached;
}

/** Clear the cached config (for tests that change process.env). */
function resetConfig() {
  cached = null;
}

module.exports = { loadEnv, getConfig, resetConfig, DEFAULT_OSRM_URL };

const { PrismaClient } = require('./generated/prisma');
const { getConfig } = require('./config/env');

// Prisma 5.22's experimental Neon driver-adapter path serializes PostgreSQL
// enum casts as a single quoted identifier, for example `"public.Role"`.
// PostgreSQL then searches for a type literally named `public.Role` instead of
// the existing `"Role"` type in the `public` schema. This long-lived Express
// server can use Prisma's standard PostgreSQL engine and the same DATABASE_URL
// without the adapter; it emits the correct enum type qualification.
getConfig();
const prisma = new PrismaClient();

module.exports = prisma;

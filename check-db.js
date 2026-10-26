const prisma = require('./src/db');

const VERIFY_ROLE_CREATE = '--verify-role-create';
const ROLLBACK_SENTINEL = 'PRISMA_ROLE_VERIFY_ROLLBACK';
const VERIFY_PHONE = '__prisma_role_verify_20261023__';

async function verifyRoleCreate() {
  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          phone: VERIFY_PHONE,
          name: 'Prisma role verification (rolled back)',
          role: 'PARENT',
        },
        select: { phone: true, role: true },
      });

      if (user.phone !== VERIFY_PHONE || user.role !== 'PARENT') {
        throw new Error('Role-create verification returned an unexpected row');
      }

      // The sentinel aborts this transaction. The test user is never committed.
      throw new Error(ROLLBACK_SENTINEL);
    });
  } catch (err) {
    if (err.message !== ROLLBACK_SENTINEL) throw err;
  }

  console.log('Role create verification passed; transaction rolled back.');
}

async function main() {
  const result = await prisma.$queryRaw`
    SELECT
      current_database()::text AS db,
      current_schema()::text AS schema,
      current_setting('search_path')::text AS search_path,
      n.nspname::text AS type_schema,
      t.typname::text AS type_name,
      e.enumlabel::text AS role_value,
      to_regclass('public."Admin"')::text AS admin_table,
      to_regclass('public."User"')::text AS user_table
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    LEFT JOIN pg_enum e ON e.enumtypid = t.oid
    WHERE t.typname = 'Role'
    ORDER BY e.enumsortorder
  `;

  console.log(JSON.stringify(result, null, 2));

  // Uses the exact generated-model lookup that adminLogin now uses. The email
  // cannot match a real account, so no admin data is printed.
  await prisma.admin.findUnique({
    where: { email: '__prisma_admin_query_verify__@invalid.local' },
    select: { id: true },
  });
  console.log('Admin model query passed.');

  if (process.argv.includes(VERIFY_ROLE_CREATE)) {
    await verifyRoleCreate();
  }
}

main()
  .catch((err) => {
    console.error('Check failed:', err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

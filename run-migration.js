const { spawn } = require('child_process');

console.log('Starting Prisma migration...');

const prisma = spawn('npx', ['prisma', 'migrate', 'dev', '--name', 'stop_wise_attendance'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

prisma.on('error', (error) => {
  console.error('Migration error:', error);
  process.exit(1);
});

prisma.on('close', (code) => {
  console.log(`Migration process exited with code ${code}`);
  process.exit(code);
});

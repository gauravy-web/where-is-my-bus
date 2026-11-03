const { execSync } = require('child_process');
const path = require('path');

try {
  const output = execSync(
    'npx jest tests/pickupFlowE2E.test.js --runInBand --verbose',
    {
      cwd: __dirname,
      encoding: 'utf8',
      stdio: 'inherit'
    }
  );
} catch (error) {
  console.error('Test failed with exit code:', error.status);
  process.exit(error.status || 1);
}

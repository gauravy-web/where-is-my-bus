const fs = require('fs');
const path = require('path');

try {
  const testFile = path.join(__dirname, 'tests', 'pickupFlowE2E.test.js');
  const code = fs.readFileSync(testFile, 'utf8');
  
  // Try to parse the file
  new Function(code);
  
  console.log('✓ Syntax check passed');
  console.log('✓ Test file is valid JavaScript');
  process.exit(0);
} catch (error) {
  console.error('✗ Syntax error found:');
  console.error(error.message);
  if (error.stack) {
    console.error(error.stack.split('\n').slice(0, 5).join('\n'));
  }
  process.exit(1);
}

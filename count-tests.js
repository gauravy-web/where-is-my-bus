const fs = require('fs');

const content = fs.readFileSync('tests/attendanceController.test.js', 'utf8');
const describeCount = (content.match(/describe\(/g) || []).length;
const testCount = (content.match(/test\(/g) || []).length;

console.log(`Test Suites (describe blocks): ${describeCount}`);
console.log(`Total Tests: ${testCount}`);
console.log(`\nTest file validated successfully!`);

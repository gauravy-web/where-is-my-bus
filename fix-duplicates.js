const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'services', 'importService.js');
let content = fs.readFileSync(filePath, 'utf8');

console.log('Fixing duplicate Step 9 code...');

// Fix duplicate routes in return statement
const beforeFix = content;
content = content.replace(
  /routes: \{ pickup: pickupRouteId, drop: dropRouteId \},\s+routes: \{ pickup: pickupRouteId, drop: dropRouteId \},/g,
  'routes: { pickup: pickupRouteId, drop: dropRouteId },'
);

if (beforeFix !== content) {
  console.log('✓ Removed duplicate routes property in return statement');
}

// Count Step 9 occurrences
const step9Count = (content.match(/\/\/ 9\) Create Route records from imported pickup and drop stops/g) || []).length;
console.log(`Found ${step9Count} instances of Step 9 code`);

if (step9Count > 1) {
  console.log('Removing duplicate Step 9 blocks...');

  // Extract the first complete Step 9 block
  const step9Match = content.match(/\/\/ 9\) Create Route records from imported pickup and drop stops\.[\s\S]*?(?=\n\n    return \{)/);
  const step9Code = step9Match ? step9Match[0] : null;

  if (step9Code) {
    // Remove all Step 9 blocks
    content = content.replace(/\/\/ 9\) Create Route records from imported pickup and drop stops\.[\s\S]*?(?=\n\n    return \{)/g, '');

    // Add back one clean Step 9 block before the return
    content = content.replace(
      /(\n\n    return \{)/,
      `\n${step9Code}$1`
    );

    console.log('✓ Kept only one instance of Step 9 code');
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('✓ File fixed and saved');
console.log('\nDone! Restart your backend server.');

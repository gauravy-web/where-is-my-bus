const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'services', 'importService.js');

// Read the current file
const content = fs.readFileSync(filePath, 'utf8');

// The new Step 9 code to insert
const step9Code = `
    // 9) Create Route records from imported pickup and drop stops.
    // Delete existing routes for this bus to prevent duplicates.
    await tx.route.deleteMany({ where: { busId } });

    let pickupRouteId = null;
    let dropRouteId = null;

    // Create PICKUP route if pickup stops exist
    if (plan.pickupStops && plan.pickupStops.length > 0) {
      const pickupStops = plan.pickupStops;
      const firstPickupStop = pickupStops[0];
      const lastPickupStop = pickupStops[pickupStops.length - 1];

      const pickupRouteName = \`\${plan.bus.busNo} - \${plan.bus.label || 'Bus'} (Pickup)\`;
      const pickupRoute = await tx.route.create({
        data: {
          name: pickupRouteName,
          busId,
          startPoint: firstPickupStop.name,
          endPoint: school ? school.name : lastPickupStop.name,
        },
      });
      pickupRouteId = pickupRoute.id;

      // Create RouteStop records for each pickup stop
      for (const st of pickupStops) {
        await tx.routeStop.create({
          data: {
            routeId: pickupRouteId,
            name: st.name,
            lat: st.lat,
            lng: st.lng,
            order: st.order,
            distanceFromStart: 0,
            estimatedTime: 0,
          },
        });
      }
    }

    // Create DROP route if drop stops exist
    if (plan.dropStops && plan.dropStops.length > 0) {
      const dropStops = plan.dropStops;
      const firstDropStop = dropStops[0];
      const lastDropStop = dropStops[dropStops.length - 1];

      const dropRouteName = \`\${plan.bus.busNo} - \${plan.bus.label || 'Bus'} (Drop)\`;
      const dropRoute = await tx.route.create({
        data: {
          name: dropRouteName,
          busId,
          startPoint: school ? school.name : firstDropStop.name,
          endPoint: lastDropStop.name,
        },
      });
      dropRouteId = dropRoute.id;

      // Create RouteStop records for each drop stop
      for (const st of dropStops) {
        await tx.routeStop.create({
          data: {
            routeId: dropRouteId,
            name: st.name,
            lat: st.lat,
            lng: st.lng,
            order: st.order,
            distanceFromStart: 0,
            estimatedTime: 0,
          },
        });
      }
    }
`;

// Update comment from steps 1-8 to steps 1-9
let updated = content.replace(
  'Apply a confirmed plan in one transaction (design steps 1–8).',
  'Apply a confirmed plan in one transaction (design steps 1–9).'
);

// Find where to insert step 9 (before the return statement in applyPlan)
const returnPattern = /(\s+return\s+\{[^}]*busId,\s*busNo:\s*plan\.bus\.busNo,\s*created,\s*updated,\s*stops:\s*\{[^}]*\},)/;

// Update the return statement to include routes
updated = updated.replace(
  /stops:\s*\{\s*pickup:\s*pickupStopByAdmissionNo\.size,\s*drop:\s*dropStopByAdmissionNo\.size\s*\},/,
  'stops: { pickup: pickupStopByAdmissionNo.size, drop: dropStopByAdmissionNo.size },\n      routes: { pickup: pickupRouteId, drop: dropRouteId },'
);

// Insert step 9 before the return statement
updated = updated.replace(
  /(\s+)(return\s+\{[^}]*busId,)/,
  `$1${step9Code}\n$1$2`
);

// Create backup
fs.writeFileSync(filePath + '.backup', content, 'utf8');
console.log('✓ Backup created: importService.js.backup');

// Write updated file
fs.writeFileSync(filePath, updated, 'utf8');
console.log('✓ Updated: importService.js');
console.log('✓ Added Step 9: Route auto-creation from Excel/CSV import');
console.log('\nChanges made:');
console.log('  - Updated comment: steps 1–8 → steps 1–9');
console.log('  - Added Route creation logic after step 8');
console.log('  - Updated return statement to include routes');
console.log('\nRestart your backend server to apply changes.');

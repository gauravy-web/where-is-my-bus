const fs = require("fs");
const f = "d:/where is my bus/backend/src/services/importService.js";
let c = fs.readFileSync(f, "utf8");
console.log("Removing duplicate Step 9...");
const marker = "// 9) Create Route records from imported pickup and drop stops.";
const firstIdx = c.indexOf(marker);
const secondIdx = c.indexOf(marker, firstIdx + 10);
if (secondIdx > -1) {
  const endOfSecond = c.indexOf("return {", secondIdx);
  c = c.substring(0, secondIdx) + c.substring(endOfSecond);
  fs.writeFileSync(f, c);
  console.log("Removed duplicate Step 9");
} else {
  console.log("No duplicate found");
}

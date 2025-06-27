const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

/*
// bash cmd
// git clone https://github.com/juice-shop/juice-shop.git
// cd juice-shop
// docker pull opensecurity/nodejsscan
// node sast-nodejsscan-sample.js
// --html --output /results/report.html
*/

// === CONFIGURATION ===
const JUICE_SHOP_DIR = path.resolve("./juice-shop"); // Change if needed
const OUTPUT_DIR = path.resolve("./scan-results");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "report.json");

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

console.log("[*] Starting static code analysis with NodeJsScan...");

const command = `
docker run --rm -v "${JUICE_SHOP_DIR}:/app" -v "${OUTPUT_DIR}:/results" opensecurity/nodejsscan \
--path /app --output /results/report.json --json
`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
  }

  console.log("Static analysis completed.");

  // Optional: Read and print top-level vulnerabilities
  try {
    const report = JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf8"));
    console.log("\n=== Identified Issues ===");
    for (const file in report) {
      console.log(`\n File: ${file}`);
      report[file].forEach((issue) => {
        console.log(`- [${issue.level.toUpperCase()}] ${issue.title}: ${issue.description}`);
      });
    }
  } catch (e) {
    console.error("Failed to parse output JSON:", e.message);
  }
});

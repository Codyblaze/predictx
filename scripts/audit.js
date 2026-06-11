const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const OUTPUT_DIR = path.join(__dirname, "../audit");
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

console.log("=== PredictX Automated Security Audit ===\n");

console.log("Running Slither static analysis...");
try {
  const slitherOut = execSync("slither . --print human-summary 2>&1", {
    encoding: "utf8",
    cwd: path.join(__dirname, ".."),
  });
  fs.writeFileSync(path.join(OUTPUT_DIR, "slither-report.txt"), slitherOut);
  console.log("   Slither report saved to audit/slither-report.txt");
  console.log(slitherOut);
} catch (e) {
  const out = e.stdout || e.message;
  fs.writeFileSync(path.join(OUTPUT_DIR, "slither-report.txt"), out);
  console.log("   Slither output saved (check audit/slither-report.txt)");
}

console.log("\nRunning test coverage...");
try {
  const coverageOut = execSync("npx hardhat coverage 2>&1", {
    encoding: "utf8",
    cwd: path.join(__dirname, ".."),
  });
  fs.writeFileSync(path.join(OUTPUT_DIR, "coverage-report.txt"), coverageOut);
  console.log("   Coverage report saved to audit/coverage-report.txt");

  const lines = coverageOut.split("\n");
  const coverageLines = lines.filter(
    (l) => l.includes("Statements") || l.includes("Branches") || l.includes("Functions") || l.includes("Lines")
  );
  coverageLines.forEach((l) => console.log(`   ${l.trim()}`));
} catch (e) {
  console.log("   Coverage failed:", e.message);
}

console.log("\n=== Audit complete. Check audit/ directory for full reports. ===");
console.log("Next step: Commission manual audit via Hashlock (X1 EcoChain partner).");
console.log("Hashlock: https://hashlock.com.au");

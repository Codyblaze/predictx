const fs = require("fs");
const path = require("path");

const HIDDEN_FILE = path.join(
  __dirname,
  "../frontend/src/data/hidden-markets.json"
);

function main() {
  const market = process.argv[2];
  if (!market || !/^0x[a-fA-F0-9]{40}$/.test(market)) {
    console.error("Usage: node scripts/archive-market.js <marketAddress>");
    process.exit(1);
  }

  const raw = fs.readFileSync(HIDDEN_FILE, "utf-8");
  const hidden = JSON.parse(raw);

  if (hidden.some((a) => a.toLowerCase() === market.toLowerCase())) {
    console.log(`Already archived: ${market}`);
    return;
  }

  hidden.push(market);
  fs.writeFileSync(HIDDEN_FILE, JSON.stringify(hidden, null, 2) + "\n", "utf-8");
  console.log(`Archived: ${market}`);
  console.log(`Updated: ${HIDDEN_FILE}`);
  console.log("Commit and push to apply on production.");
}

main();

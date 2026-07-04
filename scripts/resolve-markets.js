const { ethers, network } = require("hardhat");

const DEFAULT_ORACLE = "0x9811DA5da02cb74A2C66406abE1f506D53C216d2";
const EXPLORER = "https://maculatus-scan.x1eco.com";

const RONALDO_DEFAULTS = [
  {
    market: "0x5D5267E001059Eb9e7b3e3876df7661a58Fc8a09",
    yesWon: true,
    label: "Ronaldo score vs Uzbekistan → YES",
  },
  {
    market: "0xCc44527FA7997E286DCCCDcBE7F44D423B1C8e38",
    yesWon: false,
    label: "Ronaldo hat-trick vs Uzbekistan → NO",
  },
];

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = { markets: [], ronaldo: false };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--ronaldo") {
      parsed.ronaldo = true;
    } else if (args[i] === "--market" && args[i + 1]) {
      const market = args[++i];
      const outcome = args[i + 1] === "--outcome" ? args[++i] : null;
      if (!outcome || !["yes", "no"].includes(outcome.toLowerCase())) {
        throw new Error(`Missing or invalid --outcome for market ${market}. Use yes or no.`);
      }
      parsed.markets.push({
        market,
        yesWon: outcome.toLowerCase() === "yes",
        label: `${market} → ${outcome.toUpperCase()}`,
      });
    }
  }

  return parsed;
}

async function main() {
  const { markets: cliMarkets, ronaldo } = parseArgs();
  const resolutions =
    cliMarkets.length > 0 ? cliMarkets : ronaldo || cliMarkets.length === 0 ? RONALDO_DEFAULTS : cliMarkets;

  const oracleAddress = process.env.ORACLE_ADDRESS || DEFAULT_ORACLE;
  const [signer] = await ethers.getSigners();

  console.log(`Network: ${network.name}`);
  console.log(`Signer: ${signer.address}`);
  console.log(`Oracle: ${oracleAddress}`);

  const oracle = await ethers.getContractAt("MockOracle", oracleAddress, signer);
  const isResolver = await oracle.resolvers(signer.address);
  if (!isResolver) {
    throw new Error(
      `${signer.address} is not a resolver on MockOracle. Use the deployer wallet or addResolver first.`
    );
  }

  for (const item of resolutions) {
    const market = await ethers.getContractAt("PredictionMarket", item.market);
    const question = await market.question();
    const closingTime = await market.closingTime();
    const outcome = await market.outcome();
    const now = Math.floor(Date.now() / 1000);

    if (Number(outcome) !== 0) {
      console.log(`\nSkip (already resolved): ${item.label}`);
      console.log(`  Question: ${question}`);
      continue;
    }

    if (now < Number(closingTime)) {
      throw new Error(`Market still open: ${question} (closes at ${closingTime})`);
    }

    console.log(`\nResolving: ${item.label}`);
    console.log(`  Question: ${question}`);
    const tx = await oracle.resolveMarket(item.market, item.yesWon);
    const receipt = await tx.wait();
    console.log(`  Tx: ${EXPLORER}/tx/${receipt.hash}`);
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

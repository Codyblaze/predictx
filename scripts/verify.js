const { run, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const deploymentFile = path.join(__dirname, `../deployments/${network.name}.json`);
  if (!fs.existsSync(deploymentFile)) {
    console.error(`No deployment file found for network: ${network.name}`);
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const { MockOracle, MarketFactory } = deployment.contracts;

  console.log(`Verifying contracts on ${network.name}...`);

  try {
    await run("verify:verify", {
      address: MockOracle,
      constructorArguments: [],
    });
    console.log(`MockOracle verified: ${MockOracle}`);
  } catch (e) {
    console.log(`MockOracle verification skipped: ${e.message}`);
  }

  try {
    await run("verify:verify", {
      address: MarketFactory,
      constructorArguments: [MockOracle],
    });
    console.log(`MarketFactory verified: ${MarketFactory}`);
  } catch (e) {
    console.log(`MarketFactory verification skipped: ${e.message}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

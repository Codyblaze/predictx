const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying on: ${network.name}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} X1`);

  console.log("\nDeploying MockOracle...");
  const MockOracle = await ethers.getContractFactory("MockOracle");
  const oracle = await MockOracle.deploy();
  await oracle.waitForDeployment();
  const oracleAddr = await oracle.getAddress();
  console.log(`   MockOracle deployed at: ${oracleAddr}`);

  console.log("\nDeploying MarketFactory...");
  const MarketFactory = await ethers.getContractFactory("MarketFactory");
  const factory = await MarketFactory.deploy(oracleAddr);
  await factory.waitForDeployment();
  const factoryAddr = await factory.getAddress();
  console.log(`   MarketFactory deployed at: ${factoryAddr}`);

  if (network.name === "x1testnet" || network.name === "hardhat") {
    console.log("\nCreating demo markets...");
    const now = Math.floor(Date.now() / 1000);

    const markets = [
      {
        question: "Will BTC exceed $100,000 by end of July 2026?",
        category: "crypto",
        closingTime: now + 30 * 24 * 3600,
      },
      {
        question: "Will ETH 2.0 staking APY remain above 4% in Q3 2026?",
        category: "crypto",
        closingTime: now + 60 * 24 * 3600,
      },
      {
        question: "Will X1 EcoChain reach 10,000 active validators by Q4 2026?",
        category: "ecosystem",
        closingTime: now + 90 * 24 * 3600,
      },
    ];

    const addresses = [];
    for (const m of markets) {
      const tx = await factory.createMarket(m.question, m.category, m.closingTime);
      const receipt = await tx.wait();
      const event = receipt.logs.find((l) => {
        try {
          return factory.interface.parseLog(l)?.name === "MarketCreated";
        } catch {
          return false;
        }
      });
      const parsed = factory.interface.parseLog(event);
      addresses.push(parsed.args.market);
      console.log(`   Market "${m.question.slice(0, 50)}..." → ${parsed.args.market}`);
    }
  }

  const deployment = {
    network: network.name,
    chainId: network.config.chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      MockOracle: oracleAddr,
      MarketFactory: factoryAddr,
    },
  };

  const outDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  const outFile = path.join(outDir, `${network.name}.json`);
  fs.writeFileSync(outFile, JSON.stringify(deployment, null, 2));
  console.log(`\nDeployment saved to: ${outFile}`);

  console.log("\n--- Add to frontend/.env.local ---");
  console.log(`NEXT_PUBLIC_MARKET_FACTORY_ADDRESS=${factoryAddr}`);
  console.log(`NEXT_PUBLIC_ORACLE_ADDRESS=${oracleAddr}`);
  console.log(`NEXT_PUBLIC_CHAIN_ID=${network.config.chainId}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

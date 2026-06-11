require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x" + "0".repeat(64);

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    x1testnet: {
      url: process.env.X1_TESTNET_RPC || "https://maculatus-rpc.x1eco.com",
      chainId: 10778,
      accounts: [PRIVATE_KEY],
      gasPrice: "auto",
    },
    x1mainnet: {
      url: process.env.X1_MAINNET_RPC || "https://rpc.x1ecochain.com",
      chainId: 204004,
      accounts: [PRIVATE_KEY],
      gasPrice: "auto",
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

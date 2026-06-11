import { defineChain } from "viem";

export const MACULATUS_CHAIN_ID = 10778;

export const x1Testnet = defineChain({
  id: MACULATUS_CHAIN_ID,
  name: "X1 Maculatus Testnet",
  nativeCurrency: { name: "X1T", symbol: "X1T", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://maculatus-rpc.x1eco.com"] },
  },
  blockExplorers: {
    default: {
      name: "Maculatus Scan",
      url: "https://maculatus-scan.x1eco.com",
    },
  },
  testnet: true,
});

export const x1Mainnet = defineChain({
  id: 204004,
  name: "X1 EcoChain",
  nativeCurrency: { name: "X1", symbol: "X1", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.x1ecochain.com"] },
  },
  blockExplorers: {
    default: {
      name: "X1 Scan",
      url: "https://scan.x1ecochain.com",
    },
  },
});

export const SUPPORTED_CHAINS = [x1Testnet, x1Mainnet] as const;

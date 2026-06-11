import { defineChain } from "viem";

export const x1Testnet = defineChain({
  id: 204005,
  name: "X1 EcoChain Testnet",
  nativeCurrency: { name: "X1", symbol: "X1", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc-testnet.x1ecochain.com"] },
  },
  blockExplorers: {
    default: {
      name: "X1 Testnet Explorer",
      url: "https://explorer-testnet.x1ecochain.com",
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

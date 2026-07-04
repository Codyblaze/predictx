import { MACULATUS_CHAIN_ID } from "./chains";

export const MARKET_FACTORY_ADDRESS =
  (process.env.NEXT_PUBLIC_MARKET_FACTORY_ADDRESS as `0x${string}`) ||
  "0xF99C07d08dfDA19DDb6640008386d9b67e327ED3";

export const ORACLE_ADDRESS =
  (process.env.NEXT_PUBLIC_ORACLE_ADDRESS as `0x${string}`) ||
  "0x9811DA5da02cb74A2C66406abE1f506D53C216d2";

export const CHAIN_ID = Number(
  process.env.NEXT_PUBLIC_CHAIN_ID || String(MACULATUS_CHAIN_ID)
);

export const NATIVE_TOKEN_SYMBOL =
  CHAIN_ID === MACULATUS_CHAIN_ID ? "X1T" : "X1";

export const OUTCOME_LABELS: Record<number, string> = {
  0: "Unresolved",
  1: "YES",
  2: "NO",
  3: "Cancelled",
};

export const CATEGORY_COLORS: Record<string, string> = {
  crypto: "text-yellow-400 bg-yellow-400/10",
  sports: "text-blue-400 bg-blue-400/10",
  politics: "text-red-400 bg-red-400/10",
  ecosystem: "text-x1-green bg-x1-green/10",
  other: "text-gray-400 bg-gray-400/10",
};

export function explorerTxUrl(hash: string, chainId: number): string {
  if (chainId === MACULATUS_CHAIN_ID) {
    return `https://maculatus-scan.x1eco.com/tx/${hash}`;
  }
  return `https://scan.x1ecochain.com/tx/${hash}`;
}

export function explorerAddressUrl(address: string, chainId: number): string {
  if (chainId === MACULATUS_CHAIN_ID) {
    return `https://maculatus-scan.x1eco.com/address/${address}`;
  }
  return `https://scan.x1ecochain.com/address/${address}`;
}

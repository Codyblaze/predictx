import { formatEther } from "viem";

export const BET_GAS_UNITS = 65_000n;

export function estimateBetGasCost(gasPrice: bigint): bigint {
  return gasPrice * BET_GAS_UNITS;
}

export function formatGasCost(wei: bigint, symbol: string): string {
  const amount = parseFloat(formatEther(wei));
  if (amount < 0.0001) {
    return `<0.0001 ${symbol}`;
  }
  const formatted = amount.toFixed(5).replace(/\.?0+$/, "");
  return `~${formatted} ${symbol}`;
}

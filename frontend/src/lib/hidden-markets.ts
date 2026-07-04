import hiddenMarketsData from "@/data/hidden-markets.json";

const hiddenSet = new Set(
  (hiddenMarketsData as string[]).map((a) => a.toLowerCase())
);

export function getHiddenMarkets(): string[] {
  return hiddenMarketsData as string[];
}

export function isMarketHidden(address: string): boolean {
  return hiddenSet.has(address.toLowerCase());
}

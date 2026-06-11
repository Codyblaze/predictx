export interface MarketInfo {
  market: `0x${string}`;
  creator: `0x${string}`;
  question: string;
  category: string;
  closingTime: bigint;
  createdAt: bigint;
}

export interface MarketStats {
  totalYes: bigint;
  totalNo: bigint;
  totalPool: bigint;
  outcome: number;
  isOpen: boolean;
}

export interface AiScore {
  yesProbability: number;
  noProbability: number;
  summary: string;
  confidence: "high" | "medium" | "low";
  loading: boolean;
  error?: string;
}

export type OutcomeLabel = "Unresolved" | "YES" | "NO" | "Cancelled";

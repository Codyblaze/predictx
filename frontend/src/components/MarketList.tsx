"use client";

import { useMemo, useState } from "react";
import { useReadContract, useReadContracts } from "wagmi";
import { MARKET_FACTORY_ABI, PREDICTION_MARKET_ABI } from "@/lib/abis";
import { MARKET_FACTORY_ADDRESS } from "@/lib/contracts";
import { isMarketHidden } from "@/lib/hidden-markets";
import { MarketCard } from "./MarketCard";
import type { MarketInfo } from "@/types";

const CATEGORIES = ["all", "crypto", "sports", "politics", "ecosystem", "other"];

type StatusFilter = "open" | "closed" | "all";

interface Props {
  limit?: number;
  showFilters?: boolean;
  statusFilter?: StatusFilter;
  excludeHidden?: boolean;
  emptyMessage?: string;
}

export function MarketList({
  limit = 12,
  showFilters = false,
  statusFilter = "open",
  excludeHidden = true,
  emptyMessage,
}: Props) {
  const [filter, setFilter] = useState("all");

  const { data: marketCount } = useReadContract({
    address: MARKET_FACTORY_ADDRESS,
    abi: MARKET_FACTORY_ABI,
    functionName: "getMarketCount",
  });

  const count = marketCount ? Number(marketCount) : 0;

  const { data: marketsData, isLoading: marketsLoading } = useReadContract({
    address: MARKET_FACTORY_ADDRESS,
    abi: MARKET_FACTORY_ABI,
    functionName: "getMarkets",
    args: [0n, BigInt(count || 0)],
    query: { enabled: count > 0, refetchInterval: 15_000 },
  });

  const markets = useMemo(
    () => (marketsData as MarketInfo[] | undefined) ?? [],
    [marketsData]
  );

  const statsContracts = useMemo(
    () =>
      markets.map((m) => ({
        address: m.market,
        abi: PREDICTION_MARKET_ABI,
        functionName: "getMarketStats" as const,
      })),
    [markets]
  );

  const { data: statsData, isLoading: statsLoading } = useReadContracts({
    contracts: statsContracts,
    query: { enabled: statsContracts.length > 0 },
  });

  const items = useMemo(() => {
    if (!statsData || markets.length === 0) return [];

    const withStatus: { info: MarketInfo; isOpen: boolean }[] = [];
    for (let i = 0; i < markets.length; i++) {
      const result = statsData[i];
      if (result?.status !== "success") continue;

      const [, , , , isOpen] = result.result as [
        bigint,
        bigint,
        bigint,
        number,
        boolean,
      ];

      if (excludeHidden && isMarketHidden(markets[i].market)) continue;

      if (statusFilter === "open" && !isOpen) continue;
      if (statusFilter === "closed" && isOpen) continue;

      withStatus.push({ info: markets[i], isOpen });
    }

    return withStatus.map((w) => w.info).slice(0, limit);
  }, [statsData, markets, statusFilter, excludeHidden, limit]);

  const filtered =
    filter === "all" ? items : items.filter((m) => m.category === filter);

  const isLoading =
    marketsLoading || (statsContracts.length > 0 && statsLoading);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card animate-pulse space-y-3">
            <div className="h-4 bg-x1-border rounded w-1/4" />
            <div className="h-5 bg-x1-border rounded w-3/4" />
            <div className="h-5 bg-x1-border rounded w-1/2" />
            <div className="h-2 bg-x1-border rounded-full" />
            <div className="h-8 bg-x1-border rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="card text-center py-16 space-y-3">
        <div className="text-4xl">📊</div>
        <p className="text-x1-muted">
          {emptyMessage ??
            (statusFilter === "open"
              ? "No open markets right now."
              : statusFilter === "closed"
              ? "No closed markets yet."
              : "No markets yet. Be the first to create one!")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`badge capitalize transition-colors cursor-pointer ${
                filter === c
                  ? "bg-x1-green text-black"
                  : "bg-x1-border text-x1-muted hover:text-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((m) => (
          <MarketCard key={m.market} info={m} />
        ))}
      </div>
    </div>
  );
}

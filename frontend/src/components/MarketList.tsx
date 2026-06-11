"use client";

import { useState } from "react";
import { useReadContract } from "wagmi";
import { MARKET_FACTORY_ABI } from "@/lib/abis";
import { MARKET_FACTORY_ADDRESS } from "@/lib/contracts";
import { MarketCard } from "./MarketCard";
import type { MarketInfo } from "@/types";

const CATEGORIES = ["all", "crypto", "sports", "politics", "ecosystem", "other"];

interface Props {
  limit?: number;
  showFilters?: boolean;
}

export function MarketList({ limit = 12, showFilters = false }: Props) {
  const [filter, setFilter] = useState("all");

  const { data: markets, isLoading } = useReadContract({
    address: MARKET_FACTORY_ADDRESS,
    abi: MARKET_FACTORY_ABI,
    functionName: "getMarkets",
    args: [0n, BigInt(limit)],
    query: { refetchInterval: 15_000 },
  });

  const items = ([...(markets ?? [])] as unknown as MarketInfo[]);
  const filtered =
    filter === "all" ? items : items.filter((m) => m.category === filter);

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

  if (items.length === 0) {
    return (
      <div className="card text-center py-16 space-y-3">
        <div className="text-4xl">📊</div>
        <p className="text-x1-muted">No markets yet. Be the first to create one!</p>
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

"use client";

import { useMemo } from "react";
import { useReadContract, useReadContracts } from "wagmi";
import { MARKET_FACTORY_ABI, PREDICTION_MARKET_ABI } from "@/lib/abis";
import { MARKET_FACTORY_ADDRESS } from "@/lib/contracts";
import { isMarketHidden } from "@/lib/hidden-markets";
import type { MarketInfo } from "@/types";

export function useOpenMarketCount() {
  const { data: marketCount } = useReadContract({
    address: MARKET_FACTORY_ADDRESS,
    abi: MARKET_FACTORY_ABI,
    functionName: "getMarketCount",
    query: { refetchInterval: 15_000 },
  });

  const total = marketCount ? Number(marketCount) : 0;

  const { data: marketsData, isLoading: marketsLoading } = useReadContract({
    address: MARKET_FACTORY_ADDRESS,
    abi: MARKET_FACTORY_ABI,
    functionName: "getMarkets",
    args: [0n, BigInt(total || 0)],
    query: { enabled: total > 0, refetchInterval: 15_000 },
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

  const count = useMemo(() => {
    if (!statsData || markets.length === 0) return null;

    let open = 0;
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

      if (!isOpen || isMarketHidden(markets[i].market)) continue;
      open++;
    }
    return open;
  }, [statsData, markets]);

  const isLoading =
    marketsLoading || (statsContracts.length > 0 && statsLoading);

  return { count, isLoading };
}

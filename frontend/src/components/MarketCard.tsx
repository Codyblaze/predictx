"use client";

import Link from "next/link";
import { useReadContract } from "wagmi";
import { formatEther } from "viem";
import { formatDistanceToNow } from "date-fns";
import { PREDICTION_MARKET_ABI } from "@/lib/abis";
import { CATEGORY_COLORS, OUTCOME_LABELS, NATIVE_TOKEN_SYMBOL } from "@/lib/contracts";
import { AIProbabilityBadge } from "./AIProbabilityBadge";
import type { MarketInfo } from "@/types";
import clsx from "clsx";

export function MarketCard({ info }: { info: MarketInfo }) {
  const { data: stats } = useReadContract({
    address: info.market,
    abi: PREDICTION_MARKET_ABI,
    functionName: "getMarketStats",
    query: { refetchInterval: 10_000 },
  });

  const [totalYes, totalNo, totalPool, outcome, isOpen] = (stats as [bigint, bigint, bigint, number, boolean] | undefined) ?? [
    0n, 0n, 0n, 0, true,
  ];

  const yesPool = totalPool > 0n ? Number((totalYes * 10000n) / totalPool) / 100 : 50;
  const closingLabel = formatDistanceToNow(
    new Date(Number(info.closingTime) * 1000),
    { addSuffix: true }
  );

  return (
    <Link href={`/markets/${info.market}`}>
      <article className="card hover:border-x1-green/40 transition-colors cursor-pointer space-y-4 h-full flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <span
            className={clsx(
              "badge",
              CATEGORY_COLORS[info.category] ?? CATEGORY_COLORS.other
            )}
          >
            {info.category}
          </span>
          {!isOpen && (
            <span
              className={clsx(
                "badge",
                outcome === 1
                  ? "text-x1-green bg-x1-green/10"
                  : outcome === 2
                  ? "text-red-400 bg-red-400/10"
                  : "text-x1-muted bg-x1-muted/10"
              )}
            >
              {OUTCOME_LABELS[outcome]}
            </span>
          )}
          {isOpen && (
            <span className="badge text-emerald-400 bg-emerald-400/10">Open</span>
          )}
        </div>

        <h3 className="font-semibold text-base leading-snug flex-1">
          {info.question}
        </h3>

        <div className="space-y-1">
          <div className="flex justify-between text-xs text-x1-muted">
            <span>YES {yesPool.toFixed(1)}%</span>
            <span>Pool: {parseFloat(formatEther(totalPool)).toFixed(3)} {NATIVE_TOKEN_SYMBOL}</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-x1-border overflow-hidden">
            <div
              className="h-full bg-x1-green transition-all duration-300"
              style={{ width: `${yesPool}%` }}
            />
          </div>
        </div>

        <AIProbabilityBadge
          question={info.question}
          category={info.category}
        />

        <p className="text-xs text-x1-muted">
          {isOpen ? `Closes ${closingLabel}` : `Closed ${closingLabel}`}
        </p>
      </article>
    </Link>
  );
}

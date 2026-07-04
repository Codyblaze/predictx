"use client";

import { useState } from "react";
import { useReadContract, useAccount } from "wagmi";
import { formatEther } from "viem";
import { formatDistanceToNow } from "date-fns";
import { PREDICTION_MARKET_ABI } from "@/lib/abis";
import {
  CATEGORY_COLORS,
  OUTCOME_LABELS,
  NATIVE_TOKEN_SYMBOL,
  explorerAddressUrl,
  CHAIN_ID,
} from "@/lib/contracts";
import { AIProbabilityBadge } from "./AIProbabilityBadge";
import { AIEdgeIndicator } from "./AIEdgeIndicator";
import { ShareMarket } from "./ShareMarket";
import { BettingPanel } from "./BettingPanel";
import { ResolverPanel } from "./ResolverPanel";
import { ProbabilityChart } from "./ProbabilityChart";
import clsx from "clsx";

interface Props {
  address: `0x${string}`;
}

export function MarketDetail({ address }: Props) {
  const { address: userAddress } = useAccount();
  const [aiYesPercent, setAiYesPercent] = useState<number | null>(null);
  const [aiLoading, setAiLoading] = useState(true);

  const { data: question } = useReadContract({
    address,
    abi: PREDICTION_MARKET_ABI,
    functionName: "question",
  });

  const { data: category } = useReadContract({
    address,
    abi: PREDICTION_MARKET_ABI,
    functionName: "category",
  });

  const { data: closingTime } = useReadContract({
    address,
    abi: PREDICTION_MARKET_ABI,
    functionName: "closingTime",
  });

  const { data: stats } = useReadContract({
    address,
    abi: PREDICTION_MARKET_ABI,
    functionName: "getMarketStats",
    query: { refetchInterval: 8_000 },
  });

  const { data: userBet } = useReadContract({
    address,
    abi: PREDICTION_MARKET_ABI,
    functionName: "bets",
    args: [userAddress ?? "0x0000000000000000000000000000000000000000"],
    query: { enabled: !!userAddress },
  });

  const { data: payout } = useReadContract({
    address,
    abi: PREDICTION_MARKET_ABI,
    functionName: "getPayout",
    args: [userAddress ?? "0x0000000000000000000000000000000000000000"],
    query: { enabled: !!userAddress },
  });

  const [totalYes, totalNo, totalPool, outcome, isOpen] = (stats as [bigint, bigint, bigint, number, boolean] | undefined) ?? [0n, 0n, 0n, 0, true];
  const [userYesBet, userNoBet] = (userBet as [bigint, bigint, boolean] | undefined) ?? [0n, 0n, false];

  if (!question) {
    return (
      <div className="card text-center py-16 animate-pulse text-x1-muted">
        Loading market…
      </div>
    );
  }

  const yesPercent =
    totalPool > 0n ? Number((totalYes * 100n) / totalPool) : 50;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={clsx(
            "badge",
            CATEGORY_COLORS[category ?? "other"] ?? CATEGORY_COLORS.other
          )}
        >
          {category}
        </span>
        <span
          className={clsx(
            "badge",
            isOpen
              ? "text-emerald-400 bg-emerald-400/10"
              : "text-x1-muted bg-x1-muted/10"
          )}
        >
          {isOpen ? "Open" : OUTCOME_LABELS[outcome]}
        </span>
        <a
          href={explorerAddressUrl(address, CHAIN_ID)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-x1-muted hover:text-x1-green underline font-mono"
        >
          {address.slice(0, 10)}…{address.slice(-6)}
        </a>
      </div>

      <h1 className="text-3xl font-bold leading-tight">{question}</h1>

      <ShareMarket marketAddress={address} question={question} />

      {closingTime && (
        <p className="text-x1-muted text-sm">
          {isOpen ? "Closes" : "Closed"}{" "}
          {formatDistanceToNow(new Date(Number(closingTime) * 1000), {
            addSuffix: true,
          })}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-x1-green font-semibold">
                YES — {yesPercent}%
              </span>
              <span className="text-red-400 font-semibold">
                NO — {100 - yesPercent}%
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-x1-border overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-x1-green to-emerald-400 transition-all duration-500"
                style={{ width: `${yesPercent}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="text-x1-green font-semibold text-lg">
                  {parseFloat(formatEther(totalYes)).toFixed(3)}
                </div>
                <div className="text-x1-muted">YES pool ({NATIVE_TOKEN_SYMBOL})</div>
              </div>
              <div>
                <div className="font-semibold text-lg">
                  {parseFloat(formatEther(totalPool)).toFixed(3)}
                </div>
                <div className="text-x1-muted">Total pool ({NATIVE_TOKEN_SYMBOL})</div>
              </div>
              <div>
                <div className="text-red-400 font-semibold text-lg">
                  {parseFloat(formatEther(totalNo)).toFixed(3)}
                </div>
                <div className="text-x1-muted">NO pool ({NATIVE_TOKEN_SYMBOL})</div>
              </div>
            </div>
          </div>

          <div className="card space-y-3">
            <h3 className="font-semibold">AI Analysis</h3>
            <AIProbabilityBadge
              question={question}
              category={category ?? "general"}
              totalYes={BigInt(totalYes)}
              totalNo={BigInt(totalNo)}
              onScoreLoaded={(score) => {
                setAiYesPercent(score.yesProbability);
                setAiLoading(false);
              }}
            />
            <AIEdgeIndicator
              marketYesPercent={yesPercent}
              aiYesPercent={aiYesPercent ?? yesPercent}
              loading={aiLoading}
            />
          </div>

          <ProbabilityChart yesPercent={yesPercent} />
        </div>

        <div className="space-y-4">
          <BettingPanel
            marketAddress={address}
            isOpen={isOpen}
            outcome={outcome}
            userYesBet={userYesBet ?? 0n}
            userNoBet={userNoBet ?? 0n}
            payout={(payout as bigint | undefined) ?? 0n}
          />
          <ResolverPanel
            marketAddress={address}
            outcome={outcome}
            isOpen={isOpen}
          />
        </div>
      </div>
    </div>
  );
}

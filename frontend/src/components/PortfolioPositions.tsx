"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useReadContract,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import Link from "next/link";
import { formatEther } from "viem";
import { MARKET_FACTORY_ABI, PREDICTION_MARKET_ABI } from "@/lib/abis";
import {
  MARKET_FACTORY_ADDRESS,
  OUTCOME_LABELS,
  NATIVE_TOKEN_SYMBOL,
  explorerTxUrl,
  CHAIN_ID,
} from "@/lib/contracts";
import type { MarketInfo } from "@/types";
import clsx from "clsx";

interface Position {
  market: MarketInfo;
  yesAmount: bigint;
  noAmount: bigint;
  claimed: boolean;
  payout: bigint;
  outcome: number;
  isOpen: boolean;
}

function ClaimButton({
  marketAddress,
  onSuccess,
}: {
  marketAddress: `0x${string}`;
  onSuccess: () => void;
}) {
  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (isSuccess) onSuccess();
  }, [isSuccess, onSuccess]);

  return (
    <div className="space-y-1">
      <button
        className="btn-primary text-sm px-4 py-2"
        onClick={() =>
          writeContract({
            address: marketAddress,
            abi: PREDICTION_MARKET_ABI,
            functionName: "claimWinnings",
          })
        }
        disabled={isPending || isConfirming}
      >
        {isPending || isConfirming ? "Claiming…" : "Claim"}
      </button>
      {isSuccess && txHash && (
        <a
          href={explorerTxUrl(txHash, CHAIN_ID)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-x1-green underline block"
        >
          View tx
        </a>
      )}
    </div>
  );
}

export function PortfolioPositions() {
  const { address: userAddress, isConnected } = useAccount();
  const [claimKey, setClaimKey] = useState(0);

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
    query: { enabled: count > 0 },
  });

  const markets = useMemo(
    () => (marketsData as MarketInfo[] | undefined) ?? [],
    [marketsData]
  );

  const { data: createdAddresses } = useReadContract({
    address: MARKET_FACTORY_ADDRESS,
    abi: MARKET_FACTORY_ABI,
    functionName: "getMarketsByCreator",
    args: [userAddress!],
    query: { enabled: !!userAddress },
  });

  const positionContracts = useMemo(() => {
    if (!userAddress || markets.length === 0) return [];
    return markets.flatMap((m) => [
      {
        address: m.market,
        abi: PREDICTION_MARKET_ABI,
        functionName: "bets" as const,
        args: [userAddress],
      },
      {
        address: m.market,
        abi: PREDICTION_MARKET_ABI,
        functionName: "getPayout" as const,
        args: [userAddress],
      },
      {
        address: m.market,
        abi: PREDICTION_MARKET_ABI,
        functionName: "getMarketStats" as const,
      },
    ]);
  }, [markets, userAddress]);

  const { data: positionData, isLoading: positionsLoading, refetch } =
    useReadContracts({
      contracts: positionContracts,
      query: { enabled: positionContracts.length > 0 },
    });

  const positions = useMemo(() => {
    if (!positionData || markets.length === 0) return [];

    const result: Position[] = [];
    for (let i = 0; i < markets.length; i++) {
      const betsResult = positionData[i * 3];
      const payoutResult = positionData[i * 3 + 1];
      const statsResult = positionData[i * 3 + 2];

      if (betsResult?.status !== "success" || statsResult?.status !== "success")
        continue;

      const [yesAmount, noAmount, claimed] = betsResult.result as [
        bigint,
        bigint,
        boolean,
      ];
      const payout =
        payoutResult?.status === "success" ? (payoutResult.result as bigint) : 0n;
      const [, , , outcome, isOpen] = statsResult.result as [
        bigint,
        bigint,
        bigint,
        number,
        boolean,
      ];

      if (yesAmount > 0n || noAmount > 0n || payout > 0n) {
        result.push({
          market: markets[i],
          yesAmount,
          noAmount,
          claimed,
          payout,
          outcome,
          isOpen,
        });
      }
    }
    return result;
  }, [positionData, markets]);

  const createdMarkets = useMemo(() => {
    if (!createdAddresses?.length) return [];
    const createdSet = new Set(
      createdAddresses.map((a) => a.toLowerCase())
    );
    return markets.filter((m) => createdSet.has(m.market.toLowerCase()));
  }, [createdAddresses, markets]);

  if (!isConnected) {
    return (
      <div className="card text-center py-16 space-y-4">
        <p className="text-x1-muted">Connect your wallet to view your positions.</p>
        <p className="text-sm text-x1-muted">
          Track bets, claim winnings, and see markets you created.
        </p>
      </div>
    );
  }

  const loading = marketsLoading || (positionContracts.length > 0 && positionsLoading);

  if (loading) {
    return (
      <div className="card text-center py-16 animate-pulse text-x1-muted">
        Loading portfolio…
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Your Positions</h2>
        {positions.length === 0 ? (
          <div className="card text-center py-12 text-x1-muted">
            <p>No active positions yet.</p>
            <Link href="/markets" className="text-x1-green text-sm hover:underline mt-2 inline-block">
              Browse markets →
            </Link>
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-x1-muted border-b border-x1-border">
                  <th className="text-left py-3 pr-4 font-medium">Market</th>
                  <th className="text-left py-3 pr-4 font-medium">YES</th>
                  <th className="text-left py-3 pr-4 font-medium">NO</th>
                  <th className="text-left py-3 pr-4 font-medium">Status</th>
                  <th className="text-left py-3 pr-4 font-medium">Claimable</th>
                  <th className="text-right py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((pos) => {
                  const canClaim = pos.outcome !== 0 && pos.payout > 0n;
                  return (
                    <tr
                      key={`${pos.market.market}-${claimKey}`}
                      className="border-b border-x1-border/50 last:border-0"
                    >
                      <td className="py-4 pr-4 max-w-xs">
                        <Link
                          href={`/markets/${pos.market.market}`}
                          className="font-medium hover:text-x1-green transition-colors line-clamp-2"
                        >
                          {pos.market.question}
                        </Link>
                      </td>
                      <td className="py-4 pr-4 text-x1-green whitespace-nowrap">
                        {pos.yesAmount > 0n
                          ? `${parseFloat(formatEther(pos.yesAmount)).toFixed(4)} ${NATIVE_TOKEN_SYMBOL}`
                          : "—"}
                      </td>
                      <td className="py-4 pr-4 text-red-400 whitespace-nowrap">
                        {pos.noAmount > 0n
                          ? `${parseFloat(formatEther(pos.noAmount)).toFixed(4)} ${NATIVE_TOKEN_SYMBOL}`
                          : "—"}
                      </td>
                      <td className="py-4 pr-4 whitespace-nowrap">
                        <span
                          className={clsx(
                            "badge",
                            pos.isOpen
                              ? "text-emerald-400 bg-emerald-400/10"
                              : "text-x1-muted bg-x1-muted/10"
                          )}
                        >
                          {pos.isOpen ? "Open" : OUTCOME_LABELS[pos.outcome]}
                        </span>
                      </td>
                      <td className="py-4 pr-4 whitespace-nowrap">
                        {canClaim ? (
                          <span className="text-x1-green font-medium">
                            {parseFloat(formatEther(pos.payout)).toFixed(4)}{" "}
                            {NATIVE_TOKEN_SYMBOL}
                          </span>
                        ) : pos.claimed ? (
                          <span className="text-x1-muted">Claimed</span>
                        ) : (
                          <span className="text-x1-muted">—</span>
                        )}
                      </td>
                      <td className="py-4 text-right">
                        {canClaim ? (
                          <ClaimButton
                            marketAddress={pos.market.market}
                            onSuccess={() => {
                              setClaimKey((k) => k + 1);
                              refetch();
                            }}
                          />
                        ) : (
                          <Link
                            href={`/markets/${pos.market.market}`}
                            className="text-x1-green text-sm hover:underline"
                          >
                            View
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {createdMarkets.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Markets You Created</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {createdMarkets.map((m) => (
              <Link
                key={m.market}
                href={`/markets/${m.market}`}
                className="card hover:border-x1-green/40 transition-colors space-y-2"
              >
                <span className="badge text-x1-green bg-x1-green/10">
                  {m.category}
                </span>
                <p className="font-medium leading-snug">{m.question}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

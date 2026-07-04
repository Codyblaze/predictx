"use client";

import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { parseEther, formatEther } from "viem";
import { PREDICTION_MARKET_ABI } from "@/lib/abis";
import { explorerTxUrl, CHAIN_ID, NATIVE_TOKEN_SYMBOL } from "@/lib/contracts";
import clsx from "clsx";

interface Props {
  marketAddress: `0x${string}`;
  isOpen: boolean;
  outcome: number;
  userYesBet: bigint;
  userNoBet: bigint;
  payout: bigint;
}

export function BettingPanel({
  marketAddress,
  isOpen,
  outcome,
  userYesBet,
  userNoBet,
  payout,
}: Props) {
  const { isConnected } = useAccount();
  const [side, setSide] = useState<"yes" | "no">("yes");
  const [amount, setAmount] = useState("");

  const { writeContract, data: txHash, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  function placeBet() {
    if (!amount || Number(amount) <= 0) return;
    writeContract({
      address: marketAddress,
      abi: PREDICTION_MARKET_ABI,
      functionName: side === "yes" ? "betYes" : "betNo",
      value: parseEther(amount),
    });
  }

  function claimWinnings() {
    writeContract({
      address: marketAddress,
      abi: PREDICTION_MARKET_ABI,
      functionName: "claimWinnings",
    });
  }

  const hasBet = userYesBet > 0n || userNoBet > 0n;
  const canClaim = outcome !== 0 && payout > 0n;

  if (!isConnected) {
    return (
      <div className="card text-center py-8 text-x1-muted text-sm">
        Connect your wallet to place bets.
      </div>
    );
  }

  return (
    <div className="card space-y-5">
      <h3 className="font-semibold text-lg">Place a Bet</h3>

      {hasBet && (
        <div className="text-sm text-x1-muted space-y-1 bg-x1-dark rounded-xl p-3">
          <p>Your bets:</p>
          {userYesBet > 0n && (
            <p className="text-x1-green">YES: {formatEther(userYesBet)} {NATIVE_TOKEN_SYMBOL}</p>
          )}
          {userNoBet > 0n && (
            <p className="text-red-400">NO: {formatEther(userNoBet)} {NATIVE_TOKEN_SYMBOL}</p>
          )}
        </div>
      )}

      {canClaim && (
        <div className="space-y-2">
          <p className="text-x1-green text-sm">
            Claimable: {parseFloat(formatEther(payout)).toFixed(4)} {NATIVE_TOKEN_SYMBOL}
          </p>
          <button
            className="btn-primary w-full"
            onClick={claimWinnings}
            disabled={isPending || isConfirming}
          >
            {isPending || isConfirming ? "Claiming…" : "Claim Winnings"}
          </button>
        </div>
      )}

      {isOpen && (
        <>
          <div className="flex rounded-xl overflow-hidden border border-x1-border">
            {(["yes", "no"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSide(s)}
                className={clsx(
                  "flex-1 py-3 text-sm font-semibold transition-colors",
                  side === s
                    ? s === "yes"
                      ? "bg-x1-green text-black"
                      : "bg-red-500 text-white"
                    : "text-x1-muted hover:text-white"
                )}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="space-y-1">
            <label className="text-sm text-x1-muted">Amount ({NATIVE_TOKEN_SYMBOL})</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="input"
            />
          </div>

          <div className="flex gap-2">
            {["0.1", "0.5", "1", "5"].map((v) => (
              <button
                key={v}
                onClick={() => setAmount(v)}
                className="flex-1 text-xs py-1.5 rounded-lg bg-x1-border hover:bg-x1-green/20 text-x1-muted hover:text-x1-green transition-colors"
              >
                {v}
              </button>
            ))}
          </div>

          <button
            className="btn-primary w-full"
            onClick={placeBet}
            disabled={!amount || isPending || isConfirming}
          >
            {isPending || isConfirming
              ? "Confirming…"
              : `Bet ${side.toUpperCase()} ${amount ? `${amount} ${NATIVE_TOKEN_SYMBOL}` : ""}`}
          </button>

          {isSuccess && txHash && (
            <p className="text-xs text-x1-green text-center">
              ✓ Confirmed!{" "}
              <a
                href={explorerTxUrl(txHash, CHAIN_ID)}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                View on Explorer
              </a>
            </p>
          )}
        </>
      )}
    </div>
  );
}

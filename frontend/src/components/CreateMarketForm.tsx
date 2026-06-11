"use client";

import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { MARKET_FACTORY_ABI } from "@/lib/abis";
import { MARKET_FACTORY_ADDRESS, explorerTxUrl, CHAIN_ID } from "@/lib/contracts";

const CATEGORIES = ["crypto", "sports", "politics", "ecosystem", "other"];

export function CreateMarketForm() {
  const router = useRouter();
  const { isConnected } = useAccount();

  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("crypto");
  const [closingDate, setClosingDate] = useState("");

  const { writeContract, data: txHash, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || !closingDate) return;

    const closingTime = BigInt(Math.floor(new Date(closingDate).getTime() / 1000));

    writeContract({
      address: MARKET_FACTORY_ADDRESS,
      abi: MARKET_FACTORY_ABI,
      functionName: "createMarket",
      args: [question.trim(), category, closingTime],
    });
  }

  if (!isConnected) {
    return (
      <div className="card text-center py-12 text-x1-muted">
        Connect your wallet to create a market.
      </div>
    );
  }

  const minDate = new Date(Date.now() + 3600_000).toISOString().slice(0, 16);
  const maxDate = new Date(Date.now() + 365 * 86400_000).toISOString().slice(0, 16);

  return (
    <form onSubmit={handleSubmit} className="card space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Question <span className="text-red-400">*</span>
        </label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Will BTC exceed $100,000 by end of July 2026?"
          rows={3}
          maxLength={280}
          required
          className="input resize-none"
        />
        <p className="text-xs text-x1-muted text-right">{question.length}/280</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c} className="bg-x1-dark">
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Closing Date & Time <span className="text-red-400">*</span>
        </label>
        <input
          type="datetime-local"
          value={closingDate}
          onChange={(e) => setClosingDate(e.target.value)}
          min={minDate}
          max={maxDate}
          required
          className="input"
        />
        <p className="text-xs text-x1-muted">
          Minimum 1 hour from now. Maximum 1 year.
        </p>
      </div>

      <div className="bg-x1-dark rounded-xl p-4 text-sm text-x1-muted space-y-1">
        <p>• Bets are held in escrow until resolution.</p>
        <p>• The oracle resolves the outcome after the market closes.</p>
        <p>• 2% protocol fee is deducted from winnings.</p>
      </div>

      <button
        type="submit"
        disabled={!question.trim() || !closingDate || isPending || isConfirming}
        className="btn-primary w-full"
      >
        {isPending || isConfirming ? "Creating Market…" : "Create Market"}
      </button>

      {isSuccess && txHash && (
        <div className="text-center space-y-2">
          <p className="text-x1-green text-sm font-medium">
            ✓ Market created successfully!
          </p>
          <a
            href={explorerTxUrl(txHash, CHAIN_ID)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-x1-muted underline"
          >
            View transaction
          </a>
          <button
            type="button"
            onClick={() => router.push("/markets")}
            className="btn-outline w-full mt-2"
          >
            Browse All Markets
          </button>
        </div>
      )}
    </form>
  );
}

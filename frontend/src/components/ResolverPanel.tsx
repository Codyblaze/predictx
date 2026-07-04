"use client";

import { useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { MOCK_ORACLE_ABI } from "@/lib/abis";
import { ORACLE_ADDRESS, explorerTxUrl, CHAIN_ID } from "@/lib/contracts";

interface Props {
  marketAddress: `0x${string}`;
  outcome: number;
  isOpen: boolean;
}

export function ResolverPanel({ marketAddress, outcome, isOpen }: Props) {
  const { address: userAddress } = useAccount();
  const [confirmCancel, setConfirmCancel] = useState(false);

  const { data: isResolver } = useReadContract({
    address: ORACLE_ADDRESS,
    abi: MOCK_ORACLE_ABI,
    functionName: "resolvers",
    args: [userAddress!],
    query: { enabled: !!userAddress },
  });

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  if (!userAddress || !isResolver || outcome !== 0) return null;

  const canResolve = !isOpen;
  const busy = isPending || isConfirming;

  function resolve(yesWon: boolean) {
    writeContract({
      address: ORACLE_ADDRESS,
      abi: MOCK_ORACLE_ABI,
      functionName: "resolveMarket",
      args: [marketAddress, yesWon],
    });
  }

  function cancel() {
    writeContract({
      address: ORACLE_ADDRESS,
      abi: MOCK_ORACLE_ABI,
      functionName: "cancelMarket",
      args: [marketAddress],
    });
    setConfirmCancel(false);
  }

  return (
    <div className="card border border-yellow-500/30 space-y-4">
      <div>
        <h3 className="font-semibold text-yellow-400">Oracle Resolver</h3>
        <p className="text-xs text-x1-muted mt-1">
          Admin-only. Set the final outcome or cancel to refund all bettors.
        </p>
      </div>

      {canResolve ? (
        <div className="flex flex-wrap gap-2">
          <button
            className="btn-primary flex-1 min-w-[120px]"
            onClick={() => resolve(true)}
            disabled={busy}
          >
            {busy ? "Confirming…" : "Resolve YES"}
          </button>
          <button
            className="flex-1 min-w-[120px] py-3 px-4 rounded-xl font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
            onClick={() => resolve(false)}
            disabled={busy}
          >
            {busy ? "Confirming…" : "Resolve NO"}
          </button>
        </div>
      ) : (
        <p className="text-sm text-x1-muted">
          Market is still open for betting. Resolve after closing time.
        </p>
      )}

      {!confirmCancel ? (
        <button
          className="text-sm text-x1-muted hover:text-red-400 transition-colors"
          onClick={() => setConfirmCancel(true)}
          disabled={busy}
        >
          Cancel market (refund all)
        </button>
      ) : (
        <div className="space-y-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30">
          <p className="text-sm text-red-400">
            Cancel refunds every bettor their original stake. This cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-50"
              onClick={cancel}
              disabled={busy}
            >
              Confirm cancel
            </button>
            <button
              className="flex-1 py-2 rounded-lg bg-x1-border text-sm hover:bg-x1-border/80"
              onClick={() => setConfirmCancel(false)}
              disabled={busy}
            >
              Back
            </button>
          </div>
        </div>
      )}

      {isSuccess && txHash && (
        <p className="text-xs text-x1-green">
          Confirmed{" "}
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
    </div>
  );
}

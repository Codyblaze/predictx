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
import { isMarketHidden } from "@/lib/hidden-markets";

interface Props {
  marketAddress: `0x${string}`;
  outcome: number;
  isOpen: boolean;
}

export function ResolverPanel({ marketAddress, outcome, isOpen }: Props) {
  const { address: userAddress } = useAccount();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [archiveStatus, setArchiveStatus] = useState<string | null>(null);
  const [archiving, setArchiving] = useState(false);

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

  if (!userAddress || !isResolver) return null;

  const canResolve = outcome === 0;
  const busy = isPending || isConfirming || archiving;
  const alreadyHidden = isMarketHidden(marketAddress);

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

  async function archive() {
    if (!userAddress) return;
    setArchiving(true);
    setArchiveStatus(null);
    try {
      const res = await fetch("/api/archive-market", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-resolver-address": userAddress,
        },
        body: JSON.stringify({ market: marketAddress }),
      });
      const data = await res.json();
      if (!res.ok) {
        setArchiveStatus(
          data.instruction ??
            data.error ??
            "Archive failed. Run scripts/archive-market.js locally."
        );
      } else if (data.alreadyHidden) {
        setArchiveStatus("Already archived. Redeploy to refresh lists.");
      } else if (data.redeploy) {
        setArchiveStatus(
          data.via === "github"
            ? "Archived. Vercel will redeploy shortly."
            : "Archived locally. Commit and push to apply on production."
        );
      } else {
        setArchiveStatus(data.instruction ?? "Archived.");
      }
    } catch {
      setArchiveStatus("Archive failed. Run: node scripts/archive-market.js " + marketAddress);
    } finally {
      setArchiving(false);
      setConfirmArchive(false);
    }
  }

  return (
    <div className="card border border-yellow-500/30 space-y-4">
      <div>
        <h3 className="font-semibold text-yellow-400">Oracle Resolver</h3>
        <p className="text-xs text-x1-muted mt-1">
          Admin-only. Resolve outcomes, cancel, or hide markets from browse lists.
        </p>
      </div>

      {canResolve && (
        <>
          {!isOpen ? (
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
        </>
      )}

      <div className="border-t border-x1-border pt-4 space-y-2">
        {alreadyHidden ? (
          <p className="text-sm text-x1-muted">This market is archived (hidden from lists).</p>
        ) : !confirmArchive ? (
          <button
            className="text-sm text-x1-muted hover:text-yellow-400 transition-colors"
            onClick={() => setConfirmArchive(true)}
            disabled={busy}
          >
            Archive (hide from lists)
          </button>
        ) : (
          <div className="space-y-2 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
            <p className="text-sm text-yellow-400">
              Hides this market from homepage and browse pages. It stays on-chain and
              reachable by direct link for claims.
            </p>
            <div className="flex gap-2">
              <button
                className="flex-1 py-2 rounded-lg bg-yellow-500 text-black text-sm font-semibold hover:bg-yellow-400 disabled:opacity-50"
                onClick={archive}
                disabled={busy}
              >
                {archiving ? "Archiving…" : "Confirm archive"}
              </button>
              <button
                className="flex-1 py-2 rounded-lg bg-x1-border text-sm hover:bg-x1-border/80"
                onClick={() => setConfirmArchive(false)}
                disabled={busy}
              >
                Back
              </button>
            </div>
          </div>
        )}
        {archiveStatus && (
          <p className="text-xs text-x1-green">{archiveStatus}</p>
        )}
      </div>

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

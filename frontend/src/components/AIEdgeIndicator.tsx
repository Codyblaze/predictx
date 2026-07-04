"use client";

import clsx from "clsx";

interface Props {
  marketYesPercent: number;
  aiYesPercent: number;
  loading?: boolean;
}

export function AIEdgeIndicator({
  marketYesPercent,
  aiYesPercent,
  loading,
}: Props) {
  if (loading) {
    return (
      <div className="text-xs text-x1-muted animate-pulse pt-2 border-t border-x1-border">
        Calculating edge…
      </div>
    );
  }

  const edge = aiYesPercent - marketYesPercent;
  const edgeLabel =
    edge > 0 ? `AI +${edge}% vs market` : edge < 0 ? `AI ${edge}% vs market` : "AI aligned with market";

  return (
    <div className="pt-3 border-t border-x1-border space-y-2 text-xs">
      <div className="flex justify-between text-x1-muted">
        <span>Market implied</span>
        <span className="text-white font-medium">YES {marketYesPercent}%</span>
      </div>
      <div className="flex justify-between text-x1-muted">
        <span>AI estimate</span>
        <span className="text-x1-green font-medium">YES {aiYesPercent}%</span>
      </div>
      <div
        className={clsx(
          "text-center py-2 rounded-lg font-medium",
          edge > 5
            ? "text-x1-green bg-x1-green/10"
            : edge < -5
            ? "text-red-400 bg-red-400/10"
            : "text-x1-muted bg-x1-border/50"
        )}
      >
        {edgeLabel}
      </div>
    </div>
  );
}

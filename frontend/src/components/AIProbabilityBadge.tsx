"use client";

import { useEffect, useState } from "react";
import type { AiScore } from "@/types";

interface Props {
  question: string;
  category: string;
  onScoreLoaded?: (score: Omit<AiScore, "loading">) => void;
}

export function AIProbabilityBadge({
  question,
  category,
  onScoreLoaded,
}: Props) {
  const [score, setScore] = useState<AiScore>({
    yesProbability: 50,
    noProbability: 50,
    summary: "",
    confidence: "low",
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchScore() {
      try {
        const res = await fetch("/api/ai-score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question,
            category,
          }),
        });

        if (!res.ok) throw new Error("Non-200");
        const data = await res.json();

        if (!cancelled) {
          const loaded = { ...data, loading: false };
          setScore(loaded);
          onScoreLoaded?.(loaded);
        }
      } catch {
        if (!cancelled) {
          setScore((s) => ({ ...s, loading: false, error: "AI unavailable" }));
        }
      }
    }

    fetchScore();
    return () => { cancelled = true; };
  }, [question, category, onScoreLoaded]);

  if (score.loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-x1-muted animate-pulse">
        <span className="w-2 h-2 rounded-full bg-x1-muted" />
        AI scoring…
      </div>
    );
  }

  if (score.error) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-x1-muted">
        <span className="flex items-center gap-1">
          🤖 AI Score
          <span
            className={
              score.confidence === "high"
                ? "text-x1-green"
                : score.confidence === "medium"
                ? "text-yellow-400"
                : "text-x1-muted"
            }
          >
            ({score.confidence})
          </span>
        </span>
        <span className="text-x1-green font-medium">YES {score.yesProbability}%</span>
      </div>

      <div className="w-full h-2 rounded-full bg-x1-border overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-x1-green to-emerald-400 transition-all duration-700"
          style={{ width: `${score.yesProbability}%` }}
        />
      </div>

      {score.summary && (
        <p className="text-xs text-x1-muted leading-relaxed">{score.summary}</p>
      )}
    </div>
  );
}

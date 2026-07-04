"use client";

import { useState } from "react";
import { Share2, Copy, Check } from "lucide-react";

interface Props {
  marketAddress: string;
  question: string;
}

function buildShareUrls(marketUrl: string, question: string) {
  const text = encodeURIComponent(`Predict on PredictX: ${question}`);
  const url = encodeURIComponent(marketUrl);
  return {
    twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
    telegram: `https://t.me/share/url?url=${url}&text=${text}`,
  };
}

export function ShareMarket({ marketAddress, question }: Props) {
  const [copied, setCopied] = useState(false);
  const marketUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/markets/${marketAddress}`
      : `https://predictx1.com/markets/${marketAddress}`;

  const { twitter, telegram } = buildShareUrls(marketUrl, question);

  async function copyLink() {
    await navigator.clipboard.writeText(marketUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-x1-muted flex items-center gap-1">
        <Share2 className="w-4 h-4" />
        Share
      </span>
      <button
        onClick={copyLink}
        className="p-2 rounded-lg bg-x1-border hover:bg-x1-green/20 text-x1-muted hover:text-x1-green transition-colors"
        title="Copy link"
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>
      <a
        href={twitter}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg bg-x1-border hover:bg-x1-green/20 text-x1-muted hover:text-x1-green transition-colors text-xs font-semibold"
        title="Share on X"
      >
        𝕏
      </a>
      <a
        href={telegram}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg bg-x1-border hover:bg-x1-green/20 text-x1-muted hover:text-x1-green transition-colors text-xs font-semibold"
        title="Share on Telegram"
      >
        TG
      </a>
    </div>
  );
}

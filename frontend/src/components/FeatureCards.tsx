"use client";

import { useAvgBetGas } from "@/hooks/useAvgBetGas";

const STATIC_FEATURES = [
  {
    icon: "🤖",
    title: "AI Probability Scoring",
    desc: "Every market gets independent YES/NO probability estimates powered by GPT-4o-mini — separate from live pool odds.",
  },
  {
    icon: "🔒",
    title: "Non-Custodial Escrow",
    desc: "Funds are locked in audited smart contracts. No admin keys. Winners claim trustlessly.",
  },
];

export function FeatureCards() {
  const { formatted: gasFormatted, isLoading: gasLoading } = useAvgBetGas();
  const gasText = gasLoading ? "sub-cent" : gasFormatted ?? "sub-cent";

  const features = [
    STATIC_FEATURES[0],
    {
      icon: "⚡",
      title: "Sub-cent Fees on X1",
      desc: `X1 Maculatus delivers ${gasText} average gas per bet — true sub-cent fees, bet freely without friction.`,
    },
    STATIC_FEATURES[1],
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {features.map((f) => (
        <div key={f.title} className="card space-y-3">
          <div className="text-3xl">{f.icon}</div>
          <h3 className="font-semibold text-lg">{f.title}</h3>
          <p className="text-x1-muted text-sm leading-relaxed">{f.desc}</p>
        </div>
      ))}
    </section>
  );
}

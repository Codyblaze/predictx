"use client";

import { useReadContract } from "wagmi";
import { MARKET_FACTORY_ABI } from "@/lib/abis";
import { MARKET_FACTORY_ADDRESS } from "@/lib/contracts";

export function HeroStats() {
  const { data: count } = useReadContract({
    address: MARKET_FACTORY_ADDRESS,
    abi: MARKET_FACTORY_ABI,
    functionName: "getMarketCount",
  });

  const stats = [
    { label: "Active Markets", value: count != null ? String(count) : "—" },
    { label: "Chain", value: "X1 EcoChain" },
    { label: "Avg Gas", value: "~$0.01" },
    { label: "Protocol Fee", value: "2%" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="card text-center space-y-1">
          <div className="text-2xl font-bold text-x1-green">{s.value}</div>
          <div className="text-x1-muted text-sm">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

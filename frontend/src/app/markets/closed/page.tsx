import { MarketList } from "@/components/MarketList";
import { MarketNavTabs } from "@/components/MarketNavTabs";
import Link from "next/link";

export const metadata = {
  title: "Closed Markets — PredictX",
};

export default function ClosedMarketsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Closed & Resolved Markets</h1>
          <p className="text-x1-muted mt-1">
            Ended markets. Claim winnings from{" "}
            <Link href="/portfolio" className="text-x1-green hover:underline">
              Portfolio
            </Link>{" "}
            or open a market directly.
          </p>
        </div>
        <MarketNavTabs />
      </div>
      <MarketList
        statusFilter="closed"
        limit={50}
        showFilters
        emptyMessage="No closed markets yet."
      />
    </div>
  );
}

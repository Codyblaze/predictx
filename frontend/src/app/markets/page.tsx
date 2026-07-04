import { MarketList } from "@/components/MarketList";
import { MarketNavTabs } from "@/components/MarketNavTabs";
import Link from "next/link";

export const metadata = {
  title: "Markets — PredictX",
};

export default function MarketsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Open Markets</h1>
          <p className="text-x1-muted mt-1">Browse and bet on live prediction markets</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <MarketNavTabs />
          <Link href="/markets/create" className="btn-primary">
            + Create Market
          </Link>
        </div>
      </div>
      <MarketList statusFilter="open" limit={50} showFilters />
    </div>
  );
}

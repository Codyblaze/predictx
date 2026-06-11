import { MarketList } from "@/components/MarketList";
import Link from "next/link";

export const metadata = {
  title: "Markets — PredictX",
};

export default function MarketsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">All Markets</h1>
          <p className="text-x1-muted mt-1">Browse and bet on live prediction markets</p>
        </div>
        <Link href="/markets/create" className="btn-primary">
          + Create Market
        </Link>
      </div>
      <MarketList limit={50} showFilters />
    </div>
  );
}

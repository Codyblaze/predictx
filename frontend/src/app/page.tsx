import { MarketList } from "@/components/MarketList";
import { HeroStats } from "@/components/HeroStats";
import { FeatureCards } from "@/components/FeatureCards";
import Link from "next/link";
export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="text-center space-y-6 pt-8 pb-4">
        <div className="inline-flex items-center gap-2 bg-x1-green/10 border border-x1-green/30 rounded-full px-4 py-1.5 text-x1-green text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-x1-green animate-pulse" />
          Live on X1 Maculatus Testnet
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
          Predict the Future,{" "}
          <span className="text-x1-green">On-Chain</span>
        </h1>

        <p className="text-xl text-x1-muted max-w-2xl mx-auto">
          Create and trade binary outcome markets on X1 EcoChain. Every market
          is powered by AI probability scoring, secured by smart contracts, and
          settled with sub-cent fees.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/markets/create" className="btn-primary text-lg px-8 py-4">
            Create a Market
          </Link>
          <Link href="/markets" className="btn-outline text-lg px-8 py-4">
            Browse Markets
          </Link>
        </div>
      </section>

      <HeroStats />

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Latest Markets</h2>
          <Link href="/markets" className="text-x1-green text-sm hover:underline">
            View all →
          </Link>
        </div>
        <MarketList limit={6} />
      </section>

      <FeatureCards />
    </div>
  );
}
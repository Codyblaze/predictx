import { MarketList } from "@/components/MarketList";
import { HeroStats } from "@/components/HeroStats";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="text-center space-y-6 pt-8 pb-4">
        <div className="inline-flex items-center gap-2 bg-x1-green/10 border border-x1-green/30 rounded-full px-4 py-1.5 text-x1-green text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-x1-green animate-pulse" />
          Live on X1 EcoChain Testnet
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

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: "🤖",
            title: "AI Probability Scoring",
            desc: "Every market gets real-time YES/NO probability estimates powered by GPT-4o-mini sentiment analysis.",
          },
          {
            icon: "⚡",
            title: "Sub-cent Fees on X1",
            desc: "X1 EcoChain's Proof-of-Nodes consensus delivers ~0.01$ average gas — bet freely without friction.",
          },
          {
            icon: "🔒",
            title: "Non-Custodial Escrow",
            desc: "Funds are locked in audited smart contracts. No admin keys. Winners claim trustlessly.",
          },
        ].map((f) => (
          <div key={f.title} className="card space-y-3">
            <div className="text-3xl">{f.icon}</div>
            <h3 className="font-semibold text-lg">{f.title}</h3>
            <p className="text-x1-muted text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

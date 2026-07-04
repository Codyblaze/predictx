import { PortfolioPositions } from "@/components/PortfolioPositions";

export default function PortfolioPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Portfolio</h1>
        <p className="text-x1-muted mt-2">
          Your bet history, claimable winnings, and created markets.
        </p>
      </div>
      <PortfolioPositions />
    </div>
  );
}

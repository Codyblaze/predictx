import { MarketDetail } from "@/components/MarketDetail";

export const metadata = {
  title: "Market — PredictX",
};

export default function MarketPage({ params }: { params: { address: string } }) {
  return <MarketDetail address={params.address as `0x${string}`} />;
}

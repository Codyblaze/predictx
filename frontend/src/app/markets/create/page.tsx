import { CreateMarketForm } from "@/components/CreateMarketForm";

export const metadata = {
  title: "Create Market — PredictX",
};

export default function CreateMarketPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create a Market</h1>
        <p className="text-x1-muted mt-1">
          Ask a YES/NO question. The market closes at your chosen time and is
          resolved by the oracle.
        </p>
      </div>
      <CreateMarketForm />
    </div>
  );
}

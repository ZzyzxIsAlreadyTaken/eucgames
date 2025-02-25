import { Suspense } from "react";
import { StatsContent } from "./_components/StatsContent";

export default function StatsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-center text-4xl font-bold">
        Stein, Saks, Papir Scores
      </h1>

      <div className="mx-auto max-w-4xl space-y-8">
        <Suspense
          fallback={<div className="text-center">Laster statistikk...</div>}
        >
          <StatsContent />
        </Suspense>
      </div>
    </div>
  );
}

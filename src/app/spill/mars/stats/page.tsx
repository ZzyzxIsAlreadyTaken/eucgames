import { Suspense } from "react";
import { StatsContent } from "./_components/StatsContent";
import Link from "next/link";

export default function StatsPage() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <h1 className="mb-8 text-center text-4xl font-bold">
        Stein, Saks, Papir <span className="text-[#CC65FF]">Scores</span>
      </h1>

      <div className="container mx-auto max-w-7xl space-y-8 px-4">
        <Suspense
          fallback={<div className="text-center">Laster statistikk...</div>}
        >
          <StatsContent />
        </Suspense>
        <Link href="/spill/mars" className="text-center text-lg text-white">
          <span className="mt-8 block py-8">← Tilbake til spilloversikt</span>
        </Link>
      </div>
    </main>
  );
}

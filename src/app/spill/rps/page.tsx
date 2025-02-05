import { Suspense } from "react";
import { CreateGame } from "./_components/CreateGame";
import { GameList } from "./_components/GameList";

export default function RPSPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-center text-4xl font-bold">
        Rock Paper Scissors
      </h1>

      <div className="mx-auto max-w-2xl space-y-8">
        <div className="flex w-full justify-center">
          <CreateGame />
        </div>

        <div className="rounded-lg bg-white/5 p-6">
          <h2 className="mb-4 text-2xl font-semibold">Available Games</h2>
          <Suspense
            fallback={<div className="text-center">Loading games...</div>}
          >
            <GameList />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

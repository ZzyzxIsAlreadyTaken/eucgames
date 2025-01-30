// JoinGame.tsx (Join an Open Game UI)
"use client";

import { joinGame } from "./gameActions";

export default function JoinGame({ playerId }: { playerId: string }) {
  return (
    <form
      action={(formData) => {
        const choice = formData.get("choice") as string;
        void joinGame(playerId, choice);
      }}
      className="flex flex-col items-center gap-4"
    >
      <h2 className="text-2xl font-bold">Join a Game</h2>
      <div className="flex gap-4">
        <button
          type="submit"
          name="choice"
          value="rock"
          className="rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-purple-700"
        >
          Rock
        </button>
        <button
          type="submit"
          name="choice"
          value="paper"
          className="rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-purple-700"
        >
          Paper
        </button>
        <button
          type="submit"
          name="choice"
          value="scissors"
          className="rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-purple-700"
        >
          Scissors
        </button>
      </div>
    </form>
  );
}

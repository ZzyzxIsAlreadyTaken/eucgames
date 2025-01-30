"use client";

import { useEffect, useState } from "react";
import { getResults } from "./gameActions";
import type { RPSgames } from "~/server/db/schema";

export default function GameResults({ playerId }: { playerId: string }) {
  const [games, setGames] = useState<(typeof RPSgames.$inferSelect)[]>([]);

  useEffect(() => {
    const fetchGames = async () => {
      const results = await getResults(playerId);
      setGames(results);
    };
    void fetchGames();
  }, [playerId]);

  return (
    <div>
      <h2>Game Results</h2>
      <ul>
        {games.map((game) => (
          <li key={game.id}>
            Your choice: {game.player1Choice} | Opponent&apos;s choice:{" "}
            {game.player2Choice ?? "Waiting..."}
            {game.completed
              ? ` → ${game.winnerId === playerId ? "You won!" : game.winnerId ? "You lost!" : "It was a tie!"}`
              : " (Game in progress)"}
          </li>
        ))}
      </ul>
    </div>
  );
}

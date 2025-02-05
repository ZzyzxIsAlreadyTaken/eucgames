"use client";

import { useEffect, useState } from "react";
import { JoinButton } from "./JoinButton";
import { getGames } from "../_actions/getGames";

interface Game {
  id: number;
  gameId: string;
  creatorId: string;
  joinerId: string | null;
  status: string;
  winnerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface GameListContentProps {
  initialGames: Game[];
}

export function GameListContent({ initialGames }: GameListContentProps) {
  const [games, setGames] = useState<Game[]>(initialGames);

  useEffect(() => {
    let mounted = true;

    const refreshGames = async () => {
      try {
        const result = await getGames();
        if (mounted && result.success && result.games) {
          setGames(result.games);
        }
      } catch (error) {
        console.error("Failed to refresh games:", error);
      }
    };

    // Initial refresh
    void refreshGames();

    // Poll for new games every 5 seconds
    const interval = setInterval(() => {
      void refreshGames();
    }, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (games.length === 0) {
    return (
      <div className="text-center text-gray-500">
        No games available. Create one to start playing!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {games.map((game) => (
        <div
          key={game.gameId}
          className="flex items-center justify-between rounded-lg bg-white/10 p-4"
        >
          <div>
            <p className="font-medium">Game #{game.gameId.slice(0, 8)}</p>
            <p className="text-sm text-gray-400">
              Created {new Date(game.createdAt).toLocaleString()}
            </p>
          </div>
          <JoinButton gameId={game.gameId} />
        </div>
      ))}
    </div>
  );
}

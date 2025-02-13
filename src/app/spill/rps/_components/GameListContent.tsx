"use client";

import { useEffect, useState } from "react";
import { JoinButton } from "./JoinButton";
import { getGames } from "../_actions/getGames";
import { Button } from "./Button";
import { useRouter } from "next/navigation";

interface Game {
  id: number;
  gameId: string;
  creatorId: string;
  joinerId: string | null;
  status: string;
  winnerId: string | null;
  createdAt: Date;
  updatedAt: Date;
  hasPlayerMoved: boolean;
  moveCount: number;
}

interface GameListContentProps {
  initialGames: Game[];
}

export function GameListContent({ initialGames }: GameListContentProps) {
  const [games, setGames] = useState<Game[]>(initialGames);
  const router = useRouter();

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
            {(game.status === "IN_PROGRESS" || game.status === "COMPLETED") && (
              <p
                className={`mt-1 text-sm font-medium ${
                  game.status === "COMPLETED"
                    ? game.winnerId === null
                      ? "text-yellow-300" // Draw
                      : "text-green-300" // Game complete
                    : "text-purple-300" // In progress
                }`}
              >
                {game.status === "COMPLETED"
                  ? game.winnerId === null
                    ? "Game ended in a draw!"
                    : "Game complete - View result!"
                  : game.hasPlayerMoved
                    ? "Waiting for opponent's move"
                    : "Your turn to move!"}
              </p>
            )}
          </div>
          {game.status === "WAITING" ? (
            <JoinButton gameId={game.gameId} />
          ) : (
            <Button
              onClick={() => router.push(`/spill/rps/${game.gameId}`)}
              variant={
                game.status === "COMPLETED"
                  ? "default"
                  : game.hasPlayerMoved
                    ? "secondary"
                    : "default"
              }
            >
              {game.status === "COMPLETED"
                ? "View Result"
                : game.hasPlayerMoved
                  ? "View Game"
                  : "Make Your Move"}
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}

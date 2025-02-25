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
  resultSeen: boolean;
}

interface GameListContentProps {
  initialGames: Game[];
  userId: string;
}

export function GameListContent({
  initialGames,
  userId,
}: GameListContentProps) {
  const [games, setGames] = useState<Game[]>(initialGames);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const refreshGames = async () => {
      try {
        const result = await getGames();
        if (mounted && result.success && result.games) {
          // Sort games by creation date (newest first)
          const sortedGames = [...result.games].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
          setGames(sortedGames);
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

  // Sort initial games by creation date (newest first)
  useEffect(() => {
    const sortedGames = [...initialGames].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    setGames(sortedGames);
  }, [initialGames]);

  // Helper function to format dates consistently
  const formatDate = (date: Date) => {
    // Using a fixed format that will be consistent between server and client
    return new Date(date).toISOString().replace("T", " ").substring(0, 19);
  };

  if (games.length === 0) {
    return (
      <div className="text-center text-gray-500">
        Ingen spill tilgjengelig. Opprett et for å begynne å spille!
      </div>
    );
  }

  // Separate games by status
  const waitingGames = games.filter((game) => game.status === "WAITING");
  const inProgressGames = games.filter((game) => game.status === "IN_PROGRESS");
  const completedGames = games.filter((game) => game.status === "COMPLETED");

  // Helper function to render game cards
  const renderGameCard = (game: Game) => {
    const isCreator = game.creatorId === userId;
    const isJoiner = game.joinerId === userId;
    const isParticipant = isCreator || isJoiner;
    const resultSeen = game.resultSeen;

    return (
      <div
        key={game.gameId}
        className={`flex flex-col justify-between rounded-lg ${
          isParticipant ? "bg-white/15" : "bg-white/10"
        } h-full p-4`}
      >
        <div>
          <div className="flex items-center">
            <p className="font-medium">Spill #{game.gameId.slice(0, 8)}</p>
            {isCreator && (
              <span className="ml-2 rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-300">
                Ditt spill
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400">
            Opprettet {formatDate(game.createdAt)}
          </p>
          {(game.status === "IN_PROGRESS" || game.status === "COMPLETED") && (
            <p
              className={`mt-1 text-sm font-medium ${
                game.status === "COMPLETED"
                  ? resultSeen
                    ? game.winnerId === null
                      ? "text-yellow-300" // Draw
                      : game.winnerId === userId
                        ? "text-green-300" // Won the game
                        : "text-red-300" // Lost the game
                    : "text-purple-300" // Result not seen yet
                  : "text-purple-300" // In progress
              }`}
            >
              {game.status === "COMPLETED"
                ? resultSeen
                  ? game.winnerId === null
                    ? "Spillet endte uavgjort!"
                    : game.winnerId === userId
                      ? "Du vant spillet!"
                      : "Du tapte spillet!"
                  : "Ikke sjekket" // Result not seen yet
                : game.hasPlayerMoved
                  ? "Venter på motstanderens trekk"
                  : "Din tur til å gjøre et trekk!"}
            </p>
          )}
        </div>
        <div className="mt-4">
          {game.status === "WAITING" ? (
            isCreator ? (
              <Button
                onClick={() => router.push(`/spill/rps/${game.gameId}`)}
                variant="secondary"
                className="w-full"
              >
                Se spill
              </Button>
            ) : (
              <JoinButton gameId={game.gameId} className="w-full" />
            )
          ) : (
            <Button
              onClick={() => router.push(`/spill/rps/${game.gameId}`)}
              variant={
                game.status === "COMPLETED"
                  ? resultSeen
                    ? "default"
                    : "default"
                  : game.hasPlayerMoved
                    ? "secondary"
                    : "default"
              }
              className="w-full"
            >
              {game.status === "COMPLETED"
                ? resultSeen
                  ? "Se resultat"
                  : "Sjekk resultat!"
                : game.hasPlayerMoved
                  ? "Se spill"
                  : "Gjør ditt trekk"}
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Waiting and In Progress Games */}
      {(waitingGames.length > 0 || inProgressGames.length > 0) && (
        <div>
          <h3 className="mb-4 text-xl font-semibold">Aktive spill</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {waitingGames.map(renderGameCard)}
            {inProgressGames.map(renderGameCard)}
          </div>
        </div>
      )}

      {/* Completed Games */}
      {completedGames.length > 0 && (
        <div>
          <h3 className="mb-4 text-xl font-semibold">Fullførte spill</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {completedGames.map(renderGameCard)}
          </div>
        </div>
      )}
    </div>
  );
}

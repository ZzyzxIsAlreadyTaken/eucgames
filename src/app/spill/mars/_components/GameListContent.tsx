"use client";

import { useEffect, useState } from "react";
import { JoinButton } from "./JoinButton";
import { getGames } from "../_actions/getGames";
import { Button } from "./Button";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

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
  userMap?: Record<string, string>;
}

export function GameListContent({
  initialGames,
  userId,
  userMap = {},
}: GameListContentProps) {
  const [games, setGames] = useState<Game[]>(initialGames);
  const router = useRouter();
  const { user } = useUser();

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
  }, [userId]);

  // Helper function to format dates consistently
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("no", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper function to get user name from ID
  const getUserName = (id: string | null) => {
    if (!id) return "Ukjent";

    // First check if we have the user in the userMap
    if (userMap[id]) {
      return userMap[id];
    }

    // If it's the current user, use their name from Clerk
    if (id === userId && user) {
      return user.firstName ?? user.username ?? `Spiller ${id.substring(0, 6)}`;
    }

    // Fallback to a generic player name with ID
    return `Spiller ${id.substring(0, 6)}`;
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

  // Add debugging information
  console.log("All games:", games);
  console.log("Waiting games:", waitingGames);
  console.log("In progress games:", inProgressGames);
  console.log("Completed games:", completedGames);

  // Helper function to render game rows
  const renderGameRow = (game: Game) => {
    const isCreator = game.creatorId === userId;
    const isJoiner = game.joinerId === userId;
    const isParticipant = isCreator || isJoiner;
    const resultSeen = game.resultSeen;
    const creatorName = getUserName(game.creatorId);
    const joinerName = getUserName(game.joinerId);

    // Add debugging for each game
    console.log(`Rendering game ${game.gameId}:`, {
      status: game.status,
      creatorId: game.creatorId,
      joinerId: game.joinerId,
      isCreator,
      isJoiner,
      isParticipant,
    });

    // Determine result text for completed games
    let resultText = "";
    if (game.status === "COMPLETED") {
      if (game.winnerId === null) {
        resultText = "Uavgjort";
      } else if (game.winnerId === userId) {
        resultText = "Du vant";
      } else {
        resultText = "Du tapte";
      }
    }

    return (
      <tr
        key={game.gameId}
        className={`border-b border-white/10 ${isParticipant ? "bg-white/5" : ""} hover:bg-white/10`}
      >
        <td className="px-4 py-3">
          <div className="flex items-center">
            <span className="font-medium">{creatorName}</span>
            {isCreator && (
              <span className="ml-2 rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-300">
                Deg
              </span>
            )}
          </div>
        </td>
        <td className="px-4 py-3 text-sm">{formatDate(game.createdAt)}</td>
        <td className="px-4 py-3">
          {game.status === "IN_PROGRESS" && (
            <span className={`text-sm font-medium text-purple-300`}>
              {isCreator
                ? game.hasPlayerMoved
                  ? "Venter på motspiller"
                  : "Din tur"
                : game.hasPlayerMoved
                  ? "Venter på motspiller"
                  : "Din tur"}
            </span>
          )}
          {game.status === "WAITING" && (
            <span className="text-sm text-gray-400">
              {isCreator ? "Venter på motspiller" : "Venter på utfordrer"}
            </span>
          )}
          {game.status === "COMPLETED" && (
            <span
              className={`text-sm font-medium ${
                game.winnerId === userId
                  ? "text-green-400"
                  : game.winnerId === null
                    ? "text-yellow-400"
                    : "text-red-400"
              }`}
            >
              {resultText} (mot {isCreator ? joinerName : creatorName})
            </span>
          )}
        </td>
        <td className="px-4 py-3 text-right">
          <div className="inline-block w-32">
            {game.status === "WAITING" ? (
              isCreator ? (
                <Button
                  onClick={() => router.push(`/spill/mars/${game.gameId}`)}
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
                onClick={() => router.push(`/spill/mars/${game.gameId}`)}
                variant={
                  game.status === "COMPLETED"
                    ? resultSeen
                      ? "secondary"
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
                    : "Sjekk resultat"
                  : game.hasPlayerMoved
                    ? "Se spill"
                    : "Gjør trekk"}
              </Button>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-8">
      {/* Waiting and In Progress Games */}
      {(waitingGames.length > 0 || inProgressGames.length > 0) && (
        <div>
          <h3 className="mb-4 text-xl font-semibold">Aktive spill</h3>
          <div className="overflow-x-auto rounded-lg border border-white/10">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-left">Opprettet av</th>
                  <th className="px-4 py-3 text-left">Dato</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Handling</th>
                </tr>
              </thead>
              <tbody>
                {waitingGames.map(renderGameRow)}
                {inProgressGames.map(renderGameRow)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Completed Games */}
      {completedGames.length > 0 && (
        <div>
          <h3 className="mb-4 text-xl font-semibold">Fullførte spill</h3>
          <div className="overflow-x-auto rounded-lg border border-white/10">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-left">Opprettet av</th>
                  <th className="px-4 py-3 text-left">Dato</th>
                  <th className="px-4 py-3 text-left">Resultat</th>
                  <th className="px-4 py-3 text-right">Handling</th>
                </tr>
              </thead>
              <tbody>{completedGames.map(renderGameRow)}</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

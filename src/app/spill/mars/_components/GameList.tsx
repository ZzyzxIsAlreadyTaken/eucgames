import { getGames } from "../_actions/getGames";
import { GameListContent } from "./GameListContent";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "../../../../lib/clerkClient";

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

async function fetchUserNames(
  userIds: string[],
): Promise<Record<string, string>> {
  const userMap: Record<string, string> = {};

  for (const id of userIds) {
    try {
      const user = await clerkClient.users.getUser(id);
      userMap[id] =
        user.firstName ?? user.username ?? `Spiller ${id.substring(0, 6)}`;
    } catch (error) {
      console.error(`Failed to fetch user ${id}:`, error);
      userMap[id] = `Spiller ${id.substring(0, 6)}`;
    }
  }

  return userMap;
}

export async function GameList() {
  const result = await getGames();
  const { userId } = await auth();
  if (!userId) {
    return (
      <div className="text-center text-red-500">
        Du må være logget inn for å se spill.
      </div>
    );
  }

  if (!result.success) {
    return (
      <div className="text-center text-red-500">
        Fikk ikke lastet spill. Prøv igjen senere.
      </div>
    );
  }

  const userIds = [
    ...new Set(
      result.games
        ?.map((g) => [g.creatorId, g.joinerId])
        .flat()
        .filter((id): id is string => id !== null) ?? [],
    ),
  ];
  const userMap = await fetchUserNames(userIds);

  return (
    <GameListContent
      initialGames={result.games ?? []}
      userId={userId}
      userMap={userMap}
    />
  );
}

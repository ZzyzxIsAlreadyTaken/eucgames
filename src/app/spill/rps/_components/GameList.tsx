import { getGames } from "../_actions/getGames";
import { GameListContent } from "./GameListContent";
import { auth } from "@clerk/nextjs/server";

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

  return <GameListContent initialGames={result.games ?? []} userId={userId} />;
}

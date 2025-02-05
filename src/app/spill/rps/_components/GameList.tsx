import { getGames } from "../_actions/getGames";
import { GameListContent } from "./GameListContent";

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

  if (!result.success) {
    return (
      <div className="text-center text-red-500">
        Failed to load games. Please try again later.
      </div>
    );
  }

  return <GameListContent initialGames={result.games ?? []} />;
}

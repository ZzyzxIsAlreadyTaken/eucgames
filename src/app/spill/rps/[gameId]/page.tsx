import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "~/server/db";
import { rpsGames } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { GameBoard } from "../_components/GameBoard";

export default async function GamePage({
  params,
}: {
  params: { gameId: string | string[] };
}) {
  // Use optional chaining to handle undefined params
  if (!params?.gameId) {
    redirect("/spill/rps");
  }

  const gameId =
    typeof params.gameId === "string" ? params.gameId : params.gameId[0];

  if (!gameId) {
    redirect("/spill/rps");
  }

  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const [game] = await db
    .select()
    .from(rpsGames)
    .where(eq(rpsGames.gameId, gameId));

  if (!game) {
    redirect("/spill/rps");
  }

  const isCreator = game.creatorId === userId;
  const isJoiner = game.joinerId === userId;

  if (!isCreator && !isJoiner) {
    redirect("/spill/rps");
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-center text-4xl font-bold">
        Rock Paper Scissors
      </h1>
      <div className="mx-auto max-w-2xl">
        <GameBoard game={game} userId={userId} />
      </div>
    </div>
  );
}

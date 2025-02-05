import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "~/server/db";
import { rpsGames } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { GameBoard } from "../_components/GameBoard";

export default async function GamePage({
  params,
}: {
  params: { gameId: string };
}) {
  // Optional: If you need to check for undefined (for extra safety)
  if (!params.gameId) {
    redirect("/spill/rps");
  }

  // Now you can use params.gameId as a string.
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const [game] = await db
    .select()
    .from(rpsGames)
    .where(eq(rpsGames.gameId, params.gameId));

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

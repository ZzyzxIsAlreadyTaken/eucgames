import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "~/lib/clerkClient";
import type { User } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "~/server/db";
import { rpsGames, rpsMoves } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { GameBoard } from "../_components/GameBoard";
export default async function GamePage({
  params,
}: {
  params: { gameId: string };
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [game] = await db
    .select()
    .from(rpsGames)
    .where(eq(rpsGames.gameId, params.gameId));

  if (!game || (game.creatorId !== userId && game.joinerId !== userId)) {
    redirect("/spill/rps");
  }

  // Fetch user details concurrently
  async function safeGetUser(userId: string | null): Promise<User | null> {
    if (!userId) return null;
    try {
      return await clerkClient.users.getUser(userId);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`Error fetching user ${userId}:`, error.message);
      } else {
        console.error(`Unknown error fetching user ${userId}:`, error);
      }
      return null;
    }
  }

  // Usage:
  const [creator, joiner] = await Promise.all([
    safeGetUser(game.creatorId),
    safeGetUser(game.joinerId),
  ]);

  // Get moves if game is completed
  let moves;
  if (game.status === "COMPLETED") {
    moves = await db
      .select()
      .from(rpsMoves)
      .where(eq(rpsMoves.gameId, params.gameId));
  }

  const gameWithMoves = {
    ...game,
    moves,
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-center text-4xl font-bold">
        Rock Paper Scissors
      </h1>
      <div className="mx-auto max-w-2xl">
        <GameBoard
          game={gameWithMoves}
          userId={userId}
          creatorName={creator?.firstName ?? creator?.username ?? "Unknown"}
          joinerName={joiner?.firstName ?? joiner?.username ?? null}
        />
      </div>
    </div>
  );
}

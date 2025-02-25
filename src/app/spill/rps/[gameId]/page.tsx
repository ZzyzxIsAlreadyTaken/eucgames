import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "~/lib/clerkClient";
import type { User } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "~/server/db";
import { rpsGames, rpsMoves, rpsGameResults } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
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

    // Transform the moves to match the expected type
    moves = moves.map((move) => ({
      playerId: move.playerId,
      move: move.move.toUpperCase() as "ROCK" | "PAPER" | "SCISSORS",
    }));
  }

  // Check if the user has already seen the result
  let resultSeen = false;
  if (game.status === "COMPLETED") {
    const [seenRecord] = await db
      .select()
      .from(rpsGameResults)
      .where(
        and(
          eq(rpsGameResults.gameId, params.gameId),
          eq(rpsGameResults.userId, userId),
        ),
      );

    resultSeen = !!seenRecord;
  }

  const gameWithMoves = {
    ...game,
    moves,
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="mt-10 text-2xl font-semibold tracking-tight text-white">
          Stein Saks Papir - {game.gameId}
        </h1>
        <div className="mx-auto max-w-2xl">
          <GameBoard
            game={gameWithMoves}
            userId={userId}
            creatorName={creator?.firstName ?? creator?.username ?? "Unknown"}
            joinerName={joiner?.firstName ?? joiner?.username ?? null}
            resultSeen={resultSeen}
          />
        </div>
      </div>
    </main>
  );
}

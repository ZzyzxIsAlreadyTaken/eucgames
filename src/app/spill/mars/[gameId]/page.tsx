import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "~/lib/clerkClient";
import type { User } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "~/server/db";
import { rpsGames, rpsMoves, rpsGameResults } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import { GameBoard } from "../_components/GameBoard";

// Define a type that matches what the component actually receives
type GamePageParams = {
  params: { gameId: string };
};

// Create a wrapper that returns props in a format similar to getServerSideProps
async function getGameProps(params: { gameId: string }) {
  const { userId } = await auth();
  if (!userId)
    return { redirect: { destination: "/sign-in", permanent: false } };

  const gameId = params.gameId;

  const [game] = await db
    .select()
    .from(rpsGames)
    .where(eq(rpsGames.gameId, gameId));

  if (!game || (game.creatorId !== userId && game.joinerId !== userId)) {
    return { redirect: { destination: "/spill/mars", permanent: false } };
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
    moves = await db.select().from(rpsMoves).where(eq(rpsMoves.gameId, gameId));

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
          eq(rpsGameResults.gameId, gameId),
          eq(rpsGameResults.userId, userId),
        ),
      );

    resultSeen = !!seenRecord;
  }

  // After fetching the game, also fetch any existing moves
  let userMove = undefined;
  if (game.status === "IN_PROGRESS") {
    const moves = await db
      .select()
      .from(rpsMoves)
      .where(eq(rpsMoves.gameId, gameId));
    userMove = moves.find((m) => m.playerId === userId)?.move?.toUpperCase() as
      | "ROCK"
      | "PAPER"
      | "SCISSORS"
      | undefined;
  }

  const gameWithMoves = {
    ...game,
    moves,
  };

  return {
    props: {
      game: gameWithMoves,
      userId,
      creatorName: creator?.firstName ?? creator?.username ?? "Unknown",
      joinerName: joiner?.firstName ?? joiner?.username ?? null,
      resultSeen,
      userMove,
    },
  };
}

export default async function GamePage({ params }: GamePageParams) {
  const propsData = await getGameProps(params);

  // Handle redirect if present
  if ("redirect" in propsData) {
    redirect(propsData.redirect.destination);
    return null; // This line won't execute but TypeScript needs it
  }

  const { game, userId, creatorName, joinerName, resultSeen, userMove } =
    propsData.props;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="mt-10 text-2xl font-semibold tracking-tight text-white">
          Saks, Papir, Stein - {game.gameId}
        </h1>
        <div className="mx-auto max-w-2xl">
          <GameBoard
            game={game}
            userId={userId}
            creatorName={creatorName}
            joinerName={joinerName}
            resultSeen={resultSeen}
            userMove={userMove}
          />
        </div>
      </div>
    </main>
  );
}

import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "~/lib/clerkClient";
import type { User } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { rpsGames, rpsMoves, rpsGameResults } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import { GameBoard } from "../_components/GameBoard";
import { JoinButton } from "../_components/JoinButton";

// Define the Game type to match what's used in GameBoard
type Move = "ROCK" | "PAPER" | "SCISSORS";

interface Game {
  id: number;
  gameId: string;
  creatorId: string;
  joinerId: string | null;
  status: string;
  winnerId: string | null;
  createdAt: Date;
  updatedAt: Date;
  moves?: {
    playerId: string;
    move: Move;
  }[];
}

// Create a wrapper that returns props in a format similar to getServerSideProps
async function getGameProps(gameId: string) {
  try {
    const { userId } = await auth();
    if (!userId)
      return { redirect: { destination: "/sign-in", permanent: false } };

    const [game] = await db
      .select()
      .from(rpsGames)
      .where(eq(rpsGames.gameId, gameId));

    // Add debug logging
    console.log(`Game lookup for ${gameId}:`, {
      found: !!game,
      status: game?.status,
      creatorId: game?.creatorId,
      joinerId: game?.joinerId,
      currentUserId: userId,
    });

    if (!game) {
      console.error(`Game not found: ${gameId}`);
      return { redirect: { destination: "/spill/mars", permanent: false } };
    }

    // Check if the user is allowed to view this game
    // Allow access if:
    // 1. User is the creator
    // 2. User is the joiner
    // 3. Game is in WAITING status (so new users can join)
    if (
      game.creatorId !== userId &&
      game.joinerId !== userId &&
      game.status !== "WAITING"
    ) {
      console.error(`User ${userId} not authorized to view game ${gameId}`);
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
      moves = await db
        .select()
        .from(rpsMoves)
        .where(eq(rpsMoves.gameId, gameId));

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
      userMove = moves
        .find((m) => m.playerId === userId)
        ?.move?.toUpperCase() as "ROCK" | "PAPER" | "SCISSORS" | undefined;
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
  } catch (error) {
    console.error("Error in getGameProps:", error);
    // Return a redirect to the games list in case of any error
    return { redirect: { destination: "/spill/mars", permanent: false } };
  }
}

// Using a default export with correct params type
export default async function Page({ params }: { params: { gameId: string } }) {
  // Extract the gameId directly from params
  const { gameId } = params;

  // Define the possible return types from getGameProps
  type PropsData =
    | {
        props: {
          game: Game;
          userId: string;
          creatorName: string;
          joinerName: string | null;
          resultSeen: boolean;
          userMove?: "ROCK" | "PAPER" | "SCISSORS";
        };
      }
    | {
        redirect: {
          destination: string;
          permanent: boolean;
        };
      };

  // Call getGameProps with the gameId
  const propsData = (await getGameProps(gameId)) as PropsData;

  // Check if we got a redirect response
  if ("redirect" in propsData) {
    // Handle redirect by returning a redirect response
    // This will be handled by Next.js
    return {
      redirect: {
        destination: propsData.redirect.destination,
        permanent: propsData.redirect.permanent,
      },
    };
  }

  // Now we can safely destructure props
  const { game, userId, creatorName, joinerName, resultSeen, userMove } =
    propsData.props;

  // Check if the user is the creator of the game
  const isCreator = game.creatorId === userId;

  // Check if the user is already a participant (creator or joiner)
  const isParticipant = isCreator || game.joinerId === userId;

  // Determine if we should show the join button
  const showJoinButton = game.status === "WAITING" && !isParticipant;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="mt-10 text-2xl font-semibold tracking-tight text-white">
          Saks, Papir, Stein - {game.gameId}
        </h1>
        <div className="mx-auto max-w-2xl">
          {showJoinButton ? (
            <div className="text-center">
              <h2 className="mb-6 text-xl">Du er invitert til å spille!</h2>
              <p className="mb-6">
                {creatorName} har invitert deg til å spille Saks, Papir, Stein.
              </p>
              <JoinButton gameId={game.gameId} className="mx-auto" />
            </div>
          ) : (
            <GameBoard
              game={game}
              userId={userId}
              creatorName={creatorName}
              joinerName={joinerName}
              resultSeen={resultSeen}
              userMove={userMove}
            />
          )}
        </div>
      </div>
    </main>
  );
}

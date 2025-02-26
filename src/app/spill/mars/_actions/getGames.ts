"use server";

import { db } from "~/server/db";
import { rpsGames, rpsMoves, rpsGameResults } from "~/server/db/schema";
import { eq, and, or, not, inArray } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function getGames() {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Not authenticated" };
  }

  console.log("Current user ID:", userId);

  try {
    // First get all moves to check game states
    const allMoves = await db.select().from(rpsMoves);

    // Get all seen results for this user
    const seenResults = await db
      .select()
      .from(rpsGameResults)
      .where(eq(rpsGameResults.userId, userId));

    // Get ALL games first to debug
    const allGamesInDb = await db.select().from(rpsGames);
    console.log("ALL GAMES IN DB:", allGamesInDb);

    // Check specifically for games where user is joiner
    const gamesWhereUserIsJoiner = allGamesInDb.filter(
      (game) => game.joinerId === userId,
    );
    console.log("Games where user is joiner:", gamesWhereUserIsJoiner);

    // Check specifically for in-progress games
    const inProgressGames = allGamesInDb.filter(
      (game) => game.status === "IN_PROGRESS",
    );
    console.log("In-progress games:", inProgressGames);

    // Get all relevant games
    const games = await db
      .select()
      .from(rpsGames)
      .where(
        or(
          // Games waiting for players
          eq(rpsGames.status, "WAITING"),
          // In progress games where user is creator OR joiner
          and(
            eq(rpsGames.status, "IN_PROGRESS"),
            or(eq(rpsGames.creatorId, userId), eq(rpsGames.joinerId, userId)),
          ),
          // Completed games where user is creator OR joiner
          and(
            eq(rpsGames.status, "COMPLETED"),
            or(eq(rpsGames.creatorId, userId), eq(rpsGames.joinerId, userId)),
          ),
        ),
      )
      .orderBy(rpsGames.createdAt);

    console.log("Games after query:", games);

    // Filter and enhance games with move information
    const gamesWithMoveInfo = games.map((game) => {
      const gameMoves = allMoves.filter((m) => m.gameId === game.gameId);
      const playerMove = gameMoves.find((m) => m.playerId === userId);
      const resultSeen = seenResults.some((r) => r.gameId === game.gameId);

      return {
        ...game,
        hasPlayerMoved: !!playerMove,
        moveCount: gameMoves.length,
        resultSeen,
      };
    });

    console.log("Final games with move info:", gamesWithMoveInfo);
    return { success: true, games: gamesWithMoveInfo };
  } catch (error) {
    console.error("Failed to fetch games:", error);
    return { success: false, error: "Failed to fetch games" };
  }
}

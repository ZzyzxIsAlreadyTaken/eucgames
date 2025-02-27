"use server";

import { db } from "~/server/db";
import { rpsGames, rpsMoves, rpsGameResults } from "~/server/db/schema";
import { eq, and, or } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function getGames() {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // First get all moves to check game states
    const allMoves = await db.select().from(rpsMoves);

    // Get all seen results for this user
    const seenResults = await db
      .select()
      .from(rpsGameResults)
      .where(eq(rpsGameResults.userId, userId));

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

    return { success: true, games: gamesWithMoveInfo };
  } catch (error) {
    console.error("Error fetching games:", error);
    return { success: false, error: "Failed to fetch games" };
  }
}

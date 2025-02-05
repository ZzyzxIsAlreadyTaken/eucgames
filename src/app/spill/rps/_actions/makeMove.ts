"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { rpsGames, rpsMoves } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type Move = "ROCK" | "PAPER" | "SCISSORS";

function determineWinner(
  move1: Move,
  move2: Move,
): "player1" | "player2" | "draw" {
  if (move1 === move2) return "draw";

  if (
    (move1 === "ROCK" && move2 === "SCISSORS") ||
    (move1 === "PAPER" && move2 === "ROCK") ||
    (move1 === "SCISSORS" && move2 === "PAPER")
  ) {
    return "player1";
  }

  return "player2";
}

export async function makeMove(gameId: string, move: Move) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("You must be logged in to make a move");
  }

  try {
    // Get the game
    const [game] = await db
      .select()
      .from(rpsGames)
      .where(eq(rpsGames.gameId, gameId));

    if (!game) {
      return { success: false, error: "Game not found" };
    }

    if (game.status !== "IN_PROGRESS") {
      return { success: false, error: "Game is not in progress" };
    }

    const isCreator = game.creatorId === userId;
    const isJoiner = game.joinerId === userId;

    if (!isCreator && !isJoiner) {
      return { success: false, error: "You are not part of this game" };
    }

    // Check if player already made a move
    const [existingMove] = await db
      .select()
      .from(rpsMoves)
      .where(and(eq(rpsMoves.gameId, gameId), eq(rpsMoves.playerId, userId)));

    if (existingMove) {
      return { success: false, error: "You already made your move" };
    }

    // Record the move
    await db.insert(rpsMoves).values({
      gameId,
      playerId: userId,
      move,
    });

    // Check if both players have moved
    const moves = await db
      .select()
      .from(rpsMoves)
      .where(eq(rpsMoves.gameId, gameId));

    if (moves.length === 2) {
      // Determine winner
      const creatorMove = moves.find((m) => m.playerId === game.creatorId)
        ?.move as Move;
      const joinerMove = moves.find((m) => m.playerId === game.joinerId)
        ?.move as Move;

      const result = determineWinner(creatorMove, joinerMove);
      const winnerId =
        result === "draw"
          ? null
          : result === "player1"
            ? game.creatorId
            : game.joinerId;

      // Update game status
      await db
        .update(rpsGames)
        .set({
          status: "COMPLETED",
          winnerId,
        })
        .where(eq(rpsGames.gameId, gameId));
    }

    revalidatePath(`/spill/rps/${gameId}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to make move:", error);
    return { success: false, error: "Failed to make move" };
  }
}

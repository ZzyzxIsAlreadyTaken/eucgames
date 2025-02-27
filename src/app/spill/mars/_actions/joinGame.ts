"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { rpsGames } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function joinGame(gameId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("You must be logged in to join a game");
  }

  try {
    // Get the game to check if it's still available
    const [game] = await db
      .select()
      .from(rpsGames)
      .where(eq(rpsGames.gameId, gameId));

    if (!game) {
      return { success: false, error: "Game not found" };
    }

    if (game.status !== "WAITING") {
      return { success: false, error: "Game is no longer available" };
    }

    if (game.creatorId === userId) {
      return { success: false, error: "You cannot join your own game" };
    }

    // Join the game
    await db
      .update(rpsGames)
      .set({
        joinerId: userId,
        status: "IN_PROGRESS",
      })
      .where(eq(rpsGames.gameId, gameId));

    revalidatePath("/spill/mars");
    revalidatePath(`/spill/mars/${gameId}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to join game:", error);
    return { success: false, error: "Failed to join game" };
  }
}

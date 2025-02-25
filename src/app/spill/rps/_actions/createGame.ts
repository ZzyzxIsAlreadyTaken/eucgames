"use server";

import { db } from "~/server/db";
import { rpsGames } from "~/server/db/schema";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { and, eq, not } from "drizzle-orm";

export async function createGame() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("You must be logged in to create a game");
  }

  try {
    // Count user's active games (WAITING or IN_PROGRESS)
    const activeGames = await db
      .select({ count: rpsGames.gameId })
      .from(rpsGames)
      .where(
        and(
          eq(rpsGames.creatorId, userId),
          not(eq(rpsGames.status, "COMPLETED")),
        ),
      );

    const activeGameCount = activeGames.length;

    // Check if user has reached the limit
    if (activeGameCount >= 3) {
      return {
        success: false,
        error:
          "Du kan ikke opprette mer enn 3 aktive spill. Fullfør noen av spillene dine først.",
      };
    }

    const gameId = uuidv4();

    await db.insert(rpsGames).values({
      gameId,
      creatorId: userId,
      status: "WAITING",
    });

    revalidatePath("/spill/rps");

    return { success: true, gameId };
  } catch (error) {
    console.error("Failed to create game:", error);
    return { success: false, error: "Failed to create game" };
  }
}

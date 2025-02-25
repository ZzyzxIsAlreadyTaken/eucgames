"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { rpsGameResults } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function markResultSeen(gameId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("You must be logged in to view results");
  }

  try {
    // Check if result has already been seen
    const [existingRecord] = await db
      .select()
      .from(rpsGameResults)
      .where(
        and(
          eq(rpsGameResults.gameId, gameId),
          eq(rpsGameResults.userId, userId),
        ),
      );

    // If not seen yet, mark as seen
    if (!existingRecord) {
      await db.insert(rpsGameResults).values({
        gameId,
        userId,
        seenAt: new Date(),
      });
    }

    revalidatePath(`/spill/rps/${gameId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to mark result as seen:", error);
    return { success: false, error: "Failed to mark result as seen" };
  }
}

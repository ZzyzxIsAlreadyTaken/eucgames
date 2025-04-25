"use server";

import { db } from "~/server/db";
import { scores } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";

export async function saveQuizScore(
  userId: string,
  username: string,
  score: number,
) {
  try {
    // Check if user already has a score
    const existingScore = await db
      .select()
      .from(scores)
      .where(and(eq(scores.userId, userId), eq(scores.game, "paaske_quiz")))
      .limit(1);

    // Only save if user doesn't have a score yet
    if (existingScore.length === 0) {
      await db.insert(scores).values({
        userId,
        username,
        score,
        game: "paaske_quiz",
        createdAt: new Date(),
      });
      return { success: true };
    }

    return { success: false, message: "User already has a score" };
  } catch (error) {
    console.error("Error saving quiz score:", error);
    return { success: false };
  }
}

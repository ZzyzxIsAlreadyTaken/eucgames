"use server";

import { db } from "~/server/db";
import { scores } from "~/server/db/schema";
import { desc, eq } from "drizzle-orm";

export async function getHighScores() {
  try {
    const topScores = await db
      .select({
        username: scores.username,
        score: scores.score,
      })
      .from(scores)
      .where(eq(scores.game, "snake"))
      .orderBy(desc(scores.score))
      .limit(10);

    return topScores;
  } catch (error) {
    console.error("Error fetching high scores:", error);
    return [];
  }
}
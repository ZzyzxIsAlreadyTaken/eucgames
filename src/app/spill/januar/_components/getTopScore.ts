"use server";

import { db } from "~/server/db";
import { scores } from "~/server/db/schema";
import { desc, eq, and } from "drizzle-orm";

// Define a type for the top score result
interface TopScore {
  username: string;
  score: number;
}

export async function getTopScore(): Promise<TopScore[] | null> {
  try {
    // First, find the highest score
    const highestScoreResult: { score: number }[] = await db
      .select({
        score: scores.score,
      })
      .from(scores)
      .where(eq(scores.game, "snake"))
      .orderBy(desc(scores.score))
      .limit(1);

    const highestScore = highestScoreResult[0]?.score;

    if (highestScore === undefined) {
      return null;
    }

    // Fetch all users with the highest score
    const topScores: TopScore[] = await db
      .select({
        username: scores.username,
        score: scores.score,
      })
      .from(scores)
      .where(
        and(
          eq(scores.game, "snake"),
          highestScore !== undefined
            ? eq(scores.score, highestScore)
            : undefined,
        ),
      );

    return topScores;
  } catch (error) {
    console.error("Error fetching top scores:", error);
    return null;
  }
}

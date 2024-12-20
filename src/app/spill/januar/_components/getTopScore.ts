"use server";

import { db } from "~/server/db";
import { scores } from "~/server/db/schema";
import { desc, eq } from "drizzle-orm";

export async function getTopScore() {
  try {
    const topScore = await db
      .select({
        username: scores.username,
        score: scores.score,
      })
      .from(scores)
      .where(eq(scores.game, "snake"))
      .orderBy(desc(scores.score))
      .limit(1);

    return topScore[0] ?? null;
  } catch (error) {
    console.error("Error fetching top score:", error);
    return null;
  }
}

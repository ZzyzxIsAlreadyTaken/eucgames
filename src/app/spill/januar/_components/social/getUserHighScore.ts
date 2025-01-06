import { db } from "~/server/db";
import { scores } from "~/server/db/schema";
import { desc, eq } from "drizzle-orm";

interface UserHighScore {
  score: number | null;
}

export async function getUserHighScore(userId: string): Promise<UserHighScore> {
  try {
    const userScores = await db
      .select({
        score: scores.score,
      })
      .from(scores)
      .where(eq(scores.userId, userId))
      .orderBy(desc(scores.score))
      .limit(1);

    const highScore = userScores[0]?.score ?? null;
    return { score: highScore };
  } catch (error) {
    console.error("Error fetching user high score:", error);
    return { score: null };
  }
}

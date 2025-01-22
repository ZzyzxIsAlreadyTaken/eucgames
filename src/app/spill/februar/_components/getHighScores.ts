"use server";

import { db } from "~/server/db";
import { scoresMemory } from "~/server/db/schema";
import { asc, eq } from "drizzle-orm";
import type { Difficulty } from "./ToLike";

export async function getHighScores(difficulty: Difficulty) {
  try {
    const topScores = await db
      .select({
        id: scoresMemory.id,
        username: scoresMemory.username,
        tries: scoresMemory.tries,
        time: scoresMemory.time,
        gameMode: scoresMemory.gameMode,
        createdAt: scoresMemory.createdAt,
      })
      .from(scoresMemory)
      .where(eq(scoresMemory.difficulty, difficulty))
      .orderBy(asc(scoresMemory.tries), asc(scoresMemory.time))
      .limit(10);

    return topScores;
  } catch (error) {
    console.error("Error fetching high scores:", error);
    return [];
  }
}

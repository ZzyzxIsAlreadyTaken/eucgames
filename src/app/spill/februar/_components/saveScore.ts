"use server";

import { db } from "~/server/db";
import { scoresMemory } from "~/server/db/schema";
import type { Difficulty, GameMode } from "./ToLike";

export async function saveScore(
  userId: string,
  username: string,
  tries: number,
  time: number,
  difficulty: Difficulty,
  gameMode: GameMode,
) {
  try {
    await db.insert(scoresMemory).values({
      userId,
      username,
      tries,
      time,
      difficulty,
      createdAt: new Date(),
      gameMode,
    });
    return { success: true };
  } catch (error) {
    console.error("Error saving score:", error);
    return { success: false };
  }
}

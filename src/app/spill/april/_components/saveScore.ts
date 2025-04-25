"use server";

import { db } from "~/server/db";
import { scores } from "~/server/db/schema";

export async function saveQuizScore(
  userId: string,
  username: string,
  score: number,
) {
  try {
    await db.insert(scores).values({
      userId,
      username,
      score,
      game: "paaske_quiz",
      createdAt: new Date(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error saving quiz score:", error);
    return { success: false };
  }
}

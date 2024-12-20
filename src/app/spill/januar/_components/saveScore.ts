"use server";

import { db } from "~/server/db";
import { scores } from "~/server/db/schema";

export async function saveScore(
  userId: string,
  score: number,
  username: string,
) {
  try {
    await db.insert(scores).values({
      userId,
      username,
      score,
      game: "snake",
      createdAt: new Date(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error saving score:", error);
    return { success: false };
  }
}

"use server";

import { db } from "~/server/db";
import { scoresMemory } from "~/server/db/schema";
import { asc, eq } from "drizzle-orm";
import { clerkClient } from "~/lib/clerkClient";
import type { Difficulty } from "./ToLike";

interface HighScore {
  id: number;
  userId: string;
  username: string;
  tries: number;
  time: number;
  gameMode: string;
  createdAt: Date;
  imageUrl: string | null;
}

export async function getHighScores(
  difficulty: Difficulty,
): Promise<HighScore[]> {
  try {
    const topScores = await db
      .select({
        id: scoresMemory.id,
        userId: scoresMemory.userId,
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

    // Get unique user IDs
    const userIds = [...new Set(topScores.map((score) => score.userId))];

    // Fetch all users in one batch
    const users = await clerkClient.users.getUserList({ userId: userIds });

    // Create a map of userId to imageUrl
    const userImageMap = new Map<string, string | null>(
      users.data.map((user) => [
        user.id,
        user.imageUrl ?? user.publicMetadata.profileImageUrl ?? null,
      ]),
    );

    // Add image URLs to scores
    return topScores.map((score) => ({
      ...score,
      imageUrl: userImageMap.get(score.userId) ?? null,
    }));
  } catch (error) {
    console.error("Error fetching high scores:", {
      message: (error as Error).message,
      name: (error as Error).name,
    });
    return [];
  }
}

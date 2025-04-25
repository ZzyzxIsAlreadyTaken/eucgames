"use server";

import { db } from "~/server/db";
import { scores } from "~/server/db/schema";
import { desc, eq, asc } from "drizzle-orm";
import { clerkClient } from "~/lib/clerkClient";

interface TopScore {
  id: number;
  userId: string;
  username: string;
  score: number;
  createdAt: Date;
  imageUrl?: string | null;
}

export async function getTopScores(): Promise<TopScore[]> {
  try {
    // Get all scores first
    const allScores = await db
      .select({
        id: scores.id,
        userId: scores.userId,
        username: scores.username,
        score: scores.score,
        createdAt: scores.createdAt,
      })
      .from(scores)
      .where(eq(scores.game, "paaske_quiz"))
      .orderBy(asc(scores.id));

    // Get the first score for each user
    const userFirstScores = new Map<string, TopScore>();
    for (const score of allScores) {
      if (!userFirstScores.has(score.userId)) {
        userFirstScores.set(score.userId, score);
      }
    }

    // Convert to array and take top 10
    const topScores = Array.from(userFirstScores.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

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
    console.error("Error fetching top scores:", error);
    return [];
  }
}

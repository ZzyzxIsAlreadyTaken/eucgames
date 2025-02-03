"use server";

import { db } from "~/server/db";
import { socialComments, socialCommentLikes } from "~/server/db/schema";
import { desc, eq, and, inArray } from "drizzle-orm";
import { type SocialComment } from "./types";

// Add this before your function to test the connection
export const testConnection = async () => {
  try {
    const result = await db.select().from(socialComments).limit(1);
    console.log("DB Connection test successful:", result);
  } catch (error) {
    console.error("DB Connection test failed:", error);
  }
};

export async function getLatestComments(
  userId?: string,
): Promise<SocialComment[]> {
  try {
    const comments = await db
      .select()
      .from(socialComments)
      .where(eq(socialComments.game, "february"))
      .orderBy(desc(socialComments.createdAt))
      .limit(50);

    if (!userId) {
      return comments.map((comment) => ({ ...comment, hasLiked: false }));
    }

    // Get all likes for the current user
    const userLikes = await db
      .select()
      .from(socialCommentLikes)
      .where(
        and(
          eq(socialCommentLikes.userId, userId),
          inArray(
            socialCommentLikes.commentId,
            comments.map((c) => c.id),
          ),
        ),
      );

    const likedCommentIds = new Set(userLikes.map((like) => like.commentId));

    return comments.map((comment) => ({
      ...comment,
      hasLiked: likedCommentIds.has(comment.id),
    }));
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
}

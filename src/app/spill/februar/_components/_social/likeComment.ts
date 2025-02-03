"use server";

import { db } from "~/server/db";
import { socialComments, socialCommentLikes } from "~/server/db/schema";
import { and, eq, sql } from "drizzle-orm";

export async function toggleLike(
  commentId: number,
  userId: string,
): Promise<{ liked: boolean }> {
  try {
    // Check if user has already liked the comment
    const [existingLike] = await db
      .select()
      .from(socialCommentLikes)
      .where(
        and(
          eq(socialCommentLikes.commentId, commentId),
          eq(socialCommentLikes.userId, userId),
        ),
      );

    if (existingLike) {
      // Unlike: Remove the like and decrement the count
      await db.transaction(async (tx) => {
        await tx
          .delete(socialCommentLikes)
          .where(
            and(
              eq(socialCommentLikes.commentId, commentId),
              eq(socialCommentLikes.userId, userId),
            ),
          );

        await tx
          .update(socialComments)
          .set({ likes: sql`${socialComments.likes} - 1` })
          .where(eq(socialComments.id, commentId));
      });

      return { liked: false };
    } else {
      // Like: Add the like and increment the count
      await db.transaction(async (tx) => {
        await tx.insert(socialCommentLikes).values({
          commentId,
          userId,
        });

        await tx
          .update(socialComments)
          .set({ likes: sql`${socialComments.likes} + 1` })
          .where(eq(socialComments.id, commentId));
      });

      return { liked: true };
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    throw error;
  }
}

import { db } from "~/server/db";
import { snakeSocial } from "~/server/db/schema";

export async function addComment(
  userId: string,
  username: string,
  comment: string,
) {
  try {
    await db.insert(snakeSocial).values({
      userId,
      username,
      comment,
      createdAt: new Date(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error adding comment:", error);
    return { success: false };
  }
}

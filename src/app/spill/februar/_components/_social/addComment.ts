import { db } from "~/server/db";
import { socialComments } from "~/server/db/schema";

export async function addComment(
  userId: string,
  username: string,
  comment: string,
): Promise<void> {
  try {
    await db.insert(socialComments).values({
      userId,
      username,
      game: "february",
      comment,
      likes: 0,
      isEdited: false,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
}

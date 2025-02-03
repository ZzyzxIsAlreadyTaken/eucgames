import { db } from "~/server/db";
import { socialComments } from "~/server/db/schema";
import { desc, eq } from "drizzle-orm";
import { type SocialComment } from "./types";

export async function getLatestComments(): Promise<SocialComment[]> {
  try {
    const comments = await db
      .select()
      .from(socialComments)
      .where(eq(socialComments.game, "february"))
      .orderBy(desc(socialComments.createdAt))
      .limit(50);

    return comments;
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
}

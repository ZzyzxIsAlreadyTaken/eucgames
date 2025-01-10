"use server";

import { db } from "~/server/db";
import { feedback } from "~/server/db/schema";

export async function saveFeedback(
  userId: string,
  username: string,
  title: string,
  comment: string,
  tags: string[],
) {
  try {
    await db.insert(feedback).values({
      userId,
      username,
      title,
      comment,
      tags,
      createdAt: new Date(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error saving feedback:", error);
    return { success: false };
  }
}

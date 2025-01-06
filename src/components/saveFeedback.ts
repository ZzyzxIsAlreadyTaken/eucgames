"use server";

import { db } from "~/server/db";
import { feedback } from "~/server/db/schema";

export async function saveFeedback(
  userId: string,
  title: string,
  comment: string,
) {
  try {
    await db.insert(feedback).values({
      userId,
      title,
      comment,
      createdAt: new Date(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error saving feedback:", error);
    return { success: false };
  }
}

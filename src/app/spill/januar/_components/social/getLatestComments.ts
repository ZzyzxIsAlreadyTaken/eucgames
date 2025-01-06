"use server";

import { db } from "~/server/db";
import { snakeSocial } from "~/server/db/schema";
import { desc } from "drizzle-orm";

export async function getLatestComments() {
  try {
    const comments = await db
      .select({
        id: snakeSocial.id,
        username: snakeSocial.username,
        comment: snakeSocial.comment,
        createdAt: snakeSocial.createdAt,
      })
      .from(snakeSocial)
      .orderBy(desc(snakeSocial.createdAt))
      .limit(5);

    return comments;
  } catch (error) {
    console.error("Error fetching latest comments:", error);
    return [];
  }
}

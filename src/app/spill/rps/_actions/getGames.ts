"use server";

import { db } from "~/server/db";
import { rpsGames } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function getGames() {
  try {
    const games = await db
      .select()
      .from(rpsGames)
      .where(eq(rpsGames.status, "WAITING"))
      .orderBy(rpsGames.createdAt);

    return { success: true, games };
  } catch (error) {
    console.error("Failed to fetch games:", error);
    return { success: false, error: "Failed to fetch games" };
  }
}

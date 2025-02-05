"use server";

import { db } from "~/server/db";
import { rpsGames } from "~/server/db/schema";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

export async function createGame() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("You must be logged in to create a game");
  }

  try {
    const gameId = uuidv4();

    await db.insert(rpsGames).values({
      gameId,
      creatorId: userId,
      status: "WAITING",
    });

    revalidatePath("/spill/rps");

    return { success: true, gameId };
  } catch (error) {
    console.error("Failed to create game:", error);
    return { success: false, error: "Failed to create game" };
  }
}

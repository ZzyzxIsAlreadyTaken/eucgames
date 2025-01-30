// gameActions.ts (Server Actions)
"use server";

import { db } from "~/server/db";
import { RPSgames } from "~/server/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createGame(playerId: string, choice: string) {
  await db.insert(RPSgames).values({
    player1Id: playerId,
    player1Choice: choice,
  });
  revalidatePath("/spill/mars");
}

export async function joinGame(playerId: string, choice: string) {
  const openGame = await db.query.RPSgames.findFirst({
    where: eq(RPSgames.player2Id, ""),
  });

  if (!openGame) throw new Error("No open games available");

  const result = getWinner(openGame.player1Choice, choice);
  const winnerId =
    result === "tie"
      ? null
      : result === "player1"
        ? openGame.player1Id
        : playerId;

  await db
    .update(RPSgames)
    .set({
      player2Id: playerId,
      player2Choice: choice,
      winnerId,
      completed: true,
    })
    .where(eq(RPSgames.id, openGame.id));

  revalidatePath("/spill/mars");
}

function getWinner(p1: string, p2: string) {
  if (p1 === p2) return "tie";
  if (
    (p1 === "rock" && p2 === "scissors") ||
    (p1 === "scissors" && p2 === "paper") ||
    (p1 === "paper" && p2 === "rock")
  ) {
    return "player1";
  }
  return "player2";
}

export async function getResults(playerId: string) {
  return await db.query.RPSgames.findMany({
    where: and(eq(RPSgames.player1Id, playerId), eq(RPSgames.completed, true)),
    orderBy: [desc(RPSgames.createdAt)],
  });
}

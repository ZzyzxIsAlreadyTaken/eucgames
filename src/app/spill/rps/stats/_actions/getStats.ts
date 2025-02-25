"use server";

import { db } from "~/server/db";
import { rpsGames } from "~/server/db/schema";
import { clerkClient } from "~/lib/clerkClient";
import { sql } from "drizzle-orm";

interface PlayerStats {
  userId: string;
  username: string;
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
}

interface HeadToHeadStats {
  player1Id: string;
  player2Id: string;
  player1Name: string;
  player2Name: string;
  player1Wins: number;
  player2Wins: number;
  draws: number;
}

export async function getStats() {
  try {
    // Get all completed games
    const completedGames = await db
      .select()
      .from(rpsGames)
      .where(sql`${rpsGames.status} = 'COMPLETED'`);

    // Get all unique player IDs
    const playerIds = new Set<string>();
    completedGames.forEach((game) => {
      if (game.creatorId) playerIds.add(game.creatorId);
      if (game.joinerId) playerIds.add(game.joinerId);
    });

    // Fetch user details for all players
    const users = await Promise.all(
      Array.from(playerIds).map(async (id) => {
        try {
          const user = await clerkClient.users.getUser(id);
          return {
            id,
            name: user.firstName ?? user.username ?? "Unknown",
          };
        } catch (error) {
          console.error(`Error fetching user ${id}:`, error);
          return { id, name: "Unknown" };
        }
      }),
    );

    // Create a map of user IDs to names for easy lookup
    const userNameMap = new Map(users.map((user) => [user.id, user.name]));

    // Calculate individual player statistics
    const playerStats = new Map<string, PlayerStats>();

    // Initialize player stats
    users.forEach((user) => {
      playerStats.set(user.id, {
        userId: user.id,
        username: user.name,
        totalGames: 0,
        wins: 0,
        losses: 0,
        draws: 0,
      });
    });

    // Calculate head-to-head statistics
    const headToHeadMap = new Map<string, HeadToHeadStats>();

    // Process each completed game
    completedGames.forEach((game) => {
      if (!game.joinerId) return; // Skip games without a joiner

      const creator = playerStats.get(game.creatorId);
      const joiner = playerStats.get(game.joinerId);

      if (creator && joiner) {
        // Update total games
        creator.totalGames++;
        joiner.totalGames++;

        // Update win/loss/draw counts
        if (game.winnerId === null) {
          // Draw
          creator.draws++;
          joiner.draws++;
        } else if (game.winnerId === game.creatorId) {
          // Creator won
          creator.wins++;
          joiner.losses++;
        } else {
          // Joiner won
          creator.losses++;
          joiner.wins++;
        }

        // Update head-to-head stats
        const pairKey = [game.creatorId, game.joinerId].sort().join("-");
        let h2hStats = headToHeadMap.get(pairKey);

        if (!h2hStats) {
          h2hStats = {
            player1Id: game.creatorId,
            player2Id: game.joinerId,
            player1Name: userNameMap.get(game.creatorId) ?? "Unknown",
            player2Name: userNameMap.get(game.joinerId) ?? "Unknown",
            player1Wins: 0,
            player2Wins: 0,
            draws: 0,
          };
          headToHeadMap.set(pairKey, h2hStats);
        }

        if (game.winnerId === null) {
          h2hStats.draws++;
        } else if (game.winnerId === game.creatorId) {
          if (h2hStats.player1Id === game.creatorId) {
            h2hStats.player1Wins++;
          } else {
            h2hStats.player2Wins++;
          }
        } else {
          if (h2hStats.player1Id === game.joinerId) {
            h2hStats.player1Wins++;
          } else {
            h2hStats.player2Wins++;
          }
        }
      }
    });

    return {
      success: true,
      playerStats: Array.from(playerStats.values()),
      headToHeadStats: Array.from(headToHeadMap.values()),
    };
  } catch (error) {
    console.error("Failed to fetch statistics:", error);
    return { success: false, error: "Failed to fetch statistics" };
  }
}

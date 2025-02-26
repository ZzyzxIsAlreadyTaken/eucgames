"use server";

import { db } from "~/server/db";
import { rpsGames, rpsMoves } from "~/server/db/schema";
import { clerkClient } from "~/lib/clerkClient";
import { sql } from "drizzle-orm";

interface PlayerStats {
  userId: string;
  username: string;
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  rockCount: number;
  paperCount: number;
  scissorsCount: number;
  currentStreak?: number; // Positive for win streak, negative for loss streak
  longestWinStreak?: number;
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
        rockCount: 0,
        paperCount: 0,
        scissorsCount: 0,
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

    // Fetch all moves to count choice statistics
    const allMoves = await db.select().from(rpsMoves);

    // Count player choices
    allMoves.forEach((move) => {
      const playerStat = playerStats.get(move.playerId);
      if (playerStat) {
        // Convert move to lowercase for case-insensitive comparison
        const moveType = move.move.toUpperCase();

        // Debug log to see the raw move value from the database
        console.log(
          `Raw move from database: ${move.move} for player ${move.playerId}`,
        );

        if (moveType === "ROCK") playerStat.rockCount++;
        else if (moveType === "PAPER") playerStat.paperCount++;
        else if (moveType === "SCISSORS") playerStat.scissorsCount++;

        // Debug log to see what moves are being processed
        console.log(
          `Player ${move.playerId} used ${moveType}, counts now: rock=${playerStat.rockCount}, paper=${playerStat.paperCount}, scissors=${playerStat.scissorsCount}`,
        );
      }
    });

    // Calculate streaks for each player
    // For this, we need to get games in chronological order
    const playerGamesMap = new Map<
      string,
      Array<{ gameId: string; isWin: boolean; isDraw: boolean }>
    >();

    // Group games by player
    completedGames.forEach((game) => {
      if (!game.joinerId) return;

      // Add game to creator's list
      const creatorGames = playerGamesMap.get(game.creatorId) ?? [];
      creatorGames.push({
        gameId: game.gameId,
        isWin: game.winnerId === game.creatorId,
        isDraw: game.winnerId === null,
      });
      playerGamesMap.set(game.creatorId, creatorGames);

      // Add game to joiner's list
      const joinerGames = playerGamesMap.get(game.joinerId) ?? [];
      joinerGames.push({
        gameId: game.gameId,
        isWin: game.winnerId === game.joinerId,
        isDraw: game.winnerId === null,
      });
      playerGamesMap.set(game.joinerId, joinerGames);
    });

    // Calculate streaks for each player
    playerGamesMap.forEach((games, playerId) => {
      const playerStat = playerStats.get(playerId);
      if (!playerStat) return;

      // Sort games by creation date (assuming gameId has timestamp component or is sequential)
      games.sort((a, b) => a.gameId.localeCompare(b.gameId));

      // Calculate current streak
      let currentStreak = 0;
      let longestWinStreak = 0;

      // Process games in reverse order (most recent first)
      for (let i = games.length - 1; i >= 0; i--) {
        const game = games[i];

        if (game?.isDraw) {
          // Draws break streaks
          break;
        } else if (game?.isWin) {
          // Win - increment streak if it's positive, or reset to 1 if it was negative
          if (currentStreak >= 0) {
            currentStreak++;
          } else {
            break; // Break on streak change
          }
        } else {
          // Loss - decrement streak if it's negative, or reset to -1 if it was positive
          if (currentStreak <= 0) {
            currentStreak--;
          } else {
            break; // Break on streak change
          }
        }
      }

      // Calculate longest win streak
      let tempStreak = 0;
      for (const game of games) {
        if (game.isWin) {
          tempStreak++;
          longestWinStreak = Math.max(longestWinStreak, tempStreak);
        } else {
          tempStreak = 0;
        }
      }

      playerStat.currentStreak = currentStreak;
      playerStat.longestWinStreak = longestWinStreak;
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

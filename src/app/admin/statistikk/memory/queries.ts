import { db } from "~/server/db";
import { scoresMemory } from "~/server/db/schema";
import { sql } from "drizzle-orm";
import { desc, eq } from "drizzle-orm";

interface BestScores {
  easy: { time: number; tries: number; isHighScore: boolean } | null;
  normal: { time: number; tries: number; isHighScore: boolean } | null;
  hard: { time: number; tries: number; isHighScore: boolean } | null;
  insane: { time: number; tries: number; isHighScore: boolean } | null;
}

export interface PlayerStats {
  userId: string;
  username: string;
  gamesPlayed: number;
  bestScores: BestScores;
  favoriteGameMode: string;
}

export interface MemoryStats {
  totalGames: number;
  gamesPerDay: number;
  uniquePlayers: number;
  mostPopularGameMode: string;
  leastPopularGameMode: string;
  mostPopularDifficulty: string;
  leastPopularDifficulty: string;
  playerStats: PlayerStats[];
}

export const getMemoryStats = async (): Promise<MemoryStats> => {
  const mockUserFilter = sql`"userId" NOT LIKE 'mock-user-%'`;

  // Get total number of games
  const totalGamesResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(scoresMemory)
    .where(mockUserFilter);
  const totalGames = totalGamesResult[0]?.count ?? 0;

  // Get games per day (average over the last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const gamesPerDayResult = await db
    .select({
      gamesPerDay: sql<number>`ROUND(COUNT(*)::numeric / 30, 1)`,
    })
    .from(scoresMemory)
    .where(sql`${mockUserFilter} AND created_at >= ${thirtyDaysAgo}`);
  const gamesPerDay = gamesPerDayResult[0]?.gamesPerDay ?? 0;

  // Get unique players count
  const uniquePlayersResult = await db
    .select({
      count: sql<number>`COUNT(DISTINCT "userId")`,
    })
    .from(scoresMemory)
    .where(mockUserFilter);
  const uniquePlayers = uniquePlayersResult[0]?.count ?? 0;

  // Get most and least popular game modes
  const gameModeStats = await db
    .select({
      gameMode: scoresMemory.gameMode,
      count: sql<number>`count(*)`,
    })
    .from(scoresMemory)
    .where(mockUserFilter)
    .groupBy(scoresMemory.gameMode)
    .orderBy(sql`count(*) DESC`);

  const mostPopularGameMode = gameModeStats[0]?.gameMode ?? "N/A";
  const leastPopularGameMode =
    gameModeStats[gameModeStats.length - 1]?.gameMode ?? "N/A";

  // Get most and least popular difficulties
  const difficultyStats = await db
    .select({
      difficulty: scoresMemory.difficulty,
      count: sql<number>`count(*)`,
    })
    .from(scoresMemory)
    .where(mockUserFilter)
    .groupBy(scoresMemory.difficulty)
    .orderBy(sql`count(*) DESC`);

  const mostPopularDifficulty = difficultyStats[0]?.difficulty ?? "N/A";
  const leastPopularDifficulty =
    difficultyStats[difficultyStats.length - 1]?.difficulty ?? "N/A";

  // Get player statistics with best scores per difficulty
  const playerStatsResult = await db
    .select({
      userId: scoresMemory.userId,
      username: scoresMemory.username,
      gamesPlayed: sql<number>`COUNT(*)`,
      favoriteGameMode: sql<string>`MODE() WITHIN GROUP (ORDER BY "gameMode")`,
      // Best scores for each difficulty
      easyTime: sql<number>`MIN(CASE WHEN difficulty = 'easy' THEN time END)`,
      easyTries: sql<number>`MIN(CASE WHEN difficulty = 'easy' THEN tries END)`,
      normalTime: sql<number>`MIN(CASE WHEN difficulty = 'normal' THEN time END)`,
      normalTries: sql<number>`MIN(CASE WHEN difficulty = 'normal' THEN tries END)`,
      hardTime: sql<number>`MIN(CASE WHEN difficulty = 'hard' THEN time END)`,
      hardTries: sql<number>`MIN(CASE WHEN difficulty = 'hard' THEN tries END)`,
      insaneTime: sql<number>`MIN(CASE WHEN difficulty = 'insane' THEN time END)`,
      insaneTries: sql<number>`MIN(CASE WHEN difficulty = 'insane' THEN tries END)`,
    })
    .from(scoresMemory)
    .where(mockUserFilter)
    .groupBy(scoresMemory.userId, scoresMemory.username).orderBy(sql`
      COALESCE(MIN(CASE WHEN difficulty = 'easy' THEN time * tries END), 999999) +
      COALESCE(MIN(CASE WHEN difficulty = 'normal' THEN time * tries END), 999999) +
      COALESCE(MIN(CASE WHEN difficulty = 'hard' THEN time * tries END), 999999) +
      COALESCE(MIN(CASE WHEN difficulty = 'insane' THEN time * tries END), 999999)
    `);

  const playerStats = playerStatsResult.map((player) => {
    // Find best scores for each difficulty - prioritize tries, then time
    const bestEasyScore = playerStatsResult
      .filter((p) => p.easyTime)
      .sort((a, b) => a.easyTries - b.easyTries || a.easyTime - b.easyTime)[0];
    const bestNormalScore = playerStatsResult
      .filter((p) => p.normalTime)
      .sort(
        (a, b) => a.normalTries - b.normalTries || a.normalTime - b.normalTime,
      )[0];
    const bestHardScore = playerStatsResult
      .filter((p) => p.hardTime)
      .sort((a, b) => a.hardTries - b.hardTries || a.hardTime - b.hardTime)[0];
    const bestInsaneScore = playerStatsResult
      .filter((p) => p.insaneTime)
      .sort(
        (a, b) => a.insaneTries - b.insaneTries || a.insaneTime - b.insaneTime,
      )[0];

    return {
      userId: player.userId,
      username: player.username,
      gamesPlayed: player.gamesPlayed,
      favoriteGameMode: player.favoriteGameMode,
      bestScores: {
        easy: player.easyTime
          ? {
              time: player.easyTime,
              tries: player.easyTries,
              isHighScore:
                player.easyTries === bestEasyScore?.easyTries &&
                player.easyTime === bestEasyScore?.easyTime,
            }
          : null,
        normal: player.normalTime
          ? {
              time: player.normalTime,
              tries: player.normalTries,
              isHighScore:
                player.normalTries === bestNormalScore?.normalTries &&
                player.normalTime === bestNormalScore?.normalTime,
            }
          : null,
        hard: player.hardTime
          ? {
              time: player.hardTime,
              tries: player.hardTries,
              isHighScore:
                player.hardTries === bestHardScore?.hardTries &&
                player.hardTime === bestHardScore?.hardTime,
            }
          : null,
        insane: player.insaneTime
          ? {
              time: player.insaneTime,
              tries: player.insaneTries,
              isHighScore:
                player.insaneTries === bestInsaneScore?.insaneTries &&
                player.insaneTime === bestInsaneScore?.insaneTime,
            }
          : null,
      },
    };
  });

  return {
    totalGames,
    gamesPerDay,
    uniquePlayers,
    mostPopularGameMode,
    leastPopularGameMode,
    mostPopularDifficulty,
    leastPopularDifficulty,
    playerStats,
  };
};

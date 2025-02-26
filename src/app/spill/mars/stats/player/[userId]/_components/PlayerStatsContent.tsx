import { getStats } from "../../../_actions/getStats";
import Link from "next/link";

interface PlayerStatsContentProps {
  userId: string;
}

export async function PlayerStatsContent({ userId }: PlayerStatsContentProps) {
  const result = await getStats();

  if (!result.success || !result.headToHeadStats || !result.playerStats) {
    return (
      <div className="text-center text-red-500">
        Kunne ikke laste statistikk. Prøv igjen senere.
      </div>
    );
  }

  // Filter head-to-head stats for this player
  const playerH2HStats = result.headToHeadStats.filter(
    (stats) => stats.player1Id === userId || stats.player2Id === userId,
  );

  // Get player overall stats
  const playerOverallStats = result.playerStats.find(
    (stats) => stats.userId === userId,
  );

  console.log("Player stats:", JSON.stringify(playerOverallStats, null, 2));

  // Get player name
  const playerName =
    playerH2HStats.length > 0
      ? playerH2HStats[0]?.player1Id === userId
        ? playerH2HStats[0]?.player1Name
        : playerH2HStats[0]?.player2Name
      : (playerOverallStats?.username ?? "Unknown");

  // Determine favorite and least favorite choices with a more direct approach
  let favoriteChoice = null;
  let leastFavoriteChoice = null;

  if (playerOverallStats) {
    // Check if rockCount, paperCount, and scissorsCount properties exist
    console.log("rockCount exists:", "rockCount" in playerOverallStats);
    console.log("paperCount exists:", "paperCount" in playerOverallStats);
    console.log("scissorsCount exists:", "scissorsCount" in playerOverallStats);

    // Force default values if properties don't exist
    const rockCount = playerOverallStats.rockCount ?? 0;
    const paperCount = playerOverallStats.paperCount ?? 0;
    const scissorsCount = playerOverallStats.scissorsCount ?? 0;

    console.log(
      `Counts - Rock: ${rockCount}, Paper: ${paperCount}, Scissors: ${scissorsCount}`,
    );

    // Set default choices if no data is available
    if (rockCount === 0 && paperCount === 0 && scissorsCount === 0) {
      // No data available, set both to null to indicate no data
      favoriteChoice = null;
      leastFavoriteChoice = null;
      console.log("No choice data available, setting both to null");
    } else {
      // Find favorite (highest count)
      if (
        rockCount >= paperCount &&
        rockCount >= scissorsCount &&
        rockCount > 0
      ) {
        favoriteChoice = "rock";
      } else if (
        paperCount >= rockCount &&
        paperCount >= scissorsCount &&
        paperCount > 0
      ) {
        favoriteChoice = "paper";
      } else if (
        scissorsCount >= rockCount &&
        scissorsCount >= paperCount &&
        scissorsCount > 0
      ) {
        favoriteChoice = "scissors";
      }

      // Find least favorite (lowest non-zero count)
      const nonZeroCounts = [];
      if (rockCount > 0)
        nonZeroCounts.push({ choice: "rock", count: rockCount });
      if (paperCount > 0)
        nonZeroCounts.push({ choice: "paper", count: paperCount });
      if (scissorsCount > 0)
        nonZeroCounts.push({ choice: "scissors", count: scissorsCount });

      if (nonZeroCounts.length > 0) {
        nonZeroCounts.sort((a, b) => a.count - b.count);
        leastFavoriteChoice = nonZeroCounts[0]?.choice ?? null;
      } else {
        leastFavoriteChoice = null;
      }

      // If we have only one choice used, it can't be both favorite and least favorite
      if (
        nonZeroCounts.length === 1 &&
        favoriteChoice === leastFavoriteChoice
      ) {
        // If only one choice has been used, set the least favorite to null
        leastFavoriteChoice = null;
        console.log("Only one choice used, setting least favorite to null");
      }

      // If we have two choices with the same count, pick one for favorite and one for least favorite
      if (
        nonZeroCounts.length === 2 &&
        nonZeroCounts[0]?.count !== undefined &&
        nonZeroCounts[1]?.count !== undefined &&
        nonZeroCounts[0].count === nonZeroCounts[1].count
      ) {
        favoriteChoice = nonZeroCounts[0]?.choice ?? null;
        leastFavoriteChoice = nonZeroCounts[1]?.choice ?? null;
      }
    }
  } else {
    // No player stats found, set defaults
    favoriteChoice = "rock";
    leastFavoriteChoice = "scissors";
  }

  console.log("Favorite choice:", favoriteChoice);
  console.log("Least favorite choice:", leastFavoriteChoice);

  // Ensure we always have values to display
  const displayFavoriteChoice = favoriteChoice ?? "Ukjent";
  const displayLeastFavoriteChoice = leastFavoriteChoice ?? "Ukjent";

  // Get the counts for display
  const favoriteChoiceCount = favoriteChoice
    ? favoriteChoice === "rock"
      ? (playerOverallStats?.rockCount ?? 0)
      : favoriteChoice === "paper"
        ? (playerOverallStats?.paperCount ?? 0)
        : (playerOverallStats?.scissorsCount ?? 0)
    : 0;

  const leastFavoriteChoiceCount = leastFavoriteChoice
    ? leastFavoriteChoice === "rock"
      ? (playerOverallStats?.rockCount ?? 0)
      : leastFavoriteChoice === "paper"
        ? (playerOverallStats?.paperCount ?? 0)
        : (playerOverallStats?.scissorsCount ?? 0)
    : 0;

  // Calculate choice distribution percentages
  const rockCount = playerOverallStats?.rockCount ?? 0;
  const paperCount = playerOverallStats?.paperCount ?? 0;
  const scissorsCount = playerOverallStats?.scissorsCount ?? 0;
  const totalChoices = rockCount + paperCount + scissorsCount;

  const rockPercentage =
    totalChoices > 0 ? (rockCount / totalChoices) * 100 : 0;
  const paperPercentage =
    totalChoices > 0 ? (paperCount / totalChoices) * 100 : 0;
  const scissorsPercentage =
    totalChoices > 0 ? (scissorsCount / totalChoices) * 100 : 0;

  // Map choice to emoji
  const choiceEmoji = {
    rock: "🪨",
    paper: "📄",
    scissors: "✂️",
    Ukjent: "❓",
  };

  const favoriteChoiceEmoji =
    choiceEmoji[displayFavoriteChoice as keyof typeof choiceEmoji] ?? "❓";
  const favoriteChoiceNorwegian =
    {
      rock: "Stein",
      paper: "Papir",
      scissors: "Saks",
      Ukjent: "Ukjent",
    }[displayFavoriteChoice as keyof typeof choiceEmoji] ?? "Ukjent";

  const leastFavoriteChoiceEmoji =
    choiceEmoji[displayLeastFavoriteChoice as keyof typeof choiceEmoji] ?? "❓";
  const leastFavoriteChoiceNorwegian =
    {
      rock: "Stein",
      paper: "Papir",
      scissors: "Saks",
      Ukjent: "Ukjent",
    }[displayLeastFavoriteChoice as keyof typeof choiceEmoji] ?? "Ukjent";

  // Calculate additional stats
  const opponentStats = playerH2HStats.map((stats) => {
    const isPlayer1 = stats.player1Id === userId;
    const opponentName = isPlayer1 ? stats.player2Name : stats.player1Name;
    const opponentId = isPlayer1 ? stats.player2Id : stats.player1Id;
    const playerWins = isPlayer1 ? stats.player1Wins : stats.player2Wins;
    const opponentWins = isPlayer1 ? stats.player2Wins : stats.player1Wins;
    const totalGames = playerWins + opponentWins + stats.draws;
    const winRate = totalGames > 0 ? playerWins / totalGames : 0;

    return {
      opponentId,
      opponentName,
      playerWins,
      opponentWins,
      draws: stats.draws,
      totalGames,
      winRate,
    };
  });

  // Most common opponent
  const mostCommonOpponent = [...opponentStats].sort(
    (a, b) => b.totalGames - a.totalGames,
  )[0];

  // Best win ratio (minimum 3 games)
  const bestWinRatio = [...opponentStats]
    .filter((stats) => stats.totalGames >= 3)
    .sort((a, b) => b.winRate - a.winRate)[0];

  // Worst win ratio (minimum 3 games)
  const worstWinRatio = [...opponentStats]
    .filter((stats) => stats.totalGames >= 3)
    .sort((a, b) => a.winRate - b.winRate)[0];

  // Total games
  const totalGames = playerOverallStats?.totalGames ?? 0;
  const totalWins = playerOverallStats?.wins ?? 0;
  const totalLosses = playerOverallStats?.losses ?? 0;
  const totalDraws = playerOverallStats?.draws ?? 0;
  const winRate = totalGames > 0 ? (totalWins / totalGames) * 100 : 0;

  // Get streak information
  const currentStreak = playerOverallStats?.currentStreak ?? 0;
  const longestWinStreak = playerOverallStats?.longestWinStreak ?? 0;

  // Calculate effectiveness of each choice (win rate when using each choice)
  // This would require additional data that we don't currently track
  // For now, we'll just show the usage statistics we have

  if (playerH2HStats.length === 0) {
    return (
      <div className="rounded-lg bg-white/5 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">1v1 Statistikk</h2>
          <Link
            href="/spill/mars/stats"
            className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
          >
            Leaderboard
          </Link>
        </div>
        <p className="text-center text-gray-400">
          Ingen 1v1 statistikk funnet for denne spilleren.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Games Card */}
        <div className="rounded-lg bg-white/5 p-4 text-center shadow-md">
          <h3 className="text-lg font-medium text-gray-300">Antall Kamper</h3>
          <p className="mt-2 text-3xl font-bold text-white">{totalGames}</p>
          <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
            <div className="flex flex-col items-center rounded-md bg-white/5 p-2">
              <span className="text-green-400">{totalWins}</span>
              <span className="text-xs text-gray-400">seiere</span>
            </div>
            <div className="flex flex-col items-center rounded-md bg-white/5 p-2">
              <span className="text-yellow-400">{totalDraws}</span>
              <span className="text-xs text-gray-400">uavgjort</span>
            </div>
            <div className="flex flex-col items-center rounded-md bg-white/5 p-2">
              <span className="text-red-400">{totalLosses}</span>
              <span className="text-xs text-gray-400">tap</span>
            </div>
          </div>
        </div>

        {/* Win Rate Card */}
        <div className="rounded-lg bg-white/5 p-4 text-center shadow-md">
          <h3 className="text-lg font-medium text-gray-300">Vinnprosent</h3>
          <p className="mt-2 text-3xl font-bold text-white">
            {winRate.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500">
            {totalWins} av {totalGames} kamper
          </p>
        </div>

        {/* Streak Card */}
        <div className="rounded-lg bg-white/5 p-4 text-center shadow-md">
          <h3 className="text-lg font-medium text-gray-300">
            Nåværende Streak
          </h3>
          <p className="mt-2 text-3xl font-bold text-white">
            {currentStreak > 0 ? `+${currentStreak}` : currentStreak}
          </p>
          <p className="text-xs text-gray-500">
            {currentStreak > 0
              ? `${currentStreak} seiere på rad`
              : currentStreak < 0
                ? `${Math.abs(currentStreak)} tap på rad`
                : "Ingen streak"}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Lengste vinnerrekke: {longestWinStreak}
          </p>
        </div>

        {/* Choice Distribution Card */}
        {totalChoices > 0 && (
          <div className="rounded-lg bg-white/5 p-4 text-center shadow-md">
            <h3 className="text-lg font-medium text-gray-300">
              Valg fordeling
            </h3>
            <div className="mt-2 flex flex-wrap justify-between">
              <div className="flex flex-1 flex-col items-center">
                <div className="text-3xl">🪨</div>
                <div className="mt-1 text-xl font-semibold text-white">
                  {rockPercentage.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-400">{rockCount} ganger</div>
              </div>
              <div className="flex flex-1 flex-col items-center">
                <div className="text-3xl">📄</div>
                <div className="mt-1 text-xl font-semibold text-white">
                  {paperPercentage.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-400">{paperCount} ganger</div>
              </div>
              <div className="flex flex-1 flex-col items-center">
                <div className="text-3xl">✂️</div>
                <div className="mt-1 text-xl font-semibold text-white">
                  {scissorsPercentage.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-400">
                  {scissorsCount} ganger
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Most Common Opponent Card */}
        {mostCommonOpponent && (
          <div className="rounded-lg bg-white/5 p-4 text-center shadow-md">
            <h3 className="text-lg font-medium text-gray-300">
              Favorittmotstander
            </h3>
            <p className="mt-2 text-xl font-bold text-white">
              <Link
                href={`/spill/mars/stats/player/${mostCommonOpponent.opponentId}`}
                className="hover:text-[#CC65FF] hover:underline"
              >
                {mostCommonOpponent.opponentName}
              </Link>
            </p>
            <p className="text-sm text-gray-400">
              {mostCommonOpponent.totalGames} kamper
            </p>
          </div>
        )}

        {/* Best Win Ratio Card */}
        {bestWinRatio && (
          <div className="rounded-lg bg-white/5 p-4 text-center shadow-md">
            <h3 className="text-lg font-medium text-gray-300">
              Beste vinnprosent
            </h3>
            <p className="mt-2 text-xl font-bold text-white">
              <Link
                href={`/spill/mars/stats/player/${bestWinRatio.opponentId}`}
                className="hover:text-[#CC65FF] hover:underline"
              >
                {bestWinRatio.opponentName}
              </Link>
            </p>
            <p className="text-sm text-gray-400">
              {(bestWinRatio.winRate * 100).toFixed(1)}% (
              {bestWinRatio.playerWins}-{bestWinRatio.opponentWins}-
              {bestWinRatio.draws})
            </p>
          </div>
        )}

        {/* Worst Win Ratio Card */}
        {worstWinRatio && (
          <div className="rounded-lg bg-white/5 p-4 text-center shadow-md">
            <h3 className="text-lg font-medium text-gray-300">
              Dårligste vinnprosent
            </h3>
            <p className="mt-2 text-xl font-bold text-white">
              <Link
                href={`/spill/mars/stats/player/${worstWinRatio.opponentId}`}
                className="hover:text-[#CC65FF] hover:underline"
              >
                {worstWinRatio.opponentName}
              </Link>
            </p>
            <p className="text-sm text-gray-400">
              {(worstWinRatio.winRate * 100).toFixed(1)}% (
              {worstWinRatio.playerWins}-{worstWinRatio.opponentWins}-
              {worstWinRatio.draws})
            </p>
          </div>
        )}
      </div>

      {/* Head-to-Head Table */}
      <div className="rounded-lg bg-white/5 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">1v1 Statistikk</h2>
          <Link
            href="/spill/mars/stats"
            className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
          >
            Leaderboard
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="pb-2 text-white">Motstander</th>
                <th className="pb-2 text-white">{playerName} Seiere</th>
                <th className="pb-2 text-white">Motstander Seiere</th>
                <th className="pb-2 text-white">Uavgjort</th>
                <th className="pb-2 text-white">Total</th>
                <th className="pb-2 text-white">Vinn %</th>
              </tr>
            </thead>
            <tbody>
              {opponentStats.map((stats) => {
                const winPercentage =
                  stats.totalGames > 0
                    ? (stats.winRate * 100).toFixed(1)
                    : "0.0";

                return (
                  <tr
                    key={stats.opponentId}
                    className="border-b border-white/5 text-sm"
                  >
                    <td className="py-2 text-white">
                      <Link
                        href={`/spill/mars/stats/player/${stats.opponentId}`}
                        className="hover:text-[#CC65FF] hover:underline"
                      >
                        {stats.opponentName}
                      </Link>
                    </td>
                    <td className="py-2 text-green-400">{stats.playerWins}</td>
                    <td className="py-2 text-red-400">{stats.opponentWins}</td>
                    <td className="py-2 text-yellow-400">{stats.draws}</td>
                    <td className="py-2 text-white">{stats.totalGames}</td>
                    <td className="py-2 text-[#CC65FF]">{winPercentage}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

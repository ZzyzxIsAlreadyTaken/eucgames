import { getStats } from "../_actions/getStats";

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

interface StatsResult {
  success: boolean;
  error?: string;
  playerStats?: PlayerStats[];
  headToHeadStats?: HeadToHeadStats[];
}

export async function StatsContent() {
  const result: StatsResult = await getStats();

  if (!result.success || !result.playerStats || !result.headToHeadStats) {
    return (
      <div className="text-center text-red-500">
        Kunne ikke laste statistikk. Prøv igjen senere.
      </div>
    );
  }

  const { playerStats, headToHeadStats } = result;

  // Sort players by win percentage (minimum 5 games)
  const sortedPlayers = [...playerStats].sort(
    (a: PlayerStats, b: PlayerStats) => {
      const aWinRate = a.totalGames >= 5 ? (a.wins / a.totalGames) * 100 : -1;
      const bWinRate = b.totalGames >= 5 ? (b.wins / b.totalGames) * 100 : -1;
      return bWinRate - aWinRate;
    },
  );

  return (
    <div className="space-y-8">
      {/* Overall Player Statistics */}
      <div className="rounded-lg bg-white/5 p-6">
        <h2 className="mb-4 text-2xl font-semibold">Spillerstatistikk</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="pb-2">Spiller</th>
                <th className="pb-2">Kamper</th>
                <th className="pb-2">Seiere</th>
                <th className="pb-2">Tap</th>
                <th className="pb-2">Uavgjort</th>
                <th className="pb-2">Vinn %</th>
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map((player) => {
                const winPercentage =
                  player.totalGames > 0
                    ? ((player.wins / player.totalGames) * 100).toFixed(1)
                    : "0.0";

                return (
                  <tr
                    key={player.userId}
                    className="border-b border-white/5 text-sm"
                  >
                    <td className="py-2">{player.username}</td>
                    <td className="py-2">{player.totalGames}</td>
                    <td className="py-2 text-green-400">{player.wins}</td>
                    <td className="py-2 text-red-400">{player.losses}</td>
                    <td className="py-2 text-yellow-400">{player.draws}</td>
                    <td className="py-2">{winPercentage}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Head-to-Head Statistics */}
      <div className="rounded-lg bg-white/5 p-6">
        <h2 className="mb-4 text-2xl font-semibold">1v1 Statistikk</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="pb-2">Spiller 1</th>
                <th className="pb-2">Spiller 2</th>
                <th className="pb-2">Spiller 1 Seiere</th>
                <th className="pb-2">Spiller 2 Seiere</th>
                <th className="pb-2">Uavgjort</th>
                <th className="pb-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {headToHeadStats.map((stats) => {
                const totalGames =
                  stats.player1Wins + stats.player2Wins + stats.draws;
                return (
                  <tr
                    key={`${stats.player1Id}-${stats.player2Id}`}
                    className="border-b border-white/5 text-sm"
                  >
                    <td className="py-2">{stats.player1Name}</td>
                    <td className="py-2">{stats.player2Name}</td>
                    <td className="py-2 text-green-400">{stats.player1Wins}</td>
                    <td className="py-2 text-green-400">{stats.player2Wins}</td>
                    <td className="py-2 text-yellow-400">{stats.draws}</td>
                    <td className="py-2">{totalGames}</td>
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

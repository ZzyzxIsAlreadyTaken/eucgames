import { getStats } from "../_actions/getStats";
import Link from "next/link";

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
        <h2 className="mb-4 text-2xl font-semibold text-white">
          Spillerstatistikk
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="pb-2 text-white">Spiller</th>
                <th className="pb-2 text-white">Kamper</th>
                <th className="pb-2 text-white">Seiere</th>
                <th className="pb-2 text-white">Tap</th>
                <th className="pb-2 text-white">Uavgjort</th>
                <th className="pb-2 text-white">Vinn %</th>
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
                    <td className="py-2 text-white">
                      <Link
                        href={`/spill/mars/stats/player/${player.userId}`}
                        className="hover:text-[#CC65FF] hover:underline"
                      >
                        {player.username}
                      </Link>
                    </td>
                    <td className="py-2 text-white">{player.totalGames}</td>
                    <td className="py-2 text-green-400">{player.wins}</td>
                    <td className="py-2 text-red-400">{player.losses}</td>
                    <td className="py-2 text-yellow-400">{player.draws}</td>
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

import React from "react";
import ActivityCard from "../_components/ActivityCard";
import { getMemoryStats } from "./queries";

async function februarstatistikkPage() {
  const stats = await getMemoryStats();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <div className="h-32 w-full sm:w-5/12 lg:w-[23%]">
          <ActivityCard title="Antall spill" value={stats.totalGames} />
        </div>
        <div className="h-32 w-full sm:w-5/12 lg:w-[23%]">
          <ActivityCard
            title="Antall spill per dag"
            value={stats.gamesPerDay}
          />
        </div>
        <div className="h-32 w-full sm:w-5/12 lg:w-[23%]">
          <ActivityCard
            title="Antall unike spillere"
            value={stats.uniquePlayers}
          />
        </div>
        <div className="h-32 w-full sm:w-5/12 lg:w-[23%]">
          <ActivityCard
            title="Mest populære gamemode"
            value={stats.mostPopularGameMode}
          />
        </div>
        <div className="h-32 w-full sm:w-5/12 lg:w-[23%]">
          <ActivityCard
            title="Minst populære gamemode"
            value={stats.leastPopularGameMode}
          />
        </div>
        <div className="h-32 w-full sm:w-5/12 lg:w-[23%]">
          <ActivityCard
            title="Mest populære vanskelighetsgrad"
            value={stats.mostPopularDifficulty}
          />
        </div>
        <div className="h-32 w-full sm:w-5/12 lg:w-[23%]">
          <ActivityCard
            title="Minst populære vanskelighetsgrad"
            value={stats.leastPopularDifficulty}
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Spiller
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Antall spill
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Favoritt modus
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Easy
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Normal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Hard
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Insane
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {stats.playerStats.map((player) => (
              <tr
                key={`${player.userId}-${player.username}`}
                className="hover:bg-gray-50"
              >
                <td className="whitespace-nowrap px-6 py-4">
                  {player.username}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  {player.gamesPlayed}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  {player.favoriteGameMode}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  {player.bestScores.easy ? (
                    <>
                      {player.bestScores.easy.isHighScore ? (
                        <span className="font-bold">
                          {player.bestScores.easy.time}s /{" "}
                          {player.bestScores.easy.tries} forsøk
                        </span>
                      ) : (
                        <>
                          {player.bestScores.easy.time}s /{" "}
                          {player.bestScores.easy.tries} forsøk
                        </>
                      )}
                    </>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  {player.bestScores.normal ? (
                    <>
                      {player.bestScores.normal.isHighScore ? (
                        <span className="font-bold">
                          {player.bestScores.normal.time}s /{" "}
                          {player.bestScores.normal.tries} forsøk
                        </span>
                      ) : (
                        <>
                          {player.bestScores.normal.time}s /{" "}
                          {player.bestScores.normal.tries} forsøk
                        </>
                      )}
                    </>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  {player.bestScores.hard ? (
                    <>
                      {player.bestScores.hard.isHighScore ? (
                        <span className="font-bold">
                          {player.bestScores.hard.time}s /{" "}
                          {player.bestScores.hard.tries} forsøk
                        </span>
                      ) : (
                        <>
                          {player.bestScores.hard.time}s /{" "}
                          {player.bestScores.hard.tries} forsøk
                        </>
                      )}
                    </>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  {player.bestScores.insane ? (
                    <>
                      {player.bestScores.insane.isHighScore ? (
                        <span className="font-bold">
                          {player.bestScores.insane.time}s /{" "}
                          {player.bestScores.insane.tries} forsøk
                        </span>
                      ) : (
                        <>
                          {player.bestScores.insane.time}s /{" "}
                          {player.bestScores.insane.tries} forsøk
                        </>
                      )}
                    </>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default februarstatistikkPage;

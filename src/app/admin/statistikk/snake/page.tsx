import { clerkClient } from "../../../../lib/clerkClient";
import { db } from "~/server/db";
import { scores } from "~/server/db/schema";
import { desc, sql } from "drizzle-orm";
import { startOfMonth, eachDayOfInterval, isWithinInterval } from "date-fns";

interface StatsCardProps {
  title: string;
  value?: number;
  graph?: number[];
}

function ActivityGraph({ data, dates }: { data: number[]; dates: Date[] }) {
  const max = Math.max(...data);
  return (
    <div>
      <div className="flex h-12 items-end gap-0.5">
        {data.map((value, i) => {
          // Calculate opacity based on value (higher value = darker)
          const opacity = 0.3 + (value / max) * 0.7; // Range from 0.3 to 1.0
          return (
            <div
              key={i}
              title={`${dates[i]?.toLocaleDateString() ?? ""}: ${value} visits`}
              className="flex-1 transition-all hover:bg-purple-300"
              style={{
                height: `${(value / max) * 100}%`,
                minHeight: value > 0 ? "2px" : "0",
                backgroundColor: `rgba(204, 101, 255, ${opacity})`, // Using the EUC Games purple (#CC65FF)
              }}
            />
          );
        })}
      </div>
      <div className="mt-1 flex gap-0.5 text-xs text-gray-500">
        {dates.map((date, i) => (
          <div key={i} className="flex-1 text-center">
            {date.getDate()}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
  graph,
  dates,
}: StatsCardProps & { dates?: Date[] }) {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      {graph && dates ? (
        <ActivityGraph data={graph} dates={dates} />
      ) : (
        <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
      )}
    </div>
  );
}

async function AnalyticsPage() {
  // Fetch users with their activity data
  const users = await clerkClient.users.getUserList({
    limit: 100,
  });

  // Fetch game stats from Drizzle
  const gameStats = await db
    .select({
      totalGames: sql<number>`count(*)`,
      avgScore: sql<number>`avg(${scores.score})`,
      maxScore: sql<number>`max(${scores.score})`,
      activeUsers: sql<number>`count(distinct ${scores.userId})`,
      gamesLastDay: sql<number>`count(*) filter (where ${scores.createdAt} > now() - interval '1 day')`,
      gamesLastWeek: sql<number>`count(*) filter (where ${scores.createdAt} > now() - interval '7 days')`,
      avgGamesPerUser: sql<number>`round(cast(count(*) as decimal) / nullif(count(distinct ${scores.userId}), 0), 1)`,
    })
    .from(scores)
    .where(sql`${scores.game} = 'snake'`);

  // Get top players
  const allPlayers = await db
    .select({
      userId: scores.userId,
      username: scores.username,
      gamesPlayed: sql<number>`count(*)`,
      topScore: sql<number>`max(${scores.score})`,
    })
    .from(scores)
    .where(sql`${scores.game} = 'snake'`)
    .groupBy(scores.userId, scores.username)
    .orderBy(desc(sql`max(${scores.score})`))
    .limit(100);

  // Process user activity data
  const now: Date = new Date();
  const monthStart: Date = new Date(2025, 0, 1); // January 1, 2025
  const monthEnd: Date =
    now.getMonth() === 0 && now.getFullYear() === 2025
      ? now // Use current date if we're in January 2025
      : new Date(2025, 0, 31); // Otherwise use January 31, 2025

  const daysInMonth: Date[] = eachDayOfInterval({
    start: monthStart,
    end: monthEnd,
  });

  const dailyActivity = daysInMonth.map((day) => {
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);

    const activity = users.data.filter((user) => {
      const lastActive = user.lastActiveAt ? new Date(user.lastActiveAt) : null;
      return (
        lastActive &&
        isWithinInterval(lastActive, {
          start: day,
          end: dayEnd,
        })
      );
    }).length;

    return activity;
  });

  // Fetch daily game counts
  const dailyGames = await db
    .select({
      count: sql<number>`count(*)`,
      date: sql<string>`date_trunc('day', ${scores.createdAt})`,
    })
    .from(scores)
    .where(sql`${scores.game} = 'snake'`)
    .groupBy(sql`date_trunc('day', ${scores.createdAt})`)
    .orderBy(sql`date_trunc('day', ${scores.createdAt})`);

  // Process the data for the graph
  const dailyGameCounts = daysInMonth.map((day) => {
    const dayData = dailyGames.find(
      (game) => new Date(game.date).toDateString() === day.toDateString(),
    );
    return dayData?.count ?? 0;
  });

  const stats = {
    totalUsers: users.data.length,
    activeUsers: gameStats[0]?.activeUsers ?? 0,
    totalGames: gameStats[0]?.totalGames ?? 0,
    averageScore: Math.round(gameStats[0]?.avgScore ?? 0),
    gamesLastDay: gameStats[0]?.gamesLastDay ?? 0,
    gamesLastWeek: gameStats[0]?.gamesLastWeek ?? 0,
    avgGamesPerUser: gameStats[0]?.avgGamesPerUser ?? 0,
  };

  return (
    <div className="p-8">
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Bruker på plattformen" value={stats.totalUsers} />

        <StatsCard title="Aktive brukere" value={stats.activeUsers} />
        <StatsCard
          title="Daglig aktivitet"
          graph={dailyActivity}
          dates={daysInMonth}
        />
        <StatsCard
          title="Spill per dag"
          graph={dailyGameCounts}
          dates={daysInMonth}
        />
        <StatsCard title="Total spill" value={stats.totalGames} />
        <StatsCard
          title="Gjennomsnittlig poengsum"
          value={stats.averageScore}
        />
        <StatsCard title="Spill siste 24t" value={stats.gamesLastDay} />
        <StatsCard title="Spill siste 7 dager" value={stats.gamesLastWeek} />
        <StatsCard
          title="Gjennomsnittlig spill per bruker"
          value={stats.avgGamesPerUser}
        />
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
                Top Score
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {allPlayers.map((player) => (
              <tr key={player.userId} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4">
                  {player.username}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  {player.gamesPlayed}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  {player.topScore}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AnalyticsPage;

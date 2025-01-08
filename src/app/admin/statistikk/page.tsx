import Link from "next/link";
import { db } from "~/server/db";
import { scores } from "~/server/db/schema";
import { sql } from "drizzle-orm";
import { clerkClient } from "../../../lib/clerkClient";
import { eachDayOfInterval, startOfMonth, isWithinInterval } from "date-fns";

interface StatsCardProps {
  title: string;
  value?: number | string;
  graph?: number[];
  dates?: Date[];
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

function StatsCard({ title, value, graph, dates }: StatsCardProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
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
  // Fetch users
  const users = await clerkClient.users.getUserList({
    limit: 100,
  });

  // Get time ranges
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Enhanced game stats query
  const gameStats = await db
    .select({
      totalGames: sql<number>`count(*)`,
      avgScore: sql<number>`avg(${scores.score})`,
      maxScore: sql<number>`max(${scores.score})`,
      activeUsers: sql<number>`count(distinct ${scores.userId})`,
      gamesLastDay: sql<number>`count(*) filter (where ${scores.createdAt} > ${oneDayAgo})`,
      gamesLastWeek: sql<number>`count(*) filter (where ${scores.createdAt} > ${sevenDaysAgo})`,
      avgGamesPerUser: sql<number>`round(cast(count(*) as decimal) / nullif(count(distinct ${scores.userId}), 0), 1)`,
      peakConcurrentPlayers: sql<number>`
        (
          select count(distinct ${scores.userId})
          from ${scores}
          where ${scores.createdAt} > now() - interval '1 hour'
          group by date_trunc('hour', ${scores.createdAt})
          order by count(distinct ${scores.userId}) desc
          limit 1
        )
      `,
    })
    .from(scores)
    .where(sql`${scores.game} = 'snake'`);

  // Calculate daily activity
  const monthStart = startOfMonth(now);
  const daysInMonth = eachDayOfInterval({
    start: monthStart,
    end: now,
  });

  // Get all scores for the current month
  const monthlyScores = await db
    .select({
      userId: scores.userId,
      createdAt: scores.createdAt,
    })
    .from(scores)
    .where(
      sql`${scores.game} = 'snake' AND ${scores.createdAt} >= ${monthStart}`,
    );

  // Calculate daily activity based on unique players per day
  const dailyActivity = daysInMonth.map((day) => {
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);

    return monthlyScores.filter((score) =>
      isWithinInterval(new Date(score.createdAt), {
        start: day,
        end: dayEnd,
      }),
    ).length;
  });

  // Calculate returning players (players who have played more than once)
  const playerFrequency = await db
    .select({
      userId: scores.userId,
      gameCount: sql<number>`count(*)`,
    })
    .from(scores)
    .where(sql`${scores.game} = 'snake'`)
    .groupBy(scores.userId)
    .having(sql`count(*) > 1`);

  const stats = {
    totalUsers: users.data?.length ?? 0,
    activeUsers: gameStats[0]?.activeUsers ?? 0,
    totalGames: gameStats[0]?.totalGames ?? 0,
    averageScore: Math.round(gameStats[0]?.avgScore ?? 0),
    gamesLastDay: gameStats[0]?.gamesLastDay ?? 0,
    gamesLastWeek: gameStats[0]?.gamesLastWeek ?? 0,
    avgGamesPerUser: gameStats[0]?.avgGamesPerUser ?? 0,
    averageSessionLength: "2m 30s*", // TODO: Implement session tracking
    peakConcurrentPlayers: gameStats[0]?.peakConcurrentPlayers ?? 0,
    returningPlayers: playerFrequency.length,
    conversionRate: `${Math.round(((gameStats[0]?.activeUsers ?? 0) / (users.data?.length || 1)) * 100)}%`,
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Overordnet Statistikk</h1>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Bruker på plattformen" value={stats.totalUsers} />
        <StatsCard title="Aktive brukere" value={stats.activeUsers} />
        <StatsCard
          title="Aktivitet"
          graph={dailyActivity}
          dates={daysInMonth}
        />
        <Link
          href="/admin/statistikk/snake"
          className="rounded-lg bg-white p-6 shadow-md hover:bg-gray-50"
        >
          <h3 className="text-sm font-medium text-gray-500">
            Snake Statistikk
          </h3>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-lg font-medium text-gray-900">
              Se detaljer
            </span>
            <span className="text-gray-500">→</span>
          </div>
        </Link>
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
        <StatsCard
          title="Gjennomsnittlig spilletid"
          value={stats.averageSessionLength}
        />
        <StatsCard
          title="Samtidige spillere (topp)"
          value={stats.peakConcurrentPlayers}
        />
        <StatsCard
          title="Returnerende spillere"
          value={stats.returningPlayers}
        />
        <StatsCard title="Konverteringsrate" value={stats.conversionRate} />
      </div>
    </div>
  );
}

export default AnalyticsPage;

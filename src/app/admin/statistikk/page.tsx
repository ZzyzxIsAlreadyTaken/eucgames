import Link from "next/link";
import { db } from "~/server/db";
import { scores, scoresMemory } from "~/server/db/schema";
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

function StatsCard({
  title,
  value,
  graph,
  dates,
  className,
}: StatsCardProps & { className?: string }) {
  return (
    <div className={`rounded-lg bg-white p-6 shadow ${className ?? ""}`}>
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
  const users = await clerkClient.users.getUserList({
    limit: 100,
  });

  // Get time ranges
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const mockUserFilter = sql`"userId" NOT LIKE 'mock-user-%'`;

  // Combined stats query for both games
  const combinedStats = await db.select({
    totalGames: sql<number>`(
        SELECT COUNT(*) FROM ${scores} WHERE game = 'snake' AND "userId" NOT LIKE 'mock-user-%'
      ) + (
        SELECT COUNT(*) FROM ${scoresMemory} WHERE "userId" NOT LIKE 'mock-user-%'
      )`,
    activeUsers: sql<number>`COUNT(DISTINCT "userId")`,
    gamesLastDay: sql<number>`(
        SELECT COUNT(*) FROM ${scores} 
        WHERE game = 'snake' AND created_at > ${oneDayAgo} AND "userId" NOT LIKE 'mock-user-%'
      ) + (
        SELECT COUNT(*) FROM ${scoresMemory} 
        WHERE created_at > ${oneDayAgo} AND "userId" NOT LIKE 'mock-user-%'
      )`,
    gamesLastWeek: sql<number>`(
        SELECT COUNT(*) FROM ${scores} 
        WHERE game = 'snake' AND created_at > ${sevenDaysAgo} AND "userId" NOT LIKE 'mock-user-%'
      ) + (
        SELECT COUNT(*) FROM ${scoresMemory} 
        WHERE created_at > ${sevenDaysAgo} AND "userId" NOT LIKE 'mock-user-%'
      )`,
    avgGamesPerUser: sql<number>`
        ROUND(
          CAST((
            SELECT COUNT(*) FROM ${scores} WHERE game = 'snake' AND "userId" NOT LIKE 'mock-user-%'
          ) + (
            SELECT COUNT(*) FROM ${scoresMemory} WHERE "userId" NOT LIKE 'mock-user-%'
          ) AS decimal
        ) / NULLIF(COUNT(DISTINCT "userId"), 0), 1)
      `,
    peakHour: sql<number>`(
        SELECT EXTRACT(HOUR FROM created_at)::integer as hour
        FROM (
          SELECT created_at FROM ${scores} WHERE "userId" NOT LIKE 'mock-user-%'
          UNION ALL
          SELECT created_at FROM ${scoresMemory} WHERE "userId" NOT LIKE 'mock-user-%'
        ) combined
        GROUP BY hour
        ORDER BY COUNT(*) DESC
        LIMIT 1
      )`,
    crossGamePlayers: sql<number>`(
        SELECT COUNT(DISTINCT s."userId")
        FROM ${scores} s
        INNER JOIN ${scoresMemory} m ON s."userId" = m."userId"
        WHERE s."userId" NOT LIKE 'mock-user-%'
      )`,
    mostActiveDay: sql<string>`(
        SELECT TO_CHAR(created_at, 'Day')
        FROM (
          SELECT created_at FROM ${scores} WHERE "userId" NOT LIKE 'mock-user-%'
          UNION ALL
          SELECT created_at FROM ${scoresMemory} WHERE "userId" NOT LIKE 'mock-user-%'
        ) combined
        GROUP BY TO_CHAR(created_at, 'Day')
        ORDER BY COUNT(*) DESC
        LIMIT 1
      )`,
    weeklyGrowth: sql<number>`(
        SELECT ROUND(((this_week::float / NULLIF(last_week, 0)) - 1) * 100)
        FROM (
          SELECT 
            COUNT(*) FILTER (WHERE created_at > ${sevenDaysAgo}) as this_week,
            COUNT(*) FILTER (WHERE created_at > ${new Date(sevenDaysAgo.getTime() - 7 * 24 * 60 * 60 * 1000)} AND created_at <= ${sevenDaysAgo}) as last_week
          FROM (
            SELECT created_at FROM ${scores} WHERE "userId" NOT LIKE 'mock-user-%'
            UNION ALL
            SELECT created_at FROM ${scoresMemory} WHERE "userId" NOT LIKE 'mock-user-%'
          ) combined
        ) weekly_counts
      )`,
    avgGamesPerSession: sql<number>`(
        SELECT ROUND(CAST(COUNT(*) AS decimal) / NULLIF(SUM(new_session), 0), 1)
        FROM (
          SELECT 
            CASE 
              WHEN created_at - LAG(created_at) OVER (PARTITION BY "userId" ORDER BY created_at) > INTERVAL '30 minutes'
              THEN 1
              ELSE 0
            END as new_session
          FROM (
            SELECT "userId", created_at 
            FROM ${scores} 
            WHERE "userId" NOT LIKE 'mock-user-%'
            UNION ALL
            SELECT "userId", created_at 
            FROM ${scoresMemory} 
            WHERE "userId" NOT LIKE 'mock-user-%'
          ) combined
        ) sessions
      )`,
    avgSessionLength: sql<number>`(
        SELECT ROUND(AVG(session_length) / 60, 2)
        FROM (
          SELECT 
            "userId",
            SUM(EXTRACT(EPOCH FROM (session_end - session_start))) AS session_length
          FROM (
            SELECT 
              "userId",
              MIN(created_at) AS session_start,
              MAX(created_at) AS session_end
            FROM (
              SELECT 
                "userId",
                created_at,
                SUM(new_session) OVER (PARTITION BY "userId" ORDER BY created_at) AS session_id
              FROM (
                SELECT 
                  "userId",
                  created_at,
                  CASE 
                    WHEN LAG(created_at) OVER (PARTITION BY "userId" ORDER BY created_at) IS NULL 
                    OR EXTRACT(EPOCH FROM (created_at - LAG(created_at) OVER (PARTITION BY "userId" ORDER BY created_at))) / 60 >= 20 
                    THEN 1 
                    ELSE 0 
                  END AS new_session
                FROM (
                  SELECT "userId", created_at FROM ${scores} WHERE "userId" NOT LIKE 'mock-user-%'
                  UNION ALL
                  SELECT "userId", created_at FROM ${scoresMemory} WHERE "userId" NOT LIKE 'mock-user-%'
                ) combined
              ) marked_sessions
            ) grouped_sessions
            GROUP BY "userId", session_id
          ) session_data
          GROUP BY "userId"
        ) avg_sessions
      )`,
  }).from(sql`(
      SELECT "userId" FROM ${scores} WHERE game = 'snake' AND "userId" NOT LIKE 'mock-user-%'
      UNION
      SELECT "userId" FROM ${scoresMemory} WHERE "userId" NOT LIKE 'mock-user-%'
    ) as combined_users`);

  // Calculate daily activity for both games
  const monthStart = startOfMonth(now);
  const daysInMonth = eachDayOfInterval({
    start: monthStart,
    end: now,
  });

  // Get all scores for the current month from both games
  const monthlySnakeScores = await db
    .select({
      createdAt: scores.createdAt,
    })
    .from(scores)
    .where(
      sql`game = 'snake' AND created_at >= ${monthStart} AND "userId" NOT LIKE 'mock-user-%'`,
    );

  const monthlyMemoryScores = await db
    .select({
      createdAt: scoresMemory.createdAt,
    })
    .from(scoresMemory)
    .where(
      sql`created_at >= ${monthStart} AND "userId" NOT LIKE 'mock-user-%'`,
    );

  // Combine scores for daily activity
  const allMonthlyScores = [...monthlySnakeScores, ...monthlyMemoryScores];

  const dailyActivity = daysInMonth.map((day) => {
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);

    return allMonthlyScores.filter((score) =>
      isWithinInterval(new Date(score.createdAt), {
        start: day,
        end: dayEnd,
      }),
    ).length;
  });

  const stats = {
    totalUsers: users.data?.length ?? 0,
    activeUsers: combinedStats[0]?.activeUsers ?? 0,
    totalGames: combinedStats[0]?.totalGames ?? 0,
    gamesLastDay: combinedStats[0]?.gamesLastDay ?? 0,
    gamesLastWeek: combinedStats[0]?.gamesLastWeek ?? 0,
    avgGamesPerUser: combinedStats[0]?.avgGamesPerUser ?? 0,
    averageSessionLength: combinedStats[0]?.avgSessionLength ?? 0,
  };

  const formatMinutes = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = Math.floor(minutes % 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Statistikk</h1>
        <nav className="mt-4 flex gap-4">
          <Link
            href="/admin/statistikk/snake"
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-sm hover:bg-gray-50"
          >
            <span className="font-medium text-gray-900">Januar</span>
          </Link>
          <Link
            href="/admin/statistikk/memory"
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-sm hover:bg-gray-50"
          >
            <span className="font-medium text-gray-900">Februar</span>
          </Link>
          <Link
            href="/admin/statistikk/memory"
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-sm hover:bg-gray-50"
          >
            <span className="font-medium text-gray-900">Mars</span>
          </Link>
          <Link
            href="/admin/statistikk/memory"
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-sm hover:bg-gray-50"
          >
            <span className="font-medium text-gray-900">April</span>
          </Link>
          <Link
            href="/admin/statistikk/memory"
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-sm hover:bg-gray-50"
          >
            <span className="font-medium text-gray-900">Mai</span>
          </Link>
          <Link
            href="/admin/statistikk/memory"
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-sm hover:bg-gray-50"
          >
            <span className="font-medium text-gray-900">Juni</span>
          </Link>
        </nav>
      </div>

      <div className="flex flex-wrap gap-4">
        <StatsCard
          title="Brukere på plattformen"
          value={stats.totalUsers}
          className="h-32 w-full sm:w-5/12 lg:w-[23%]"
        />
        <StatsCard
          title="Aktive brukere"
          value={stats.activeUsers}
          className="h-32 w-full sm:w-5/12 lg:w-[23%]"
        />
        <StatsCard
          title="Aktivitet"
          graph={dailyActivity}
          dates={daysInMonth}
          className="h-32 w-full sm:w-5/12 lg:w-[23%]"
        />
        <StatsCard
          title="Totalt antall spill"
          value={stats.totalGames}
          className="h-32 w-full sm:w-5/12 lg:w-[23%]"
        />
        <StatsCard
          title="Spill siste 24t"
          value={stats.gamesLastDay}
          className="h-32 w-full sm:w-5/12 lg:w-[23%]"
        />
        <StatsCard
          title="Spill siste 7 dager"
          value={stats.gamesLastWeek}
          className="h-32 w-full sm:w-5/12 lg:w-[23%]"
        />
        <StatsCard
          title="Gjennomsnittlig spill per bruker"
          value={stats.avgGamesPerUser}
          className="h-32 w-full sm:w-5/12 lg:w-[23%]"
        />
        <StatsCard
          title="Gjennomsnittlig spilletid"
          value={formatMinutes(stats.averageSessionLength)}
          className="h-32 w-full sm:w-5/12 lg:w-[23%]"
        />
        <StatsCard
          title="Spillere som spiller begge spill"
          value={combinedStats[0]?.crossGamePlayers ?? 0}
          className="h-32 w-full sm:w-5/12 lg:w-[23%]"
        />
        <StatsCard
          title="Mest aktive dag"
          value={combinedStats[0]?.mostActiveDay ?? "N/A"}
          className="h-32 w-full sm:w-5/12 lg:w-[23%]"
        />
        <StatsCard
          title="Vekst fra forrige uke"
          value={`${combinedStats[0]?.weeklyGrowth ?? 0}%`}
          className="h-32 w-full sm:w-5/12 lg:w-[23%]"
        />
        <StatsCard
          title="Spill per økt"
          value={combinedStats[0]?.avgGamesPerSession ?? 0}
          className="h-32 w-full sm:w-5/12 lg:w-[23%]"
        />
        <StatsCard
          title="Mest aktive time"
          value={`${combinedStats[0]?.peakHour ?? 0}:00`}
          className="h-32 w-full sm:w-5/12 lg:w-[23%]"
        />
      </div>
    </div>
  );
}

export default AnalyticsPage;

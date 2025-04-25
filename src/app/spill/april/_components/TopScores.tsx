"use client";

import { useEffect, useState } from "react";
import { getTopScores } from "./getTopScores";
import Image from "next/image";

interface TopScore {
  id: number;
  userId: string;
  username: string;
  score: number;
  createdAt: Date;
  imageUrl?: string | null;
}

export function TopScores() {
  const [topScores, setTopScores] = useState<TopScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopScores = async () => {
      try {
        const scores = await getTopScores();
        setTopScores(scores);
      } catch (error) {
        console.error("Error fetching top scores:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchTopScores();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-lg border-2 border-yellow-300 bg-gradient-to-b from-yellow-100 to-yellow-200 p-6 shadow-lg">
        <p className="text-yellow-800">Laster Highscores...</p>
      </div>
    );
  }

  if (topScores.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-lg border-2 border-yellow-300 bg-gradient-to-b from-yellow-100 to-yellow-200 p-6 shadow-lg">
        <h2 className="mb-4 text-2xl font-bold text-yellow-800">Highscores</h2>
        <p className="text-yellow-700">Ingen poeng ennå. Vær den første!</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-lg border-2 border-yellow-300 bg-gradient-to-b from-yellow-100 to-yellow-200 p-6 shadow-lg">
      <h2 className="mb-4 text-2xl font-bold text-yellow-800">Highscores</h2>
      <div className="w-full space-y-2">
        {topScores.map((score, index) => (
          <div
            key={score.id}
            className="flex items-center justify-between rounded bg-yellow-300/50 p-3"
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg font-bold text-yellow-800">
                #{index + 1}
              </span>
              {score.imageUrl ? (
                <Image
                  src={score.imageUrl}
                  alt={score.username}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-yellow-400" />
              )}
              <span className="text-yellow-800">{score.username}</span>
            </div>
            <span className="text-lg font-bold text-yellow-800">
              {score.score} poeng
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

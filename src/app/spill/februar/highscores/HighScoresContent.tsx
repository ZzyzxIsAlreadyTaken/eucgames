"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import type { Difficulty } from "../_components/ToLike";
import { getHighScores } from "../_components/getHighScores";
import { addMockData } from "../_components/mockData";
import { useSearchParams } from "next/navigation";

interface Score {
  id: number;
  username: string;
  tries: number;
  time: number;
  createdAt: Date;
  gameMode: string;
}

interface HighScoresContentProps {
  isAdmin: boolean;
}

export default function HighScoresContent({ isAdmin }: HighScoresContentProps) {
  const searchParams = useSearchParams();
  const initialDifficulty =
    (searchParams.get("difficulty") as Difficulty) ?? "normal";
  const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty);
  const [highscores, setHighscores] = useState<Score[]>([]);

  useEffect(() => {
    const fetchScores = async () => {
      const scores = await getHighScores(difficulty);
      setHighscores(scores);
    };
    void fetchScores();
  }, [difficulty]);

  const handleAddMockData = async () => {
    const result = await addMockData();
    if (result.success) {
      const scores = await getHighScores(difficulty);
      setHighscores(scores);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-2 px-4 py-16">
        {isAdmin && (
          <button
            onClick={handleAddMockData}
            className="mb-4 rounded bg-purple-500 px-4 py-2 text-white hover:bg-purple-600"
          >
            Add Mock Data
          </button>
        )}

        <div className="mt-8 rounded-lg bg-white/10 p-4">
          <h2 className="mb-4 text-xl font-bold">EUC Memory High Scores</h2>

          <select
            className="mb-4 rounded bg-white/20 p-2 text-white"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
          >
            <option value="easy">Easy</option>
            <option value="normal">Normal</option>
            <option value="hard">Hard</option>
            <option value="insane">Insane</option>
          </select>

          <div className="space-y-2">
            {highscores.map((score, index) => {
              const date = new Date(score.createdAt).toLocaleDateString(
                "no-NO",
                {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                },
              );

              return (
                <div
                  key={score.id}
                  className="flex items-center justify-between rounded bg-white/5 p-2"
                >
                  <div className="flex gap-4">
                    <span className="w-6 text-gray-400">{index + 1}.</span>
                    <div>
                      <span>{score.username}</span>
                      <div className="text-xs text-gray-400">
                        {date} • {score.gameMode}
                      </div>
                    </div>
                  </div>
                  <div className="ml-5 flex gap-4 font-mono">
                    <span>Forsøk: {score.tries}</span>
                    <span>Tid: {score.time}s</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Link
          href={`/spill/februar?difficulty=${difficulty}`}
          className="text-lg text-white hover:underline"
        >
          ← Tilbake til spillet
        </Link>
      </div>
    </main>
  );
}

"use client";

import { useState, useEffect } from "react";
import { getHighScores } from "./getHighScores";

export default function HighScores() {
  const [scores, setScores] = useState<
    Awaited<ReturnType<typeof getHighScores>>
  >([]);

  useEffect(() => {
    const fetchScores = async () => {
      const data = await getHighScores();
      setScores(data);
    };
    void fetchScores();
  }, []);

  return (
    <div className="mt-8 rounded-lg bg-white/10 p-4">
      <h2 className="mb-4 text-xl font-bold">High Scores</h2>
      <div className="space-y-2">
        {scores.map((score, index) => {
          const date = new Date(score.createdAt).toLocaleDateString("no-NO", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });

          return (
            <div
              key={index}
              className="flex items-center justify-between rounded bg-white/5 p-2"
            >
              <div className="flex gap-4">
                <span className="w-6 text-gray-400">{index + 1}.</span>
                <div>
                  <span>{score.username}</span>
                  <div className="text-xs text-gray-400">{date}</div>
                </div>
              </div>
              <span className="ml-5 font-mono">{score.score}</span>
            </div>
          );
        })}
        {scores.length === 0 && (
          <p className="text-center text-gray-400">Laster...</p>
        )}
      </div>
    </div>
  );
}

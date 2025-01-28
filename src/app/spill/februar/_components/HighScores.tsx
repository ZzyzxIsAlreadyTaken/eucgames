import React from "react";
import type { Difficulty } from "./ToLike";

interface HighscoresProps {
  highscores: {
    name: string;
    tries: number;
    time: number;
    difficulty: Difficulty;
  }[];
}

export default function HighScores({ highscores }: HighscoresProps) {
  return (
    <div>
      {highscores.map((score) => (
        <div key={`${score.name}-${score.difficulty}`}>
          {score.name} ({score.difficulty}): {score.tries} forsøk på{" "}
          {score.time} sekunder
        </div>
      ))}
    </div>
  );
}

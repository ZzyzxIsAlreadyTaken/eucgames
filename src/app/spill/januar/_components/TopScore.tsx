import { getTopScore } from "./getTopScore";

export default async function TopScore() {
  const topScore = await getTopScore();

  if (!topScore) return null;

  return (
    <div className="text-center">
      <p className="text-sm text-gray-400">Top Score</p>
      <p className="font-bold">
        {topScore.username}: <span className="font-mono">{topScore.score}</span>
      </p>
    </div>
  );
}

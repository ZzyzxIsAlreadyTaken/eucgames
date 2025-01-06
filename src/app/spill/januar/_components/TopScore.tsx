import { getTopScore } from "./getTopScore";
import { unstable_noStore as noStore } from "next/cache";

interface TopScoreProps {
  className?: string;
}

export default async function TopScore({ className = "" }: TopScoreProps) {
  noStore();
  const topScore = await getTopScore();

  if (!topScore) return null;

  return (
    <div className={`text-center ${className}`}>
      <p className="text-sm text-gray-400">Nåværende mester</p>
      <p className="font-bold">
        {topScore.username}: <span className="font-mono">{topScore.score}</span>
      </p>
    </div>
  );
}

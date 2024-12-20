import { getHighScores } from "./getHighScores";

export default async function HighScores() {
  const scores = await getHighScores();

  return (
    <div className="mt-8 rounded-lg bg-white/10 p-4">
      <h2 className="mb-4 text-xl font-bold">High Scores</h2>
      <div className="space-y-2">
        {scores.map((score, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded bg-white/5 p-2"
          >
            <div className="flex gap-4">
              <span className="w-6 text-gray-400">{index + 1}.</span>
              <span>{score.username}</span>
            </div>
            <span className="ml-5 font-mono">{score.score}</span>
          </div>
        ))}
        {scores.length === 0 && (
          <p className="text-center text-gray-400">No scores yet</p>
        )}
      </div>
    </div>
  );
}

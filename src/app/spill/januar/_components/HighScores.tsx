import { getHighScores } from "./getHighScores";
import { unstable_noStore as noStore } from "next/cache";

export default async function HighScores() {
  noStore();
  const scores = await getHighScores();

  // Calculate how many additional entries are needed
  const additionalEntries = 10 - scores.length;
  const defaultEntries = Array.from(
    { length: additionalEntries },
    (_, index) => ({
      id: `default-${index}`, // Ensure unique keys for default entries
      username: "Steinar Sønsteby",
      score: 1,
      createdAt: new Date(1962, 2, 16).toISOString(), // Use current date for default entries
    }),
  );

  // Combine the original scores with the default entries
  const allScores = [...scores, ...defaultEntries];

  return (
    <div className="mt-8 rounded-lg bg-white/10 p-4">
      <h2 className="mb-4 text-xl font-bold">Snake High Scores</h2>
      <div className="space-y-2">
        {allScores.map((score, index) => {
          const date = new Date(score.createdAt).toLocaleDateString("no-NO", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });

          return (
            <div
              key={score.id} // Use unique 'id' for both real and default entries
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
      </div>
    </div>
  );
}

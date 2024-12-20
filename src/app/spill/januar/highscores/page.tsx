import Link from "next/link";
import HighScores from "../_components/HighScores";

export default function HighScoresPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-3xl font-bold">Snake Game High Scores</h1>
        <HighScores />
        <Link
          href="/spill/januar"
          className="text-lg text-white hover:underline"
        >
          ← Tilbake til spillet
        </Link>
      </div>
    </main>
  );
}
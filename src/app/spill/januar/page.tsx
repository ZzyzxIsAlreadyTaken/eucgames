import Link from "next/link";
import SnakeGame from "./_components/snakeGame";
import TopScore from "./_components/TopScore";

export default function JanuaryGames() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Januar
        </h1>
        <TopScore />
        <SnakeGame />
        <div className="flex gap-4">
          <Link href="/" className="text-lg text-white hover:underline">
            ← Tilbake til forsiden
          </Link>
          <Link
            href="/spill/januar/highscores"
            className="text-lg text-white hover:underline"
          >
            Se topp 10 →
          </Link>
        </div>
      </div>
    </main>
  );
}

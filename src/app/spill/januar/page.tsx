import Link from "next/link";
import SnakeGame from "./_components/snakeGame";

export default function JanuaryGames() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Januar
        </h1>
        <SnakeGame />
        <Link
          href="/games/february"
          className="text-lg text-blue-500 hover:underline"
        >
          Gå til Februar →
        </Link>
      </div>
    </main>
  );
}

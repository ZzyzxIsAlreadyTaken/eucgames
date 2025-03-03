import Link from "next/link";
import SnakeGame from "./_components/snakeGame";
import TopScore from "./_components/TopScore";
import SnakeSocial from "./_components/_social/snakeSocial";
import { SignedIn } from "@clerk/nextjs";

export default function JanuaryGames() {
  const now = new Date();
  const isJanuary = now.getMonth() === 0; // 0 is January in JavaScript

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="mt-10 text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Januar
        </h1>
        <h2 className="text-2xl font-semibold">
          EUC <span className="text-[#CC65FF]">Snake</span>
        </h2>
        <div className="flex flex-row items-center gap-20">
          <TopScore className="rounded-lg border-2 border-purple-500 p-4" />
          <Link
            href="/spill/januar/highscores"
            className="rounded-lg border-2 border-purple-500 p-4 text-xl text-white hover:underline"
          >
            Se topp 10
          </Link>
        </div>

        {isJanuary ? (
          <SnakeGame />
        ) : (
          <div className="rounded-lg border-2 border-purple-500 p-8 text-center">
            <h3 className="text-xl font-semibold">Spillet er låst</h3>
            <p className="mt-2 text-gray-300">
              Dette spillet er kun tilgjengelig i januar
            </p>
          </div>
        )}

        <div className="flex flex-col items-center gap-4">
          <Link href="/" className="text-lg text-white hover:underline">
            ← Tilbake til forsiden
          </Link>
        </div>
      </div>
      <SignedIn>
        <SnakeSocial />
      </SignedIn>
    </main>
  );
}

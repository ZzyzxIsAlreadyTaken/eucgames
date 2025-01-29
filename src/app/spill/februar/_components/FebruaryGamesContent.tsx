"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ToLike from "./ToLike";
import type { Difficulty } from "./ToLike";

interface FebruaryGamesContentProps {
  isFebruary2025: boolean;
  isAdmin: boolean;
}

export default function FebruaryGamesContent({
  isFebruary2025,
  isAdmin,
}: FebruaryGamesContentProps) {
  const searchParams = useSearchParams();
  const initialDifficulty =
    (searchParams.get("difficulty") as Difficulty) ?? "normal";
  const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty);

  // Update difficulty when URL changes
  useEffect(() => {
    const difficultyFromUrl = searchParams.get("difficulty") as Difficulty;
    if (difficultyFromUrl) {
      setDifficulty(difficultyFromUrl);
    }
  }, [searchParams]);

  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    // Update URL without navigation
    const url = new URL(window.location.href);
    url.searchParams.set("difficulty", newDifficulty);
    window.history.pushState({}, "", url);
  };

  const gameName = () => {
    if (!isFebruary2025) {
      return "?";
    } else {
      return "Memory";
    }
  };

  return (
    <div className="container flex flex-col items-center justify-center gap-8 py-16">
      <h1 className="mt-10 text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
        Februar
      </h1>
      <h2 className="text-2xl font-semibold">
        EUC <span className="text-[#CC65FF]">{gameName()}</span>
      </h2>
      {isAdmin ? (
        <>
          <Link
            href={`/spill/februar/highscores?difficulty=${difficulty}`}
            className="rounded-lg bg-white/10 px-6 py-3 text-xl text-white transition hover:bg-white/20"
          >
            Topp 10
          </Link>
          <ToLike
            difficulty={difficulty}
            onDifficultyChange={handleDifficultyChange}
          />
        </>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <p className="text-lg text-white">
            Spillet er kun tilgjengelig for brukere i februar 2025
          </p>
        </div>
      )}
      <div className="flex flex-col items-center gap-4">
        <Link href="/" className="text-lg text-white hover:underline">
          ← Tilbake til forsiden
        </Link>
      </div>
    </div>
  );
}

import { Suspense } from "react";
import { CreateGame } from "./_components/CreateGame";
import { GameList } from "./_components/GameList";
import Link from "next/link";
import { type Metadata } from "next";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isAdmin, isBetaTester } from "../../../lib/getEarlyAccess";
import { HowToPlayModal } from "./_components/HowToPlayModal";

export const metadata: Metadata = {
  title: "EUC Games - Saks, Papir, Stein",
};

export default async function RPSPage() {
  const { userId } = await auth();

  // Check if current month is March
  const currentMonth = new Date().getMonth(); // 0-indexed, so March is 2
  const isMarchMonth = currentMonth === 2;

  // Only check early access if it's not March
  if (!isMarchMonth) {
    // Move the early access check inside the component function
    const hasEarlyAccess = (await isAdmin()) || (await isBetaTester());
    if (!hasEarlyAccess) redirect("/spill/");
  }

  return (
    <>
      <SignedIn>
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
          <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
            <h1 className="mt-10 text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
              Mars
            </h1>
            <h2 className="text-2xl font-semibold">
              EUC{" "}
              <span className="inline-flex items-center text-[#CC65FF]">
                Saks, Papir, Stein <HowToPlayModal />
              </span>
            </h2>

            <div className="mx-auto max-w-2xl space-y-8">
              <div className="flex w-full items-center justify-between">
                <CreateGame />
                <Link
                  href="/spill/mars/stats"
                  className="rounded-lg bg-white/10 px-4 py-2 text-lg font-medium text-white hover:bg-white/20"
                >
                  Leaderboard
                </Link>
                {/* Stats Button */}
                <Link
                  href={`/spill/mars/stats/player/${userId}`}
                  className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
                >
                  Min statistikk
                </Link>
              </div>

              <div className="rounded-lg bg-white/5 p-6">
                <h2 className="mb-4 text-2xl font-semibold">
                  Tilgjengelige spill
                </h2>
                <Suspense
                  fallback={<div className="text-center">Laster spill...</div>}
                >
                  <GameList />
                </Suspense>
              </div>
            </div>
          </div>
        </main>
      </SignedIn>
      <SignedOut>
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
          Logg inn da kis
        </main>
      </SignedOut>
    </>
  );
}

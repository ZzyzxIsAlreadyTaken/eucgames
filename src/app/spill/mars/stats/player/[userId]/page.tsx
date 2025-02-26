import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "~/lib/clerkClient";
import { redirect } from "next/navigation";
import { PlayerStatsContent } from "./_components/PlayerStatsContent";
import Link from "next/link";

export default async function PlayerStatsPage({
  params,
}: {
  params: { userId: string };
}) {
  const { userId: currentUserId } = await auth();
  if (!currentUserId) redirect("/sign-in");

  // Get the player's details
  try {
    const player = await clerkClient.users.getUser(params.userId);
    const playerName = player.firstName ?? player.username ?? "Unknown Player";

    return (
      <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="mt-10 text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Stats
          </h1>
          <h2 className="text-2xl font-semibold">
            <span className="text-[#CC65FF]">{playerName}</span> 1v1 Statistikk
          </h2>

          <div className="container mx-auto max-w-7xl space-y-8 px-4">
            {" "}
            <PlayerStatsContent userId={params.userId} />
          </div>
          <Link href="/spill/mars/" className="text-white">
            ← Tilbake til spilloversikt
          </Link>
        </div>
      </main>
    );
  } catch (error) {
    console.error("Error fetching player:", error);
    redirect("/spill/mars/stats");
  }
}

import FebruaryGamesContent from "./_components/FebruaryGamesContent";
import FebruarySocial from "./_components/_social/FebruarySocial";
import { isAdmin, isBetaTester } from "./_components/getEarlyAccess";
import { type Metadata } from "next";
import { SignedIn } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "EUC Games - Februar",
};

export default async function FebruaryGames() {
  const currentDate = new Date();
  const isFebruary2025 =
    currentDate.getMonth() === 1 && currentDate.getFullYear() === 2025;

  const hasEarlyAccess = (await isAdmin()) || (await isBetaTester());

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <FebruaryGamesContent
        isFebruary2025={isFebruary2025}
        earlyAccess={hasEarlyAccess}
      />
      <SignedIn>
        <FebruarySocial />
      </SignedIn>
    </main>
  );
}

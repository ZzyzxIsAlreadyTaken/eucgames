import FebruaryGamesContent from "./_components/FebruaryGamesContent";
import { checkRole } from "~/utils/roles";

export default async function FebruaryGames() {
  const currentDate = new Date();
  const isFebruary2025 =
    currentDate.getMonth() === 1 && currentDate.getFullYear() === 2025;

  const isAdmin = await checkRole("admin");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <FebruaryGamesContent isFebruary2025={isFebruary2025} isAdmin={isAdmin} />
    </main>
  );
}

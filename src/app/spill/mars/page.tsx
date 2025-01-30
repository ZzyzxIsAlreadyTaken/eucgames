import { type Metadata } from "next";
import GameWrapper from "./_components/gameWrapper";

export const metadata: Metadata = {
  title: "EUC Games - Mars",
};

export default async function MarchGames() {
  const currentDate = new Date();
  const isMarch2025 =
    currentDate.getMonth() === 2 && currentDate.getFullYear() === 2025;

  const gameName = () => {
    if (!isMarch2025) {
      return "?";
    } else {
      return "Ikke besluttet enda";
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-8 py-16">
        <h1 className="mt-10 text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Mars
        </h1>
        <h2 className="text-2xl font-semibold">
          EUC <span className="text-[#CC65FF]">{gameName()}</span>
        </h2>
        {isMarch2025 ? <GameWrapper /> : <GameWrapper />}
      </div>
    </main>
  );
}

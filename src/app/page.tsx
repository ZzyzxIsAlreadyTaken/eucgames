import Link from "next/link";
import { FaLock } from "react-icons/fa";

export default function HomePage() {
  const months = [
    { name: "Januar", href: "/spill/januar", locked: false },
    { name: "Februar", href: "/spill/februar", locked: true },
    { name: "Mars", href: "/spill/mars", locked: true },
    { name: "April", href: "/spill/april", locked: true },
    { name: "Mai", href: "/spill/mai", locked: true },
    { name: "Juni", href: "/spill/juni", locked: true },
    { name: "Juli", href: "/spill/juli", locked: true },
    { name: "August", href: "/spill/august", locked: true },
    { name: "September", href: "/spill/september", locked: true },
    { name: "Oktober", href: "/spill/oktober", locked: true },
    { name: "November", href: "/spill/november", locked: true },
    { name: "Desember", href: "/spill/desember", locked: true },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          EUC <span className="text-[hsl(280,100%,70%)]">Games</span>
        </h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 md:gap-8">
          {months.map((month) => (
            <Link
              key={month.name}
              href={month.locked ? "#" : month.href}
              className={`flex h-40 w-40 flex-col gap-4 rounded-xl p-4 ${
                month.locked
                  ? "cursor-not-allowed bg-gray-500/50 text-gray-400"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <h3 className="text-center text-2xl font-semibold">
                {month.name}
              </h3>
              <div className="text-m flex items-center justify-center">
                {month.locked ? <FaLock size={24} /> : "EUC Snake mini-game."}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

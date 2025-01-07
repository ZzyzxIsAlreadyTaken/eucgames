import Link from "next/link";
import { FaLock } from "react-icons/fa";
import { MonthStatusWrapper } from "~/components/MonthStatusWrapper";

export default function HomePage() {
  const currentMonth = new Date().getMonth();
  const months = [
    { name: "Januar", href: "/spill/januar", locked: false, topScore: 100 },
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
        <h1 className="mt-10 text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          EUC <span className="text-[hsl(280,100%,70%)]">Games</span>
        </h1>
        <h2 className="text-2xl font-semibold text-white">2025</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 md:gap-8">
          {months.map((month, index) => (
            <Link
              key={month.name}
              href={month.locked ? "#" : month.href}
              className={`flex h-48 w-48 flex-col justify-between rounded-xl p-4 ${
                month.locked
                  ? "cursor-not-allowed bg-gray-500/50 text-gray-400"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <h3 className="text-center text-2xl font-semibold">
                {month.name}
              </h3>
              <div className="text-m flex items-center justify-center">
                {month.locked ? <FaLock size={24} /> : "EUC Snake"}
              </div>
              <MonthStatusWrapper isCurrentMonth={index === currentMonth} />
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

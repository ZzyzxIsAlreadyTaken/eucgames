import Link from "next/link";
import Username from "./_components/Username";
import ToLike from "./_components/ToLike";

export default function FebruaryGames() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="mt-10 text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Februar
        </h1>
        <h2 className="text-2xl font-semibold">
          EUC <span className="text-[#CC65FF]">xxx</span>
        </h2>
        <p>
          Nu va du smart, nu va du veldig smart,
          <Username />, ikke noe spill her enda...
        </p>
        <ToLike />
        <div className="flex flex-col items-center gap-4">
          <Link href="/" className="text-lg text-white hover:underline">
            ← Tilbake til forsiden
          </Link>
        </div>
      </div>
    </main>
  );
}

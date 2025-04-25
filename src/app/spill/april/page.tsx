import { isAdmin, isBetaTester } from "../../../lib/getEarlyAccess";
import { type Metadata } from "next";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { PaaskeQuiz } from "./_components/PaaskeQuiz";

export const metadata: Metadata = {
  title: "EUC Games - April",
};

export default async function AprilGames() {
  const currentDate = new Date();
  const isApril2025 =
    currentDate.getMonth() === 3 && currentDate.getFullYear() === 2025;

  const hasEarlyAccess = (await isAdmin()) || (await isBetaTester());

  const AprilGamesContent = ({
    isApril2025,
    earlyAccess,
  }: {
    isApril2025: boolean;
    earlyAccess: boolean;
  }) => {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <h1 className="mb-6 text-center text-3xl font-bold text-yellow-800">
          April Games
        </h1>

        {isApril2025 && (
          <div className="mb-8">
            <h2 className="mb-4 text-center text-2xl font-bold text-yellow-700">
              EUC Påske Quiz
            </h2>
            <PaaskeQuiz testMode={true} />
          </div>
        )}

        {!isApril2025 && (
          <div className="rounded-lg border-2 border-yellow-300 bg-yellow-100/50 p-6 text-center">
            <p className="text-xl text-yellow-800">
              April Games vil være tilgjengelig i april 2025!
            </p>
          </div>
        )}

        {!isApril2025 && !earlyAccess && (
          <div className="rounded-lg border-2 border-yellow-300 bg-yellow-100/50 p-6 text-center">
            <p className="text-xl text-yellow-800">
              Du trenger early access for å spille April-spillet.
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-yellow-400 to-yellow-200 text-yellow-900">
      <SignedIn>
        <AprilGamesContent
          isApril2025={isApril2025}
          earlyAccess={hasEarlyAccess}
        />
      </SignedIn>
      <SignedOut>
        <div className="rounded-lg border-2 border-yellow-300 bg-yellow-100/50 p-6 text-center">
          <h2 className="mb-4 text-center text-2xl font-bold text-yellow-700">
            Du er ikke logget inn
          </h2>
          <p className="text-xl text-yellow-800">
            Du må faktisk logge inn for å spille April-spillet, no way round it!
          </p>
          <br />
          <p className="text-2xl text-yellow-800">
            <SignInButton>Logg inn</SignInButton>
          </p>
        </div>
      </SignedOut>
    </main>
  );
}

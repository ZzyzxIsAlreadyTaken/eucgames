import { ClerkProvider } from "@clerk/nextjs";
import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import AuthButtons from "../components/AuthButtons";
import FeedbackBadge from "../components/FeedbackBadge";
import Link from "next/link";
import { checkRole } from "~/utils/roles";

export const metadata: Metadata = {
  title: "EUC Games",
  description: "EUC Games 2025",
  icons: [{ rel: "icon", url: "/joystick.png" }],
};

async function TopNav() {
  const isAdmin = await checkRole("admin");
  return (
    <nav className="fixed left-0 right-0 top-0 z-50 flex border-b border-gray-200 bg-[#CC65FF] p-4">
      <div className="flex-none">
        <Link
          href="/"
          className="flex flex-row items-center justify-center gap-2 text-xl font-bold text-white hover:text-gray-100"
        >
          <img src="/EUC.png" alt="EUC Games" className="h-10 w-10" /> EUC Games
        </Link>
      </div>
      <div className="ml-auto flex items-center gap-3">
        {isAdmin && (
          <button className="rounded px-4 py-2 text-black hover:text-[#FFF]">
            <Link href="/admin">Admin</Link>
          </button>
        )}
        <AuthButtons />
      </div>
    </nav>
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${GeistSans.variable}`}>
        <body>
          <TopNav />
          {children}
          <FeedbackBadge />
        </body>
      </html>
    </ClerkProvider>
  );
}

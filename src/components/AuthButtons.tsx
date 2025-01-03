"use client";

import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  SignOutButton,
} from "@clerk/nextjs";

export default function AuthButtons() {
  return (
    <div className="flex space-x-4">
      <SignedIn>
        <UserButton />
        <SignOutButton>
          <button className="rounded bg-[#2e026d] px-4 py-2 text-white hover:bg-[#15162c]">
            Logg ut
          </button>
        </SignOutButton>
      </SignedIn>
      <SignedOut>
        <SignInButton>
          <button className="rounded bg-[#2e026d] px-4 py-2 text-white hover:bg-[#15162c]">
            Logg inn
          </button>
        </SignInButton>
      </SignedOut>
    </div>
  );
}

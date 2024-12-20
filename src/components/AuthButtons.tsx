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
        <SignOutButton />
      </SignedIn>
      <SignedOut>
        <SignInButton />
      </SignedOut>
    </div>
  );
}

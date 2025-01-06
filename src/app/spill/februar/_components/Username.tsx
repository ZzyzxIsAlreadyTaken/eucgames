"use client";

import { useUser } from "@clerk/nextjs";

export default function Username() {
  const { user } = useUser();
  if (!user) return null;
  return <span> {user?.firstName}</span>;
}

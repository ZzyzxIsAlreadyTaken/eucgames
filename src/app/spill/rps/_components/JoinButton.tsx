"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { joinGame } from "../_actions/joinGame";
import { Button } from "./Button";

interface JoinButtonProps {
  gameId: string;
}

export function JoinButton({ gameId }: JoinButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleJoin = () => {
    startTransition(async () => {
      const result = await joinGame(gameId);
      if (result.success) {
        router.push(`/spill/rps/${gameId}`);
      }
    });
  };

  return (
    <Button onClick={handleJoin} disabled={isPending} variant="secondary">
      {isPending ? "Joining..." : "Join Game"}
    </Button>
  );
}

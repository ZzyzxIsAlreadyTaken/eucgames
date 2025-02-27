"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { joinGame } from "../_actions/joinGame";
import { Button } from "./Button";

interface JoinButtonProps {
  gameId: string;
  className?: string;
}

export function JoinButton({ gameId, className }: JoinButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleJoin = () => {
    setErrorMessage(null);
    startTransition(async () => {
      try {
        const result = await joinGame(gameId);
        if (result.success) {
          // Force a refresh of the page data before navigating
          router.refresh();
          // Add a small delay to ensure the server has time to update
          setTimeout(() => {
            router.push(`/spill/mars/${gameId}`);
          }, 500);
        } else if (result.error) {
          // Handle error case
          console.error("Failed to join game:", result.error);
          setErrorMessage(result.error);
        }
      } catch (error) {
        console.error("Error joining game:", error);
        setErrorMessage("Det oppstod en feil. Vennligst prøv igjen.");
      }
    });
  };

  return (
    <div className="flex flex-col items-center">
      <Button
        onClick={handleJoin}
        disabled={isPending}
        variant="secondary"
        className={className}
      >
        {isPending ? "Venter..." : "Bli med i spill"}
      </Button>

      {errorMessage && <p className="mt-4 text-red-400">{errorMessage}</p>}
    </div>
  );
}

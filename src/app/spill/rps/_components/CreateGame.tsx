"use client";

import { createGame } from "../_actions/createGame";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./Button";

export function CreateGame() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateGame = async () => {
    setIsCreating(true);
    setError(null);
    try {
      const result = await createGame();
      if (result.success) {
        router.push(`/spill/rps/${result.gameId}`);
      } else {
        setError(result.error ?? "Failed to create game");
      }
    } catch (error) {
      console.error("Failed to create game:", error);
      setError("Failed to create game");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="text-center">
      <Button
        onClick={handleCreateGame}
        disabled={isCreating}
        size="lg"
        className="w-full max-w-sm"
      >
        {isCreating ? "Creating game..." : "Create New Game"}
      </Button>
      {error && <p className="mt-2 text-red-500">{error}</p>}
    </div>
  );
}

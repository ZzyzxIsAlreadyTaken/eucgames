"use client";

import { useState } from "react";
import { createGame } from "../_actions/createGame";
import { useRouter } from "next/navigation";
import { Button } from "./Button";

export function CreateGame() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCreateGame = async () => {
    setIsCreating(true);
    setError(null);

    try {
      const result = await createGame();

      if (result.success && result.gameId) {
        router.push(`/spill/mars/${result.gameId}`);
      } else {
        setError(result.error ?? "Kunne ikke opprette spill");
      }
    } catch (e) {
      setError("En feil oppstod. Prøv igjen senere.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col">
      <Button
        onClick={handleCreateGame}
        disabled={isCreating}
        className="flex items-center gap-2"
      >
        {isCreating ? "Oppretter..." : "Opprett nytt spill"}
      </Button>

      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}

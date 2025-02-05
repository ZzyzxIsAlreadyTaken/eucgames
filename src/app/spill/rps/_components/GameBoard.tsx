"use client";

import { useState } from "react";
import { Button } from "./Button";
import { makeMove } from "../_actions/makeMove";
import { useRouter } from "next/navigation";

type Move = "ROCK" | "PAPER" | "SCISSORS";

interface Game {
  id: number;
  gameId: string;
  creatorId: string;
  joinerId: string | null;
  status: string;
  winnerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface GameBoardProps {
  game: Game;
  userId: string;
}

export function GameBoard({ game, userId }: GameBoardProps) {
  const [selectedMove, setSelectedMove] = useState<Move | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const isCreator = game.creatorId === userId;
  const opponent = isCreator ? "Opponent" : "Creator";

  const handleMove = async (move: Move) => {
    setIsSubmitting(true);
    try {
      const result = await makeMove(game.gameId, move);
      if (result.success) {
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to make move:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (game.status === "COMPLETED") {
    const hasWon = game.winnerId === userId;
    return (
      <div className="text-center">
        <h2 className="mb-4 text-2xl font-bold">
          {game.winnerId
            ? hasWon
              ? "You Won! 🎉"
              : "You Lost 😢"
            : "It's a Draw! 🤝"}
        </h2>
        <Button onClick={() => router.push("/spill/rps")}>Back to Games</Button>
      </div>
    );
  }

  if (game.status === "WAITING") {
    return (
      <div className="text-center">
        <h2 className="mb-4 text-2xl font-bold">Waiting for Opponent</h2>
        <p className="mb-4 text-gray-400">Share this game with a friend!</p>
        <div className="mb-4 rounded-lg bg-white/5 p-4">
          <code>{window.location.href}</code>
        </div>
        <Button onClick={() => router.push("/spill/rps")}>Back to Games</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold">Make Your Move</h2>
        <p className="text-gray-400">Playing against {opponent}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {(["ROCK", "PAPER", "SCISSORS"] as const).map((move) => (
          <Button
            key={move}
            onClick={() => handleMove(move)}
            disabled={isSubmitting}
            variant={selectedMove === move ? "default" : "secondary"}
            className="aspect-square text-2xl"
          >
            {move === "ROCK" ? "🪨" : move === "PAPER" ? "📄" : "✂️"}
          </Button>
        ))}
      </div>
    </div>
  );
}

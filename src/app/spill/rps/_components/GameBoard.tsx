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
  moves?: {
    playerId: string;
    move: Move;
  }[];
}

interface GameBoardProps {
  game: Game;
  userId: string;
  creatorName: string;
  joinerName: string | null;
}

const MOVE_EMOJIS: Record<Move, string> = {
  ROCK: "🪨",
  PAPER: "📄",
  SCISSORS: "✂️",
};

export function GameBoard({
  game,
  userId,
  creatorName,
  joinerName,
}: GameBoardProps) {
  const [selectedMove, setSelectedMove] = useState<Move | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const isCreator = game.creatorId === userId;
  const playerName = isCreator ? creatorName : joinerName;
  const opponentName = isCreator ? joinerName : creatorName;

  const handleMove = async (move: Move) => {
    setIsSubmitting(true);
    try {
      const result = await makeMove(game.gameId, move);
      if (result.success) {
        setSelectedMove(move);
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to make move:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (game.status === "COMPLETED" && game.moves) {
    const hasWon = game.winnerId === userId;
    const playerMove = game.moves.find((m) => m.playerId === userId)?.move;
    const opponentMove = game.moves.find((m) => m.playerId !== userId)?.move;

    return (
      <div className="text-center">
        <h2 className="mb-6 text-2xl font-bold">
          {game.winnerId
            ? hasWon
              ? "You Won! 🎉"
              : "You Lost 😢"
            : "It's a Draw! 🤝"}
        </h2>

        <div className="mb-8 grid grid-cols-2 gap-8">
          <div className="space-y-2">
            <p className="font-medium text-purple-200">You ({playerName})</p>
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-lg bg-white/10 text-4xl">
              {playerMove && MOVE_EMOJIS[playerMove]}
            </div>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-purple-200">
              {opponentName ?? "Opponent"}
            </p>
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-lg bg-white/10 text-4xl">
              {opponentMove && MOVE_EMOJIS[opponentMove]}
            </div>
          </div>
        </div>

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
        <p className="text-gray-400">
          Playing against {opponentName ?? "Opponent"}
        </p>
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
            {MOVE_EMOJIS[move]}
          </Button>
        ))}
      </div>
    </div>
  );
}

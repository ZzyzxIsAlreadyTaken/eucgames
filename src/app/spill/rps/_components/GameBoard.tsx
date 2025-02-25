"use client";

import { useState, useEffect } from "react";
import { Button } from "./Button";
import { makeMove } from "../_actions/makeMove";
import { useRouter } from "next/navigation";
import { markResultSeen } from "../_actions/markResultSeen";

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
  moves?: {
    playerId: string;
    move: Move;
  }[];
  resultSeen?: boolean;
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
  moves,
  resultSeen = false,
}: GameBoardProps) {
  const [selectedMove, setSelectedMove] = useState<Move | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gameUrl, setGameUrl] = useState("");
  const [localUserMove, setLocalUserMove] = useState<Move | null>(null);
  const [revealingOpponentMove, setRevealingOpponentMove] = useState(false);
  const [displayedOpponentMove, setDisplayedOpponentMove] =
    useState<Move | null>(null);
  const [showResult, setShowResult] = useState(resultSeen);
  const [animationPlayed, setAnimationPlayed] = useState(resultSeen);
  const router = useRouter();

  useEffect(() => {
    setGameUrl(window.location.href);
  }, []);

  // Store animation state in localStorage to persist across page refreshes
  useEffect(() => {
    if (game.status === "COMPLETED" && game.gameId) {
      const animationKey = `rps-animation-${game.gameId}`;

      // Check if animation was already played when component mounts
      if (localStorage.getItem(animationKey) === "played") {
        // If already played, skip animation and show result immediately
        setAnimationPlayed(true);
        setShowResult(true);

        // Also set the opponent's move directly
        if (game.moves) {
          const opponentMove = game.moves.find(
            (m) => m.playerId !== userId,
          )?.move;
          setDisplayedOpponentMove(opponentMove ?? null);
        }
      } else if (animationPlayed) {
        // If animation just finished playing in this session, save that to localStorage
        localStorage.setItem(animationKey, "played");
      }
    }
  }, [game.status, game.gameId, game.moves, userId, animationPlayed]);

  // Animation effect - only runs if animationPlayed is false
  useEffect(() => {
    // Only start animation if game is completed, has moves, and animation hasn't played yet
    if (game.status === "COMPLETED" && game.moves && !animationPlayed) {
      // Reset states
      setShowResult(false);
      setRevealingOpponentMove(true);

      const opponentMove = game.moves.find((m) => m.playerId !== userId)?.move;
      const possibleMoves: Move[] = ["ROCK", "PAPER", "SCISSORS"];
      let currentIndex = 0;
      let iterations = 0;

      const interval = setInterval(() => {
        // Cycle through moves
        setDisplayedOpponentMove(possibleMoves[currentIndex]!);
        currentIndex = (currentIndex + 1) % possibleMoves.length;
        iterations++;

        // After cycling through options a few times, show the actual move
        if (iterations > 12) {
          clearInterval(interval);
          setDisplayedOpponentMove(opponentMove ?? null);
          setRevealingOpponentMove(false);

          // Show the result after the reveal is complete
          setShowResult(true);
          // Mark animation as played so it doesn't run again
          setAnimationPlayed(true);

          // Mark the result as seen in the database
          void markResultSeen(game.gameId);
        }
      }, 300);

      return () => clearInterval(interval);
    }
  }, [game.status, game.moves, game.gameId, userId, animationPlayed]);

  const userMove = moves?.find((move) => move.playerId === userId)?.move;
  const displayedUserMove = userMove ?? localUserMove;
  const isCreator = game.creatorId === userId;
  const playerName = isCreator ? creatorName : joinerName;
  const opponentName = isCreator ? joinerName : creatorName;

  const handleMove = async (move: Move) => {
    setIsSubmitting(true);
    setSelectedMove(move);
    setLocalUserMove(move);

    try {
      const result = await makeMove(game.gameId, move);
      if (result.success) {
        router.refresh();
      } else {
        setSelectedMove(null);
        setLocalUserMove(null);
        console.error("Move failed:", result.error);
      }
    } catch (error) {
      setSelectedMove(null);
      setLocalUserMove(null);
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
          {showResult
            ? game.winnerId
              ? hasWon
                ? "Du vant! 🎉"
                : "Du tapte 😢"
              : "Det ble uavgjort! 🤝"
            : "Venter på resultat..."}
        </h2>

        <div className="mb-8 grid grid-cols-2 gap-8">
          <div className="space-y-2">
            <p className="font-medium text-purple-200">Du ({playerName})</p>
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-lg bg-white/10 text-4xl">
              {playerMove && MOVE_EMOJIS[playerMove]}
            </div>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-purple-200">
              {opponentName ?? "Motstander"}
            </p>
            <div
              className={`mx-auto flex h-24 w-24 items-center justify-center rounded-lg bg-white/10 text-4xl ${revealingOpponentMove ? "animate-pulse" : ""}`}
            >
              {revealingOpponentMove
                ? displayedOpponentMove && MOVE_EMOJIS[displayedOpponentMove]
                : opponentMove && MOVE_EMOJIS[opponentMove]}
            </div>
          </div>
        </div>

        <Button onClick={() => router.push("/spill/rps")}>
          Tilbake til spill
        </Button>
      </div>
    );
  }

  if (game.status === "WAITING") {
    return (
      <div className="text-center">
        <h2 className="mb-4 text-2xl font-bold">Venter på motstander</h2>
        <p className="mb-4 text-gray-400">Del dette spillet med en venn!</p>
        <div className="mb-4 rounded-lg bg-white/5 p-4">
          <code>{gameUrl}</code>
        </div>
        <Button onClick={() => router.push("/spill/rps")}>
          Tilbake til spill
        </Button>
      </div>
    );
  }

  if (game.status === "IN_PROGRESS") {
    return (
      <div className="text-center">
        <h2 className="mb-4 text-2xl font-bold">Stein, Saks, Papir</h2>

        {displayedUserMove ? (
          <div className="mb-6">
            <p className="text-xl">
              Du valgte{" "}
              <span className="font-bold">
                {displayedUserMove === "ROCK"
                  ? "STEIN"
                  : displayedUserMove === "PAPER"
                    ? "PAPIR"
                    : "SAKS"}
              </span>
            </p>
            <p className="mt-2 text-gray-400">Venter på motstanderen...</p>
          </div>
        ) : (
          <div className="mb-6">
            <p className="mb-2">Gjør ditt trekk:</p>
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => handleMove("SCISSORS")}
                disabled={isSubmitting}
                className="h-20 w-20 bg-transparent"
              >
                ✂️
              </Button>
              <Button
                onClick={() => handleMove("PAPER")}
                disabled={isSubmitting}
                className="h-20 w-20 bg-transparent"
              >
                📄
              </Button>
              <Button
                onClick={() => handleMove("ROCK")}
                disabled={isSubmitting}
                className="h-20 w-20 bg-transparent"
              >
                🪨
              </Button>
            </div>
          </div>
        )}

        <div className="mt-4">
          <p>
            {creatorName} mot {joinerName}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold">Gjør ditt trekk</h2>
        <p className="text-gray-400">
          Spiller mot {opponentName ?? "Motstander"}
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

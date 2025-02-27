"use client";

import { useState, useEffect } from "react";
import { Button } from "./Button";
import { makeMove } from "../_actions/makeMove";
import { useRouter } from "next/navigation";
import { markResultSeen } from "../_actions/markResultSeen";
import Link from "next/link";

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
  userMove?: Move;
}

// Add interfaces for each component's props
interface CompletedGameViewProps {
  game: Game;
  userId: string;
  playerName: string | null;
  opponentName: string | null;
  showResult: boolean;
  revealingOpponentMove: boolean;
  displayedOpponentMove: Move | null;
}

interface WaitingForOpponentViewProps {
  gameUrl: string;
  displayedUserMove?: Move | null;
}

interface InProgressGameViewProps {
  displayedUserMove: Move | null;
  isSubmitting: boolean;
  handleMove: (move: Move) => Promise<void>;
  creatorName: string;
  joinerName: string | null;
}

interface PlayerMoveDisplayProps {
  playerName: string;
  move: Move | undefined;
  isRevealing?: boolean;
  displayedMove?: Move | null;
}

interface MoveSelectionViewProps {
  isSubmitting: boolean;
  handleMove: (move: Move) => Promise<void>;
}

interface MoveButtonProps {
  move: Move;
  isSubmitting: boolean;
  handleMove: (move: Move) => Promise<void>;
}

interface DefaultGameViewProps {
  opponentName: string | null;
  selectedMove: Move | null;
  isSubmitting: boolean;
  handleMove: (move: Move) => Promise<void>;
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
  userMove,
}: GameBoardProps) {
  const [selectedMove, setSelectedMove] = useState<Move | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gameUrl, setGameUrl] = useState("");
  const [localUserMove, setLocalUserMove] = useState<Move | null>(
    userMove ?? null,
  );
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

  const displayedUserMove = userMove ?? localUserMove;
  const isCreator = game.creatorId === userId;

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

  // Render different game states as separate components
  if (game.status === "COMPLETED") {
    return (
      <CompletedGameView
        game={game}
        userId={userId}
        playerName={isCreator ? creatorName : joinerName}
        opponentName={isCreator ? joinerName : creatorName}
        showResult={showResult}
        revealingOpponentMove={revealingOpponentMove}
        displayedOpponentMove={displayedOpponentMove}
      />
    );
  }

  if (game.status === "WAITING") {
    return <WaitingForOpponentView gameUrl={gameUrl} />;
  }

  if (game.status === "IN_PROGRESS") {
    return (
      <InProgressGameView
        displayedUserMove={displayedUserMove}
        isSubmitting={isSubmitting}
        handleMove={handleMove}
        creatorName={creatorName}
        joinerName={joinerName}
      />
    );
  }

  return (
    <DefaultGameView
      opponentName={isCreator ? joinerName : creatorName}
      selectedMove={selectedMove}
      isSubmitting={isSubmitting}
      handleMove={handleMove}
    />
  );
}

// Sub-components for different game states
function CompletedGameView({
  game,
  userId,
  playerName,
  opponentName,
  showResult,
  revealingOpponentMove,
  displayedOpponentMove,
}: CompletedGameViewProps) {
  const hasWon = game.winnerId === userId;
  const playerMove = game.moves?.find((m) => m.playerId === userId)?.move;
  const opponentMove = game.moves?.find((m) => m.playerId !== userId)?.move;

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
        <PlayerMoveDisplay
          playerName={`Du (${playerName ?? "Ukjent"})`}
          move={playerMove}
        />
        <PlayerMoveDisplay
          playerName={opponentName ?? "Motstander"}
          move={opponentMove}
          isRevealing={revealingOpponentMove}
          displayedMove={displayedOpponentMove}
        />
      </div>

      <BackToGamesLink />
    </div>
  );
}

function WaitingForOpponentView({
  gameUrl,
  displayedUserMove,
}: WaitingForOpponentViewProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  // Add polling to check for game updates in both scenarios
  useEffect(() => {
    // Poll regardless of whether we're waiting for a move or for someone to join
    const interval = setInterval(() => {
      // Refresh the page data to check for updates
      router.refresh();
    }, 3000); // Check every 3 seconds

    return () => clearInterval(interval);
  }, [router]);

  const copyToClipboard = () => {
    void navigator.clipboard.writeText(gameUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // If displayedUserMove is provided, show waiting for opponent's move view
  if (displayedUserMove) {
    const moveText =
      displayedUserMove === "ROCK"
        ? "STEIN"
        : displayedUserMove === "PAPER"
          ? "PAPIR"
          : "SAKS";

    const moveEmoji = MOVE_EMOJIS[displayedUserMove];

    return (
      <div className="mb-6">
        <p className="text-xl">
          Du valgte{" "}
          <span className="font-bold">
            {moveText} {moveEmoji}
          </span>
        </p>
        <p className="mt-2 text-gray-400">Venter på motstanderen...</p>
      </div>
    );
  }

  // Otherwise show waiting for opponent to join view
  return (
    <div className="text-center">
      <h2 className="mb-4 text-2xl font-bold">Venter på motstander</h2>
      <p className="mb-4 text-gray-400">Del dette spillet med en venn!</p>
      <div className="mb-4 flex items-center justify-between rounded-lg bg-white/5 p-4">
        <code className="overflow-x-auto">{gameUrl}</code>
        <button
          onClick={copyToClipboard}
          className="ml-2 rounded p-1 transition-colors hover:bg-white/10"
          aria-label="Kopier lenke"
        >
          {copied ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>
      </div>
      {copied ? (
        <span className="text-gray-400">Kopiert til utklippstavle</span>
      ) : (
        <span className="invisible text-gray-400">
          Kopiert til utklippstavle
        </span>
      )}
    </div>
  );
}

function InProgressGameView({
  displayedUserMove,
  isSubmitting,
  handleMove,
  creatorName,
  joinerName,
}: InProgressGameViewProps) {
  return (
    <div className="text-center">
      <h2 className="mb-4 text-2xl font-bold">Saks, Papir, Stein</h2>

      {displayedUserMove ? (
        <WaitingForOpponentView
          gameUrl=""
          displayedUserMove={displayedUserMove}
        />
      ) : (
        <MoveSelectionView
          isSubmitting={isSubmitting}
          handleMove={handleMove}
        />
      )}

      <div className="mt-4">
        <p>
          {creatorName} mot {joinerName ?? "Ukjent"}
        </p>
      </div>
      <BackToGamesLink />
    </div>
  );
}

// Reusable UI components
function PlayerMoveDisplay({
  playerName,
  move,
  isRevealing = false,
  displayedMove = null,
}: PlayerMoveDisplayProps) {
  return (
    <div className="space-y-2">
      <p className="font-medium text-purple-200">{playerName}</p>
      <div
        className={`mx-auto flex h-24 w-24 items-center justify-center rounded-lg bg-white/10 text-4xl ${
          isRevealing ? "animate-pulse" : ""
        }`}
      >
        {isRevealing
          ? displayedMove && MOVE_EMOJIS[displayedMove]
          : move && MOVE_EMOJIS[move]}
      </div>
    </div>
  );
}

function MoveSelectionView({
  isSubmitting,
  handleMove,
}: MoveSelectionViewProps) {
  return (
    <div className="mb-6">
      <p className="mb-2">Gjør ditt trekk:</p>
      <div className="flex justify-center gap-4">
        <MoveButton
          move="SCISSORS"
          isSubmitting={isSubmitting}
          handleMove={handleMove}
        />
        <MoveButton
          move="PAPER"
          isSubmitting={isSubmitting}
          handleMove={handleMove}
        />
        <MoveButton
          move="ROCK"
          isSubmitting={isSubmitting}
          handleMove={handleMove}
        />
      </div>
    </div>
  );
}

function MoveButton({ move, isSubmitting, handleMove }: MoveButtonProps) {
  return (
    <Button
      onClick={() => handleMove(move)}
      disabled={isSubmitting}
      className="h-40 w-40 bg-transparent text-4xl"
    >
      {MOVE_EMOJIS[move]}
    </Button>
  );
}

function BackToGamesLink() {
  return (
    <Link href="/spill/mars" className="text-center text-lg text-white">
      <span className="mt-8 block py-8">← Tilbake til spilloversikten</span>
    </Link>
  );
}

function DefaultGameView({
  opponentName,
  selectedMove,
  isSubmitting,
  handleMove,
}: DefaultGameViewProps) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold">Gjør ditt trekk</h2>
        <p className="text-gray-400">Spiller mot {opponentName ?? "Ukjent"}</p>
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

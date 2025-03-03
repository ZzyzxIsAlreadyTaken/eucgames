"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Username from "./Username";
import { motion, AnimatePresence } from "framer-motion";
import { saveScore } from "./saveScore";
export type GameMode =
  | "letters"
  | "AzureNetworking"
  | "Intune"
  | "M365"
  | "EUCFjes";
export type Difficulty = "easy" | "normal" | "hard" | "insane";
type ImageResponse = {
  images: string[];
  count: number;
};

interface GameSettings {
  pairs: number;
  gridColumns: number;
  aspectRatio: string;
  maxTime: number; // Time in seconds
}

const DIFFICULTY_SETTINGS: Record<Difficulty, GameSettings> = {
  easy: {
    pairs: 6,
    gridColumns: 4,
    aspectRatio: "4/3",
    maxTime: 30, // 0.5 minutes
  },
  normal: {
    pairs: 10,
    gridColumns: 5,
    aspectRatio: "4/5",
    maxTime: 60, // 1 minute
  },
  hard: {
    pairs: 12,
    gridColumns: 6,
    aspectRatio: "6/6",
    maxTime: 75, // 1.25 minutes
  },
  insane: {
    pairs: 18,
    gridColumns: 6,
    aspectRatio: "6/6",
    maxTime: 150, // 2.5 minutes
  },
};

const getGamePairs = (difficulty: Difficulty): number => {
  return DIFFICULTY_SETTINGS[difficulty].pairs;
};

const generateCards = async (
  mode: GameMode,
  difficulty: Difficulty,
): Promise<string[]> => {
  const GAME_PAIRS = getGamePairs(difficulty);

  if (mode === "letters") {
    const letters = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ");
    const trimmedLetters = letters
      .sort(() => Math.random() - 0.5)
      .slice(0, GAME_PAIRS);
    const cards = [...trimmedLetters, ...trimmedLetters];
    return cards.sort(() => Math.random() - 0.5);
  }

  // Fetch available images for the selected mode
  const response = await fetch(`/api/images?folder=${mode}`);
  const { images, count } = (await response.json()) as ImageResponse;

  console.log(response);

  console.log(images);

  if (!images || count === 0) {
    console.error("No images found");
    return [];
  }

  // Select either GAME_PAIRS images or all available if less than GAME_PAIRS
  const numImages = Math.min(GAME_PAIRS, count);
  const selectedImages = images
    .sort(() => Math.random() - 0.5)
    .slice(0, numImages);

  // Create paths for the selected images
  const imagePaths = selectedImages.map(
    (filename: string) => `/images/${mode}/${filename}`,
  );

  const cards = [...imagePaths, ...imagePaths];
  return cards.sort(() => Math.random() - 0.5);
};

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

// Add new type for score
type Score = {
  gameMode: GameMode;
  difficulty: Difficulty;
  attempts: number;
  time: number;
  userId: string;
};

// Update GameCompleteModal to show saving status
const GameCompleteModal = ({
  attempts,
  time,
  onRestart,
  isSaving,
  isTimeOut,
  difficulty,
  isLoggedIn,
}: {
  attempts: number;
  time: number;
  onRestart: () => void;
  isSaving: boolean;
  isTimeOut: boolean;
  difficulty: Difficulty;
  isLoggedIn: boolean;
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="rounded-lg bg-white p-8 text-center shadow-xl"
      >
        <h2 className="mb-4 text-2xl font-bold text-purple-800">
          {isTimeOut ? "Sorry brah! Tiden er ute! ⏰" : "Gratulerer! 🎉"}
        </h2>
        <p className="mb-6 text-lg text-gray-700">
          {isTimeOut
            ? `Du må kjappe deg litt... Tidbegrensingen på ${difficulty} er ${formatTime(DIFFICULTY_SETTINGS[difficulty].maxTime)}!`
            : `Du fullførte spillet med ${attempts} forsøk på ${formatTime(time)}!`}
        </p>
        {!isLoggedIn && !isTimeOut && (
          <p className="mb-4 text-sm text-orange-600">
            Logg inn for å lagre poengsummen din! 🏆
          </p>
        )}
        {isSaving ? (
          <p className="mb-4 text-gray-600">Lagrer resultat...</p>
        ) : (
          <button
            onClick={onRestart}
            className="rounded-lg bg-purple-600 px-6 py-3 text-white transition-colors hover:bg-purple-700"
          >
            Start på nytt
          </button>
        )}
      </motion.div>
    </div>
  );
};

interface ToLikeProps {
  difficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
}

interface CardProps {
  index: number;
  card: string;
  flipped: boolean;
  gameMode: GameMode;
  onClick: () => void;
  aspectRatio: string;
}

const Card: React.FC<CardProps> = ({
  index,
  card,
  flipped,
  gameMode,
  onClick,
  aspectRatio,
}) => {
  return (
    <div
      onClick={onClick}
      style={{
        aspectRatio,
        width: "100%",
        position: "relative",
        perspective: "1000px",
      }}
    >
      <motion.div
        initial={false}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{
          duration: 0.6,
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Front of card */}
        <motion.div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backfaceVisibility: "hidden",
            backgroundColor: "#CC65FF",
            backgroundImage: "url('/EUCGames.png')",
            backgroundSize: "80%",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            borderRadius: "10px",
            border: "1px solid #000",
          }}
        />

        {/* Back of card */}
        <motion.div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backfaceVisibility: "hidden",
            backgroundColor: "#fff",
            transform: "rotateY(180deg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "10px",
            border: "1px solid #000",
          }}
        >
          {gameMode === "letters" ? (
            <span style={{ fontSize: "24px", color: "#000" }}>{card}</span>
          ) : (
            <img
              src={card}
              alt="Card"
              style={{
                width: "90%",
                height: "90%",
                objectFit: "contain",
                padding: "5px",
              }}
            />
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default function ToLike({
  difficulty,
  onDifficultyChange,
}: ToLikeProps) {
  // TODO: Remove hardcoded user id
  const { user } = useUser();
  const allowedUserId = "user_2qTuThIX06GoEa47zOVx8InACD9";

  const [gameMode, setGameMode] = useState<GameMode>("letters");
  const [cards, setCards] = useState<string[]>([]);
  const [flipped, setFlipped] = useState<boolean[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [time, setTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isTimeOut, setIsTimeOut] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const username =
    user?.username ??
    (user?.firstName && user?.lastName
      ? `${user?.firstName} ${user?.lastName}`
      : user?.emailAddresses[0]?.emailAddress);

  useEffect(() => {
    const loadCards = async () => {
      setIsLoading(true);
      try {
        const initialCards = await generateCards(gameMode, difficulty);
        setCards(initialCards);
        setFlipped(new Array(initialCards.length).fill(false));
        setAttempts(0);
        setMatchedPairs(0);
        setGameComplete(false);
        setTime(0);
        setTimerActive(false);
        setIsTimeOut(false);
        if (timerInterval) {
          clearInterval(timerInterval);
        }
      } finally {
        setIsLoading(false);
      }
    };

    void loadCards();
  }, [gameMode, difficulty]);

  useEffect(() => {
    if (flippedIndices.length === 2) {
      const [firstIndex, secondIndex] = flippedIndices;

      if (firstIndex !== undefined && secondIndex !== undefined) {
        setAttempts((prevAttempts) => prevAttempts + 1);

        if (cards[firstIndex] === cards[secondIndex]) {
          setMatchedPairs((prevMatchedPairs) => {
            const newMatchedPairs = prevMatchedPairs + 1;
            if (newMatchedPairs === getGamePairs(difficulty)) {
              setTimeout(() => {
                setGameComplete(true);
              }, 300);
            }
            return newMatchedPairs;
          });
        } else {
          setTimeout(() => {
            setFlipped((prevFlipped) => {
              const newFlipped = [...prevFlipped];
              newFlipped[firstIndex] = false;
              newFlipped[secondIndex] = false;
              return newFlipped;
            });
          }, 1000);
        }
        setFlippedIndices([]);
      }
    }
  }, [flippedIndices, cards, difficulty]);

  // Modify the timer effect to set timeout state
  useEffect(() => {
    if (timerActive && !gameComplete) {
      const interval = setInterval(() => {
        setTime((prevTime) => {
          const newTime = prevTime + 1;
          // Check if max time is reached
          if (newTime >= DIFFICULTY_SETTINGS[difficulty].maxTime) {
            setGameComplete(true);
            setIsTimeOut(true);
            setTimerActive(false);
            clearInterval(interval);
            return DIFFICULTY_SETTINGS[difficulty].maxTime;
          }
          return newTime;
        });
      }, 1000);
      setTimerInterval(interval);

      return () => clearInterval(interval);
    }
  }, [timerActive, gameComplete, difficulty]);

  // Modify the score saving effect to only save when not timed out
  useEffect(() => {
    if (gameComplete && !isSaving && !isTimeOut && user?.id) {
      setIsSaving(true);
      void saveScore(
        user.id,
        username ?? "",
        attempts,
        time,
        difficulty,
        gameMode,
      ).then(() => {
        setIsSaving(false);
      });
    }
  }, [gameComplete, isTimeOut, user?.id]);

  const handleCardClick = (index: number) => {
    if (gameComplete || flipped[index] || flippedIndices.length === 2) return;

    // Start timer on first card flip
    if (!timerActive) {
      setTimerActive(true);
    }

    setFlipped((prevFlipped) => {
      const newFlipped = [...prevFlipped];
      newFlipped[index] = true;
      return newFlipped;
    });

    setFlippedIndices((prevIndices) => [...prevIndices, index]);
  };

  const handleRestart = async () => {
    const initialCards = await generateCards(gameMode, difficulty);
    setCards(initialCards);
    setFlipped(new Array(initialCards.length).fill(false));
    setFlippedIndices([]);
    setAttempts(0);
    setMatchedPairs(0);
    setGameComplete(false);
    setTime(0);
    setTimerActive(false);
    setIsTimeOut(false);
    if (timerInterval) {
      clearInterval(timerInterval);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-8 w-full max-w-4xl">
        <div className="grid grid-cols-3 gap-8">
          {/* Difficulty Selection */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <label className="text-lg font-medium text-white">
                Vanskelighetsgrad
              </label>
              <div className="group relative">
                <svg
                  className="h-5 w-5 cursor-help text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="absolute bottom-full left-1/2 mb-2 hidden w-64 -translate-x-1/2 transform rounded-lg bg-black/80 px-3 py-2 text-sm text-white group-hover:block">
                  Velg vanskelighetsgrad basert på antall par og tid.
                  <br />
                  Highscore blir regnet ut basert på antall forsøk og tid, ved
                  likt antall forsøk på tid.
                </div>
              </div>
            </div>
            <select
              value={difficulty}
              onChange={(e) => onDifficultyChange(e.target.value as Difficulty)}
              className="w-full rounded-lg border-2 border-purple-500 bg-white p-3 text-black shadow-md transition-colors hover:border-purple-600 focus:border-purple-600 focus:outline-none"
            >
              <option value="easy">
                Easy - ({DIFFICULTY_SETTINGS.easy.pairs} par, tid:{" "}
                {formatTime(DIFFICULTY_SETTINGS.easy.maxTime)})
              </option>
              <option value="normal">
                Normal - ({DIFFICULTY_SETTINGS.normal.pairs} par, tid:{" "}
                {formatTime(DIFFICULTY_SETTINGS.normal.maxTime)})
              </option>
              <option value="hard">
                Hard - ({DIFFICULTY_SETTINGS.hard.pairs} par, tid:{" "}
                {formatTime(DIFFICULTY_SETTINGS.hard.maxTime)})
              </option>
              <option value="insane">
                Insane - ({DIFFICULTY_SETTINGS.insane.pairs} par, tid:{" "}
                {formatTime(DIFFICULTY_SETTINGS.insane.maxTime)})
              </option>
            </select>
          </div>

          {/* Game Type Selection */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <label className="text-lg font-medium text-white">
                Spilltype
              </label>
              <div className="group relative">
                <svg
                  className="h-5 w-5 cursor-help text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="absolute bottom-full left-1/2 mb-2 hidden w-64 -translate-x-1/2 transform rounded-lg bg-black/80 px-3 py-2 text-sm text-white group-hover:block">
                  Velg mellom forskjellige spilltyper. Spilltypene har ingen
                  påvirkning på highscore, kunn for flavor.
                </div>
              </div>
            </div>
            <select
              value={gameMode}
              onChange={(e) => setGameMode(e.target.value as GameMode)}
              className="w-full rounded-lg border-2 border-purple-500 bg-white p-3 text-black shadow-md transition-colors hover:border-purple-600 focus:border-purple-600 focus:outline-none"
            >
              <option value="letters">Bokstaver</option>
              <option value="AzureNetworking">Azure Networking</option>
              <option value="Intune">Intune</option>
              <option value="M365">M365</option>
              <option value="EUCFjes">EUCFjes</option>
            </select>
          </div>

          {/* Game Stats */}
          <div className="flex flex-col items-center gap-2">
            <div className="text-lg font-medium text-white">Statistikk</div>
            <div className="grid grid-cols-3 gap-4 rounded-lg border-2 border-purple-500 bg-white/10 p-3">
              <div className="flex w-24 flex-col items-center">
                <span className="text-sm text-gray-300">Forsøk</span>
                <span className="font-mono text-xl font-bold tabular-nums text-white">
                  {attempts}
                </span>
              </div>
              <div className="flex w-24 flex-col items-center">
                <span className="text-sm text-gray-300">Par</span>
                <span className="font-mono text-xl font-bold tabular-nums text-white">
                  {matchedPairs}
                </span>
              </div>
              <div className="flex w-24 flex-col items-center">
                <span className="text-sm text-gray-300">Tid</span>
                <span
                  className={`font-mono text-xl font-bold tabular-nums ${
                    time >= DIFFICULTY_SETTINGS[difficulty].maxTime * 0.7
                      ? "text-red-500"
                      : "text-white"
                  }`}
                >
                  {formatTime(time)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {gameComplete && (
        <AnimatePresence>
          <GameCompleteModal
            attempts={attempts}
            time={time}
            onRestart={handleRestart}
            isSaving={isSaving}
            isTimeOut={isTimeOut}
            difficulty={difficulty}
            isLoggedIn={!!user?.id}
          />
        </AnimatePresence>
      )}

      {isLoading ? (
        <div className="flex h-96 items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${DIFFICULTY_SETTINGS[difficulty].gridColumns}, 1fr)`,
            gap: "10px",
            width: "100%",
            maxWidth: "800px",
          }}
        >
          {cards.map((card, index) => (
            <Card
              key={index}
              index={index}
              card={card}
              flipped={flipped[index] ?? false}
              gameMode={gameMode}
              onClick={() => handleCardClick(index)}
              aspectRatio={DIFFICULTY_SETTINGS[difficulty].aspectRatio}
            />
          ))}
        </div>
      )}
    </div>
  );
}

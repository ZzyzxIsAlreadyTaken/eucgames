"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Username from "./Username";
import { motion, AnimatePresence } from "framer-motion";
import { saveScore } from "./saveScore";
export type GameMode = "letters" | "AzureNetworking" | "Intune";
export type Difficulty = "easy" | "normal" | "hard" | "insane";
type ImageResponse = {
  images: string[];
  count: number;
};

interface GameSettings {
  pairs: number;
  gridColumns: number;
  aspectRatio: string;
}

const DIFFICULTY_SETTINGS: Record<Difficulty, GameSettings> = {
  easy: {
    pairs: 6,
    gridColumns: 4,
    aspectRatio: "4/3",
  },
  normal: {
    pairs: 10,
    gridColumns: 5,
    aspectRatio: "4/5",
  },
  hard: {
    pairs: 12,
    gridColumns: 6,
    aspectRatio: "6/6",
  },
  insane: {
    pairs: 18,
    gridColumns: 6,
    aspectRatio: "6/6",
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
}: {
  attempts: number;
  time: number;
  onRestart: () => void;
  isSaving: boolean;
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="rounded-lg bg-white p-8 text-center shadow-xl"
      >
        <h2 className="mb-4 text-2xl font-bold text-purple-800">
          Gratulerer! 🎉
        </h2>
        <p className="mb-6 text-lg text-gray-700">
          Du fullførte spillet med {attempts} forsøk på {formatTime(time)}!
        </p>
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

export default function ToLike() {
  // TODO: Remove hardcoded user id
  const { user } = useUser();
  const allowedUserId = "user_2qTuThIX06GoEa47zOVx8InACD9";

  // Add debug logging
  console.log("Current user ID:", user?.id);
  console.log("Allowed user ID:", allowedUserId);
  console.log("Do they match?", user?.id === allowedUserId);

  const [gameMode, setGameMode] = useState<GameMode>("letters");
  const [cards, setCards] = useState<string[]>([]);
  const [flipped, setFlipped] = useState<boolean[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [time, setTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);

  const username =
    user?.username ??
    (user?.firstName && user?.lastName
      ? `${user?.firstName} ${user?.lastName}`
      : user?.emailAddresses[0]?.emailAddress);

  useEffect(() => {
    const loadCards = async () => {
      const initialCards = await generateCards(gameMode, difficulty);
      setCards(initialCards);
      setFlipped(new Array(initialCards.length).fill(false));
      setAttempts(0);
      setMatchedPairs(0);
      setGameComplete(false);
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

  // New separate useEffect for score saving
  useEffect(() => {
    if (gameComplete && !isSaving) {
      setIsSaving(true);
      void saveScore(
        user?.id ?? "",
        username ?? "",
        attempts,
        time,
        difficulty,
        gameMode,
      ).then(() => {
        setIsSaving(false);
      });
    }
  }, [gameComplete]);

  useEffect(() => {
    if (timerActive && !gameComplete) {
      const interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
      setTimerInterval(interval);

      return () => clearInterval(interval);
    }
  }, [timerActive, gameComplete]);

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
    if (timerInterval) {
      clearInterval(timerInterval);
    }
  };

  if (user?.id !== allowedUserId) {
    return (
      <p>
        Nu va du smart, nu va du veldig smart
        <Username />, ikke noe spill her enda...
      </p>
    );
  }

  if (user?.id === allowedUserId) {
    return (
      <div className="flex flex-col items-center">
        <div className="mb-5 flex items-center justify-between gap-5">
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="appearance-none rounded-lg border-2 border-purple-500 bg-white bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:0.7em] bg-[right_0.7em_center] bg-no-repeat p-4 pr-[2.5em] text-black"
          >
            <option value="" disabled>
              Velg vanskelighetsgrad
            </option>
            <option value="easy">Easy</option>
            <option value="normal">Normal</option>
            <option value="hard">Hard</option>
            <option value="insane">Insane</option>
          </select>
          <select
            value={gameMode}
            onChange={(e) => setGameMode(e.target.value as GameMode)}
            className="appearance-none rounded-lg border-2 border-purple-500 bg-white bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:0.7em] bg-[right_0.7em_center] bg-no-repeat p-4 pr-[2.5em] text-black"
          >
            <option value="" disabled>
              Velg spilltype
            </option>
            <option value="letters">Bokstaver</option>
            <option value="AzureNetworking">Azure Networking</option>
            <option value="Intune">Intune</option>
          </select>
          <div className="text-white">
            Forsøk: {attempts} | Par funnet: {matchedPairs} | Tid:{" "}
            {formatTime(time)}
          </div>
        </div>

        {gameComplete && (
          <AnimatePresence>
            <GameCompleteModal
              attempts={attempts}
              time={time}
              onRestart={handleRestart}
              isSaving={isSaving}
            />
          </AnimatePresence>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${DIFFICULTY_SETTINGS[difficulty].gridColumns}, 1fr)`,
            gap: "10px",
            width: "100%",
            maxWidth: "800px",
            aspectRatio: DIFFICULTY_SETTINGS[difficulty].aspectRatio,
          }}
        >
          {cards.map((card, index) => (
            <div
              key={index}
              onClick={() => handleCardClick(index)}
              style={{
                aspectRatio: DIFFICULTY_SETTINGS[difficulty].aspectRatio,
                width: "100%",
                backgroundColor: flipped[index] ? "#fff" : "#ccc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                border: "1px solid #000",
                transition: "background-color 0.3s",
                position: "relative",
                color: "black",
              }}
            >
              {flipped[index] &&
                (gameMode === "letters" ? (
                  <span style={{ fontSize: "24px" }}>{card}</span>
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
                ))}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

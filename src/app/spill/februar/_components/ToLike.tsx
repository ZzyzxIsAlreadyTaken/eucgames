"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

type GameMode = "letters" | "AzureNetworking" | "Intune";

type ImageResponse = {
  images: string[];
  count: number;
};

const GAME_PAIRS = 15;

const generateCards = async (mode: GameMode): Promise<string[]> => {
  if (mode === "letters") {
    const letters = Array.from("ABCDEFGHIJKLMNO");
    const cards = [...letters, ...letters];
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

export default function ToLike() {
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

  useEffect(() => {
    const loadCards = async () => {
      const initialCards = await generateCards(gameMode);
      setCards(initialCards);
      setFlipped(new Array(initialCards.length).fill(false));
      setAttempts(0);
      setMatchedPairs(0);
      setGameComplete(false);
    };

    void loadCards();
  }, [gameMode]);

  useEffect(() => {
    if (flippedIndices.length === 2) {
      const [firstIndex, secondIndex] = flippedIndices;

      if (firstIndex !== undefined && secondIndex !== undefined) {
        // Increment attempts by 1 when two cards are flipped
        setAttempts((prevAttempts) => prevAttempts + 1);

        if (cards[firstIndex] === cards[secondIndex]) {
          // Increment matched pairs by 1 when a match is found
          setMatchedPairs((prevMatchedPairs) => {
            const newMatchedPairs = prevMatchedPairs + 1;
            if (newMatchedPairs === GAME_PAIRS) {
              setTimeout(() => setGameComplete(true), 300);
            }
            return newMatchedPairs;
          });
        } else {
          // Flip back the cards if they don't match
          setTimeout(() => {
            setFlipped((prevFlipped) => {
              const newFlipped = [...prevFlipped];
              newFlipped[firstIndex] = false;
              newFlipped[secondIndex] = false;
              return newFlipped;
            });
          }, 1000);
        }

        // Clear flipped indices after processing
        setFlippedIndices([]);
      }
    }
  }, [flippedIndices, cards]);

  const handleCardClick = (index: number) => {
    if (gameComplete || flipped[index] || flippedIndices.length === 2) return;

    setFlipped((prevFlipped) => {
      const newFlipped = [...prevFlipped];
      newFlipped[index] = true;
      return newFlipped;
    });

    setFlippedIndices((prevIndices) => [...prevIndices, index]);
  };

  const handleRestart = async () => {
    const initialCards = await generateCards(gameMode);
    setCards(initialCards);
    setFlipped(new Array(initialCards.length).fill(false));
    setFlippedIndices([]);
    setAttempts(0);
    setMatchedPairs(0);
    setGameComplete(false);
  };

  if (user?.id === allowedUserId) {
    return (
      <div>
        <div className="mb-5 flex items-center justify-between gap-5">
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
            Forsøk: {attempts} | Par funnet: {matchedPairs}
          </div>
        </div>

        {gameComplete && (
          <div className="mb-5 rounded-lg bg-purple-100 p-4 text-purple-800">
            <p>Gratulerer! Du fullførte spillet med {attempts} forsøk!</p>
            <button
              onClick={handleRestart}
              className="mt-2 rounded bg-purple-500 px-4 py-2 text-white hover:bg-purple-600"
            >
              Start på nytt
            </button>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "10px",
          }}
        >
          {cards.map((card, index) => (
            <div
              key={index}
              onClick={() => handleCardClick(index)}
              style={{
                width: "70px",
                height: "90px",
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
                      width: "100%",
                      height: "100%",
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

  return null;
}

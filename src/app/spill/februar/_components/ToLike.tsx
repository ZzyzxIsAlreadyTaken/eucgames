"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

const generateCards = () => {
  const letters = "ABCDEFGHIJKLMNO";
  const cards = [...letters, ...letters]; // Create pairs
  return cards.sort(() => Math.random() - 0.5); // Shuffle cards
};

export default function ToLike() {
  const { user } = useUser();
  const allowedUserId = "user_2qTuThIX06GoEa47zOVx8InACD9";

  const [cards, setCards] = useState<string[]>([]);
  const [flipped, setFlipped] = useState<boolean[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);

  useEffect(() => {
    const initialCards = generateCards();
    setCards(initialCards);
    setFlipped(new Array(initialCards.length).fill(false));
  }, []);

  const handleCardClick = (index: number) => {
    if (flippedIndices.length === 2) {
      const [firstIndex, secondIndex] = flippedIndices;
      if (firstIndex !== undefined && secondIndex !== undefined) {
        if (cards[firstIndex] !== cards[secondIndex]) {
          setFlipped((prevFlipped) => {
            const newFlipped = [...prevFlipped];
            flippedIndices.forEach((i) => (newFlipped[i] = false));
            return newFlipped;
          });
        }
      }
      setFlippedIndices([]);
    }

    setFlipped((prevFlipped) => {
      const newFlipped = [...prevFlipped];
      newFlipped[index] = !newFlipped[index];
      return newFlipped;
    });
    setFlippedIndices((prevIndices) => [...prevIndices, index]);
  };

  if (user?.id === allowedUserId) {
    return (
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
              width: "60px",
              height: "80px",
              backgroundColor: flipped[index] ? "#fff" : "#ccc",
              color: flipped[index] ? "#000" : "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              cursor: "pointer",
              border: "1px solid #000",
              transition: "background-color 0.3s, color 0.3s",
            }}
          >
            {flipped[index] ? card : ""}
          </div>
        ))}
      </div>
    );
  }

  return null;
}

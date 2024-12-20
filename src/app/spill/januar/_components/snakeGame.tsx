"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { saveScore } from "./saveScore";

const SnakeGame: React.FC = () => {
  const { user } = useUser();
  console.log("User object:", user);
  const [score, setScore] = useState(0);
  const [snake, setSnake] = useState([[0, 0]]);
  const [direction, setDirection] = useState<number[] | null>(null);
  const [food, setFood] = useState([5, 5]);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    if (!direction || isGameOver) return; // Don't start until direction is set
    const interval = setInterval(moveSnake, 200);
    return () => clearInterval(interval);
  }, [snake, direction, isGameOver]);

  useEffect(() => {
    if (isGameOver) {
      void handleSaveScore();
    }
  }, [isGameOver]);

  const checkCollision = (head: [number, number]): boolean => {
    if (head[0] < 0 || head[0] >= 10 || head[1] < 0 || head[1] >= 10) {
      return true;
    }
    return snake.some(([x, y]) => x === head[0] && y === head[1]);
  };

  const moveSnake = () => {
    const newSnake = [...snake];
    const head = newSnake[newSnake.length - 1] ?? [0, 0];
    const currentDirection = direction ?? [0, 1];

    const newHead: [number, number] = [
      (head[0] ?? 0) + (currentDirection[0] ?? 0),
      (head[1] ?? 0) + (currentDirection[1] ?? 0),
    ];

    if (checkCollision(newHead)) {
      setIsGameOver(true);
      void handleSaveScore();
      return;
    }

    if (newHead[0] === food[0] && newHead[1] === food[1]) {
      setScore(score + 1);
      setFood([Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)]);
    } else {
      newSnake.shift();
    }

    newSnake.push(newHead);
    setSnake(newSnake);
  };

  const resetGame = () => {
    setSnake([[0, 0]]);
    setDirection(null);
    setScore(0);
    setFood([5, 5]);
    setIsGameOver(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver) return;

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault(); // Prevent default scrolling
          setDirection([-1, 0]);
          break;
        case "ArrowDown":
          e.preventDefault(); // Prevent default scrolling
          setDirection([1, 0]);
          break;
        case "ArrowLeft":
          e.preventDefault(); // Prevent default scrolling
          setDirection([0, -1]);
          break;
        case "ArrowRight":
          e.preventDefault(); // Prevent default scrolling
          setDirection([0, 1]);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isGameOver]);

  const handleSaveScore = async () => {
    if (user && isGameOver) {
      // Use the first available identifier in this order: username, firstName + lastName, or email
      const username =
        user.username ??
        (user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.emailAddresses[0]?.emailAddress);

      if (username) {
        await saveScore(user.id, score, username);
      }
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Snake Game</h1>
      <p>Score: {score}</p>
      <div style={{ minHeight: "50px" }}>
        {isGameOver ? (
          <div>
            <p>Game Over! Final Score: {score}</p>
            <button onClick={resetGame}>Play Again</button>
          </div>
        ) : (
          <p>Press any arrow key to start the game</p>
        )}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(10, 20px)",
          justifyContent: "center",
          margin: "0 auto",
        }}
      >
        {Array.from({ length: 10 }).map((_, row) =>
          Array.from({ length: 10 }).map((_, col) => (
            <div
              key={`${row}-${col}`}
              style={{
                width: 20,
                height: 20,
                backgroundColor: snake.some(([x, y]) => x === row && y === col)
                  ? "green"
                  : food[0] === row && food[1] === col
                    ? "red"
                    : "lightgrey",
                border: "1px solid #ccc",
              }}
            />
          )),
        )}
      </div>
    </div>
  );
};

export default SnakeGame;

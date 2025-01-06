"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { saveScore } from "./saveScore";
import { getTopScore } from "./getTopScore";

const SnakeGame: React.FC = () => {
  const { user, isSignedIn } = useUser();
  console.log("User object:", user);
  const [score, setScore] = useState(0);
  const [snake, setSnake] = useState([[0, 0]]);
  const [direction, setDirection] = useState<number[] | null>(null);
  const [food, setFood] = useState([5, 5]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  const prevIsGameOver = useRef(false);

  useEffect(() => {
    const fetchTopScore = async () => {
      const topScores = await getTopScore();
      const topScore = topScores && topScores.length > 0 ? topScores[0] : null;
      setHighScore(topScore?.score ?? 0);
      console.log("High score:", topScore);
    };

    void fetchTopScore();
  }, []);

  useEffect(() => {
    if (!direction || isGameOver) return; // Don't start until direction is set
    const interval = setInterval(moveSnake, 200);
    return () => clearInterval(interval);
  }, [snake, direction, isGameOver]);

  useEffect(() => {
    if (isGameOver && !prevIsGameOver.current) {
      console.log("Game Over! Current Score:", score, "High Score:", highScore);
      if (score > highScore) {
        console.log("New high score achieved!");
        setIsNewHighScore(true);
        setHighScore(score);
      } else {
        console.log("Not a new high score:", score);
        setIsNewHighScore(false);
      }
      void handleSaveScore();
    }
    prevIsGameOver.current = isGameOver; // Update the previous state
  }, [isGameOver, score, highScore]);

  const checkGameOver = (newHead: [number, number]) => {
    const [headX, headY] = newHead;
    if (
      headX < 0 ||
      headX >= 10 ||
      headY < 0 ||
      headY >= 10 ||
      snake.some(([x, y]) => x === headX && y === headY)
    ) {
      setIsGameOver(true);
      return true;
    }
    return false;
  };

  const generateFoodPosition = () => {
    let newFood: [number, number];
    do {
      newFood = [
        Math.floor(Math.random() * 10),
        Math.floor(Math.random() * 10),
      ];
    } while (snake.some(([x, y]) => x === newFood[0] && y === newFood[1]));
    return newFood;
  };

  const moveSnake = () => {
    const newSnake = [...snake];
    const head = newSnake[newSnake.length - 1] ?? [0, 0];
    const currentDirection = direction ?? [0, 1];

    const newHead: [number, number] = [
      (head[0] ?? 0) + (currentDirection[0] ?? 0),
      (head[1] ?? 0) + (currentDirection[1] ?? 0),
    ];

    if (checkGameOver(newHead)) {
      console.log("Game Over! Current Score:", score, "High Score:", highScore);
      if (score > highScore) {
        console.log("New high score achieved!");
        setHighScore(score);
        setIsNewHighScore(true);
      }
      return;
    }

    if (newHead[0] === food[0] && newHead[1] === food[1]) {
      setScore(score + 1);
      setFood(generateFoodPosition());
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
    setIsNewHighScore(false);
    prevIsGameOver.current = false; // Reset the previous state
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver || !isSignedIn) return;

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
  }, [isGameOver, isSignedIn]);

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
    <div style={{ textAlign: "center", position: "relative" }}>
      <div style={{ minHeight: "50px" }}>
        {!isSignedIn && <p>Logg inn å spille :)</p>}
        {isGameOver && (
          <div
            style={{
              position: "absolute",
              top: "60%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              color: "white",
              padding: "20px",
              borderRadius: "8px",
              zIndex: 10,
              width: "80%",
              maxWidth: "400px",
            }}
          >
            <p>Game Over!!</p>
            {isNewHighScore && <p>Gratulerer! Du er den nye lederen!</p>}
            <br />
            <button onClick={resetGame}>Klikk her for å spille igjen</button>
          </div>
        )}
        {!isGameOver && isSignedIn && (
          <p>Trykk på en piltast for å starte spillet</p>
        )}
        <p>Poeng: {score}</p>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(10, 20px)",
          justifyContent: "center",
          margin: "0 auto",
          boxShadow: isGameOver ? "0 0 10px rgba(0, 0, 0, 0.5)" : "none",
          opacity: isGameOver ? 0.5 : 1,
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

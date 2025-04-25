"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { saveQuizScore } from "./saveScore";
import { TopScores } from "./TopScores";

// Quiz questions and answers
const quizQuestions = [
  {
    question: "Hva symboliserer påskeegget tradisjonelt?",
    alternatives: [
      "Ny begynnelse og gjenfødelse",
      "Vår og varmere vær",
      "Kyllinger og hønsefamilier",
      "Søtsaker og godteri",
    ],
    correctAnswer: 0,
  },
  {
    question: "Hvilken dag feires påske i Norge?",
    alternatives: [
      "Første søndag i april",
      "Første søndag etter første fullmåne etter vårjevndøgn",
      "Faste dato 15. april hvert år",
      "Siste søndag i mars",
    ],
    correctAnswer: 1,
  },
  {
    question:
      "Hva kalles den første dagen i påsken som markerer Jesu oppstandelse?",
    alternatives: ["1. påskedag", "Langfredag", "Palmesøndag", "Påskeaften"],
    correctAnswer: 0,
  },
  {
    question: "Hva er et tradisjonelt påskemat i Norge?",
    alternatives: [
      "Påskeegg og sjokolade",
      "Oransje appelsin",
      "Påskelam",
      "Alle de ovennevnte",
    ],
    correctAnswer: 3,
  },
  {
    question: "Hva kalles dagen før påskedagen?",
    alternatives: ["Påskeaften", "Langfredag", "Skjærtorsdag", "Palmesøndag"],
    correctAnswer: 0,
  },
  {
    question: "Hva er et påskeegg?",
    alternatives: [
      "Et egg laget av sjokolade (type Freia)",
      "Et egg laget av papp fylt med godteri",
      "Et utblåst eggeskall dekorert med pynt",
      "Alle de ovennevnte",
    ],
    correctAnswer: 3,
  },
  {
    question: "Hva er påskekrim?",
    alternatives: [
      "En tradisjonell påskemat",
      "Kriminalserier på TV i påsken",
      "Kriminalitet utført fordi folk er borte i påsken",
      "En påsketradisjon i Sverige",
    ],
    correctAnswer: 1,
  },
  {
    question: "Hvilken farge er tradisjonelt assosiert med påske?",
    alternatives: ["Blå", "Grønn", "Gul", "Alle de ovennevnte"],
    correctAnswer: 2,
  },
  {
    question: "Hva er påskebunny?",
    alternatives: [
      "En type påskeegg",
      "En kanin som deler ut påskeegg",
      "En tradisjonell påskemat",
      "Det samme som en Playboy bunny",
    ],
    correctAnswer: 1,
  },
  {
    question: "Hva menes med 'påskefjellet' i Norge?",
    alternatives: [
      "Et kjent fjell i påsken",
      "En tradisjonell påskemat",
      "Å dra til fjells i påsken",
      "En påsketradisjon i Sverige",
    ],
    correctAnswer: 2,
  },
  {
    question: "Hva er påskekylling?",
    alternatives: [
      "En type påskeegg",
      "En tradisjonell påskemat",
      "En påskedekorasjon",
      "En påsketradisjon i Danmark",
    ],
    correctAnswer: 2,
  },

  // 🔄 Nytt spørsmål 12
  {
    question: "Hva gjør mange nordmenn i påsken?",
    alternatives: [
      "Reiser til utlandet",
      "Feirer med fyrverkeri",
      "Går på ski og nyter hytteliv",
      "Deltar i karneval",
    ],
    correctAnswer: 2,
  },

  // 🔄 Nytt spørsmål 13
  {
    question: "Hva er 'skjærtorsdag' kjent for i kristen tradisjon?",
    alternatives: [
      "Jesu fødsel",
      "Jesu siste måltid med disiplene",
      "Oppstandelsen",
      "Jesu dåp",
    ],
    correctAnswer: 1,
  },

  // 🔄 Nytt spørsmål 14
  {
    question: "Hva symboliserer lammet i påsken? (tradisjonelt)",
    alternatives: [
      "Fruktbarhet",
      "Jesus som Guds lam",
      "Vårens ankomst",
      "Fred og harmoni",
    ],
    correctAnswer: 1,
  },

  {
    question: "Hva er påskekos?",
    alternatives: [
      "En type påskeegg",
      "En tradisjonell påskemat",
      "En påskedekorasjon",
      "En påsketradisjon i Norge",
    ],
    correctAnswer: 3,
  },
];

// Test mode with only 3 questions
const testQuestions = quizQuestions.slice(0, 3);

export function PaaskeQuiz({ testMode = false }: { testMode?: boolean }) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameOver, setGameOver] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Use test questions if in test mode
  const questions = testMode ? testQuestions : quizQuestions;

  // Redirect if not logged in
  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
    }
  }, [isLoaded, user, router]);

  // Timer for each question
  useEffect(() => {
    if (!gameStarted || gameOver || !isLoaded || !user) return;

    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsedTime = (Date.now() - startTime) / 1000;
      const remainingTime = Math.max(0, 10 - elapsedTime);

      setTimeLeft(remainingTime);

      if (remainingTime <= 0) {
        clearInterval(timer);
        handleTimeUp();
      }
    }, 50); // Update more frequently for smoother animation

    return () => clearInterval(timer);
  }, [currentQuestion, gameOver, isLoaded, user, gameStarted]);

  // Save score when game is over
  useEffect(() => {
    if (gameOver && user) {
      const username = user.firstName
        ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
        : (user.username ?? "Anonymous");
      void saveQuizScore(user.id, username, score).catch((error) => {
        console.error("Failed to save quiz score:", error);
      });
    }
  }, [gameOver, user, score]);

  const handleTimeUp = () => {
    setShowResult(true);
    setTimeout(() => {
      setShowResult(false);
      setSelectedAnswer(null);
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setTimeLeft(10);
      } else {
        setGameOver(true);
      }
    }, 2000);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;

    setSelectedAnswer(answerIndex);
    setShowResult(true);

    const currentQuestionData = questions[currentQuestion];
    if (
      currentQuestionData &&
      answerIndex === currentQuestionData.correctAnswer
    ) {
      setScore((prevScore) => prevScore + 1);
    }

    setTimeout(() => {
      setShowResult(false);
      setSelectedAnswer(null);
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setTimeLeft(10);
      } else {
        setGameOver(true);
      }
    }, 2000);
  };

  const startGame = () => {
    setGameStarted(true);
    setCurrentQuestion(0);
    setScore(0);
    setTimeLeft(10);
    setGameOver(false);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const restartQuiz = () => {
    setGameStarted(true);
    setCurrentQuestion(0);
    setScore(0);
    setTimeLeft(10);
    setGameOver(false);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  if (!isLoaded || !user) {
    return <div>Laster inn...</div>;
  }

  if (!gameStarted) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-lg border-2 border-yellow-300 bg-gradient-to-b from-yellow-100 to-yellow-200 p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-yellow-800">
          {testMode ? "Test Påske Quiz" : "Klar for Påske Quiz?"}
        </h2>
        <p className="mb-6 text-center text-yellow-700">
          {testMode
            ? "Test versjon med 3 spørsmål. Du har 10 sekunder på hvert spørsmål."
            : "Test dine kunnskaper om påske! Du har 10 sekunder på hvert spørsmål. Det er 15 spørsmål totalt."}
        </p>
        <button
          onClick={startGame}
          className="rounded bg-yellow-400 px-4 py-2 font-medium text-yellow-900 transition-colors hover:bg-yellow-500"
        >
          Start Quiz
        </button>
        <div className="mt-8 w-full">
          <TopScores />
        </div>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-lg border-2 border-yellow-300 bg-gradient-to-b from-yellow-100 to-yellow-200 p-6 shadow-lg">
        <h2 className="mb-4 text-2xl font-bold text-yellow-800">
          Quiz ferdig!
        </h2>
        <p className="mb-6 text-xl text-yellow-700">
          Din poengsum: {score} av {questions.length}
        </p>
        <button
          onClick={restartQuiz}
          className="rounded bg-yellow-400 px-4 py-2 font-medium text-yellow-900 transition-colors hover:bg-yellow-500"
        >
          Spill igjen
        </button>
        <div className="mt-8 w-full">
          <TopScores />
        </div>
      </div>
    );
  }

  // Ensure currentQuestion is within bounds
  const safeCurrentQuestion = Math.min(currentQuestion, questions.length - 1);
  const currentQuestionData = questions[safeCurrentQuestion];

  if (!currentQuestionData) {
    return <div>Noe gikk galt. Vennligst prøv igjen.</div>;
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-lg border-2 border-yellow-300 bg-gradient-to-b from-yellow-100 to-yellow-200 p-6 shadow-lg">
      <div className="mb-4 flex w-full items-center justify-between">
        <span className="text-sm text-yellow-800">
          Spørsmål {safeCurrentQuestion + 1}/{questions.length}
        </span>
        <span className="text-sm text-yellow-800">Poeng: {score}</span>
      </div>

      <div className="mb-4 h-2.5 w-full overflow-hidden rounded-full bg-yellow-300">
        <div
          className="h-2.5 rounded-full bg-yellow-500 transition-all duration-[50ms] ease-linear"
          style={{ width: `${(timeLeft / 10) * 100}%` }}
        ></div>
      </div>

      <div className="mb-6 text-center">
        <h3 className="mb-2 text-xl font-medium text-yellow-800">
          {currentQuestionData.question}
        </h3>
        <p className="text-sm text-yellow-700">
          Tid igjen: {Math.ceil(timeLeft)} sekunder
        </p>
      </div>

      <div className="w-full space-y-3">
        {currentQuestionData.alternatives.map((alternative, index) => (
          <button
            key={index}
            onClick={() => handleAnswerSelect(index)}
            disabled={showResult}
            className={`w-full rounded p-3 text-left transition-colors ${
              showResult
                ? index === currentQuestionData.correctAnswer
                  ? "bg-green-400 text-green-900"
                  : selectedAnswer === index
                    ? "bg-red-400 text-red-900"
                    : "bg-yellow-300 text-yellow-900"
                : "bg-yellow-300 text-yellow-900 hover:bg-yellow-400"
            }`}
          >
            {alternative}
          </button>
        ))}
      </div>
    </div>
  );
}

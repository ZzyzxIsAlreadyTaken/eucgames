"use client";

import { useState, useEffect } from "react";

interface TopScore {
  username: string;
  score: number;
}

interface MonthStatusProps {
  isCurrentMonth: boolean;
  topScore: TopScore[] | null;
  monthIndex: number;
}

export function MonthStatus({
  isCurrentMonth,
  topScore,
  monthIndex,
}: MonthStatusProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const currentMonth = new Date().getMonth();
  const showLockMessage = monthIndex === currentMonth - 1;

  useEffect(() => {
    if (!isCurrentMonth) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
      );
      const difference = endOfMonth.getTime() - now.getTime();

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft(`${days}d ${hours}h ${minutes}m`);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(timer);
  }, [isCurrentMonth]);

  return (
    <div className="mt-2 text-center">
      {monthIndex <= currentMonth && topScore?.[0] && (
        <p className="text-white-400 text-sm">
          Top Score: {topScore[0].username} - {topScore[0].score}
        </p>
      )}
      {isCurrentMonth && (
        <p className="text-sm text-red-600">Låses om: {timeLeft}</p>
      )}
      {showLockMessage && (
        <p className="text-sm text-red-600">Spillet er nå låst</p>
      )}
    </div>
  );
}

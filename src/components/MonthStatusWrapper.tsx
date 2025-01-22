import { getTopScore } from "~/app/spill/januar/_components/getTopScore";
import { MonthStatus } from "./MonthStatus";

interface MonthStatusWrapperProps {
  isCurrentMonth: boolean;
  monthIndex: number;
}

export async function MonthStatusWrapper({
  isCurrentMonth,
  monthIndex,
}: MonthStatusWrapperProps) {
  const currentMonth = new Date().getMonth();

  // Only show scores for past and current months
  const topScores =
    monthIndex <= currentMonth
      ? monthIndex === 0
        ? await getTopScore() // January (Snake)
        : null
      : null;

  const topScore = topScores?.[0]?.score ?? 0;
  const username = topScores?.[0]?.username ?? "";

  return (
    <MonthStatus
      isCurrentMonth={isCurrentMonth}
      monthIndex={monthIndex}
      topScore={topScores ? [{ username, score: topScore }] : null}
    />
  );
}

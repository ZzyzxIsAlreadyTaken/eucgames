import { getTopScore } from "~/app/spill/januar/_components/getTopScore";
import { MonthStatus } from "./MonthStatus";

interface MonthStatusWrapperProps {
  isCurrentMonth: boolean;
}

export async function MonthStatusWrapper({
  isCurrentMonth,
}: MonthStatusWrapperProps) {
  const topScores = await getTopScore();
  const topScore = topScores?.[0]?.score ?? 0;
  const username = topScores?.[0]?.username ?? "";
  return (
    <MonthStatus
      isCurrentMonth={isCurrentMonth}
      topScore={[{ username: username, score: topScore }]}
    />
  );
}

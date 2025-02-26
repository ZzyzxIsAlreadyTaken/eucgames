import { isAdmin, isBetaTester } from "../../../../lib/getEarlyAccess";
import HighScoresContent from "./HighScoresContent";

export default async function HighScoresPage() {
  const hasEarlyAccess = (await isAdmin()) || (await isBetaTester());

  return <HighScoresContent hasEarlyAccess={hasEarlyAccess} />;
}

import isAdmin from "../_components/isAdmin";
import HighScoresContent from "./HighScoresContent";

export default async function HighScoresPage() {
  const isAdminUser = await isAdmin();

  return <HighScoresContent isAdmin={isAdminUser} />;
}

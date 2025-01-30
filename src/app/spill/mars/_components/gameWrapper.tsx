"use client";

import { useUser } from "@clerk/nextjs";
import CreateGame from "./createGame";
import JoinGame from "./joinGame";
import GameResults from "./gameResults";

export default function GameWrapper() {
  const { user } = useUser();
  const playerId = user?.id;

  if (!playerId) return <div>Please sign in to play</div>;

  return (
    <>
      <CreateGame playerId={playerId} />
      <JoinGame playerId={playerId} />
      <GameResults playerId={playerId} />
    </>
  );
}

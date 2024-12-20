import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "~/server/db";
import { scores } from "~/server/db/schema";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    type RequestBody = {
      userId: string;
      score: number;
      game: string;
    };

    const { userId, score, game } = req.body as RequestBody;

    try {
      await db.insert(scores).values({ userId, score, game });
      res.status(200).json({ message: "Score saved successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error saving score", error });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}

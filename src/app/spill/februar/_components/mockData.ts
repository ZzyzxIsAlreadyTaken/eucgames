"use server";

import { db } from "~/server/db";
import { scoresMemory } from "~/server/db/schema";
import type { Difficulty } from "./ToLike";

const difficulties: Difficulty[] = ["easy", "normal", "hard", "insane"];
const usernames = [
  "Steinar Sønsteby",
  "Robert Giori",
  "Carl-Johan Hultenheim",
  "Ole Petter Saxrud",
  "Linus Wallin",
  "Kathrine Forsberg",
  "Juha Sihvonen",
  "Arunas Bartusevicius",
];

export async function addMockData() {
  try {
    // Generate 10 scores for each difficulty
    for (const difficulty of difficulties) {
      for (let i = 0; i < 10; i++) {
        const baseTime =
          difficulty === "easy"
            ? 30
            : difficulty === "normal"
              ? 60
              : difficulty === "hard"
                ? 90
                : 120;

        const baseTries =
          difficulty === "easy"
            ? 20
            : difficulty === "normal"
              ? 30
              : difficulty === "hard"
                ? 40
                : 60;

        const mockData = {
          userId: `mock-user-${i}`,
          username:
            usernames[Math.floor(Math.random() * usernames.length)] ??
            "Default User",
          tries: baseTries + Math.floor(Math.random() * 10), // Random tries based on difficulty
          time: baseTime + Math.floor(Math.random() * 30), // Random time based on difficulty
          difficulty: difficulty,
          createdAt: new Date(
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
          ), // Random date within last 30 days
          gameMode:
            ["letters", "AzureNetworking", "Intune"][
              Math.floor(Math.random() * 3)
            ] ?? "letters",
        };

        await db.insert(scoresMemory).values(mockData);
      }
    }
    return { success: true };
  } catch (error) {
    console.error("Error adding mock data:", error);
    return { success: false };
  }
}

import { db } from "~/server/db";
import { feedback } from "~/server/db/schema";

export async function getFeedback() {
  const allFeedback = await db.select().from(feedback);

  // Format the createdAt date to a consistent string format
  const formattedFeedback = allFeedback.map((item) => ({
    ...item,
    createdAt: new Date(item.createdAt).toLocaleDateString("no-NO", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    }),
    tags: item.tags ?? [],
  }));

  return formattedFeedback;
}

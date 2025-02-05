import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * A utility function to merge class names safely.
 */
export function cn(
  ...inputs: Array<string | boolean | undefined | null>
): string {
  return twMerge(clsx(...inputs)) ?? ""; // ✅ Ensures output is always a string
}

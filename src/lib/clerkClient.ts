import { createClerkClient } from "@clerk/backend";

// Initialize Clerk client
export const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

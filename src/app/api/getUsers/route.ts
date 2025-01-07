import { NextResponse } from "next/server";
import { clerkClient } from "../../../lib/clerkClient";

// Define the User type
type User = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  emailAddresses: { emailAddress: string }[];
};

export async function GET() {
  try {
    // Fetch the user list (paginated response)
    const response = await clerkClient.users.getUserList();

    // Extract the actual user data from the 'data' field
    const users: User[] = response.data;

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

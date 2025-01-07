"use client";

import { useState, useEffect } from "react";

// Define User type to match the data structure
type User = {
  id: string;
  firstName: string;
  lastName: string;
  emailAddresses: { emailAddress: string }[];
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]); // State to hold user data

  useEffect(() => {
    fetch("/api/getUsers")
      .then((res) => res.json())
      .then((data: User[]) => setUsers(data))
      .catch((error) => console.error("Failed to fetch users:", error));
  }, []);

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.firstName} {user.lastName} (
            {user.emailAddresses[0]?.emailAddress ?? "No email"})
          </li>
        ))}
      </ul>
    </div>
  );
}

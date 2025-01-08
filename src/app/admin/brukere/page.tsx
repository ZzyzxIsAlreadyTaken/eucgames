import { clerkClient } from "../../../lib/clerkClient";

// Remove "use client" since this is now a server component

async function UsersPage() {
  const response = await clerkClient.users.getUserList({
    limit: 100,
  });
  const users = response.data;

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Users</h1>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Navn
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                E-post
              </th>

              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Rolle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Sist aktiv
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                ID
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4">
                  {user.firstName} {user.lastName}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  {user.emailAddresses[0]?.emailAddress ?? "No email"}
                </td>

                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {JSON.stringify(user.publicMetadata) || "No role"}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {user.lastActiveAt
                    ? new Intl.DateTimeFormat("no-NO", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(user.lastActiveAt))
                    : "Never"}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {user.id}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UsersPage;

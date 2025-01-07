import { checkRole } from "~/utils/roles";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FaComments, FaUsers, FaChartBar, FaCog } from "react-icons/fa";

export default async function AdminDashboard() {
  const isAdmin = await checkRole("admin");
  if (!isAdmin) {
    redirect("/");
  }

  return (
    <div className="p-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/feedback"
          className="flex flex-col items-center rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg"
        >
          <FaComments className="mb-4 text-4xl text-blue-500" />
          <h2 className="text-xl font-semibold">Feedback</h2>
          <p className="mt-2 text-center text-gray-600">
            View and manage user feedback
          </p>
        </Link>

        <Link
          href="/admin/users"
          className="flex flex-col items-center rounded-lg bg-white p-6 shadow-md"
        >
          <FaUsers className="mb-4 text-4xl text-green-500" />
          <h2 className="text-xl font-semibold">Users</h2>
          <p className="mt-2 text-center text-gray-600">Manage user accounts</p>
        </Link>

        <div className="flex flex-col items-center rounded-lg bg-white p-6 shadow-md">
          <FaChartBar className="mb-4 text-4xl text-purple-500" />
          <h2 className="text-xl font-semibold">Analytics</h2>
          <p className="mt-2 text-center text-gray-600">View site analytics</p>
        </div>

        <div className="flex flex-col items-center rounded-lg bg-white p-6 shadow-md">
          <FaCog className="mb-4 text-4xl text-gray-500" />
          <h2 className="text-xl font-semibold">Settings</h2>
          <p className="mt-2 text-center text-gray-600">
            Configure system settings
          </p>
        </div>
      </div>
    </div>
  );
}

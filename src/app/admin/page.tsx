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
          <p className="mt-2 text-center text-gray-600">Se brukerfeedback</p>
        </Link>

        <Link
          href="/admin/brukere"
          className="flex flex-col items-center rounded-lg bg-white p-6 shadow-md"
        >
          <FaUsers className="mb-4 text-4xl text-green-500" />
          <h2 className="text-xl font-semibold">Brukere</h2>
          <p className="mt-2 text-center text-gray-600">
            Se og administrer brukere
          </p>
        </Link>

        <Link
          href="/admin/statistikk"
          className="flex flex-col items-center rounded-lg bg-white p-6 shadow-md"
        >
          <FaChartBar className="mb-4 text-4xl text-purple-500" />
          <h2 className="text-xl font-semibold">Statistikk</h2>
          <p className="mt-2 text-center text-gray-600">Se sidestatistikk</p>
        </Link>

        <div className="flex flex-col items-center rounded-lg bg-white p-6 shadow-md">
          <FaCog className="mb-4 text-4xl text-gray-500" />
          <h2 className="text-xl font-semibold">Innstillinger</h2>
          <p className="mt-2 text-center text-gray-600">
            Konfigurer systeminnstillinger
          </p>
        </div>
      </div>
    </div>
  );
}

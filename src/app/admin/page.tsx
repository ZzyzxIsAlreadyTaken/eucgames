import { checkRole } from "~/utils/roles";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  // Protect the page from users who are not admins
  const isAdmin = await checkRole("admin");
  if (!isAdmin) {
    redirect("/");
  }

  return (
    <p className="mt-80 text-center text-2xl font-bold">
      This is the protected admin dashboard restricted to users with the `admin`
      role.
    </p>
  );
}

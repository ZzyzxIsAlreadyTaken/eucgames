import { checkRole } from "~/utils/roles";
import { redirect } from "next/navigation";
import { AdminHeader } from "./_components/AdminHeader";
import { Breadcrumb } from "./_components/Breadcrumb";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAdmin = await checkRole("admin");

  if (!isAdmin) {
    redirect("/");
  }

  return (
    <div className="mt-20 min-h-screen bg-gray-50">
      <AdminHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumb />
        {children}
      </main>
    </div>
  );
}

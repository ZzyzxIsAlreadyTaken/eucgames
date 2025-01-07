"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminHeader() {
  const pathname = usePathname();
  const isAdminRoot = pathname === "/admin";

  return (
    <div className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            {!isAdminRoot && (
              <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                ← Back to Dashboard
              </Link>
            )}
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
}

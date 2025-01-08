"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Breadcrumb() {
  const pathname = usePathname();

  // Skip empty strings and create breadcrumb items
  const pathSegments = pathname
    .split("/")
    .filter(Boolean)
    .map((segment, index, array) => {
      // Build the href for this segment by joining all segments up to this point
      const href = "/" + array.slice(0, index + 1).join("/");

      // Convert segment to display text (capitalize, remove dashes etc)
      const label =
        segment.charAt(0).toUpperCase() +
        segment
          .slice(1) // Capitalize first letter
          .replace(/-/g, " "); // Replace dashes with spaces

      return {
        label,
        href: index === array.length - 1 ? undefined : href, // Last item has no href
      };
    });

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {pathSegments.map((item, index) => (
          <li key={index}>
            {index > 0 && <span className="mx-2 text-gray-400">/</span>}
            {item.href ? (
              <Link
                href={item.href}
                className="text-gray-500 hover:text-gray-700"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-gray-900">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

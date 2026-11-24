"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AccountNav({
  links,
}: {
  links: { href: string; label: string; match?: "exact" | "prefix" }[];
}) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 overflow-x-auto rounded-full bg-white p-1 shadow-sm ring-1 ring-black/5" aria-label="Section">
      {links.map((link) => {
        const active =
          link.match === "exact"
            ? pathname === link.href
            : pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
              active ? "bg-night text-white" : "text-muted hover:bg-sand hover:text-ink"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/Logo";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { logout } from "@/lib/actions/auth";
import { popularArticle } from "@/lib/popular-article";

type HeaderUser = { name: string; email: string; role: "user" | "admin" } | null;

function ProfileMenu({ user }: { user: NonNullable<HeaderUser> }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (!panel.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={panel}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`${user.email} profile`}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-10 max-w-[16rem] items-center justify-center gap-2 rounded-full border border-line bg-white py-1 pl-1 pr-3 shadow-sm sm:max-w-none"
      >
        <ProfileAvatar name={user.name} />
        <span className="min-w-0 truncate text-left text-xs font-medium text-ink">{user.email}</span>
      </button>
      {open ? (
        <div role="menu" className="absolute right-0 top-12 z-50 w-max min-w-72 max-w-[22rem] overflow-hidden rounded-xl border border-line bg-white shadow-[0_18px_40px_rgba(17,17,17,0.14)]">
          <div className="flex items-center gap-3 px-4 py-3">
            <ProfileAvatar name={user.name} />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-ink">{user.name}</span>
              <span className="block break-all text-xs text-muted">{user.email}</span>
            </span>
          </div>
          <Link
            href="/profile"
            role="menuitem"
            className="flex items-center gap-3 border-t border-line px-4 py-3 text-sm font-medium text-ink hover:bg-sand"
            onClick={() => setOpen(false)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="12" cy="8" r="3.2" />
              <path d="M5 19.2c1.4-3 3.8-4.4 7-4.4s5.6 1.4 7 4.4" strokeLinecap="round" />
            </svg>
            Profile
          </Link>
          <form action={logout} className="border-t border-line">
            <button type="submit" role="menuitem" className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-ink hover:bg-sand">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M10 7V5.5A1.5 1.5 0 0 1 11.5 4h7A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 10 18.5V17" strokeLinecap="round" />
                <path d="M4 12h10M11 9l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Sign out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

const links = [
  { href: "/submit", label: "Submit" },
  { href: "/write-for-us", label: "Write" },
  { href: "/advertise", label: "Advertise" },
  { href: "/categories", label: "Categories" },
  { href: popularArticle.href, label: popularArticle.navLabel },
];

export function SiteHeader({ user }: { user: HeaderUser }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-transparent bg-[#f3ebe1]/85 backdrop-blur">
      <div className="relative flex h-[72px] w-full items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6">
        <Logo />
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-5 lg:flex">
          {links.map((link) => {
            const href = link.href === "/submit" && !user ? "/signup?next=/submit" : link.href;
            const active = pathname.startsWith(link.href);
            return (
              <Link key={link.href} href={href} className={`text-sm font-medium ${active ? "text-ink" : "text-neutral-700 hover:text-ink"}`}>
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-white sm:h-10 sm:w-10 lg:hidden"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="flex w-4 flex-col gap-1">
              <span className="h-0.5 w-full bg-ink" />
              <span className="h-0.5 w-full bg-ink" />
              <span className="h-0.5 w-full bg-ink" />
            </span>
          </button>
          {user ? (
            <ProfileMenu user={user} />
          ) : (
            <>
              <Link href="/login" className="inline-flex h-8 items-center rounded-full border border-line bg-white px-2.5 text-xs font-semibold text-ink shadow-sm hover:bg-sand sm:h-10 sm:px-4 sm:text-sm">
                Login
              </Link>
              <Link href="/signup" className="inline-flex h-8 items-center rounded-full bg-pine px-2.5 text-xs font-semibold text-white hover:bg-pine-dark sm:h-10 sm:px-4 sm:text-sm">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
      {open ? (
        <div className="border-t border-line bg-[#f3ebe1] px-4 py-4 lg:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1">
            {links.map((link) => {
              const href = link.href === "/submit" && !user ? "/signup?next=/submit" : link.href;
              return (
                <Link key={link.href} href={href} className="rounded-lg px-3 py-2.5 text-sm font-medium">
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </header>
  );
}

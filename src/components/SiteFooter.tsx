import Link from "next/link";
import { Logo } from "@/components/Logo";

const directory = [
  { href: "/categories", label: "Categories" },
  { href: "/submit", label: "Submit a listing" },
  { href: "/guest-posts", label: "Guest posts" },
  { href: "/write-for-us", label: "Write for us" },
  { href: "/advertise", label: "Advertise With Us" },
];

const account = [
  { href: "/signup", label: "Create an account" },
  { href: "/login", label: "Log in" },
  { href: "/forgot-password", label: "Reset password" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line/80 bg-[#f6f6f4]">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted">
            SaaSListingHub is a free directory of AI tools, software, startups, and businesses. Every public listing is reviewed before it goes live.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold tracking-normal">Directory</h2>
          <ul className="mt-3 space-y-2">
            {directory.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-muted hover:text-ink">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold tracking-normal">Account</h2>
          <ul className="mt-3 space-y-2">
            {account.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-muted hover:text-ink">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-line/80">
        <p className="mx-auto w-full max-w-6xl px-4 py-4 text-xs text-muted sm:px-6">
          Submitting a listing is free. SaaSListingHub does not sell placement or charge a submission fee.
        </p>
      </div>
    </footer>
  );
}

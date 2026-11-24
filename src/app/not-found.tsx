import Link from "next/link";
import { buttonClass } from "@/lib/styles";

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-pine">404</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">That page is not available</h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        The listing may still be in review, or the address may be wrong. Approved listings are the only ones the public can open.
      </p>
      <Link href="/categories" className={`${buttonClass} mt-6`}>
        Browse categories
      </Link>
    </div>
  );
}

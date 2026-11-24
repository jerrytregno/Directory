import Link from "next/link";
import { listingPath } from "@/lib/utils";

export function Pagination({
  pathname,
  page,
  pages,
  params,
}: {
  pathname: string;
  page: number;
  pages: number;
  params: Record<string, string | undefined>;
}) {
  if (pages <= 1) return null;

  const windowStart = Math.max(1, Math.min(page - 2, pages - 4));
  const windowEnd = Math.min(pages, windowStart + 4);
  const numbers = Array.from({ length: windowEnd - windowStart + 1 }, (_, index) => windowStart + index);

  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
      <PageLink href={`${pathname}${listingPath(params, page - 1)}`} disabled={page <= 1}>
        Previous
      </PageLink>
      {numbers.map((number) => (
        <Link
          key={number}
          href={`${pathname}${listingPath(params, number)}`}
          aria-current={number === page ? "page" : undefined}
          className={`inline-flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-semibold ${
            number === page ? "bg-pine text-white" : "border border-line bg-white text-ink hover:border-stone-300"
          }`}
        >
          {number}
        </Link>
      ))}
      <PageLink href={`${pathname}${listingPath(params, page + 1)}`} disabled={page >= pages}>
        Next
      </PageLink>
    </nav>
  );
}

function PageLink({ href, disabled, children }: { href: string; disabled: boolean; children: React.ReactNode }) {
  if (disabled) {
    return <span className="inline-flex h-10 items-center rounded-full px-3 text-sm font-semibold text-stone-300">{children}</span>;
  }
  return (
    <Link href={href} className="inline-flex h-10 items-center rounded-full border border-line bg-white px-3 text-sm font-semibold text-ink hover:border-stone-300">
      {children}
    </Link>
  );
}

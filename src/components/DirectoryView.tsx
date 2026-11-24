import Link from "next/link";
import { ListingGrid } from "@/components/ListingCard";
import { Pagination } from "@/components/Pagination";
import { buttonClass } from "@/lib/styles";
import type { ListingCardData } from "@/lib/queries";

export function DirectoryView({
  pathname,
  title,
  description,
  listings,
  page,
  pages,
  q,
  categoryEmpty,
}: {
  pathname: string;
  title: string;
  description?: string;
  listings: ListingCardData[];
  page: number;
  pages: number;
  q: string;
  categoryEmpty: boolean;
}) {

  return (
    <div>
      <div className="max-w-2xl">
        <h1 className="text-5xl font-extrabold text-ink">{title}</h1>
        {description ? <p className="mt-3 text-base leading-7 text-muted">{description}</p> : null}
      </div>

      <form action={pathname} className="mt-8 flex items-center gap-2 rounded-lg border border-line bg-white p-1.5 shadow-[0_16px_40px_rgba(22,20,28,0.06)]">
        <label className="sr-only" htmlFor="category-search">
          Search listings
        </label>
        <input
          id="category-search"
          className="h-11 w-full bg-transparent px-3 text-sm text-ink outline-none placeholder:text-stone-400"
          name="q"
          defaultValue={q}
          placeholder="Search listings"
        />
        <button className={buttonClass} type="submit">
          Search
        </button>
      </form>

      {listings.length > 0 ? (
        <div className="mt-6">
          <ListingGrid listings={listings} />
        </div>
      ) : categoryEmpty ? (
        <div className="mt-6 rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center">
          <h2 className="text-lg font-semibold">No listings in this category yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
            Approved businesses will show up here after an admin reviews them.
          </p>
          <Link href="/submit" className={`${buttonClass} mt-5`}>
            Be the First to Submit Your Business
          </Link>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center">
          <h2 className="text-lg font-semibold">No listings match</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">Nothing in this category matched that search.</p>
          <Link href={pathname} className={`${buttonClass} mt-5`}>
            Clear search
          </Link>
        </div>
      )}

      <Pagination pathname={pathname} page={page} pages={pages} params={{ q: q || undefined }} />
    </div>
  );
}

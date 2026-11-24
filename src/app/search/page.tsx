import type { Metadata } from "next";
import Link from "next/link";
import { GuestCard } from "@/components/guest/GuestCard";
import { ListingGrid } from "@/components/ListingCard";
import { getPublishedGuestPosts } from "@/lib/guest-posts";
import { getCategories, getDirectory } from "@/lib/queries";
import { buttonClass, inputClass } from "@/lib/styles";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: true },
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const needle = query.toLowerCase();
  const [directory, articles, categories] = await Promise.all([
    getDirectory({ q: query, pageSize: 9 }),
    getPublishedGuestPosts(),
    getCategories(),
  ]);
  const articleMatches = query
    ? articles.filter((post) => [post.title, post.shortDescription, post.category, post.tags.join(" ")].join(" ").toLowerCase().includes(needle))
    : [];
  const categoryMatches = query
    ? categories.filter((category) => category.name.toLowerCase().includes(needle) || category.description.toLowerCase().includes(needle))
    : [];
  const empty = query && directory.listings.length === 0 && articleMatches.length === 0 && categoryMatches.length === 0;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-extrabold tracking-tight">Search SaaSListingHub</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">AI tools, businesses, and articles.</p>
      <form action="/search" className="mt-6 flex max-w-2xl items-center gap-2">
        <input className={inputClass} name="q" defaultValue={query} placeholder="Search AI tools, businesses, and articles" aria-label="Search SaaSListingHub" />
        <button className={buttonClass} type="submit">
          Search
        </button>
      </form>

      {!query ? <p className="mt-8 text-sm text-muted">Type a word to search across SaaSListingHub.</p> : null}
      {empty ? <p className="mt-8 text-sm text-muted">Nothing published matches “{query}”.</p> : null}

      {categoryMatches.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-2xl font-extrabold">Categories</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {categoryMatches.map((category) => (
              <Link key={category.id} href={`/category/${category.slug}`} className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold hover:border-pine">
                {category.name}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {directory.listings.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-2xl font-extrabold">Tools and businesses</h2>
          <div className="mt-4">
            <ListingGrid listings={directory.listings} />
          </div>
        </section>
      ) : null}

      {articleMatches.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-2xl font-extrabold">Articles</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {articleMatches.slice(0, 6).map((post) => (
              <GuestCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

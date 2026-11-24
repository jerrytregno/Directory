import type { Metadata } from "next";
import Link from "next/link";
import { AdSlots } from "@/components/ads/AdSlots";
import { GuestCard } from "@/components/guest/GuestCard";
import { Pagination } from "@/components/Pagination";
import { GUEST_TOPICS } from "@/lib/guest-content";
import { sponsoredGuestPostKeys } from "@/lib/ads";
import { getPublishedGuestPosts } from "@/lib/guest-posts";
import { popularArticle } from "@/lib/popular-article";
import { buttonClass, inputClass } from "@/lib/styles";
import { parsePage } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Guest Posts",
  description: "Articles from the SaaSListingHub community on AI, SaaS, SEO, startups, and business growth.",
  alternates: { canonical: "/guest-posts" },
};

export default async function GuestPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q || "").trim();
  const category = GUEST_TOPICS.includes(params.category as (typeof GUEST_TOPICS)[number]) ? params.category || "" : "";
  const [posts, sponsored] = await Promise.all([getPublishedGuestPosts(), sponsoredGuestPostKeys()]);
  const needle = q.toLowerCase();
  const filtered = posts.filter((post) => {
    if (category && post.category !== category) return false;
    if (!needle) return true;
    const haystack = [post.title, post.shortDescription, post.authorName, post.category, post.tags.join(" ")].join(" ").toLowerCase();
    return haystack.includes(needle);
  });
  const featured = !q && !category ? posts.filter((post) => post.featured).slice(0, 3) : [];
  const featuredIds = new Set(featured.map((post) => post.id));
  const list = featured.length > 0 ? filtered.filter((post) => !featuredIds.has(post.id)) : filtered;
  const pageSize = 9;
  const pages = Math.max(1, Math.ceil(list.length / pageSize));
  const page = Math.min(parsePage(params.page), pages);
  const visible = list.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-pine">From the community</p>
          <h1 className="mt-2 text-4xl font-extrabold sm:text-5xl">Guest posts</h1>
          <p className="mt-3 text-sm leading-6 text-muted">Published articles about AI, SaaS, marketing, and building a business. Every article is reviewed before it goes live.</p>
        </div>
        <Link href="/write-for-us" className={buttonClass}>
          Write for us
        </Link>
      </div>
      <AdSlots place="blog" embedded />

      <section className="mt-10 rounded-2xl border border-line bg-white p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-pine">Popular article</p>
        <h2 className="mt-2 text-2xl font-extrabold">
          <Link href={popularArticle.href} className="hover:text-pine">
            {popularArticle.title}
          </Link>
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{popularArticle.description}</p>
      </section>

      <form action="/guest-posts" className="mt-8 grid gap-3 rounded-2xl border border-line bg-white p-4 md:grid-cols-[1fr_240px_auto]">
        <input className={inputClass} name="q" defaultValue={q} placeholder="Search articles" aria-label="Search articles" />
        <select className={inputClass} name="category" defaultValue={category} aria-label="Category">
          <option value="">All topics</option>
          {GUEST_TOPICS.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
        <button className={buttonClass} type="submit">
          Search
        </button>
      </form>

      {featured.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-2xl font-extrabold">Featured articles</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-3">
            {featured.map((post) => (
              <GuestCard key={post.id} post={post} sponsored={sponsored.has(post.id) || sponsored.has(post.slug)} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="text-2xl font-extrabold">{q || category ? "Matching articles" : "Latest articles"}</h2>
        {visible.length > 0 ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((post) => (
              <GuestCard key={post.id} post={post} sponsored={sponsored.has(post.id) || sponsored.has(post.slug)} />
            ))}
          </div>
        ) : (
          <p className="mt-5 rounded-2xl border border-dashed border-line bg-white px-6 py-10 text-sm text-muted">
            {q || category ? "No published articles match this search." : "No published articles yet."}
          </p>
        )}
        <Pagination pathname="/guest-posts" page={page} pages={pages} params={{ q: q || undefined, category: category || undefined }} />
      </section>
    </div>
  );
}

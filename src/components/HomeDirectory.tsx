"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { HomeSite } from "@/lib/example-sites";

export type { HomeSite };

const TABS = ["Today", "New", "Most used"] as const;
const FILTERS = ["All", "Apps", "Image", "Writing", "Search", "Design", "Video", "Developer"] as const;

function Mark({ name, logoUrl }: { name: string; logoUrl: string | null }) {
  if (logoUrl) {
    return <img src={logoUrl} alt="" className="h-10 w-10 rounded-xl border border-line bg-white object-cover" />;
  }
  return (
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-mist text-sm font-bold text-pine">
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}

function SiteLink({ site, className, children }: { site: HomeSite; className?: string; children: ReactNode }) {
  return (
    <a href={site.url} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}

export function HomeDirectory({ sites, articles }: { sites: HomeSite[]; articles: { title: string; href: string }[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Today");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const visible = useMemo(() => {
    const matched = sites.filter((site) => filter === "All" || site.tags.some((tag) => tag.toLowerCase() === filter.toLowerCase()));
    if (tab === "Most used") return [...matched].sort((a, b) => b.views - a.views);
    if (tab === "New") return [...matched].reverse();
    return matched;
  }, [sites, tab, filter]);

  const side = visible.slice(0, 5);
  const main = visible.slice(0, 8);

  return (
    <section className="bg-[linear-gradient(180deg,#f3f6ff_0%,#fbf8ff_42%,#ffffff_100%)] px-4 pb-10 pt-10 sm:px-6 lg:px-8 lg:pt-14">
      <div className="mx-auto max-w-6xl text-center">
        <h1 className="text-[clamp(2rem,5vw,4.4rem)] font-extrabold leading-[1.05] tracking-[-0.045em] text-ink">
          Discover The Best <span className="text-pine">AI Websites</span> <span className="text-glow">& Tools</span>
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-sm font-medium text-glow sm:text-base">
          Browse AI tools, businesses, and websites. Open any card to visit the site.
        </p>
        <form action="/search" className="mx-auto mt-7 flex w-full max-w-3xl items-center gap-2 rounded-2xl border border-[#ece7ff] bg-white p-2 text-left shadow-[0_18px_50px_rgba(109,74,255,0.12)]">
          <label className="sr-only" htmlFor="home-search">
            Search SaaSListingHub
          </label>
          <input id="home-search" name="q" className="h-12 min-w-0 flex-1 bg-transparent px-4 text-base text-ink outline-none" />
          <button type="submit" className="inline-flex h-12 shrink-0 items-center gap-2 rounded-xl bg-glow px-6 text-sm font-semibold text-white">
            Search
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3-3" strokeLinecap="round" />
            </svg>
          </button>
        </form>
      </div>

      <div className="mx-auto mt-10 grid max-w-6xl gap-4 lg:grid-cols-[260px_minmax(0,1fr)_280px]">
        <div className="space-y-3">
          {side.map((site) => (
            <SiteLink key={site.id} site={site} className="block rounded-2xl border border-[#ece7ff] bg-white/90 p-4 shadow-sm transition hover:-translate-y-0.5">
              <span className="flex items-center gap-3">
                <Mark name={site.name} logoUrl={site.logoUrl} />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-ink">{site.name}</span>
                  <span className="mt-1 line-clamp-2 block text-xs leading-5 text-muted">{site.description}</span>
                </span>
              </span>
            </SiteLink>
          ))}
        </div>

        <div className="rounded-2xl border border-[#ece7ff] bg-white p-4 sm:p-5">
          <div className="flex flex-wrap gap-2">
            {TABS.map((item) => (
              <button key={item} type="button" onClick={() => setTab(item)} className={`rounded-full px-3 py-1.5 text-sm font-semibold ${tab === item ? "bg-ink text-white" : "text-muted hover:bg-sand"}`}>
                {item}
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {FILTERS.map((item) => (
              <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-full border px-3 py-1 text-xs font-semibold ${filter === item ? "border-glow bg-[#f3eeff] text-glow" : "border-line text-muted"}`}>
                {item}
              </button>
            ))}
          </div>
          <ul className="mt-4 divide-y divide-line">
            {main.map((site) => (
              <li key={site.id}>
                <SiteLink site={site} className="flex gap-3 py-4">
                  <Mark name={site.name} logoUrl={site.logoUrl} />
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-ink">{site.name}</span>
                    <span className="mt-1 line-clamp-2 block text-sm leading-6 text-muted">{site.description}</span>
                    {site.tags.length > 0 ? (
                      <span className="mt-2 flex flex-wrap gap-1.5">
                        {site.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="rounded-full bg-sand px-2 py-0.5 text-[11px] font-semibold text-muted">
                            #{tag}
                          </span>
                        ))}
                      </span>
                    ) : null}
                  </span>
                </SiteLink>
              </li>
            ))}
          </ul>
          {main.length === 0 ? <p className="py-8 text-sm text-muted">No websites match this filter.</p> : null}
        </div>

        <aside className="h-fit rounded-2xl border border-[#ece7ff] bg-white p-4">
          <h2 className="text-base font-bold">Articles</h2>
          {articles.length > 0 ? (
            <ol className="mt-3 space-y-3">
              {articles.map((article, index) => (
                <li key={article.href}>
                  <a href={article.href} className="flex gap-3 text-sm leading-6 text-ink hover:text-pine">
                    <span className="font-bold text-glow">{index + 1}</span>
                    <span>{article.title}</span>
                  </a>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-3 text-sm leading-6 text-muted">Published articles will show here.</p>
          )}
        </aside>
      </div>
    </section>
  );
}

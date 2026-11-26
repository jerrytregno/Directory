"use client";

import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import {
  alsoLaunching,
  devCategories,
  devNews,
  pastWinners,
  topWinners,
  weekLaunches,
} from "@/data/devhunt-home";
import type { RankedLaunch } from "@/lib/launch-board";
import { buttonClass } from "@/lib/styles";

function Logo({ src, name }: { src?: string; name: string }) {
  if (!src) {
    return (
      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-mist text-sm font-bold text-pine">
        {name.trim().charAt(0).toUpperCase()}
      </span>
    );
  }
  return <img src={src} alt="" className="h-11 w-11 shrink-0 rounded-xl border border-line bg-white object-cover" />;
}

let hrefTools: { domain: string }[] = [...weekLaunches, ...alsoLaunching, ...topWinners, ...pastWinners];

function siteHref(domain: string, url: string) {
  const shared = hrefTools.filter((tool) => tool.domain === domain).length > 1;
  if (!shared) return `/tool/${domain}`;
  try {
    const path = new URL(url).pathname.replace(/\/$/, "");
    return `/tool/${domain}${path}`;
  } catch {
    return `/tool/${domain}`;
  }
}

function SiteLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

function withoutPrice(text: string) {
  return text
    .replace(/\s*,?\s*from\s+\$\d[\d,]*(?:\s*\/\s*\w+)?/gi, "")
    .replace(/\$\d[\d,]*(?:\s*\/\s*\w+)?/gi, "")
    .replace(/\bup to \d+%\s*off\s*/gi, "")
    .replace(/\s*with bottom price\.?/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([.,])/g, "$1")
    .trim();
}

function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[1.6rem] border border-[#eadccb] bg-white p-4 shadow-[0_18px_40px_rgba(166,78,32,0.08)] sm:p-6 ${className}`}>{children}</div>;
}

function LaunchRow({ tool }: { tool: RankedLaunch }) {
  const featured = tool.rank <= 3;
  const slogan = withoutPrice(tool.slogan);
  return (
    <li className="py-4">
      <div className="flex items-start gap-3">
        <span className="hidden w-6 shrink-0 pt-3 text-left text-sm font-bold tabular-nums text-glow sm:block">{tool.rank}</span>
        <SiteLink href={siteHref(tool.domain, tool.url)} className="shrink-0">
          <Logo src={tool.logo} name={tool.name} />
        </SiteLink>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <SiteLink href={siteHref(tool.domain, tool.url)} className="truncate text-base font-semibold text-ink hover:text-pine">
              {tool.name}
            </SiteLink>
            <SiteLink href={siteHref(tool.domain, tool.url)} className="text-muted hover:text-pine">
              <span className="sr-only">Open {tool.domain}</span>
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M15.75 2.25H21a.75.75 0 0 1 .75.75v5.25a.75.75 0 0 1-1.5 0V4.81L8.03 17.03a.75.75 0 1 1-1.06-1.06L19.19 3.75h-3.44a.75.75 0 0 1 0-1.5Zm-10.5 4.5a1.5 1.5 0 0 0-1.5 1.5v10.5a1.5 1.5 0 0 0 1.5 1.5h10.5a1.5 1.5 0 0 0 1.5-1.5V10.5a.75.75 0 0 1 1.5 0v8.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V8.25a3 3 0 0 1 3-3h8.25a.75.75 0 0 1 0 1.5H5.25Z" />
              </svg>
            </SiteLink>
          </div>
          {featured ? (
            <>
              <p className="mt-1 text-sm leading-6 text-muted">{slogan}</p>
              <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs text-muted">
                <span>{tool.views.toLocaleString()} impressions</span>
                <span>·</span>
                <SiteLink href={siteHref(tool.domain, tool.url)} className="font-medium text-pine hover:underline">{tool.domain}</SiteLink>
                <span>·</span>
                <span>Free</span>
                {tool.tags.map((tag) => (
                  <span key={tag} className="contents">
                    <span>·</span>
                    <span>{tag}</span>
                  </span>
                ))}
                {tool.today > 0 ? <span className="font-semibold text-pine">+{tool.today} today</span> : null}
              </p>
            </>
          ) : (
            <p className="mt-1 truncate text-sm text-muted">
              <SiteLink href={siteHref(tool.domain, tool.url)} className="font-medium text-pine hover:underline">{tool.domain}</SiteLink>
              <span> · Free · {slogan}</span>
              {tool.today > 0 ? <span className="ml-2 font-semibold text-pine">+{tool.today} today</span> : null}
            </p>
          )}
        </div>
      </div>
    </li>
  );
}

const stats = [
  { label: "impressions", value: "24.8M", delta: "+4,790", note: "today" },
  { label: "domain rating", value: "70", delta: "", note: "ahrefs" },
  { label: "tools launched", value: "7,748", delta: "+61", note: "this week" },
];

export function DevHuntHome({ launches }: { launches: RankedLaunch[] }) {
  hrefTools = [...launches, ...alsoLaunching, ...topWinners, ...pastWinners];
  return (
    <section className="w-full px-3 pb-16 sm:px-6">
      <div className="w-full">
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-line bg-white px-4 py-4 shadow-[0_18px_40px_rgba(166,78,32,0.08)]">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{stat.label}</dt>
              <dd className="mt-1 text-2xl font-extrabold text-ink">{stat.value}</dd>
              <p className="mt-1 text-xs font-semibold text-pine">
                {stat.delta ? `▲ ${stat.delta} ` : null}
                <span className="font-medium text-muted">{stat.note}</span>
              </p>
            </div>
          ))}
        </dl>

        <Panel className="mt-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-glow">This week’s launches</p>
            </div>
            <Link href="/submit" className={buttonClass}>
              Launch
            </Link>
          </div>
          <ol className="mt-2 divide-y divide-line">
            {launches.map((tool) => (
              <Fragment key={tool.id}>
                <LaunchRow tool={tool} />
              </Fragment>
            ))}
          </ol>
        </Panel>

        <Panel className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-glow">Also launching</p>
          <h3 className="mt-2 text-2xl font-extrabold tracking-tight">Also launching this week</h3>
          <ul className="mt-2 divide-y divide-line">
            {alsoLaunching.map((tool, index) => (
              <Fragment key={tool.domain}>
                <li className="py-4">
                  <SiteLink href={siteHref(tool.domain, tool.url)} className="block hover:text-pine">
                    <p className="font-semibold text-ink">{tool.name}</p>
                    <p className="mt-1 truncate text-sm text-muted">
                      <span className="font-medium text-pine">{tool.domain}</span> · Free · {withoutPrice(tool.slogan)}
                    </p>
                  </SiteLink>
                </li>
              </Fragment>
            ))}
          </ul>
        </Panel>

        <Panel className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-glow">News</p>
          <h3 className="mt-2 text-2xl font-extrabold tracking-tight">Dev & AI news today</h3>
          <p className="mt-1 text-sm text-muted">Wed, Nov 25</p>
          <ul className="mt-4 space-y-3">
            {devNews.map((item) => (
              <li key={item.title} className="rounded-2xl border border-line bg-[#fffaf4] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-glow">{item.tag}</p>
                <p className="mt-1 text-sm font-medium leading-6 text-ink">{item.title}</p>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-glow">Top winners</p>
          <h3 className="mt-2 text-2xl font-extrabold tracking-tight">Views from their launch</h3>
          <ol className="mt-2 divide-y divide-line">
            {topWinners.map((tool, index) => (
              <Fragment key={tool.rank}>
                <li className="flex items-center gap-3 py-4">
                  <span className="w-8 text-sm font-bold text-glow">{tool.rank}</span>
                  <SiteLink href={siteHref(tool.domain, tool.url)} className="min-w-0 flex-1">
                    <p className="font-semibold text-ink">{tool.name}</p>
                    <p className="text-sm text-muted"><span className="font-medium text-pine">{tool.domain}</span> · {tool.views} views</p>
                  </SiteLink>
                </li>
              </Fragment>
            ))}
          </ol>
        </Panel>

        <Panel className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-glow">Past winners</p>
          <h3 className="mt-2 text-2xl font-extrabold tracking-tight">Top tool of each of the last 30 weeks</h3>
          <ul className="mt-2 divide-y divide-line">
            {pastWinners.map((tool, index) => (
              <Fragment key={tool.name}>
                <li className="flex items-start gap-3 py-4">
                  <SiteLink href={siteHref(tool.domain, tool.url)} className="min-w-0 flex-1">
                    <p className="font-semibold text-ink">{tool.name}</p>
                    <p className="mt-1 text-sm text-muted">
                      <span className="font-medium text-pine">{tool.domain}</span> · Free · {withoutPrice(tool.slogan)}
                    </p>
                    <p className="mt-1 text-xs text-muted">{tool.date}</p>
                  </SiteLink>
                </li>
              </Fragment>
            ))}
          </ul>
        </Panel>

        <div className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-glow">Categories</p>
          <h3 className="mt-2 text-2xl font-extrabold tracking-tight">Browse by category</h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {devCategories.map((category) => (
              <li key={category.name}>
                <Link href={`/search?q=${encodeURIComponent(category.name)}`} className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-sm font-semibold text-ink hover:border-pine/40 hover:text-pine">
                  {category.name}
                  <span className="text-xs font-medium text-muted">{category.count.toLocaleString()}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

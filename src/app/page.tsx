import type { ReactNode } from "react";
import type { Metadata } from "next";
import { ListingGrid } from "@/components/ListingCard";
import { getDirectory } from "@/lib/queries";

export const metadata: Metadata = {
  description: "Submit a business, read guest articles, and request advertising on SaaSListingHub.",
};

function Glyph({ d, size = 20 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Icon({ children }: { children: ReactNode }) {
  return <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#f6e4d2] text-glow">{children}</span>;
}

export default async function HomePage() {
  const directory = await getDirectory({ pageSize: 24 });

  return (
    <>
      <section className="relative w-full overflow-hidden px-5 pb-14 pt-10 sm:px-10 lg:px-14 lg:pt-20">
        <div className="pointer-events-none absolute left-1/2 top-8 h-64 w-[42rem] -translate-x-1/2 rounded-full bg-glow/15 blur-3xl" />
        <div className="relative mx-auto w-full text-center">
          <h1 className="whitespace-nowrap text-[clamp(1.05rem,3.15vw,3.35rem)] font-extrabold leading-none tracking-[-0.045em] text-ink">
            Your Next Big Discovery <span className="text-glow">Starts Here.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-ink/80">
            Works for AI tools, businesses and content. Doesn&apos;t limit SaaSListingHub to one category.
          </p>
          <form action="/search" className="mx-auto mt-8 flex w-full max-w-2xl items-center gap-2 rounded-full border border-[#eadccb] bg-white p-2 text-left shadow-[0_22px_50px_rgba(166,78,32,0.16)]">
            <label className="sr-only" htmlFor="home-search">
              Search SaaSListingHub
            </label>
            <input
              id="home-search"
              name="q"
              placeholder="Search by AI, e.g. Video Translation AI Tool"
              className="h-12 min-w-0 flex-1 bg-transparent px-4 text-base text-ink outline-none placeholder:text-stone-400"
            />
            <button type="submit" className="inline-flex h-12 shrink-0 items-center rounded-full bg-pine px-6 text-sm font-semibold text-white transition hover:bg-pine-dark">
              Search
            </button>
          </form>
          {directory.listings.length > 0 ? (
            <div className="mx-auto mt-10 w-full max-w-6xl text-left">
              <ListingGrid listings={directory.listings} />
            </div>
          ) : null}
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#f7efe6_0%,#fbf7f2_55%)] px-5 py-16 sm:px-8">
        <div className="mx-auto w-full max-w-6xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-glow">Submit your product</p>
          <h2 className="mx-auto mt-3 max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
            Submit your <span className="text-glow">business.</span>
          </h2>
          <span className="mx-auto mt-4 block h-1 w-12 rounded-full bg-glow" />
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-ink/75">
            Add your product to SaaSListingHub for free. There is no placement fee and no paid plan. An admin reviews the submission before it appears in the directory.
          </p>
          <div className="mt-10 grid gap-4 text-left sm:grid-cols-3">
            {[
              ["Send", "Name, description, website, and category. Submission is free.", "M4 7h16v10H4zM4 7l8 6 8-6"],
              ["Review", "An admin checks the listing before anyone can see it.", "M6 12l4 4 8-8"],
              ["Publish", "Approved listings go live in their category.", "M5 19V5h10l4 4v10H5z"],
            ].map(([title, body, icon]) => (
              <article key={title} className="rounded-2xl border border-[#eadccb] bg-white px-5 py-6 shadow-[0_18px_40px_rgba(166,78,32,0.1)]">
                <Icon>
                  <Glyph d={icon} />
                </Icon>
                <h3 className="mt-4 text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
                <span className="mt-5 block h-0.5 w-8 rounded-full bg-glow" />
              </article>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-xl text-sm leading-6 text-ink">Pending listings stay off the public directory until they are approved.</p>
        </div>
      </section>

      <section className="border-y border-line bg-[#fffaf4] px-5 py-16 sm:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-glow">Advertise</p>
            <h2 className="mt-3 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
              Promote your business on <span className="text-glow">SaaSListingHub.</span>
            </h2>
            <p className="mt-5 text-base leading-7 text-ink/75">
              Reach people discovering new AI tools, SaaS products and businesses. Explore promotional opportunities to showcase your brand on SaaSListingHub.
            </p>
          </div>
          <ol className="mt-10 divide-y divide-line">
            {[
              ["01", "Featured listing", "A homepage card for your brand."],
              ["02", "Category sponsorship", "A sponsored card in one category."],
              ["03", "Banner", "An image and a link on the site."],
              ["04", "Newsletter mention", "A place in a future SaaSListingHub newsletter."],
              ["05", "Sponsored article", "A guest article that still goes through review."],
              ["06", "Product spotlight", "A wider block on the homepage."],
            ].map(([index, title, body]) => (
              <li key={index} className="grid gap-2 py-4 sm:grid-cols-[64px_240px_1fr] sm:items-baseline">
                <span className="text-sm font-bold text-glow">{index}</span>
                <span className="text-lg font-bold">{title}</span>
                <span className="text-sm leading-6 text-muted">{body}</span>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm font-semibold leading-6">An admin reviews the request and turns the campaign on by hand.</p>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:py-20">
        <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-glow">Guest posts</p>
            <h2 className="mt-3 text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl">
              Share your knowledge <span className="text-glow">with SaaSListingHub.</span>
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-ink/80">
              Share your expertise, insights, and experiences with our community. Submit high-quality articles about AI, SaaS, technology, digital marketing, SEO and business growth.
            </p>
          </div>
          <aside className="flex flex-col justify-end gap-4">
            <p className="rounded-3xl bg-[#f6e4d2] px-6 py-6 text-xl font-extrabold leading-snug">Published stories from people building with AI.</p>
            <p className="px-2 text-sm leading-6 text-muted">Read what is already public. Send an original article from your account. Pending pieces stay private until an admin publishes them. Submitting an article is free.</p>
          </aside>
        </div>
      </section>

      <section className="border-t border-line bg-[#fffaf4] px-5 py-16 sm:px-8 lg:py-20">
        <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-glow">FAQ</p>
            <h2 className="mt-3 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
              Questions about <span className="text-glow">SaaSListingHub.</span>
            </h2>
            <p className="mt-5 max-w-sm text-base leading-7 text-ink/75">
              A free place to find AI tools and businesses, read articles, and request a promotion.
            </p>
          </div>
          <div className="space-y-3">
            {[
              ["What is SaaSListingHub?", "SaaSListingHub is a free directory of AI tools, software, startups, and businesses. It also has guest articles and advertising."],
              ["Is it free to use?", "Yes. Browsing is free, and submitting a business or a guest article is free. SaaSListingHub does not charge a placement fee."],
              ["What can I search for?", "Search covers AI tools, businesses, and articles. SaaSListingHub is not limited to one category."],
              ["When does a listing appear?", "After an admin approves it. Pending listings stay off the public directory."],
              ["Do I need an account?", "You can browse listings and read published articles without an account. Sign in to submit a listing or an article."],
              ["How does advertising work?", "Send a request for a featured listing, category sponsorship, banner, newsletter mention, sponsored article, or product spotlight. An admin reviews it and turns the campaign on by hand."],
              ["How do guest articles get published?", "Sign in and send an original article. It stays private until an admin publishes it."],
            ].map(([question, answer]) => (
              <details key={question} className="group rounded-2xl border border-[#eadccb] bg-[#fbf6f0] px-5 py-4 open:bg-white open:shadow-[0_14px_32px_rgba(166,78,32,0.1)]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold">
                  {question}
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f6e4d2] text-lg leading-none text-glow group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 pr-10 text-sm leading-6 text-muted">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

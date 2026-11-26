import type { Metadata } from "next";
import { DevHuntHome } from "@/components/DevHuntHome";
import { loadLaunchBoard } from "@/lib/launch-board";

export const metadata: Metadata = {
  description: "This week's developer tools and the websites developers are launching, plus a free directory of AI tools and businesses.",
};

export default async function HomePage() {
  const board = await loadLaunchBoard();
  return (
    <>
      <section className="relative w-full overflow-hidden px-5 pb-8 pt-10 sm:px-10 lg:px-14 lg:pt-16">
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
        </div>
      </section>
      <DevHuntHome launches={board.launches} />
    </>
  );
}

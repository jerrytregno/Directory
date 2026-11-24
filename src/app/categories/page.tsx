import type { Metadata } from "next";
import Link from "next/link";
import { AdSlots } from "@/components/ads/AdSlots";
import { CategoryIcon } from "@/components/CategoryIcon";
import { getCategories } from "@/lib/queries";
import { buttonClass } from "@/lib/styles";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse SaaSListingHub listings by category, from AI tools to sales, design, and analytics.",
};

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim().toLowerCase();
  const categories = (await getCategories()).filter((category) => {
    if (!query) return true;
    return category.name.toLowerCase().includes(query) || category.description.toLowerCase().includes(query);
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <AdSlots place="directory" embedded />
      <h1 className="text-5xl font-extrabold">Categories</h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
        Start with a category, then open the listings that have been approved in that area.
      </p>
      <form action="/categories" className="mt-8 flex max-w-xl items-center gap-2 rounded-lg border border-line bg-white p-1.5 shadow-[0_16px_40px_rgba(22,20,28,0.06)]">
        <label className="sr-only" htmlFor="categories-search">
          Search categories
        </label>
        <input
          id="categories-search"
          name="q"
          defaultValue={q}
          placeholder="Search categories"
          className="h-11 w-full bg-transparent px-3 text-sm text-ink outline-none placeholder:text-stone-400"
        />
        <button className={buttonClass} type="submit">
          Search
        </button>
      </form>
      {categories.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-line bg-white px-6 py-12 text-sm text-muted">No categories match that search.</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="rounded-2xl border border-line bg-white p-5 transition hover:-translate-y-0.5 hover:border-pine/40"
            >
              <CategoryIcon slug={category.slug} />
              <h2 className="mt-4 text-lg font-semibold">{category.name}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{category.description}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

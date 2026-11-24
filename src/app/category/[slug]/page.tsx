import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdSlots } from "@/components/ads/AdSlots";
import { DirectoryView } from "@/components/DirectoryView";
import { getCategoryBySlug, getDirectory } from "@/lib/queries";
import { parsePage } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category" };
  return {
    title: category.name,
    description: category.description,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const result = await getDirectory({
    q: query.q,
    categorySlug: category.slug,
    page: parsePage(query.page),
  });
  const catalog = query.q ? await getDirectory({ categorySlug: category.slug }) : result;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <AdSlots place="category" categorySlug={category.slug} embedded />
      <DirectoryView
        pathname={`/category/${category.slug}`}
        title={category.name}
        description={category.description}
        listings={result.listings}
        page={result.page}
        pages={result.pages}
        q={result.q}
        categoryEmpty={catalog.total === 0}
      />
    </div>
  );
}

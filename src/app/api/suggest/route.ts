import { NextResponse } from "next/server";
import { getPublicDb } from "@/lib/firebase-db";
import { listCategories, listListings } from "@/lib/store";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim().toLowerCase() ?? "";
  if (q.length < 2) return NextResponse.json({ results: [] });

  const db = getPublicDb();
  const [listings, categories] = await Promise.all([
    listListings(db, { status: "approved" }),
    listCategories(db),
  ]);
  const names = new Map(categories.map((category) => [category.id, category.name]));
  const results = listings
    .filter((listing) => listing.searchText.includes(q) || listing.name.toLowerCase().includes(q))
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 6)
    .map((listing) => ({
      name: listing.name,
      slug: listing.slug,
      category: names.get(listing.categoryId) ?? "Directory",
    }));

  return NextResponse.json({ results });
}

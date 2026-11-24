import type { MetadataRoute } from "next";
import { getPublishedGuestPosts } from "@/lib/guest-posts";
import { popularArticle } from "@/lib/popular-article";
import { getCategories, getSitemapListings } from "@/lib/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const [listings, categories, posts] = await Promise.all([
    getSitemapListings(),
    getCategories(),
    getPublishedGuestPosts(),
  ]);

  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/categories`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/guest-posts`, changeFrequency: "daily", priority: 0.7 },
    { url: `${base}${popularArticle.href}`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/write-for-us`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/advertise`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/advertise/request`, changeFrequency: "monthly", priority: 0.4 },
    ...categories.map((category) => ({
      url: `${base}/category/${category.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
    ...listings.map((listing) => ({
      url: `${base}/listing/${listing.slug}`,
      lastModified: listing.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
    ...posts.map((post) => ({
      url: `${base}/guest-posts/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}

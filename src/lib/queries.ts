import { cache } from "react";
import { listDayStats, loadPublishedRatingMap, ratingFor } from "@/lib/community";
import { getPublicDb } from "@/lib/firebase-db";
import { tryUserFirestore, withUserFirestore } from "@/lib/request-db";
import {
  getCategory,
  getListing,
  listCategories,
  listListings,
  listUsers,
  type CategoryRecord,
  type ListingRecord,
  type UserRecord,
} from "@/lib/store";
import { PAGE_SIZE } from "@/lib/constants";
import { websiteKey } from "@/lib/utils";

const SYSTEM_ACCOUNTS = new Set(["admin@blazly.com", "submit.preview.blazly@gmail.com"]);

function isMemberAccount(user: { email: string }) {
  return !SYSTEM_ACCOUNTS.has(user.email.toLowerCase());
}

export type ListingCardData = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  websiteUrl: string;
  logoUrl: string | null;
  pricingModel: string;
  businessType: string;
  createdAt: Date;
  viewCount: number;
  verified: boolean;
  industry: string;
  ratingAverage: number;
  ratingCount: number;
  category: { name: string; slug: string };
};

export type ManagedListing = ListingCardData & {
  fullDescription: string;
  features: string;
  contactEmail: string;
  twitterUrl: string;
  linkedinUrl: string;
  productHuntUrl: string;
  status: string;
  featured: boolean;
  rejectionNote: string;
  updatedAt: Date;
  categoryId: string;
  clickCount: number;
  uniqueVisitors: number;
  category: { id: string; name: string; slug: string };
  user: { id: string; name: string; email: string };
};

const loadCategories = cache(async () => listCategories(getPublicDb()));

function isSampleListing(listing: { ownerEmail?: string; websiteUrl?: string }) {
  const email = (listing.ownerEmail ?? "").toLowerCase();
  let host = "";
  try {
    host = new URL(listing.websiteUrl ?? "").hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    host = "";
  }
  return email.endsWith("@blazly.example") || host === "example" || host.endsWith(".example");
}

const loadApproved = cache(async () => {
  const listings = await listListings(getPublicDb(), { status: "approved" });
  return listings.filter((listing) => !isSampleListing(listing));
});

const loadRatings = cache(async () => {
  try {
    return await loadPublishedRatingMap();
  } catch {
    return new Map<string, { sum: number; count: number }>();
  }
});

const CATEGORY_TERMS: Record<string, string[]> = {
  "ai-tools": ["ai", "artificial intelligence", "llm", "chatbot", "machine learning"],
  "seo-tools": ["seo", "search engine", "backlink", "keyword research"],
  marketing: ["marketing", "campaign", "newsletter"],
  productivity: ["productivity", "writing", "planning"],
  automation: ["automation", "workflow", "integration"],
  "business-software": ["finance", "accounting", "operations", "erp"],
  "developer-tools": ["api", "developer", "sdk", "infrastructure"],
  "design-tools": ["design", "graphic", "illustration"],
  "sales-crm": ["crm", "sales", "pipeline", "outreach"],
  "social-media": ["social media", "instagram", "tiktok", "scheduling"],
  analytics: ["analytics", "reporting", "metrics", "dashboard"],
};

const GENERIC_CATEGORY_WORDS = new Set(["tools", "tool", "software", "business", "and", "the", "for", "other"]);

function categoryTerms(category: CategoryRecord) {
  const fromName = category.name
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2 && !GENERIC_CATEGORY_WORDS.has(word));
  return [...new Set([...(CATEGORY_TERMS[category.slug] ?? []), ...fromName])];
}

function textHasTerm(text: string, term: string) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|[^a-z0-9])${escaped}(?:[^a-z0-9]|$)`, "i").test(text);
}

function listingBelongsToCategory(listing: ListingRecord, category: CategoryRecord) {
  if (listing.categoryId) return listing.categoryId === category.id;
  const text = [listing.name, listing.shortDescription, listing.fullDescription, listing.features, listing.products, listing.region, listing.tags, listing.searchText].join(" ");
  return categoryTerms(category).some((term) => textHasTerm(text, term));
}

function categoryOf(listing: ListingRecord, categories: CategoryRecord[]) {
  if (!listing.categoryId) {
    return {
      id: "",
      name: "",
      slug: "",
      description: "",
      sortOrder: 0,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
    };
  }
  return (
    categories.find((category) => category.id === listing.categoryId) ?? {
      id: listing.categoryId,
      name: "Other",
      slug: "other",
      description: "",
      sortOrder: 0,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
    }
  );
}

export function industryOf(listing: ListingRecord, categories: CategoryRecord[]) {
  return listing.industry || categoryOf(listing, categories).name;
}

function toCard(
  listing: ListingRecord,
  categories: CategoryRecord[],
  ratings: Map<string, { sum: number; count: number }>,
): ListingCardData {
  const category = categoryOf(listing, categories);
  const rating = ratingFor(ratings, listing.id);
  return {
    id: listing.id,
    name: listing.name,
    slug: listing.slug,
    shortDescription: listing.shortDescription,
    websiteUrl: listing.websiteUrl,
    logoUrl: listing.logoUrl,
    pricingModel: listing.pricingModel,
    businessType: listing.businessType,
    createdAt: listing.createdAt,
    viewCount: listing.viewCount,
    verified: listing.verified,
    industry: industryOf(listing, categories),
    ratingAverage: rating.ratingAverage,
    ratingCount: rating.ratingCount,
    category: { name: category.name, slug: category.slug },
  };
}

function toManaged(
  listing: ListingRecord,
  categories: CategoryRecord[],
  ratings: Map<string, { sum: number; count: number }>,
): ManagedListing {
  const category = categoryOf(listing, categories);
  return {
    ...toCard(listing, categories, ratings),
    fullDescription: listing.fullDescription,
    features: listing.features,
    contactEmail: listing.contactEmail,
    twitterUrl: listing.twitterUrl,
    linkedinUrl: listing.linkedinUrl,
    productHuntUrl: listing.productHuntUrl,
    status: listing.status,
    featured: listing.featured,
    rejectionNote: listing.rejectionNote,
    updatedAt: listing.updatedAt,
    categoryId: listing.categoryId,
    clickCount: listing.clickCount,
    uniqueVisitors: listing.uniqueVisitors,
    category: { id: category.id, name: category.name, slug: category.slug },
    user: { id: listing.userId, name: listing.ownerName, email: listing.ownerEmail },
  };
}

export async function getCategories() {
  return loadCategories();
}

export async function getCategoriesWithCounts() {
  const [categories, listings] = await Promise.all([loadCategories(), loadApproved()]);
  return categories.map((category) => ({
    ...category,
    _count: { listings: listings.filter((listing) => listing.categoryId === category.id).length },
  }));
}

export async function getApprovedCount() {
  const listings = await loadApproved();
  return listings.length;
}

async function cardContext() {
  const [categories, ratings] = await Promise.all([loadCategories(), loadRatings()]);
  return { categories, ratings };
}

export async function getFeaturedListings() {
  const [listings, { categories, ratings }] = await Promise.all([loadApproved(), cardContext()]);
  return listings
    .filter((listing) => listing.featured)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 6)
    .map((listing) => toCard(listing, categories, ratings));
}

export async function getRecentListings() {
  const [listings, { categories, ratings }] = await Promise.all([loadApproved(), cardContext()]);
  return listings
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 8)
    .map((listing) => toCard(listing, categories, ratings));
}

export async function getPopularListings() {
  const [listings, { categories, ratings }] = await Promise.all([loadApproved(), cardContext()]);
  return listings
    .sort((a, b) => b.viewCount - a.viewCount || b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 8)
    .map((listing) => toCard(listing, categories, ratings));
}

export async function getHomeDiscovery() {
  const [listings, { categories, ratings }] = await Promise.all([loadApproved(), cardContext()]);
  const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const weekKey = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const cards = listings.map((listing) => toCard(listing, categories, ratings));
  const days = await listDayStats(listings.map((listing) => listing.id)).catch(() => []);
  const weekly = new Map<string, number>();
  for (const row of days) {
    if (row.day < weekKey) continue;
    weekly.set(row.listingId, (weekly.get(row.listingId) ?? 0) + row.views);
  }
  const trending = [...cards]
    .sort((a, b) => (weekly.get(b.id) ?? 0) - (weekly.get(a.id) ?? 0) || b.viewCount - a.viewCount)
    .slice(0, 6);
  const newest = [...cards].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const launches = newest.filter((listing) => listing.createdAt.getTime() >= monthAgo);
  const recommended = [...cards]
    .sort((a, b) => b.ratingAverage - a.ratingAverage || Number(b.verified) - Number(a.verified) || b.viewCount - a.viewCount)
    .slice(0, 6);
  const industries = new Map<string, number>();
  for (const listing of cards) industries.set(listing.industry, (industries.get(listing.industry) ?? 0) + 1);

  return {
    trending,
    launches: (launches.length > 0 ? launches : newest).slice(0, 6),
    recommended,
    industries: [...industries.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    popularCategories: [...categories]
      .map((category) => ({
        ...category,
        count: listings.filter((listing) => listing.categoryId === category.id).length,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4),
  };
}

export async function getDirectory(options: {
  q?: string;
  categorySlug?: string;
  pricing?: string;
  industry?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
}) {
  const pageSize = options.pageSize ?? PAGE_SIZE;
  const requested = Math.max(1, options.page ?? 1);
  const q = options.q?.trim().toLowerCase() ?? "";
  const pricing = options.pricing === "Free" || options.pricing === "Freemium" || options.pricing === "Paid" ? options.pricing : "";
  const industry = options.industry?.trim() ?? "";
  const sort = options.sort === "oldest" || options.sort === "az" || options.sort === "views" ? options.sort : "newest";
  const [listings, { categories, ratings }] = await Promise.all([loadApproved(), cardContext()]);
  const category = options.categorySlug ? categories.find((item) => item.slug === options.categorySlug) : undefined;

  let filtered = listings;
  if (options.categorySlug) {
    filtered = category ? filtered.filter((listing) => listingBelongsToCategory(listing, category)) : [];
  }
  if (pricing) filtered = filtered.filter((listing) => listing.pricingModel === pricing);
  if (industry) filtered = filtered.filter((listing) => industryOf(listing, categories) === industry);
  if (q) filtered = filtered.filter((listing) => listing.searchText.includes(q) || listing.name.toLowerCase().includes(q));

  filtered = [...filtered].sort((a, b) => {
    if (sort === "az") return a.name.localeCompare(b.name);
    if (sort === "oldest") return a.createdAt.getTime() - b.createdAt.getTime();
    if (sort === "views") return b.viewCount - a.viewCount || b.createdAt.getTime() - a.createdAt.getTime();
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requested, pages);
  return {
    listings: filtered.slice((page - 1) * pageSize, page * pageSize).map((listing) => toCard(listing, categories, ratings)),
    total,
    page,
    pages,
    sort,
    q,
    pricing,
    industry,
  };
}

export async function getCategoryBySlug(slug: string) {
  return getCategory(getPublicDb(), slug);
}

export async function getListingSlugByDomain(domain: string) {
  const host = decodeURIComponent(domain).trim().toLowerCase().replace(/^www\./, "");
  if (!host || host.includes("/") || host.includes("\\") || host.includes("..")) return null;
  const listings = await loadApproved();
  const match = listings.find((listing) => {
    try {
      return websiteKey(listing.websiteUrl) === host;
    } catch {
      return false;
    }
  });
  return match?.slug ?? null;
}

export const getListingBySlug = cache(async (slug: string) => {
  const categories = await loadCategories();
  const present = (listing: ListingRecord) => ({
    ...listing,
    category: categoryOf(listing, categories),
    user: { id: listing.userId, name: listing.ownerName },
  });
  const publicListing = await getListing(getPublicDb(), slug);
  if (publicListing && isSampleListing(publicListing)) return null;
  if (publicListing?.status === "approved") return present(publicListing);
  const owned = await tryUserFirestore((db) => getListing(db, slug));
  if (!owned) return null;
  return present(owned);
});

export async function getRelatedListings(categoryId: string, listingId: string) {
  const [listings, { categories, ratings }] = await Promise.all([loadApproved(), cardContext()]);
  return listings
    .filter((listing) => listing.categoryId === categoryId && listing.id !== listingId)
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 3)
    .map((listing) => toCard(listing, categories, ratings));
}

const loadOwnedListings = cache(async (userId: string) => {
  const [listings, { categories, ratings }] = await Promise.all([
    withUserFirestore((db) => listListings(db, { userId })),
    cardContext(),
  ]);
  return listings
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .map((listing) => toManaged(listing, categories, ratings));
});

export async function getUserListings(userId: string) {
  return loadOwnedListings(userId);
}

export async function getUserStats(userId: string) {
  const listings = await loadOwnedListings(userId);
  const stats = { total: listings.length, pending: 0, approved: 0, rejected: 0 };
  for (const listing of listings) {
    if (listing.status === "pending" || listing.status === "approved" || listing.status === "rejected") {
      stats[listing.status] += 1;
    }
  }
  return stats;
}

export async function getListingForEdit(id: string) {
  return withUserFirestore((db) => getListing(db, id));
}

const loadAllListings = cache(async () => {
  const [listings, { categories, ratings }] = await Promise.all([
    withUserFirestore((db) => listListings(db)),
    cardContext(),
  ]);
  return listings.filter((listing) => !isSampleListing(listing)).map((listing) => toManaged(listing, categories, ratings));
});

export async function getAdminStats() {
  const [listings, users] = await Promise.all([loadAllListings(), withUserFirestore((db) => listUsers(db))]);
  const members = users.filter(isMemberAccount);
  return {
    users: members.length,
    listings: listings.length,
    pending: listings.filter((listing) => listing.status === "pending").length,
    approved: listings.filter((listing) => listing.status === "approved").length,
    rejected: listings.filter((listing) => listing.status === "rejected").length,
    featured: listings.filter((listing) => listing.status === "approved" && listing.featured).length,
    views: listings.reduce((sum, listing) => sum + listing.viewCount, 0),
    clicks: listings.reduce((sum, listing) => sum + listing.clickCount, 0),
  };
}

export async function getAdminListings(options: { q?: string; status?: string; page?: number; pageSize?: number }) {
  const pageSize = options.pageSize ?? 100;
  const requested = Math.max(1, options.page ?? 1);
  const q = options.q?.trim().toLowerCase() ?? "";
  const status =
    options.status === "pending" || options.status === "approved" || options.status === "rejected" ? options.status : "";
  let listings = await loadAllListings();
  if (status) listings = listings.filter((listing) => listing.status === status);
  if (q) {
    listings = listings.filter((listing) =>
      `${listing.name} ${listing.shortDescription} ${listing.websiteUrl} ${listing.user.email} ${listing.user.name}`
        .toLowerCase()
        .includes(q),
    );
  }
  listings = [...listings].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const total = listings.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requested, pages);
  return { listings: listings.slice((page - 1) * pageSize, page * pageSize), total, page, pages, q, status };
}

export async function getPendingListings() {
  const listings = await loadAllListings();
  return listings
    .filter((listing) => listing.status === "pending")
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .slice(0, 8);
}

export async function getUsers(queryText?: string) {
  const [users, listings] = await Promise.all([withUserFirestore((db) => listUsers(db)), loadAllListings()]);
  const counts = new Map<string, number>();
  for (const listing of listings) counts.set(listing.user.id, (counts.get(listing.user.id) ?? 0) + 1);
  const q = queryText?.trim().toLowerCase();
  const rows = users
    .filter(isMemberAccount)
    .map((user) => ({ ...user, _count: { listings: counts.get(user.id) ?? 0 } }))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  if (!q) return rows;
  return rows.filter((user) => user.name.toLowerCase().includes(q) || user.email.includes(q));
}

export async function getSitemapListings() {
  const listings = await loadApproved();
  return listings.map((listing) => ({ slug: listing.slug, updatedAt: listing.updatedAt }));
}

export type { CategoryRecord, UserRecord };

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  orderBy,
  query,
  runTransaction,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type Firestore,
} from "firebase/firestore";
import { getPublicDb } from "./firebase-db";

export class DuplicateWebsiteError extends Error {
  constructor() {
    super("DUPLICATE_WEBSITE");
    this.name = "DuplicateWebsiteError";
  }
}

export type CategoryRecord = {
  id: string;
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type UserRecord = {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
};

export type ListingRecord = {
  id: string;
  userId: string;
  ownerName: string;
  ownerEmail: string;
  name: string;
  slug: string;
  websiteUrl: string;
  websiteKey: string;
  logoUrl: string | null;
  shortDescription: string;
  fullDescription: string;
  features: string;
  categoryId: string;
  businessType: string;
  pricingModel: string;
  contactEmail: string;
  twitterUrl: string;
  linkedinUrl: string;
  productHuntUrl: string;
  githubUrl: string;
  demoVideoUrl: string;
  searchText: string;
  status: string;
  featured: boolean;
  viewCount: number;
  uniqueVisitors: number;
  clickCount: number;
  benefits: string;
  pricingDetails: string;
  industry: string;
  tags: string;
  gallery: string[];
  verified: boolean;
  rejectionNote: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ListingInsert = Omit<
  ListingRecord,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "viewCount"
  | "uniqueVisitors"
  | "clickCount"
  | "benefits"
  | "pricingDetails"
  | "industry"
  | "tags"
  | "gallery"
  | "verified"
  | "rejectionNote"
> & {
  viewCount?: number;
  uniqueVisitors?: number;
  clickCount?: number;
  benefits?: string;
  pricingDetails?: string;
  industry?: string;
  tags?: string;
  gallery?: string[];
  verified?: boolean;
  rejectionNote?: string;
  createdAt?: Date;
};

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function strings(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.length > 0).slice(0, 6);
}

function asDate(value: unknown) {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === "object" && value !== null && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate();
  }
  return new Date();
}

function stamp(date = new Date()) {
  return Timestamp.fromDate(date);
}

export function isPermissionDenied(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "permission-denied";
}

function mapCategory(id: string, data: Record<string, unknown>): CategoryRecord {
  const slug = text(data.slug) || id;
  return {
    id,
    name: text(data.name),
    slug,
    description: text(data.description),
    sortOrder: typeof data.sortOrder === "number" ? data.sortOrder : 0,
    createdAt: asDate(data.createdAt),
    updatedAt: asDate(data.updatedAt),
  };
}

function mapUser(id: string, data: Record<string, unknown>): UserRecord {
  return {
    id,
    email: text(data.email).toLowerCase(),
    name: text(data.name),
    role: data.role === "admin" ? "admin" : "user",
    createdAt: asDate(data.createdAt),
    updatedAt: asDate(data.updatedAt),
  };
}

function mapListing(id: string, data: Record<string, unknown>): ListingRecord {
  return {
    id,
    userId: text(data.userId),
    ownerName: text(data.ownerName),
    ownerEmail: text(data.ownerEmail).toLowerCase(),
    name: text(data.name),
    slug: text(data.slug) || id,
    websiteUrl: text(data.websiteUrl),
    websiteKey: text(data.websiteKey),
    logoUrl: text(data.logoUrl) || null,
    shortDescription: text(data.shortDescription),
    fullDescription: text(data.fullDescription),
    features: text(data.features),
    categoryId: text(data.categoryId),
    businessType: text(data.businessType),
    pricingModel: text(data.pricingModel),
    contactEmail: text(data.contactEmail).toLowerCase(),
    twitterUrl: text(data.twitterUrl),
    linkedinUrl: text(data.linkedinUrl),
    productHuntUrl: text(data.productHuntUrl),
    githubUrl: text(data.githubUrl),
    demoVideoUrl: text(data.demoVideoUrl),
    searchText: text(data.searchText),
    status: text(data.status) || "pending",
    featured: data.featured === true,
    viewCount: typeof data.viewCount === "number" ? data.viewCount : 0,
    uniqueVisitors: typeof data.uniqueVisitors === "number" ? data.uniqueVisitors : 0,
    clickCount: typeof data.clickCount === "number" ? data.clickCount : 0,
    benefits: text(data.benefits),
    pricingDetails: text(data.pricingDetails),
    industry: text(data.industry),
    tags: text(data.tags),
    gallery: strings(data.gallery),
    verified: data.verified === true,
    rejectionNote: text(data.rejectionNote),
    createdAt: asDate(data.createdAt),
    updatedAt: asDate(data.updatedAt),
  };
}

export async function listCategories(db: Firestore) {
  const snap = await getDocs(query(collection(db, "categories"), orderBy("sortOrder", "asc")));
  return snap.docs.map((item) => mapCategory(item.id, item.data()));
}

export async function getCategory(db: Firestore, id: string) {
  const snap = await getDoc(doc(db, "categories", id));
  if (!snap.exists()) return null;
  return mapCategory(snap.id, snap.data());
}

export async function upsertCategory(
  db: Firestore,
  input: { name: string; slug: string; description: string; sortOrder: number },
) {
  const ref = doc(db, "categories", input.slug);
  const existing = await getDoc(ref);
  const now = stamp();
  await setDoc(
    ref,
    {
      name: input.name,
      slug: input.slug,
      description: input.description,
      sortOrder: input.sortOrder,
      createdAt: existing.exists() ? existing.data().createdAt ?? now : now,
      updatedAt: now,
    },
    { merge: true },
  );
}

export async function deleteCategory(db: Firestore, id: string) {
  await deleteDoc(doc(db, "categories", id));
}

export async function getUser(db: Firestore, id: string) {
  const snap = await getDoc(doc(db, "users", id));
  if (!snap.exists()) return null;
  return mapUser(snap.id, snap.data());
}

export async function listUsers(db: Firestore) {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((item) => mapUser(item.id, item.data()));
}

export async function upsertUserProfile(
  db: Firestore,
  input: { id: string; email: string; name: string; role: "user" | "admin" },
) {
  const ref = doc(db, "users", input.id);
  const existing = await getDoc(ref);
  const now = stamp();
  await setDoc(
    ref,
    {
      email: input.email.toLowerCase(),
      name: input.name,
      role: input.role,
      createdAt: existing.exists() ? existing.data().createdAt ?? now : now,
      updatedAt: now,
    },
    { merge: true },
  );
  const saved = await getUser(db, input.id);
  if (!saved) throw new Error("Could not save the user profile.");
  return saved;
}

export async function getListing(db: Firestore, id: string) {
  try {
    const snap = await getDoc(doc(db, "listings", id));
    if (!snap.exists()) return null;
    return mapListing(snap.id, snap.data());
  } catch (error) {
    if (isPermissionDenied(error)) return null;
    throw error;
  }
}

export async function listListings(db: Firestore, filters?: { status?: string; userId?: string }) {
  const constraints = [];
  if (filters?.status) constraints.push(where("status", "==", filters.status));
  if (filters?.userId) constraints.push(where("userId", "==", filters.userId));
  const snap = await getDocs(query(collection(db, "listings"), ...constraints));
  return snap.docs.map((item) => mapListing(item.id, item.data()));
}

export async function slugExists(db: Firestore, slug: string) {
  const snap = await getDoc(doc(db, "slugs", slug));
  return snap.exists();
}

export async function findWebsiteOwner(db: Firestore, key: string, ignoreId?: string) {
  const snap = await getDoc(doc(db, "websiteKeys", key));
  if (!snap.exists()) return null;
  const listingId = text(snap.data().listingId);
  if (!listingId || listingId === ignoreId) return null;
  return { id: listingId };
}

export async function insertListing(db: Firestore, input: ListingInsert) {
  const now = stamp(input.createdAt);
  const listingRef = doc(db, "listings", input.slug);
  const keyRef = doc(db, "websiteKeys", input.websiteKey);
  const slugRef = doc(db, "slugs", input.slug);

  await runTransaction(db, async (tx) => {
    const [listingSnap, keySnap, slugSnap] = await Promise.all([tx.get(listingRef), tx.get(keyRef), tx.get(slugRef)]);
    if (listingSnap.exists() || slugSnap.exists()) throw new Error("SLUG_TAKEN");
    if (keySnap.exists()) throw new DuplicateWebsiteError();

    tx.set(listingRef, {
      userId: input.userId,
      ownerName: input.ownerName,
      ownerEmail: input.ownerEmail.toLowerCase(),
      name: input.name,
      slug: input.slug,
      websiteUrl: input.websiteUrl,
      websiteKey: input.websiteKey,
      logoUrl: input.logoUrl,
      shortDescription: input.shortDescription,
      fullDescription: input.fullDescription,
      features: input.features,
      categoryId: input.categoryId,
      businessType: input.businessType,
      pricingModel: input.pricingModel,
      contactEmail: input.contactEmail.toLowerCase(),
      twitterUrl: input.twitterUrl,
      linkedinUrl: input.linkedinUrl,
      productHuntUrl: input.productHuntUrl,
      githubUrl: input.githubUrl,
      demoVideoUrl: input.demoVideoUrl,
      searchText: input.searchText,
      status: input.status,
      featured: input.featured,
      viewCount: input.viewCount ?? 0,
      uniqueVisitors: input.uniqueVisitors ?? 0,
      clickCount: input.clickCount ?? 0,
      benefits: input.benefits ?? "",
      pricingDetails: input.pricingDetails ?? "",
      industry: input.industry ?? "",
      tags: input.tags ?? "",
      gallery: input.gallery ?? [],
      verified: input.verified ?? false,
      rejectionNote: input.rejectionNote ?? "",
      createdAt: now,
      updatedAt: now,
    });
    tx.set(keyRef, { listingId: input.slug, userId: input.userId });
    tx.set(slugRef, { userId: input.userId, listingId: input.slug });
  });
}

export async function updateListing(
  db: Firestore,
  id: string,
  data: Partial<Omit<ListingRecord, "id" | "createdAt">> & { websiteKey?: string },
) {
  const ref = doc(db, "listings", id);
  const nextKey = data.websiteKey;
  const payload: Record<string, unknown> = { updatedAt: stamp() };
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) payload[key] = value;
  }

  if (!nextKey) {
    await updateDoc(ref, payload);
    return;
  }

  await runTransaction(db, async (tx) => {
    const current = await tx.get(ref);
    if (!current.exists()) throw new Error("NOT_FOUND");
    const previousKey = text(current.data().websiteKey);
    if (previousKey !== nextKey) {
      const keyRef = doc(db, "websiteKeys", nextKey);
      const taken = await tx.get(keyRef);
      const owner = text(taken.data()?.listingId);
      if (taken.exists() && owner !== id) throw new DuplicateWebsiteError();
      if (previousKey) tx.delete(doc(db, "websiteKeys", previousKey));
      tx.set(keyRef, { listingId: id, userId: text(current.data().userId) });
    }
    tx.update(ref, payload);
  });
}

export async function assignListingOwner(
  db: Firestore,
  id: string,
  owner: { id: string; name: string; email: string },
) {
  const listing = await getListing(db, id);
  if (!listing) return null;
  await updateDoc(doc(db, "listings", id), {
    userId: owner.id,
    ownerName: owner.name,
    ownerEmail: owner.email.toLowerCase(),
    verified: true,
    updatedAt: stamp(),
  });
  if (listing.websiteKey) {
    await setDoc(doc(db, "websiteKeys", listing.websiteKey), { listingId: id, userId: owner.id }, { merge: true });
  }
  if (listing.slug) {
    await setDoc(doc(db, "slugs", listing.slug), { listingId: id, userId: owner.id }, { merge: true });
  }
  return listing;
}

export async function deleteListing(db: Firestore, id: string) {
  const listing = await getListing(db, id);
  if (!listing) return null;
  await runTransaction(db, async (tx) => {
    if (listing.websiteKey) tx.delete(doc(db, "websiteKeys", listing.websiteKey));
    if (listing.slug) tx.delete(doc(db, "slugs", listing.slug));
    tx.delete(doc(db, "listings", id));
  });
  return listing;
}

export async function incrementListingView(id: string) {
  try {
    await updateDoc(doc(getPublicDb(), "listings", id), { viewCount: increment(1) });
  } catch (error) {
    if (!isPermissionDenied(error)) throw error;
  }
}

export async function countListings(db: Firestore, categoryId: string) {
  const snap = await getDocs(query(collection(db, "listings"), where("categoryId", "==", categoryId)));
  return snap.size;
}

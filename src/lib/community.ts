import {
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type Firestore,
} from "firebase/firestore";
import { getPublicDb } from "@/lib/firebase-db";
import { getListing, type ListingRecord } from "@/lib/store";

const VIEW_WINDOW_MS = 30 * 60 * 1000;

export type ReviewRecord = {
  id: string;
  listingId: string;
  userId: string;
  authorName: string;
  rating: number;
  body: string;
  status: "published" | "hidden";
  createdAt: Date;
  updatedAt: Date;
};

export type ClaimRecord = {
  id: string;
  listingId: string;
  userId: string;
  claimantName: string;
  claimantEmail: string;
  message: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
};

export type DayStat = {
  id: string;
  listingId: string;
  day: string;
  views: number;
  uniques: number;
  clicks: number;
};

function asDate(value: unknown) {
  if (value instanceof Timestamp) return value.toDate();
  if (typeof value === "object" && value !== null && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate();
  }
  return new Date();
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function dayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function mapReview(id: string, listingId: string, data: Record<string, unknown>): ReviewRecord {
  const rating = typeof data.rating === "number" ? data.rating : 0;
  return {
    id,
    listingId: text(data.listingId) || listingId,
    userId: text(data.userId),
    authorName: text(data.authorName) || "Member",
    rating: Math.min(5, Math.max(1, Math.round(rating))),
    body: text(data.body),
    status: data.status === "hidden" ? "hidden" : "published",
    createdAt: asDate(data.createdAt),
    updatedAt: asDate(data.updatedAt),
  };
}

export function bookmarkId(userId: string, listingId: string) {
  return `${userId}_${listingId}`;
}

export async function isBookmarked(db: Firestore, userId: string, listingId: string) {
  const snap = await getDoc(doc(db, "bookmarks", bookmarkId(userId, listingId)));
  return snap.exists();
}

export async function setBookmark(db: Firestore, userId: string, listingId: string, saved: boolean) {
  const ref = doc(db, "bookmarks", bookmarkId(userId, listingId));
  if (!saved) {
    await deleteDoc(ref);
    return;
  }
  if ((await getDoc(ref)).exists()) return;
  await setDoc(ref, { userId, listingId, createdAt: Timestamp.now() });
}

export async function listBookmarkIds(db: Firestore, userId: string) {
  const snap = await getDocs(query(collection(db, "bookmarks"), where("userId", "==", userId)));
  return snap.docs.map((item) => text(item.data().listingId)).filter(Boolean);
}

export async function listReviews(db: Firestore, listingId: string, includeHidden = false) {
  const base = collection(db, "listings", listingId, "reviews");
  const snap = includeHidden ? await getDocs(base) : await getDocs(query(base, where("status", "==", "published")));
  return snap.docs
    .map((item) => mapReview(item.id, listingId, item.data()))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getReview(db: Firestore, listingId: string, userId: string) {
  const snap = await getDoc(doc(db, "listings", listingId, "reviews", userId));
  if (!snap.exists()) return null;
  return mapReview(snap.id, listingId, snap.data());
}

export async function saveReview(
  db: Firestore,
  input: { listingId: string; userId: string; authorName: string; rating: number; body: string },
) {
  const ref = doc(db, "listings", input.listingId, "reviews", input.userId);
  const existing = await getDoc(ref);
  const now = Timestamp.now();
  await setDoc(
    ref,
    {
      listingId: input.listingId,
      userId: input.userId,
      authorName: input.authorName,
      rating: input.rating,
      body: input.body,
      status: existing.exists() ? existing.data().status ?? "published" : "published",
      createdAt: existing.exists() ? existing.data().createdAt ?? now : now,
      updatedAt: now,
    },
    { merge: true },
  );
}

export async function deleteReview(db: Firestore, listingId: string, userId: string) {
  await deleteDoc(doc(db, "listings", listingId, "reviews", userId));
}

export async function setReviewStatus(db: Firestore, listingId: string, userId: string, status: "published" | "hidden") {
  await updateDoc(doc(db, "listings", listingId, "reviews", userId), { status, updatedAt: Timestamp.now() });
}

export async function listAllReviews(db: Firestore) {
  const snap = await getDocs(collectionGroup(db, "reviews"));
  return snap.docs
    .map((item) => mapReview(item.id, item.ref.parent.parent?.id ?? "", item.data()))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function reportReview(
  db: Firestore,
  input: { reviewId: string; listingId: string; userId: string; reason: string },
) {
  const id = `${input.userId}_${input.listingId}_${input.reviewId}`;
  const ref = doc(db, "reviewReports", id);
  if ((await getDoc(ref)).exists()) return false;
  await setDoc(ref, { ...input, createdAt: Timestamp.now() });
  return true;
}

export async function listReports(db: Firestore) {
  const snap = await getDocs(collection(db, "reviewReports"));
  return snap.docs
    .map((item) => ({
      id: item.id,
      reviewId: text(item.data().reviewId),
      listingId: text(item.data().listingId),
      userId: text(item.data().userId),
      reason: text(item.data().reason),
      createdAt: asDate(item.data().createdAt),
    }))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getClaim(db: Firestore, userId: string, listingId: string) {
  const snap = await getDoc(doc(db, "claims", bookmarkId(userId, listingId)));
  if (!snap.exists()) return null;
  return mapClaim(snap.id, snap.data());
}

function mapClaim(id: string, data: Record<string, unknown>): ClaimRecord {
  const status = data.status === "approved" || data.status === "rejected" ? data.status : "pending";
  return {
    id,
    listingId: text(data.listingId),
    userId: text(data.userId),
    claimantName: text(data.claimantName),
    claimantEmail: text(data.claimantEmail),
    message: text(data.message),
    status,
    createdAt: asDate(data.createdAt),
  };
}

export async function saveClaim(
  db: Firestore,
  input: { listingId: string; userId: string; claimantName: string; claimantEmail: string; message: string },
) {
  const ref = doc(db, "claims", bookmarkId(input.userId, input.listingId));
  const existing = await getDoc(ref);
  if (existing.exists() && existing.data().status === "approved") {
    throw new Error("CLAIM_APPROVED");
  }
  if (existing.exists() && existing.data().status === "pending") {
    throw new Error("CLAIM_PENDING");
  }
  const now = Timestamp.now();
  await setDoc(ref, {
    ...input,
    status: "pending",
    createdAt: existing.exists() ? existing.data().createdAt ?? now : now,
    updatedAt: now,
  });
}

export async function listClaims(db: Firestore, status?: string) {
  const snap = await getDocs(collection(db, "claims"));
  return snap.docs
    .map((item) => mapClaim(item.id, item.data()))
    .filter((claim) => !status || claim.status === status)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function setClaimStatus(db: Firestore, id: string, status: "approved" | "rejected" | "pending") {
  await updateDoc(doc(db, "claims", id), { status, updatedAt: Timestamp.now() });
}

async function bumpDay(listingId: string, field: "views" | "uniques" | "clicks") {
  const day = dayKey();
  const ref = doc(getPublicDb(), "listingDays", `${listingId}_${day}`);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      listingId,
      day,
      views: field === "views" ? 1 : 0,
      uniques: field === "uniques" ? 1 : 0,
      clicks: field === "clicks" ? 1 : 0,
    });
    return;
  }
  await updateDoc(ref, { [field]: increment(1) });
}

export async function recordProfileView(listingId: string, visitorId: string) {
  const db = getPublicDb();
  const listing = await getListing(db, listingId);
  if (!listing || listing.status !== "approved") return;
  const visitorRef = doc(db, "listingVisitors", `${listingId}_${visitorId}`);
  const snap = await getDoc(visitorRef);
  const now = Timestamp.now();
  if (snap.exists()) {
    const last = asDate(snap.data().lastView).getTime();
    if (Date.now() - last < VIEW_WINDOW_MS) return;
    await updateDoc(visitorRef, { lastView: now });
    await updateDoc(doc(db, "listings", listingId), { viewCount: increment(1) });
    await bumpDay(listingId, "views");
    return;
  }
  await setDoc(visitorRef, { listingId, visitorId, firstSeen: now, lastView: now });
  await updateDoc(doc(db, "listings", listingId), {
    viewCount: increment(1),
    uniqueVisitors: increment(1),
  });
  await bumpDay(listingId, "views");
  await bumpDay(listingId, "uniques");
}

export async function recordWebsiteClick(listingId: string) {
  const listing = await getListing(getPublicDb(), listingId);
  if (!listing || listing.status !== "approved") return null;
  await updateDoc(doc(getPublicDb(), "listings", listingId), { clickCount: increment(1) });
  await bumpDay(listingId, "clicks");
  return listing.websiteUrl;
}

export async function listDayStats(listingIds: string[]) {
  if (listingIds.length === 0) return [];
  const snap = await getDocs(collection(getPublicDb(), "listingDays"));
  const allowed = new Set(listingIds);
  return snap.docs
    .map((item) => {
      const data = item.data();
      return {
        id: item.id,
        listingId: text(data.listingId),
        day: text(data.day),
        views: typeof data.views === "number" ? data.views : 0,
        uniques: typeof data.uniques === "number" ? data.uniques : 0,
        clicks: typeof data.clicks === "number" ? data.clicks : 0,
      } satisfies DayStat;
    })
    .filter((row) => allowed.has(row.listingId));
}

export async function loadPublishedRatingMap() {
  const snap = await getDocs(query(collectionGroup(getPublicDb(), "reviews"), where("status", "==", "published")));
  const map = new Map<string, { sum: number; count: number }>();
  for (const item of snap.docs) {
    const listingId = item.ref.parent.parent?.id;
    const rating = item.data().rating;
    if (!listingId || typeof rating !== "number") continue;
    const current = map.get(listingId) ?? { sum: 0, count: 0 };
    current.sum += rating;
    current.count += 1;
    map.set(listingId, current);
  }
  return map;
}

export function ratingFor(map: Map<string, { sum: number; count: number }>, listingId: string) {
  const row = map.get(listingId);
  if (!row || row.count === 0) return { ratingAverage: 0, ratingCount: 0 };
  return { ratingAverage: Math.round((row.sum / row.count) * 10) / 10, ratingCount: row.count };
}

export type { ListingRecord };

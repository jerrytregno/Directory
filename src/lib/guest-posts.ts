import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type Firestore,
} from "firebase/firestore";
import { signIn } from "@/lib/firebase-auth";
import { getPublicDb, runWithToken } from "@/lib/firebase-db";
import {
  type GuestNotification,
  type GuestPost,
  type GuestPostStatus,
  GUEST_STATUSES,
  isLivePost,
} from "@/lib/guest-content";
import { isPermissionDenied } from "@/lib/store";
import { slugify } from "@/lib/utils";

const POSTS = "guestPosts";
const SLUGS = "guestSlugs";
const NOTES = "notifications";

let adminAuth: { token: string; expiresAt: number } | null = null;

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function iso(value: unknown) {
  if (!value) return null;
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === "string") {
    const time = new Date(value).getTime();
    return Number.isNaN(time) ? null : new Date(value).toISOString();
  }
  return null;
}

function asStatus(value: unknown): GuestPostStatus {
  return GUEST_STATUSES.includes(value as GuestPostStatus) ? (value as GuestPostStatus) : "draft";
}

function asTags(value: unknown) {
  if (Array.isArray(value)) return value.map((tag) => text(tag).trim()).filter(Boolean);
  if (typeof value === "string") return value.split(",").map((tag) => tag.trim()).filter(Boolean);
  return [];
}

export function mapGuestPost(id: string, data: Record<string, unknown>): GuestPost {
  const postId = text(data.postId) || id;
  return {
    id,
    postId,
    authorId: text(data.authorId),
    authorName: text(data.authorName),
    authorEmail: text(data.authorEmail),
    authorBio: text(data.authorBio),
    authorImage: text(data.authorImage) || null,
    title: text(data.title),
    slug: text(data.slug),
    shortDescription: text(data.shortDescription),
    content: text(data.content),
    featuredImage: text(data.featuredImage) || null,
    category: text(data.category),
    tags: asTags(data.tags),
    authorWebsite: text(data.authorWebsite),
    linkedinUrl: text(data.linkedinUrl),
    twitterUrl: text(data.twitterUrl),
    status: asStatus(data.status),
    adminFeedback: text(data.adminFeedback),
    featured: data.featured === true,
    scheduledAt: iso(data.scheduledAt),
    publishedAt: iso(data.publishedAt),
    createdAt: iso(data.createdAt) || new Date(0).toISOString(),
    updatedAt: iso(data.updatedAt) || iso(data.createdAt) || new Date(0).toISOString(),
  };
}

function byUpdated(a: GuestPost, b: GuestPost) {
  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
}

export async function getGuestPost(db: Firestore, id: string) {
  const snap = await getDoc(doc(db, POSTS, id));
  if (!snap.exists()) return null;
  return mapGuestPost(snap.id, snap.data());
}

export async function listGuestPosts(db: Firestore, authorId?: string) {
  const snap = authorId
    ? await getDocs(query(collection(db, POSTS), where("authorId", "==", authorId)))
    : await getDocs(collection(db, POSTS));
  return snap.docs.map((item) => mapGuestPost(item.id, item.data())).sort(byUpdated);
}

export async function addGuestNotification(
  db: Firestore,
  input: { userId: string; postId: string; kind: string; message: string },
) {
  if (!input.userId) return;
  const ref = doc(collection(db, NOTES));
  await setDoc(ref, {
    userId: input.userId,
    postId: input.postId,
    kind: input.kind,
    message: input.message.slice(0, 500),
    read: false,
    createdAt: Timestamp.now(),
  });
}

export async function listGuestNotifications(db: Firestore, userId: string) {
  const snap = await getDocs(query(collection(db, NOTES), where("userId", "==", userId)));
  return snap.docs
    .map((item) => {
      const data = item.data();
      const note: GuestNotification = {
        id: item.id,
        userId: text(data.userId),
        postId: text(data.postId),
        kind: text(data.kind),
        message: text(data.message),
        read: data.read === true,
        createdAt: iso(data.createdAt) || new Date(0).toISOString(),
      };
      return note;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 12);
}

export async function markGuestNotificationsRead(db: Firestore, notes: GuestNotification[]) {
  const unread = notes.filter((note) => !note.read);
  await Promise.all(unread.map((note) => updateDoc(doc(db, NOTES, note.id), { read: true })));
}

async function reserveSlug(db: Firestore, title: string, postId: string, authorId: string) {
  const base = slugify(title);
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const slug = attempt === 0 ? base : `${base}-${attempt + 1}`.slice(0, 70);
    const postRef = doc(db, POSTS, postId);
    const slugRef = doc(db, SLUGS, slug);
    try {
      await runTransaction(db, async (tx) => {
        const existing = await tx.get(slugRef);
        if (existing.exists() && text(existing.data().postId) !== postId) throw new Error("SLUG_TAKEN");
        tx.set(slugRef, { postId, authorId });
      });
      return slug;
    } catch (error) {
      if (error instanceof Error && error.message === "SLUG_TAKEN") continue;
      throw error;
    }
  }
  throw new Error("SLUG_TAKEN");
}

export async function createGuestPost(
  db: Firestore,
  authorId: string,
  input: Omit<GuestPost, "id" | "postId" | "authorId" | "slug" | "createdAt" | "updatedAt" | "status" | "adminFeedback" | "featured" | "scheduledAt" | "publishedAt"> & {
    status: "draft" | "submitted";
  },
) {
  const postRef = doc(collection(db, POSTS));
  const slug = await reserveSlug(db, input.title, postRef.id, authorId);
  const now = Timestamp.now();
  await setDoc(postRef, {
    postId: postRef.id,
    authorId,
    authorName: input.authorName,
    authorEmail: input.authorEmail,
    authorBio: input.authorBio,
    authorImage: input.authorImage,
    title: input.title,
    slug,
    shortDescription: input.shortDescription,
    content: input.content,
    featuredImage: input.featuredImage,
    category: input.category,
    tags: input.tags,
    authorWebsite: input.authorWebsite,
    linkedinUrl: input.linkedinUrl,
    twitterUrl: input.twitterUrl,
    status: input.status,
    adminFeedback: "",
    featured: false,
    scheduledAt: null,
    publishedAt: null,
    createdAt: now,
    updatedAt: now,
  });
  if (input.status === "submitted") {
    await addGuestNotification(db, {
      userId: authorId,
      postId: postRef.id,
      kind: "submitted",
      message: `Your article "${input.title}" was submitted and is waiting for review.`,
    });
  }
  return { id: postRef.id, slug };
}

export async function updateOwnGuestPost(
  db: Firestore,
  post: GuestPost,
  input: Omit<GuestPost, "id" | "postId" | "authorId" | "slug" | "createdAt" | "updatedAt" | "status" | "adminFeedback" | "featured" | "scheduledAt" | "publishedAt"> & {
    status: "draft" | "submitted";
  },
) {
  if (!["draft", "submitted", "rejected"].includes(post.status)) {
    throw new Error("LOCKED");
  }
  await updateDoc(doc(db, POSTS, post.id), {
    authorName: input.authorName,
    authorEmail: input.authorEmail,
    authorBio: input.authorBio,
    authorImage: input.authorImage,
    title: input.title,
    shortDescription: input.shortDescription,
    content: input.content,
    featuredImage: input.featuredImage,
    category: input.category,
    tags: input.tags,
    authorWebsite: input.authorWebsite,
    linkedinUrl: input.linkedinUrl,
    twitterUrl: input.twitterUrl,
    status: input.status,
    updatedAt: Timestamp.now(),
  });
  if (input.status === "submitted" && post.status !== "submitted") {
    await addGuestNotification(db, {
      userId: post.authorId,
      postId: post.id,
      kind: "submitted",
      message: `Your article "${input.title}" was submitted and is waiting for review.`,
    });
  }
}

export async function updateGuestPostFields(
  db: Firestore,
  id: string,
  input: Omit<GuestPost, "id" | "postId" | "authorId" | "slug" | "status" | "adminFeedback" | "featured" | "scheduledAt" | "publishedAt" | "createdAt" | "updatedAt">,
) {
  await updateDoc(doc(db, POSTS, id), {
    authorName: input.authorName,
    authorEmail: input.authorEmail,
    authorBio: input.authorBio,
    authorImage: input.authorImage,
    title: input.title,
    shortDescription: input.shortDescription,
    content: input.content,
    featuredImage: input.featuredImage,
    category: input.category,
    tags: input.tags,
    authorWebsite: input.authorWebsite,
    linkedinUrl: input.linkedinUrl,
    twitterUrl: input.twitterUrl,
    updatedAt: Timestamp.now(),
  });
}

export async function setGuestPostStatus(
  db: Firestore,
  post: GuestPost,
  patch: { status: GuestPostStatus; adminFeedback?: string; featured?: boolean; scheduledAt?: string | null; publishedAt?: string | null },
) {
  const next: Record<string, unknown> = {
    status: patch.status,
    updatedAt: Timestamp.now(),
  };
  if (patch.adminFeedback !== undefined) next.adminFeedback = patch.adminFeedback;
  if (patch.featured !== undefined) next.featured = patch.featured;
  if (patch.scheduledAt !== undefined) next.scheduledAt = patch.scheduledAt ? Timestamp.fromDate(new Date(patch.scheduledAt)) : null;
  if (patch.publishedAt !== undefined) next.publishedAt = patch.publishedAt ? Timestamp.fromDate(new Date(patch.publishedAt)) : null;
  await updateDoc(doc(db, POSTS, post.id), next);
}

export async function removeGuestPost(db: Firestore, post: GuestPost) {
  await deleteDoc(doc(db, POSTS, post.id));
  if (post.slug) await deleteDoc(doc(db, SLUGS, post.slug)).catch(() => undefined);
}

export async function promoteDuePosts(db: Firestore) {
  const snap = await getDocs(query(collection(db, POSTS), where("status", "==", "approved")));
  const now = Date.now();
  for (const item of snap.docs) {
    const scheduled = iso(item.data().scheduledAt);
    if (!scheduled || new Date(scheduled).getTime() > now) continue;
    await updateDoc(item.ref, {
      status: "published",
      publishedAt: Timestamp.fromDate(new Date(scheduled)),
      scheduledAt: null,
      updatedAt: Timestamp.now(),
    });
    await addGuestNotification(db, {
      userId: text(item.data().authorId),
      postId: item.id,
      kind: "published",
      message: `Your article "${text(item.data().title)}" is now published.`,
    });
  }
}

async function promoteScheduled() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return;
  try {
    if (!adminAuth || adminAuth.expiresAt < Date.now() + 60_000) {
      const session = await signIn("admin@blazly.com", password);
      adminAuth = { token: session.idToken, expiresAt: Date.now() + session.expiresIn * 1000 };
    }
    await runWithToken(adminAuth.token, async (db) => {
      await promoteDuePosts(db);
    });
  } catch {
    adminAuth = null;
  }
}

export async function getPublishedGuestPosts() {
  await promoteScheduled();
  try {
    const snap = await getDocs(query(collection(getPublicDb(), POSTS), where("status", "==", "published")));
    return snap.docs
      .map((item) => mapGuestPost(item.id, item.data()))
      .filter((post) => isLivePost(post))
      .sort((a, b) => new Date(b.publishedAt || b.updatedAt).getTime() - new Date(a.publishedAt || a.updatedAt).getTime());
  } catch (error) {
    if (isPermissionDenied(error)) return [];
    throw error;
  }
}

export async function getPublishedGuestPost(slug: string) {
  const posts = await getPublishedGuestPosts();
  return posts.find((post) => post.slug === slug) ?? null;
}

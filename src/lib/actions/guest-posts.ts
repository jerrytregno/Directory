"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, getSession } from "@/lib/auth";
import { safeImageUrl, storeGuestImage } from "@/lib/guest-images";
import { readGuestFields, type GuestDraft, type GuestPostStatus } from "@/lib/guest-content";
import {
  addGuestNotification,
  createGuestPost,
  getGuestPost,
  promoteDuePosts,
  removeGuestPost,
  setGuestPostStatus,
  updateGuestPostFields,
  updateOwnGuestPost,
} from "@/lib/guest-posts";
import { withUserFirestore } from "@/lib/request-db";
import { isPermissionDenied } from "@/lib/store";
import type { ActionState } from "@/lib/types";
import { formString } from "@/lib/utils";

function refresh(slug?: string) {
  revalidatePath("/guest-posts");
  revalidatePath("/my-posts");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/guest-posts/${slug}`);
}

function failure(error: unknown): ActionState {
  if (error instanceof Error && error.message === "SLUG_TAKEN") {
    return { error: "That title is too close to another article. Change the title and try again." };
  }
  if (error instanceof Error && error.message === "LOCKED") {
    return { error: "This article is with the editor. You can change it after they send it back." };
  }
  if (isPermissionDenied(error)) {
    return { error: "Firestore rejected this change. Publish the SaaSListingHub security rules, then try again." };
  }
  console.error(error);
  return { error: "Could not save the article. Try again." };
}

async function imageFromForm(formData: FormData, fileKey: string, existingKey: string, userId: string, label: string) {
  const file = formData.get(fileKey);
  if (file instanceof File && file.size > 0) return storeGuestImage(userId, file, label);
  const existing = safeImageUrl(formString(formData, existingKey).trim());
  return { url: existing };
}

function payload(data: GuestDraft, featuredImage: string | null, authorImage: string | null, status: "draft" | "submitted") {
  return { ...data, featuredImage, authorImage, status };
}

export async function saveOwnGuestPost(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session) redirect("/login?next=/write-for-us/submit");

  const intent = formString(formData, "intent") === "submitted" ? "submitted" : "draft";
  const parsed = readGuestFields(formData, intent);
  if (!parsed.ok) return parsed.state;

  const featured = await imageFromForm(formData, "featuredImage", "existingFeaturedImage", session.id, "Featured image");
  if (featured.error) return { fieldErrors: { featuredImage: featured.error } };
  const authorImage = await imageFromForm(formData, "authorImage", "existingAuthorImage", session.id, "Profile image");
  if (authorImage.error) return { fieldErrors: { authorImage: authorImage.error } };

  const postId = formString(formData, "postId").trim();
  try {
    const saved = await withUserFirestore(async (db) => {
      const body = payload(parsed.data, featured.url, authorImage.url, intent);
      if (!postId) {
        const created = await createGuestPost(db, session.id, body);
        return { slug: created.slug };
      }
      const existing = await getGuestPost(db, postId);
      if (!existing || existing.authorId !== session.id) return { missing: true };
      await updateOwnGuestPost(db, existing, body);
      return { slug: existing.slug };
    });
    if (saved && "missing" in saved) return { error: "That article could not be found." };
    refresh(saved && "slug" in saved ? saved.slug : undefined);
  } catch (error) {
    return failure(error);
  }

  redirect(intent === "submitted" ? "/my-posts?submitted=1" : "/my-posts?draft=1");
}

export async function saveAdminGuestPost(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireAdmin();
  const postId = formString(formData, "postId").trim();
  if (!postId) return { error: "Missing article." };
  const parsed = readGuestFields(formData, "draft");
  if (!parsed.ok) return parsed.state;

  const featured = await imageFromForm(formData, "featuredImage", "existingFeaturedImage", session.id, "Featured image");
  if (featured.error) return { fieldErrors: { featuredImage: featured.error } };
  const authorImage = await imageFromForm(formData, "authorImage", "existingAuthorImage", session.id, "Profile image");
  if (authorImage.error) return { fieldErrors: { authorImage: authorImage.error } };

  try {
    const slug = await withUserFirestore(async (db) => {
      const existing = await getGuestPost(db, postId);
      if (!existing) return null;
      await updateGuestPostFields(db, existing.id, {
        ...parsed.data,
        featuredImage: featured.url,
        authorImage: authorImage.url,
      });
      return existing.slug;
    });
    if (!slug) return { error: "That article could not be found." };
    refresh(slug);
  } catch (error) {
    return failure(error);
  }

  redirect(`/admin/guest-posts/${postId}?updated=1`);
}

export async function uploadGuestAsset(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Log in to upload an image." };
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose an image." };
  const saved = await storeGuestImage(session.id, file, "Image");
  if (saved.error || !saved.url) return { error: saved.error || "Upload failed." };
  return { url: saved.url };
}

export async function deleteOwnDraft(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login?next=/my-posts");
  const id = formString(formData, "id").trim();
  await withUserFirestore(async (db) => {
    const post = await getGuestPost(db, id);
    if (!post || post.authorId !== session.id || post.status !== "draft") return;
    await removeGuestPost(db, post);
  });
  refresh();
  redirect("/my-posts?deleted=1");
}

function noteFor(status: GuestPostStatus, title: string, feedback: string) {
  if (status === "under_review") return { kind: "under_review", message: `Your article "${title}" is under review.` };
  if (status === "approved") return { kind: "approved", message: `Your article "${title}" was approved.${feedback ? ` ${feedback}` : ""}` };
  if (status === "rejected") return { kind: "rejected", message: `Your article "${title}" needs changes. ${feedback}` };
  if (status === "published") return { kind: "published", message: `Your article "${title}" is now published.` };
  return null;
}

export async function moderateGuestPost(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id").trim();
  const action = formString(formData, "decision");
  const feedback = formString(formData, "feedback").trim().slice(0, 1000);
  const whenRaw = formString(formData, "scheduledAt");

  const outcome = await withUserFirestore(async (db) => {
    await promoteDuePosts(db);
    const post = await getGuestPost(db, id);
    if (!post) return { error: "That article could not be found." };

    if (action === "delete") {
      await removeGuestPost(db, post);
      return { slug: post.slug, deleted: true };
    }

    if (action === "feature" || action === "unfeature") {
      await setGuestPostStatus(db, post, { status: post.status, featured: action === "feature" });
      return { slug: post.slug };
    }

    if (action === "review") {
      await setGuestPostStatus(db, post, { status: "under_review" });
      const note = noteFor("under_review", post.title, "");
      if (note) await addGuestNotification(db, { userId: post.authorId, postId: post.id, ...note });
      return { slug: post.slug };
    }

    if (action === "approve") {
      await setGuestPostStatus(db, post, { status: "approved", adminFeedback: feedback, scheduledAt: null });
      const note = noteFor("approved", post.title, feedback);
      if (note) await addGuestNotification(db, { userId: post.authorId, postId: post.id, ...note });
      return { slug: post.slug };
    }

    if (action === "reject") {
      if (feedback.length < 10) return { error: "Add a rejection reason of at least 10 characters." };
      await setGuestPostStatus(db, post, { status: "rejected", adminFeedback: feedback, scheduledAt: null });
      const note = noteFor("rejected", post.title, feedback);
      if (note) await addGuestNotification(db, { userId: post.authorId, postId: post.id, ...note });
      return { slug: post.slug };
    }

    if (action === "unpublish") {
      await setGuestPostStatus(db, post, { status: "approved", scheduledAt: null });
      return { slug: post.slug };
    }

    if (action === "publish") {
      const now = new Date().toISOString();
      await setGuestPostStatus(db, post, { status: "published", publishedAt: now, scheduledAt: null });
      const note = noteFor("published", post.title, "");
      if (note) await addGuestNotification(db, { userId: post.authorId, postId: post.id, ...note });
      return { slug: post.slug };
    }

    if (action === "schedule") {
      const when = new Date(whenRaw);
      if (Number.isNaN(when.getTime())) return { error: "Choose a publication date and time." };
      if (when.getTime() <= Date.now()) {
        await setGuestPostStatus(db, post, { status: "published", publishedAt: when.toISOString(), scheduledAt: null });
        const note = noteFor("published", post.title, "");
        if (note) await addGuestNotification(db, { userId: post.authorId, postId: post.id, ...note });
      } else {
        await setGuestPostStatus(db, post, { status: "approved", scheduledAt: when.toISOString(), adminFeedback: feedback });
        await addGuestNotification(db, {
          userId: post.authorId,
          postId: post.id,
          kind: "approved",
          message: `Your article "${post.title}" was approved and is scheduled to publish on ${when.toUTCString()}.`,
        });
      }
      return { slug: post.slug };
    }

    return { error: "Unknown action." };
  });

  if (outcome && "error" in outcome && outcome.error) {
    redirect(`/admin/guest-posts/${id}?error=${encodeURIComponent(outcome.error)}`);
  }
  refresh(outcome && "slug" in outcome ? outcome.slug : undefined);
  if (outcome && "deleted" in outcome) redirect("/admin/guest-posts?deleted=1");
  redirect(`/admin/guest-posts/${id}?updated=1`);
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { withUserFirestore } from "@/lib/request-db";
import {
  deleteReview,
  getClaim,
  getReview,
  isBookmarked,
  listBookmarkIds,
  reportReview,
  saveClaim,
  saveReview,
  setBookmark,
} from "@/lib/community";
import { getListing } from "@/lib/store";
import type { ActionState } from "@/lib/types";
import { fieldErrorsFromZod, formString } from "@/lib/utils";
import { claimSchema, reportSchema, reviewSchema } from "@/lib/validators";

function refresh(slug?: string) {
  revalidatePath("/", "layout");
  if (slug) revalidatePath(`/listing/${slug}`);
}

export async function toggleBookmark(formData: FormData) {
  const session = await getSession();
  const slug = formString(formData, "slug");
  if (!session) redirect(`/login?next=/listing/${slug || ""}`);
  const listingId = formString(formData, "listingId");
  await withUserFirestore(async (db) => {
    const listing = await getListing(db, listingId);
    if (!listing || listing.status !== "approved") return;
    const saved = await isBookmarked(db, session.id, listingId);
    await setBookmark(db, session.id, listingId, !saved);
  });
  refresh(slug);
}

export async function submitReview(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  const slug = formString(formData, "slug");
  if (!session) redirect(`/login?next=/listing/${slug}`);
  const parsed = reviewSchema.safeParse({
    listingId: formString(formData, "listingId"),
    rating: formString(formData, "rating"),
    body: formString(formData, "body"),
  });
  if (!parsed.success) return { fieldErrors: fieldErrorsFromZod(parsed.error) };

  const result = await withUserFirestore(async (db) => {
    const listing = await getListing(db, parsed.data.listingId);
    if (!listing || listing.status !== "approved") return { error: "This listing is not open for reviews." };
    if (listing.userId === session.id) return { error: "You can't review a listing you manage." };
    await saveReview(db, {
      listingId: listing.id,
      userId: session.id,
      authorName: session.name,
      rating: parsed.data.rating,
      body: parsed.data.body,
    });
    return { ok: true as const };
  });
  if ("error" in result && result.error) return { error: result.error };
  refresh(slug);
  return { success: "Your review is live." };
}

export async function removeOwnReview(formData: FormData) {
  const session = await getSession();
  const slug = formString(formData, "slug");
  if (!session) redirect(`/login?next=/listing/${slug}`);
  const listingId = formString(formData, "listingId");
  await withUserFirestore(async (db) => {
    const review = await getReview(db, listingId, session.id);
    if (!review || review.userId !== session.id) return;
    await deleteReview(db, listingId, session.id);
  });
  refresh(slug);
}

export async function submitReport(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  const slug = formString(formData, "slug");
  if (!session) redirect(`/login?next=/listing/${slug}`);
  const parsed = reportSchema.safeParse({
    listingId: formString(formData, "listingId"),
    reviewId: formString(formData, "reviewId"),
    reason: formString(formData, "reason"),
  });
  if (!parsed.success) return { fieldErrors: fieldErrorsFromZod(parsed.error) };
  const created = await withUserFirestore((db) =>
    reportReview(db, { ...parsed.data, userId: session.id }),
  );
  refresh(slug);
  return { success: created ? "Report sent to the SaaSListingHub team." : "You already reported this review." };
}

export async function submitClaim(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  const slug = formString(formData, "slug");
  if (!session) redirect(`/login?next=/listing/${slug}`);
  const parsed = claimSchema.safeParse({
    listingId: formString(formData, "listingId"),
    message: formString(formData, "message"),
  });
  if (!parsed.success) return { fieldErrors: fieldErrorsFromZod(parsed.error) };

  try {
    const result = await withUserFirestore(async (db) => {
      const listing = await getListing(db, parsed.data.listingId);
      if (!listing || listing.status !== "approved") return { error: "This listing cannot be claimed." };
      if (listing.userId === session.id) return { error: "You already manage this listing." };
      const existing = await getClaim(db, session.id, listing.id);
      if (existing?.status === "pending") return { error: "Your claim is already waiting for review." };
      if (existing?.status === "approved") return { error: "This claim was already approved." };
      await saveClaim(db, {
        listingId: listing.id,
        userId: session.id,
        claimantName: session.name,
        claimantEmail: session.email,
        message: parsed.data.message,
      });
      return { ok: true as const };
    });
    if ("error" in result && result.error) return { error: result.error };
  } catch (error) {
    if (error instanceof Error && error.message === "CLAIM_PENDING") return { error: "Your claim is already waiting for review." };
    if (error instanceof Error && error.message === "CLAIM_APPROVED") return { error: "This claim was already approved." };
    throw error;
  }
  refresh(slug);
  return { success: "Claim submitted. An admin will review it. Claiming a listing is free." };
}

export async function savedListingIds(userId: string) {
  return withUserFirestore((db) => listBookmarkIds(db, userId));
}

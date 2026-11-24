"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { storeAdCreative } from "@/lib/ad-images";
import {
  adRequestSchema,
  AD_PLACEMENTS,
  AD_STATUSES,
  deactivateCampaigns,
  ensureCampaigns,
  getAdRequest,
  removeAdRequest,
  rollupRequest,
  saveCampaign,
  updateAdRequest,
  createAdRequest,
  type AdLabel,
  type AdPlacement,
  type AdStatus,
} from "@/lib/ads";
import { getSession, requireAdmin } from "@/lib/auth";
import { withUserFirestore } from "@/lib/request-db";
import { fieldErrorsFromZod, formString } from "@/lib/utils";
import type { ActionState } from "@/lib/types";

function refreshAds() {
  revalidatePath("/", "layout");
}

export async function submitAdRequest(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = adRequestSchema.safeParse({
    companyName: formString(formData, "companyName"),
    contactPerson: formString(formData, "contactPerson"),
    email: formString(formData, "email"),
    website: formString(formData, "website"),
    listingId: formString(formData, "listingId"),
    advertisingTypes: formData.getAll("advertisingTypes").filter((value): value is string => typeof value === "string"),
    placement: formString(formData, "placement"),
    categorySlug: formString(formData, "categorySlug"),
    startDate: formString(formData, "startDate"),
    duration: formString(formData, "duration"),
    description: formString(formData, "description"),
    destinationUrl: formString(formData, "destinationUrl"),
    additionalRequirements: formString(formData, "additionalRequirements"),
    guestPostRef: formString(formData, "guestPostRef"),
  });
  if (!parsed.success) return { fieldErrors: fieldErrorsFromZod(parsed.error) };

  const creative = formData.get("creative");
  const stored = await storeAdCreative(creative instanceof File ? creative : new File([], ""));
  if (stored.error) return { fieldErrors: { creative: stored.error } };

  const session = await getSession();
  try {
    await createAdRequest({ ...parsed.data, userId: session?.id ?? "", creativeUrl: stored.url });
  } catch (error) {
    console.error(error);
    return { error: "The request could not be saved. Try again in a moment." };
  }

  redirect("/advertise/request?sent=1");
}

function placementOf(value: string): AdPlacement {
  return AD_PLACEMENTS.some((item) => item.id === value) ? (value as AdPlacement) : "homepage";
}

function statusOf(value: string): AdStatus | null {
  return AD_STATUSES.includes(value as AdStatus) ? (value as AdStatus) : null;
}

function labelOf(value: string): AdLabel {
  if (value === "Advertisement" || value === "Featured" || value === "Sponsored") return value;
  return "Sponsored";
}

export async function saveAdRequest(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  const status = statusOf(formString(formData, "status"));
  const adminNotes = formString(formData, "adminNotes").slice(0, 2000);
  if (!id || !status) redirect(`/admin/advertising/${id}?error=${encodeURIComponent("Choose a status.")}`);

  await withUserFirestore(async (db) => {
    const request = await getAdRequest(db, id);
    if (!request) redirect("/admin/advertising?error=Request%20not%20found.");
    if (status === "rejected") {
      await deactivateCampaigns(db, id, false);
      await updateAdRequest(db, id, { status, adminNotes });
      return;
    }
    if (status === "completed") {
      await deactivateCampaigns(db, id, true);
      await updateAdRequest(db, id, { status, adminNotes });
      return;
    }
    await updateAdRequest(db, id, { status, adminNotes });
    if (status === "approved" || status === "scheduled" || status === "active") {
      const current = { ...request, status, adminNotes };
      await ensureCampaigns(db, current);
    }
    if (status === "pending" || status === "under_review") return;
    await rollupRequest(db, id);
  });

  refreshAds();
  redirect(`/admin/advertising/${id}?saved=1`);
}

export async function saveAdCampaign(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "campaignId");
  const requestId = formString(formData, "requestId");
  const startDate = formString(formData, "startDate");
  const endDate = formString(formData, "endDate");
  const active = formString(formData, "active") === "on";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate) || endDate <= startDate) {
    redirect(`/admin/advertising/${requestId}?error=${encodeURIComponent("Set a start date and a later end date.")}`);
  }

  await withUserFirestore(async (db) => {
    const request = await getAdRequest(db, requestId);
    if (!request) redirect("/admin/advertising?error=Request%20not%20found.");
    if (request.status === "rejected" || request.status === "pending") {
      redirect(`/admin/advertising/${requestId}?error=${encodeURIComponent("Approve the request before activating a campaign.")}`);
    }
    await saveCampaign(db, id, {
      title: formString(formData, "title").trim().slice(0, 80) || request.companyName,
      placement: placementOf(formString(formData, "placement")),
      categorySlug: formString(formData, "categorySlug"),
      startDate,
      endDate,
      label: labelOf(formString(formData, "label")),
      guestPostId: formString(formData, "guestPostId").trim().slice(0, 160),
      active,
      requestStatus: request.status === "under_review" ? "approved" : request.status,
    });
    if (request.status === "under_review") {
      await updateAdRequest(db, requestId, { status: "approved", adminNotes: request.adminNotes });
    }
    await rollupRequest(db, requestId);
  });

  refreshAds();
  redirect(`/admin/advertising/${requestId}?saved=1`);
}

export async function deleteAdRequest(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  if (!id) redirect("/admin/advertising");
  await withUserFirestore((db) => removeAdRequest(db, id));
  refreshAds();
  redirect("/admin/advertising?deleted=1");
}

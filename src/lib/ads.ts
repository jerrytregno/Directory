import {
  collection,
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
import { z } from "zod";
import { getPublicDb } from "@/lib/firebase-db";

export const AD_TYPES = [
  { id: "featured_listing", label: "Featured Listing" },
  { id: "category_sponsorship", label: "Category Sponsorship" },
  { id: "newsletter", label: "Newsletter Sponsorship" },
  { id: "banner", label: "Website Banner Advertisement" },
  { id: "sponsored_guest_post", label: "Sponsored Guest Post" },
  { id: "product_spotlight", label: "Product Spotlight" },
] as const;

export const AD_TYPE_IDS = AD_TYPES.map((item) => item.id) as [(typeof AD_TYPES)[number]["id"], ...(typeof AD_TYPES)[number]["id"][]];

export const AD_PLACEMENTS = [
  { id: "homepage", label: "Homepage" },
  { id: "directory", label: "Directory page" },
  { id: "category", label: "Category pages" },
  { id: "blog", label: "Blog pages" },
  { id: "newsletter", label: "Newsletter" },
] as const;

export const AD_PLACEMENT_IDS = AD_PLACEMENTS.map((item) => item.id) as [
  (typeof AD_PLACEMENTS)[number]["id"],
  ...(typeof AD_PLACEMENTS)[number]["id"][],
];

export const AD_DURATIONS = ["7 days", "14 days", "30 days", "60 days", "90 days"] as const;

export const AD_STATUSES = ["pending", "under_review", "approved", "rejected", "scheduled", "active", "completed"] as const;

export type AdType = (typeof AD_TYPES)[number]["id"];
export type AdPlacement = (typeof AD_PLACEMENTS)[number]["id"];
export type AdStatus = (typeof AD_STATUSES)[number];
export type AdLabel = "Sponsored" | "Advertisement" | "Featured";

export type AdRequest = {
  id: string;
  requestId: string;
  userId: string;
  companyName: string;
  contactPerson: string;
  email: string;
  website: string;
  listingId: string;
  advertisingTypes: AdType[];
  placement: AdPlacement;
  categorySlug: string;
  startDate: string;
  duration: string;
  description: string;
  creativeUrl: string | null;
  destinationUrl: string;
  additionalRequirements: string;
  guestPostRef: string;
  status: AdStatus;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
};

export type AdCampaign = {
  id: string;
  campaignId: string;
  requestId: string;
  type: AdType;
  companyName: string;
  title: string;
  description: string;
  creativeUrl: string | null;
  destinationUrl: string;
  placement: AdPlacement;
  categorySlug: string;
  label: AdLabel;
  active: boolean;
  status: "inactive" | "scheduled" | "active" | "completed";
  requestStatus: AdStatus;
  startDate: string;
  endDate: string;
  guestPostId: string;
  listingId: string;
  impressions: number;
  clicks: number;
  createdAt: string;
  updatedAt: string;
};

export type AdDay = {
  id: string;
  campaignId: string;
  day: string;
  impressions: number;
  clicks: number;
};

const REQUESTS = "advertising_requests";
const CAMPAIGNS = "advertising_campaigns";
const VISITORS = "advertising_visitors";
const DAYS = "advertising_days";
const IMPRESSION_WINDOW_MS = 6 * 60 * 60 * 1000;
const CLICK_WINDOW_MS = 2 * 1000;

const httpUrl = z
  .string()
  .trim()
  .min(1, "Enter a URL.")
  .max(300)
  .refine((value) => {
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }, "Enter a valid URL starting with http:// or https://.");

export const adRequestSchema = z
  .object({
    companyName: z.string().trim().min(2, "Enter the company name.").max(80),
    contactPerson: z.string().trim().min(2, "Enter a contact name.").max(80),
    email: z.string().trim().email("Enter a valid business email.").max(160),
    website: httpUrl,
    listingId: z.string().trim().max(120),
    advertisingTypes: z.array(z.enum(AD_TYPE_IDS)).min(1, "Choose at least one advertising option."),
    placement: z.enum(AD_PLACEMENT_IDS, { errorMap: () => ({ message: "Choose a preferred placement." }) }),
    categorySlug: z.string().trim().max(80),
    startDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a campaign start date."),
    duration: z.enum(AD_DURATIONS, { errorMap: () => ({ message: "Choose a campaign duration." }) }),
    description: z.string().trim().min(20, "Describe the promotion in at least 20 characters.").max(2000),
    destinationUrl: httpUrl,
    additionalRequirements: z.string().trim().max(2000),
    guestPostRef: z.string().trim().max(160),
  })
  .superRefine((value, ctx) => {
    if (value.advertisingTypes.includes("category_sponsorship") && !value.categorySlug) {
      ctx.addIssue({ code: "custom", path: ["categorySlug"], message: "Choose the category to sponsor." });
    }
  });

export type AdRequestInput = z.infer<typeof adRequestSchema>;

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asIso(value: unknown) {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object" && value !== null && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }
  return new Date().toISOString();
}

function asType(value: string): AdType {
  return AD_TYPES.some((item) => item.id === value) ? (value as AdType) : "featured_listing";
}

function asPlacement(value: string): AdPlacement {
  return AD_PLACEMENTS.some((item) => item.id === value) ? (value as AdPlacement) : "homepage";
}

function asStatus(value: string): AdStatus {
  return AD_STATUSES.includes(value as AdStatus) ? (value as AdStatus) : "pending";
}

function asLabel(value: string, type: AdType): AdLabel {
  if (value === "Sponsored" || value === "Advertisement" || value === "Featured") return value;
  if (type === "banner") return "Advertisement";
  if (type === "featured_listing") return "Featured";
  return "Sponsored";
}

export function adTypeLabel(type: string) {
  return AD_TYPES.find((item) => item.id === type)?.label ?? type;
}

export function adPlacementLabel(placement: string) {
  return AD_PLACEMENTS.find((item) => item.id === placement)?.label ?? placement;
}

export function durationDays(duration: string) {
  const match = duration.match(/(\d+)/);
  const days = match ? Number(match[1]) : 30;
  return Number.isFinite(days) && days > 0 ? days : 30;
}

export function addDays(isoDate: string, days: number) {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return "";
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function campaignWindow(active: boolean, startDate: string, endDate: string, now = Date.now()) {
  if (!active) return "inactive" as const;
  const start = Date.parse(`${startDate}T00:00:00.000Z`);
  const end = Date.parse(`${endDate}T00:00:00.000Z`);
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return "inactive" as const;
  if (now < start) return "scheduled" as const;
  if (now >= end) return "completed" as const;
  return "active" as const;
}

export function defaultPlacement(type: AdType, preferred: AdPlacement): AdPlacement {
  if (type === "newsletter") return "newsletter";
  if (type === "category_sponsorship") return "category";
  if (type === "sponsored_guest_post") return "blog";
  if (type === "banner") return preferred === "newsletter" ? "homepage" : preferred;
  return "homepage";
}

export function defaultLabel(type: AdType): AdLabel {
  if (type === "banner") return "Advertisement";
  if (type === "featured_listing") return "Featured";
  return "Sponsored";
}

function mapRequest(id: string, data: Record<string, unknown>): AdRequest {
  const types = Array.isArray(data.advertisingTypes) ? data.advertisingTypes.map((item) => asType(text(item))) : [];
  return {
    id,
    requestId: text(data.requestId) || id,
    userId: text(data.userId),
    companyName: text(data.companyName),
    contactPerson: text(data.contactPerson),
    email: text(data.email),
    website: text(data.website),
    listingId: text(data.listingId),
    advertisingTypes: [...new Set(types)],
    placement: asPlacement(text(data.placement)),
    categorySlug: text(data.categorySlug),
    startDate: text(data.startDate),
    duration: text(data.duration),
    description: text(data.description),
    creativeUrl: text(data.creativeUrl) || null,
    destinationUrl: text(data.destinationUrl),
    additionalRequirements: text(data.additionalRequirements),
    guestPostRef: text(data.guestPostRef),
    status: asStatus(text(data.status)),
    adminNotes: text(data.adminNotes),
    createdAt: asIso(data.createdAt),
    updatedAt: asIso(data.updatedAt),
  };
}

function mapCampaign(id: string, data: Record<string, unknown>): AdCampaign {
  const type = asType(text(data.type));
  const active = data.active === true;
  const startDate = text(data.startDate);
  const endDate = text(data.endDate);
  const computed = campaignWindow(active, startDate, endDate);
  const stored = text(data.status);
  return {
    id,
    campaignId: text(data.campaignId) || id,
    requestId: text(data.requestId),
    type,
    companyName: text(data.companyName),
    title: text(data.title),
    description: text(data.description),
    creativeUrl: text(data.creativeUrl) || null,
    destinationUrl: text(data.destinationUrl),
    placement: asPlacement(text(data.placement)),
    categorySlug: text(data.categorySlug),
    label: asLabel(text(data.label), type),
    active,
    status: stored === "completed" ? "completed" : computed,
    requestStatus: asStatus(text(data.requestStatus)),
    startDate,
    endDate,
    guestPostId: text(data.guestPostId),
    listingId: text(data.listingId),
    impressions: typeof data.impressions === "number" ? data.impressions : 0,
    clicks: typeof data.clicks === "number" ? data.clicks : 0,
    createdAt: asIso(data.createdAt),
    updatedAt: asIso(data.updatedAt),
  };
}

export function isPublicCampaign(campaign: AdCampaign, now = Date.now()) {
  if (campaign.type === "newsletter" || campaign.placement === "newsletter") return false;
  if (!["approved", "scheduled", "active"].includes(campaign.requestStatus)) return false;
  return campaignWindow(campaign.active, campaign.startDate, campaign.endDate, now) === "active";
}

export function clickThroughRate(impressions: number, clicks: number) {
  if (impressions <= 0) return null;
  return (clicks / impressions) * 100;
}

export async function createAdRequest(input: AdRequestInput & { userId: string; creativeUrl: string | null }) {
  const db = getPublicDb();
  const ref = doc(collection(db, REQUESTS));
  const now = Timestamp.now();
  await setDoc(ref, {
    requestId: ref.id,
    userId: input.userId,
    companyName: input.companyName,
    contactPerson: input.contactPerson,
    email: input.email.toLowerCase(),
    website: input.website,
    listingId: input.listingId,
    advertisingTypes: input.advertisingTypes,
    placement: input.placement,
    categorySlug: input.categorySlug,
    startDate: input.startDate,
    duration: input.duration,
    description: input.description,
    creativeUrl: input.creativeUrl ?? "",
    destinationUrl: input.destinationUrl,
    additionalRequirements: input.additionalRequirements,
    guestPostRef: input.guestPostRef,
    status: "pending",
    adminNotes: "",
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
}

export async function listAdRequests(db: Firestore) {
  const snap = await getDocs(collection(db, REQUESTS));
  return snap.docs
    .map((item) => mapRequest(item.id, item.data()))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getAdRequest(db: Firestore, id: string) {
  const snap = await getDoc(doc(db, REQUESTS, id));
  if (!snap.exists()) return null;
  return mapRequest(snap.id, snap.data());
}

export async function listAdCampaigns(db: Firestore, requestId?: string) {
  const snap = requestId
    ? await getDocs(query(collection(db, CAMPAIGNS), where("requestId", "==", requestId)))
    : await getDocs(collection(db, CAMPAIGNS));
  return snap.docs
    .map((item) => mapCampaign(item.id, item.data()))
    .sort((a, b) => a.type.localeCompare(b.type));
}

export async function listAdDays(db: Firestore, campaignId: string) {
  const snap = await getDocs(query(collection(db, DAYS), where("campaignId", "==", campaignId)));
  return snap.docs
    .map((item) => {
      const data = item.data();
      return {
        id: item.id,
        campaignId: text(data.campaignId),
        day: text(data.day),
        impressions: typeof data.impressions === "number" ? data.impressions : 0,
        clicks: typeof data.clicks === "number" ? data.clicks : 0,
      } satisfies AdDay;
    })
    .sort((a, b) => b.day.localeCompare(a.day));
}

function campaignPayload(request: AdRequest, type: AdType, now: Timestamp) {
  const startDate = request.startDate;
  const endDate = addDays(startDate, durationDays(request.duration));
  return {
    requestId: request.id,
    type,
    companyName: request.companyName,
    title: request.companyName,
    description: request.description,
    creativeUrl: request.creativeUrl ?? "",
    destinationUrl: request.destinationUrl,
    placement: defaultPlacement(type, request.placement),
    categorySlug: type === "category_sponsorship" || request.placement === "category" ? request.categorySlug : "",
    label: defaultLabel(type),
    active: false,
    requestStatus: request.status,
    startDate,
    endDate,
    guestPostId: request.guestPostRef,
    listingId: request.listingId,
    impressions: 0,
    clicks: 0,
    createdAt: now,
    updatedAt: now,
  };
}

export async function ensureCampaigns(db: Firestore, request: AdRequest) {
  const existing = await listAdCampaigns(db, request.id);
  const have = new Set(existing.map((campaign) => campaign.type));
  const now = Timestamp.now();
  for (const type of request.advertisingTypes) {
    if (have.has(type)) continue;
    const ref = doc(collection(db, CAMPAIGNS));
    await setDoc(ref, { ...campaignPayload(request, type, now), campaignId: ref.id });
  }
  return listAdCampaigns(db, request.id);
}

export async function updateAdRequest(db: Firestore, id: string, patch: { status: AdStatus; adminNotes: string }) {
  await updateDoc(doc(db, REQUESTS, id), {
    status: patch.status,
    adminNotes: patch.adminNotes,
    updatedAt: Timestamp.now(),
  });
  const campaigns = await listAdCampaigns(db, id);
  await Promise.all(
    campaigns.map((campaign) =>
      updateDoc(doc(db, CAMPAIGNS, campaign.id), {
        requestStatus: patch.status,
        updatedAt: Timestamp.now(),
      }),
    ),
  );
}

export async function deactivateCampaigns(db: Firestore, requestId: string, completed: boolean) {
  const campaigns = await listAdCampaigns(db, requestId);
  await Promise.all(
    campaigns.map((campaign) =>
      updateDoc(doc(db, CAMPAIGNS, campaign.id), {
        active: false,
        status: completed ? "completed" : "inactive",
        requestStatus: completed ? "completed" : "rejected",
        updatedAt: Timestamp.now(),
      }),
    ),
  );
}

export async function saveCampaign(
  db: Firestore,
  id: string,
  input: {
    title: string;
    placement: AdPlacement;
    categorySlug: string;
    startDate: string;
    endDate: string;
    label: AdLabel;
    guestPostId: string;
    active: boolean;
    requestStatus: AdStatus;
  },
) {
  const status = campaignWindow(input.active, input.startDate, input.endDate);
  await updateDoc(doc(db, CAMPAIGNS, id), {
    title: input.title,
    placement: input.placement,
    categorySlug: input.categorySlug,
    startDate: input.startDate,
    endDate: input.endDate,
    label: input.label,
    guestPostId: input.guestPostId,
    active: status === "completed" ? false : input.active,
    status,
    requestStatus: input.requestStatus,
    updatedAt: Timestamp.now(),
  });
}

export async function rollupRequest(db: Firestore, requestId: string) {
  const request = await getAdRequest(db, requestId);
  if (!request) return;
  if (request.status === "pending" || request.status === "under_review" || request.status === "rejected") return;
  const campaigns = await listAdCampaigns(db, requestId);
  const windows = campaigns.map((campaign) => campaign.status);
  let status: AdStatus = "approved";
  if (windows.includes("active")) status = "active";
  else if (windows.includes("scheduled")) status = "scheduled";
  else if (campaigns.length > 0 && windows.every((item) => item === "completed")) status = "completed";
  if (status === request.status) return;
  await updateAdRequest(db, requestId, { status, adminNotes: request.adminNotes });
}

export async function refreshCampaignClocks(db: Firestore) {
  const campaigns = await listAdCampaigns(db);
  const touched = new Set<string>();
  for (const campaign of campaigns) {
    const next = campaignWindow(campaign.active, campaign.startDate, campaign.endDate);
    if (next === "completed" && campaign.active) {
      await updateDoc(doc(db, CAMPAIGNS, campaign.id), { active: false, status: "completed", updatedAt: Timestamp.now() });
      touched.add(campaign.requestId);
    }
  }
  for (const requestId of touched) {
    await rollupRequest(db, requestId);
  }
}

export async function removeAdRequest(db: Firestore, id: string) {
  const campaigns = await listAdCampaigns(db, id);
  await Promise.all(campaigns.map((campaign) => deleteDoc(doc(db, CAMPAIGNS, campaign.id))));
  await deleteDoc(doc(db, REQUESTS, id));
}

export async function getLiveCampaigns() {
  const db = getPublicDb();
  const snap = await getDocs(query(collection(db, CAMPAIGNS), where("active", "==", true)));
  return snap.docs.map((item) => mapCampaign(item.id, item.data())).filter((campaign) => isPublicCampaign(campaign));
}

export async function sponsoredGuestPostKeys() {
  const campaigns = await getLiveCampaigns();
  const keys = new Set<string>();
  for (const campaign of campaigns) {
    if (campaign.type !== "sponsored_guest_post" || !campaign.guestPostId) continue;
    keys.add(campaign.guestPostId);
  }
  return keys;
}

async function bumpDay(campaignId: string, field: "impressions" | "clicks") {
  const day = new Date().toISOString().slice(0, 10);
  const ref = doc(getPublicDb(), DAYS, `${campaignId}_${day}`);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      campaignId,
      day,
      impressions: field === "impressions" ? 1 : 0,
      clicks: field === "clicks" ? 1 : 0,
    });
    return;
  }
  await updateDoc(ref, { [field]: increment(1) });
}

async function claimVisitor(campaignId: string, visitorId: string, field: "lastImpression" | "lastClick", windowMs: number) {
  const db = getPublicDb();
  const ref = doc(db, VISITORS, `${campaignId}_${visitorId}`);
  const snap = await getDoc(ref);
  const now = Timestamp.now();
  if (snap.exists()) {
    const last = snap.data()[field];
    const lastMs = last instanceof Timestamp ? last.toDate().getTime() : 0;
    if (lastMs && Date.now() - lastMs < windowMs) return false;
    await updateDoc(ref, { [field]: now });
    return true;
  }
  await setDoc(ref, { campaignId, visitorId, [field]: now });
  return true;
}

export async function recordAdImpressions(ids: string[], visitorId: string) {
  const unique = [...new Set(ids)].slice(0, 12);
  const live = await getLiveCampaigns();
  const allowed = new Map(live.map((campaign) => [campaign.id, campaign]));
  let counted = 0;
  for (const id of unique) {
    if (!allowed.has(id)) continue;
    const fresh = await claimVisitor(id, visitorId, "lastImpression", IMPRESSION_WINDOW_MS);
    if (!fresh) continue;
    await updateDoc(doc(getPublicDb(), CAMPAIGNS, id), { impressions: increment(1) });
    await bumpDay(id, "impressions");
    counted += 1;
  }
  return counted;
}

export async function recordAdClick(id: string, visitorId: string) {
  const live = await getLiveCampaigns();
  const campaign = live.find((item) => item.id === id);
  if (!campaign) return null;
  const fresh = await claimVisitor(id, visitorId, "lastClick", CLICK_WINDOW_MS);
  if (fresh) {
    await updateDoc(doc(getPublicDb(), CAMPAIGNS, id), { clicks: increment(1) });
    await bumpDay(id, "clicks");
  }
  return campaign.destinationUrl;
}

import type { Firestore } from "firebase/firestore";
import { listingSchema, type ListingInput } from "@/lib/validators";
import { deleteLogo, saveGallery, saveLogo } from "@/lib/uploads";
import { findWebsiteOwner, getCategory, slugExists } from "@/lib/store";
import { buildSearchText, fieldErrorsFromZod, formString, slugify, websiteKey } from "@/lib/utils";
import type { ActionState } from "@/lib/types";

export function readListingForm(formData: FormData) {
  const parsed = listingSchema.safeParse({
    name: formString(formData, "name"),
    websiteUrl: formString(formData, "websiteUrl"),
    shortDescription: formString(formData, "shortDescription"),
    fullDescription: formString(formData, "fullDescription"),
    features: formString(formData, "features"),
    benefits: formString(formData, "benefits"),
    pricingDetails: formString(formData, "pricingDetails"),
    industry: formString(formData, "industry"),
    tags: formString(formData, "tags"),
    categoryId: formString(formData, "categoryId"),
    businessType: formString(formData, "businessType"),
    pricingModel: formString(formData, "pricingModel"),
    contactEmail: formString(formData, "contactEmail"),
    twitterUrl: formString(formData, "twitterUrl"),
    linkedinUrl: formString(formData, "linkedinUrl"),
    productHuntUrl: formString(formData, "productHuntUrl"),
    githubUrl: formString(formData, "githubUrl"),
    demoVideoUrl: formString(formData, "demoVideoUrl"),
  });

  if (!parsed.success) {
    return { ok: false as const, state: { fieldErrors: fieldErrorsFromZod(parsed.error) } satisfies ActionState };
  }

  return { ok: true as const, data: parsed.data };
}

export async function buildListingWrite(db: Firestore, input: ListingInput, owner: { name: string; email: string }) {
  const category = input.categoryId ? await getCategory(db, input.categoryId) : null;
  if (input.categoryId && !category) {
    return { ok: false as const, error: "Choose a valid category." };
  }

  let key = "";
  try {
    key = websiteKey(input.websiteUrl);
  } catch {
    return { ok: false as const, error: "Enter a valid website URL." };
  }

  const data = {
    name: input.name,
    websiteUrl: input.websiteUrl.trim(),
    websiteKey: key,
    shortDescription: input.shortDescription,
    fullDescription: input.fullDescription,
    features: input.features,
    benefits: input.benefits,
    pricingDetails: input.pricingDetails,
    industry: input.industry,
    tags: input.tags,
    categoryId: category?.id ?? "",
    businessType: input.businessType,
    pricingModel: input.pricingModel,
    contactEmail: input.contactEmail.toLowerCase(),
    twitterUrl: input.twitterUrl,
    linkedinUrl: input.linkedinUrl,
    productHuntUrl: input.productHuntUrl,
    githubUrl: input.githubUrl,
    demoVideoUrl: input.demoVideoUrl,
    ownerName: owner.name,
    ownerEmail: owner.email.toLowerCase(),
    searchText: buildSearchText([
      input.name,
      input.shortDescription,
      input.fullDescription,
      input.features,
      input.benefits,
      input.tags,
      input.industry,
      input.websiteUrl,
      input.githubUrl,
      input.demoVideoUrl,
      key,
      category?.name ?? "",
      input.businessType,
      input.pricingModel,
      owner.name,
      owner.email,
    ]),
  };

  return { ok: true as const, key, data };
}

export async function createUniqueSlug(db: Firestore, name: string) {
  const base = slugify(name);
  let slug = base;
  let count = 2;

  while (await slugExists(db, slug)) {
    slug = `${base.slice(0, 54)}-${count}`;
    count += 1;
    if (count > 50) throw new Error("SLUG_TAKEN");
  }

  return slug;
}

export async function resolveGallery(formData: FormData, current: string[]) {
  const remove = formString(formData, "removeGallery") === "on";
  const uploaded = await saveGallery(formData.getAll("gallery"));
  if (uploaded.error) return { error: uploaded.error, urls: current };
  if (uploaded.urls.length > 0) {
    await Promise.all(current.map((url) => deleteLogo(url)));
    return { urls: uploaded.urls };
  }
  if (remove) {
    await Promise.all(current.map((url) => deleteLogo(url)));
    return { urls: [] as string[] };
  }
  return { urls: current };
}

export async function resolveLogo(formData: FormData, currentUrl: string | null) {
  const uploaded = await saveLogo(formData.get("logo"));
  if (uploaded.error) return { error: uploaded.error, url: currentUrl };

  const remove = formString(formData, "removeLogo") === "on";
  if (uploaded.url) {
    await deleteLogo(currentUrl);
    return { url: uploaded.url };
  }

  if (remove) {
    await deleteLogo(currentUrl);
    return { url: null };
  }

  return { url: currentUrl };
}

export async function findDuplicateWebsite(db: Firestore, key: string, ignoreId?: string) {
  return findWebsiteOwner(db, key, ignoreId);
}

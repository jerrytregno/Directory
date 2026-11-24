"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { withUserFirestore } from "@/lib/request-db";
import { buildListingWrite, findDuplicateWebsite, readListingForm, resolveGallery, resolveLogo } from "@/lib/listing-data";
import {
  countListings,
  deleteCategory as removeCategory,
  deleteListing,
  getCategory,
  getListing,
  isPermissionDenied,
  listCategories,
  updateListing,
  upsertCategory,
} from "@/lib/store";
import { deleteLogo } from "@/lib/uploads";
import type { ActionState } from "@/lib/types";
import { formString, isUniqueConflict, safeNextPath, slugify } from "@/lib/utils";
import { categorySchema } from "@/lib/validators";

function refresh() {
  revalidatePath("/", "layout");
}

function goBack(formData: FormData, fallback: string, key = "updated") {
  const next = safeNextPath(formString(formData, "returnTo"), fallback);
  const [path, query] = next.split("?");
  const params = new URLSearchParams(query ?? "");
  params.set(key, "1");
  redirect(`${path}?${params.toString()}`);
}

function saveError(error: unknown): ActionState | null {
  if (isUniqueConflict(error)) {
    return { fieldErrors: { websiteUrl: "A listing for this website already exists." } };
  }
  if (isPermissionDenied(error)) {
    return { error: "Firestore rejected this change. Publish the SaaSListingHub security rules, then try again." };
  }
  return null;
}

export async function approveListing(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  const listing = await withUserFirestore(async (db) => {
    const existing = await getListing(db, id);
    if (!existing) return null;
    await updateListing(db, id, { status: "approved", rejectionNote: "" });
    return existing;
  });
  if (!listing) redirect("/admin?error=Listing%20not%20found");
  refresh();
  goBack(formData, "/admin");
}

export async function rejectListing(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  const listing = await withUserFirestore(async (db) => {
    const existing = await getListing(db, id);
    if (!existing) return null;
    await updateListing(db, id, {
      status: "rejected",
      featured: false,
      rejectionNote: formString(formData, "note").trim().slice(0, 500),
    });
    return existing;
  });
  if (!listing) redirect("/admin?error=Listing%20not%20found");
  refresh();
  goBack(formData, "/admin");
}

export async function toggleFeatured(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  const listing = await withUserFirestore((db) => getListing(db, id));
  if (!listing) redirect("/admin?error=Listing%20not%20found");
  if (listing.status !== "approved") {
    redirect("/admin?error=Only%20approved%20listings%20can%20be%20featured");
  }
  await withUserFirestore((db) => updateListing(db, id, { featured: !listing.featured }));
  refresh();
  goBack(formData, "/admin");
}

export async function adminDeleteListing(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  const listing = await withUserFirestore((db) => deleteListing(db, id));
  if (!listing) redirect("/admin?error=Listing%20not%20found");
  await deleteLogo(listing.logoUrl);
  await Promise.all(listing.gallery.map((url) => deleteLogo(url)));
  refresh();
  goBack(formData, "/admin", "deleted");
}

export async function adminUpdateListing(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = formString(formData, "id");
  const parsed = readListingForm(formData);
  if (!parsed.ok) return parsed.state;

  const result = await withUserFirestore(async (db) => {
    const existing = await getListing(db, id);
    if (!existing) return { ok: false as const, state: { error: "Listing not found." } satisfies ActionState };

    const built = await buildListingWrite(db, parsed.data, { name: existing.ownerName, email: existing.ownerEmail });
    if (!built.ok) return { ok: false as const, state: { error: built.error } satisfies ActionState };

    if (await findDuplicateWebsite(db, built.key, existing.id)) {
      return {
        ok: false as const,
        state: { fieldErrors: { websiteUrl: "A listing for this website already exists." } } satisfies ActionState,
      };
    }

    const logo = await resolveLogo(formData, existing.logoUrl);
    if (logo.error) return { ok: false as const, state: { fieldErrors: { logo: logo.error } } satisfies ActionState };
    const gallery = await resolveGallery(formData, existing.gallery);
    if (gallery.error) return { ok: false as const, state: { fieldErrors: { gallery: gallery.error } } satisfies ActionState };

    const statusRaw = formString(formData, "status");
    const status =
      statusRaw === "pending" || statusRaw === "approved" || statusRaw === "rejected" ? statusRaw : existing.status;
    const featured = formString(formData, "featured") === "on" && status === "approved";
    const verified = formString(formData, "verified") === "on";
    const rejectionNote = status === "rejected" ? formString(formData, "rejectionNote").trim().slice(0, 500) : "";

    try {
      await updateListing(db, existing.id, {
        ...built.data,
        logoUrl: logo.url,
        gallery: gallery.urls,
        status,
        featured,
        verified,
        rejectionNote,
      });
    } catch (error) {
      const state = saveError(error);
      if (state) return { ok: false as const, state };
      throw error;
    }

    return { ok: true as const };
  });

  if (!result.ok) return result.state;
  refresh();
  redirect("/admin?updated=1");
}

export async function createCategory(formData: FormData) {
  await requireAdmin();
  const parsed = categorySchema.safeParse({
    name: formString(formData, "name"),
    description: formString(formData, "description"),
  });
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Check the category fields.";
    redirect(`/admin/categories?error=${encodeURIComponent(message)}`);
  }

  await withUserFirestore(async (db) => {
    const categories = await listCategories(db);
    if (categories.some((category) => category.name.toLowerCase() === parsed.data.name.toLowerCase())) {
      redirect(`/admin/categories?error=${encodeURIComponent("A category with that name already exists.")}`);
    }

    const base = slugify(parsed.data.name);
    const slugs = new Set(categories.map((category) => category.slug));
    let slug = base;
    let count = 2;
    while (slugs.has(slug)) {
      slug = `${base}-${count}`;
      count += 1;
    }

    const sortOrder = categories.reduce((max, category) => Math.max(max, category.sortOrder), 0) + 1;
    await upsertCategory(db, {
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      sortOrder,
    });
  });

  refresh();
  redirect("/admin/categories?saved=1");
}

export async function updateCategory(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  const parsed = categorySchema.safeParse({
    name: formString(formData, "name"),
    description: formString(formData, "description"),
  });
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Check the category fields.";
    redirect(`/admin/categories?error=${encodeURIComponent(message)}`);
  }

  await withUserFirestore(async (db) => {
    const categories = await listCategories(db);
    const current = categories.find((category) => category.id === id);
    if (!current) redirect(`/admin/categories?error=${encodeURIComponent("Category not found.")}`);

    const clash = categories.some(
      (category) => category.id !== id && category.name.toLowerCase() === parsed.data.name.toLowerCase(),
    );
    if (clash) redirect(`/admin/categories?error=${encodeURIComponent("A category with that name already exists.")}`);

    await upsertCategory(db, {
      name: parsed.data.name,
      slug: current.slug,
      description: parsed.data.description,
      sortOrder: current.sortOrder,
    });
  });

  refresh();
  redirect("/admin/categories?saved=1");
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");

  await withUserFirestore(async (db) => {
    const category = await getCategory(db, id);
    if (!category) redirect(`/admin/categories?error=${encodeURIComponent("Category not found.")}`);

    const total = (await listCategories(db)).length;
    if (total <= 1) {
      redirect(`/admin/categories?error=${encodeURIComponent("Keep at least one category.")}`);
    }
    const used = await countListings(db, id);
    if (used > 0) {
      redirect(
        `/admin/categories?error=${encodeURIComponent("Move or delete listings in this category before deleting it.")}`,
      );
    }

    await removeCategory(db, id);
  });

  refresh();
  redirect("/admin/categories?deleted=1");
}

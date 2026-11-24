"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { withUserFirestore } from "@/lib/request-db";
import { buildListingWrite, createUniqueSlug, findDuplicateWebsite, readListingForm, resolveGallery, resolveLogo } from "@/lib/listing-data";
import { deleteListing, getListing, insertListing, isPermissionDenied, updateListing } from "@/lib/store";
import { deleteLogo, saveRemoteLogo } from "@/lib/uploads";
import type { ActionState } from "@/lib/types";
import { formString, isUniqueConflict } from "@/lib/utils";

function refresh() {
  revalidatePath("/", "layout");
}

function saveError(error: unknown): ActionState | null {
  if (isUniqueConflict(error)) {
    return { fieldErrors: { websiteUrl: "A listing for this website already exists." } };
  }
  if (error instanceof Error && error.message === "SLUG_TAKEN") {
    return { error: "That name is too close to an existing listing. Try a slightly different name." };
  }
  if (isPermissionDenied(error)) {
    return { error: "Firestore rejected this change. Publish the SaaSListingHub security rules, then try again." };
  }
  return null;
}

export async function createListing(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session) redirect("/signup?next=/submit");

  const parsed = readListingForm(formData);
  if (!parsed.ok) return parsed.state;

  const result = await withUserFirestore(async (db) => {
    const built = await buildListingWrite(db, parsed.data, session);
    if (!built.ok) return { ok: false as const, state: { error: built.error } satisfies ActionState };

    if (await findDuplicateWebsite(db, built.key)) {
      return {
        ok: false as const,
        state: { fieldErrors: { websiteUrl: "A listing for this website already exists." } } satisfies ActionState,
      };
    }

    const logo = await resolveLogo(formData, null);
    if (logo.error) {
      return { ok: false as const, state: { fieldErrors: { logo: logo.error } } satisfies ActionState };
    }
    if (!logo.url) {
      const remote = await saveRemoteLogo(formString(formData, "scrapedLogoUrl"));
      if (remote.url) logo.url = remote.url;
    }
    const gallery = await resolveGallery(formData, []);
    if (gallery.error) {
      await deleteLogo(logo.url);
      return { ok: false as const, state: { fieldErrors: { gallery: gallery.error } } satisfies ActionState };
    }

    try {
      await insertListing(db, {
        ...built.data,
        slug: await createUniqueSlug(db, parsed.data.name),
        userId: session.id,
        logoUrl: logo.url,
        gallery: gallery.urls,
        status: "pending",
        featured: false,
      });
    } catch (error) {
      await deleteLogo(logo.url);
      await Promise.all(gallery.urls.map((url) => deleteLogo(url)));
      const state = saveError(error);
      if (state) return { ok: false as const, state };
      throw error;
    }

    return { ok: true as const };
  });

  if (!result.ok) return result.state;
  refresh();
  redirect("/submit?submitted=1");
}

export async function updateOwnListing(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session) redirect("/login?next=/submit");

  const id = formString(formData, "id");
  const parsed = readListingForm(formData);
  if (!parsed.ok) return parsed.state;

  const result = await withUserFirestore(async (db) => {
    const existing = await getListing(db, id);
    if (!existing || existing.userId !== session.id) return { ok: false as const, state: { error: "Listing not found." } };

    const built = await buildListingWrite(db, parsed.data, session);
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

    try {
      await updateListing(db, existing.id, {
        ...built.data,
        logoUrl: logo.url,
        gallery: gallery.urls,
        status: "pending",
        featured: false,
        rejectionNote: "",
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
  redirect("/submit?updated=1");
}

export async function deleteOwnListing(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login?next=/submit");

  const id = formString(formData, "id");
  const listing = await withUserFirestore(async (db) => {
    const existing = await getListing(db, id);
    if (!existing || existing.userId !== session.id) return null;
    await deleteListing(db, id);
    return existing;
  });

  if (!listing) {
    redirect("/submit?error=You%20can%20only%20delete%20your%20own%20listings");
  }

  await deleteLogo(listing.logoUrl);
  await Promise.all(listing.gallery.map((url) => deleteLogo(url)));
  refresh();
  redirect("/submit?deleted=1");
}

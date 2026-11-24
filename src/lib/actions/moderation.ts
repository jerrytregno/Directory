"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { listClaims, setClaimStatus, setReviewStatus } from "@/lib/community";
import { withUserFirestore } from "@/lib/request-db";
import { assignListingOwner, getUser } from "@/lib/store";
import { formString } from "@/lib/utils";

function refresh() {
  revalidatePath("/", "layout");
}

export async function moderateReview(formData: FormData) {
  await requireAdmin();
  const listingId = formString(formData, "listingId");
  const userId = formString(formData, "userId");
  const status = formString(formData, "status") === "hidden" ? "hidden" : "published";
  await withUserFirestore((db) => setReviewStatus(db, listingId, userId, status));
  refresh();
  redirect("/admin/reviews?updated=1");
}

export async function decideClaim(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  const decision = formString(formData, "decision");
  await withUserFirestore(async (db) => {
    const claims = await listClaims(db);
    const claim = claims.find((item) => item.id === id);
    if (!claim || claim.status === "approved") return;
    if (decision === "approve") {
      const user = await getUser(db, claim.userId);
      if (!user) return;
      const listing = await assignListingOwner(db, claim.listingId, user);
      if (!listing) return;
      await setClaimStatus(db, claim.id, "approved");
      return;
    }
    await setClaimStatus(db, claim.id, "rejected");
  });
  refresh();
  redirect("/admin/claims?updated=1");
}

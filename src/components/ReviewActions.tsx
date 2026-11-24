"use client";

import Link from "next/link";
import { useState } from "react";
import { adminDeleteListing, approveListing, rejectListing, toggleFeatured } from "@/lib/actions/admin";
import { ConfirmSubmitButton } from "@/components/DeleteListingButton";
import { buttonClass, buttonDangerClass, buttonSecondaryClass } from "@/lib/styles";

export function ReviewActions({
  id,
  slug,
  status,
  featured,
  returnTo,
}: {
  id: string;
  slug: string;
  status: string;
  featured: boolean;
  returnTo: string;
}) {
  const [rejecting, setRejecting] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status !== "approved" ? (
        <form action={approveListing}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="returnTo" value={returnTo} />
          <button type="submit" className={buttonClass}>
            Approve
          </button>
        </form>
      ) : null}
      {status !== "rejected" ? (
        rejecting ? (
          <form action={rejectListing} className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="returnTo" value={returnTo} />
            <input
              name="note"
              placeholder="Optional note to the submitter"
              className="h-10 w-56 rounded-full border border-line px-3 text-sm outline-none focus:border-pine"
            />
            <button type="submit" className={buttonDangerClass}>
              Confirm reject
            </button>
            <button type="button" className={buttonSecondaryClass} onClick={() => setRejecting(false)}>
              Cancel
            </button>
          </form>
        ) : (
          <button type="button" className={buttonDangerClass} onClick={() => setRejecting(true)}>
            Reject
          </button>
        )
      ) : null}
      {status === "approved" ? (
        <form action={toggleFeatured}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="returnTo" value={returnTo} />
          <button type="submit" className={buttonSecondaryClass}>
            {featured ? "Unfeature" : "Feature on homepage"}
          </button>
        </form>
      ) : null}
      <Link href={`/admin/listings/${id}/edit`} className={buttonSecondaryClass}>
        Edit
      </Link>
      <Link href={`/listing/${slug}`} className={buttonSecondaryClass}>
        View
      </Link>
      <ConfirmSubmitButton
        action={adminDeleteListing}
        id={id}
        returnTo={returnTo}
        label="Delete"
        confirm="Delete this listing? This cannot be undone."
        className={buttonDangerClass}
      />
    </div>
  );
}

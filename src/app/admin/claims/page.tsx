import type { Metadata } from "next";
import Link from "next/link";
import { Notice } from "@/components/Notice";
import { decideClaim } from "@/lib/actions/moderation";
import { requireAdmin } from "@/lib/auth";
import { listClaims } from "@/lib/community";
import { withUserFirestore } from "@/lib/request-db";
import { buttonClass, buttonSecondaryClass } from "@/lib/styles";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Ownership claims" };

export default async function AdminClaimsPage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const claims = await withUserFirestore((db) => listClaims(db));

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Ownership claims</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        Approving a claim gives that account control of the listing and marks it verified. The previous manager can no longer edit it.
      </p>
      {params.updated ? (
        <div className="mt-4">
          <Notice tone="success">Claim updated.</Notice>
        </div>
      ) : null}
      <ul className="mt-6 space-y-4">
        {claims.map((claim) => (
          <li key={claim.id} className="rounded-2xl border border-line bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{claim.claimantName}</p>
                <p className="text-sm text-muted">{claim.claimantEmail}</p>
              </div>
              <p className="text-sm font-semibold capitalize text-ink">{claim.status}</p>
            </div>
            <p className="mt-3 text-sm leading-6 text-stone-700">{claim.message}</p>
            <p className="mt-2 text-xs text-muted">
              Listing <Link className="text-pine hover:underline" href={`/listing/${claim.listingId}`}>{claim.listingId}</Link> · {formatDate(claim.createdAt)}
            </p>
            {claim.status === "pending" ? (
              <div className="mt-4 flex gap-2">
                <form action={decideClaim}>
                  <input type="hidden" name="id" value={claim.id} />
                  <input type="hidden" name="decision" value="approve" />
                  <button className={buttonClass}>Approve</button>
                </form>
                <form action={decideClaim}>
                  <input type="hidden" name="id" value={claim.id} />
                  <input type="hidden" name="decision" value="reject" />
                  <button className={buttonSecondaryClass}>Reject</button>
                </form>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      {claims.length === 0 ? <p className="mt-4 text-sm text-muted">No claims yet.</p> : null}
    </div>
  );
}

import type { Metadata } from "next";
import { Notice } from "@/components/Notice";
import { Pagination } from "@/components/Pagination";
import { ReviewActions } from "@/components/ReviewActions";
import { StatusBadge } from "@/components/StatusBadge";
import { getSession } from "@/lib/auth";
import { getAdminListings } from "@/lib/queries";
import { buttonClass, inputClass } from "@/lib/styles";
import { formatDate, listingPath, parsePage } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string; updated?: string; deleted?: string; error?: string }>;
}) {
  const session = await getSession();
  if (session?.role !== "admin") return null;

  const params = await searchParams;
  const result = await getAdminListings({
    q: params.q,
    status: params.status,
    page: parsePage(params.page),
  });
  const returnTo = `/admin${listingPath(
    { q: result.q || undefined, status: result.status || undefined },
    result.page,
  )}`;

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Submitted listings</h1>
      <p className="mt-2 text-sm text-muted">Every directory submission, including pending, approved, and rejected listings.</p>
      <div className="mt-6 space-y-3">
        {params.updated ? <Notice tone="success">Listing updated.</Notice> : null}
        {params.error ? <Notice tone="error">{params.error}</Notice> : null}
      </div>

      <form action="/admin" className="mt-6 grid gap-3 rounded-2xl border border-line bg-white p-4 md:grid-cols-[1fr_180px_auto]">
        <input className={inputClass} name="q" defaultValue={result.q} placeholder="Search submissions" aria-label="Search submissions" />
        <select className={inputClass} name="status" defaultValue={result.status} aria-label="Status">
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <button className={buttonClass} type="submit">
          Filter
        </button>
      </form>

      <ul className="mt-6 space-y-4">
        {result.listings.map((listing) => (
          <li key={listing.id} className="rounded-2xl border border-line bg-white p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-semibold">{listing.name}</h2>
              <StatusBadge status={listing.status} />
              {listing.featured ? <StatusBadge status="featured" /> : null}
            </div>
            <p className="mt-1 text-sm text-muted">
              {listing.user.email}
              {listing.category.name ? ` · ${listing.category.name}` : ""}
              {listing.businessType ? ` · ${listing.businessType}` : ""} · Added {formatDate(listing.createdAt)}
            </p>
            {listing.websiteUrl ? (
              <p className="mt-1 text-sm">
                <a href={listing.websiteUrl} className="font-medium text-pine hover:underline" target="_blank" rel="noreferrer">
                  {listing.websiteUrl}
                </a>
              </p>
            ) : null}
            <p className="mt-2 text-sm leading-6 text-stone-600">{listing.shortDescription}</p>
            <div className="mt-4">
              <ReviewActions
                id={listing.id}
                slug={listing.slug}
                status={listing.status}
                featured={listing.featured}
                returnTo={returnTo}
              />
            </div>
          </li>
        ))}
      </ul>
      {result.listings.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-line bg-white px-6 py-10 text-sm text-muted">
          {result.q || result.status ? "No submissions match these filters." : "No submissions yet."}
        </p>
      ) : null}
      <Pagination
        pathname="/admin"
        page={result.page}
        pages={result.pages}
        params={{ q: result.q || undefined, status: result.status || undefined }}
      />
    </div>
  );
}

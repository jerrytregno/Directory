import type { Metadata } from "next";
import Link from "next/link";
import { Notice } from "@/components/Notice";
import { StatusBadge } from "@/components/StatusBadge";
import { adTypeLabel, clickThroughRate, listAdCampaigns, listAdRequests, refreshCampaignClocks, AD_STATUSES } from "@/lib/ads";
import { requireAdmin } from "@/lib/auth";
import { withUserFirestore } from "@/lib/request-db";
import { buttonSecondaryClass, inputClass } from "@/lib/styles";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Advertising" };

export default async function AdminAdvertisingPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; deleted?: string; error?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const status = AD_STATUSES.includes(params.status as (typeof AD_STATUSES)[number]) ? params.status : "";
  const { requests, campaigns } = await withUserFirestore(async (db) => {
    await refreshCampaignClocks(db);
    const [requests, campaigns] = await Promise.all([listAdRequests(db), listAdCampaigns(db)]);
    return { requests, campaigns };
  });
  const visible = status ? requests.filter((request) => request.status === status) : requests;

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Advertising</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        Review enquiries and turn campaigns on by hand. Public pages only show a campaign that is approved, active, and inside its dates.
      </p>
      <div className="mt-6 space-y-3">
        {params.deleted ? <Notice tone="success">Advertising request deleted.</Notice> : null}
        {params.error ? <Notice tone="error">{params.error}</Notice> : null}
      </div>
      <form action="/admin/advertising" className="mt-6 flex flex-wrap items-center gap-3">
        <select name="status" defaultValue={status ?? ""} className={`${inputClass} max-w-xs`} aria-label="Status">
          <option value="">All statuses</option>
          {AD_STATUSES.map((item) => (
            <option key={item} value={item}>
              {item.replaceAll("_", " ")}
            </option>
          ))}
        </select>
        <button className={buttonSecondaryClass} type="submit">
          Filter
        </button>
      </form>
      <ul className="mt-6 space-y-4">
        {visible.map((request) => {
          const related = campaigns.filter((campaign) => campaign.requestId === request.id);
          const impressions = related.reduce((sum, campaign) => sum + campaign.impressions, 0);
          const clicks = related.reduce((sum, campaign) => sum + campaign.clicks, 0);
          const rate = clickThroughRate(impressions, clicks);
          return (
            <li key={request.id} className="rounded-2xl border border-line bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{request.companyName}</h2>
                  <p className="mt-1 text-sm text-muted">
                    {request.contactPerson} · {request.email}
                  </p>
                </div>
                <StatusBadge status={request.status} />
              </div>
              <p className="mt-3 text-sm text-muted">{request.advertisingTypes.map(adTypeLabel).join(", ")}</p>
              <p className="mt-2 text-sm text-muted">
                Added {formatDate(request.createdAt)} · {impressions} impressions · {clicks} clicks · {rate === null ? "CTR —" : `${rate.toFixed(1)}% CTR`}
              </p>
              <Link href={`/admin/advertising/${request.id}`} className="mt-4 inline-flex text-sm font-semibold text-pine hover:underline">
                Review request
              </Link>
            </li>
          );
        })}
      </ul>
      {visible.length === 0 ? <p className="mt-6 text-sm text-muted">{status ? "No requests match this status." : "No advertising requests yet."}</p> : null}
    </div>
  );
}

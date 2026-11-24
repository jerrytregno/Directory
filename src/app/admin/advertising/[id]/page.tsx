import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmSubmitButton } from "@/components/DeleteListingButton";
import { Notice } from "@/components/Notice";
import { StatusBadge } from "@/components/StatusBadge";
import { deleteAdRequest, saveAdCampaign, saveAdRequest } from "@/lib/actions/ads";
import {
  AD_PLACEMENTS,
  AD_STATUSES,
  adPlacementLabel,
  adTypeLabel,
  clickThroughRate,
  getAdRequest,
  listAdCampaigns,
  listAdDays,
} from "@/lib/ads";
import { requireAdmin } from "@/lib/auth";
import { getPublicDb } from "@/lib/firebase-db";
import { withUserFirestore } from "@/lib/request-db";
import { listCategories as loadCategories } from "@/lib/store";
import { buttonClass, buttonDangerClass, buttonSecondaryClass, inputClass } from "@/lib/styles";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Advertising request" };

export default async function AdminAdvertisingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const query = await searchParams;
  const { request, campaigns, days } = await withUserFirestore(async (db) => {
    const request = await getAdRequest(db, id);
    if (!request) return { request: null, campaigns: [], days: [] as Awaited<ReturnType<typeof listAdDays>> };
    const campaigns = await listAdCampaigns(db, id);
    const days = (await Promise.all(campaigns.map((campaign) => listAdDays(db, campaign.id)))).flat();
    return { request, campaigns, days };
  });
  if (!request) notFound();
  const categories = await loadCategories(getPublicDb()).catch(() => []);

  return (
    <div>
      <Link href="/admin/advertising" className="text-sm font-semibold text-pine hover:underline">
        All advertising requests
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{request.companyName}</h1>
          <p className="mt-2 text-sm text-muted">
            {request.contactPerson} · {request.email}
          </p>
        </div>
        <StatusBadge status={request.status} />
      </div>
      <div className="mt-6 space-y-3">
        {query.saved ? <Notice tone="success">Advertising request saved.</Notice> : null}
        {query.error ? <Notice tone="error">{query.error}</Notice> : null}
      </div>

      <section className="mt-6 rounded-2xl border border-line bg-white p-5">
        <h2 className="text-lg font-semibold">Advertiser</h2>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted">Website</dt>
            <dd className="mt-1 break-all font-medium">{request.website}</dd>
          </div>
          <div>
            <dt className="text-muted">Destination</dt>
            <dd className="mt-1 break-all font-medium">{request.destinationUrl}</dd>
          </div>
          <div>
            <dt className="text-muted">Listing</dt>
            <dd className="mt-1 font-medium">{request.listingId || "None"}</dd>
          </div>
          <div>
            <dt className="text-muted">Preferred placement</dt>
            <dd className="mt-1 font-medium">{adPlacementLabel(request.placement)}</dd>
          </div>
          <div>
            <dt className="text-muted">Start and duration</dt>
            <dd className="mt-1 font-medium">
              {request.startDate} · {request.duration}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Submitted</dt>
            <dd className="mt-1 font-medium">{formatDate(request.createdAt)}</dd>
          </div>
        </dl>
        <p className="mt-4 text-sm leading-6 text-stone-700">{request.description}</p>
        {request.additionalRequirements ? <p className="mt-3 text-sm leading-6 text-muted">{request.additionalRequirements}</p> : null}
        <p className="mt-3 text-sm text-muted">{request.advertisingTypes.map(adTypeLabel).join(", ")}</p>
        {request.guestPostRef ? <p className="mt-2 text-sm text-muted">Article reference: {request.guestPostRef}</p> : null}
        {request.creativeUrl ? (
          <img src={request.creativeUrl} alt={`${request.companyName} creative`} className="mt-4 max-h-56 rounded-xl border border-line object-contain" />
        ) : (
          <p className="mt-4 text-sm text-muted">No creative was uploaded.</p>
        )}
      </section>

      <form action={saveAdRequest} className="mt-6 space-y-4 rounded-2xl border border-line bg-white p-5">
        <h2 className="text-lg font-semibold">Request status</h2>
        <input type="hidden" name="id" value={request.id} />
        <label className="block text-sm font-medium" htmlFor="status">
          Status
        </label>
        <select id="status" name="status" defaultValue={request.status} className={inputClass}>
          {AD_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status.replaceAll("_", " ")}
            </option>
          ))}
        </select>
        <label className="block text-sm font-medium" htmlFor="adminNotes">
          Admin notes
        </label>
        <textarea id="adminNotes" name="adminNotes" defaultValue={request.adminNotes} rows={4} maxLength={2000} className={inputClass} />
        <p className="text-sm text-muted">Approving prepares a campaign for each selected option. Scheduled and Active follow the campaign dates after you turn a campaign on.</p>
        <button className={buttonClass} type="submit">
          Save request
        </button>
      </form>

      <section className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold">Campaigns</h2>
        {campaigns.length === 0 ? <p className="text-sm text-muted">No campaigns yet. Approve the request to prepare them.</p> : null}
        {campaigns.map((campaign) => {
          const rate = clickThroughRate(campaign.impressions, campaign.clicks);
          const recent = days.filter((day) => day.campaignId === campaign.id).slice(0, 14);
          return (
            <form key={campaign.id} action={saveAdCampaign} className="space-y-4 rounded-2xl border border-line bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-semibold">{adTypeLabel(campaign.type)}</h3>
                <StatusBadge status={campaign.status} />
              </div>
              {campaign.type === "newsletter" ? (
                <p className="text-sm text-muted">Newsletter publishing stays off until SaaSListingHub has a newsletter. You can still set dates. This campaign is not shown on the website.</p>
              ) : null}
              <input type="hidden" name="campaignId" value={campaign.id} />
              <input type="hidden" name="requestId" value={request.id} />
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium">
                  Title
                  <input name="title" defaultValue={campaign.title} maxLength={80} className={`${inputClass} mt-1.5`} />
                </label>
                <label className="text-sm font-medium">
                  Label
                  <select name="label" defaultValue={campaign.label} className={`${inputClass} mt-1.5`}>
                    <option>Sponsored</option>
                    <option>Advertisement</option>
                    <option>Featured</option>
                  </select>
                </label>
                <label className="text-sm font-medium">
                  Placement
                  <select name="placement" defaultValue={campaign.placement} className={`${inputClass} mt-1.5`}>
                    {AD_PLACEMENTS.map((placement) => (
                      <option key={placement.id} value={placement.id}>
                        {placement.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-medium">
                  Category
                  <select name="categorySlug" defaultValue={campaign.categorySlug} className={`${inputClass} mt-1.5`}>
                    <option value="">Any category page</option>
                    {categories.map((category) => (
                      <option key={category.slug} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-medium">
                  Start date
                  <input name="startDate" type="date" required defaultValue={campaign.startDate} className={`${inputClass} mt-1.5`} />
                </label>
                <label className="text-sm font-medium">
                  End date
                  <input name="endDate" type="date" required defaultValue={campaign.endDate} className={`${inputClass} mt-1.5`} />
                </label>
                <label className="text-sm font-medium md:col-span-2">
                  Guest post id or slug
                  <input name="guestPostId" defaultValue={campaign.guestPostId} className={`${inputClass} mt-1.5`} />
                </label>
              </div>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" name="active" defaultChecked={campaign.active} className="h-4 w-4 accent-pine" />
                Campaign is active
              </label>
              <div className="rounded-xl bg-[#f6f6f4] px-4 py-3 text-sm">
                <p>
                  {campaign.impressions} impressions · {campaign.clicks} clicks · {rate === null ? "CTR —" : `${rate.toFixed(1)}% CTR`}
                </p>
                <p className="mt-1 text-muted">
                  {campaign.startDate || "No start"} to {campaign.endDate || "No end"}
                </p>
                {recent.length > 0 ? (
                  <ul className="mt-2 space-y-1 text-muted">
                    {recent.map((day) => (
                      <li key={day.id}>
                        {day.day}: {day.impressions} impressions, {day.clicks} clicks
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
              <button className={buttonSecondaryClass} type="submit">
                Save campaign
              </button>
            </form>
          );
        })}
      </section>

      <div className="mt-8">
        <ConfirmSubmitButton
          action={deleteAdRequest}
          id={request.id}
          label="Delete request"
          confirm={`Delete the advertising request from ${request.companyName}?`}
          className={buttonDangerClass}
        />
      </div>
    </div>
  );
}

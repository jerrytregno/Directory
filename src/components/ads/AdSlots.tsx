import { TrackImpressions } from "@/components/ads/TrackImpressions";
import { getLiveCampaigns, type AdCampaign } from "@/lib/ads";
import { buttonClass } from "@/lib/styles";

function Creative({ campaign, className }: { campaign: AdCampaign; className: string }) {
  if (!campaign.creativeUrl) {
    return <span className={`inline-flex items-center justify-center bg-mist text-sm font-bold text-pine ${className}`}>{campaign.companyName.slice(0, 1)}</span>;
  }
  return <img src={campaign.creativeUrl} alt="" className={`object-cover ${className}`} />;
}

function VisitLink({ campaign, className, children }: { campaign: AdCampaign; className?: string; children: React.ReactNode }) {
  return (
    <a href={`/api/ads/${campaign.id}`} className={className} rel="sponsored noopener">
      {children}
    </a>
  );
}

function PromoCard({ campaign }: { campaign: AdCampaign }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-line bg-white p-5">
      <span className="w-fit rounded-full bg-sand px-2.5 py-1 text-xs font-semibold text-ink">{campaign.label}</span>
      <div className="mt-4 flex items-center gap-3">
        <Creative campaign={campaign} className="h-12 w-12 rounded-xl" />
        <h3 className="text-lg font-bold tracking-tight">{campaign.title || campaign.companyName}</h3>
      </div>
      <p className="mt-3 flex-1 text-sm leading-6 text-muted">{campaign.description}</p>
      <VisitLink campaign={campaign} className={`${buttonClass} mt-5 w-fit`}>
        Visit Website
      </VisitLink>
    </article>
  );
}

function BannerCard({ campaign }: { campaign: AdCampaign }) {
  return (
    <VisitLink campaign={campaign} className="block overflow-hidden rounded-2xl border border-line bg-white">
      <span className="block px-4 pt-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">Advertisement</span>
      {campaign.creativeUrl ? (
        <img src={campaign.creativeUrl} alt={campaign.title || campaign.companyName} className="mt-3 h-36 w-full object-cover" />
      ) : (
        <div className="px-4 py-8">
          <p className="text-lg font-bold">{campaign.title || campaign.companyName}</p>
          <p className="mt-2 text-sm leading-6 text-muted">{campaign.description}</p>
        </div>
      )}
    </VisitLink>
  );
}

function SpotlightCard({ campaign }: { campaign: AdCampaign }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-line bg-white">
      <div className="grid gap-0 md:grid-cols-[280px_minmax(0,1fr)]">
        <div className="min-h-48 bg-mist">
          {campaign.creativeUrl ? (
            <img src={campaign.creativeUrl} alt={campaign.title || campaign.companyName} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full min-h-48 items-center justify-center text-3xl font-extrabold text-pine">{campaign.companyName.slice(0, 1)}</div>
          )}
        </div>
        <div className="p-6 sm:p-8">
          <span className="rounded-full bg-sand px-2.5 py-1 text-xs font-semibold text-ink">{campaign.label}</span>
          <h3 className="mt-4 text-2xl font-extrabold">{campaign.title || campaign.companyName}</h3>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted">{campaign.description}</p>
          <VisitLink campaign={campaign} className={`${buttonClass} mt-5`}>
            Visit Website
          </VisitLink>
        </div>
      </div>
    </article>
  );
}

export async function AdSlots({
  place,
  categorySlug = "",
  embedded = false,
}: {
  place: "homepage" | "directory" | "category" | "blog";
  categorySlug?: string;
  embedded?: boolean;
}) {
  const campaigns = (await getLiveCampaigns()).filter((campaign) => {
    if (campaign.type === "newsletter" || campaign.type === "sponsored_guest_post") return false;
    if (campaign.type === "category_sponsorship") return place === "category" && campaign.categorySlug === categorySlug;
    if (campaign.placement === "category") return place === "category" && (!campaign.categorySlug || campaign.categorySlug === categorySlug);
    return campaign.placement === place;
  });
  const banners = campaigns.filter((campaign) => campaign.type === "banner");
  const spotlights = campaigns.filter((campaign) => campaign.type === "product_spotlight");
  const cards = campaigns.filter((campaign) => campaign.type === "featured_listing" || campaign.type === "category_sponsorship");
  const visible = campaigns;
  if (visible.length === 0) return null;

  return (
    <section className={embedded ? "py-2" : "mx-auto w-full max-w-6xl px-4 py-8 sm:px-6"} aria-label="Sponsored placements">
      <TrackImpressions ids={visible.map((campaign) => campaign.id)} />
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Sponsored</p>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">These placements are advertisements. They are separate from organic directory listings and do not change ratings or reviews.</p>
      {spotlights.length > 0 ? (
        <div className="mt-5 space-y-4">
          {spotlights.map((campaign) => (
            <SpotlightCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      ) : null}
      {cards.length > 0 ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {cards.map((campaign) => (
            <PromoCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      ) : null}
      {banners.length > 0 ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {banners.map((campaign) => (
            <BannerCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

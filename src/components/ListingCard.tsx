import Link from "next/link";
import { ListingLogo } from "@/components/ListingLogo";
import type { ListingCardData } from "@/lib/queries";
import { domainFromUrl, toolPath, websiteLogoUrl } from "@/lib/utils";

export function ListingCard({ listing }: { listing: ListingCardData }) {
  const domain = domainFromUrl(listing.websiteUrl);
  const websiteHref = toolPath(listing.websiteUrl) ?? listing.websiteUrl;
  return (
    <article className="flex h-full flex-col rounded-2xl border border-line bg-white p-5 transition hover:-translate-y-0.5 hover:border-pine/40">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <ListingLogo name={listing.name} logoUrl={websiteLogoUrl(listing.websiteUrl)} />
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-ink">
              <Link href={`/listing/${listing.slug}`} className="hover:text-pine">
                {listing.name}
              </Link>
            </h3>
            <p className="mt-0.5 truncate text-sm text-muted">
              {[listing.category.name, listing.verified ? "Verified" : "", listing.ratingCount > 0 ? `${listing.ratingAverage} (${listing.ratingCount})` : ""].filter(Boolean).join(" · ")}
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-mist px-2.5 py-1 text-xs font-semibold text-pine">Free</span>
      </div>
      <p className="mt-4 line-clamp-2 flex-1 text-sm leading-6 text-stone-600">{listing.shortDescription}</p>
      <a href={websiteHref} className="mt-4 truncate text-xs font-medium text-pine hover:underline">
        {domain}
      </a>
    </article>
  );
}

export function ListingGrid({ listings }: { listings: ListingCardData[] }) {
  if (listings.length === 0) {
    return (
      <p className="rounded-[1.6rem] border border-dashed border-pine/25 bg-white/70 px-6 py-12 text-sm text-muted">
        No listings yet.
      </p>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}

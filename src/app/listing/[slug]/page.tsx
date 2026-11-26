import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookmarkButton, ClaimPanel, ReportReview, ReviewPanel, ShareButton, TrackView } from "@/components/ListingActions";
import { ListingGrid } from "@/components/ListingCard";
import { ListingLogo } from "@/components/ListingLogo";
import { Notice } from "@/components/Notice";
import { removeOwnReview } from "@/lib/actions/community";
import { getSession } from "@/lib/auth";
import { getReview, isBookmarked, listReviews } from "@/lib/community";
import { getPublicDb } from "@/lib/firebase-db";
import { getListingBySlug, getRelatedListings } from "@/lib/queries";
import { tryUserFirestore } from "@/lib/request-db";
import { buttonClass, buttonSecondaryClass } from "@/lib/styles";
import { domainFromUrl, formatDate, toolPath, websiteLogoUrl } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing || listing.status !== "approved") {
    return { title: "Listing", robots: { index: false, follow: false } };
  }
  return {
    title: listing.name,
    description: listing.shortDescription,
    alternates: { canonical: `/listing/${listing.slug}` },
  };
}

function lines(value: string) {
  return value.split("\n").map((line) => line.trim()).filter(Boolean);
}

export default async function ListingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [listing, session] = await Promise.all([getListingBySlug(slug), getSession()]);
  if (!listing) notFound();

  const canView = listing.status === "approved" || session?.role === "admin" || session?.id === listing.userId;
  if (!canView) notFound();

  const related = await getRelatedListings(listing.categoryId, listing.id);
  const reviews = listing.status === "approved" ? await listReviews(getPublicDb(), listing.id).catch(() => []) : [];
  const saved = session ? (await tryUserFirestore((db) => isBookmarked(db, session.id, listing.id))) ?? false : false;
  const mine = session ? await tryUserFirestore((db) => getReview(db, listing.id, session.id)) : null;
  const average = reviews.length ? Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length) * 10) / 10 : 0;
  const features = lines(listing.features);
  const products = lines(listing.products);
  const benefits = lines(listing.benefits);
  const tags = listing.tags.split(",").map((tag) => tag.trim()).filter(Boolean);
  const ownsListing = session?.id === listing.userId;
  const socials = [
    { label: "X", href: listing.twitterUrl },
    { label: "LinkedIn", href: listing.linkedinUrl },
    { label: "Product Hunt", href: listing.productHuntUrl },
    { label: "GitHub", href: listing.githubUrl },
    { label: "Demo video", href: listing.demoVideoUrl },
  ].filter((item) => item.href);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: listing.name,
    description: listing.shortDescription,
    url: listing.websiteUrl,
    ...(listing.category.name ? { applicationCategory: listing.category.name } : {}),
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      {listing.status === "approved" ? <TrackView slug={listing.slug} /> : null}
      {listing.status === "approved" ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      ) : null}
      {listing.category.name ? (
        <Link href={`/category/${listing.category.slug}`} className="text-sm font-semibold text-pine hover:underline">
          {listing.category.name}
        </Link>
      ) : null}
      {listing.status !== "approved" ? (
        <div className="mt-4">
          <Notice tone="info">
            This listing is {listing.status} and is not visible to the public.
            {listing.status === "rejected" && listing.rejectionNote ? ` Note: ${listing.rejectionNote}` : ""}
          </Notice>
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-[1.75rem] bg-white p-6 shadow-[0_16px_40px_rgba(22,20,28,0.06)] ring-1 ring-black/5 sm:p-8">
          <div className="flex items-start gap-4">
            <ListingLogo name={listing.name} logoUrl={websiteLogoUrl(listing.websiteUrl)} size="lg" />
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {listing.name}
                {listing.verified ? <span className="ml-3 align-middle rounded-full bg-mist px-2.5 py-1 text-xs font-semibold text-pine">Verified</span> : null}
              </h1>
              <p className="mt-2 text-sm text-muted">
                {[listing.businessType, "Free", listing.industry].filter(Boolean).join(" · ")}
                {reviews.length > 0 ? ` · ${average} from ${reviews.length} review${reviews.length === 1 ? "" : "s"}` : ""}
              </p>
              <p className="mt-1 text-sm text-muted">{listing.viewCount} profile views · {listing.uniqueVisitors} unique visitors</p>
            </div>
          </div>
          <p className="mt-6 text-lg leading-8 text-stone-700">{listing.shortDescription}</p>
          {tags.length > 0 ? (
            <ul className="mt-4 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <li key={tag} className="rounded-full bg-sand px-3 py-1 text-xs font-semibold text-ink">
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={toolPath(listing.websiteUrl) ?? listing.websiteUrl} className={buttonClass}>
              Visit website
            </a>
            {ownsListing ? (
              <Link href={`/profile/${listing.id}/edit`} className={buttonSecondaryClass}>
                Edit
              </Link>
            ) : null}
            {listing.status === "approved" ? (
              <>
                <BookmarkButton listingId={listing.id} slug={listing.slug} saved={saved} />
                <ShareButton slug={listing.slug} name={listing.name} />
              </>
            ) : null}
          </div>
          {listing.gallery.length > 0 ? (
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {listing.gallery.map((src) => (
                <img key={src} src={src} alt="" className="h-48 w-full rounded-2xl border border-line object-cover" />
              ))}
            </div>
          ) : null}
          {listing.fullDescription ? (
            <div className="mt-10">
              <h2 className="text-xl font-semibold">About</h2>
              <p className="mt-3 whitespace-pre-wrap text-base leading-7 text-stone-700">{listing.fullDescription}</p>
            </div>
          ) : null}
          {products.length > 0 ? (
            <div className="mt-10">
              <h2 className="text-xl font-semibold">Products</h2>
              <ul className="mt-4 space-y-2">
                {products.map((product) => (
                  <li key={product} className="flex gap-3 text-sm leading-6 text-stone-700">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-pine" />
                    {product}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {features.length > 0 ? (
            <div className="mt-10">
              <h2 className="text-xl font-semibold">Features</h2>
              <ul className="mt-4 space-y-2">
                {features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm leading-6 text-stone-700">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-pine" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {benefits.length > 0 ? (
            <div className="mt-10">
              <h2 className="text-xl font-semibold">Benefits</h2>
              <ul className="mt-4 space-y-2">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex gap-3 text-sm leading-6 text-stone-700">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-pine" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="mt-10">
            <h2 className="text-xl font-semibold">Pricing</h2>
            <p className="mt-3 text-base leading-7 text-stone-700">Free</p>
          </div>

          {listing.status === "approved" ? (
            <section className="mt-12">
              <h2 className="text-xl font-semibold">Reviews</h2>
              <ReviewPanel
                listingId={listing.id}
                slug={listing.slug}
                signedIn={Boolean(session)}
                canReview={!ownsListing}
                existing={mine && mine.status === "published" ? { rating: mine.rating, body: mine.body } : null}
              />
              <ul className="mt-6 space-y-4">
                {reviews.map((review) => (
                  <li key={review.id} className="rounded-2xl border border-line bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">{review.authorName}</p>
                      <p className="text-sm text-muted">{review.rating} / 5</p>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-stone-700">{review.body}</p>
                    <div className="mt-3 flex items-center gap-4">
                      {session?.id === review.userId ? (
                        <form action={removeOwnReview}>
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input type="hidden" name="slug" value={listing.slug} />
                          <button className="text-xs font-semibold text-rose">Delete</button>
                        </form>
                      ) : session ? (
                        <ReportReview listingId={listing.id} reviewId={review.id} slug={listing.slug} />
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
              {reviews.length === 0 ? <p className="mt-4 text-sm text-muted">No reviews yet.</p> : null}
            </section>
          ) : null}
        </div>

        <aside className="h-fit space-y-4">
          <div className="rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-black/5">
            <h2 className="text-sm font-semibold">Listing details</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="text-muted">Website</dt>
                <dd className="mt-1 break-all font-medium">
                  <a href={toolPath(listing.websiteUrl) ?? listing.websiteUrl} className="text-pine hover:underline">
                    {domainFromUrl(listing.websiteUrl)}
                  </a>
                </dd>
              </div>
              {listing.region ? (
                <div>
                  <dt className="text-muted">Region</dt>
                  <dd className="mt-1 font-medium">{listing.region}</dd>
                </div>
              ) : null}
              {listing.category.name ? (
                <div>
                  <dt className="text-muted">Category</dt>
                  <dd className="mt-1 font-medium">{listing.category.name}</dd>
                </div>
              ) : null}
              <div>
                <dt className="text-muted">Date added</dt>
                <dd className="mt-1 font-medium">
                  <time dateTime={listing.createdAt.toISOString()}>{formatDate(listing.createdAt)}</time>
                </dd>
              </div>
              <div>
                <dt className="text-muted">Pricing</dt>
                <dd className="mt-1 font-medium">Free</dd>
              </div>
              {listing.contactEmail ? (
                <div>
                  <dt className="text-muted">Contact</dt>
                  <dd className="mt-1 font-medium">
                    <a href={`mailto:${listing.contactEmail}`} className="text-pine hover:underline">
                      {listing.contactEmail}
                    </a>
                  </dd>
                </div>
              ) : null}
            </dl>
            {socials.length > 0 ? (
              <div className="mt-6 border-t border-line pt-4">
                <h3 className="text-sm font-semibold">Social</h3>
                <ul className="mt-3 space-y-2">
                  {socials.map((item) => (
                    <li key={item.label}>
                      <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-pine hover:underline">
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
          {listing.status === "approved" && !ownsListing ? (
            <div className="rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-black/5">
              <h2 className="text-sm font-semibold">Claim this business</h2>
              <p className="mt-2 text-sm leading-6 text-muted">Tell us why you should manage this listing. Approval is free and does not change the public page until an admin accepts it.</p>
              <ClaimPanel listingId={listing.id} slug={listing.slug} signedIn={Boolean(session)} />
            </div>
          ) : null}
        </aside>
      </div>

      {related.length > 0 ? (
        <section className="mt-16">
          <h2 className="text-2xl font-semibold tracking-tight">Related businesses</h2>
          <div className="mt-6">
            <ListingGrid listings={related} />
          </div>
        </section>
      ) : null}
    </div>
  );
}

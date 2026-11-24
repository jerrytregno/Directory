import type { Metadata } from "next";
import Link from "next/link";
import { AdRequestForm } from "@/components/ads/AdRequestForm";
import { Notice } from "@/components/Notice";
import { AD_TYPE_IDS, type AdType } from "@/lib/ads";
import { getPublicDb } from "@/lib/firebase-db";
import { listCategories, listListings } from "@/lib/store";
import { buttonSecondaryClass } from "@/lib/styles";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Request Advertising",
  description: "Send an advertising enquiry to SaaSListingHub. An admin reviews every request manually.",
  robots: { index: true, follow: true },
};

function isSample(email: string, website: string) {
  let host = "";
  try {
    host = new URL(website).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    host = "";
  }
  return email.toLowerCase().endsWith("@blazly.example") || host === "example" || host.endsWith(".example");
}

export default async function AdvertiseRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; type?: string }>;
}) {
  const params = await searchParams;
  const initial = AD_TYPE_IDS.includes(params.type as AdType) ? [params.type as AdType] : [];
  const db = getPublicDb();
  const [categories, listings] = await Promise.all([
    listCategories(db).catch(() => []),
    listListings(db, { status: "approved" }).catch(() => []),
  ]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <Link href="/advertise" className="text-sm font-semibold text-pine hover:underline">
        Advertise With Us
      </Link>
      <h1 className="mt-4 text-5xl font-extrabold tracking-tight">Request Advertising</h1>
      <p className="mt-4 text-base leading-7 text-muted">
        Tell SaaSListingHub what you want to promote. An admin reviews the enquiry, and a campaign appears in public only after it is approved and turned on.
      </p>
      {params.sent === "1" ? (
        <div className="mt-8 space-y-4">
          <Notice tone="success">Your advertising request has been sent. SaaSListingHub will review it manually. This form does not take payment.</Notice>
          <Link href="/advertise" className={buttonSecondaryClass}>
            Back to Advertising Opportunities
          </Link>
        </div>
      ) : (
        <AdRequestForm
          initialTypes={initial}
          categories={categories.map((category) => ({ slug: category.slug, name: category.name }))}
          listings={listings
            .filter((listing) => !isSample(listing.ownerEmail, listing.websiteUrl))
            .map((listing) => ({ id: listing.id, name: listing.name }))}
        />
      )}
    </div>
  );
}

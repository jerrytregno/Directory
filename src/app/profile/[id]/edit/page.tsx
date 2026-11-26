import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ListingForm, type ListingFormValues } from "@/components/ListingForm";
import { requireUser } from "@/lib/auth";
import { getCategories, getListingForEdit } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Edit listing",
  robots: { index: false, follow: false },
};

export default async function EditOwnListingPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireUser();
  const { id } = await params;
  const [listing, categories] = await Promise.all([getListingForEdit(id), getCategories()]);
  if (!listing || listing.userId !== session.id) notFound();

  const values: ListingFormValues = {
    id: listing.id,
    name: listing.name,
    websiteUrl: listing.websiteUrl,
    shortDescription: listing.shortDescription,
    fullDescription: listing.fullDescription,
    features: listing.features,
    products: listing.products,
    benefits: listing.benefits,
    region: listing.region,
    pricingDetails: listing.pricingDetails,
    industry: listing.industry,
    tags: listing.tags,
    gallery: listing.gallery,
    categoryId: listing.categoryId,
    businessType: listing.businessType,
    pricingModel: listing.pricingModel,
    contactEmail: listing.contactEmail,
    twitterUrl: listing.twitterUrl,
    linkedinUrl: listing.linkedinUrl,
    productHuntUrl: listing.productHuntUrl,
    githubUrl: listing.githubUrl,
    demoVideoUrl: listing.demoVideoUrl,
    logoUrl: listing.logoUrl,
    status: listing.status,
    featured: listing.featured,
    verified: listing.verified,
    rejectionNote: listing.rejectionNote,
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <Link href="/profile" className="text-sm font-semibold text-pine hover:underline">
        Back to profile
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Edit {listing.name}</h1>
      <p className="mt-3 text-base leading-7 text-muted">Update this product. Saving sends it back for review before it appears in the directory again.</p>
      <div className="mt-8">
        <ListingForm mode="owner" categories={categories} listing={values} />
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingForm, type ListingFormValues } from "@/components/ListingForm";
import { requireAdmin } from "@/lib/auth";
import { getCategories, getListingForEdit } from "@/lib/queries";

export const metadata: Metadata = { title: "Edit submission" };

export default async function AdminEditListingPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [listing, categories] = await Promise.all([getListingForEdit(id), getCategories()]);
  if (!listing) notFound();

  const values: ListingFormValues = {
    id: listing.id,
    name: listing.name,
    websiteUrl: listing.websiteUrl,
    shortDescription: listing.shortDescription,
    fullDescription: listing.fullDescription,
    features: listing.features,
    benefits: listing.benefits,
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
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">Edit submission</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        Admin edits keep the status you choose. Contact email for this listing: {listing.contactEmail || "not provided"}.
      </p>
      <div className="mt-8">
        <ListingForm mode="admin" categories={categories} listing={values} />
      </div>
    </div>
  );
}

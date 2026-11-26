"use client";

import { useActionState, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { adminUpdateListing } from "@/lib/actions/admin";
import { createListing, updateOwnListing } from "@/lib/actions/listings";
import { SCRAPE_DRAFT_KEY, type ScrapeDraft } from "@/components/ScrapeReview";
import { Field } from "@/components/Field";
import { ListingLogo } from "@/components/ListingLogo";
import { Notice } from "@/components/Notice";
import { INDUSTRIES } from "@/lib/constants";
import { buttonClass, inputClass } from "@/lib/styles";
import { initialActionState } from "@/lib/types";

export type ListingFormValues = {
  id: string;
  name: string;
  websiteUrl: string;
  shortDescription: string;
  fullDescription: string;
  features: string;
  products: string;
  benefits: string;
  region: string;
  pricingDetails: string;
  industry: string;
  tags: string;
  gallery: string[];
  categoryId: string;
  businessType: string;
  pricingModel: string;
  contactEmail: string;
  twitterUrl: string;
  linkedinUrl: string;
  productHuntUrl: string;
  githubUrl?: string;
  demoVideoUrl?: string;
  logoUrl: string | null;
  status: string;
  featured: boolean;
  verified?: boolean;
  rejectionNote: string;
};

export function ListingForm({
  mode,
  categories,
  listing,
  manual = false,
}: {
  mode: "create" | "owner" | "admin";
  categories: { id: string; name: string }[];
  listing?: ListingFormValues;
  manual?: boolean;
}) {
  const action = mode === "create" ? createListing : mode === "admin" ? adminUpdateListing : updateOwnListing;
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const [preview, setPreview] = useState<string | null>(listing?.logoUrl ?? null);
  const errors = state.fieldErrors ?? {};

  if (mode === "create" && !manual) {
    return <CreateListingForm />;
  }

  return (
    <form action={formAction} className="space-y-6 rounded-3xl border border-line bg-white p-5 sm:p-8">
      {listing ? <input type="hidden" name="id" value={listing.id} /> : null}
      {state.error ? <Notice tone="error">{state.error}</Notice> : null}
      {mode === "owner" ? (
        <Notice tone="info">
          Saving sends this listing back to pending. It stays off the public directory until an admin approves it again.
        </Notice>
      ) : null}
      {mode === "create" ? <Notice tone="info">Submission is free. Your listing stays pending until an admin approves it.</Notice> : null}

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Business / product name" htmlFor="name" error={errors.name}>
          <input id="name" name="name" required minLength={2} maxLength={80} defaultValue={listing?.name} className={inputClass} />
        </Field>
        <Field label="Website URL" htmlFor="websiteUrl" error={errors.websiteUrl} hint="The domain is used to block duplicate submissions.">
          <input id="websiteUrl" name="websiteUrl" type="url" required defaultValue={listing?.websiteUrl} placeholder="https://" className={inputClass} />
        </Field>
        <Field label="Category" htmlFor="categoryId" error={errors.categoryId}>
          <input
            id="categoryId"
            name="categoryId"
            defaultValue={categories.find((category) => category.id === listing?.categoryId)?.name ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Business type" htmlFor="businessType" error={errors.businessType}>
          <input id="businessType" name="businessType" maxLength={40} defaultValue={listing?.businessType ?? ""} className={inputClass} />
        </Field>
        <Field label="Region" htmlFor="region" error={errors.region} hint="Where the business is based, or the places it serves.">
          <input id="region" name="region" maxLength={80} defaultValue={listing?.region ?? ""} className={inputClass} />
        </Field>
        {mode === "admin" ? (
          <>
            <Field label="Industry" htmlFor="industry" error={errors.industry} hint="Optional. Kept for a later subcategory layer.">
              <select id="industry" name="industry" defaultValue={listing?.industry ?? ""} className={inputClass}>
                <option value="">Not set</option>
                {INDUSTRIES.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </Field>
          </>
        ) : null}
        <Field label="Contact email" htmlFor="contactEmail" error={errors.contactEmail} hint="Optional. Shown on the public listing so people can reach you.">
          <input id="contactEmail" name="contactEmail" type="email" defaultValue={listing?.contactEmail} className={inputClass} />
        </Field>
      </div>

      <Field label="Short description" htmlFor="shortDescription" error={errors.shortDescription} hint="20 to 180 characters. This appears on listing cards.">
        <textarea
          id="shortDescription"
          name="shortDescription"
          required
          minLength={20}
          maxLength={180}
          rows={3}
          defaultValue={listing?.shortDescription}
          className={inputClass}
        />
      </Field>
      <Field label="Detailed description" htmlFor="fullDescription" error={errors.fullDescription}>
        <textarea id="fullDescription" name="fullDescription" maxLength={5000} rows={6} defaultValue={listing?.fullDescription} className={inputClass} />
      </Field>
      <Field label="Products" htmlFor="products" error={errors.products} hint="Optional. Put one product or service on each line.">
        <textarea id="products" name="products" maxLength={2000} rows={5} defaultValue={listing?.products} className={inputClass} />
      </Field>
      <Field label="Features" htmlFor="features" error={errors.features} hint="Optional. Put one feature on each line.">
        <textarea id="features" name="features" maxLength={2000} rows={5} defaultValue={listing?.features} className={inputClass} />
      </Field>
      <Field label="Benefits" htmlFor="benefits" error={errors.benefits} hint="Optional. Put one benefit on each line.">
        <textarea id="benefits" name="benefits" maxLength={2000} rows={4} defaultValue={listing?.benefits} className={inputClass} />
      </Field>
      <Field label="Tags" htmlFor="tags" error={errors.tags} hint="Optional. Separate keywords with commas.">
        <input id="tags" name="tags" maxLength={200} defaultValue={listing?.tags} className={inputClass} />
      </Field>

      <div className="grid gap-5 md:grid-cols-3">
        <Field label="Twitter / X URL" htmlFor="twitterUrl" error={errors.twitterUrl}>
          <input id="twitterUrl" name="twitterUrl" type="url" defaultValue={listing?.twitterUrl} placeholder="https://" className={inputClass} />
        </Field>
        <Field label="LinkedIn URL" htmlFor="linkedinUrl" error={errors.linkedinUrl}>
          <input id="linkedinUrl" name="linkedinUrl" type="url" defaultValue={listing?.linkedinUrl} placeholder="https://" className={inputClass} />
        </Field>
        <Field label="Product Hunt URL" htmlFor="productHuntUrl" error={errors.productHuntUrl}>
          <input id="productHuntUrl" name="productHuntUrl" type="url" defaultValue={listing?.productHuntUrl} placeholder="https://" className={inputClass} />
        </Field>
        <Field label="GitHub repo URL" htmlFor="githubUrl" error={errors.githubUrl}>
          <input id="githubUrl" name="githubUrl" type="url" defaultValue={listing?.githubUrl} placeholder="https://" className={inputClass} />
        </Field>
        <Field label="Demo video URL" htmlFor="demoVideoUrl" error={errors.demoVideoUrl}>
          <input id="demoVideoUrl" name="demoVideoUrl" type="url" defaultValue={listing?.demoVideoUrl} placeholder="https://" className={inputClass} />
        </Field>
      </div>

      <Field label="Business logo" htmlFor="logo" error={errors.logo} hint="Optional. PNG, JPG, WEBP, or GIF up to 2MB.">
        <div className="flex flex-wrap items-center gap-4">
          {preview ? <ListingLogo name={listing?.name || "Listing"} logoUrl={preview} size="lg" /> : null}
          <input
            id="logo"
            name="logo"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-mist file:px-4 file:py-2 file:text-sm file:font-semibold file:text-pine"
            onChange={(event) => {
              const file = event.target.files?.[0];
              setPreview(file ? URL.createObjectURL(file) : listing?.logoUrl ?? null);
            }}
          />
        </div>
        {listing?.logoUrl ? (
          <label className="mt-3 flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" name="removeLogo" className="h-4 w-4 accent-pine" />
            Remove current logo
          </label>
        ) : null}
      </Field>
      <Field label="Screenshots" htmlFor="gallery" error={errors.gallery} hint="Optional. Up to 4 images, 2MB each.">
        {listing?.gallery?.length ? (
          <div className="mb-3 grid grid-cols-2 gap-2">
            {listing.gallery.map((src) => (
              <img key={src} src={src} alt="" className="h-24 w-full rounded-xl border border-line object-cover" />
            ))}
          </div>
        ) : null}
        <input id="gallery" name="gallery" type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple className="text-sm text-muted" />
        {listing?.gallery?.length ? (
          <label className="mt-3 flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" name="removeGallery" className="h-4 w-4 accent-pine" />
            Remove current screenshots
          </label>
        ) : null}
      </Field>

      {mode === "admin" && listing ? (
        <div className="grid gap-5 border-t border-line pt-6 md:grid-cols-2">
          <Field label="Status" htmlFor="status">
            <select id="status" name="status" defaultValue={listing.status} className={inputClass}>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </Field>
          <Field label="Rejection note" htmlFor="rejectionNote" hint="Shown to the submitter when the status is rejected.">
            <input id="rejectionNote" name="rejectionNote" defaultValue={listing.rejectionNote} className={inputClass} />
          </Field>
          <label className="flex items-center gap-2 text-sm font-medium text-ink md:col-span-2">
            <input type="checkbox" name="featured" defaultChecked={listing.featured} className="h-4 w-4 accent-pine" />
            Feature on the homepage. Only approved listings stay featured.
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-ink md:col-span-2">
            <input type="checkbox" name="verified" defaultChecked={listing.verified} className="h-4 w-4 accent-pine" />
            Show a verified badge.
          </label>
        </div>
      ) : null}

      <button type="submit" className={buttonClass} disabled={pending}>
        {pending ? "Saving..." : mode === "create" ? "Submit listing" : "Save listing"}
      </button>
    </form>
  );
}

function websiteAddress(value: string) {
  const trimmed = value.trim().replace(/\s/g, "");
  if (!trimmed) return "https://";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/+/, "")}`;
}

function CreateListingForm() {
  const router = useRouter();
  const [launchUrl, setLaunchUrl] = useState("https://");
  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState("");

  function updateWebsite(value: string) {
    if (!value.startsWith("http://") && !value.startsWith("https://")) {
      setLaunchUrl(websiteAddress(value));
      return;
    }
    setLaunchUrl(value);
  }

  async function readWebsite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const address = websiteAddress(launchUrl);
    let hostname = "";
    try {
      hostname = new URL(address).hostname;
    } catch {
      hostname = "";
    }
    if (!hostname || !hostname.includes(".")) {
      setScrapeError("Enter a website name after https://");
      setLaunchUrl(address === "https://" ? "https://" : address);
      return;
    }
    setLaunchUrl(address);
    setScraping(true);
    setScrapeError("");
    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: address }),
      });
      const data = (await response.json()) as {
        error?: string;
        name?: string;
        websiteUrl?: string;
        slogan?: string;
        description?: string;
        githubUrl?: string;
        demoVideoUrl?: string;
        twitterUrl?: string;
        linkedinUrl?: string;
        contactEmail?: string;
        logoUrl?: string;
        businessType?: string;
        industry?: string;
        region?: string;
        products?: string;
        benefits?: string;
        tags?: string;
        category?: string;
      };
      if (!response.ok) {
        setScrapeError(data.error || "Could not read that website.");
        return;
      }
      const draft: ScrapeDraft = {
        name: data.name || "",
        websiteUrl: data.websiteUrl || address,
        shortDescription: data.slogan || "",
        fullDescription: data.description || "",
        githubUrl: data.githubUrl || "",
        demoVideoUrl: data.demoVideoUrl || "",
        twitterUrl: data.twitterUrl || "",
        linkedinUrl: data.linkedinUrl || "",
        contactEmail: data.contactEmail || "",
        logoUrl: data.logoUrl || "",
        businessType: data.businessType || "",
        industry: data.industry || "",
        region: data.region || "",
        products: data.products || "",
        benefits: data.benefits || "",
        tags: data.tags || "",
        category: data.category || "",
      };
      sessionStorage.setItem(SCRAPE_DRAFT_KEY, JSON.stringify(draft));
      router.push("/submit/review");
    } catch {
      setScrapeError("Could not read that website.");
    } finally {
      setScraping(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-line bg-white p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-glow">Your website</p>
        <h2 className="mt-3 text-4xl font-extrabold tracking-tight">Add a site to SaaSListingHub</h2>
        <p className="mt-3 text-base leading-7 text-muted">Enter the address. We read the business, description, products, and region, then you can edit them.</p>
        <form noValidate onSubmit={readWebsite} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="launch-url">
            Website name
          </label>
          <input
            id="launch-url"
            type="text"
            inputMode="url"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            value={launchUrl}
            onChange={(event) => updateWebsite(event.target.value)}
            onFocus={(event) => {
              const end = event.currentTarget.value.length;
              event.currentTarget.setSelectionRange(end, end);
            }}
            className={`${inputClass} h-14 flex-1 rounded-2xl px-4 text-base`}
          />
          <button type="submit" className={`${buttonClass} h-14 rounded-2xl px-6`} disabled={scraping}>
            {scraping ? "Reading the site..." : "Continue"}
          </button>
        </form>
        {scrapeError ? <p className="mt-3 text-sm text-rose">{scrapeError}</p> : null}
        <Link href="/submit/manual" className="mt-4 inline-block text-sm font-semibold text-ink underline">
          Fill it in manually
        </Link>
      </section>
    </div>
  );
}
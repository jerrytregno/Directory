"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createListing } from "@/lib/actions/listings";
import { Field } from "@/components/Field";
import { ListingLogo } from "@/components/ListingLogo";
import { Notice } from "@/components/Notice";
import { buttonClass, buttonSecondaryClass, inputClass } from "@/lib/styles";
import { initialActionState } from "@/lib/types";

export const SCRAPE_DRAFT_KEY = "blazly-scrape-draft";

export type ScrapeDraft = {
  name: string;
  websiteUrl: string;
  shortDescription: string;
  fullDescription: string;
  githubUrl: string;
  demoVideoUrl: string;
  twitterUrl: string;
  linkedinUrl: string;
  contactEmail: string;
  logoUrl: string;
};

export function ScrapeReview() {
  const router = useRouter();
  const [draft, setDraft] = useState<ScrapeDraft | null>(null);
  const [state, formAction, pending] = useActionState(createListing, initialActionState);

  useEffect(() => {
    const raw = sessionStorage.getItem(SCRAPE_DRAFT_KEY);
    if (!raw) {
      router.replace("/submit");
      return;
    }
    try {
      setDraft(JSON.parse(raw) as ScrapeDraft);
    } catch {
      router.replace("/submit");
    }
  }, [router]);

  if (!draft) return null;

  const details = [
    { label: "Business / product name", name: "name", value: draft.name },
    { label: "Website URL", name: "websiteUrl", value: draft.websiteUrl },
    { label: "Short description", name: "shortDescription", value: draft.shortDescription },
    {
      label: "Detailed description",
      name: "fullDescription",
      value: draft.fullDescription.trim() && draft.fullDescription.trim() !== draft.shortDescription.trim() ? draft.fullDescription : "",
    },
    { label: "Contact email", name: "contactEmail", value: draft.contactEmail },
    { label: "GitHub repo URL", name: "githubUrl", value: draft.githubUrl },
    { label: "Demo video URL", name: "demoVideoUrl", value: draft.demoVideoUrl },
    { label: "Twitter / X URL", name: "twitterUrl", value: draft.twitterUrl },
    { label: "LinkedIn URL", name: "linkedinUrl", value: draft.linkedinUrl },
  ].filter((item) => item.value.trim());

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-3xl border border-line bg-white p-5 sm:p-8"
      onSubmit={() => sessionStorage.removeItem(SCRAPE_DRAFT_KEY)}
    >
      {state.error ? <Notice tone="error">{state.error}</Notice> : null}
      <Notice tone="info">These are the details found on the website. Submit them for admin review.</Notice>
      <input type="hidden" name="scrapedLogoUrl" value={draft.logoUrl} />
      <input type="hidden" name="categoryId" value="" />
      <input type="hidden" name="businessType" value="" />
      <input type="hidden" name="pricingModel" value="" />
      <input type="hidden" name="pricingDetails" value="" />
      <input type="hidden" name="industry" value="" />
      <input type="hidden" name="features" value="" />
      <input type="hidden" name="benefits" value="" />
      <input type="hidden" name="tags" value="" />
      <input type="hidden" name="productHuntUrl" value="" />
      {draft.fullDescription.trim() === draft.shortDescription.trim() ? <input type="hidden" name="fullDescription" value={draft.fullDescription} /> : null}

      {draft.logoUrl ? (
        <div>
          <p className="text-sm font-medium text-ink">Business logo</p>
          <div className="mt-2">
            <ListingLogo name={draft.name || "Listing"} logoUrl={draft.logoUrl} size="lg" />
          </div>
        </div>
      ) : null}

      {details.map((item) => (
        <Field key={item.name} label={item.label} htmlFor={item.name} error={state.fieldErrors?.[item.name]}>
          {item.name === "shortDescription" || item.name === "fullDescription" ? (
            <textarea id={item.name} name={item.name} rows={item.name === "shortDescription" ? 3 : 6} defaultValue={item.value} required={item.name === "shortDescription"} minLength={item.name === "shortDescription" ? 20 : undefined} maxLength={item.name === "shortDescription" ? 180 : 5000} className={inputClass} />
          ) : (
            <input id={item.name} name={item.name} type={item.name === "contactEmail" ? "email" : item.name === "name" ? "text" : "url"} required={item.name === "name" || item.name === "websiteUrl"} defaultValue={item.value} className={inputClass} />
          )}
        </Field>
      ))}

      <div className="flex flex-wrap gap-3">
        <button type="submit" className={buttonClass} disabled={pending}>
          {pending ? "Saving..." : "Submit listing"}
        </button>
        <button type="button" className={buttonSecondaryClass} onClick={() => router.push("/submit")}>
          Back
        </button>
      </div>
    </form>
  );
}

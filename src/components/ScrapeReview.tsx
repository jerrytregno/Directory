"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createListing } from "@/lib/actions/listings";
import { Field } from "@/components/Field";
import { ListingLogo } from "@/components/ListingLogo";
import { Notice } from "@/components/Notice";
import { INDUSTRIES } from "@/lib/constants";
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
  businessType: string;
  industry: string;
  region: string;
  products: string;
  benefits: string;
  tags: string;
  category: string;
};

const emptyDraft: ScrapeDraft = {
  name: "",
  websiteUrl: "",
  shortDescription: "",
  fullDescription: "",
  githubUrl: "",
  demoVideoUrl: "",
  twitterUrl: "",
  linkedinUrl: "",
  contactEmail: "",
  logoUrl: "",
  businessType: "",
  industry: "",
  region: "",
  products: "",
  benefits: "",
  tags: "",
  category: "",
};

function lines(value: string) {
  return value.split("\n").map((line) => line.trim()).filter(Boolean);
}

export function ScrapeReview() {
  const router = useRouter();
  const [draft, setDraft] = useState<ScrapeDraft | null>(null);
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(createListing, initialActionState);

  useEffect(() => {
    const raw = sessionStorage.getItem(SCRAPE_DRAFT_KEY);
    if (!raw) {
      router.replace("/submit");
      return;
    }
    try {
      const saved = JSON.parse(raw) as Partial<ScrapeDraft>;
      const next = { ...emptyDraft, ...saved };
      setDraft(next);
      if (next.shortDescription.trim().length < 20) setEditing(true);
    } catch {
      router.replace("/submit");
    }
  }, [router]);

  useEffect(() => {
    if (state.fieldErrors && Object.keys(state.fieldErrors).length > 0) setEditing(true);
  }, [state.fieldErrors]);

  if (!draft) return null;

  function update(key: keyof ScrapeDraft, value: string) {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  }

  const facts = [
    { label: "Business type", value: draft.businessType },
    { label: "Industry", value: draft.industry },
    { label: "Region", value: draft.region },
    { label: "Category", value: draft.category },
    { label: "Contact email", value: draft.contactEmail },
    { label: "Tags", value: draft.tags },
  ].filter((item) => item.value.trim());
  const products = lines(draft.products);
  const benefits = lines(draft.benefits);
  const links = [
    { label: "GitHub", value: draft.githubUrl },
    { label: "Demo video", value: draft.demoVideoUrl },
    { label: "Twitter / X", value: draft.twitterUrl },
    { label: "LinkedIn", value: draft.linkedinUrl },
  ].filter((item) => item.value.trim());

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-3xl border border-line bg-white p-5 sm:p-8"
      onSubmit={() => sessionStorage.removeItem(SCRAPE_DRAFT_KEY)}
    >
      {state.error ? <Notice tone="error">{state.error}</Notice> : null}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <Notice tone="info">These details were read from the website. Edit anything that should change, then submit it for review.</Notice>
        <button type="button" className={buttonSecondaryClass} onClick={() => setEditing((current) => !current)}>
          {editing ? "Done" : "Edit"}
        </button>
      </div>

      <input type="hidden" name="scrapedLogoUrl" value={draft.logoUrl} />
      <input type="hidden" name="pricingModel" value="" />
      <input type="hidden" name="pricingDetails" value="" />
      <input type="hidden" name="features" value="" />
      <input type="hidden" name="productHuntUrl" value="" />
      {editing ? null : (
        <>
          <input type="hidden" name="name" value={draft.name} />
          <input type="hidden" name="websiteUrl" value={draft.websiteUrl} />
          <input type="hidden" name="shortDescription" value={draft.shortDescription} />
          <input type="hidden" name="fullDescription" value={draft.fullDescription} />
          <input type="hidden" name="businessType" value={draft.businessType} />
          <input type="hidden" name="industry" value={draft.industry} />
          <input type="hidden" name="region" value={draft.region} />
          <input type="hidden" name="categoryId" value={draft.category} />
          <input type="hidden" name="products" value={draft.products} />
          <input type="hidden" name="benefits" value={draft.benefits} />
          <input type="hidden" name="tags" value={draft.tags} />
          <input type="hidden" name="contactEmail" value={draft.contactEmail} />
          <input type="hidden" name="githubUrl" value={draft.githubUrl} />
          <input type="hidden" name="demoVideoUrl" value={draft.demoVideoUrl} />
          <input type="hidden" name="twitterUrl" value={draft.twitterUrl} />
          <input type="hidden" name="linkedinUrl" value={draft.linkedinUrl} />
        </>
      )}

      <div className="flex items-start gap-4">
        {draft.logoUrl ? <ListingLogo name={draft.name || "Listing"} logoUrl={draft.logoUrl} size="lg" /> : null}
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold tracking-tight">{draft.name || "Untitled website"}</h2>
          <p className="mt-1 break-all text-sm text-pine">{draft.websiteUrl}</p>
        </div>
      </div>

      {editing ? (
        <div className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Business / product name" htmlFor="name" error={state.fieldErrors?.name}>
              <input id="name" name="name" required minLength={2} maxLength={80} value={draft.name} onChange={(event) => update("name", event.target.value)} className={inputClass} />
            </Field>
            <Field label="Website URL" htmlFor="websiteUrl" error={state.fieldErrors?.websiteUrl}>
              <input id="websiteUrl" name="websiteUrl" type="url" required value={draft.websiteUrl} onChange={(event) => update("websiteUrl", event.target.value)} className={inputClass} />
            </Field>
            <Field label="Business type" htmlFor="businessType" error={state.fieldErrors?.businessType}>
              <input id="businessType" name="businessType" maxLength={40} value={draft.businessType} onChange={(event) => update("businessType", event.target.value)} className={inputClass} />
            </Field>
            <Field label="Industry" htmlFor="industry" error={state.fieldErrors?.industry}>
              <select id="industry" name="industry" value={draft.industry} onChange={(event) => update("industry", event.target.value)} className={inputClass}>
                <option value="">Not set</option>
                {INDUSTRIES.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Region" htmlFor="region" error={state.fieldErrors?.region}>
              <input id="region" name="region" maxLength={80} value={draft.region} onChange={(event) => update("region", event.target.value)} className={inputClass} />
            </Field>
            <Field label="Category" htmlFor="categoryId" error={state.fieldErrors?.categoryId}>
              <input id="categoryId" name="categoryId" value={draft.category} onChange={(event) => update("category", event.target.value)} className={inputClass} />
            </Field>
            <Field label="Contact email" htmlFor="contactEmail" error={state.fieldErrors?.contactEmail}>
              <input id="contactEmail" name="contactEmail" type="email" value={draft.contactEmail} onChange={(event) => update("contactEmail", event.target.value)} className={inputClass} />
            </Field>
            <Field label="Tags" htmlFor="tags" error={state.fieldErrors?.tags} hint="Separate keywords with commas.">
              <input id="tags" name="tags" maxLength={200} value={draft.tags} onChange={(event) => update("tags", event.target.value)} className={inputClass} />
            </Field>
          </div>
          <Field label="Short description" htmlFor="shortDescription" error={state.fieldErrors?.shortDescription} hint="20 to 180 characters. This appears on listing cards.">
            <textarea id="shortDescription" name="shortDescription" required minLength={20} maxLength={180} rows={3} value={draft.shortDescription} onChange={(event) => update("shortDescription", event.target.value)} className={inputClass} />
          </Field>
          <Field label="Business description" htmlFor="fullDescription" error={state.fieldErrors?.fullDescription}>
            <textarea id="fullDescription" name="fullDescription" maxLength={5000} rows={6} value={draft.fullDescription} onChange={(event) => update("fullDescription", event.target.value)} className={inputClass} />
          </Field>
          <Field label="Products" htmlFor="products" error={state.fieldErrors?.products} hint="One product or service on each line.">
            <textarea id="products" name="products" maxLength={2000} rows={5} value={draft.products} onChange={(event) => update("products", event.target.value)} className={inputClass} />
          </Field>
          <Field label="Benefits" htmlFor="benefits" error={state.fieldErrors?.benefits} hint="One benefit on each line.">
            <textarea id="benefits" name="benefits" maxLength={2000} rows={4} value={draft.benefits} onChange={(event) => update("benefits", event.target.value)} className={inputClass} />
          </Field>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="GitHub repo URL" htmlFor="githubUrl" error={state.fieldErrors?.githubUrl}>
              <input id="githubUrl" name="githubUrl" type="url" value={draft.githubUrl} onChange={(event) => update("githubUrl", event.target.value)} className={inputClass} />
            </Field>
            <Field label="Demo video URL" htmlFor="demoVideoUrl" error={state.fieldErrors?.demoVideoUrl}>
              <input id="demoVideoUrl" name="demoVideoUrl" type="url" value={draft.demoVideoUrl} onChange={(event) => update("demoVideoUrl", event.target.value)} className={inputClass} />
            </Field>
            <Field label="Twitter / X URL" htmlFor="twitterUrl" error={state.fieldErrors?.twitterUrl}>
              <input id="twitterUrl" name="twitterUrl" type="url" value={draft.twitterUrl} onChange={(event) => update("twitterUrl", event.target.value)} className={inputClass} />
            </Field>
            <Field label="LinkedIn URL" htmlFor="linkedinUrl" error={state.fieldErrors?.linkedinUrl}>
              <input id="linkedinUrl" name="linkedinUrl" type="url" value={draft.linkedinUrl} onChange={(event) => update("linkedinUrl", event.target.value)} className={inputClass} />
            </Field>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {draft.shortDescription ? <p className="text-lg leading-8 text-ink">{draft.shortDescription}</p> : null}
          {facts.length > 0 ? (
            <dl className="grid gap-4 sm:grid-cols-2">
              {facts.map((item) => (
                <div key={item.label}>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{item.label}</dt>
                  <dd className="mt-1 text-sm leading-6 text-ink">{item.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {draft.fullDescription && draft.fullDescription.trim() !== draft.shortDescription.trim() ? (
            <div>
              <h3 className="text-sm font-semibold">Business description</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink">{draft.fullDescription}</p>
            </div>
          ) : null}
          {products.length > 0 ? (
            <div>
              <h3 className="text-sm font-semibold">Products</h3>
              <ul className="mt-2 space-y-1">
                {products.map((product) => (
                  <li key={product} className="text-sm leading-6 text-ink">
                    {product}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {benefits.length > 0 ? (
            <div>
              <h3 className="text-sm font-semibold">Benefits</h3>
              <ul className="mt-2 space-y-1">
                {benefits.map((benefit) => (
                  <li key={benefit} className="text-sm leading-6 text-ink">
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {links.length > 0 ? (
            <div>
              <h3 className="text-sm font-semibold">Links</h3>
              <ul className="mt-2 space-y-1">
                {links.map((link) => (
                  <li key={link.label} className="break-all text-sm leading-6">
                    <span className="font-medium text-ink">{link.label}: </span>
                    <span className="text-pine">{link.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}

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

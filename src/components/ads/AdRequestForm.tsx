"use client";

import { useActionState } from "react";
import { Field } from "@/components/Field";
import { Notice } from "@/components/Notice";
import { submitAdRequest } from "@/lib/actions/ads";
import { AD_DURATIONS, AD_PLACEMENTS, AD_TYPES, type AdType } from "@/lib/ads";
import { buttonClass, inputClass } from "@/lib/styles";
import { initialActionState } from "@/lib/types";

export function AdRequestForm({
  categories,
  listings,
  initialTypes,
}: {
  categories: { slug: string; name: string }[];
  listings: { id: string; name: string }[];
  initialTypes: AdType[];
}) {
  const [state, action, pending] = useActionState(submitAdRequest, initialActionState);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={action} className="mt-8 space-y-6 rounded-3xl border border-line bg-white p-5 sm:p-8">
      {state.error ? <Notice tone="error">{state.error}</Notice> : null}
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Company / Business Name" htmlFor="companyName" error={errors.companyName}>
          <input id="companyName" name="companyName" required maxLength={80} className={inputClass} />
        </Field>
        <Field label="Contact Person" htmlFor="contactPerson" error={errors.contactPerson}>
          <input id="contactPerson" name="contactPerson" required maxLength={80} className={inputClass} />
        </Field>
        <Field label="Business Email" htmlFor="email" error={errors.email}>
          <input id="email" name="email" type="email" required maxLength={160} className={inputClass} />
        </Field>
        <Field label="Website URL" htmlFor="website" error={errors.website}>
          <input id="website" name="website" type="url" required placeholder="https://" className={inputClass} />
        </Field>
        <Field label="Existing Directory Listing (Optional)" htmlFor="listingId" error={errors.listingId} hint="Choose a listing that is already approved, if you have one.">
          <select id="listingId" name="listingId" defaultValue="" className={inputClass}>
            <option value="">No listing yet</option>
            {listings.map((listing) => (
              <option key={listing.id} value={listing.id}>
                {listing.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Preferred Placement" htmlFor="placement" error={errors.placement}>
          <select id="placement" name="placement" defaultValue="homepage" className={inputClass}>
            {AD_PLACEMENTS.map((placement) => (
              <option key={placement.id} value={placement.id}>
                {placement.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Campaign Start Date" htmlFor="startDate" error={errors.startDate}>
          <input id="startDate" name="startDate" type="date" required className={inputClass} />
        </Field>
        <Field label="Campaign Duration" htmlFor="duration" error={errors.duration}>
          <select id="duration" name="duration" defaultValue="30 days" className={inputClass}>
            {AD_DURATIONS.map((duration) => (
              <option key={duration} value={duration}>
                {duration}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-ink">Advertising Type</legend>
        <p className="mt-1 text-xs leading-5 text-muted">Select every option you want to enquire about.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {AD_TYPES.map((type) => (
            <label key={type.id} className="flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-sm">
              <input type="checkbox" name="advertisingTypes" value={type.id} defaultChecked={initialTypes.includes(type.id)} className="h-4 w-4 accent-pine" />
              {type.label}
            </label>
          ))}
        </div>
        {errors.advertisingTypes ? <p className="mt-1.5 text-sm text-rose">{errors.advertisingTypes}</p> : null}
      </fieldset>

      <Field label="Relevant category" htmlFor="categorySlug" error={errors.categorySlug} hint="Required for a category sponsorship.">
        <select id="categorySlug" name="categorySlug" defaultValue="" className={inputClass}>
          <option value="">No category selected</option>
          {categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Promotional Description" htmlFor="description" error={errors.description}>
        <textarea id="description" name="description" required minLength={20} maxLength={2000} rows={5} className={inputClass} />
      </Field>
      <Field label="Destination URL" htmlFor="destinationUrl" error={errors.destinationUrl} hint="Where the advertisement should send people.">
        <input id="destinationUrl" name="destinationUrl" type="url" required placeholder="https://" className={inputClass} />
      </Field>
      <Field label="Banner / Creative Upload (Optional)" htmlFor="creative" error={errors.creative} hint="PNG, JPG, WEBP, or GIF up to 2MB.">
        <input id="creative" name="creative" type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="text-sm text-muted" />
      </Field>
      <Field label="Sponsored article reference (Optional)" htmlFor="guestPostRef" error={errors.guestPostRef} hint="If you already drafted a guest post, add its link or id. Publishing still needs a separate review.">
        <input id="guestPostRef" name="guestPostRef" maxLength={160} className={inputClass} />
      </Field>
      <Field label="Additional Requirements" htmlFor="additionalRequirements" error={errors.additionalRequirements}>
        <textarea id="additionalRequirements" name="additionalRequirements" maxLength={2000} rows={4} className={inputClass} />
      </Field>

      <button type="submit" className={buttonClass} disabled={pending}>
        {pending ? "Sending..." : "Submit Request"}
      </button>
    </form>
  );
}

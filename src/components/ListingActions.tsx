"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { submitClaim, submitReport, submitReview, toggleBookmark } from "@/lib/actions/community";
import { Field } from "@/components/Field";
import { Notice } from "@/components/Notice";
import { buttonClass, buttonSecondaryClass, inputClass } from "@/lib/styles";
import { initialActionState } from "@/lib/types";

export function TrackView({ slug }: { slug: string }) {
  useEffect(() => {
    fetch(`/api/listings/${slug}/view`, { method: "POST" }).catch(() => undefined);
  }, [slug]);
  return null;
}

export function BookmarkButton({ listingId, slug, saved }: { listingId: string; slug: string; saved: boolean }) {
  return (
    <form action={toggleBookmark}>
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="slug" value={slug} />
      <button type="submit" className={buttonSecondaryClass}>
        {saved ? "Saved" : "Save"}
      </button>
    </form>
  );
}

export function ShareButton({ slug, name }: { slug: string; name: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={buttonSecondaryClass}
      onClick={async () => {
        const url = `${window.location.origin}/listing/${slug}`;
        if (navigator.share) {
          try {
            await navigator.share({ title: name, url });
            return;
          } catch {
            // Fall through to copy when share is dismissed.
          }
        }
        await navigator.clipboard.writeText(url);
        setCopied(true);
      }}
    >
      {copied ? "Link copied" : "Share"}
    </button>
  );
}

export function ReviewPanel({
  listingId,
  slug,
  signedIn,
  canReview,
  existing,
}: {
  listingId: string;
  slug: string;
  signedIn: boolean;
  canReview: boolean;
  existing?: { rating: number; body: string } | null;
}) {
  const [state, action, pending] = useActionState(submitReview, initialActionState);
  if (!signedIn) {
    return <p className="text-sm text-muted">Log in to rate this listing. Each account can leave one review.</p>;
  }
  if (!canReview) return null;
  return (
    <form action={action} className="mt-4 space-y-4">
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="slug" value={slug} />
      {state.error ? <Notice tone="error">{state.error}</Notice> : null}
      {state.success ? <Notice tone="success">{state.success}</Notice> : null}
      <Field label={existing ? "Update your rating" : "Your rating"} htmlFor="rating" error={state.fieldErrors?.rating}>
        <select id="rating" name="rating" required defaultValue={existing?.rating ?? ""} className={inputClass}>
          <option value="" disabled>
            Select stars
          </option>
          {[5, 4, 3, 2, 1].map((score) => (
            <option key={score} value={score}>
              {score} star{score === 1 ? "" : "s"}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Review" htmlFor="body" error={state.fieldErrors?.body}>
        <textarea id="body" name="body" required minLength={10} maxLength={1000} rows={4} defaultValue={existing?.body} className={inputClass} />
      </Field>
      <button className={buttonClass} disabled={pending}>
        {pending ? "Saving..." : existing ? "Update review" : "Publish review"}
      </button>
    </form>
  );
}

export function ReportReview({ listingId, reviewId, slug }: { listingId: string; reviewId: string; slug: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(submitReport, initialActionState);
  if (!open) {
    return (
      <button type="button" className="text-xs font-semibold text-muted hover:text-ink" onClick={() => setOpen(true)}>
        Report
      </button>
    );
  }
  return (
    <form action={action} className="mt-3 space-y-2">
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="reviewId" value={reviewId} />
      <input type="hidden" name="slug" value={slug} />
      {state.success ? <p className="text-xs text-pine">{state.success}</p> : null}
      {state.error ? <p className="text-xs text-rose">{state.error}</p> : null}
      <textarea name="reason" required minLength={10} rows={2} placeholder="Why should this review be reviewed?" className={inputClass} />
      <button className={buttonSecondaryClass} disabled={pending}>
        {pending ? "Sending..." : "Send report"}
      </button>
    </form>
  );
}

export function ClaimPanel({ listingId, slug, signedIn }: { listingId: string; slug: string; signedIn: boolean }) {
  const [state, action, pending] = useActionState(submitClaim, initialActionState);
  if (!signedIn) return <p className="mt-3 text-sm text-muted">Log in to claim this listing. Claims are free.</p>;
  return (
    <form action={action} className="mt-4 space-y-3">
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="slug" value={slug} />
      {state.error ? <Notice tone="error">{state.error}</Notice> : null}
      {state.success ? <Notice tone="success">{state.success}</Notice> : null}
      <textarea name="message" required minLength={20} rows={3} placeholder="How do you represent this business?" className={inputClass} />
      <button className={buttonSecondaryClass} disabled={pending}>
        {pending ? "Sending..." : "Submit claim"}
      </button>
    </form>
  );
}

"use client";

import { useRef } from "react";
import { moderateGuestPost } from "@/lib/actions/guest-posts";
import { buttonClass, buttonSecondaryClass, inputClass } from "@/lib/styles";

export function ModerationForm({
  id,
  featured,
  published,
  feedback,
}: {
  id: string;
  featured: boolean;
  published: boolean;
  feedback: string;
}) {
  const decisionRef = useRef<HTMLInputElement>(null);

  function choose(value: string) {
    if (decisionRef.current) decisionRef.current.value = value;
  }

  return (
    <form action={moderateGuestPost} className="mt-6 space-y-4 rounded-2xl border border-line bg-white p-5">
      <input type="hidden" name="id" value={id} />
      <input ref={decisionRef} type="hidden" name="decision" defaultValue="" />
      <label className="block text-sm font-semibold">
        Editorial feedback
        <textarea className={`${inputClass} mt-2 min-h-28`} name="feedback" defaultValue={feedback} placeholder="Tell the author what to change, or leave a note with approval." />
      </label>
      <div className="flex flex-wrap gap-2">
        <button className={buttonSecondaryClass} type="submit" onClick={() => choose("review")}>
          Mark under review
        </button>
        <button className={buttonSecondaryClass} type="submit" onClick={() => choose("approve")}>
          Approve
        </button>
        <button className={buttonSecondaryClass} type="submit" onClick={() => choose("reject")}>
          Reject
        </button>
        <button className={buttonClass} type="submit" onClick={() => choose("publish")}>
          Publish now
        </button>
        {published ? (
          <button className={buttonSecondaryClass} type="submit" onClick={() => choose("unpublish")}>
            Unpublish
          </button>
        ) : null}
        <button className={buttonSecondaryClass} type="submit" onClick={() => choose(featured ? "unfeature" : "feature")}>
          {featured ? "Remove feature" : "Feature"}
        </button>
      </div>
      <div className="flex flex-wrap items-end gap-3 border-t border-line pt-4">
        <label className="text-sm font-semibold">
          Schedule publication
          <input className={`${inputClass} mt-2`} type="datetime-local" name="scheduledAt" />
        </label>
        <button className={buttonSecondaryClass} type="submit" onClick={() => choose("schedule")}>
          Schedule
        </button>
      </div>
    </form>
  );
}

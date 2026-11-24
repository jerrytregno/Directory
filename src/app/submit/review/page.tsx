import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ScrapeReview } from "@/components/ScrapeReview";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Review submission",
  robots: { index: false, follow: false },
};

export default async function SubmitReviewPage() {
  const session = await getSession();
  if (!session) redirect("/signup?next=/submit/review");
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Review the details</h1>
      <p className="mt-3 text-base leading-7 text-muted">Only the details found on the website are shown.</p>
      <div className="mt-8">
        <ScrapeReview />
      </div>
    </div>
  );
}

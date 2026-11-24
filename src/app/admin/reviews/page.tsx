import type { Metadata } from "next";
import { Notice } from "@/components/Notice";
import { moderateReview } from "@/lib/actions/moderation";
import { requireAdmin } from "@/lib/auth";
import { listAllReviews, listReports } from "@/lib/community";
import { withUserFirestore } from "@/lib/request-db";
import { buttonSecondaryClass } from "@/lib/styles";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Review moderation" };

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const [reviews, reports] = await Promise.all([
    withUserFirestore((db) => listAllReviews(db)),
    withUserFirestore((db) => listReports(db)),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Reviews</h1>
      <p className="mt-2 text-sm text-muted">Hide a review to remove it from the public listing. Each person can publish one review per listing.</p>
      {params.updated ? (
        <div className="mt-4">
          <Notice tone="success">Review updated.</Notice>
        </div>
      ) : null}
      <h2 className="mt-8 text-xl font-semibold">Reports</h2>
      {reports.length === 0 ? (
        <p className="mt-3 text-sm text-muted">No reports yet.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {reports.map((report) => (
            <li key={report.id} className="rounded-2xl border border-line bg-white p-4 text-sm">
              <p className="font-semibold">Listing {report.listingId}</p>
              <p className="mt-1 text-stone-700">{report.reason}</p>
              <p className="mt-2 text-muted">{formatDate(report.createdAt)}</p>
            </li>
          ))}
        </ul>
      )}
      <h2 className="mt-8 text-xl font-semibold">All reviews</h2>
      <ul className="mt-3 space-y-3">
        {reviews.map((review) => (
          <li key={`${review.listingId}-${review.id}`} className="rounded-2xl border border-line bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-semibold">
                {review.authorName} · {review.rating}/5 · {review.status}
              </p>
              <form action={moderateReview}>
                <input type="hidden" name="listingId" value={review.listingId} />
                <input type="hidden" name="userId" value={review.userId} />
                <input type="hidden" name="status" value={review.status === "hidden" ? "published" : "hidden"} />
                <button className={buttonSecondaryClass}>{review.status === "hidden" ? "Publish" : "Hide"}</button>
              </form>
            </div>
            <p className="mt-2 text-sm leading-6 text-stone-700">{review.body}</p>
          </li>
        ))}
      </ul>
      {reviews.length === 0 ? <p className="mt-3 text-sm text-muted">No reviews yet.</p> : null}
    </div>
  );
}

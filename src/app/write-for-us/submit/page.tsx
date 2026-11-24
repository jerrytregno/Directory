import type { Metadata } from "next";
import Link from "next/link";
import { ArticleForm } from "@/components/guest/ArticleForm";
import { requireUser } from "@/lib/auth";
import { saveOwnGuestPost } from "@/lib/actions/guest-posts";

export const metadata: Metadata = {
  title: "Submit an article",
  robots: { index: false, follow: false },
};

export default async function SubmitArticlePage() {
  const session = await requireUser();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <Link href="/write-for-us" className="text-sm font-semibold text-pine hover:underline">
        Write for Us
      </Link>
      <h1 className="mt-3 text-4xl font-extrabold">Submit your article</h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        Guest posts are free. Save a draft at any time, preview the article, then submit it for review.
      </p>
      <div className="mt-8">
        <ArticleForm mode="author" action={saveOwnGuestPost} authorName={session.name} authorEmail={session.email} />
      </div>
    </div>
  );
}

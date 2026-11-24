import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleForm } from "@/components/guest/ArticleForm";
import { GuestDeleteForm } from "@/components/guest/GuestDeleteForm";
import { Notice } from "@/components/Notice";
import { StatusBadge } from "@/components/StatusBadge";
import { deleteOwnDraft, saveOwnGuestPost } from "@/lib/actions/guest-posts";
import { requireUser } from "@/lib/auth";
import { guestStatusLabel } from "@/lib/guest-content";
import { getGuestPost } from "@/lib/guest-posts";
import { withUserFirestore } from "@/lib/request-db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit article",
  robots: { index: false, follow: false },
};

export default async function EditGuestPostPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireUser();
  const { id } = await params;
  const post = await withUserFirestore((db) => getGuestPost(db, id));
  if (!post || post.authorId !== session.id) notFound();

  const editable = post.status === "draft" || post.status === "submitted" || post.status === "rejected";

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <Link href="/my-posts" className="text-sm font-semibold text-pine hover:underline">
        My Guest Posts
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <h1 className="text-4xl font-extrabold">Edit article</h1>
        <StatusBadge status={post.status} />
      </div>
      <p className="mt-3 text-sm text-muted">Status: {guestStatusLabel(post.status)}</p>
      {post.adminFeedback ? (
        <div className="mt-4">
          <Notice tone={post.status === "rejected" ? "error" : "info"}>{post.adminFeedback}</Notice>
        </div>
      ) : null}

      {editable ? (
        <div className="mt-8 space-y-6">
          <ArticleForm mode="author" action={saveOwnGuestPost} post={post} />
          {post.status === "draft" ? <GuestDeleteForm action={deleteOwnDraft} id={post.id} label="Delete draft" message="Delete this draft?" /> : null}
        </div>
      ) : (
        <div className="mt-8 rounded-3xl border border-line bg-white p-6">
          <p className="text-sm leading-6 text-muted">
            This article is {guestStatusLabel(post.status).toLowerCase()}. You can edit it again if an admin sends it back with feedback.
          </p>
          {post.status === "published" ? (
            <Link href={`/guest-posts/${post.slug}`} className="mt-4 inline-flex text-sm font-semibold text-pine hover:underline">
              Open the published article
            </Link>
          ) : null}
        </div>
      )}
    </div>
  );
}

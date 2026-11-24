import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleContent } from "@/components/guest/ArticleContent";
import { ArticleForm } from "@/components/guest/ArticleForm";
import { GuestDeleteForm } from "@/components/guest/GuestDeleteForm";
import { ModerationForm } from "@/components/guest/ModerationForm";
import { Notice } from "@/components/Notice";
import { StatusBadge } from "@/components/StatusBadge";
import { moderateGuestPost, saveAdminGuestPost } from "@/lib/actions/guest-posts";
import { requireAdmin } from "@/lib/auth";
import { guestStatusLabel, prepareArticle } from "@/lib/guest-content";
import { getGuestPost } from "@/lib/guest-posts";
import { withUserFirestore } from "@/lib/request-db";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Review guest post",
  robots: { index: false, follow: false },
};

export default async function AdminGuestPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ updated?: string; error?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const query = await searchParams;
  const post = await withUserFirestore((db) => getGuestPost(db, id));
  if (!post) notFound();
  const article = prepareArticle(post.content);

  return (
    <div>
      <Link href="/admin/guest-posts" className="text-sm font-semibold text-pine hover:underline">
        All guest posts
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">{post.title}</h1>
        <StatusBadge status={post.status} />
        {post.featured ? <StatusBadge status="featured" /> : null}
      </div>
      <p className="mt-2 text-sm text-muted">
        {post.authorName} · {post.authorEmail} · {guestStatusLabel(post.status)} · Updated {formatDate(post.updatedAt)}
      </p>
      {post.status === "published" ? (
        <p className="mt-2 text-sm">
          <Link href={`/guest-posts/${post.slug}`} className="font-semibold text-pine hover:underline">
            Public URL
          </Link>
        </p>
      ) : null}
      {post.scheduledAt ? <p className="mt-2 text-sm text-muted">Scheduled for {formatDate(post.scheduledAt)}.</p> : null}

      <div className="mt-4 space-y-3">
        {query.updated ? <Notice tone="success">Article updated.</Notice> : null}
        {query.error ? <Notice tone="error">{query.error}</Notice> : null}
        {post.adminFeedback ? <Notice>Current feedback: {post.adminFeedback}</Notice> : null}
      </div>

      <ModerationForm id={post.id} featured={post.featured} published={post.status === "published"} feedback={post.adminFeedback} />
      <div className="mt-3">
        <GuestDeleteForm action={moderateGuestPost} id={post.id} label="Delete article" message="Delete this guest post?" />
      </div>

      <section className="mt-8 rounded-3xl border border-line bg-white px-6 py-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Preview</p>
        <h2 className="mt-3 text-3xl font-extrabold">{post.title}</h2>
        <p className="mt-3 text-muted">{post.shortDescription}</p>
        {post.featuredImage ? <img src={post.featuredImage} alt={post.title} className="mt-6 max-h-80 w-full rounded-2xl object-cover" /> : null}
        <div className="mt-6">
          <ArticleContent html={article.html} />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-extrabold">Edit article</h2>
        <div className="mt-4">
          <ArticleForm mode="admin" action={saveAdminGuestPost} post={post} />
        </div>
      </section>
    </div>
  );
}

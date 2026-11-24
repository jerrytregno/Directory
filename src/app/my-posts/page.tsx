import type { Metadata } from "next";
import Link from "next/link";
import { GuestDeleteForm } from "@/components/guest/GuestDeleteForm";
import { Notice } from "@/components/Notice";
import { StatusBadge } from "@/components/StatusBadge";
import { deleteOwnDraft } from "@/lib/actions/guest-posts";
import { requireUser } from "@/lib/auth";
import { guestStatusLabel } from "@/lib/guest-content";
import { listGuestNotifications, listGuestPosts, markGuestNotificationsRead } from "@/lib/guest-posts";
import { withUserFirestore } from "@/lib/request-db";
import { buttonClass, buttonSecondaryClass } from "@/lib/styles";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Guest Posts",
  robots: { index: false, follow: false },
};

export default async function MyPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string; draft?: string; deleted?: string }>;
}) {
  const session = await requireUser();
  const params = await searchParams;
  const data = await withUserFirestore(async (db) => {
    const [posts, notes] = await Promise.all([listGuestPosts(db, session.id), listGuestNotifications(db, session.id)]);
    const fresh = notes.filter((note) => !note.read).map((note) => note.id);
    await markGuestNotificationsRead(db, notes);
    return { posts, notes: notes.map((note) => ({ ...note, unread: fresh.includes(note.id) })) };
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-pine">Your articles</p>
          <h1 className="mt-2 text-4xl font-extrabold">My Guest Posts</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted">Create articles, keep drafts, and follow each submission from review to publication.</p>
        </div>
        <Link href="/write-for-us/submit" className={buttonClass}>
          New article
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {params.submitted ? <Notice tone="success">Your article was submitted and is waiting for review.</Notice> : null}
        {params.draft ? <Notice tone="success">Draft saved.</Notice> : null}
        {params.deleted ? <Notice tone="success">Draft deleted.</Notice> : null}
      </div>

      {data.notes.length > 0 ? (
        <section className="mt-8 rounded-3xl border border-line bg-white p-5">
          <h2 className="text-lg font-bold">Notifications</h2>
          <ul className="mt-3 space-y-2">
            {data.notes.map((note) => (
              <li key={note.id} className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                <span>
                  {note.unread ? <span className="mr-2 rounded-full bg-mist px-2 py-0.5 text-xs font-semibold text-pine">New</span> : null}
                  {note.message}
                </span>
                <span className="text-xs text-muted">{formatDate(note.createdAt)}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <ul className="mt-8 space-y-4">
        {data.posts.map((post) => {
          const editable = post.status === "draft" || post.status === "submitted" || post.status === "rejected";
          return (
            <li key={post.id} className="rounded-2xl border border-line bg-white p-5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold">{post.title}</h2>
                <StatusBadge status={post.status} />
                {post.featured ? <StatusBadge status="featured" /> : null}
              </div>
              <p className="mt-2 text-sm text-muted">
                {guestStatusLabel(post.status)}
                {post.category ? ` · ${post.category}` : ""} · Updated {formatDate(post.updatedAt)}
              </p>
              {post.adminFeedback ? <p className="mt-3 text-sm leading-6 text-ink">Editor note: {post.adminFeedback}</p> : null}
              {post.scheduledAt ? <p className="mt-2 text-sm text-muted">Scheduled for {formatDate(post.scheduledAt)}.</p> : null}
              <div className="mt-4 flex flex-wrap gap-2">
                {editable ? (
                  <Link href={`/my-posts/${post.id}/edit`} className={buttonSecondaryClass}>
                    Edit
                  </Link>
                ) : null}
                {post.status === "published" ? (
                  <Link href={`/guest-posts/${post.slug}`} className={buttonSecondaryClass}>
                    View published article
                  </Link>
                ) : null}
                {post.status === "draft" ? <GuestDeleteForm action={deleteOwnDraft} id={post.id} label="Delete draft" message="Delete this draft?" /> : null}
              </div>
            </li>
          );
        })}
      </ul>
      {data.posts.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-line bg-white px-6 py-10 text-sm text-muted">You have not written any guest posts yet.</p>
      ) : null}
    </div>
  );
}

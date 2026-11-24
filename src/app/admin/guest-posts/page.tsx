import type { Metadata } from "next";
import Link from "next/link";
import { Notice } from "@/components/Notice";
import { StatusBadge } from "@/components/StatusBadge";
import { requireAdmin } from "@/lib/auth";
import { GUEST_STATUSES, guestStatusLabel } from "@/lib/guest-content";
import { listGuestPosts, promoteDuePosts } from "@/lib/guest-posts";
import { withUserFirestore } from "@/lib/request-db";
import { buttonClass, inputClass } from "@/lib/styles";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Guest posts",
  robots: { index: false, follow: false },
};

export default async function AdminGuestPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; deleted?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const q = (params.q || "").trim().toLowerCase();
  const status = GUEST_STATUSES.includes(params.status as (typeof GUEST_STATUSES)[number]) ? params.status || "" : "";
  const posts = await withUserFirestore(async (db) => {
    await promoteDuePosts(db);
    return listGuestPosts(db);
  });
  const visible = posts.filter((post) => {
    if (status && post.status !== status) return false;
    if (!q) return true;
    return [post.title, post.authorName, post.authorEmail, post.category].join(" ").toLowerCase().includes(q);
  });

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Guest posts</h1>
      <p className="mt-2 text-sm text-muted">Review drafts and submissions, then approve, schedule, or publish them.</p>
      {params.deleted ? (
        <div className="mt-4">
          <Notice tone="success">Article deleted.</Notice>
        </div>
      ) : null}

      <form action="/admin/guest-posts" className="mt-6 grid gap-3 rounded-2xl border border-line bg-white p-4 md:grid-cols-[1fr_200px_auto]">
        <input className={inputClass} name="q" defaultValue={params.q || ""} placeholder="Search articles or authors" aria-label="Search articles" />
        <select className={inputClass} name="status" defaultValue={status} aria-label="Status">
          <option value="">All statuses</option>
          {GUEST_STATUSES.map((item) => (
            <option key={item} value={item}>
              {guestStatusLabel(item)}
            </option>
          ))}
        </select>
        <button className={buttonClass} type="submit">
          Filter
        </button>
      </form>

      <ul className="mt-6 space-y-4">
        {visible.map((post) => (
          <li key={post.id} className="rounded-2xl border border-line bg-white p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-semibold">{post.title}</h2>
              <StatusBadge status={post.status} />
              {post.featured ? <StatusBadge status="featured" /> : null}
            </div>
            <p className="mt-1 text-sm text-muted">
              {post.authorName} · {post.authorEmail} · {post.category || "No topic"} · Updated {formatDate(post.updatedAt)}
            </p>
            <p className="mt-2 text-sm leading-6 text-stone-600">{post.shortDescription}</p>
            {post.scheduledAt ? <p className="mt-2 text-sm text-muted">Scheduled for {formatDate(post.scheduledAt)}.</p> : null}
            <Link href={`/admin/guest-posts/${post.id}`} className="mt-4 inline-flex text-sm font-semibold text-pine hover:underline">
              Review article
            </Link>
          </li>
        ))}
      </ul>
      {visible.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-line bg-white px-6 py-10 text-sm text-muted">
          {q || status ? "No articles match these filters." : "No guest posts yet."}
        </p>
      ) : null}
    </div>
  );
}

import Link from "next/link";
import { readingMinutes, type GuestPost } from "@/lib/guest-content";
import { formatDate } from "@/lib/utils";

export function AuthorAvatar({ name, src, size = "h-9 w-9" }: { name: string; src: string | null; size?: string }) {
  if (src) {
    return <img src={src} alt={`${name} profile`} className={`${size} rounded-full object-cover`} />;
  }
  const letter = name.trim().charAt(0).toUpperCase() || "B";
  return <span className={`inline-flex ${size} items-center justify-center rounded-full bg-mist text-sm font-bold text-pine`}>{letter}</span>;
}

export function GuestCard({ post, sponsored = false }: { post: GuestPost; sponsored?: boolean }) {
  const minutes = readingMinutes(post.content);
  return (
    <Link href={`/guest-posts/${post.slug}`} className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition hover:-translate-y-0.5 hover:border-pine/40">
      <div className="aspect-[16/9] bg-mist">
        {post.featuredImage ? (
          <img src={post.featuredImage} alt={post.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-end bg-[linear-gradient(135deg,#f6e4d2,#f3ebe1_55%,#f8e7dc)] p-4 text-sm font-semibold text-pine">
            {post.category || "Guest post"}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          {post.category ? <p className="text-xs font-semibold uppercase tracking-[0.14em] text-pine">{post.category}</p> : null}
          {sponsored ? <span className="rounded-full bg-sand px-2.5 py-1 text-xs font-semibold text-ink">Sponsored</span> : null}
        </div>
        <h3 className="mt-2 text-xl font-bold leading-tight tracking-tight">{post.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{post.shortDescription}</p>
        <div className="mt-5 flex items-center gap-3">
          <AuthorAvatar name={post.authorName} src={post.authorImage} />
          <div>
            <p className="text-sm font-semibold">{post.authorName || "SaaSListingHub author"}</p>
            <p className="text-xs text-muted">
              {post.publishedAt ? formatDate(post.publishedAt) : "Unpublished"} · {minutes} min read
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

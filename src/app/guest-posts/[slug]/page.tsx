import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlots } from "@/components/ads/AdSlots";
import { ArticleContent } from "@/components/guest/ArticleContent";
import { AuthorAvatar, GuestCard } from "@/components/guest/GuestCard";
import { ShareBar } from "@/components/guest/ShareBar";
import { absoluteAssetUrl, prepareArticle, readingMinutes } from "@/lib/guest-content";
import { sponsoredGuestPostKeys } from "@/lib/ads";
import { getPublishedGuestPosts } from "@/lib/guest-posts";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

function siteBase() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const posts = await getPublishedGuestPosts();
  const post = posts.find((item) => item.slug === slug);
  if (!post) return { title: "Guest post", robots: { index: false, follow: false } };
  const base = siteBase();
  const url = `${base}/guest-posts/${post.slug}`;
  const image = absoluteAssetUrl(base, post.featuredImage);
  return {
    title: post.title,
    description: post.shortDescription,
    authors: [{ name: post.authorName }],
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.shortDescription,
      publishedTime: post.publishedAt || undefined,
      modifiedTime: post.updatedAt,
      authors: [post.authorName],
      images: image ? [{ url: image, alt: post.title }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: post.title,
      description: post.shortDescription,
      images: image ? [image] : undefined,
    },
  };
}

export default async function GuestArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [posts, sponsored] = await Promise.all([getPublishedGuestPosts(), sponsoredGuestPostKeys()]);
  const post = posts.find((item) => item.slug === slug);
  if (!post) notFound();
  const isSponsored = sponsored.has(post.id) || sponsored.has(post.slug);

  const base = siteBase();
  const url = `${base}/guest-posts/${post.slug}`;
  const article = prepareArticle(post.content);
  const minutes = readingMinutes(post.content);
  const related = posts.filter((item) => item.id !== post.id && item.category === post.category).slice(0, 3);
  const image = absoluteAssetUrl(base, post.featuredImage);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.shortDescription,
    image: image ? [image] : undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Person",
      name: post.authorName,
      description: post.authorBio,
      url: post.authorWebsite || undefined,
      image: absoluteAssetUrl(base, post.authorImage),
    },
    publisher: {
      "@type": "Organization",
      name: "SaaSListingHub",
      url: base,
    },
    mainEntityOfPage: url,
    keywords: post.tags.join(", "),
    articleSection: post.category,
  };

  return (
    <article className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Link href="/guest-posts" className="text-sm font-semibold text-pine hover:underline">
        Back to Guest Posts
      </Link>
      <header className="mx-auto mt-6 max-w-3xl">
        <div className="flex flex-wrap items-center gap-3">
          {post.category ? <p className="text-sm font-semibold uppercase tracking-[0.16em] text-pine">{post.category}</p> : null}
          {isSponsored ? <span className="rounded-full bg-sand px-2.5 py-1 text-xs font-semibold text-ink">Sponsored</span> : null}
        </div>
        <h1 className="mt-3 text-4xl font-extrabold leading-tight sm:text-5xl">{post.title}</h1>
        <p className="mt-5 text-lg leading-8 text-ink/80">{post.shortDescription}</p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <AuthorAvatar name={post.authorName} src={post.authorImage} size="h-12 w-12" />
          <div>
            <p className="font-semibold">{post.authorName}</p>
            <p className="text-sm text-muted">
              {post.publishedAt ? formatDate(post.publishedAt) : ""} · {minutes} min read
            </p>
          </div>
        </div>
        <div className="mt-6">
          <ShareBar url={url} title={post.title} />
        </div>
      </header>

      {post.featuredImage ? (
        <img src={post.featuredImage} alt={post.title} className="mx-auto mt-8 max-h-[520px] w-full max-w-4xl rounded-3xl object-cover" />
      ) : null}

      <div className="mx-auto mt-10 grid max-w-5xl gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
        {article.toc.length > 0 ? (
          <nav className="lg:sticky lg:top-24 lg:self-start" aria-label="Table of contents">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">On this page</p>
            <ol className="mt-3 space-y-2">
              {article.toc.map((item) => (
                <li key={item.id} className={item.level === 3 ? "pl-3" : ""}>
                  <a href={`#${item.id}`} className="text-sm font-medium text-ink/80 hover:text-pine">
                    {item.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        ) : (
          <div />
        )}
        <ArticleContent html={article.html} />
      </div>

      <section className="mx-auto mt-12 max-w-3xl rounded-3xl border border-line bg-white p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <AuthorAvatar name={post.authorName} src={post.authorImage} size="h-16 w-16" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">About the author</p>
            <h2 className="mt-1 text-2xl font-extrabold">{post.authorName}</h2>
            {post.authorBio ? <p className="mt-3 text-sm leading-6 text-muted">{post.authorBio}</p> : null}
            <div className="mt-3 flex flex-wrap gap-4 text-sm font-semibold text-pine">
              {post.authorWebsite ? (
                <a href={post.authorWebsite} target="_blank" rel="noopener noreferrer">
                  Website
                </a>
              ) : null}
              {post.linkedinUrl ? (
                <a href={post.linkedinUrl} target="_blank" rel="noopener noreferrer">
                  LinkedIn
                </a>
              ) : null}
              {post.twitterUrl ? (
                <a href={post.twitterUrl} target="_blank" rel="noopener noreferrer">
                  X
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {post.tags.length > 0 ? (
        <ul className="mx-auto mt-6 flex max-w-3xl flex-wrap gap-2">
          {post.tags.map((tag) => (
            <li key={tag} className="rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold">
              {tag}
            </li>
          ))}
        </ul>
      ) : null}

      <AdSlots place="blog" embedded />

      {related.length > 0 ? (
        <section className="mt-14">
          <h2 className="text-2xl font-extrabold">Related articles</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-3">
            {related.map((item) => (
              <GuestCard key={item.id} post={item} sponsored={sponsored.has(item.id) || sponsored.has(item.slug)} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}

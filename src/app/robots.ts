import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/submit", "/my-posts", "/profile", "/write-for-us/submit"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}

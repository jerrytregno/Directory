import { notFound } from "next/navigation";
import { getPublicDb } from "@/lib/firebase-db";
import { recordWebsiteClick } from "@/lib/community";
import { getListingSlugByDomain } from "@/lib/queries";
import { getListing } from "@/lib/store";
import { resolveToolWebsite } from "@/lib/tool-sites";

export default async function ToolPage({ params }: { params: Promise<{ domain: string[] }> }) {
  const { domain } = await params;
  let website = resolveToolWebsite(domain) ?? "";

  if (!website && domain.length === 1) {
    const slug = await getListingSlugByDomain(domain[0]);
    if (!slug) notFound();
    const tracked = await recordWebsiteClick(slug).catch(() => null);
    website = tracked ?? (await getListing(getPublicDb(), slug).catch(() => null))?.websiteUrl ?? "";
  }

  if (!/^https?:\/\//i.test(website)) notFound();

  const frame = `/api/tool-proxy?url=${encodeURIComponent(website)}`;

  return (
    <iframe
      title={domain.join("/")}
      src={frame}
      sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
      className="fixed inset-0 z-50 h-screen w-screen border-0 bg-white"
    />
  );
}

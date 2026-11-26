import type { Metadata } from "next";
import Link from "next/link";
import { ListingLogo } from "@/components/ListingLogo";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { StatusBadge } from "@/components/StatusBadge";
import { requireUser } from "@/lib/auth";
import { getUserListings } from "@/lib/queries";
import { buttonSecondaryClass } from "@/lib/styles";
import { domainFromUrl, toolPath, websiteLogoUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Profile",
  robots: { index: false, follow: false },
};

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string }>;
}) {
  const params = await searchParams;
  const session = await requireUser();
  const websites = await getUserListings(session.id);
  const count = websites.length;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <div className="flex items-center gap-4">
        <ProfileAvatar name={session.name} size={64} />
        <div className="min-w-0">
          <h1 className="text-4xl font-extrabold tracking-tight">{session.name}</h1>
          <p className="mt-1 break-all text-sm text-muted">{session.email}</p>
        </div>
      </div>

      {params.updated === "1" ? <p className="mt-8 text-sm font-medium text-pine">Your changes were saved and sent for review.</p> : null}

      <p className="mt-10 text-2xl font-bold">
        {count} {count === 1 ? "website" : "websites"}
      </p>

      {count === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-line bg-white px-6 py-12">
          <p className="text-sm leading-6 text-muted">You have not submitted a website yet.</p>
          <Link href="/submit" className="mt-4 inline-block text-sm font-semibold text-pine hover:underline">
            Submit a website
          </Link>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {websites.map((website) => (
            <li key={website.id} className="rounded-2xl border border-line bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <ListingLogo name={website.name} logoUrl={websiteLogoUrl(website.websiteUrl)} />
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold">
                      <Link href={`/listing/${website.slug}`} className="hover:text-pine">
                        {website.name}
                      </Link>
                    </h2>
                    {website.category.name ? <p className="mt-0.5 text-sm text-muted">{website.category.name}</p> : null}
                  </div>
                </div>
                <StatusBadge status={website.status} />
              </div>
              {website.shortDescription ? <p className="mt-4 text-sm leading-6 text-stone-600">{website.shortDescription}</p> : null}
              <div className="mt-4 flex items-center justify-between gap-3">
                <a href={toolPath(website.websiteUrl) ?? website.websiteUrl} className="min-w-0 truncate text-xs font-medium text-pine hover:underline">
                  {domainFromUrl(website.websiteUrl)}
                </a>
                <Link href={`/profile/${website.id}/edit`} className={`${buttonSecondaryClass} shrink-0`}>
                  Edit
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

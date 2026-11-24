import type { Metadata } from "next";
import Link from "next/link";
import { AD_TYPES } from "@/lib/ads";
import { buttonClass } from "@/lib/styles";

export const metadata: Metadata = {
  title: "Advertise",
  description: "Reach people discovering new AI tools, SaaS products and businesses. Explore promotional opportunities to showcase your brand on SaaSListingHub.",
  alternates: { canonical: "/advertise" },
};

const details: Record<(typeof AD_TYPES)[number]["id"], string> = {
  featured_listing:
    "A homepage card with your logo, name, and description, plus a Visit Website button. It is labeled Featured and stays outside the organic listing shelves.",
  category_sponsorship:
    "A sponsored card at the top of one category you choose. It is labeled Sponsored and does not replace the businesses approved in that category.",
  newsletter:
    "A promotional title, description, logo, and link for a future SaaSListingHub newsletter. An admin can save the dates. Publishing waits until a newsletter exists.",
  banner:
    "An image and destination URL for the homepage, the directory, a category page, or the articles. An admin chooses the location and the dates.",
  sponsored_guest_post:
    "A sponsored article still goes through guest-post review. A published sponsored article is labeled Sponsored.",
  product_spotlight:
    "A wider homepage block with your logo, description, image, and website link. An admin features it for the dates that are turned on.",
};

export default function AdvertisePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-pine">Advertise With Us</p>
      <h1 className="mt-3 max-w-3xl text-5xl font-extrabold leading-[0.95] tracking-tight">Promote Your Business on SaaSListingHub</h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/80">
        Reach people discovering new AI tools, SaaS products and businesses. Explore promotional opportunities to showcase your brand on SaaSListingHub.
      </p>

      <section id="opportunities" className="mt-14">
        <h2 className="text-3xl font-extrabold">Advertising Opportunities</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Every request is reviewed by hand. Nothing goes live until an admin approves it and turns the campaign on. This page does not list prices or take payment.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {AD_TYPES.map((type) => (
            <article key={type.id} className="rounded-2xl border border-line bg-white p-6">
              <h3 className="text-xl font-bold tracking-tight">{type.label}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{details[type.id]}</p>
            </article>
          ))}
        </div>
        <Link href="/advertise/request" className={`${buttonClass} mt-8`}>
          Request Advertising
        </Link>
      </section>
    </div>
  );
}

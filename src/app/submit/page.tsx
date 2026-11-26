import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ListingForm } from "@/components/ListingForm";
import { Notice } from "@/components/Notice";
import { getSession } from "@/lib/auth";
import { getCategories } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Submit your business",
  description: "Submit an AI tool, SaaS product, software, startup, or business to the SaaSListingHub directory for free.",
};

export default async function SubmitPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/signup?next=/submit");
  const [categories, params] = await Promise.all([getCategories(), searchParams]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Submit your business</h1>
        <p className="mt-3 text-base leading-7 text-muted">
          Paste a website. The next page shows the business, description, products, and region, and you can edit them.
        </p>
        {params.submitted ? (
          <div className="mt-6">
            <Notice tone="success">Your listing was submitted and is waiting for review. It stays off the public directory until it is approved.</Notice>
          </div>
        ) : null}
      </div>
      <div className="mt-8">
        <ListingForm mode="create" categories={categories} />
      </div>
    </div>
  );
}

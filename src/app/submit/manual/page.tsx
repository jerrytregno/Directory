import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ListingForm } from "@/components/ListingForm";
import { getSession } from "@/lib/auth";
import { getCategories } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Fill in a listing",
  robots: { index: false, follow: false },
};

export default async function ManualSubmitPage() {
  const session = await getSession();
  if (!session) redirect("/signup?next=/submit/manual");
  const categories = await getCategories();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Fill in your listing</h1>
      <p className="mt-3 text-base leading-7 text-muted">Enter the listing details yourself. It stays pending until an admin approves it.</p>
      <div className="mt-8">
        <ListingForm mode="create" manual categories={categories} />
      </div>
    </div>
  );
}

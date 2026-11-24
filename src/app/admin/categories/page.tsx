import type { Metadata } from "next";
import { ConfirmSubmitButton } from "@/components/DeleteListingButton";
import { Notice } from "@/components/Notice";
import { createCategory, deleteCategory, updateCategory } from "@/lib/actions/admin";
import { requireAdmin } from "@/lib/auth";
import { getCategoriesWithCounts } from "@/lib/queries";
import { buttonClass, buttonDangerClass, buttonSecondaryClass, inputClass } from "@/lib/styles";

export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string; error?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const categories = await getCategoriesWithCounts();

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Categories</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        Categories group the public directory. A category can be deleted only when it has no listings.
      </p>
      <div className="mt-6 space-y-3">
        {params.saved ? <Notice tone="success">Category saved.</Notice> : null}
        {params.error ? <Notice tone="error">{params.error}</Notice> : null}
      </div>

      <form action={createCategory} className="mt-6 grid gap-3 rounded-2xl border border-line bg-white p-4 md:grid-cols-[180px_1fr_auto]">
        <input className={inputClass} name="name" required maxLength={40} placeholder="Name" aria-label="Category name" />
        <input className={inputClass} name="description" required minLength={10} maxLength={160} placeholder="Short description" aria-label="Category description" />
        <button className={buttonClass} type="submit">
          Add category
        </button>
      </form>

      <ul className="mt-6 space-y-4">
        {categories.map((category) => (
          <li key={category.id} className="rounded-2xl border border-line bg-white p-4">
            <form action={updateCategory} className="grid gap-3 md:grid-cols-[180px_1fr_auto]">
              <input type="hidden" name="id" value={category.id} />
              <input className={inputClass} name="name" required maxLength={40} defaultValue={category.name} aria-label={`${category.name} name`} />
              <input
                className={inputClass}
                name="description"
                required
                minLength={10}
                maxLength={160}
                defaultValue={category.description}
                aria-label={`${category.name} description`}
              />
              <button className={buttonSecondaryClass} type="submit">
                Save
              </button>
            </form>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-sm text-muted">
                /{category.slug}
              </p>
              <ConfirmSubmitButton
                action={deleteCategory}
                id={category.id}
                label="Delete"
                confirm={`Delete the ${category.name} category?`}
                className={buttonDangerClass}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

import { AccountNav } from "@/components/AccountNav";
import { AdminGate } from "@/components/AdminGate";
import { getSession } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const unlocked = session?.role === "admin";

  if (!unlocked) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <AdminGate />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pine">Admin</p>
      <div className="mt-4">
        <AccountNav
          links={[
            { href: "/admin", label: "Submissions", match: "exact" },
            { href: "/admin/users", label: "Users", match: "prefix" },
            { href: "/admin/categories", label: "Categories", match: "prefix" },
            { href: "/admin/reviews", label: "Reviews", match: "prefix" },
            { href: "/admin/claims", label: "Claims", match: "prefix" },
            { href: "/admin/guest-posts", label: "Guest posts", match: "prefix" },
            { href: "/admin/advertising", label: "Advertising", match: "prefix" },
          ]}
        />
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}

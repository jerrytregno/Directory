import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { getUsers } from "@/lib/queries";
import { buttonClass, inputClass } from "@/lib/styles";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Users" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const users = await getUsers(params.q);

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Users</h1>
      <p className="mt-2 text-sm text-muted">Everyone who has created an account. Roles control who can review submissions.</p>
      <form action="/admin/users" className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input className={inputClass} name="q" defaultValue={params.q ?? ""} placeholder="Search name or email" aria-label="Search users" />
        <button className={buttonClass} type="submit">
          Search
        </button>
      </form>
      <ul className="mt-6 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
        {users.map((user) => (
          <li key={user.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-muted">{user.email}</p>
            </div>
            <div className="text-sm text-muted sm:text-right">
              <p className="font-medium text-ink">{user.role === "admin" ? "Admin" : "Member"}</p>
              <p>
                Joined {formatDate(user.createdAt)}
              </p>
            </div>
          </li>
        ))}
      </ul>
      {users.length === 0 ? <p className="mt-4 text-sm text-muted">No users match that search.</p> : null}
    </div>
  );
}

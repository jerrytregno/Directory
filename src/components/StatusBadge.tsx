const styles: Record<string, string> = {
  pending: "bg-sand text-amber",
  submitted: "bg-sand text-amber",
  draft: "bg-sand text-muted",
  under_review: "bg-mist text-pine",
  approved: "bg-mist text-pine",
  rejected: "bg-[#fff1f2] text-rose",
  published: "bg-mist text-pine",
  featured: "bg-sand text-ink",
  scheduled: "bg-sand text-amber",
  active: "bg-mist text-pine",
  completed: "bg-stone-100 text-stone-700",
  inactive: "bg-stone-100 text-muted",
};

const labels: Record<string, string> = {
  pending: "Pending",
  submitted: "Pending",
  draft: "Draft",
  under_review: "Under review",
  approved: "Approved",
  rejected: "Rejected",
  published: "Published",
  featured: "Featured",
  scheduled: "Scheduled",
  active: "Active",
  completed: "Completed",
  inactive: "Inactive",
};

export function StatusBadge({ status }: { status: string }) {
  const label = labels[status] ?? status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status] ?? "bg-stone-100 text-stone-700"}`}>
      {label}
    </span>
  );
}

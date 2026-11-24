import Link from "next/link";

export function SectionHeading({
  title,
  description,
  href,
  action = "View all",
}: {
  title: string;
  description?: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-ink">{title}</h2>
        {description ? <p className="mt-2 max-w-xl text-sm leading-6 text-muted">{description}</p> : null}
      </div>
      {href ? (
        <Link href={href} className="shrink-0 text-sm font-semibold text-pine hover:underline">
          {action}
        </Link>
      ) : null}
    </div>
  );
}

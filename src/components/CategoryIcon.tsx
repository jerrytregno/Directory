const paths: Record<string, string> = {
  "ai-tools": "M12 3.5l1.4 4.6L18 9.5l-4.6 1.4L12 15.5l-1.4-4.6L6 9.5l4.6-1.4L12 3.5zM17 14.5l.7 2.1 2.1.7-2.1.7-.7 2.1-.7-2.1-2.1-.7 2.1-.7.7-2.1z",
  "seo-tools": "M5 16.5l4-4 3 3 6-7M15 8.5h4v4",
  marketing: "M5 12.5v-1l9-4v10l-9-4v-1zM14 9.2c1.6.8 2.5 2 2.5 3.3S15.6 15 14 15.8M7 13.2l.8 3.3h2.2",
  productivity: "M8 4.5h8M8 8.5h8M8 12.5h5M6 3.5h12v16H6z",
  automation: "M12 4.5v3M12 16.5v3M4.5 12h3M16.5 12h3M7.2 7.2l2 2M14.8 14.8l2 2M16.8 7.2l-2 2M9.2 14.8l-2 2",
  "business-software": "M5 8.5h14v10H5zM8 8.5V6.8A2.5 2.5 0 0 1 10.5 4.5h3A2.5 2.5 0 0 1 16 6.8v1.7",
  "developer-tools": "M9 8.5L5.5 12 9 15.5M15 8.5l3.5 3.5L15 15.5M13 6.5l-2 11",
  "design-tools": "M6 16.5l8.5-8.5a2 2 0 0 1 2.8 0l.7.7a2 2 0 0 1 0 2.8L9.5 19.5H6v-3z",
  "sales-crm": "M5 17.5V8.5M10 17.5v-6M15 17.5v-9M20 17.5V6.5",
  "social-media": "M8 14.5a3 3 0 1 0-2.4-1.2L8 14.5zm0 0l4.2-2.2M16 9.5a3 3 0 1 0-1.1 2.3L12.2 12.3M16 17.5a3 3 0 1 0-2.3-1.1l-1.5-1",
  analytics: "M5 16.5c2-5 4-2 6-4s3-6 8-7",
  other: "M6 8.5h5v5H6zM13 8.5h5v5h-5zM6 15.5h5v4H6zM13 15.5h5v4h-5z",
};

export function CategoryIcon({ slug }: { slug: string }) {
  const d = paths[slug] ?? paths.other;
  return (
    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-mist text-pine">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={d} />
      </svg>
    </span>
  );
}

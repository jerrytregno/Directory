export function ListingLogo({
  name,
  logoUrl,
  size = "md",
}: {
  name: string;
  logoUrl?: string | null;
  size?: "md" | "lg";
}) {
  const dim = size === "lg" ? "h-16 w-16 rounded-2xl text-xl" : "h-12 w-12 rounded-xl text-base";
  if (logoUrl) {
    return <img src={logoUrl} alt={`${name} logo`} className={`${dim} border border-line bg-white object-cover`} />;
  }

  const tones = ["bg-mist text-pine", "bg-sand text-amber", "bg-stone-100 text-stone-700"];
  const tone = tones[(name.codePointAt(0) ?? 0) % tones.length];
  const initial = name.trim().charAt(0).toUpperCase() || "B";

  return (
    <span className={`${dim} inline-flex shrink-0 items-center justify-center font-semibold ${tone}`} aria-hidden="true">
      {initial}
    </span>
  );
}

export function ProfileAvatar({ name, size = 40 }: { name: string; size?: number }) {
  const initial = name.trim().charAt(0).toUpperCase() || "B";
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#d9e4ff] font-semibold text-ink"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
      aria-hidden="true"
    >
      {initial}
    </span>
  );
}

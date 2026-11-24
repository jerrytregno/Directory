export function TrendChart({
  points,
}: {
  points: { label: string; value: number }[];
}) {
  const max = Math.max(1, ...points.map((point) => point.value));
  return (
    <div className="flex h-36 items-end gap-1">
      {points.map((point) => (
        <div key={point.label} className="flex h-full flex-1 flex-col justify-end">
          <div
            className="rounded-t-md bg-pine/80"
            style={{ height: `${Math.max(4, (point.value / max) * 100)}%` }}
            title={`${point.label}: ${point.value}`}
          />
          <span className="mt-1 truncate text-center text-[10px] text-muted">{point.label.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}

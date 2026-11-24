export function Notice({
  tone = "info",
  children,
}: {
  tone?: "success" | "error" | "info";
  children: React.ReactNode;
}) {
  const styles = {
    success: "border-pine/20 bg-mist text-pine-dark",
    error: "border-rose/20 bg-[#fff1f2] text-rose",
    info: "border-line bg-sand text-ink",
  };

  return <div className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${styles[tone]}`}>{children}</div>;
}

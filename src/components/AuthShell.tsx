export function AuthShell({
  title,
  lede,
  children,
  footer,
}: {
  title: string;
  lede: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-16">
      <h1 className="text-4xl font-extrabold">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-muted">{lede}</p>
      <div className="mt-8 rounded-2xl border border-line bg-white p-6">{children}</div>
      {footer ? <div className="mt-4 text-sm text-muted">{footer}</div> : null}
    </div>
  );
}

"use client";

export function ConfirmSubmitButton({
  action,
  id,
  returnTo,
  label,
  confirm,
  className = "text-sm font-semibold text-rose hover:underline",
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  returnTo?: string;
  label: string;
  confirm: string;
  className?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(confirm)) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      {returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}
      <button type="submit" className={className}>
        {label}
      </button>
    </form>
  );
}

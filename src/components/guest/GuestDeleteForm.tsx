"use client";

import { buttonDangerClass } from "@/lib/styles";

export function GuestDeleteForm({
  action,
  id,
  label,
  message,
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  label: string;
  message: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="decision" value="delete" />
      <button className={buttonDangerClass} type="submit">
        {label}
      </button>
    </form>
  );
}

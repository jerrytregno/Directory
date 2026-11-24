"use client";

import { useActionState, useState } from "react";
import { unlockAdmin } from "@/lib/actions/auth";
import { Field } from "@/components/Field";
import { Notice } from "@/components/Notice";
import { buttonClass, inputClass } from "@/lib/styles";
import { initialActionState } from "@/lib/types";

export function AdminGate() {
  const [state, formAction, pending] = useActionState(unlockAdmin, initialActionState);
  const [visible, setVisible] = useState(false);

  return (
    <form action={formAction} className="mx-auto mt-8 max-w-md space-y-4 rounded-[1.75rem] bg-white p-6 shadow-[0_20px_50px_rgba(22,20,28,0.08)] ring-1 ring-black/5">
      <h1 className="text-3xl font-semibold tracking-tight">Admin</h1>
      <p className="text-sm leading-6 text-muted">Enter the admin password to see every submitted listing.</p>
      {state.error ? <Notice tone="error">{state.error}</Notice> : null}
      <Field label="Password" htmlFor="admin-password">
        <div className="relative">
          <input
            id="admin-password"
            name="password"
            type={visible ? "text" : "password"}
            autoComplete="current-password"
            required
            className={`${inputClass} pr-11`}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted hover:text-ink"
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            onClick={() => setVisible((current) => !current)}
          >
            {visible ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M3 3l18 18" strokeLinecap="round" />
                <path d="M10.6 10.6A2 2 0 0 0 12 14a2 2 0 0 0 1.4-.6" strokeLinecap="round" />
                <path d="M9.9 5.1A10.8 10.8 0 0 1 12 5c5 0 9.3 3.1 11 7.5a11.6 11.6 0 0 1-4.1 5.2" strokeLinecap="round" />
                <path d="M6.1 6.1C4.2 7.4 2.7 9.3 1.5 12.5 3.2 16.9 7.5 20 12.5 20c1.2 0 2.3-.2 3.4-.6" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M2 12.5C3.7 8.1 8 5 13 5s9.3 3.1 11 7.5C22.3 16.9 18 20 13 20S3.7 16.9 2 12.5Z" />
                <circle cx="13" cy="12.5" r="2.5" />
              </svg>
            )}
          </button>
        </div>
      </Field>
      <button type="submit" className={`${buttonClass} w-full`} disabled={pending}>
        {pending ? "Checking..." : "Open admin"}
      </button>
    </form>
  );
}

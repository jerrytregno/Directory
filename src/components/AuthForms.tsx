"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { login, requestPasswordReset, resetPassword, signup } from "@/lib/actions/auth";
import { Field } from "@/components/Field";
import { Notice } from "@/components/Notice";
import { buttonClass, inputClass } from "@/lib/styles";
import { initialActionState } from "@/lib/types";

function PasswordInput({
  id,
  autoComplete,
  minLength,
}: {
  id: string;
  autoComplete: "current-password" | "new-password";
  minLength?: number;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        name="password"
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        required
        minLength={minLength}
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
  );
}

export function LoginForm({ nextPath, passwordReset }: { nextPath: string; passwordReset: boolean }) {
  const [state, formAction, pending] = useActionState(login, initialActionState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={nextPath} />
      {passwordReset ? <Notice tone="success">Your password was updated. Log in with the new one.</Notice> : null}
      {state.error ? <Notice tone="error">{state.error}</Notice> : null}
      <Field label="Email" htmlFor="email" error={state.fieldErrors?.email}>
        <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} />
      </Field>
      <Field label="Password" htmlFor="password" error={state.fieldErrors?.password}>
        <PasswordInput id="password" autoComplete="current-password" />
      </Field>
      <button type="submit" className={`${buttonClass} w-full`} disabled={pending}>
        {pending ? "Logging in..." : "Log in"}
      </button>
      <p className="text-sm text-muted">
        <Link href="/forgot-password" className="font-semibold text-pine hover:underline">
          Forgot password?
        </Link>
      </p>
    </form>
  );
}

export function SignupForm({ nextPath }: { nextPath: string }) {
  const [state, formAction, pending] = useActionState(signup, initialActionState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={nextPath} />
      {state.error ? <Notice tone="error">{state.error}</Notice> : null}
      <Field label="Name" htmlFor="name" error={state.fieldErrors?.name}>
        <input id="name" name="name" autoComplete="name" required minLength={2} maxLength={80} className={inputClass} />
      </Field>
      <Field label="Email" htmlFor="email" error={state.fieldErrors?.email}>
        <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} />
      </Field>
      <Field label="Password" htmlFor="password" error={state.fieldErrors?.password} hint="At least 8 characters.">
        <PasswordInput id="password" autoComplete="new-password" minLength={8} />
      </Field>
      <button type="submit" className={`${buttonClass} w-full`} disabled={pending}>
        {pending ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}

export function ForgotForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initialActionState);

  return (
    <form action={formAction} className="space-y-4">
      {state.success ? <Notice tone="success">{state.success}</Notice> : null}
      {state.devResetUrl ? (
        <p className="text-sm">
          <Link href={state.devResetUrl} className="font-semibold text-pine hover:underline">
            Open reset link
          </Link>
        </p>
      ) : null}
      <Field label="Email" htmlFor="email" error={state.fieldErrors?.email}>
        <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} />
      </Field>
      <button type="submit" className={`${buttonClass} w-full`} disabled={pending}>
        {pending ? "Sending..." : "Send reset email"}
      </button>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPassword, initialActionState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      {state.error ? <Notice tone="error">{state.error}</Notice> : null}
      <Field label="New password" htmlFor="password" error={state.fieldErrors?.password} hint="At least 8 characters.">
        <PasswordInput id="password" autoComplete="new-password" minLength={8} />
      </Field>
      <button type="submit" className={`${buttonClass} w-full`} disabled={pending}>
        {pending ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}

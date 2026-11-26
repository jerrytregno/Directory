"use server";

import { timingSafeEqual } from "crypto";
import { redirect } from "next/navigation";
import { clearSession, getSession, setAuthCookies } from "@/lib/auth";
import { FirebaseAuthError, confirmPasswordReset, lookupIdToken, sendPasswordReset, signIn, signUp } from "@/lib/firebase-auth";
import { runWithToken } from "@/lib/firebase-db";
import { getUser, upsertUserProfile } from "@/lib/store";
import type { ActionState } from "@/lib/types";
import { fieldErrorsFromZod, formString, safeNextPath } from "@/lib/utils";
import { forgotSchema, loginSchema, resetSchema, signupSchema } from "@/lib/validators";

function authFailure(error: unknown, fallback: string): ActionState {
  if (error instanceof FirebaseAuthError && error.code === "OPERATION_NOT_ALLOWED") {
    return { error: "Email and password sign-in is not enabled in the Firebase project yet." };
  }
  if (error instanceof FirebaseAuthError && error.code === "WEAK_PASSWORD") {
    return { fieldErrors: { password: "Use at least 8 characters." } };
  }
  return { error: fallback };
}

export async function signup(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = signupSchema.safeParse({
    name: formString(formData, "name"),
    email: formString(formData, "email"),
    password: formString(formData, "password"),
  });
  if (!parsed.success) return { fieldErrors: fieldErrorsFromZod(parsed.error) };

  const email = parsed.data.email.toLowerCase();
  try {
    const auth = await signUp(email, parsed.data.password);
    const user = await runWithToken(auth.idToken, (db) =>
      upsertUserProfile(db, { id: auth.localId, email, name: parsed.data.name, role: "user" }),
    );
    await setAuthCookies(user, auth.idToken, auth.refreshToken, auth.expiresIn);
  } catch (error) {
    if (error instanceof FirebaseAuthError && error.code === "EMAIL_EXISTS") {
      return { fieldErrors: { email: "An account with this email already exists." } };
    }
    return authFailure(error, "Could not create the account. Try again in a moment.");
  }

  redirect(safeNextPath(formString(formData, "next")));
}

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formString(formData, "email"),
    password: formString(formData, "password"),
  });
  if (!parsed.success) return { fieldErrors: fieldErrorsFromZod(parsed.error) };

  const email = parsed.data.email.toLowerCase();
  try {
    const auth = await signIn(email, parsed.data.password);
    const user = await runWithToken(auth.idToken, async (db) => {
      const existing = await getUser(db, auth.localId);
      const name = existing?.name || auth.email.split("@")[0] || "Member";
      const role = existing?.role === "admin" || auth.email === "admin@blazly.com" ? "admin" : "user";
      if (existing && existing.email === auth.email && existing.name === name && existing.role === role) return existing;
      return upsertUserProfile(db, { id: auth.localId, email: auth.email, name, role });
    });
    await setAuthCookies({ ...user, email: auth.email }, auth.idToken, auth.refreshToken, auth.expiresIn);
  } catch (error) {
    if (
      error instanceof FirebaseAuthError &&
      (error.code === "INVALID_LOGIN_CREDENTIALS" ||
        error.code === "INVALID_PASSWORD" ||
        error.code === "EMAIL_NOT_FOUND" ||
        error.code === "INVALID_EMAIL")
    ) {
      return { error: "Email or password is incorrect." };
    }
    return authFailure(error, "Could not log in. Try again in a moment.");
  }

  redirect(safeNextPath(formString(formData, "next")));
}

function passwordMatches(input: string, expected: string) {
  const left = Buffer.from(input);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function completeGoogleLogin(input: {
  idToken: string;
  refreshToken: string;
  expiresIn: number;
  next?: string;
}): Promise<ActionState> {
  if (!input.idToken || !input.refreshToken) {
    return { error: "Google sign-in did not finish. Try again." };
  }

  try {
    const profile = await lookupIdToken(input.idToken);
    if (!profile.providers.includes("google.com")) {
      return { error: "Continue with the Google account picker." };
    }
    const user = await runWithToken(input.idToken, async (db) => {
      const existing = await getUser(db, profile.localId);
      const name = existing?.name || profile.name || profile.email.split("@")[0] || "Member";
      const role = existing?.role === "admin" || profile.email === "admin@blazly.com" ? "admin" : "user";
      if (existing && existing.email === profile.email && existing.name === name && existing.role === role) return existing;
      return upsertUserProfile(db, { id: profile.localId, email: profile.email, name, role });
    });
    const expiresIn = Number.isFinite(input.expiresIn) && input.expiresIn > 60 ? input.expiresIn : 3600;
    await setAuthCookies({ ...user, email: profile.email }, input.idToken, input.refreshToken, expiresIn);
  } catch (error) {
    if (error instanceof FirebaseAuthError && error.code === "OPERATION_NOT_ALLOWED") {
      return { error: "Google sign-in is not enabled for this project yet." };
    }
    return { error: "Could not sign in with Google. Try again in a moment." };
  }

  redirect(safeNextPath(input.next));
}

export async function unlockAdmin(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const password = formString(formData, "password");
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected || !passwordMatches(password, expected)) {
    return { error: "That password is incorrect." };
  }

  const current = await getSession();
  try {
    const auth = await signIn("admin@blazly.com", expected);
    await runWithToken(auth.idToken, async (db) => {
      const existing = await getUser(db, auth.localId);
      if (existing?.role === "admin") return existing;
      return upsertUserProfile(db, {
        id: auth.localId,
        email: auth.email,
        name: existing?.name || "Blazly Admin",
        role: "admin",
      });
    });
    const signedIn = current ?? { id: auth.localId, email: auth.email, name: "Blazly Admin", role: "user" as const };
    await setAuthCookies({ ...signedIn, role: "admin" }, auth.idToken, auth.refreshToken, auth.expiresIn);
  } catch {
    return { error: "Could not open the admin page. Try again in a moment." };
  }

  redirect("/admin");
}

export async function logout(formData?: FormData) {
  await clearSession();
  const next = formData instanceof FormData ? safeNextPath(formString(formData, "next"), "/") : "/";
  redirect(next);
}

export async function requestPasswordReset(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = forgotSchema.safeParse({ email: formString(formData, "email") });
  if (!parsed.success) return { fieldErrors: fieldErrorsFromZod(parsed.error) };

  const email = parsed.data.email.toLowerCase();
  const success = "If an account exists for that email, a password reset message is on its way.";
  const continueUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/login?reset=1`;

  try {
    await sendPasswordReset(email, continueUrl);
  } catch (error) {
    if (error instanceof FirebaseAuthError && error.code === "OPERATION_NOT_ALLOWED") {
      return { error: "Email and password sign-in is not enabled in the Firebase project yet." };
    }
    if (error instanceof FirebaseAuthError && (error.code.includes("CONTINUE_URI") || error.code === "INVALID_CONTINUE_URI")) {
      try {
        await sendPasswordReset(email);
      } catch (retry) {
        if (retry instanceof FirebaseAuthError && retry.code !== "EMAIL_NOT_FOUND") {
          return { error: "Could not send the reset email. Try again in a moment." };
        }
      }
    }
  }

  return { success };
}

export async function resetPassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = resetSchema.safeParse({
    token: formString(formData, "token"),
    password: formString(formData, "password"),
  });
  if (!parsed.success) return { fieldErrors: fieldErrorsFromZod(parsed.error) };

  try {
    await confirmPasswordReset(parsed.data.token, parsed.data.password);
  } catch (error) {
    if (error instanceof FirebaseAuthError && (error.code === "INVALID_OOB_CODE" || error.code === "EXPIRED_OOB_CODE")) {
      return { error: "This reset link is invalid or has expired." };
    }
    if (error instanceof FirebaseAuthError && error.code === "WEAK_PASSWORD") {
      return { fieldErrors: { password: "Use at least 8 characters." } };
    }
    return { error: "Could not update the password. Request a new reset email." };
  }

  redirect("/login?reset=1");
}

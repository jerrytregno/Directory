"use client";

import { useState } from "react";
import { initializeApp, getApps } from "firebase/app";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { completeGoogleLogin } from "@/lib/actions/auth";
import type { FirebaseWebConfig } from "@/lib/firebase-config";
import { Notice } from "@/components/Notice";
import { buttonSecondaryClass } from "@/lib/styles";

function googleMessage(code: string) {
  if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return "";
  if (code === "auth/popup-blocked") return "Allow pop-ups for this site, then try Google again.";
  if (code === "auth/operation-not-allowed") return "Google sign-in is not enabled for this project yet.";
  if (code === "auth/unauthorized-domain") return "Add this site as an authorized domain in Firebase Authentication.";
  if (code === "auth/account-exists-with-different-credential") {
    return "An account with this email already exists. Log in with email and password.";
  }
  return "Could not sign in with Google. Try again in a moment.";
}

export function GoogleAuthButton({ config, nextPath }: { config: FirebaseWebConfig; nextPath: string }) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function signInWithGoogle() {
    setError("");
    setPending(true);
    try {
      const app = getApps().find((item) => item.name === "blazly-auth") ?? initializeApp(config, "blazly-auth");
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdTokenResult();
      const expiresIn = Math.max(60, Math.floor((new Date(token.expirationTime).getTime() - Date.now()) / 1000));
      const state = await completeGoogleLogin({
        idToken: token.token,
        refreshToken: result.user.refreshToken,
        expiresIn,
        next: nextPath,
      });
      if (state?.error) setError(state.error);
    } catch (caught) {
      if (caught && typeof caught === "object" && "digest" in caught && String(caught.digest).startsWith("NEXT_REDIRECT")) {
        throw caught;
      }
      const code = caught && typeof caught === "object" && "code" in caught ? String(caught.code) : "";
      const message = googleMessage(code);
      if (message) setError(message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4">
      {error ? <Notice tone="error">{error}</Notice> : null}
      <button type="button" className={`${buttonSecondaryClass} w-full gap-3`} disabled={pending} onClick={signInWithGoogle}>
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
          <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.02-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
          <path fill="#FBBC05" d="M3.98 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.3-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.05l3.02-2.33Z" />
          <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.02 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
        </svg>
        {pending ? "Connecting to Google..." : "Continue with Google"}
      </button>
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">or</span>
        <span className="h-px flex-1 bg-line" />
      </div>
    </div>
  );
}

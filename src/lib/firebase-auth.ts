import { getFirebaseConfig } from "./firebase-config";

export class FirebaseAuthError extends Error {
  code: string;

  constructor(code: string) {
    super(code);
    this.name = "FirebaseAuthError";
    this.code = code;
  }
}

export type FirebaseAuthSession = {
  localId: string;
  email: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
};

type AuthResponse = {
  localId?: string;
  email?: string;
  idToken?: string;
  refreshToken?: string;
  expiresIn?: string;
  error?: { message?: string };
};

async function postAuth(path: string, body: Record<string, unknown>) {
  const { apiKey } = getFirebaseConfig();
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/${path}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await response.json()) as AuthResponse;
  if (!response.ok) {
    const code = data.error?.message?.split(" ")[0] || "AUTH_FAILED";
    throw new FirebaseAuthError(code);
  }
  return data;
}

function sessionFrom(data: AuthResponse): FirebaseAuthSession {
  if (!data.localId || !data.idToken || !data.refreshToken || !data.email) {
    throw new FirebaseAuthError("AUTH_FAILED");
  }
  return {
    localId: data.localId,
    email: data.email.toLowerCase(),
    idToken: data.idToken,
    refreshToken: data.refreshToken,
    expiresIn: Number(data.expiresIn) || 3600,
  };
}

export async function signUp(email: string, password: string) {
  const data = await postAuth("accounts:signUp", { email, password, returnSecureToken: true });
  return sessionFrom(data);
}

export async function signIn(email: string, password: string) {
  const data = await postAuth("accounts:signInWithPassword", { email, password, returnSecureToken: true });
  return sessionFrom(data);
}

export async function sendPasswordReset(email: string, continueUrl?: string) {
  await postAuth("accounts:sendOobCode", {
    requestType: "PASSWORD_RESET",
    email,
    ...(continueUrl ? { continueUrl } : {}),
  });
}

export async function confirmPasswordReset(oobCode: string, newPassword: string) {
  await postAuth("accounts:resetPassword", { oobCode, newPassword });
}

export async function updatePassword(idToken: string, password: string) {
  await postAuth("accounts:update", { idToken, password, returnSecureToken: true });
}

export function idTokenExpired(token: string) {
  const part = token.split(".")[1];
  if (!part) return true;
  try {
    const json = JSON.parse(atob(part.replace(/-/g, "+").replace(/_/g, "/"))) as { exp?: number };
    return typeof json.exp !== "number" || json.exp * 1000 < Date.now() + 60_000;
  } catch {
    return true;
  }
}

export async function refreshIdToken(refreshToken: string) {
  const { apiKey } = getFirebaseConfig();
  const response = await fetch(`https://securetoken.googleapis.com/v1/token?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken }),
  });
  const data = (await response.json()) as {
    id_token?: string;
    refresh_token?: string;
    expires_in?: string;
    error?: { message?: string };
  };
  if (!response.ok || !data.id_token || !data.refresh_token) {
    throw new FirebaseAuthError(data.error?.message?.split(" ")[0] || "TOKEN_EXPIRED");
  }
  return {
    idToken: data.id_token,
    refreshToken: data.refresh_token,
    expiresIn: Number(data.expires_in) || 3600,
  };
}

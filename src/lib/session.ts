import { SignJWT, jwtVerify } from "jose";
import type { SessionUser } from "@/lib/types";

export const COOKIE_NAME = "blazly_session";
export const ID_COOKIE = "blazly_id";
export const REFRESH_COOKIE = "blazly_refresh";

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 16) {
    throw new Error("AUTH_SECRET is missing. Add it to your .env file.");
  }
  return new TextEncoder().encode(value);
}

export async function signSession(user: SessionUser) {
  return new SignJWT({ name: user.name, email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (typeof payload.sub !== "string") return null;
    if (typeof payload.name !== "string" || typeof payload.email !== "string") return null;
    if (payload.role !== "admin" && payload.role !== "user") return null;
    return {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

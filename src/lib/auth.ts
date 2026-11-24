import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAME, ID_COOKIE, REFRESH_COOKIE, signSession, verifySessionToken } from "@/lib/session";
import type { SessionUser } from "@/lib/types";

const WEEK = 60 * 60 * 24 * 7;

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function setAuthCookies(user: SessionUser, idToken: string, refreshToken: string, expiresIn: number) {
  const token = await signSession(user);
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, cookieOptions(WEEK));
  jar.set(ID_COOKIE, idToken, cookieOptions(Math.max(60, expiresIn)));
  jar.set(REFRESH_COOKIE, refreshToken, cookieOptions(WEEK));
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
  jar.delete(ID_COOKIE);
  jar.delete(REFRESH_COOKIE);
}

export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/admin");
  return session;
}

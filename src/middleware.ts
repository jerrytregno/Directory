import { NextResponse, type NextRequest } from "next/server";
import { idTokenExpired, refreshIdToken } from "@/lib/firebase-auth";
import { COOKIE_NAME, ID_COOKIE, REFRESH_COOKIE, verifySessionToken } from "@/lib/session";

const WEEK = 60 * 60 * 24 * 7;

function isProtected(pathname: string) {
  return pathname === "/submit" || pathname.startsWith("/submit/") || pathname === "/write-for-us/submit" || pathname.startsWith("/my-posts") || pathname === "/profile" || pathname.startsWith("/profile/");
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

function clearAuth(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, "", cookieOptions(0));
  response.cookies.set(ID_COOKIE, "", cookieOptions(0));
  response.cookies.set(REFRESH_COOKIE, "", cookieOptions(0));
  return response;
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", request.nextUrl.pathname);
  return clearAuth(NextResponse.redirect(url));
}

export async function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get(COOKIE_NAME)?.value;
  const session = sessionToken ? await verifySessionToken(sessionToken) : null;
  const protectedPath = isProtected(request.nextUrl.pathname);

  if (!session) {
    if (!protectedPath) return NextResponse.next();
    const url = request.nextUrl.clone();
    url.pathname = request.nextUrl.pathname === "/submit" || request.nextUrl.pathname.startsWith("/submit/") ? "/signup" : "/login";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  let idToken = request.cookies.get(ID_COOKIE)?.value ?? "";
  let refreshed: { idToken: string; refreshToken: string; expiresIn: number } | null = null;

  if (!idToken || idTokenExpired(idToken)) {
    const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
    if (!refreshToken) {
      return protectedPath ? redirectToLogin(request) : clearAuth(NextResponse.next());
    }
    try {
      refreshed = await refreshIdToken(refreshToken);
      idToken = refreshed.idToken;
    } catch {
      return protectedPath ? redirectToLogin(request) : clearAuth(NextResponse.next());
    }
  }

  const headers = new Headers(request.headers);
  headers.set("x-blazly-id-token", idToken);
  const response = NextResponse.next({ request: { headers } });
  if (refreshed) {
    response.cookies.set(ID_COOKIE, refreshed.idToken, cookieOptions(refreshed.expiresIn));
    response.cookies.set(REFRESH_COOKIE, refreshed.refreshToken, cookieOptions(WEEK));
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)", "/tool/:domain*"],
};

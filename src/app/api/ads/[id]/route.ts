import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { recordAdClick } from "@/lib/ads";

const COOKIE = "blazly_ad_vid";
const YEAR = 60 * 60 * 24 * 365;

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const current = request.headers.get("cookie")?.match(/(?:^|;\s*)blazly_ad_vid=([^;]+)/)?.[1] ?? "";
  const visitorId = current || randomUUID();
  const destination = await recordAdClick(id, visitorId).catch(() => null);
  const target = destination || new URL("/", request.url).toString();
  const response = NextResponse.redirect(target);
  if (!current) {
    response.cookies.set(COOKIE, visitorId, { httpOnly: true, sameSite: "lax", path: "/", maxAge: YEAR });
  }
  return response;
}

import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { recordAdImpressions } from "@/lib/ads";

const COOKIE = "blazly_ad_vid";
const YEAR = 60 * 60 * 24 * 365;

export async function POST(request: Request) {
  let ids: string[] = [];
  try {
    const body = (await request.json()) as { ids?: unknown };
    if (Array.isArray(body.ids)) ids = body.ids.filter((id): id is string => typeof id === "string" && id.length > 0 && id.length < 80);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const current = request.headers.get("cookie")?.match(/(?:^|;\s*)blazly_ad_vid=([^;]+)/)?.[1] ?? "";
  const visitorId = current || randomUUID();
  const counted = ids.length > 0 ? await recordAdImpressions(ids, visitorId).catch(() => 0) : 0;
  const response = NextResponse.json({ ok: true, counted });
  if (!current) {
    response.cookies.set(COOKIE, visitorId, { httpOnly: true, sameSite: "lax", path: "/", maxAge: YEAR });
  }
  return response;
}

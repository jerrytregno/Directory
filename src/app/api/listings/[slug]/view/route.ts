import { NextResponse } from "next/server";
import { recordProfileView } from "@/lib/community";
import { getPublicDb } from "@/lib/firebase-db";
import { getListing } from "@/lib/store";

export async function POST(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const listing = await getListing(getPublicDb(), slug);
  if (!listing || listing.status !== "approved") {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const header = _request.headers.get("cookie") ?? "";
  const current = header.match(/(?:^|;\s*)blazly_vid=([^;]+)/)?.[1];
  const visitorId = current && /^[a-zA-Z0-9]{16,64}$/.test(current) ? current : crypto.randomUUID().replace(/-/g, "");

  try {
    await recordProfileView(listing.id, visitorId);
  } catch {
    // Analytics should not block the listing page when rules reject the write.
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("blazly_vid", visitorId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}

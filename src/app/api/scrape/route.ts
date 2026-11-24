import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { scrapeWebsite } from "@/lib/scrape-site";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign up before submitting a website." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { url?: string } | null;
  const url = body?.url?.trim() || "";
  if (!url) return NextResponse.json({ error: "Paste a website URL." }, { status: 400 });

  try {
    const site = await scrapeWebsite(url);
    return NextResponse.json(site);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not read that website.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

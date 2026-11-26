import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { INDUSTRIES } from "@/lib/constants";
import { readBusinessProfile } from "@/lib/gemini";
import { scrapeWebsite } from "@/lib/scrape-site";

function withoutMoney(value: string) {
  return value
    .replace(/\$\d[\d,]*(?:\.\d+)?(?:\s*\/\s*[A-Za-z]+)?/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([.,])/g, "$1")
    .trim();
}

function cleanName(value: string) {
  const cut = value.split(/\s*[|–—]\s+|\s*:\s+/)[0]?.trim() || value.trim();
  return (cut.length >= 2 ? cut : value.trim()).slice(0, 80);
}

function firstSentence(value: string) {
  const parts = value.split(/\n+/).map((part) => withoutMoney(part).replace(/\s+/g, " ").trim()).filter((part) => part.length >= 20);
  for (const part of parts) {
    const end = part.search(/[.!?](\s|$)/);
    if (end >= 19 && end <= 179) return part.slice(0, end + 1);
  }
  const text = parts.join(" ");
  const sentence = text.match(/[A-Z][^!?]{40,160}[.!?]/);
  if (sentence) return sentence[0];
  const slice = text.slice(0, 177);
  const space = slice.lastIndexOf(" ");
  return (space > 40 ? slice.slice(0, space) : slice).trim();
}

function chooseProducts(model: string, schemaProducts: string, headingText: string, name: string) {
  const listed = (value: string) =>
    value
      .split("\n")
      .map((item) => withoutMoney(item))
      .filter((item) => item && item.toLowerCase() !== name.toLowerCase());
  const fromModel = listed(model);
  if (fromModel.length >= 2) return fromModel.slice(0, 12).join("\n");
  const fromSchema = listed(schemaProducts);
  if (fromSchema.length >= 2) return fromSchema.slice(0, 12).join("\n");
  const fromHeadings = headingText
    .split("\n")
    .map((item) => item.trim())
    .filter((item) => {
      const words = item.split(/\s+/);
      if (words.length > 4 || item.length < 3 || item.length > 32) return false;
      if (/[.,!?]/.test(item)) return false;
      if (/^(what|pick|all|watch|talk|on your|two|it|your|nothing|every)\b/i.test(item)) return false;
      if (item.toLowerCase() === name.toLowerCase()) return false;
      return true;
    });
  const chosen = fromHeadings.length >= 2 ? fromHeadings : fromModel.length ? fromModel : fromSchema;
  return chosen.slice(0, 8).join("\n");
}

const INDUSTRY_HINTS: Array<[(typeof INDUSTRIES)[number], RegExp]> = [
  ["Finance", /financ|ledger|invoice|accounting/i],
  ["Artificial Intelligence", /artificial intelligence|machine learning|\bllm\b/i],
  ["Marketing", /\bmarketing\b|\bseo\b|campaign/i],
  ["Design", /design system|ui kit/i],
  ["Analytics", /\banalytics\b|dashboard/i],
  ["Customer Support", /customer support|help desk/i],
  ["Software", /developer|openapi|\bapi\b|software/i],
];

function guessIndustry(text: string, current: string) {
  if ((INDUSTRIES as readonly string[]).includes(current)) return current;
  const match = INDUSTRY_HINTS.find(([, pattern]) => pattern.test(text));
  return match && (INDUSTRIES as readonly string[]).includes(match[0]) ? match[0] : "";
}

function readableDescription(model: string, scraped: string) {
  const paragraphs = scraped
    .split(/\n+/)
    .map((part) => withoutMoney(part))
    .filter((part) => part.length > 80 || /[.!?]$/.test(part));
  const modelText = withoutMoney(model);
  if (!modelText.slice(0, 90).includes(".") && paragraphs.length) return paragraphs.join("\n\n").slice(0, 5000);
  return modelText;
}

function shortEnough(primary: string, fallback: string) {
  const first = withoutMoney(primary).replace(/\s+/g, " ").trim();
  if (first.length >= 20 && /[.!?]$/.test(first)) return first.slice(0, 180);
  const second = firstSentence(fallback);
  if (second.length >= 20) return second;
  return first.slice(0, 180);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign up before submitting a website." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { url?: string } | null;
  const url = body?.url?.trim() || "";
  if (!url) return NextResponse.json({ error: "Paste a website URL." }, { status: 400 });

  try {
    const site = await scrapeWebsite(url);
    const profile = await readBusinessProfile({ url: site.websiteUrl, name: site.name, text: site.sourceText }).catch(() => null);
    const description = readableDescription(profile?.description || "", site.description);
    const name = cleanName(profile?.name || site.name);
    const products = chooseProducts(profile?.products || "", site.products, site.headings, name);
    const email = site.contactEmail || (profile?.contactEmail?.includes("@") ? profile.contactEmail : "");
    return NextResponse.json({
      name,
      websiteUrl: site.websiteUrl,
      slogan: shortEnough(profile?.shortDescription || "", site.description || description),
      description,
      githubUrl: site.githubUrl,
      demoVideoUrl: site.demoVideoUrl,
      twitterUrl: site.twitterUrl,
      linkedinUrl: site.linkedinUrl,
      contactEmail: email,
      logoUrl: site.logoUrl,
      businessType: profile?.businessType || site.businessType,
      industry: guessIndustry(`${description}\n${site.sourceText}`, profile?.industry || site.industry),
      region: profile?.region || site.region,
      products,
      benefits: withoutMoney(profile?.benefits || ""),
      tags: profile?.tags || "",
      category: profile?.category || "",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not read that website.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

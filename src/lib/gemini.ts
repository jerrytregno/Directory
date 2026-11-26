import { INDUSTRIES, PRICING_MODELS, type PricingModel } from "@/lib/constants";

export type DiscoveredTool = {
  name: string;
  websiteUrl: string;
  shortDescription: string;
  category: string;
  pricing: PricingModel;
};

const MODELS = ["gemini-3.1-flash-lite"];

function asPricing(value: unknown): PricingModel {
  return PRICING_MODELS.includes(value as PricingModel) ? (value as PricingModel) : "Paid";
}

function asUrl(value: unknown) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

function parseProducts(text: string): DiscoveredTool[] {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < start) return [];
  const parsed = JSON.parse(text.slice(start, end + 1)) as { products?: unknown };
  if (!Array.isArray(parsed.products)) return [];
  const tools: DiscoveredTool[] = [];
  for (const item of parsed.products) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const websiteUrl = asUrl(record.websiteUrl);
    const name = typeof record.name === "string" ? record.name.trim() : "";
    const shortDescription = typeof record.shortDescription === "string" ? record.shortDescription.trim() : "";
    const category = typeof record.category === "string" ? record.category.trim() : "";
    if (!websiteUrl || name.length < 2 || shortDescription.length < 12) continue;
    tools.push({
      name: name.slice(0, 80),
      websiteUrl,
      shortDescription: shortDescription.slice(0, 220),
      category: category.slice(0, 60) || "Software",
      pricing: asPricing(record.pricing),
    });
    if (tools.length === 4) break;
  }
  return tools;
}

export async function discoverTools(query: string, category?: string) {
  const key = process.env.GEMINI_API_KEY;
  const q = query.trim();
  if (!key || q.length < 2) return [];

  const prompt = `You identify real software, AI tools, SaaS products, and businesses.
Search query: ${q}
${category ? `Category the person is browsing: ${category}` : ""}
Return up to 4 real products that match this query. If the query is a product or company name, put that exact product first.
Use the official website. Do not invent companies.
Reply with JSON only:
{"products":[{"name":"","websiteUrl":"https://","shortDescription":"","category":"","pricing":"Free|Freemium|Paid"}]}`;

  for (const model of MODELS) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key,
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
        }),
        cache: "no-store",
      });
      if (!response.ok) continue;
      const data = (await response.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
      const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("") || "";
      const tools = parseProducts(text);
      if (tools.length > 0) return tools;
    } catch {
      continue;
    }
  }
  return [];
}

export type BusinessProfile = {
  name: string;
  businessType: string;
  industry: string;
  region: string;
  shortDescription: string;
  description: string;
  products: string;
  benefits: string;
  tags: string;
  category: string;
  contactEmail: string;
};

function clip(value: unknown, max: number) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

function lines(value: unknown, max: number) {
  const source = Array.isArray(value) ? value : typeof value === "string" ? value.split(/\n|•|,/) : [];
  const items = source
    .map((item) => (typeof item === "string" ? item.replace(/\s+/g, " ").trim() : ""))
    .filter((item, index, all) => item.length > 1 && item.length < 140 && all.indexOf(item) === index);
  return items.slice(0, 12).join("\n").slice(0, max);
}

function parseBusiness(text: string): BusinessProfile | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < start) return null;
  const record = JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>;
  const industry = clip(record.industry, 40);
  return {
    name: clip(record.name, 80),
    businessType: clip(record.businessType, 40),
    industry: (INDUSTRIES as readonly string[]).find((item) => item.toLowerCase() === industry.toLowerCase()) ?? "",
    region: clip(record.region, 80),
    shortDescription: clip(record.shortDescription, 180),
    description: typeof record.description === "string" ? record.description.trim().slice(0, 5000) : "",
    products: lines(record.products, 2000),
    benefits: lines(record.benefits, 2000),
    tags: lines(record.tags, 200).replace(/\n/g, ", "),
    category: clip(record.category, 60),
    contactEmail: clip(record.contactEmail, 120).toLowerCase(),
  };
}

export async function readBusinessProfile(input: { url: string; name: string; text: string }) {
  const key = process.env.GEMINI_API_KEY;
  const text = input.text.trim();
  if (!key || text.length < 40) return null;

  const prompt = `Read this business website and extract only facts that appear in the text.
Website: ${input.url}
Page title: ${input.name}
Industries to choose from, or leave blank: ${INDUSTRIES.join(", ")}

Return JSON only:
{"name":"","businessType":"","industry":"","region":"","shortDescription":"","description":"","products":[],"benefits":[],"tags":[],"category":"","contactEmail":""}

shortDescription is one complete sentence ending with a period, 20 to 180 characters, about what the business does.
description is a fuller account of the business, in plain sentences, and does not repeat a cut-off title.
products are the named products, modules, or services. When the section headings name something the business offers, include those headings. Skip slogans, prices, and calls to action.
region is the country or region where the business is based or the places it says it serves. Use a place name only when the text states it.
Do not invent companies, products, regions, or contact details. Leave a field empty when the text does not say it.
Do not include prices.

Website text:
${text.slice(0, 12000)}`;

  for (const model of MODELS) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key,
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, responseMimeType: "application/json" },
        }),
        signal: AbortSignal.timeout(20000),
        cache: "no-store",
      });
      if (!response.ok) continue;
      const data = (await response.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
      const reply = data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("") || "";
      const profile = parseBusiness(reply);
      if (profile && (profile.name || profile.shortDescription || profile.products || profile.description || profile.region)) return profile;
    } catch {
      continue;
    }
  }
  return null;
}

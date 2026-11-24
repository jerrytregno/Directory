import { PRICING_MODELS, type PricingModel } from "@/lib/constants";

export type DiscoveredTool = {
  name: string;
  websiteUrl: string;
  shortDescription: string;
  category: string;
  pricing: PricingModel;
};

const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest"];

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

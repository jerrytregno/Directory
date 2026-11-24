import { lookup } from "dns/promises";
import { isIP } from "net";

export type ScrapedSite = {
  name: string;
  websiteUrl: string;
  slogan: string;
  description: string;
  githubUrl: string;
  demoVideoUrl: string;
  twitterUrl: string;
  linkedinUrl: string;
  contactEmail: string;
  logoUrl: string;
  categoryHint: string;
};

const BLOCKED_HOSTS = new Set(["localhost", "metadata.google.internal", "metadata.internal"]);

function decode(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, " ")
    .trim();
}

function cleanUrl(value: string) {
  const url = new URL(value.trim());
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("Enter a website URL starting with http:// or https://.");
  if (url.username || url.password) throw new Error("That website URL is not allowed.");
  const host = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (BLOCKED_HOSTS.has(host) || host.endsWith(".local") || host.endsWith(".localhost")) {
    throw new Error("That website URL is not allowed.");
  }
  url.hash = "";
  return url;
}

function blockedAddress(address: string) {
  const ip = address.toLowerCase().replace(/^\[|\]$/g, "");
  const mapped = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return blockedAddress(mapped[1]);
  if (ip.includes(":")) {
    return ip === "::" || ip === "::1" || ip.startsWith("fe80:") || ip.startsWith("fc") || ip.startsWith("fd");
  }
  const parts = ip.split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part) || part < 0 || part > 255)) return true;
  const [a, b] = parts;
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
}

async function assertPublic(url: URL) {
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (isIP(host)) {
    if (blockedAddress(host)) throw new Error("That website URL is not allowed.");
    return;
  }
  const records = await lookup(host, { all: true, verbatim: true });
  if (records.length === 0 || records.some((record) => blockedAddress(record.address))) {
    throw new Error("That website URL is not allowed.");
  }
}

async function readPublic(url: URL, accept: string) {
  let current = url;
  for (let hop = 0; hop < 4; hop += 1) {
    await assertPublic(current);
    const response = await fetch(current, {
      redirect: "manual",
      headers: { Accept: accept, "User-Agent": "BlazlyBot/1.0" },
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) throw new Error("The website did not return a page.");
      current = cleanUrl(new URL(location, current).toString());
      continue;
    }
    if (!response.ok) throw new Error("The website did not return a page.");
    return { response, url: current };
  }
  throw new Error("The website redirected too many times.");
}

function meta(html: string, key: string) {
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${key}["']`, "i"),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decode(match[1]);
  }
  return "";
}

function absolute(value: string, base: URL) {
  if (!value) return "";
  try {
    return cleanUrl(new URL(value, base).toString()).toString();
  } catch {
    return "";
  }
}

function firstMatch(html: string, pattern: RegExp) {
  const match = html.match(pattern);
  return match?.[1] ? decode(match[1]) : "";
}

export async function scrapeWebsite(raw: string): Promise<ScrapedSite> {
  const start = cleanUrl(raw);
  const { response, url } = await readPublic(start, "text/html,application/xhtml+xml");
  const type = response.headers.get("content-type") || "";
  if (!type.includes("html") && !type.includes("xml")) throw new Error("That address did not return a web page.");
  const html = (await response.text()).slice(0, 1_500_000);
  const title = meta(html, "og:title") || firstMatch(html, /<title[^>]*>([^<]+)<\/title>/i);
  const description = meta(html, "og:description") || meta(html, "description");
  const paragraph = firstMatch(html, /<p[^>]*>([^<]{40,500})<\/p>/i);
  const name = title.replace(/\s+[|–—-]\s+.*$/, "").slice(0, 80);
  const sloganSource = description || paragraph || name;
  const slogan = sloganSource.slice(0, 180);
  const longDescription = [description, paragraph].filter(Boolean).join("\n\n").slice(0, 5000);
  const github = absolute(firstMatch(html, /href=["'](https?:\/\/github\.com\/[^"'#?\s]+)["']/i), url);
  const video = absolute(
    firstMatch(html, /href=["'](https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=[^"'#\s]+|youtu\.be\/[^"'#\s]+|vimeo\.com\/\d+[^"'#\s]*))["']/i),
    url,
  );
  const twitter = absolute(firstMatch(html, /href=["'](https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/[^"'#?\s]+)["']/i), url);
  const linkedin = absolute(firstMatch(html, /href=["'](https?:\/\/(?:www\.)?linkedin\.com\/[^"'#?\s]+)["']/i), url);
  const contactEmail = firstMatch(html, /href=["']mailto:([^"'?\s]+)["']/i).slice(0, 120);
  const logo = absolute(meta(html, "og:image") || firstMatch(html, /<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]+href=["']([^"']+)["']/i), url);

  if (name.length < 2 && slogan.length < 12) throw new Error("That page did not include a name or description to use.");

  return {
    name,
    websiteUrl: url.toString(),
    slogan,
    description: longDescription || slogan,
    githubUrl: github,
    demoVideoUrl: video,
    twitterUrl: twitter,
    linkedinUrl: linkedin,
    contactEmail,
    logoUrl: logo,
    categoryHint: meta(html, "keywords"),
  };
}

export async function downloadPublicImage(raw: string) {
  const url = cleanUrl(raw);
  const { response } = await readPublic(url, "image/png,image/jpeg,image/webp,image/gif");
  const type = (response.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
  if (!["image/png", "image/jpeg", "image/webp", "image/gif"].includes(type)) return null;
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength === 0 || bytes.byteLength > 2 * 1024 * 1024) return null;
  return { bytes, type };
}

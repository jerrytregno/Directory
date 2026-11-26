import { createHash, randomBytes } from "crypto";
import type { ZodError } from "zod";

export function slugify(input: string) {
  const slug = input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return slug || "listing";
}

export function websiteKey(value: string) {
  const url = new URL(value);
  return url.hostname.replace(/^www\./, "").toLowerCase();
}

export function domainFromUrl(value: string) {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
}

export function toolPath(websiteUrl: string) {
  try {
    return `/tool/${websiteKey(websiteUrl)}`;
  } catch {
    return null;
  }
}

export function websiteLogoUrl(value: string) {
  try {
    const host = new URL(value).hostname;
    if (!host) return null;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`;
  } catch {
    return null;
  }
}

export function buildSearchText(values: Array<string | null | undefined>) {
  return values
    .filter((value): value is string => Boolean(value && value.trim()))
    .join(" ")
    .toLowerCase();
}

export function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function parsePage(value?: string) {
  const page = Number(value);
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.floor(page);
}

export function safeNextPath(value: unknown, fallback = "/") {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("://") || value.includes("\\")) {
    return fallback;
  }
  return value;
}

export function randomToken() {
  return randomBytes(32).toString("hex");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function fieldErrorsFromZod(error: ZodError) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

export function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export function listingPath(params: Record<string, string | undefined>, page?: number) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  if (page && page > 1) search.set("page", String(page));
  const query = search.toString();
  return query ? `?${query}` : "";
}

export function isUniqueConflict(error: unknown) {
  return error instanceof Error && (error.name === "DuplicateWebsiteError" || error.message === "DUPLICATE_WEBSITE");
}

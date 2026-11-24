import sanitizeHtml from "sanitize-html";
import { z } from "zod";
import type { ActionState } from "@/lib/types";

export const GUEST_TOPICS = [
  "Artificial Intelligence",
  "SaaS and Software",
  "SEO and Digital Marketing",
  "Generative Engine Optimization (GEO)",
  "Business Growth",
  "Startups and Entrepreneurship",
  "Technology",
  "Productivity and Automation",
  "Social Media Marketing",
  "Content Marketing",
] as const;

export const GUEST_STATUSES = ["draft", "submitted", "under_review", "approved", "rejected", "published"] as const;

export type GuestPostStatus = (typeof GUEST_STATUSES)[number];

export type GuestPost = {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  authorBio: string;
  authorImage: string | null;
  title: string;
  slug: string;
  shortDescription: string;
  content: string;
  featuredImage: string | null;
  category: string;
  tags: string[];
  authorWebsite: string;
  linkedinUrl: string;
  twitterUrl: string;
  status: GuestPostStatus;
  adminFeedback: string;
  featured: boolean;
  scheduledAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GuestNotification = {
  id: string;
  userId: string;
  postId: string;
  kind: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export type GuestDraft = {
  title: string;
  shortDescription: string;
  content: string;
  category: string;
  tags: string[];
  authorName: string;
  authorEmail: string;
  authorBio: string;
  authorWebsite: string;
  linkedinUrl: string;
  twitterUrl: string;
};

const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .refine((value) => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }, "Enter a full URL starting with http:// or https://.");

function field(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export function sanitizeArticleHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [
      "h1",
      "h2",
      "h3",
      "p",
      "br",
      "strong",
      "em",
      "b",
      "i",
      "ul",
      "ol",
      "li",
      "a",
      "blockquote",
      "code",
      "pre",
      "img",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title"],
      th: ["colspan", "rowspan"],
      td: ["colspan", "rowspan"],
      code: ["class"],
    },
    allowedClasses: {
      code: [/^language-/],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          href: attribs.href || "",
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
    },
  });
}

export function plainText(html: string) {
  return sanitizeArticleHtml(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export function wordCount(html: string) {
  const text = plainText(html);
  if (!text) return 0;
  return text.split(" ").length;
}

export function readingMinutes(html: string) {
  return Math.max(1, Math.round(wordCount(html) / 200));
}

function headingSlug(value: string) {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return slug || "section";
}

export function prepareArticle(html: string) {
  const safe = sanitizeArticleHtml(html);
  const toc: { id: string; text: string; level: 2 | 3 }[] = [];
  const withIds = safe.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi, (_match, level: string, attrs: string, inner: string) => {
    const text = plainText(inner);
    const base = headingSlug(text);
    const id = toc.some((item) => item.id === base) ? `${base}-${toc.length + 1}` : base;
    toc.push({ id, text: text || "Section", level: Number(level) as 2 | 3 });
    const cleaned = attrs.replace(/\sid=(["']).*?\1/i, "");
    return `<h${level}${cleaned} id="${id}">${inner}</h${level}>`;
  });
  return { html: withIds, toc };
}

export function guestStatusLabel(status: string) {
  if (status === "submitted") return "Pending";
  if (status === "under_review") return "Under review";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function absoluteAssetUrl(base: string, value: string | null) {
  if (!value) return undefined;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/")) return `${base}${value}`;
  return undefined;
}

export function isLivePost(post: Pick<GuestPost, "status" | "scheduledAt">, now = Date.now()) {
  if (post.status !== "published") return false;
  if (post.scheduledAt && new Date(post.scheduledAt).getTime() > now) return false;
  return true;
}

export function readGuestFields(formData: FormData, intent: "draft" | "submitted"): { ok: true; data: GuestDraft } | { ok: false; state: ActionState } {
  const rawTags = field(formData, "tags")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const category = field(formData, "category").trim();
  const parsed = z
    .object({
      title: z.string().trim().min(4, "Add a title of at least 4 characters.").max(140, "Keep the title under 140 characters."),
      shortDescription: z.string().trim().max(300, "Keep the short description under 300 characters."),
      content: z.string().max(200_000, "This article is too long."),
      authorName: z.string().trim().max(80, "Keep the author name under 80 characters."),
      authorEmail: z.string().trim().max(160),
      authorBio: z.string().trim().max(600, "Keep the bio under 600 characters."),
      authorWebsite: optionalUrl,
      linkedinUrl: optionalUrl,
      twitterUrl: optionalUrl,
    })
    .safeParse({
      title: field(formData, "title"),
      shortDescription: field(formData, "shortDescription"),
      content: sanitizeArticleHtml(field(formData, "content")),
      authorName: field(formData, "authorName"),
      authorEmail: field(formData, "authorEmail"),
      authorBio: field(formData, "authorBio"),
      authorWebsite: field(formData, "authorWebsite"),
      linkedinUrl: field(formData, "linkedinUrl"),
      twitterUrl: field(formData, "twitterUrl"),
    });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "");
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, state: { fieldErrors } };
  }

  const fieldErrors: Record<string, string> = {};
  if (rawTags.length > 8) fieldErrors.tags = "Use 8 tags or fewer.";
  if (rawTags.some((tag) => tag.length > 40)) fieldErrors.tags = "Keep each tag under 40 characters.";
  const knownCategory = (GUEST_TOPICS as readonly string[]).includes(category);

  if (parsed.data.authorEmail && !z.string().email().safeParse(parsed.data.authorEmail).success) {
    fieldErrors.authorEmail = "Enter a valid email address.";
  }

  if (intent === "submitted") {
    if (parsed.data.title.trim().length < 8) fieldErrors.title = "Use a title of at least 8 characters.";
    if (parsed.data.shortDescription.trim().length < 40) {
      fieldErrors.shortDescription = "Add a short description of at least 40 characters.";
    }
    if (wordCount(parsed.data.content) < 80) {
      fieldErrors.content = "Write at least 80 words before submitting. We recommend 800 or more.";
    }
    if (!knownCategory) fieldErrors.category = "Choose a topic.";
    if (parsed.data.authorName.trim().length < 2) fieldErrors.authorName = "Add the author's name.";
    if (!z.string().email().safeParse(parsed.data.authorEmail).success) fieldErrors.authorEmail = "Enter a valid author email.";
    if (parsed.data.authorBio.trim().length < 40) fieldErrors.authorBio = "Add an author bio of at least 40 characters.";
  }

  if (Object.keys(fieldErrors).length > 0) return { ok: false, state: { fieldErrors } };

  return {
    ok: true,
    data: {
      ...parsed.data,
      authorEmail: parsed.data.authorEmail.toLowerCase(),
      category: knownCategory ? category : "",
      tags: rawTags.slice(0, 8),
    },
  };
}

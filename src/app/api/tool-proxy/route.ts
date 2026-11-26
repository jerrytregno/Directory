import { getListingSlugByDomain } from "@/lib/queries";
import { isKnownToolUrl } from "@/lib/tool-sites";
import { websiteKey } from "@/lib/utils";

export async function GET(request: Request) {
  const target = new URL(request.url).searchParams.get("url") ?? "";
  let targetUrl: URL;
  try {
    targetUrl = new URL(target);
  } catch {
    return new Response("Not found", { status: 404 });
  }
  if (targetUrl.protocol !== "http:" && targetUrl.protocol !== "https:") {
    return new Response("Not found", { status: 404 });
  }

  const slug = await getListingSlugByDomain(targetUrl.hostname);
  if (!slug && !isKnownToolUrl(targetUrl)) return new Response("Not found", { status: 404 });

  const response = await fetch(targetUrl, {
    redirect: "follow",
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "User-Agent": "Mozilla/5.0",
    },
  }).catch(() => null);
  if (!response) return new Response("Not found", { status: 404 });

  const finalHost = new URL(response.url).hostname;
  if (websiteKey(`https://${finalHost}`) !== websiteKey(`https://${targetUrl.hostname}`)) {
    return new Response("Not found", { status: 404 });
  }

  const type = response.headers.get("content-type") ?? "";
  if (!type.includes("text/html") && !type.includes("application/xhtml+xml")) {
    return new Response("Not found", { status: 404 });
  }

  let html = await response.text();
  html = html.replace(/<meta[^>]+http-equiv=["']content-security-policy["'][^>]*>/gi, "");
  html = html.replace(/<base\b[^>]*>/gi, "");
  html = pointAtOrigin(html, targetUrl.origin);
  const bridge = `<base href="${targetUrl.origin}/"><script>${bridgeScript}</script>`;
  html = /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, (head) => `${head}${bridge}`) : `${bridge}${html}`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Content-Security-Policy": "frame-ancestors 'self'",
    },
  });
}

function pointAtOrigin(html: string, origin: string) {
  return html
    .replace(/(\s(?:href|src|action|poster)=)(["'])\/(?!\/)/gi, `$1$2${origin}/`)
    .replace(/(\ssrcset=)(["'])([^"']*)\2/gi, (_match, attr, quote, value) => {
      const next = String(value).replace(/(^|,\s*)\/(?!\/)/g, `$1${origin}/`);
      return `${attr}${quote}${next}${quote}`;
    })
    .replace(/url\(\s*(["']?)\/(?!\/)/gi, `url($1${origin}/`)
    .replace(/(["'])\/(?!\/|api\/tool-proxy)/g, `$1${origin}/`);
}

const bridgeScript = `
document.addEventListener("click", function (event) {
  var node = event.target;
  var link = node && node.closest ? node.closest("a[href]") : null;
  if (!link) return;
  var href = link.href;
  if (!/^https?:/i.test(href)) return;
  event.preventDefault();
  location.href = "/api/tool-proxy?url=" + encodeURIComponent(href);
}, true);
`;

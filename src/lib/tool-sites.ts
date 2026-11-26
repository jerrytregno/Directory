import { alsoLaunching, pastWinners, topWinners, weekLaunches } from "@/data/devhunt-home";
import { websiteKey } from "@/lib/utils";

type ToolSite = { domain: string; url: string };

const sites: ToolSite[] = [...weekLaunches, ...alsoLaunching, ...topWinners, ...pastWinners];

function sameDomain(left: string, right: string) {
  return left.toLowerCase() === right.toLowerCase();
}

export function resolveToolWebsite(segments: string[]) {
  if (segments.length === 0) return null;
  const decoded = segments.map((part) => {
    try {
      return decodeURIComponent(part);
    } catch {
      return part;
    }
  });
  if (decoded.length === 1) {
    const matches = sites.filter((site) => sameDomain(site.domain, decoded[0]));
    if (matches.length === 1) return matches[0].url;
  }
  const joined = decoded.join("/");
  const match = sites.find((site) => {
    try {
      const path = new URL(site.url).pathname.replace(/\/$/, "");
      return sameDomain(`${site.domain}${path}`, joined);
    } catch {
      return false;
    }
  });
  return match?.url ?? null;
}

export function isKnownToolUrl(target: URL) {
  const host = websiteKey(target.href);
  const path = target.pathname.replace(/\/$/, "") || "/";
  return sites.some((site) => {
    let known: URL;
    try {
      known = new URL(site.url);
    } catch {
      return false;
    }
    if (websiteKey(known.href) !== host) return false;
    const knownPath = known.pathname.replace(/\/$/, "") || "/";
    if (knownPath === "/") return true;
    return path === knownPath || path.startsWith(`${knownPath}/`);
  });
}

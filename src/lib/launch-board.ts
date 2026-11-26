import { cookies } from "next/headers";
import { collection, getDocs, query, where } from "firebase/firestore";
import { weekLaunches, type DevLaunch } from "@/data/devhunt-home";
import { getPublicDb } from "@/lib/firebase-db";
import { listListings } from "@/lib/store";
import { domainFromUrl, websiteLogoUrl } from "@/lib/utils";

export type RankedLaunch = DevLaunch & { id: string };

const LIMIT = 50;
const HIDDEN_OWNERS = new Set(["admin@blazly.com", "submit.preview.blazly@gmail.com"]);

type Scored = RankedLaunch & { source: "board" | "submission"; submittedAt: number };

function boardId(domain: string) {
  return `board:${domain.toLowerCase()}`;
}

export function listingVoteId(id: string) {
  return `listing:${id}`;
}

export function baselineVotes(id: string) {
  if (id.startsWith("board:")) {
    const domain = id.slice("board:".length);
    return weekLaunches.find((item) => item.domain.toLowerCase() === domain)?.votes ?? 0;
  }
  return 0;
}

function rank(items: Scored[]) {
  const sorted = [...items].sort((a, b) => {
    if (b.votes !== a.votes) return b.votes - a.votes;
    if (a.source !== b.source) return a.source === "board" ? -1 : 1;
    return a.submittedAt - b.submittedAt;
  });
  const visible = sorted.slice(0, LIMIT);
  const newest = [...items]
    .filter((item) => item.source === "submission" && item.votes === 0)
    .sort((a, b) => b.submittedAt - a.submittedAt)[0];
  if (newest && !visible.some((item) => item.id === newest.id)) {
    if (visible.length < LIMIT) visible.push(newest);
    else visible[LIMIT - 1] = newest;
  }
  return visible.map((item, index) => ({ ...item, rank: index + 1 }));
}

export async function loadLaunchBoard() {
  const visitorId = (await cookies()).get("blazly_voter")?.value ?? "";
  const board: Scored[] = weekLaunches.map((item) => ({
    ...item,
    id: boardId(item.domain),
    source: "board",
    submittedAt: 0,
  }));
  const taken = new Set(board.map((item) => item.domain.toLowerCase()));
  let stored = new Map<string, number>();
  let votedIds: string[] = [];

  try {
    const db = getPublicDb();
    const [listings, voteSnap, voterSnap] = await Promise.all([
      listListings(db, { status: "approved" }),
      getDocs(collection(db, "launchVotes")),
      visitorId
        ? getDocs(query(collection(db, "launchVoters"), where("visitor", "==", visitorId)))
        : Promise.resolve(null),
    ]);
    stored = new Map(
      voteSnap.docs.map((item) => {
        const votes = item.data().votes;
        return [item.id, typeof votes === "number" ? votes : 0] as const;
      }),
    );
    votedIds = voterSnap ? voterSnap.docs.map((item) => String(item.data().key ?? "")) : [];

    for (const listing of listings) {
      if (HIDDEN_OWNERS.has(listing.ownerEmail.toLowerCase())) continue;
      if (listing.websiteKey.endsWith(".example")) continue;
      const domain = (listing.websiteKey || domainFromUrl(listing.websiteUrl)).toLowerCase();
      if (!domain || taken.has(domain)) continue;
      taken.add(domain);
      const id = listingVoteId(listing.id);
      board.push({
        id,
        rank: 0,
        name: listing.name,
        slogan: listing.shortDescription,
        logo: listing.logoUrl || websiteLogoUrl(listing.websiteUrl) || "",
        url: listing.websiteUrl,
        domain,
        views: listing.viewCount,
        votes: 0,
        today: 0,
        pricing: "",
        tags: [],
        source: "submission",
        submittedAt: listing.createdAt.getTime(),
      });
    }
  } catch {
    stored = new Map();
    votedIds = [];
  }

  const scored = board.map((item) => ({
    ...item,
    votes: stored.has(item.id) ? stored.get(item.id)! : item.votes,
  }));

  return { launches: rank(scored), votedIds };
}

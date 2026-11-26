"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { getPublicDb } from "@/lib/firebase-db";
import { baselineVotes } from "@/lib/launch-board";

const COOKIE = "blazly_voter";
const YEAR = 60 * 60 * 24 * 365;

export async function castLaunchVote(key: string) {
  if (!/^((board:[a-z0-9.-]+)|(listing:[A-Za-z0-9_-]+))$/.test(key)) {
    return { ok: false as const, votes: 0, voted: false };
  }

  const jar = await cookies();
  let visitor = jar.get(COOKIE)?.value;
  if (!visitor) {
    visitor = randomUUID();
    jar.set(COOKIE, visitor, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: YEAR });
  }

  const db = getPublicDb();
  const voteRef = doc(db, "launchVotes", key);
  const voterRef = doc(db, "launchVoters", `${key}_${visitor}`);
  const [voteSnap, voterSnap] = await Promise.all([getDoc(voteRef), getDoc(voterRef)]);
  const already = voterSnap.exists();
  const current = voteSnap.exists() && typeof voteSnap.data().votes === "number" ? voteSnap.data().votes : baselineVotes(key);
  const votes = Math.max(0, current + (already ? -1 : 1));

  await setDoc(voteRef, { votes });
  if (already) await deleteDoc(voterRef);
  else await setDoc(voterRef, { key, visitor });

  revalidatePath("/");
  return { ok: true as const, votes, voted: !already };
}

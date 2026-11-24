import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Firestore } from "firebase/firestore";
import { runWithToken } from "@/lib/firebase-db";
import { ID_COOKIE } from "@/lib/session";

export async function readIdToken() {
  const headerStore = await headers();
  const fromHeader = headerStore.get("x-blazly-id-token");
  if (fromHeader) return fromHeader;
  const jar = await cookies();
  return jar.get(ID_COOKIE)?.value ?? null;
}

export async function tryUserFirestore<T>(fn: (db: Firestore) => Promise<T>) {
  const token = await readIdToken();
  if (!token) return null;
  try {
    return await runWithToken(token, fn);
  } catch (error) {
    if (error instanceof Error && error.message === "Firebase session expired. Log in again.") return null;
    throw error;
  }
}

export async function withUserFirestore<T>(fn: (db: Firestore) => Promise<T>) {
  const token = await readIdToken();
  if (!token) redirect("/login");
  try {
    return await runWithToken(token, fn);
  } catch (error) {
    if (error instanceof Error && error.message === "Firebase session expired. Log in again.") {
      redirect("/login");
    }
    throw error;
  }
}

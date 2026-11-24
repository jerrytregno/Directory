import { deleteApp, getApps, initializeApp, initializeServerApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore, memoryLocalCache, type Firestore } from "firebase/firestore";
import { getFirebaseConfig } from "./firebase-config";

const PUBLIC_APP = "blazly-public";

function attachFirestore(app: FirebaseApp) {
  try {
    return initializeFirestore(app, {
      localCache: memoryLocalCache(),
      experimentalForceLongPolling: true,
    });
  } catch {
    return getFirestore(app);
  }
}

export function getPublicDb() {
  const existing = getApps().find((app) => app.name === PUBLIC_APP);
  const app = existing ?? initializeApp(getFirebaseConfig(), PUBLIC_APP);
  return attachFirestore(app);
}

export async function runWithToken<T>(idToken: string, fn: (db: Firestore) => Promise<T>) {
  const app = initializeServerApp(getFirebaseConfig(), { authIdToken: idToken });
  try {
    const auth = getAuth(app);
    await auth.authStateReady();
    if (!auth.currentUser) {
      throw new Error("Firebase session expired. Log in again.");
    }
    return await fn(attachFirestore(app));
  } finally {
    await deleteApp(app).catch(() => undefined);
  }
}

import { randomUUID } from "crypto";
import { deleteApp, initializeServerApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { getFirebaseConfig } from "@/lib/firebase-config";
import { readIdToken } from "@/lib/request-db";
import { savePublicImage } from "@/lib/uploads";

const TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

async function uploadToStorage(idToken: string, path: string, bytes: Uint8Array, contentType: string) {
  const app = initializeServerApp(getFirebaseConfig(), { authIdToken: idToken });
  try {
    const auth = getAuth(app);
    await auth.authStateReady();
    if (!auth.currentUser) throw new Error("Firebase session expired. Log in again.");
    const storage = getStorage(app);
    const stored = ref(storage, path);
    await uploadBytes(stored, bytes, { contentType });
    return getDownloadURL(stored);
  } finally {
    await deleteApp(app).catch(() => undefined);
  }
}

export async function storeAdCreative(file: File) {
  if (!(file instanceof File) || file.size === 0) return { url: null as string | null };
  if (file.size > 2 * 1024 * 1024) return { url: null, error: "The creative must be 2MB or smaller." };
  const extension = TYPES[file.type];
  if (!extension) return { url: null, error: "The creative must be a PNG, JPG, WEBP, or GIF." };

  const token = await readIdToken();
  if (token) {
    try {
      const url = await uploadToStorage(token, `ads/${randomUUID()}.${extension}`, new Uint8Array(await file.arrayBuffer()), file.type);
      return { url };
    } catch (error) {
      console.error("Firebase Storage upload failed; the creative was saved locally instead.", error instanceof Error ? error.message : "upload failed");
    }
  }

  return savePublicImage(file, "Creative");
}

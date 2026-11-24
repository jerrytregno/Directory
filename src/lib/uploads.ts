import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { downloadPublicImage } from "@/lib/scrape-site";

const TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

async function writeImage(file: File, label: string) {
  if (file.size === 0) return { url: null as string | null };
  if (file.size > 2 * 1024 * 1024) return { url: null, error: `${label} must be 2MB or smaller.` };
  const extension = TYPES[file.type];
  if (!extension) return { url: null, error: `${label} must be a PNG, JPG, WEBP, or GIF.` };
  const filename = `${randomUUID()}.${extension}`;
  const directory = path.join(process.cwd(), "public", "uploads");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), Buffer.from(await file.arrayBuffer()));
  return { url: `/uploads/${filename}` };
}

export async function savePublicImage(file: File, label = "Image") {
  return writeImage(file, label);
}

export async function saveRemoteLogo(url: string) {
  try {
    const image = await downloadPublicImage(url);
    if (!image) return { url: null as string | null };
    const extension = TYPES[image.type];
    if (!extension) return { url: null as string | null };
    const filename = `${randomUUID()}.${extension}`;
    const directory = path.join(process.cwd(), "public", "uploads");
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, filename), Buffer.from(image.bytes));
    return { url: `/uploads/${filename}` };
  } catch {
    return { url: null as string | null };
  }
}

export async function saveLogo(file: FormDataEntryValue | null) {
  if (!(file instanceof File) || file.size === 0) return { url: null as string | null };
  return writeImage(file, "Logo");
}

export async function saveGallery(files: FormDataEntryValue[]) {
  const images = files.filter((file): file is File => file instanceof File && file.size > 0).slice(0, 4);
  const urls: string[] = [];
  for (const file of images) {
    const saved = await writeImage(file, "Screenshot");
    if (saved.error) return { urls, error: saved.error };
    if (saved.url) urls.push(saved.url);
  }
  return { urls };
}

export async function deleteLogo(url: string | null | undefined) {
  if (!url || !url.startsWith("/uploads/")) return;
  const filename = path.basename(url);
  await unlink(path.join(process.cwd(), "public", "uploads", filename)).catch(() => undefined);
}

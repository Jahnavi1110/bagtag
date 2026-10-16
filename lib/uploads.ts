import "server-only";
import fs from "node:fs";
import path from "node:path";
import { nanoid } from "nanoid";
import { detectImageType, MAX_UPLOAD_BYTES, UPLOAD_NAME_RE } from "./imageType";

const UPLOAD_DIR = () => process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");

/** Saves an uploaded image under a random name. Returns the file name or an error message. */
export async function saveImage(file: File): Promise<{ name: string } | { error: string }> {
  if (file.size > MAX_UPLOAD_BYTES) return { error: "Photo must be 2 MB or smaller" };
  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = detectImageType(bytes);
  if (!type) return { error: "Photo must be a PNG, JPEG, GIF or WebP image" };
  const name = `${nanoid(21)}.${type.ext}`;
  fs.mkdirSync(UPLOAD_DIR(), { recursive: true });
  fs.writeFileSync(path.join(UPLOAD_DIR(), name), bytes);
  return { name };
}

export function readUpload(name: string): Buffer | null {
  if (!UPLOAD_NAME_RE.test(name)) return null;
  try {
    return fs.readFileSync(path.join(UPLOAD_DIR(), name));
  } catch {
    return null;
  }
}

export function deleteUpload(name: string) {
  if (UPLOAD_NAME_RE.test(name)) fs.rmSync(path.join(UPLOAD_DIR(), name), { force: true });
}

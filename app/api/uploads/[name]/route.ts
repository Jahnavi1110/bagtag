import { mimeForFile } from "@/lib/imageType";
import { readUpload } from "@/lib/uploads";

/** GET /api/uploads/:name: serves tag photos. Names are random and validated, so no directory traversal. */
export async function GET(_: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const file = readUpload(name);
  const mime = mimeForFile(name);
  if (!file || !mime) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(file), {
    headers: { "Content-Type": mime, "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" },
  });
}

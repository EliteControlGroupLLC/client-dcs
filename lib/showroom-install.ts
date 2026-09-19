import { readFile } from "node:fs/promises";
import path from "node:path";
import { gateShowroomRequest } from "@/lib/showroom-gate";

const SHOWROOM_ROOT = path.join(process.cwd(), "public_html", "showroom");
const SHOWROOM_ASSETS_ROOT = path.join(SHOWROOM_ROOT, "assets");

const CONTENT_TYPES: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
};

// Serves the store's HTML entry — behind the showroom lead gate
// (lib/showroom-gate.ts). The response depends on the visitor's lead-pass
// cookie, so it must never be shared-cached.
export async function getShowroomInstallResponse(request: Request) {
  const gate = gateShowroomRequest(request);
  if (!gate.allowed) return gate.response;

  const filePath = path.join(SHOWROOM_ROOT, "index.html");
  const html = await readFile(filePath, "utf8");

  const headers = new Headers({
    "content-type": "text/html; charset=utf-8",
    "cache-control": "private, no-cache",
    vary: "Cookie",
  });
  if (gate.setCookie) headers.append("set-cookie", gate.setCookie);
  return new Response(html, { headers });
}

export async function getShowroomAssetResponse(assetPath: string[]) {
  const relativePath = assetPath.join("/");
  const normalizedPath = path.normalize(path.join(SHOWROOM_ASSETS_ROOT, relativePath));

  if (!normalizedPath.startsWith(SHOWROOM_ASSETS_ROOT)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const file = await readFile(normalizedPath);
    const extension = path.extname(normalizedPath).toLowerCase();
    const contentType = CONTENT_TYPES[extension] || "application/octet-stream";

    return new Response(file, {
      headers: {
        "content-type": contentType,
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

// Where the showroom lead gate may send a visitor back to. Pure / client-safe.

export const SHOWROOM_ACCESS_PATH = "/showroom-access";
export const DEFAULT_SHOWROOM_PATH = "/showroom";

// Only the store's own HTML entry points — never an arbitrary URL (open redirect).
const SHOWROOM_PATH_RE = /^\/(showroom|showroom-html|showroom-install|public-html\/showroom)(\/[^?#]*)?(\?[^#]*)?$/;

export function safeShowroomNext(next: unknown): string {
  if (typeof next !== "string") return DEFAULT_SHOWROOM_PATH;
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return DEFAULT_SHOWROOM_PATH;
  if (!SHOWROOM_PATH_RE.test(next)) return DEFAULT_SHOWROOM_PATH;
  if (next.startsWith("/showroom/assets")) return DEFAULT_SHOWROOM_PATH;
  return next;
}

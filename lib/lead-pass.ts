// Lead pass — a signed, httpOnly cookie proving this browser already submitted
// (and phone-verified) its contact info through a lead gate. Lets returning
// visitors open other tools / the showroom without re-entering the form, while
// still registering a BuildCore lead per interest (deduped 24h via `recent`).
// Stateless (HMAC) like lib/verification-token.ts, so it works across
// serverless instances. Server-only.

import { createHmac, timingSafeEqual } from "node:crypto";

export const LEAD_PASS_COOKIE = "dcs_lead_pass";
export const LEAD_PASS_TTL_MS = 90 * 24 * 60 * 60 * 1000; // 90 days
export const INTEREST_DEDUPE_MS = 24 * 60 * 60 * 1000; // one lead per interest per 24h

export interface LeadPassPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  propertyAddress: string;
  issuedAt: number;
  phoneVerified: boolean;
  /** interest key -> last time a BuildCore lead was pushed for it (ms epoch) */
  recent: Record<string, number>;
}

function secret(): string | null {
  return process.env.VERIFICATION_TOKEN_SECRET || process.env.TWILIO_AUTH_TOKEN || null;
}

export function isLeadPassConfigured(): boolean {
  return secret() !== null;
}

function sign(payload: string, key: string): string {
  return createHmac("sha256", key).update(`lead-pass:${payload}`).digest("base64url");
}

/** Serialize + sign a pass. Returns null when no signing secret is configured. */
export function encodeLeadPass(pass: LeadPassPayload): string | null {
  const key = secret();
  if (!key) return null;
  // Drop dedupe entries older than the window so the cookie stays small.
  const now = Date.now();
  const recent: Record<string, number> = {};
  for (const [k, t] of Object.entries(pass.recent || {})) {
    if (typeof t === "number" && now - t < INTEREST_DEDUPE_MS) recent[k] = t;
  }
  const payload = Buffer.from(JSON.stringify({ ...pass, recent })).toString("base64url");
  return `${payload}.${sign(payload, key)}`;
}

/** Verify signature + expiry. Returns the payload, or null if missing/invalid/expired. */
export function readLeadPass(value: string | undefined | null): LeadPassPayload | null {
  const key = secret();
  if (!key || !value || typeof value !== "string") return null;
  const [payload, sig] = value.split(".");
  if (!payload || !sig) return null;
  const expected = Buffer.from(sign(payload, key));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const p = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Partial<LeadPassPayload>;
    if (
      typeof p.issuedAt !== "number" ||
      Date.now() - p.issuedAt > LEAD_PASS_TTL_MS ||
      typeof p.email !== "string" ||
      typeof p.phone !== "string" ||
      typeof p.firstName !== "string"
    ) {
      return null;
    }
    return {
      firstName: p.firstName,
      lastName: typeof p.lastName === "string" ? p.lastName : "",
      email: p.email,
      phone: p.phone,
      propertyAddress: typeof p.propertyAddress === "string" ? p.propertyAddress : "",
      issuedAt: p.issuedAt,
      phoneVerified: p.phoneVerified === true,
      recent: p.recent && typeof p.recent === "object" ? p.recent : {},
    };
  } catch {
    return null;
  }
}

/** Build a fresh pass for a newly verified visitor. */
export function newLeadPass(info: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  propertyAddress: string;
  phoneVerified: boolean;
}): LeadPassPayload {
  return { ...info, issuedAt: Date.now(), recent: {} };
}

/** True if a lead for this interest was already pushed within the dedupe window. */
export function wasInterestRecentlyRegistered(pass: LeadPassPayload, interestKey: string): boolean {
  const t = pass.recent[interestKey];
  return typeof t === "number" && Date.now() - t < INTEREST_DEDUPE_MS;
}

export function markInterestRegistered(pass: LeadPassPayload, interestKey: string): LeadPassPayload {
  return { ...pass, recent: { ...pass.recent, [interestKey]: Date.now() } };
}

/**
 * Cookie options. Expiry is anchored to issuedAt, so re-issuing the cookie to
 * update `recent` never extends the 90-day life of the pass.
 * Secure in production; on http://localhost dev it can't be (Safari drops
 * Secure cookies on plain http).
 */
export function leadPassCookieOptions(pass: LeadPassPayload) {
  const remainingMs = Math.max(0, pass.issuedAt + LEAD_PASS_TTL_MS - Date.now());
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: Math.floor(remainingMs / 1000),
  };
}

/** Full Set-Cookie header value, for plain `Response` objects (route handlers). */
export function serializeLeadPassCookie(pass: LeadPassPayload): string | null {
  const value = encodeLeadPass(pass);
  if (!value) return null;
  const o = leadPassCookieOptions(pass);
  return [
    `${LEAD_PASS_COOKIE}=${value}`,
    `Path=${o.path}`,
    `Max-Age=${o.maxAge}`,
    "HttpOnly",
    "SameSite=Lax",
    o.secure ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

/** Read the pass inside a server component / server action. */
export async function getLeadPassFromCookies(): Promise<LeadPassPayload | null> {
  const { cookies } = await import("next/headers");
  const store = await cookies();
  return readLeadPass(store.get(LEAD_PASS_COOKIE)?.value);
}

/** Read the pass from a raw Request (route handlers that get a plain Request). */
export function getLeadPassFromRequest(request: Request): LeadPassPayload | null {
  const header = request.headers.get("cookie") || "";
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === LEAD_PASS_COOKIE) {
      return readLeadPass(decodeURIComponent(part.slice(idx + 1).trim()));
    }
  }
  return null;
}

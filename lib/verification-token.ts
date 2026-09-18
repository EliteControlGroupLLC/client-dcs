// Signed proof that a phone number passed Twilio Verify. Issued by
// /api/verify-phone after an approved code check and re-checked by
// /api/property-report, so "phone verified" can't be forged by the browser.
// Stateless (HMAC) so it works across serverless instances.

import { createHmac, timingSafeEqual } from "node:crypto";

const TTL_MS = 60 * 60 * 1000; // 1 hour to finish the form after verifying

function secret(): string | null {
  return process.env.VERIFICATION_TOKEN_SECRET || process.env.TWILIO_AUTH_TOKEN || null;
}

export function normalizePhoneE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  return `+${digits}`;
}

function sign(payload: string, key: string): string {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

export function issuePhoneToken(phone: string): string | null {
  const key = secret();
  if (!key) return null;
  const payload = Buffer.from(
    JSON.stringify({ p: normalizePhoneE164(phone), exp: Date.now() + TTL_MS })
  ).toString("base64url");
  return `${payload}.${sign(payload, key)}`;
}

export function isPhoneTokenValid(token: unknown, phone: string): boolean {
  const key = secret();
  if (!key || typeof token !== "string") return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = Buffer.from(sign(payload, key));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return false;
  try {
    const { p, exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return p === normalizePhoneE164(phone) && typeof exp === "number" && exp > Date.now();
  } catch {
    return false;
  }
}

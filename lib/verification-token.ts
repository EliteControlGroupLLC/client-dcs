// Signed proof that a phone number passed Twilio Verify. Issued by
// /api/verify-phone after an approved code check and re-checked by every lead
// endpoint (/api/contact, /api/leads, /api/property-report, /api/lead-gate),
// so "phone verified" can't be forged by the browser.
// Stateless (HMAC) so it works across serverless instances.
//
// There is a second kind of token: an UNVERIFIED pass, issued only when the
// server itself decides the number cannot be checked right now (Twilio not
// configured, or its API down). It is still signed — the browser can't mint
// one — but it says "we couldn't check", not "this number is real". Lead
// endpoints accept it and flag the lead as phone-unverified rather than
// dropping a real customer because our SMS provider is having a bad day.

import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * How long a verification stays usable after the code is confirmed.
 *
 * The token proves "this number answered a text just now". It is bound to the
 * phone number but not to a single submission, so anyone holding one can post
 * leads with it until it expires — an hour of that is a wide window for a
 * number that was verified once. Ten minutes is comfortably longer than it
 * takes to finish a form and short enough that a leaked token is worthless by
 * the time anyone reuses it.
 *
 * Returning visitors are unaffected: they are carried by the 90-day lead-pass
 * cookie, not by this token.
 */
const TTL_MS = 10 * 60 * 1000;

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

function issue(phone: string, verified: boolean): string | null {
  const key = secret();
  if (!key) return null;
  // `v` is only written for the unverified variant, so tokens issued by older
  // deploys (no `v` at all) still read as verified.
  const body: Record<string, unknown> = { p: normalizePhoneE164(phone), exp: Date.now() + TTL_MS };
  if (!verified) body.v = false;
  const payload = Buffer.from(JSON.stringify(body)).toString("base64url");
  return `${payload}.${sign(payload, key)}`;
}

/** Proof that this number passed an SMS code check. */
export function issuePhoneToken(phone: string): string | null {
  return issue(phone, true);
}

/**
 * Proof that the SERVER could not run an SMS check for this number right now
 * (Twilio unconfigured or erroring). NOT proof the number is real — lead
 * endpoints accept it but record the lead as phone-unverified.
 */
export function issueUnverifiedPhoneToken(phone: string): string | null {
  return issue(phone, false);
}

export interface PhoneTokenResult {
  /** Signature + expiry are good and the token was issued for this number. */
  valid: boolean;
  /** The number actually passed an SMS code check (false for a bypass token). */
  phoneVerified: boolean;
}

/** Full read of a phone token: is it ours, and does it mean "verified"? */
export function readPhoneToken(token: unknown, phone: string): PhoneTokenResult {
  const fail: PhoneTokenResult = { valid: false, phoneVerified: false };
  const key = secret();
  if (!key || typeof token !== "string") return fail;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return fail;
  const expected = Buffer.from(sign(payload, key));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return fail;
  try {
    const { p, exp, v } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (p !== normalizePhoneE164(phone) || typeof exp !== "number" || exp <= Date.now()) return fail;
    return { valid: true, phoneVerified: v !== false };
  } catch {
    return fail;
  }
}

/** True only for a token proving this number passed an SMS code check. */
export function isPhoneTokenValid(token: unknown, phone: string): boolean {
  const result = readPhoneToken(token, phone);
  return result.valid && result.phoneVerified;
}

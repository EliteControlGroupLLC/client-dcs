// Signed proof that a property report was produced by our server. Issued by
// /api/analyze-property alongside the result and re-checked by
// /api/property-report, so the PDF + CRM notes attached to a lead can't be
// built from data the browser made up. Stateless (HMAC) so it works across
// serverless instances.

import { createHash, createHmac, timingSafeEqual } from "node:crypto";

const TTL_MS = 24 * 60 * 60 * 1000; // a scan stays submittable for 24h

function secret(): string | null {
  return process.env.VERIFICATION_TOKEN_SECRET || process.env.TWILIO_AUTH_TOKEN || null;
}

/** JSON with object keys sorted, so the digest doesn't depend on key order. */
function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return `[${value.map((v) => stableStringify(v === undefined ? null : v)).join(",")}]`;
  const entries = Object.keys(value as Record<string, unknown>)
    .filter((k) => (value as Record<string, unknown>)[k] !== undefined)
    .sort()
    .map((k) => `${JSON.stringify(k)}:${stableStringify((value as Record<string, unknown>)[k])}`);
  return `{${entries.join(",")}}`;
}

function digest(report: unknown): string {
  // Round-trip through JSON first so server objects and the copy the browser
  // posts back (Dates → strings, undefined dropped) hash identically.
  const normalized = JSON.parse(JSON.stringify(report));
  return createHash("sha256").update(stableStringify(normalized)).digest("base64url");
}

function sign(payload: string, key: string): string {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

export function signReport(report: unknown): string | null {
  const key = secret();
  if (!key) return null;
  const exp = String(Date.now() + TTL_MS);
  return `${exp}.${sign(`${exp}.${digest(report)}`, key)}`;
}

export function isReportSignatureValid(report: unknown, token: unknown): boolean {
  const key = secret();
  if (!key || typeof token !== "string" || report == null) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || !(Number(exp) > Date.now())) return false;
  try {
    const expected = Buffer.from(sign(`${exp}.${digest(report)}`, key));
    const given = Buffer.from(sig);
    return expected.length === given.length && timingSafeEqual(expected, given);
  } catch {
    return false;
  }
}

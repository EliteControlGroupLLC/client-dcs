// Server-side lead-gate helpers shared by /api/lead-gate and the showroom
// route handlers: interest validation + "push one BuildCore lead per
// (email, interest) per 24h". Server-only.

import { BUILDCORE_SERVICE_LINES, pushLeadToBuildCore, type BuildCoreServiceLine } from "@/lib/buildcore-intake";
import type { LeadGateInterest } from "@/lib/lead-gate-interests";
import {
  INTEREST_DEDUPE_MS,
  markInterestRegistered,
  wasInterestRecentlyRegistered,
  type LeadPassPayload,
} from "@/lib/lead-pass";

export function parseInterest(raw: unknown): LeadGateInterest | null {
  if (!raw || typeof raw !== "object") return null;
  const { key, label, serviceLine } = raw as Record<string, unknown>;
  if (typeof key !== "string" || !/^[a-z0-9-]{1,40}$/.test(key)) return null;
  if (typeof label !== "string" || !label.trim() || label.length > 80) return null;
  if (typeof serviceLine !== "string" || !BUILDCORE_SERVICE_LINES.includes(serviceLine as BuildCoreServiceLine)) {
    return null;
  }
  return { key, label: label.trim(), serviceLine: serviceLine as BuildCoreServiceLine };
}

export function isTwilioConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_VERIFY_SERVICE_SID
  );
}

// Per-instance backstop for the cookie-based dedupe: covers concurrent
// requests (React dev double-mount, two tabs) that both carry the old cookie.
const recentServerSide = new Map<string, number>();

function claimInterest(email: string, key: string): boolean {
  const now = Date.now();
  if (recentServerSide.size > 5000) {
    for (const [k, t] of recentServerSide) if (now - t >= INTEREST_DEDUPE_MS) recentServerSide.delete(k);
  }
  const id = `${email.toLowerCase()}|${key}`;
  const t = recentServerSide.get(id);
  if (t && now - t < INTEREST_DEDUPE_MS) return false;
  recentServerSide.set(id, now);
  return true;
}

function releaseInterest(email: string, key: string) {
  recentServerSide.delete(`${email.toLowerCase()}|${key}`);
}

function formatDetails(details: unknown): string | null {
  if (details == null || details === "") return null;
  const text = typeof details === "string" ? details : JSON.stringify(details);
  return text.slice(0, 1500);
}

export interface RegisterResult {
  pass: LeadPassPayload;
  /** true when a BuildCore push was attempted (not deduped) */
  pushed: boolean;
  crmSynced: boolean;
}

export interface RegisterContext {
  pageUrl?: string | null;
  details?: unknown;
  /** false = fresh form submission: always pushed (explicit intent), still recorded for dedupe */
  returning: boolean;
}

/**
 * Synchronous dedupe decision. Returns the pass with this interest marked as
 * registered (to be written back to the cookie) when a lead should be pushed,
 * or null when one was already pushed for this (email, interest) in 24h.
 */
export function claimInterestLead(
  pass: LeadPassPayload,
  interest: LeadGateInterest,
  returning: boolean
): LeadPassPayload | null {
  const claimed = claimInterest(pass.email, interest.key);
  if (returning && (wasInterestRecentlyRegistered(pass, interest.key) || !claimed)) return null;
  return markInterestRegistered(pass, interest.key);
}

/** Push the BuildCore lead. Never throws — failures are logged; returns success. */
export async function pushInterestLead(
  pass: LeadPassPayload,
  interest: LeadGateInterest,
  ctx: RegisterContext
): Promise<boolean> {
  const isShowroom = interest.key === "showroom";
  const details = formatDetails(ctx.details);
  const notes = [
    isShowroom
      ? `Website showroom: ${interest.label} (offer shown: "Unlock up to 30% off").`
      : `Website tool: ${interest.label}`,
    `Phone verified: ${pass.phoneVerified ? "yes" : "no"}.`,
    ctx.returning
      ? `Returning visitor (lead pass issued ${new Date(pass.issuedAt).toISOString().slice(0, 10)}).`
      : "New visitor — submitted the lead gate form.",
    ctx.pageUrl ? `Page: ${ctx.pageUrl}` : null,
    details ? `Details: ${details}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const lead = {
    firstName: pass.firstName,
    lastName: pass.lastName,
    email: pass.email,
    phone: pass.phone,
    propertyAddress: pass.propertyAddress,
    serviceLine: interest.serviceLine,
    source: isShowroom ? ("website-showroom" as const) : ("website-tool" as const),
    notes,
  };
  try {
    let result = await pushLeadToBuildCore(lead);
    // Deploy-order safety net: if BuildCore doesn't know this source yet,
    // don't lose the lead — resend it as a generic website lead.
    if (!result.success && result.status === 400 && /source/i.test(result.error ?? "")) {
      console.warn(`[lead-gate] BuildCore rejected source "${lead.source}" — retrying as website-contact`);
      result = await pushLeadToBuildCore({ ...lead, source: "website-contact" });
    }
    if (!result.success) {
      console.error(`[lead-gate] BuildCore push failed (${interest.key}):`, JSON.stringify(result));
      releaseInterest(pass.email, interest.key);
    } else {
      console.info(`[lead-gate] BuildCore lead pushed (${interest.key}, ${interest.serviceLine})`);
    }
    return result.success;
  } catch (err) {
    console.error(`[lead-gate] BuildCore push threw (${interest.key}):`, err);
    releaseInterest(pass.email, interest.key);
    return false;
  }
}

/** claim + push in one call (awaits the CRM push). */
export async function registerInterestLead(
  pass: LeadPassPayload,
  interest: LeadGateInterest,
  ctx: RegisterContext
): Promise<RegisterResult> {
  const updated = claimInterestLead(pass, interest, ctx.returning);
  if (!updated) return { pass, pushed: false, crmSynced: false };
  const crmSynced = await pushInterestLead(updated, interest, ctx);
  // Only remember the interest when BuildCore actually has the lead, so a
  // failed push is retried on the visitor's next visit.
  return { pass: crmSynced ? updated : pass, pushed: true, crmSynced };
}

/** Best-effort page URL for CRM notes: explicit client value, else Referer. */
export function resolvePageUrl(request: Request, clientValue: unknown): string | null {
  const v = typeof clientValue === "string" && clientValue.length <= 500 ? clientValue : request.headers.get("referer");
  if (!v) return null;
  try {
    const u = new URL(v);
    return `${u.origin}${u.pathname}${u.search}`.slice(0, 500);
  } catch {
    return null;
  }
}

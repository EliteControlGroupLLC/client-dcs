// Server-side lead gate for the showroom store (the wevisu SPA served from
// public_html/showroom). Visitors without a lead pass are redirected to
// /showroom-access ("Unlock up to 30% off" + lead form); visitors with a pass
// get the store, and a showroom lead is registered in BuildCore (deduped 24h).
// Server-only.

import { after } from "next/server";
import { LEAD_GATE_INTERESTS } from "@/lib/lead-gate-interests";
import { claimInterestLead, pushInterestLead } from "@/lib/lead-gate-server";
import { getLeadPassFromRequest, isLeadPassConfigured, serializeLeadPassCookie } from "@/lib/lead-pass";
import { SHOWROOM_ACCESS_PATH, safeShowroomNext } from "@/lib/showroom-access";

export type ShowroomGateResult =
  | { allowed: false; response: Response }
  | { allowed: true; setCookie: string | null };

export function gateShowroomRequest(request: Request): ShowroomGateResult {
  // Without a signing secret no pass can ever be issued — fail open rather
  // than lock everyone out of the store.
  if (!isLeadPassConfigured()) {
    console.warn("[showroom-gate] No VERIFICATION_TOKEN_SECRET / TWILIO_AUTH_TOKEN — showroom gate disabled");
    return { allowed: true, setCookie: null };
  }

  const url = new URL(request.url);
  const pass = getLeadPassFromRequest(request);

  if (!pass) {
    const target = new URL(SHOWROOM_ACCESS_PATH, url);
    target.searchParams.set("next", safeShowroomNext(`${url.pathname}${url.search}`));
    return {
      allowed: false,
      response: new Response(null, {
        status: 307,
        headers: { Location: target.toString(), "Cache-Control": "private, no-store" },
      }),
    };
  }

  const interest = LEAD_GATE_INTERESTS.showroom;
  const updated = claimInterestLead(pass, interest, true);
  if (!updated) return { allowed: true, setCookie: null };

  // Push after the response so the store isn't held up by the CRM call.
  const pageUrl = `${url.origin}${url.pathname}`;
  after(() => pushInterestLead(updated, interest, { pageUrl, returning: true }));
  return { allowed: true, setCookie: serializeLeadPassCookie(updated) };
}

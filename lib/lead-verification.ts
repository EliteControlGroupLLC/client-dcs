// The one place every public lead endpoint asks "is this phone number real?".
//
// A browser saying `phoneVerified: true` is worth nothing — anyone can POST
// that straight to the endpoint, which is how a lead named "Christopher
// Hughes" arrived with a phone number nobody could dial. So the proof is
// always something the SERVER signed:
//
//   1. a phone token from /api/verify-phone (the visitor passed an SMS code), or
//   2. a lead pass cookie (lib/lead-pass) whose phone matches — this browser
//      already verified this number, so a returning visitor is never asked
//      for a second code, or
//   3. a signed "we couldn't check" token, or no Twilio configuration at all.
//
// Case 3 is a deliberate policy call: if our SMS provider is down we accept
// the lead and flag it as unverified rather than dropping it. Losing a real
// customer because Twilio is having a bad day is worse than one unverified
// lead the owner can call. It is still not forgeable — the browser cannot
// mint the bypass token, only /api/verify-phone can.
//
// Server-only.

import { getLeadPassFromRequest, newLeadPass, type LeadPassPayload } from "@/lib/lead-pass";
import { isTwilioConfigured } from "@/lib/lead-gate-server";
import { normalizePhoneE164, readPhoneToken } from "@/lib/verification-token";

export type PhoneGateVia = "sms-token" | "lead-pass" | "verification-unavailable" | "rejected";

export interface PhoneGateResult {
  /** May this submission proceed at all? */
  ok: boolean;
  /** Did the number actually pass an SMS check? Goes into the CRM notes. */
  phoneVerified: boolean;
  via: PhoneGateVia;
  /** The visitor's existing lead pass, if this browser holds one. */
  pass: LeadPassPayload | null;
}

/** Same number, ignoring formatting and a leading US country code. */
export function samePhoneNumber(a: string, b: string): boolean {
  if (!a || !b) return false;
  return normalizePhoneE164(a) === normalizePhoneE164(b);
}

/**
 * Decide whether a lead submission's phone number is trustworthy.
 * `tag` only labels the log line (e.g. "CONTACT", "LEADS").
 */
export function checkPhoneVerification(
  request: Request,
  phone: string,
  phoneToken: unknown,
  tag: string
): PhoneGateResult {
  const pass = getLeadPassFromRequest(request);
  const token = readPhoneToken(phoneToken, phone);

  // 1. Fresh SMS proof for this exact number.
  if (token.valid && token.phoneVerified) {
    return { ok: true, phoneVerified: true, via: "sms-token", pass };
  }

  // 2. This browser already verified this number (90-day lead pass).
  if (pass?.phoneVerified && samePhoneNumber(pass.phone, phone)) {
    return { ok: true, phoneVerified: true, via: "lead-pass", pass };
  }

  // 3. Verification genuinely wasn't available. Take the lead, flag it, shout.
  const bypassToken = token.valid && !token.phoneVerified;
  if (bypassToken || !isTwilioConfigured()) {
    console.error(
      `[${tag}] PHONE NOT VERIFIED — accepting the lead anyway because SMS verification was unavailable ` +
        `(${bypassToken ? "signed bypass from /api/verify-phone" : "Twilio not configured"}). ` +
        `Call this number back to confirm it is real.`
    );
    return { ok: true, phoneVerified: false, via: "verification-unavailable", pass };
  }

  return { ok: false, phoneVerified: false, via: "rejected", pass };
}

/** The CRM note line. Matches the wording lead-gate-server.ts already uses. */
export function phoneVerifiedNote(phoneVerified: boolean): string {
  return phoneVerified
    ? "Phone verified: yes (SMS code)."
    : "Phone verified: NO — SMS verification was unavailable. Confirm this number before quoting.";
}

/**
 * The lead pass to write back after a successful submission, or null to leave
 * the cookie alone.
 *
 * A visitor who already holds a pass for this same number keeps it: re-issuing
 * would reset `issuedAt` (silently extending the 90 days) and wipe the
 * per-interest dedupe map. A visitor who just verified a number for the first
 * time gets one, so the next form — any form, including the tool gate and the
 * showroom — lets them straight through.
 */
export function leadPassForSubmission(
  gate: PhoneGateResult,
  info: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    propertyAddress: string;
  }
): LeadPassPayload | null {
  if (gate.pass && samePhoneNumber(gate.pass.phone, info.phone)) return null;
  if (!gate.phoneVerified && isTwilioConfigured()) return null;
  return newLeadPass({ ...info, phoneVerified: gate.phoneVerified });
}

/** The 403 a form uses as its cue to show the "enter the code" step. */
export const PHONE_NOT_VERIFIED = {
  error: "Please verify your phone number to continue.",
  code: "PHONE_NOT_VERIFIED",
} as const;

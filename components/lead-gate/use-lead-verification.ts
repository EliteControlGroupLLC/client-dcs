"use client";

// Shared by every lead form that is not the tool gate — the contact form and
// the paid-ad lead form. It answers one question: "before I submit, does this
// visitor need to enter a code?"
//
// Three ways the answer is no:
//   • they already hold a lead pass for this exact number (the 14-day
//     httpOnly cookie) — a returning visitor is never asked twice,
//   • SMS verification is unavailable, and the server handed back a signed
//     "we couldn't check" token to submit instead,
//   • the number is new, so they do get a code — that's the one yes.
//
// The pass is also used to pre-fill what we already know, so nobody retypes
// details they have given us before.

import { useCallback, useEffect, useState } from "react";
import { isValidPhoneFormat, usePhoneVerification } from "./use-phone-verification";

export interface LeadPassInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  propertyAddress: string;
  phoneVerified: boolean;
}

/** Last 10 digits, so "(619) 555-0123" and "+16195550123" compare equal. */
function key(phone: string): string {
  return phone.replace(/\D/g, "").slice(-10);
}

export function samePhone(a: string, b: string): boolean {
  const x = key(a);
  return x.length === 10 && x === key(b);
}

export type StartVerificationResult =
  /** Nothing more to ask — submit now, sending this token (may be null). */
  | { status: "ready"; phoneToken: string | null }
  /** A code is on its way; show the code step. */
  | { status: "code-sent" }
  | { status: "error"; error: string };

export function useLeadVerification() {
  const [pass, setPass] = useState<LeadPassInfo | null>(null);
  const [passChecked, setPassChecked] = useState(false);
  const { sendCode, verifyCode, sending, verifying, resendCooldown } = usePhoneVerification();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/lead-gate", { cache: "no-store" });
        const data = (await res.json()) as { hasPass?: boolean } & Partial<LeadPassInfo>;
        if (cancelled) return;
        if (data.hasPass) {
          setPass({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || "",
            phone: data.phone || "",
            propertyAddress: data.propertyAddress || "",
            phoneVerified: data.phoneVerified === true,
          });
        }
      } catch {
        // No pass, or the check failed — the visitor just verifies normally.
      } finally {
        if (!cancelled) setPassChecked(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /** True when this browser already proved it owns this number. */
  const alreadyVerified = useCallback(
    (phone: string) => !!pass && pass.phoneVerified && samePhone(phone, pass.phone),
    [pass]
  );

  /**
   * Decide what has to happen before this form can be submitted, and start it.
   */
  const startVerification = useCallback(
    async (phone: string): Promise<StartVerificationResult> => {
      if (!isValidPhoneFormat(phone)) {
        return { status: "error", error: "Please enter a valid 10-digit phone number" };
      }
      // Returning visitor: the server re-checks the cookie, so nothing to send.
      if (alreadyVerified(phone)) return { status: "ready", phoneToken: null };

      const sent = await sendCode(phone);
      if (!sent.ok) return { status: "error", error: sent.error };
      if (sent.skipped) return { status: "ready", phoneToken: sent.phoneToken };
      return { status: "code-sent" };
    },
    [alreadyVerified, sendCode]
  );

  return {
    pass,
    passChecked,
    alreadyVerified,
    startVerification,
    verifyCode,
    sendCode,
    sending,
    verifying,
    resendCooldown,
  };
}

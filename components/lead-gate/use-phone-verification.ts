"use client";

// SMS code flow against /api/verify-phone (Twilio Verify), same contract as
// the Build Your ADU lead form: send → verify → signed phoneToken.

import { useCallback, useEffect, useState } from "react";

export const PHONE_VERIFY_UNAVAILABLE = "Phone verification is not available";

export type SendCodeResult =
  | { ok: true; skipped: false }
  | { ok: true; skipped: true } // Twilio not configured — caller submits without a token
  | { ok: false; error: string };

export type VerifyCodeResult = { ok: true; phoneToken: string | null } | { ok: false; error: string };

export function isValidPhoneFormat(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 11;
}

export function usePhoneVerification() {
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const sendCode = useCallback(async (phone: string): Promise<SendCodeResult> => {
    if (!isValidPhoneFormat(phone)) return { ok: false, error: "Please enter a valid 10-digit phone number" };
    setSending(true);
    try {
      const res = await fetch("/api/verify-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", phone: phone.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        if (data.error === PHONE_VERIFY_UNAVAILABLE) return { ok: true, skipped: true };
        return { ok: false, error: data.error || "Failed to send code" };
      }
      setResendCooldown(30);
      return { ok: true, skipped: false };
    } catch {
      return { ok: false, error: "Failed to send code. Please try again." };
    } finally {
      setSending(false);
    }
  }, []);

  const verifyCode = useCallback(async (phone: string, code: string): Promise<VerifyCodeResult> => {
    if (code.trim().length < 4) return { ok: false, error: "Please enter the verification code" };
    setVerifying(true);
    try {
      const res = await fetch("/api/verify-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", phone: phone.trim(), code: code.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        verified?: boolean;
        phoneToken?: string | null;
      };
      if (!res.ok || !data.verified) return { ok: false, error: data.error || "Invalid code" };
      return { ok: true, phoneToken: data.phoneToken ?? null };
    } catch {
      return { ok: false, error: "Verification failed. Please try again." };
    } finally {
      setVerifying(false);
    }
  }, []);

  return { sendCode, verifyCode, sending, verifying, resendCooldown };
}

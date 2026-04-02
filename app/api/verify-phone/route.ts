// Phone Verification API — Sends and verifies OTP via Twilio Verify
// POST with action: "send" to send OTP
// POST with action: "verify" to verify OTP

import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID;

// In-memory store for verification state (per phone number)
// In production, use Redis or database
const verificationStore = new Map<string, {
  verified: boolean;
  attempts: number;
  lastSent: number;
  verifiedAt?: number;
}>();

// Rate limits
const SEND_OTP_LIMIT = { maxRequests: 3, windowSeconds: 10 * 60 }; // 3 sends per 10 min
const VERIFY_OTP_LIMIT = { maxRequests: 5, windowSeconds: 5 * 60 }; // 5 attempts per 5 min

function formatPhoneE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  // Assume US number if 10 digits
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  // If 11 digits starting with 1, add +
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }
  // Otherwise just add +
  return `+${digits}`;
}

async function sendTwilioOTP(phone: string): Promise<{ success: boolean; error?: string }> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_VERIFY_SERVICE_SID) {
    console.error("[PHONE-VERIFY] Twilio credentials not configured");
    return { success: false, error: "Phone verification is not available" };
  }

  const url = `https://verify.twilio.com/v2/Services/${TWILIO_VERIFY_SERVICE_SID}/Verifications`;
  const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64");

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: phone,
        Channel: "sms",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[PHONE-VERIFY] Twilio send error:", data);
      // Handle specific Twilio errors
      if (data.code === 60200) {
        return { success: false, error: "Invalid phone number format" };
      }
      if (data.code === 60203) {
        return { success: false, error: "Max send attempts reached. Try again later." };
      }
      return { success: false, error: "Failed to send verification code" };
    }

    return { success: true };
  } catch (error) {
    console.error("[PHONE-VERIFY] Send error:", error);
    return { success: false, error: "Failed to send verification code" };
  }
}

async function verifyTwilioOTP(phone: string, code: string): Promise<{ valid: boolean; error?: string }> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_VERIFY_SERVICE_SID) {
    return { valid: false, error: "Phone verification is not available" };
  }

  const url = `https://verify.twilio.com/v2/Services/${TWILIO_VERIFY_SERVICE_SID}/VerificationCheck`;
  const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64");

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: phone,
        Code: code,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[PHONE-VERIFY] Twilio verify error:", data);
      if (data.code === 60202) {
        return { valid: false, error: "Max check attempts reached. Request a new code." };
      }
      return { valid: false, error: "Verification failed" };
    }

    if (data.status === "approved") {
      return { valid: true };
    }

    return { valid: false, error: "Invalid verification code" };
  } catch (error) {
    console.error("[PHONE-VERIFY] Verify error:", error);
    return { valid: false, error: "Verification failed" };
  }
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  try {
    const body = await request.json();
    const { action, phone, code } = body;

    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Format phone to E.164
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 11) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit phone number" },
        { status: 400 }
      );
    }

    const formattedPhone = formatPhoneE164(phone);

    // SEND OTP
    if (action === "send") {
      // Rate limit by IP and phone number
      const ipLimit = checkRateLimit(`phone-send:${ip}`, SEND_OTP_LIMIT);
      const phoneLimit = checkRateLimit(`phone-send:${formattedPhone}`, SEND_OTP_LIMIT);

      if (!ipLimit.allowed || !phoneLimit.allowed) {
        return NextResponse.json(
          { error: "Too many attempts. Please wait a few minutes and try again." },
          { status: 429 }
        );
      }

      // Check cooldown (min 30 seconds between sends)
      const existing = verificationStore.get(formattedPhone);
      if (existing && Date.now() - existing.lastSent < 30000) {
        const waitSeconds = Math.ceil((30000 - (Date.now() - existing.lastSent)) / 1000);
        return NextResponse.json(
          { error: `Please wait ${waitSeconds} seconds before requesting a new code` },
          { status: 429 }
        );
      }

      const result = await sendTwilioOTP(formattedPhone);

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || "Failed to send code" },
          { status: 400 }
        );
      }

      // Update store
      verificationStore.set(formattedPhone, {
        verified: false,
        attempts: 0,
        lastSent: Date.now(),
      });

      return NextResponse.json({
        success: true,
        message: "Verification code sent",
      });
    }

    // VERIFY OTP
    if (action === "verify") {
      if (!code || typeof code !== "string") {
        return NextResponse.json(
          { error: "Verification code is required" },
          { status: 400 }
        );
      }

      // Rate limit verification attempts
      const verifyLimit = checkRateLimit(`phone-verify:${formattedPhone}`, VERIFY_OTP_LIMIT);
      if (!verifyLimit.allowed) {
        return NextResponse.json(
          { error: "Too many attempts. Please request a new code." },
          { status: 429 }
        );
      }

      // Get existing state
      const existing = verificationStore.get(formattedPhone);
      if (!existing) {
        return NextResponse.json(
          { error: "Please request a verification code first" },
          { status: 400 }
        );
      }

      // Check if already verified
      if (existing.verified) {
        return NextResponse.json({
          success: true,
          verified: true,
          message: "Phone already verified",
        });
      }

      // Verify with Twilio
      const result = await verifyTwilioOTP(formattedPhone, code.trim());

      if (!result.valid) {
        existing.attempts++;
        return NextResponse.json(
          { error: result.error || "Invalid code" },
          { status: 400 }
        );
      }

      // Mark as verified
      existing.verified = true;
      existing.verifiedAt = Date.now();

      return NextResponse.json({
        success: true,
        verified: true,
        message: "Phone verified successfully",
      });
    }

    // CHECK STATUS
    if (action === "status") {
      const existing = verificationStore.get(formattedPhone);
      return NextResponse.json({
        verified: existing?.verified || false,
        verifiedAt: existing?.verifiedAt || null,
      });
    }

    return NextResponse.json(
      { error: "Invalid action. Use 'send', 'verify', or 'status'" },
      { status: 400 }
    );

  } catch (error) {
    console.error("[PHONE-VERIFY] Error:", error);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}

// Email Validation API — Validates email addresses using Abstract API
// Checks: format, domain validity, disposable detection, deliverability

import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

const ABSTRACT_API_KEY = process.env.ABSTRACT_EMAIL_API_KEY;

// Common disposable email domains (fallback if API unavailable)
const DISPOSABLE_DOMAINS = new Set([
  "tempmail.com", "throwaway.com", "guerrillamail.com", "mailinator.com",
  "10minutemail.com", "temp-mail.org", "fakeinbox.com", "trashmail.com",
  "yopmail.com", "getnada.com", "dispostable.com", "tempail.com",
  "sharklasers.com", "spam4.me", "grr.la", "guerrillamail.info",
  "pokemail.net", "discard.email", "maildrop.cc", "mailnesia.com",
  "mintemail.com", "mohmal.com", "tempinbox.com", "emailondeck.com",
]);

interface EmailValidationResult {
  valid: boolean;
  email: string;
  isDisposable: boolean;
  isDeliverable: boolean | null;
  domainValid: boolean;
  formatValid: boolean;
  score: number; // 0-100 quality score
  reason?: string;
}

export async function POST(request: NextRequest) {
  // Rate limit
  const ip = getClientIp(request);
  const limit = checkRateLimit(`verify-email:${ip}`, { maxRequests: 10, windowSeconds: 60 });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Basic format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json({
        valid: false,
        email: normalizedEmail,
        isDisposable: false,
        isDeliverable: null,
        domainValid: false,
        formatValid: false,
        score: 0,
        reason: "Invalid email format",
      } satisfies EmailValidationResult);
    }

    // Extract domain
    const domain = normalizedEmail.split("@")[1];

    // Check against known disposable domains (quick local check)
    if (DISPOSABLE_DOMAINS.has(domain)) {
      return NextResponse.json({
        valid: false,
        email: normalizedEmail,
        isDisposable: true,
        isDeliverable: null,
        domainValid: true,
        formatValid: true,
        score: 10,
        reason: "Disposable email addresses are not accepted",
      } satisfies EmailValidationResult);
    }

    // If Abstract API key is available, use it for deeper validation
    if (ABSTRACT_API_KEY) {
      try {
        const response = await fetch(
          `https://emailvalidation.abstractapi.com/v1/?api_key=${ABSTRACT_API_KEY}&email=${encodeURIComponent(normalizedEmail)}`
        );

        if (response.ok) {
          const data = await response.json();
          
          const isDisposable = data.is_disposable_email?.value === true;
          const isDeliverable = data.deliverability === "DELIVERABLE";
          const isValidFormat = data.is_valid_format?.value === true;
          const isMxFound = data.is_mx_found?.value === true;
          const isSMTPValid = data.is_smtp_valid?.value === true;
          
          // Calculate quality score
          let score = 0;
          if (isValidFormat) score += 20;
          if (isMxFound) score += 25;
          if (isSMTPValid) score += 25;
          if (!isDisposable) score += 20;
          if (isDeliverable) score += 10;

          // Determine if valid
          const valid = isValidFormat && isMxFound && !isDisposable && (isDeliverable || isSMTPValid);

          let reason: string | undefined;
          if (isDisposable) {
            reason = "Disposable email addresses are not accepted";
          } else if (!isMxFound) {
            reason = "Email domain does not exist";
          } else if (!isDeliverable && !isSMTPValid) {
            reason = "Email address appears to be undeliverable";
          }

          return NextResponse.json({
            valid,
            email: normalizedEmail,
            isDisposable,
            isDeliverable,
            domainValid: isMxFound,
            formatValid: isValidFormat,
            score,
            reason,
          } satisfies EmailValidationResult);
        }
      } catch (apiError) {
        console.error("[EMAIL-VALIDATION] Abstract API error:", apiError);
        // Fall through to basic validation
      }
    }

    // Fallback: Basic validation without API
    // Check if domain has valid structure (contains at least one dot, not just TLD)
    const domainParts = domain.split(".");
    if (domainParts.length < 2 || domainParts.some(part => part.length === 0)) {
      return NextResponse.json({
        valid: false,
        email: normalizedEmail,
        isDisposable: false,
        isDeliverable: null,
        domainValid: false,
        formatValid: true,
        score: 20,
        reason: "Invalid email domain",
      } satisfies EmailValidationResult);
    }

    // Basic validation passed (no API check)
    return NextResponse.json({
      valid: true,
      email: normalizedEmail,
      isDisposable: false,
      isDeliverable: null, // Unknown without API
      domainValid: true,
      formatValid: true,
      score: 60, // Medium confidence without API verification
      reason: undefined,
    } satisfies EmailValidationResult);

  } catch (error) {
    console.error("[EMAIL-VALIDATION] Error:", error);
    return NextResponse.json(
      { error: "Validation failed" },
      { status: 500 }
    );
  }
}

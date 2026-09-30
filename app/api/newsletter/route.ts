// Newsletter signup → BuildCore CRM.
//
// BuildCore has no newsletter/subscriber table, and the website no longer has
// a database of its own, so a signup is pushed as a lead with the source
// "website-newsletter" — it lands in the CRM the owner actually works out of,
// clearly labelled, instead of into a table nobody reads. (captureLead falls
// back to "website-contact" if BuildCore doesn't know that source value yet.)

import { NextRequest, NextResponse } from "next/server";
import { captureLead, LEAD_CAPTURE_FAILURE_MESSAGE } from "@/lib/buildcore-intake";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

// Best-effort duplicate suppression for the common case (double-click, or the
// same person signing up twice in a session). In-memory and per-instance, so
// it is a courtesy, not a guarantee — BuildCore stays the source of truth.
const RECENT_TTL_MS = 24 * 60 * 60 * 1000;
const recentSignups = new Map<string, number>();

function seenRecently(email: string): boolean {
  const now = Date.now();
  for (const [key, at] of recentSignups) {
    if (now - at > RECENT_TTL_MS) recentSignups.delete(key);
  }
  return (recentSignups.get(email) ?? 0) > now - RECENT_TTL_MS;
}

/** "jane.smith" → "Jane Smith", so the CRM shows something human. */
function nameFromEmail(email: string): string {
  const local = email.split("@")[0]?.replace(/[._-]+/g, " ").trim() ?? "";
  const cleaned = local.replace(/\d+/g, " ").replace(/\s+/g, " ").trim();
  if (cleaned.length < 2) return "Newsletter";
  return cleaned.replace(/\b\w/g, (c) => c.toUpperCase()).slice(0, 80);
}

export async function POST(request: NextRequest) {
  // Rate limit check
  const ip = getClientIp(request);
  const limit = checkRateLimit(`newsletter:${ip}`, RATE_LIMITS.newsletter);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(limit.retryAfterSeconds),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(limit.resetAt),
        },
      }
    );
  }

  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const normalized = String(email).trim().toLowerCase();
    if (seenRecently(normalized)) {
      return NextResponse.json(
        { success: true, message: "Already subscribed" }
      );
    }

    const crm = await captureLead("NEWSLETTER", {
      firstName: nameFromEmail(normalized),
      lastName: "-",
      email: normalized,
      phone: "Not provided",
      propertyAddress: "Not provided",
      serviceLine: "general-construction",
      source: "website-newsletter",
      notes: [
        "Newsletter signup from the website (\"Stay Updated\" form).",
        "Email only — no phone, address, or project details were collected.",
      ].join("\n"),
    });

    if (!crm.success) {
      // Honest failure: the signup went nowhere, so say so.
      return NextResponse.json({ error: LEAD_CAPTURE_FAILURE_MESSAGE }, { status: 502 });
    }

    recentSignups.set(normalized, Date.now());
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

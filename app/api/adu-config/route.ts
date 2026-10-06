// "Build Your ADU" configurator → BuildCore CRM.
//
// The configuration used to be written to an `adu_configurations` table first
// and the lead created second. Nothing in this codebase ever read that table
// back, so the storage is gone: the configuration now travels with the lead,
// in the notes, where the team actually sees it.

import { NextRequest, NextResponse } from "next/server";
import {
  captureLead,
  splitFullName,
  LEAD_CAPTURE_FAILURE_MESSAGE,
} from "@/lib/buildcore-intake";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import {
  checkPhoneVerification,
  phoneVerifiedNote,
  PHONE_NOT_VERIFIED,
} from "@/lib/lead-verification";
import { BLOCKED_SUBMISSION_MESSAGE, checkSpam, logBlockedSubmission } from "@/lib/spam-filter";
import { ELAPSED_FIELD, HONEYPOT_FIELD } from "@/lib/spam-fields";

export const runtime = "nodejs";

function money(v: unknown): string | null {
  return typeof v === "number" && Number.isFinite(v) ? `$${v.toLocaleString()}` : null;
}

function list(v: unknown): string | null {
  if (Array.isArray(v) && v.length > 0) return v.map((x) => String(x)).join(", ");
  if (typeof v === "string" && v.trim()) return v.trim();
  return null;
}

export async function POST(request: NextRequest) {
  // Rate limit check
  const ip = getClientIp(request);
  const limit = checkRateLimit(`adu-config:${ip}`, RATE_LIMITS.aduConfig);
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
    const {
      contact_info,
      property_info,
      adu_type,
      square_feet,
      bedrooms,
      bathrooms,
      style,
      features,
      upgrades,
      estimated_price_low,
      estimated_price_high,
    } = body;

    // Validate required fields. A phone that can't be dialled and an address
    // that can't be found are not a lead — this endpoint used to accept
    // "Not provided" for both, which is how junk got in.
    const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");
    const cleanName = text(contact_info?.name);
    const cleanEmail = text(contact_info?.email);
    const cleanPhone = text(contact_info?.phone);
    const cleanAddress = text(property_info?.address);

    if (!cleanName || !cleanEmail) {
      return NextResponse.json(
        { error: "Contact information is required" },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail)) {
      return NextResponse.json({ error: "That email address doesn't look right." }, { status: 400 });
    }
    if (cleanPhone.replace(/\D/g, "").length < 10) {
      return NextResponse.json(
        { error: "Please enter a phone number we can reach you on." },
        { status: 400 }
      );
    }
    if (cleanAddress.length < 8 || !/\d/.test(cleanAddress)) {
      return NextResponse.json(
        { error: "Please pick the project address from the list." },
        { status: 400 }
      );
    }

    const spam = checkSpam({
      honeypot: body[HONEYPOT_FIELD],
      elapsedMs: body[ELAPSED_FIELD],
      name: cleanName,
    });
    if (spam.block) {
      logBlockedSubmission("ADU-CONFIG", spam, { name: cleanName, email: cleanEmail });
      return NextResponse.json({ error: BLOCKED_SUBMISSION_MESSAGE }, { status: 400 });
    }

    const gate = checkPhoneVerification(request, cleanPhone, body.phoneToken, "ADU-CONFIG");
    if (!gate.ok) {
      return NextResponse.json(PHONE_NOT_VERIFIED, { status: 403 });
    }

    const low = money(estimated_price_low);
    const high = money(estimated_price_high);
    const estimate = low && high ? `${low} – ${high}` : low || high;

    // Everything the configurator collected, folded into the lead notes so no
    // detail is lost now that there is no configuration table.
    const notes = [
      "Build Your ADU configurator (website).",
      adu_type ? `Type: ${adu_type}` : null,
      square_feet ? `Size: ${square_feet} sq ft` : null,
      bedrooms != null || bathrooms != null
        ? `Layout: ${bedrooms ?? "?"} bed / ${bathrooms ?? "?"} bath`
        : null,
      style ? `Style: ${style}` : null,
      list(features) ? `Features: ${list(features)}` : null,
      list(upgrades) ? `Upgrades: ${list(upgrades)}` : null,
      estimate ? `Estimated: ${estimate}` : null,
      property_info?.lot_size ? `Lot size: ${property_info.lot_size}` : null,
      phoneVerifiedNote(gate.phoneVerified),
    ]
      .filter(Boolean)
      .join("\n");

    const { firstName, lastName } = splitFullName(cleanName);
    const crm = await captureLead("ADU-CONFIG", {
      firstName,
      lastName,
      email: cleanEmail,
      phone: cleanPhone,
      propertyAddress: cleanAddress,
      serviceLine: "adu",
      source: "adu-builder",
      notes,
    });

    if (!crm.success) {
      // Honest failure: the configuration reached nobody, so tell them to call.
      return NextResponse.json({ error: LEAD_CAPTURE_FAILURE_MESSAGE }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      message: "Your ADU configuration has been saved. We'll be in touch soon!"
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

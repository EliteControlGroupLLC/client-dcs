// Website lead forms (hero form, ad landing pages) → BuildCore CRM.
// The website has no database of its own: BuildCore is the record, so the
// visitor only sees "thank you" when the lead actually landed there.

import { NextRequest, NextResponse } from "next/server";
import {
  captureLead,
  serviceLineFromText,
  splitFullName,
  phoneOrNotProvided,
  LEAD_CAPTURE_FAILURE_MESSAGE,
} from "@/lib/buildcore-intake";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // Rate limit check
  const ip = getClientIp(request);
  const limit = checkRateLimit(`leads:${ip}`, RATE_LIMITS.formSubmission);
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
      name,
      email,
      phone,
      service_type,
      message,
      property_address,
      source
    } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // `source` here is the campaign/placement the form sat on
    // ("meta-ads-adu-offer", "google-ads-adu-san-diego", "hero", ...), which is
    // finer-grained than BuildCore's source enum — it goes in the notes so the
    // team can still see which ad or page produced the lead.
    const campaign = String(source || "website").trim();
    const { firstName, lastName } = splitFullName(name);

    const crm = await captureLead("LEADS", {
      firstName,
      lastName,
      email,
      phone: phoneOrNotProvided(phone),
      propertyAddress: String(property_address || "").trim() || "Not provided",
      serviceLine: serviceLineFromText(service_type),
      source: "website-contact",
      notes: [
        `Website lead form — placement: ${campaign}.`,
        service_type ? `Project type: ${service_type}.` : null,
        message ? `\n${String(message)}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
    });

    if (!crm.success) {
      // Honest failure: the request never reached the team, so tell them to call.
      return NextResponse.json({ error: LEAD_CAPTURE_FAILURE_MESSAGE }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}

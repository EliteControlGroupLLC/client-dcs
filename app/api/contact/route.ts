// Contact form → BuildCore CRM. The website has no database of its own:
// BuildCore is the record, so the visitor's success message reflects whether
// the LEAD was captured, not whether some local log write happened.

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
  const limit = checkRateLimit(`contact:${ip}`, RATE_LIMITS.formSubmission);
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
    const { name, email, phone, service, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    const { firstName, lastName } = splitFullName(name);
    const crm = await captureLead("CONTACT", {
      firstName,
      lastName,
      email,
      phone: phoneOrNotProvided(phone),
      propertyAddress: "Not provided",
      city: "Not provided",
      serviceLine: serviceLineFromText(service),
      source: "website-contact",
      notes: [`Website contact form${service ? ` — ${service}` : ""}.`, "", String(message)].join("\n"),
    });

    if (!crm.success) {
      // Honest failure: nobody has this message, so tell them to call.
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

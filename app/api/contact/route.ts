// Contact form → BuildCore CRM. The website has no database of its own:
// BuildCore is the record, so the visitor's success message reflects whether
// the LEAD was captured, not whether some local log write happened.

import { NextRequest, NextResponse } from "next/server";
import {
  captureLead,
  serviceLineFromText,
  splitFullName,
  cityFromAddress,
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
    const { name, email, phone, address, service, message } = body;

    // Every field is required, and checked here as well as in the form —
    // leads were arriving with no address and no phone because the form
    // never asked and the server filled in "Not provided" for them.
    const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");
    const cleanName = text(name);
    const cleanEmail = text(email);
    const cleanPhone = text(phone);
    const cleanAddress = text(address);
    const cleanMessage = text(message);

    const missing: string[] = [];
    if (!cleanName) missing.push("your name");
    if (!cleanEmail) missing.push("an email address");
    if (!cleanPhone) missing.push("a phone number");
    if (!cleanAddress) missing.push("the project address");
    if (!cleanMessage) missing.push("a short message");
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Please include ${missing.join(", ")}.` },
        { status: 400 }
      );
    }

    // Shape checks so a lead can actually be followed up: a real email, a
    // phone with enough digits to dial, and an address with a street number
    // rather than just a city.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail)) {
      return NextResponse.json({ error: "That email address doesn't look right." }, { status: 400 });
    }
    const phoneDigits = cleanPhone.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      return NextResponse.json(
        { error: "Please enter a phone number we can reach you on." },
        { status: 400 }
      );
    }
    if (cleanAddress.length < 8 || !/\d/.test(cleanAddress)) {
      return NextResponse.json(
        { error: "Please pick the project address from the list so we have the full street address." },
        { status: 400 }
      );
    }

    const { firstName, lastName } = splitFullName(cleanName);
    const crm = await captureLead("CONTACT", {
      firstName,
      lastName,
      email: cleanEmail,
      phone: cleanPhone,
      propertyAddress: cleanAddress,
      city: cityFromAddress(cleanAddress),
      serviceLine: serviceLineFromText(service),
      source: "website-contact",
      notes: [`Website contact form${service ? ` — ${service}` : ""}.`, "", cleanMessage].join("\n"),
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

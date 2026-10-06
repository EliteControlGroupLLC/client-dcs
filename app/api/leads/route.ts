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

    // Same bar as the contact form: a lead nobody can call or locate is not
    // a lead. These come off paid ads, so a bad one costs real money.
    const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");
    const cleanName = text(name);
    const cleanEmail = text(email);
    const cleanPhone = text(phone);
    const cleanAddress = text(property_address);

    const missing: string[] = [];
    if (!cleanName) missing.push("your name");
    if (!cleanEmail) missing.push("an email address");
    if (!cleanPhone) missing.push("a phone number");
    if (!cleanAddress) missing.push("the project address");
    if (missing.length > 0) {
      return NextResponse.json({ error: `Please include ${missing.join(", ")}.` }, { status: 400 });
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

    // `source` here is the campaign/placement the form sat on
    // ("meta-ads-adu-offer", "google-ads-adu-san-diego", "hero", ...), which is
    // finer-grained than BuildCore's source enum — it goes in the notes so the
    // team can still see which ad or page produced the lead.
    const campaign = String(source || "website").trim();
    const { firstName, lastName } = splitFullName(cleanName);

    const crm = await captureLead("LEADS", {
      firstName,
      lastName,
      email: cleanEmail,
      phone: cleanPhone,
      propertyAddress: cleanAddress,
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

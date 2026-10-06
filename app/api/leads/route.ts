// Website lead forms (hero form, ad landing pages) → BuildCore CRM.
// The website has no database of its own: BuildCore is the record, so the
// visitor only sees "thank you" when the lead actually landed there.

import { NextRequest, NextResponse } from "next/server";
import {
  captureLead,
  serviceLineFromText,
  splitFullName,
  LEAD_CAPTURE_FAILURE_MESSAGE,
} from "@/lib/buildcore-intake";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import {
  checkPhoneVerification,
  leadPassForSubmission,
  phoneVerifiedNote,
  PHONE_NOT_VERIFIED,
} from "@/lib/lead-verification";
import { encodeLeadPass, leadPassCookieOptions, LEAD_PASS_COOKIE } from "@/lib/lead-pass";
import {
  BLOCKED_SUBMISSION_MESSAGE,
  checkSpam,
  flagLeadName,
  logBlockedSubmission,
  logFlaggedSubmission,
  spamFlagNote,
} from "@/lib/spam-filter";
import { ELAPSED_FIELD, HONEYPOT_FIELD } from "@/lib/spam-fields";

export const runtime = "nodejs";

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
      source,
      phoneToken,
    } = body;

    // Same bar as the contact form: a lead nobody can call or locate is not
    // a lead. These come off paid ads, so a bad one costs real money.
    const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");
    // First and last come through separately now; a single name box left
    // leads recorded as "jordan -".
    const cleanFirstName = text((body as { firstName?: unknown }).firstName);
    const cleanLastName = text((body as { lastName?: unknown }).lastName);
    const cleanName = [cleanFirstName, cleanLastName].filter(Boolean).join(" ") || text(name);
    const cleanEmail = text(email);
    const cleanPhone = text(phone);
    const cleanAddress = text(property_address);

    const missing: string[] = [];
    if (!cleanFirstName) missing.push("your first name");
    if (!cleanLastName) missing.push("your last name");
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

    const cleanMessage = text(message);

    // Bots first: honeypot and impossible timing are proof of automation.
    const spam = checkSpam({
      honeypot: body[HONEYPOT_FIELD],
      elapsedMs: body[ELAPSED_FIELD],
      name: cleanName,
      message: cleanMessage,
    });
    if (spam.block) {
      logBlockedSubmission("LEADS", spam, { name: cleanName, email: cleanEmail });
      return NextResponse.json({ error: BLOCKED_SUBMISSION_MESSAGE }, { status: 400 });
    }

    // These come off paid ads, so an unreachable number costs real money.
    // Server-signed proof only; a returning visitor is never asked twice.
    const gate = checkPhoneVerification(request, cleanPhone, phoneToken, "LEADS");
    if (!gate.ok) {
      return NextResponse.json(PHONE_NOT_VERIFIED, { status: 403 });
    }

    // `source` here is the campaign/placement the form sat on
    // ("meta-ads-adu-offer", "google-ads-adu-san-diego", "hero", ...), which is
    // finer-grained than BuildCore's source enum — it goes in the notes so the
    // team can still see which ad or page produced the lead.
    const campaign = String(source || "website").trim();
    const split = splitFullName(cleanName);
    const firstName = cleanFirstName || split.firstName;
    const lastName = cleanLastName || split.lastName;

    if (spam.flag) {
      logFlaggedSubmission("LEADS", spam, { name: cleanName, email: cleanEmail });
    }

    const crm = await captureLead("LEADS", {
      firstName: spam.flag ? flagLeadName(firstName) : firstName,
      lastName,
      email: cleanEmail,
      phone: cleanPhone,
      propertyAddress: cleanAddress,
      serviceLine: serviceLineFromText(service_type),
      source: "website-contact",
      notes: [
        spam.flag ? spamFlagNote(spam, gate.phoneVerified) : null,
        spam.flag ? "" : null,
        `Website lead form — placement: ${campaign}.`,
        service_type ? `Project type: ${service_type}.` : null,
        phoneVerifiedNote(gate.phoneVerified),
        cleanMessage ? `\n${cleanMessage}` : null,
      ]
        .filter((line) => line !== null)
        .join("\n"),
    });

    if (!crm.success) {
      // Honest failure: the request never reached the team, so tell them to call.
      return NextResponse.json({ error: LEAD_CAPTURE_FAILURE_MESSAGE }, { status: 502 });
    }

    const res = NextResponse.json({ success: true });

    // One verification covers the whole site for 14 days.
    const pass = leadPassForSubmission(gate, {
      firstName,
      lastName,
      email: cleanEmail,
      phone: cleanPhone,
      propertyAddress: cleanAddress,
    });
    if (pass) {
      const value = encodeLeadPass(pass);
      if (value) res.cookies.set(LEAD_PASS_COOKIE, value, leadPassCookieOptions(pass));
    }
    return res;
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

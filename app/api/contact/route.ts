// Contact form → BuildCore CRM. The website has no database of its own:
// BuildCore is the record, so the visitor's success message reflects whether
// the LEAD was captured, not whether some local log write happened.
//
// Someone asking a question still has to prove the phone number is theirs:
// a lead arrived here named "Christopher Hughes" with a number nobody could
// dial. The proof is server-signed (lib/lead-verification) — a `phoneVerified`
// flag from the browser means nothing, since anyone can POST straight here.

import { NextRequest, NextResponse } from "next/server";
import {
  captureLead,
  serviceLineFromText,
  splitFullName,
  cityFromAddress,
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
    const { name, email, phone, address, service, message, phoneToken } = body;

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

    // Bots: the honeypot and the sub-3-second submit are proof of automation,
    // so no lead is created and the sender learns nothing about why.
    const spam = checkSpam({
      honeypot: body[HONEYPOT_FIELD],
      elapsedMs: body[ELAPSED_FIELD],
      name: cleanName,
      message: cleanMessage,
    });
    if (spam.block) {
      logBlockedSubmission("CONTACT", spam, { name: cleanName, email: cleanEmail });
      return NextResponse.json({ error: BLOCKED_SUBMISSION_MESSAGE }, { status: 400 });
    }

    // The number has to be provably theirs. A returning visitor who already
    // verified this number (lead pass cookie) is not asked again.
    const gate = checkPhoneVerification(request, cleanPhone, phoneToken, "CONTACT");
    if (!gate.ok) {
      return NextResponse.json(PHONE_NOT_VERIFIED, { status: 403 });
    }

    const { firstName, lastName } = splitFullName(cleanName);
    if (spam.flag) {
      logFlaggedSubmission("CONTACT", spam, { name: cleanName, email: cleanEmail });
    }

    const crm = await captureLead("CONTACT", {
      // Flagged leads carry the warning on the name, so it is unmissable in
      // the leads list without opening anything.
      firstName: spam.flag ? flagLeadName(firstName) : firstName,
      lastName,
      email: cleanEmail,
      phone: cleanPhone,
      propertyAddress: cleanAddress,
      city: cityFromAddress(cleanAddress),
      serviceLine: serviceLineFromText(service),
      source: "website-contact",
      notes: [
        spam.flag ? spamFlagNote(spam, gate.phoneVerified) : null,
        spam.flag ? "" : null,
        `Website contact form${service ? ` — ${service}` : ""}.`,
        phoneVerifiedNote(gate.phoneVerified),
        "",
        cleanMessage,
      ]
        .filter((line) => line !== null)
        .join("\n"),
    });

    if (!crm.success) {
      // Honest failure: nobody has this message, so tell them to call.
      return NextResponse.json({ error: LEAD_CAPTURE_FAILURE_MESSAGE }, { status: 502 });
    }

    const res = NextResponse.json({ success: true });

    // Verified here, so every other form on the site now lets them straight
    // through for 90 days — no second code, no re-typing their details.
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

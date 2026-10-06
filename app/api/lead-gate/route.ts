// Lead gate API — every website tool (calculators, estimators) and the
// showroom sit behind a one-time "tell us who you are" form.
//
// GET  → { hasPass, firstName, ... } for the client gate component.
// POST (new visitor)  { firstName, lastName, email, phone, propertyAddress,
//        phoneToken, interest, details?, pageUrl? } → verifies the signed
//        phone token, pushes a BuildCore lead, sets the dcs_lead_pass cookie.
// POST (has pass)     { interest, details?, pageUrl? } → pushes a BuildCore
//        lead for that interest (deduped: one per email+interest per 24h).
//
// BuildCore failures are logged, never surfaced — the visitor always gets in.

import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { checkPhoneVerification, PHONE_NOT_VERIFIED } from "@/lib/lead-verification";
import {
  LEAD_PASS_COOKIE,
  encodeLeadPass,
  leadPassCookieOptions,
  newLeadPass,
  readLeadPass,
  type LeadPassPayload,
} from "@/lib/lead-pass";
import { parseInterest, registerInterestLead, resolvePageUrl } from "@/lib/lead-gate-server";
import { BLOCKED_SUBMISSION_MESSAGE, checkSpam, logBlockedSubmission } from "@/lib/spam-filter";
import { ELAPSED_FIELD, HONEYPOT_FIELD } from "@/lib/spam-fields";

export const runtime = "nodejs";
export const maxDuration = 30;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(v: unknown, max = 200): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function tooMany(retryAfterSeconds: number) {
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
  );
}

function withPassCookie(res: NextResponse, pass: LeadPassPayload): NextResponse {
  const value = encodeLeadPass(pass);
  if (value) res.cookies.set(LEAD_PASS_COOKIE, value, leadPassCookieOptions(pass));
  return res;
}

export async function GET(request: NextRequest) {
  const pass = readLeadPass(request.cookies.get(LEAD_PASS_COOKIE)?.value);
  if (!pass) {
    return NextResponse.json({ hasPass: false }, { headers: { "Cache-Control": "no-store" } });
  }
  return NextResponse.json(
    {
      hasPass: true,
      firstName: pass.firstName,
      // The visitor's own info (from their own httpOnly cookie) — used to
      // pre-fill other forms such as Build Your ADU.
      lastName: pass.lastName,
      email: pass.email,
      phone: pass.phone,
      propertyAddress: pass.propertyAddress,
      phoneVerified: pass.phoneVerified,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const interest = parseInterest(body.interest);
  if (!interest) {
    return NextResponse.json({ error: "Invalid interest" }, { status: 400 });
  }
  const pageUrl = resolvePageUrl(request, body.pageUrl);
  const existing = readLeadPass(request.cookies.get(LEAD_PASS_COOKIE)?.value);
  const isNewSubmission = typeof body.email === "string" && body.email.trim() !== "";

  // ── Returning visitor: register this interest with the info on file ──
  if (existing && !isNewSubmission) {
    const limit = checkRateLimit(`lead-gate-register:${ip}`, RATE_LIMITS.leadGateRegister);
    if (!limit.allowed) return tooMany(limit.retryAfterSeconds);

    const result = await registerInterestLead(existing, interest, {
      pageUrl,
      details: body.details,
      returning: true,
    });
    const res = NextResponse.json({
      success: true,
      hasPass: true,
      firstName: existing.firstName,
      registered: result.pushed,
      crmSynced: result.crmSynced,
    });
    return result.pushed ? withPassCookie(res, result.pass) : res;
  }

  if (!isNewSubmission) {
    return NextResponse.json({ error: "No lead pass — please fill out the form.", hasPass: false }, { status: 401 });
  }

  // ── New visitor: validate the form + phone verification proof ──
  const limit = checkRateLimit(`lead-gate-submit:${ip}`, RATE_LIMITS.leadGateSubmit);
  if (!limit.allowed) return tooMany(limit.retryAfterSeconds);

  // Proof of automation: the honeypot, or a submit faster than a human can
  // type. No lead, and nothing said about which trap it was.
  const spam = checkSpam({
    honeypot: body[HONEYPOT_FIELD],
    elapsedMs: body[ELAPSED_FIELD],
    name: str(body.firstName, 80),
  });
  if (spam.block) {
    logBlockedSubmission("LEAD-GATE", spam, {
      name: str(body.firstName, 80),
      email: str(body.email, 200),
    });
    return NextResponse.json({ error: BLOCKED_SUBMISSION_MESSAGE }, { status: 400 });
  }

  const firstName = str(body.firstName, 80);
  const lastName = str(body.lastName, 80);
  const email = str(body.email, 200).toLowerCase();
  const phone = str(body.phone, 40);
  const propertyAddress = str(body.propertyAddress, 300);

  if (!firstName || !lastName) {
    return NextResponse.json({ error: "First name and last name are required" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
  }
  const phoneDigits = phone.replace(/\D/g, "");
  if (phoneDigits.length < 10 || phoneDigits.length > 11) {
    return NextResponse.json({ error: "Please enter a valid phone number" }, { status: 400 });
  }
  if (!propertyAddress) {
    return NextResponse.json({ error: "Property address is required" }, { status: 400 });
  }

  // Phone verification is mandatory — unless verification itself was
  // unavailable, in which case /api/verify-phone hands out a signed "couldn't
  // check" token and the visitor comes through flagged as unverified in the
  // CRM notes. Same gate as every other lead endpoint.
  const gate = checkPhoneVerification(request, phone, body.phoneToken, "LEAD-GATE");
  if (!gate.ok) {
    return NextResponse.json(PHONE_NOT_VERIFIED, { status: 403 });
  }
  const phoneVerified = gate.phoneVerified;

  const pass = newLeadPass({ firstName, lastName, email, phone, propertyAddress, phoneVerified });
  const result = await registerInterestLead(pass, interest, {
    pageUrl,
    details: body.details,
    returning: false,
  });

  const res = NextResponse.json({
    success: true,
    hasPass: true,
    firstName,
    registered: result.pushed,
    crmSynced: result.crmSynced,
  });
  return withPassCookie(res, result.pass);
}

// Property Report API — Lead capture + report generation endpoint
// Saves the lead and pushes it (with the report PDF) into BuildCore CRM

import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { buildAduReportPdf } from "@/lib/adu-report-pdf";
import { pushLeadToBuildCore } from "@/lib/buildcore-intake";
import { isPhoneTokenValid, normalizePhoneE164 } from "@/lib/verification-token";
import {
  LEAD_PASS_COOKIE,
  encodeLeadPass,
  leadPassCookieOptions,
  newLeadPass,
  readLeadPass,
} from "@/lib/lead-pass";
import { isTwilioConfigured } from "@/lib/lead-gate-server";

// pdf-lib + Buffer need the Node runtime; PDF build + CRM push can take a few seconds.
export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  // Rate limit check
  const ip = getClientIp(request);
  const limit = checkRateLimit(`property-report:${ip}`, RATE_LIMITS.propertyReport);
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
      firstName,
      lastName,
      email,
      phone,
      propertyAddress,
      scanResults,
      verification,
    } = body;

    // Extract verification data. phoneVerified is NOT trusted from the client:
    // it must be backed by the signed token /api/verify-phone issued.
    // A lead pass (set by any lead gate) whose phone was SMS-verified also
    // counts, so visitors who already verified don't get a second code.
    const existingPass = readLeadPass(request.cookies.get(LEAD_PASS_COOKIE)?.value);
    const passCoversPhone =
      !!existingPass?.phoneVerified &&
      normalizePhoneE164(existingPass.phone) === normalizePhoneE164(String(phone || ""));
    const verificationData = {
      emailValidated: false,
      emailScore: 0,
      emailIsDisposable: false,
      verificationCompletedAt: null,
      ...(verification || {}),
      phoneVerified:
        isPhoneTokenValid(verification?.phoneToken, String(phone || "")) || passCoversPhone,
    };

    // Validate required fields
    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "First name and last name are required" },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Validate phone (at least 10 digits)
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      return NextResponse.json(
        { error: "Please enter a valid phone number" },
        { status: 400 }
      );
    }

    if (!propertyAddress) {
      return NextResponse.json(
        { error: "Property address is required" },
        { status: 400 }
      );
    }

    const fullName = `${firstName} ${lastName}`;

    // Generate report data from scan results
    const reportData = {
      propertySummary: {
        address: propertyAddress,
        apn: scanResults?.property?.apn?.value || "Not available",
        // null (not 0 / a typical stand-in) when the field isn't real data
        lotSizeSqFt:
          scanResults?.property?.lotSizeSqFt?.status !== "Unavailable" ? scanResults?.property?.lotSizeSqFt?.value ?? null : null,
        homeAreaSqFt:
          scanResults?.property?.homeAreaSqFt?.status !== "Unavailable" ? scanResults?.property?.homeAreaSqFt?.value ?? null : null,
        yearBuilt: null,
        zoning: scanResults?.property?.zoning?.value || "Not available",
      },
      jurisdictionSummary: {
        name: scanResults?.jurisdiction?.name || "Not available",
        type: scanResults?.jurisdiction?.type || "Not available",
        rulesVersion: scanResults?.jurisdiction?.rulesVersion || "Not available",
      },
      feasibilitySummary: {
        recommendedPath: scanResults?.bestRecommendation || "Review recommended",
        recommendedSizeRange: scanResults?.recommendations?.[0]?.estimatedSizeRange || "TBD",
        feasibleOptions: (scanResults?.recommendations || [])
          .filter((r: { feasibility: string }) => r.feasibility === "Likely" || r.feasibility === "Possible")
          .map((r: { type: string }) => r.type),
        constraints: [],
      },
      buildEnvelopeImageUrl: null,
      opportunityAnalysis: {
        upsideDetected: scanResults?.upsideDetected || false,
        opportunities: (scanResults?.upsideOpportunities || []).map((o: { title: string }) => o.title),
      },
      financialSnapshot: {
        estimatedCost: scanResults?.financialScenarios?.[0]?.estimatedTotalCost
          ? `$${scanResults.financialScenarios[0].estimatedTotalCost.toLocaleString()}`
          : "TBD",
        estimatedMonthlyRent: scanResults?.financialScenarios?.[0]?.estimatedMonthlyIncome
          ? `$${scanResults.financialScenarios[0].estimatedMonthlyIncome.toLocaleString()}/mo`
          : "TBD",
        estimatedRoi:
          typeof scanResults?.financialScenarios?.[0]?.estimatedRoi === "number"
            ? `${scanResults.financialScenarios[0].estimatedRoi}%`
            : "TBD",
        // 99 = the model's "cash flow never pays it back" sentinel
        estimatedPayback:
          typeof scanResults?.financialScenarios?.[0]?.estimatedPaybackYears === "number" &&
          scanResults.financialScenarios[0].estimatedPaybackYears < 99
            ? `${scanResults.financialScenarios[0].estimatedPaybackYears} years`
            : "N/A",
      },
      confidenceScore: typeof scanResults?.confidenceScore === "number" ? scanResults.confidenceScore : null,
      confidenceBand: scanResults?.confidenceBand || "Not available",
      disclaimer: "Recommendations are based on parcel data, mapped jurisdiction standards, and publicly available regulations. Final feasibility depends on site conditions, utilities, easements, overlays, and formal city review.",
      financialDisclaimer: "Cost, financing, rent, and ROI results are planning estimates only and are not loan offers, appraisals, or guaranteed investment returns.",
      generatedAt: new Date().toISOString(),
    };

    // Try to save the lead to Supabase if available
    let leadSaved = false;
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();

      await supabase.from("leads").insert({
        name: fullName,
        email,
        phone: phone || null,
        service_type: "property-report",
        property_address: propertyAddress,
        message: `Property Development Report requested. Confidence: ${reportData.confidenceScore != null ? `${reportData.confidenceScore}%` : "not available"}. Recommended: ${reportData.feasibilitySummary.recommendedPath}.`,
        source: "Build Your ADU",
        status: "new",
      });
      leadSaved = true;
    } catch {
      // Supabase not available — lead not saved but report still generated
      leadSaved = false;
    }

    // Push the lead + the exact report the visitor unlocked into BuildCore CRM.
    // Non-blocking for the visitor: failures are logged, never surfaced.
    let reportPdf: Uint8Array | null = null;
    try {
      reportPdf = await buildAduReportPdf(
        { firstName, lastName, email, phone, propertyAddress },
        scanResults
      );
    } catch (err) {
      console.error("[API] ADU report PDF build failed:", err);
    }
    const buildCoreResult = await pushLeadToBuildCore({
      firstName,
      lastName,
      email,
      phone,
      propertyAddress,
      city: scanResults?.geocoded?.city ?? null,
      notes: [
        "Build Your ADU property scan (website lead magnet).",
        `Recommended: ${reportData.feasibilitySummary.recommendedPath}.`,
        `Zoning: ${reportData.propertySummary.zoning}. Lot: ${reportData.propertySummary.lotSizeSqFt || "?"} sq ft. APN: ${reportData.propertySummary.apn}.`,
        `Confidence: ${reportData.confidenceScore != null ? `${reportData.confidenceScore}%` : "not available"} (${reportData.confidenceBand}).`,
        `Email validated: ${verificationData.emailValidated ? "yes" : "no"}. Phone verified: ${verificationData.phoneVerified ? "yes" : "no"}.`,
      ].join("\n"),
      reportPdf,
    });
    if (!buildCoreResult.success) {
      console.error(`[API] BuildCore push failed:`, JSON.stringify(buildCoreResult));
    }

    const res = NextResponse.json({
      success: true,
      leadSaved,
      crmSynced: buildCoreResult.success,
      report: reportData,
    });

    // Verified ADU leads also get a lead pass, so the website tools and the
    // showroom open without asking for the same info again.
    if (!existingPass && (verificationData.phoneVerified || !isTwilioConfigured())) {
      const pass = newLeadPass({
        firstName: String(firstName).trim(),
        lastName: String(lastName).trim(),
        email: String(email).trim().toLowerCase(),
        phone: String(phone).trim(),
        propertyAddress: String(propertyAddress).trim(),
        phoneVerified: verificationData.phoneVerified,
      });
      const value = encodeLeadPass(pass);
      if (value) res.cookies.set(LEAD_PASS_COOKIE, value, leadPassCookieOptions(pass));
    }
    return res;
  } catch (error) {
    console.error("Property report API error:", error);
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

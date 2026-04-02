// Property Report API — Lead capture + report generation endpoint
// Saves lead info and sends notification to jtalavera@distinctcsolutions.com

import { NextRequest, NextResponse } from "next/server";
import { notifyTeamADULead, sendUserConfirmation } from "@/lib/email";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

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
    } = body;

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
        apn: scanResults?.property?.apn?.value || "Pending lookup",
        lotSizeSqFt: scanResults?.property?.lotSizeSqFt?.value || 0,
        homeAreaSqFt: scanResults?.property?.homeAreaSqFt?.value || 0,
        yearBuilt: null,
        zoning: scanResults?.property?.zoning?.value || "Unknown",
      },
      jurisdictionSummary: {
        name: scanResults?.jurisdiction?.name || "San Diego County",
        type: scanResults?.jurisdiction?.type || "city",
        rulesVersion: scanResults?.jurisdiction?.rulesVersion || "2024",
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
        estimatedRoi: scanResults?.financialScenarios?.[0]?.estimatedRoi
          ? `${scanResults.financialScenarios[0].estimatedRoi}%`
          : "TBD",
        estimatedPayback: scanResults?.financialScenarios?.[0]?.estimatedPaybackYears
          ? `${scanResults.financialScenarios[0].estimatedPaybackYears} years`
          : "TBD",
      },
      confidenceScore: scanResults?.confidenceScore || 0,
      confidenceBand: scanResults?.confidenceBand || "low",
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
        message: `Property Development Report requested. Confidence: ${reportData.confidenceScore}%. Recommended: ${reportData.feasibilitySummary.recommendedPath}.`,
        source: "Build Your ADU",
        status: "new",
      });
      leadSaved = true;
    } catch {
      // Supabase not available — lead not saved but report still generated
      leadSaved = false;
    }

    // Send email to jtalavera@distinctcsolutions.com with the lead info
    console.log(`[API] Sending lead notification email...`);
    console.log(`[API] Lead data:`, JSON.stringify({ firstName, lastName, email, phone, propertyAddress }));
    
    const timestamp = new Date().toISOString();
    
    // Send team notification (critical - must succeed)
    const teamEmailResult = await notifyTeamADULead({
      firstName,
      lastName,
      email,
      phone,
      propertyAddress,
      timestamp,
      source: "Build Your ADU",
    });
    
    console.log(`[API] Team email result:`, JSON.stringify(teamEmailResult));
    
    // Send user confirmation (non-critical - fire and forget)
    sendUserConfirmation({ name: fullName, email, propertyAddress })
      .then(result => console.log(`[API] User confirmation email result:`, JSON.stringify(result)))
      .catch(err => console.error(`[API] User confirmation email error:`, err));

    // Return success even if email failed (lead is still captured)
    // But include email status for debugging
    return NextResponse.json({
      success: true,
      leadSaved,
      emailSent: teamEmailResult.success,
      emailError: teamEmailResult.error || null,
      report: reportData,
    });
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

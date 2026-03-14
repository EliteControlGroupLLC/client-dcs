// Property Report API — Lead capture + report generation endpoint
// Saves lead info and generates a property development report.

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      propertyAddress,
      scanResults,
    } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    if (!propertyAddress) {
      return NextResponse.json(
        { error: "Property address is required" },
        { status: 400 }
      );
    }

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
        name,
        email,
        phone: phone || null,
        service_type: "property-report",
        property_address: propertyAddress,
        message: `Property Development Report requested. Confidence: ${reportData.confidenceScore}%. Recommended: ${reportData.feasibilitySummary.recommendedPath}.`,
        source: "property-scanner-report",
        status: "new",
      });
      leadSaved = true;
    } catch {
      // Supabase not available — lead not saved but report still generated
      leadSaved = false;
    }

    return NextResponse.json({
      success: true,
      leadSaved,
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

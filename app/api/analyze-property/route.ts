// Server-side Property Analysis Route
// Moves all external API calls server-side to protect API keys.
//
// LEGITIMACY GATE (lib/property-intelligence/verified-analysis.ts): a report
// is only returned for a REAL San Diego County property. Otherwise the route
// answers 422 with a machine-readable code instead of a fabricated report:
//   ADDRESS_NOT_FOUND  — no such address / no parcel record
//   ADDRESS_AMBIGUOUS  — several real addresses match (candidates listed)
//   OUT_OF_AREA        — a real address outside San Diego County
// Successful reports carry a signed reportToken so /api/property-report can
// verify the scan data a lead submits wasn't altered in the browser.

import { NextRequest, NextResponse } from "next/server";
import { runVerifiedAnalysis } from "@/lib/property-intelligence/verified-analysis";
import { signReport } from "@/lib/report-signature";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address } = body;

    if (!address || typeof address !== "string") {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    if (address.trim().length < 5) {
      return NextResponse.json(
        { error: "Address too short" },
        { status: 400 }
      );
    }

    console.log(`[SERVER-ANALYSIS] Starting analysis for: ${address.trim()}`);
    const analysis = await runVerifiedAnalysis(address);
    if (!analysis.ok) {
      return NextResponse.json(
        {
          success: false,
          code: analysis.code,
          message: analysis.message,
          ...(analysis.candidates?.length ? { candidates: analysis.candidates } : {}),
          ...analysis.extra,
        },
        { status: 422 }
      );
    }
    const { result, inputAddress, resolvedAddress, parcelMatch, elapsedMs } = analysis;

    console.log(`[SERVER-ANALYSIS] Completed in ${elapsedMs}ms, confidence: ${result.confidenceScore}, method: ${result.finalBuildability.geometryMethodUsed}`);

    return NextResponse.json({
      success: true,
      result,
      reportToken: signReport(result),
      meta: {
        inputAddress,
        resolvedAddress,
        parcelMatch,
        executionTimeMs: elapsedMs,
        geometryMethod: result.finalBuildability.geometryMethodUsed,
        buildabilityConfidence: result.finalBuildability.buildabilityConfidence,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[SERVER-ANALYSIS] Error:", error);
    return NextResponse.json(
      {
        error: "Analysis failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

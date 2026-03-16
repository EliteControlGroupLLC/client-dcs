// Server-side Property Analysis Route
// SURGICAL FIX: Moves all external API calls server-side to protect API keys.
// Client calls this route instead of directly calling external providers.

import { NextRequest, NextResponse } from "next/server";
import { analyzeProperty } from "@/lib/property-intelligence";

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

    console.log(`[SERVER-ANALYSIS] Starting analysis for: ${address}`);
    const startTime = Date.now();

    const result = await analyzeProperty(address);

    const elapsedMs = Date.now() - startTime;
    console.log(`[SERVER-ANALYSIS] Completed in ${elapsedMs}ms, confidence: ${result.confidenceScore}, method: ${result.finalBuildability.geometryMethodUsed}`);

    return NextResponse.json({
      success: true,
      result,
      meta: {
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

// Show Sources API — Admin-only endpoint returning full reconciliation audit data.
// Requires CRON_SECRET authentication.

import { NextRequest, NextResponse } from "next/server";
import { analyzeProperty } from "@/lib/property-intelligence";

const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(request: NextRequest) {
  // Authenticate — require CRON_SECRET
  const authHeader = request.headers.get("authorization");
  const bodyAuth = await request.clone().json().catch(() => ({}));
  const providedSecret = authHeader?.replace("Bearer ", "") || bodyAuth?.secret;

  if (!CRON_SECRET || providedSecret !== CRON_SECRET) {
    return NextResponse.json(
      { error: "Unauthorized — admin access required" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { address } = body;

    if (!address || typeof address !== "string") {
      return NextResponse.json(
        { error: "Property address is required" },
        { status: 400 }
      );
    }

    // Run full analysis with reconciliation
    const result = await analyzeProperty(address);

    if (!result.sourceAudit) {
      return NextResponse.json(
        { error: "Source audit data not available" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      address: result.property.address.value,
      sourceAudit: result.sourceAudit,
      dataSources: result.dataSources,
      confidenceScore: result.confidenceScore,
      confidenceBand: result.confidenceBand,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[SHOW-SOURCES] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST with { address, secret }." },
    { status: 405 }
  );
}

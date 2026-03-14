// Regulation Scan API — Cron-compatible endpoint for automated rule monitoring
// Called by Vercel Cron weekly (Mondays at 6am UTC) or manually via POST.

import { NextRequest, NextResponse } from "next/server";
import { runRegulationScan, getMonitoringStatus } from "@/lib/property-intelligence/regulation-monitor";

export async function GET(request: NextRequest) {
  // Vercel Cron sends a GET with Authorization: Bearer <CRON_SECRET>
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Authenticated Cron request — run the full scan
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    try {
      const result = await runRegulationScan();
      console.log(`[CRON] Regulation scan complete: ${result.sourcesChecked} sources, ${result.changesDetected} changes, ${result.errors} errors`);
      return NextResponse.json({ success: true, result });
    } catch (error) {
      console.error("[CRON] Regulation scan error:", error);
      return NextResponse.json(
        { error: "Failed to run regulation scan" },
        { status: 500 }
      );
    }
  }

  // Unauthenticated GET — return read-only monitoring status
  try {
    const status = getMonitoringStatus();
    return NextResponse.json({ status });
  } catch (error) {
    console.error("Regulation status error:", error);
    return NextResponse.json(
      { error: "Failed to get monitoring status" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const result = await runRegulationScan();
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Regulation scan error:", error);
    return NextResponse.json(
      { error: "Failed to run regulation scan" },
      { status: 500 }
    );
  }
}

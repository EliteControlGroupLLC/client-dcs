// Regulation Scan API — Cron-compatible endpoint for automated rule monitoring
// Designed to be called by Vercel Cron on a weekly schedule.

import { NextResponse } from "next/server";
import { runRegulationScan, getMonitoringStatus } from "@/lib/property-intelligence/regulation-monitor";

export async function GET() {
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

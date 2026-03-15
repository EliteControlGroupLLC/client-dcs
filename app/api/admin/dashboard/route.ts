// Admin Dashboard API — aggregates system health, regulation monitoring, and usage metrics.
// Protected by CRON_SECRET to restrict access to admins only.

import { NextRequest, NextResponse } from "next/server";
import {
  getRegulationSources,
  getRegulationHistory,
  getMonitoringStatus,
} from "@/lib/property-intelligence/regulation-monitor";

interface ApiKeyStatus {
  name: string;
  envVar: string;
  configured: boolean;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. API Key Configuration Status
  const apiKeys: ApiKeyStatus[] = [
    { name: "Google Places", envVar: "NEXT_PUBLIC_GOOGLE_PLACES_API_KEY", configured: !!process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY },
    { name: "ATTOM Property", envVar: "NEXT_PUBLIC_ATTOM_API_KEY", configured: !!process.env.NEXT_PUBLIC_ATTOM_API_KEY },
    { name: "Mapbox", envVar: "NEXT_PUBLIC_MAPBOX_TOKEN", configured: !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN },
    { name: "Zoneomics", envVar: "NEXT_PUBLIC_ZONEOMICS_API_KEY", configured: !!process.env.NEXT_PUBLIC_ZONEOMICS_API_KEY },
    { name: "RentCast", envVar: "NEXT_PUBLIC_RENTCAST_API_KEY", configured: !!process.env.NEXT_PUBLIC_RENTCAST_API_KEY },
    { name: "Resend (Email)", envVar: "RESEND_API_KEY", configured: !!process.env.RESEND_API_KEY },
  ];

  // 2. Regulation Monitoring Status
  const monitoringStatus = getMonitoringStatus();
  const regulationSources = getRegulationSources();
  const regulationHistory = getRegulationHistory();

  // 3. Cron Configuration
  const cronConfig = {
    regulationScan: { path: "/api/regulation-scan", schedule: "0 6 * * 1", description: "Weekly regulation scan (Mondays 6am UTC)" },
    systemHealth: { path: "/api/system-health", schedule: "0 12 * * *", description: "Daily system health check (12pm UTC)" },
  };

  // 4. Environment Info
  const environment = {
    nodeEnv: process.env.NODE_ENV || "unknown",
    vercelEnv: process.env.VERCEL_ENV || "unknown",
    region: process.env.VERCEL_REGION || "unknown",
    cronSecretConfigured: !!process.env.CRON_SECRET,
  };

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    apiKeys,
    allKeysConfigured: apiKeys.every((k) => k.configured),
    configuredCount: apiKeys.filter((k) => k.configured).length,
    totalKeys: apiKeys.length,
    monitoring: monitoringStatus,
    regulationSources: regulationSources.map((s) => ({
      id: s.id,
      jurisdictionId: s.jurisdictionId,
      sourceTitle: s.sourceTitle,
      sourceType: s.sourceType,
      monitorFrequency: s.monitorFrequency,
      lastChecked: s.lastChecked,
      lastChangeDetected: s.lastChangeDetected,
      active: s.active,
    })),
    regulationChanges: regulationHistory.slice(-20),
    cronConfig,
    environment,
  });
}

// System Health Validation API
// Verifies that all required external API providers are configured and operational.
// Protected by CRON_SECRET — only authenticated requests can trigger validation.

import { NextRequest, NextResponse } from "next/server";

interface ProviderStatus {
  name: string;
  configured: boolean;
  operational: boolean;
  latencyMs: number | null;
  error: string | null;
}

interface SystemHealthResult {
  timestamp: string;
  allOperational: boolean;
  providers: ProviderStatus[];
  summary: string;
}

/**
 * GET /api/system-health
 * Requires Authorization: Bearer <CRON_SECRET>
 * Validates all 5 required API providers are active and returning data.
 */
export async function GET(request: NextRequest) {
  // Auth check — only allow with CRON_SECRET
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const providers: ProviderStatus[] = await Promise.all([
    checkGooglePlaces(),
    checkAttom(),
    checkMapbox(),
    checkZoneomics(),
    checkRentCast(),
  ]);

  const allOperational = providers.every((p) => p.operational);
  const failedProviders = providers.filter((p) => !p.operational);

  // Log errors for any failed providers
  for (const provider of failedProviders) {
    console.error(
      `[SYSTEM-HEALTH] Provider FAILED: ${provider.name} — ${provider.configured ? "configured but not responding" : "NOT CONFIGURED (missing API key)"}: ${provider.error || "unknown error"}`
    );
  }

  if (!allOperational) {
    console.error(
      `[SYSTEM-HEALTH] ${failedProviders.length}/${providers.length} providers are DOWN: ${failedProviders.map((p) => p.name).join(", ")}`
    );
  } else {
    console.log(
      `[SYSTEM-HEALTH] All ${providers.length} providers operational. Latencies: ${providers.map((p) => `${p.name}=${p.latencyMs}ms`).join(", ")}`
    );
  }

  const result: SystemHealthResult = {
    timestamp: new Date().toISOString(),
    allOperational,
    providers,
    summary: allOperational
      ? `All ${providers.length} providers operational`
      : `${failedProviders.length} provider(s) down: ${failedProviders.map((p) => p.name).join(", ")}`,
  };

  return NextResponse.json(result, {
    status: allOperational ? 200 : 503,
  });
}

// ---------------------------------------------------------------------------
// Individual provider checks
// ---------------------------------------------------------------------------

async function checkGooglePlaces(): Promise<ProviderStatus> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return { name: "Google Places", configured: false, operational: false, latencyMs: null, error: "NEXT_PUBLIC_GOOGLE_PLACES_API_KEY not set" };
  }

  try {
    const start = Date.now();
    // Use a known San Diego address for the health check
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent("1600 Pacific Hwy, San Diego, CA 92101")}&key=${apiKey}`,
      { signal: AbortSignal.timeout(10000) }
    );
    const latency = Date.now() - start;
    const data = await res.json();

    if (data.status === "OK" && data.results?.length > 0) {
      return { name: "Google Places", configured: true, operational: true, latencyMs: latency, error: null };
    }
    return { name: "Google Places", configured: true, operational: false, latencyMs: latency, error: `API returned status: ${data.status}` };
  } catch (e) {
    return { name: "Google Places", configured: true, operational: false, latencyMs: null, error: String(e) };
  }
}

async function checkAttom(): Promise<ProviderStatus> {
  const apiKey = process.env.NEXT_PUBLIC_ATTOM_API_KEY;
  if (!apiKey) {
    return { name: "ATTOM Property", configured: false, operational: false, latencyMs: null, error: "NEXT_PUBLIC_ATTOM_API_KEY not set" };
  }

  try {
    const start = Date.now();
    const res = await fetch(
      `https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/detail?address1=${encodeURIComponent("1600 Pacific Hwy")}&address2=${encodeURIComponent("San Diego, CA 92101")}`,
      {
        headers: { Accept: "application/json", apikey: apiKey },
        signal: AbortSignal.timeout(10000),
      }
    );
    const latency = Date.now() - start;

    if (res.ok) {
      const data = await res.json();
      if (data.property && data.property.length > 0) {
        return { name: "ATTOM Property", configured: true, operational: true, latencyMs: latency, error: null };
      }
      return { name: "ATTOM Property", configured: true, operational: false, latencyMs: latency, error: "No property data returned" };
    }
    return { name: "ATTOM Property", configured: true, operational: false, latencyMs: latency, error: `HTTP ${res.status}` };
  } catch (e) {
    return { name: "ATTOM Property", configured: true, operational: false, latencyMs: null, error: String(e) };
  }
}

async function checkMapbox(): Promise<ProviderStatus> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) {
    return { name: "Mapbox", configured: false, operational: false, latencyMs: null, error: "NEXT_PUBLIC_MAPBOX_TOKEN not set" };
  }

  try {
    const start = Date.now();
    // Validate the token by requesting a static map tile
    const res = await fetch(
      `https://api.mapbox.com/styles/v1/mapbox/light-v11?access_token=${token}`,
      { signal: AbortSignal.timeout(10000) }
    );
    const latency = Date.now() - start;

    if (res.ok) {
      return { name: "Mapbox", configured: true, operational: true, latencyMs: latency, error: null };
    }
    return { name: "Mapbox", configured: true, operational: false, latencyMs: latency, error: `HTTP ${res.status}` };
  } catch (e) {
    return { name: "Mapbox", configured: true, operational: false, latencyMs: null, error: String(e) };
  }
}

async function checkZoneomics(): Promise<ProviderStatus> {
  const apiKey = process.env.NEXT_PUBLIC_ZONEOMICS_API_KEY;
  if (!apiKey) {
    return { name: "Zoneomics", configured: false, operational: false, latencyMs: null, error: "NEXT_PUBLIC_ZONEOMICS_API_KEY not set" };
  }

  try {
    const start = Date.now();
    // Use San Diego coordinates for health check
    const res = await fetch(
      `https://api.zoneomics.com/v2/zoneDetail?lat=32.7157&lng=-117.1611&api_key=${apiKey}`,
      {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(10000),
      }
    );
    const latency = Date.now() - start;

    if (res.ok) {
      return { name: "Zoneomics", configured: true, operational: true, latencyMs: latency, error: null };
    }
    return { name: "Zoneomics", configured: true, operational: false, latencyMs: latency, error: `HTTP ${res.status}` };
  } catch (e) {
    return { name: "Zoneomics", configured: true, operational: false, latencyMs: null, error: String(e) };
  }
}

async function checkRentCast(): Promise<ProviderStatus> {
  const apiKey = process.env.NEXT_PUBLIC_RENTCAST_API_KEY;
  if (!apiKey) {
    return { name: "RentCast", configured: false, operational: false, latencyMs: null, error: "NEXT_PUBLIC_RENTCAST_API_KEY not set" };
  }

  try {
    const start = Date.now();
    const res = await fetch(
      `https://api.rentcast.io/v1/avm/rent/long-term?address=${encodeURIComponent("1600 Pacific Hwy, San Diego, CA 92101")}&propertyType=apartment&bedrooms=1&bathrooms=1&squareFootage=600`,
      {
        headers: { Accept: "application/json", "X-Api-Key": apiKey },
        signal: AbortSignal.timeout(10000),
      }
    );
    const latency = Date.now() - start;

    if (res.ok) {
      const data = await res.json();
      if (data.rent) {
        return { name: "RentCast", configured: true, operational: true, latencyMs: latency, error: null };
      }
      return { name: "RentCast", configured: true, operational: false, latencyMs: latency, error: "No rent data returned" };
    }
    return { name: "RentCast", configured: true, operational: false, latencyMs: latency, error: `HTTP ${res.status}` };
  } catch (e) {
    return { name: "RentCast", configured: true, operational: false, latencyMs: null, error: String(e) };
  }
}

// Address autocomplete — real addresses from the free, keyless ArcGIS World
// geocoder, limited to San Diego County (the only area the ADU tool has parcel
// + zoning data for). Replaces the old hardcoded sample-address fallback.

import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

const GEOCODER = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer";
// Only real, known addresses — excludes StreetAddressExt (extrapolated past the
// known range), bare street names, and localities.
const REAL_ADDR_TYPES = new Set(["PointAddress", "StreetAddress", "Subaddress"]);
const MIN_SCORE = 80;
// San Diego County bounding box (xmin,ymin,xmax,ymax) + downtown bias point.
const SD_COUNTY_EXTENT = "-117.62,32.53,-116.08,33.51";
const SD_CENTER = "-117.1611,32.7157";

// "4726 Felton St, San Diego, CA, 92116, USA" -> "4726 Felton St, San Diego, CA 92116"
// "4726 Felton St, San Diego, California, 92116" -> same
function formatAddress(text: string): string {
  return text
    .replace(/,\s*USA$/, "")
    .replace(/,\s*California,/, ", CA,")
    .replace(/,\s*([A-Z]{2}),\s*(\d{5})/, ", $1 $2");
}

const baseParams = {
  category: "Address,Subaddress",
  countryCode: "USA",
  location: SD_CENTER,
  searchExtent: SD_COUNTY_EXTENT,
  f: "json",
};

// Fast prefix type-ahead. Exact spelling only.
async function suggest(q: string): Promise<string[]> {
  const params = new URLSearchParams({ ...baseParams, text: q, maxSuggestions: "6" });
  const res = await fetch(`${GEOCODER}/suggest?${params}`, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`ArcGIS suggest HTTP ${res.status}`);
  const data = (await res.json()) as { suggestions?: { text?: string }[] };
  return (data.suggestions ?? []).map((s) => s.text ?? "").filter(Boolean);
}

// Spelling-tolerant search ("1015 monterrey" -> "1015 Monterey Ct").
async function fuzzy(q: string): Promise<string[]> {
  const params = new URLSearchParams({
    ...baseParams,
    SingleLine: q,
    maxLocations: "8",
    outFields: "Addr_type",
  });
  const res = await fetch(`${GEOCODER}/findAddressCandidates?${params}`, {
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`ArcGIS candidates HTTP ${res.status}`);
  const data = (await res.json()) as {
    candidates?: { address?: string; score?: number; attributes?: { Addr_type?: string } }[];
  };
  return (data.candidates ?? [])
    .filter(
      (c) =>
        c.address &&
        (c.score ?? 0) >= MIN_SCORE &&
        REAL_ADDR_TYPES.has(c.attributes?.Addr_type ?? "")
    )
    .map((c) => c.address as string);
}

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`address-suggest:${ip}`, RATE_LIMITS.addressSuggest);
  if (!limit.allowed) {
    return NextResponse.json({ suggestions: [] }, { status: 429 });
  }

  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 3 || q.length > 200) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const [typeAhead, spellTolerant] = await Promise.allSettled([suggest(q), fuzzy(q)]);
    const primary = typeAhead.status === "fulfilled" ? typeAhead.value : [];
    // Only lean on the fuzzy matches when the exact type-ahead comes up short
    // (typos, misspelled street names).
    const secondary =
      primary.length < 3 && spellTolerant.status === "fulfilled" ? spellTolerant.value : [];
    const suggestions = Array.from(
      new Set([...primary, ...secondary].map(formatAddress))
    ).slice(0, 6);
    return NextResponse.json(
      { suggestions },
      { headers: { "Cache-Control": "public, max-age=300" } }
    );
  } catch (error) {
    console.error("[ADDRESS-SUGGEST] error:", error);
    return NextResponse.json({ suggestions: [] });
  }
}

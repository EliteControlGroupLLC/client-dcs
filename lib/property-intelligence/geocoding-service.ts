// Geocoding Service — free/keyless by default.
//
// Priority: Google (only if a key is configured) → US Census geocoder
// (free, public-domain, storable, great for CA) → ArcGIS World Geocoder
// (free single-line lookups). Returns a stable GeocodingResult so the rest
// of the property-intelligence pipeline is unchanged.
//
// This replaces the old Google-only implementation that returned null with
// no key — which is what silently collapsed the whole real-data path and
// forced the engine into address-seeded fabrication.

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

export type GeocodingProvider = "Google Geocoding" | "U.S. Census Geocoder" | "ArcGIS World Geocoder";

export interface GeocodingResult {
  /** Which geocoder actually produced this result (for honest source labels). */
  provider: GeocodingProvider;
  formattedAddress: string;
  lat: number;
  lng: number;
  placeId: string;
  components: {
    streetNumber?: string;
    route?: string;
    city?: string;
    county?: string;
    state?: string;
    zip?: string;
  };
}

interface GoogleGeocodingResponse {
  results: Array<{
    formatted_address: string;
    place_id: string;
    geometry: { location: { lat: number; lng: number } };
    address_components: Array<{ long_name: string; short_name: string; types: string[] }>;
  }>;
  status: string;
}

// ---------------------------------------------------------------------------
// San Diego County address resolution
//
// The ADU tool only has parcel + zoning data for San Diego County, and a
// partial address ("4920 63rd st") must NEVER be silently guessed. This
// resolver asks the ArcGIS World geocoder for real, known addresses inside the
// county (PointAddress / StreetAddress / Subaddress, high score, same house
// number) and reports:
//   - resolved   → exactly one distinct real address (use it)
//   - ambiguous  → several distinct real addresses (let the user pick)
//   - not_found  → nothing real in the county
//   - out_of_area→ a real address, but outside San Diego County
//   - unavailable→ the geocoder itself failed (caller decides; never guess)
// ---------------------------------------------------------------------------

const ARCGIS_CANDIDATES =
  "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates";
/** San Diego County bounding box (xmin,ymin,xmax,ymax) + downtown bias point. */
export const SD_COUNTY_EXTENT = "-117.62,32.53,-116.08,33.51";
const SD_CENTER = "-117.1611,32.7157";
const SD_COUNTY_NAME = "San Diego County";
const REAL_ADDR_TYPES = new Set(["PointAddress", "StreetAddress", "Subaddress"]);
const MIN_RESOLVE_SCORE = 90;
/** Candidates within this many points of the best score count as equally good. */
const AMBIGUITY_WINDOW = 1.5;

export type AddressResolution =
  | { status: "resolved"; address: string; lat: number; lng: number; addrType: string; score: number }
  | {
      status: "ambiguous";
      candidates: string[];
      /** True when the real matches don't agree with the city/ZIP the user typed. */
      localityMismatch?: boolean;
    }
  | { status: "not_found"; reason: string }
  | { status: "out_of_area"; matchedAddress: string; county: string | null }
  | { status: "unavailable"; reason: string };

interface ArcGISCandidate {
  address?: string;
  score?: number;
  location?: { x: number; y: number };
  attributes?: {
    Addr_type?: string;
    Subregion?: string;
    City?: string;
    Postal?: string;
    RegionAbbr?: string;
    AddNum?: string;
    StAddr?: string;
  };
}

/** "4920 63rd St, San Diego, California, 92115" → "4920 63rd St, San Diego, CA 92115" */
export function formatArcGISAddress(text: string): string {
  return text
    .replace(/,\s*USA$/, "")
    .replace(/,\s*California,/, ", CA,")
    .replace(/,\s*([A-Z]{2}),\s*(\d{5})/, ", $1 $2");
}

/** True when the input already names a city/ZIP (has a comma or a 5-digit ZIP). */
export function hasLocality(address: string): boolean {
  return /,/.test(address) || /\b\d{5}(?:-\d{4})?\b/.test(address);
}

function leadingHouseNumber(address: string): string | null {
  return address.trim().match(/^(\d+)[A-Za-z]?\b/)?.[1] ?? null;
}

async function arcgisCandidates(
  singleLine: string,
  restrictToSanDiego: boolean
): Promise<ArcGISCandidate[]> {
  const params = new URLSearchParams({
    SingleLine: singleLine,
    outFields: "Addr_type,Subregion,City,Postal,RegionAbbr,AddNum,StAddr",
    maxLocations: "10",
    countryCode: "USA",
    f: "json",
  });
  if (restrictToSanDiego) {
    params.set("searchExtent", SD_COUNTY_EXTENT);
    params.set("location", SD_CENTER);
  }
  const res = await fetch(`${ARCGIS_CANDIDATES}?${params}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`ArcGIS HTTP ${res.status}`);
  const data = (await res.json()) as { candidates?: ArcGISCandidate[]; error?: { message?: string } };
  if (data.error) throw new Error(`ArcGIS error: ${data.error.message ?? "unknown"}`);
  return data.candidates ?? [];
}

function isRealAddress(c: ArcGISCandidate, houseNumber: string | null): boolean {
  const a = c.attributes ?? {};
  if (!c.address || !c.location) return false;
  if ((c.score ?? 0) < MIN_RESOLVE_SCORE) return false;
  if (!REAL_ADDR_TYPES.has(a.Addr_type ?? "")) return false;
  // Never swap the house number the user typed for a different one.
  if (houseNumber && String(a.AddNum ?? "").trim() !== houseNumber) return false;
  return true;
}

/**
 * When the user typed a ZIP or a city, a candidate must agree with it — the
 * geocoder will otherwise happily return "1015 Monterey Ct, Chula Vista" for
 * "1015 Monterey Ct, San Diego, CA 92109". Inconsistent real matches are
 * offered as "did you mean" choices, never auto-picked.
 */
function consistentWithLocality(c: ArcGISCandidate, query: string): boolean {
  const a = c.attributes ?? {};
  const q = query.toUpperCase();
  const city = (a.City ?? "").toUpperCase();
  const cityNamed = city.length > 0 && q.includes(city);
  const zip = query.match(/\b(\d{5})(?:-\d{4})?\s*$/)?.[1] ?? query.match(/,\s*[A-Za-z .]*\b(\d{5})\b/)?.[1];
  if (zip) return a.Postal === zip || cityNamed;
  if (query.includes(",")) return cityNamed || (c.score ?? 0) >= 97;
  return true;
}

const inSanDiegoCounty = (c: ArcGISCandidate) =>
  c.attributes?.Subregion === SD_COUNTY_NAME && c.attributes?.RegionAbbr === "CA";

const resolutionCache = new Map<string, { at: number; value: AddressResolution }>();
const RESOLUTION_TTL_MS = 10 * 60 * 1000;

/**
 * Resolve a (possibly partial) address to ONE real San Diego County address,
 * or report why it can't be. Never guesses.
 */
export async function resolveSanDiegoAddress(input: string): Promise<AddressResolution> {
  const query = input.trim().replace(/\s+/g, " ");
  const key = query.toLowerCase();
  const cached = resolutionCache.get(key);
  if (cached && Date.now() - cached.at < RESOLUTION_TTL_MS) return cached.value;

  const result = await resolveUncached(query);
  if (result.status !== "unavailable") {
    if (resolutionCache.size > 500) resolutionCache.clear();
    resolutionCache.set(key, { at: Date.now(), value: result });
  }
  return result;
}

async function resolveUncached(query: string): Promise<AddressResolution> {
  const houseNumber = leadingHouseNumber(query);
  if (!houseNumber) {
    return { status: "not_found", reason: "No house number — enter the full street address." };
  }

  let local: ArcGISCandidate[];
  try {
    local = await arcgisCandidates(query, true);
  } catch (err) {
    return { status: "unavailable", reason: err instanceof Error ? err.message : String(err) };
  }

  const realInCounty = local.filter((c) => isRealAddress(c, houseNumber) && inSanDiegoCounty(c));
  const real = realInCounty.filter((c) => consistentWithLocality(c, query));
  if (real.length === 0 && realInCounty.length > 0) {
    // Real addresses exist, but not in the city/ZIP the user typed — ask.
    const choices = Array.from(
      new Set(realInCounty.map((c) => formatArcGISAddress(c.address as string)))
    ).slice(0, 8);
    return { status: "ambiguous", candidates: choices, localityMismatch: true };
  }
  if (real.length > 0) {
    const top = Math.max(...real.map((c) => c.score ?? 0));
    const best = real.filter((c) => (c.score ?? 0) >= top - AMBIGUITY_WINDOW);
    // Distinct properties = distinct street address + city (the same address
    // can come back as both a PointAddress and a StreetAddress, or with two ZIPs).
    const distinct = new Map<string, ArcGISCandidate>();
    for (const c of best) {
      const a = c.attributes ?? {};
      const k = `${(a.StAddr ?? c.address ?? "").toUpperCase()}|${(a.City ?? "").toUpperCase()}`;
      const prev = distinct.get(k);
      // Prefer the rooftop PointAddress over an interpolated StreetAddress.
      if (!prev || (prev.attributes?.Addr_type !== "PointAddress" && a.Addr_type === "PointAddress")) {
        distinct.set(k, c);
      }
    }
    const picks = Array.from(distinct.values());
    if (picks.length === 1) {
      const c = picks[0];
      return {
        status: "resolved",
        address: formatArcGISAddress(c.address as string),
        lat: c.location!.y,
        lng: c.location!.x,
        addrType: c.attributes?.Addr_type ?? "",
        score: c.score ?? 0,
      };
    }
    return {
      status: "ambiguous",
      candidates: picks.slice(0, 8).map((c) => formatArcGISAddress(c.address as string)),
    };
  }

  // Nothing real inside the county. If the user named a place, check whether
  // it's a real address somewhere else (→ out of area) rather than a typo.
  if (hasLocality(query) || /\b(CA|California)\s*$/i.test(query)) {
    try {
      const anywhere = await arcgisCandidates(query, false);
      const elsewhere = anywhere.find((c) => isRealAddress(c, houseNumber) && !inSanDiegoCounty(c));
      if (elsewhere && (elsewhere.score ?? 0) >= 95) {
        return {
          status: "out_of_area",
          matchedAddress: formatArcGISAddress(elsewhere.address as string),
          county: elsewhere.attributes?.Subregion ?? null,
        };
      }
    } catch {
      // fall through to not_found — the county search already came up empty
    }
  }
  return { status: "not_found", reason: "No matching address in San Diego County." };
}

export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  // 0) A partial address (no city/ZIP) must be resolved inside San Diego
  //    County first — Census/Google would otherwise guess anywhere in the US,
  //    or fail and leave the engine fabricating. Ambiguous / unknown → null.
  if (!hasLocality(address)) {
    const r = await resolveSanDiegoAddress(address).catch(
      (): AddressResolution => ({ status: "unavailable", reason: "resolver error" })
    );
    if (r.status === "resolved") address = r.address;
    else if (r.status !== "unavailable") return null;
  }
  // 1) Google, only if a key exists (best precision).
  if (GOOGLE_API_KEY) {
    const g = await geocodeGoogle(address).catch(() => null);
    if (g) return g;
  }
  // 2) US Census — free, keyless, storable, rooftop-ish for CA parcels.
  const census = await geocodeCensus(address).catch(() => null);
  if (census) return census;
  // 3) ArcGIS World Geocoder — free single-line fallback.
  const arcgis = await geocodeArcGIS(address).catch(() => null);
  if (arcgis) return arcgis;
  return null;
}

async function geocodeGoogle(address: string): Promise<GeocodingResult | null> {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`
  );
  if (!response.ok) return null;
  const data: GoogleGeocodingResponse = await response.json();
  if (data.status !== "OK" || data.results.length === 0) return null;
  const result = data.results[0];
  const components: GeocodingResult["components"] = {};
  for (const comp of result.address_components) {
    if (comp.types.includes("street_number")) components.streetNumber = comp.long_name;
    if (comp.types.includes("route")) components.route = comp.long_name;
    if (comp.types.includes("locality")) components.city = comp.long_name;
    if (comp.types.includes("administrative_area_level_2")) components.county = comp.long_name;
    if (comp.types.includes("administrative_area_level_1")) components.state = comp.short_name;
    if (comp.types.includes("postal_code")) components.zip = comp.long_name;
  }
  return {
    provider: "Google Geocoding",
    formattedAddress: result.formatted_address,
    lat: result.geometry.location.lat,
    lng: result.geometry.location.lng,
    placeId: result.place_id,
    components,
  };
}

interface CensusResponse {
  result?: {
    addressMatches?: Array<{
      matchedAddress?: string;
      coordinates?: { x: number; y: number };
      addressComponents?: {
        city?: string;
        state?: string;
        zip?: string;
        streetName?: string;
        fromAddress?: string;
      };
    }>;
  };
}

async function geocodeCensus(address: string): Promise<GeocodingResult | null> {
  const url =
    `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress` +
    `?address=${encodeURIComponent(address)}&benchmark=Public_AR_Current&format=json`;
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) return null;
  const data: CensusResponse = await response.json();
  const match = data.result?.addressMatches?.[0];
  if (!match?.coordinates) return null;
  const c = match.addressComponents ?? {};
  return {
    provider: "U.S. Census Geocoder",
    formattedAddress: match.matchedAddress ?? address,
    lat: match.coordinates.y, // Census x=lng, y=lat
    lng: match.coordinates.x,
    placeId: `census:${match.coordinates.y},${match.coordinates.x}`,
    components: {
      streetNumber: c.fromAddress,
      route: c.streetName,
      city: c.city,
      state: c.state,
      zip: c.zip,
    },
  };
}

interface ArcGISResponse {
  candidates?: Array<{
    address?: string;
    location?: { x: number; y: number };
    attributes?: { City?: string; RegionAbbr?: string; Postal?: string; Subregion?: string };
  }>;
}

async function geocodeArcGIS(address: string): Promise<GeocodingResult | null> {
  const url =
    `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates` +
    `?SingleLine=${encodeURIComponent(address)}&outFields=City,RegionAbbr,Postal,Subregion&maxLocations=1&f=json`;
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) return null;
  const data: ArcGISResponse = await response.json();
  const cand = data.candidates?.[0];
  if (!cand?.location) return null;
  const a = cand.attributes ?? {};
  return {
    provider: "ArcGIS World Geocoder",
    formattedAddress: cand.address ?? address,
    lat: cand.location.y,
    lng: cand.location.x,
    placeId: `arcgis:${cand.location.y},${cand.location.x}`,
    components: {
      city: a.City,
      county: a.Subregion,
      state: a.RegionAbbr,
      zip: a.Postal,
    },
  };
}

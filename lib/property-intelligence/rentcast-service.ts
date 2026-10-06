// RentCast Service — Rent estimate and market-rent intelligence
// Powers estimated monthly/annual rent, ROI/cash-flow scenarios, and value assumptions.
// All outputs are clearly labeled as estimate-based and assumption-driven.

// Server-side key (the one set in .env.local / prod). The NEXT_PUBLIC_ name is
// only a legacy fallback — reading it alone made RentCast silently "off".
const RENTCAST_API_KEY = process.env.RENTCAST_API_KEY || process.env.NEXT_PUBLIC_RENTCAST_API_KEY;
const RENTCAST_BASE_URL = "https://api.rentcast.io/v1";


export interface RentEstimate {
  estimatedMonthlyRent: number;
  estimatedAnnualRent: number;
  rentRangeLow: number;
  rentRangeHigh: number;
  pricePerSqft: number;
  comparableCount: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  propertyType: string;
  confidence: number;
  available: boolean;
  source: "rentcast" | "estimated";
}

interface RentCastResponse {
  rent?: number;
  rentRangeLow?: number;
  rentRangeHigh?: number;
  comparables?: Array<{
    rent?: number;
    squareFootage?: number;
    bedrooms?: number;
    bathrooms?: number;
  }>;
}

/**
 * Check if RentCast API is configured
 */
export function isRentCastAvailable(): boolean {
  return Boolean(RENTCAST_API_KEY);
}

export interface MarketRentComparable {
  address: string;
  monthlyRent: number;
  squareFootage: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  distanceMiles: number | null;
}

/** Comps are drawn from this radius first — "within about a mile" of the subject. */
export const MARKET_RENT_RADIUS_MILES = 1;
/** Only widened to this when a mile does not hold enough same-configuration rentals. */
export const MARKET_RENT_WIDENED_RADIUS_MILES = 3;
/** Fewer qualifying comps than this is not credible evidence — we say so instead of showing it. */
export const MARKET_RENT_MIN_COMPS = 3;

export interface MarketRentResult {
  monthlyRent: number;
  rentRangeLow: number;
  rentRangeHigh: number;
  comparableCount: number;
  comparables: MarketRentComparable[];
  /** What was priced, e.g. "3-bed / 2-bath rentals within 1 mile". */
  basis: string;
  /** Radius the shown comps actually came from, in miles. */
  radiusMiles: number;
  /** True when one mile did not hold enough same-configuration rentals and we went wider. */
  widened: boolean;
  /** Bedroom count every shown comp matches. */
  bedrooms: number;
  source: "RentCast rent AVM";
}

/**
 * Outcome of the market-rent lookup. Deliberately explicit: the report must be
 * able to say "we found N comps within X miles" or "we could not find enough",
 * and must never silently pass off a thin or wide sample as local market data.
 */
export type MarketRentOutcome =
  | { status: "ok"; result: MarketRentResult }
  | {
      /** RentCast answered, but too few same-configuration rentals inside the widened radius. */
      status: "insufficient";
      qualifyingCount: number;
      radiusMiles: number;
      bedrooms: number;
    }
  | {
      /** No key, network/HTTP failure, or an unusable payload. Nothing may be claimed. */
      status: "unavailable";
      reason: string;
    };

interface RawComparable {
  formattedAddress?: string;
  price?: number;
  rent?: number;
  squareFootage?: number;
  bedrooms?: number;
  bathrooms?: number;
  distance?: number;
}

function toNumberOrNull(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * Keep only comps that are genuinely comparable to the modeled unit:
 * the SAME bedroom count, and inside the radius. Square footage is
 * deliberately ignored — a 3-bed is a 3-bed at 900 or 1,200 sq ft.
 * A comp with no reported distance cannot be proven to be inside the
 * radius, so it is dropped rather than assumed.
 *
 * Exported for offline verification; pure, no network.
 */
export function selectConfigurationComps(
  raw: RawComparable[],
  opts: { bedrooms: number; radiusMiles: number }
): MarketRentComparable[] {
  return raw
    .map((c) => ({
      address: typeof c.formattedAddress === "string" ? c.formattedAddress : "",
      monthlyRent: Math.round(Number(c.price ?? c.rent ?? 0)),
      squareFootage: toNumberOrNull(c.squareFootage),
      bedrooms: toNumberOrNull(c.bedrooms),
      bathrooms: toNumberOrNull(c.bathrooms),
      distanceMiles: (() => {
        const d = toNumberOrNull(c.distance);
        return d === null ? null : Math.round(d * 100) / 100;
      })(),
    }))
    .filter(
      (c) =>
        c.address !== "" &&
        c.monthlyRent > 0 &&
        c.bedrooms === opts.bedrooms &&
        c.distanceMiles !== null &&
        c.distanceMiles <= opts.radiusMiles
    )
    .sort((a, b) => (a.distanceMiles ?? 0) - (b.distanceMiles ?? 0));
}

/** Median of the comps' actual asking rents — never an interpolated or modeled figure. */
export function medianRent(comps: MarketRentComparable[]): number {
  const rents = comps.map((c) => c.monthlyRent).sort((a, b) => a - b);
  if (rents.length === 0) return 0;
  const mid = Math.floor(rents.length / 2);
  return rents.length % 2 === 1 ? rents[mid] : Math.round((rents[mid - 1] + rents[mid]) / 2);
}

async function requestRentComps(q: {
  address: string;
  bedrooms: number;
  bathrooms: number;
  propertyType: "Single Family" | "Apartment";
  radiusMiles: number;
}): Promise<RawComparable[] | { error: string }> {
  const params = new URLSearchParams({
    address: q.address,
    propertyType: q.propertyType,
    bedrooms: String(q.bedrooms),
    bathrooms: String(q.bathrooms),
    // Comps are matched on CONFIGURATION, not size. Sending squareFootage made
    // RentCast price a 1,200 sq ft ADU like a small apartment.
    maxRadius: String(q.radiusMiles),
    // RentCast caps compCount at 25; ask for the most it will give so there is
    // something left after we filter to the exact bedroom count.
    compCount: "25",
    // Without this, RentCast quietly substitutes the MAIN HOUSE's attributes
    // (its square footage, its bed/bath count) for anything we leave out — the
    // opposite of what we want when pricing a backyard unit.
    lookupSubjectAttributes: "false",
  });
  try {
    const response = await fetch(`${RENTCAST_BASE_URL}/avm/rent/long-term?${params}`, {
      headers: { Accept: "application/json", "X-Api-Key": RENTCAST_API_KEY as string },
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    if (!response.ok) {
      console.error(`[PROVIDER-ERROR] RentCast rent AVM: HTTP ${response.status}`);
      return { error: `RentCast returned HTTP ${response.status}` };
    }
    const data = (await response.json()) as { comparables?: RawComparable[] };
    return Array.isArray(data.comparables) ? data.comparables : [];
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.error(`[PROVIDER-ERROR] RentCast rent AVM: ${reason}`);
    return { error: reason };
  }
}

/**
 * Real rental comparables for a unit of the given CONFIGURATION near this
 * address (RentCast long-term rent AVM).
 *
 * Matched on bedrooms / bathrooms / property type and drawn from ~1 mile.
 * Square footage is deliberately not sent: a 3-bed ADU rents as a 3-bed
 * whether it is 900 or 1,200 sq ft, and sending a small footprint made the
 * AVM price it like a small apartment.
 *
 * The returned numbers are the comps' own asking rents (median, low, high) —
 * nothing is modeled or interpolated. If fewer than MARKET_RENT_MIN_COMPS
 * same-bedroom rentals sit inside the radius, the radius is widened once and
 * the result SAYS it was widened; if it still falls short, the outcome is
 * "insufficient" and the report must say so rather than quietly using a
 * wider or looser net.
 */
export async function fetchMarketRent(q: {
  address: string;
  bedrooms: number;
  bathrooms: number;
  propertyType: "Single Family" | "Apartment";
}): Promise<MarketRentOutcome> {
  if (!RENTCAST_API_KEY) return { status: "unavailable", reason: "RentCast API key not configured" };
  if (!q.address) return { status: "unavailable", reason: "No formatted address to price against" };

  const radii = [MARKET_RENT_RADIUS_MILES, MARKET_RENT_WIDENED_RADIUS_MILES];
  let lastQualifyingCount = 0;
  let lastError: string | null = null;

  for (const radiusMiles of radii) {
    const raw = await requestRentComps({ ...q, radiusMiles });
    if (!Array.isArray(raw)) {
      lastError = raw.error;
      continue;
    }
    // Belt and braces: RentCast honors maxRadius, but we re-check every comp's
    // own distance so nothing outside the stated radius can reach the report.
    const comps = selectConfigurationComps(raw, { bedrooms: q.bedrooms, radiusMiles });
    lastQualifyingCount = comps.length;
    if (comps.length < MARKET_RENT_MIN_COMPS) continue;

    const rents = comps.map((c) => c.monthlyRent);
    const layout = q.bedrooms === 0 ? "studio" : `${q.bedrooms}-bed / ${q.bathrooms}-bath`;
    const widened = radiusMiles > MARKET_RENT_RADIUS_MILES;
    return {
      status: "ok",
      result: {
        monthlyRent: medianRent(comps),
        rentRangeLow: Math.min(...rents),
        rentRangeHigh: Math.max(...rents),
        comparableCount: comps.length,
        comparables: comps.slice(0, 5),
        basis: `${comps.length} ${layout} ${q.propertyType === "Apartment" ? "apartment" : "single-family"} rentals within ${radiusMiles} mile${radiusMiles === 1 ? "" : "s"} of this address${widened ? ` (widened from ${MARKET_RENT_RADIUS_MILES} mile — fewer than ${MARKET_RENT_MIN_COMPS} matching rentals were listed that close)` : ""}`,
        radiusMiles,
        widened,
        bedrooms: q.bedrooms,
        source: "RentCast rent AVM",
      },
    };
  }

  if (lastError && lastQualifyingCount === 0) return { status: "unavailable", reason: lastError };
  return {
    status: "insufficient",
    qualifyingCount: lastQualifyingCount,
    radiusMiles: MARKET_RENT_WIDENED_RADIUS_MILES,
    bedrooms: q.bedrooms,
  };
}

/**
 * Fetch rent estimate from RentCast API for a specific property or area
 */
export async function getRentEstimate(
  address: string,
  bedrooms: number = 1,
  bathrooms: number = 1,
  sqft: number = 600,
  propertyType: string = "apartment"
): Promise<RentEstimate> {
  const fallbackEstimate = generateFallbackRentEstimate(bedrooms, bathrooms, sqft, propertyType);

  if (!RENTCAST_API_KEY) return fallbackEstimate;

  try {
    const url = `${RENTCAST_BASE_URL}/avm/rent/long-term?address=${encodeURIComponent(address)}&propertyType=${propertyType}&bedrooms=${bedrooms}&bathrooms=${bathrooms}&squareFootage=${sqft}`;
    
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "X-Api-Key": RENTCAST_API_KEY,
      },
    });

    if (!response.ok) return fallbackEstimate;

    const data: RentCastResponse = await response.json();

    if (!data.rent) return fallbackEstimate;

    const monthlyRent = Math.round(data.rent);
    const annualRent = monthlyRent * 12;
    const pricePerSqft = sqft > 0 ? Math.round((monthlyRent / sqft) * 100) / 100 : 0;

    return {
      estimatedMonthlyRent: monthlyRent,
      estimatedAnnualRent: annualRent,
      rentRangeLow: data.rentRangeLow ? Math.round(data.rentRangeLow) : Math.round(monthlyRent * 0.9),
      rentRangeHigh: data.rentRangeHigh ? Math.round(data.rentRangeHigh) : Math.round(monthlyRent * 1.1),
      pricePerSqft,
      comparableCount: data.comparables?.length || 0,
      bedrooms,
      bathrooms,
      sqft,
      propertyType,
      confidence: 85,
      available: true,
      source: "rentcast",
    };
  } catch {
    return fallbackEstimate;
  }
}

/**
 * Get rent estimates for multiple ADU scenarios (different sizes/configurations)
 */
export async function getRentEstimatesForScenarios(
  address: string,
  scenarios: Array<{
    name: string;
    sqft: number;
    bedrooms: number;
    bathrooms: number;
  }>
): Promise<Map<string, RentEstimate>> {
  const results = new Map<string, RentEstimate>();

  // Fetch all scenarios in parallel
  const promises = scenarios.map(async (scenario) => {
    const estimate = await getRentEstimate(
      address,
      scenario.bedrooms,
      scenario.bathrooms,
      scenario.sqft
    );
    return { name: scenario.name, estimate };
  });

  const settled = await Promise.allSettled(promises);

  for (const result of settled) {
    if (result.status === "fulfilled") {
      results.set(result.value.name, result.value.estimate);
    }
  }

  return results;
}

/**
 * Generate fallback rent estimate using San Diego market averages
 * when RentCast API is unavailable
 * Updated for 2025 Q4 based on Zillow, local MLS data
 */
function generateFallbackRentEstimate(
  bedrooms: number,
  bathrooms: number,
  sqft: number,
  propertyType: string
): RentEstimate {
  // San Diego ADU market rent averages (2025 Q4 - updated)
  // These are $/sqft/month rates based on actual San Diego rental market data
  const baseRentPerSqft: Record<number, number> = {
    0: 5.50, // studio (~$2,200/mo for 400 sqft)
    1: 4.75, // 1-bed (~$3,300/mo for 700 sqft)
    2: 4.25, // 2-bed (~$4,250/mo for 1000 sqft)
    3: 3.75, // 3-bed (~$4,500/mo for 1200 sqft)
    4: 3.50, // 4-bed (~$5,250/mo for 1500 sqft)
  };

  const rentPerSqft = baseRentPerSqft[bedrooms] || 4.25;
  const monthlyRent = Math.round(sqft * rentPerSqft);
  const annualRent = monthlyRent * 12;

  return {
    estimatedMonthlyRent: monthlyRent,
    estimatedAnnualRent: annualRent,
    rentRangeLow: Math.round(monthlyRent * 0.85),
    rentRangeHigh: Math.round(monthlyRent * 1.15),
    pricePerSqft: rentPerSqft,
    comparableCount: 0,
    bedrooms,
    bathrooms,
    sqft,
    propertyType,
    confidence: 55,
    available: false,
    source: "estimated",
  };
}

/**
 * Determine bedroom/bathroom count from ADU square footage
 */
export function inferUnitConfig(sqft: number): {
  bedrooms: number;
  bathrooms: number;
  unitType: string;
} {
  if (sqft <= 400) return { bedrooms: 0, bathrooms: 1, unitType: "Studio" };
  if (sqft <= 550) return { bedrooms: 1, bathrooms: 1, unitType: "1 Bed / 1 Bath" };
  if (sqft <= 800) return { bedrooms: 1, bathrooms: 1, unitType: "1 Bed / 1 Bath" };
  if (sqft <= 1000) return { bedrooms: 2, bathrooms: 1, unitType: "2 Bed / 1 Bath" };
  if (sqft <= 1200) return { bedrooms: 2, bathrooms: 2, unitType: "2 Bed / 2 Bath" };
  if (sqft <= 1400) return { bedrooms: 3, bathrooms: 2, unitType: "3 Bed / 2 Bath" };
  return { bedrooms: 4, bathrooms: 2, unitType: "4 Bed / 2 Bath" };
}

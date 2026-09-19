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

export interface MarketRentResult {
  monthlyRent: number;
  rentRangeLow: number;
  rentRangeHigh: number;
  comparableCount: number;
  comparables: MarketRentComparable[];
  /** What was priced, e.g. "1,200 sq ft 3-bed / 2.5-bath (Single Family comps)". */
  basis: string;
  source: "RentCast rent AVM";
}

/**
 * Real market rent for a unit of the given size/layout AT this address
 * (RentCast long-term rent AVM, priced from nearby rental listings).
 * Returns null on any failure — callers must label their fallback, never
 * present it as market data.
 */
export async function fetchMarketRent(q: {
  address: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  propertyType: "Single Family" | "Apartment";
}): Promise<MarketRentResult | null> {
  if (!RENTCAST_API_KEY || !q.address || !(q.sqft > 0)) return null;
  try {
    const params = new URLSearchParams({
      address: q.address,
      propertyType: q.propertyType,
      bedrooms: String(q.bedrooms),
      bathrooms: String(q.bathrooms),
      squareFootage: String(Math.round(q.sqft)),
      compCount: "10",
    });
    const response = await fetch(`${RENTCAST_BASE_URL}/avm/rent/long-term?${params}`, {
      headers: { Accept: "application/json", "X-Api-Key": RENTCAST_API_KEY },
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    if (!response.ok) {
      console.error(`[PROVIDER-ERROR] RentCast rent AVM: HTTP ${response.status}`);
      return null;
    }
    const data = (await response.json()) as {
      rent?: number;
      rentRangeLow?: number;
      rentRangeHigh?: number;
      comparables?: Array<{
        formattedAddress?: string;
        price?: number;
        rent?: number;
        squareFootage?: number;
        bedrooms?: number;
        bathrooms?: number;
        distance?: number;
      }>;
    };
    if (!data.rent || !Number.isFinite(data.rent) || !data.rentRangeLow || !data.rentRangeHigh) return null;
    const comps = (data.comparables ?? [])
      .map((c) => ({
        address: c.formattedAddress ?? "",
        monthlyRent: Math.round(Number(c.price ?? c.rent ?? 0)),
        squareFootage: Number.isFinite(c.squareFootage) ? Number(c.squareFootage) : null,
        bedrooms: Number.isFinite(c.bedrooms) ? Number(c.bedrooms) : null,
        bathrooms: Number.isFinite(c.bathrooms) ? Number(c.bathrooms) : null,
        distanceMiles: Number.isFinite(c.distance) ? Math.round(Number(c.distance) * 100) / 100 : null,
      }))
      .filter((c) => c.address && c.monthlyRent > 0);
    const layout = q.bedrooms === 0 ? "studio" : `${q.bedrooms}-bed / ${q.bathrooms}-bath`;
    return {
      monthlyRent: Math.round(data.rent),
      rentRangeLow: Math.round(data.rentRangeLow),
      rentRangeHigh: Math.round(data.rentRangeHigh),
      comparableCount: data.comparables?.length ?? 0,
      comparables: comps.slice(0, 5),
      basis: `${Math.round(q.sqft).toLocaleString()} sq ft ${layout} at this address, priced against nearby ${q.propertyType === "Apartment" ? "apartment" : "single-family"} rental listings`,
      source: "RentCast rent AVM",
    };
  } catch (err) {
    console.error(`[PROVIDER-ERROR] RentCast rent AVM: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
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

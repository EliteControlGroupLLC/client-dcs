// Valuation Service — Home value (AVM), comparable sales, and ADU value-add
// Powers the "Home Value & Equity" module on the Build Your ADU scanner.
// Uses RentCast's value AVM (price + nearby comparables) when a key is configured,
// and falls back to a clearly-labeled San Diego market estimate when it isn't.
// All outputs are labeled estimate-based and assumption-driven.

// This service runs server-side only (via /api/property-valuation), so prefer the
// server-only secret. Fall back to the NEXT_PUBLIC_ name for existing deployments
// that still set it there, so production keeps working during the migration.
const RENTCAST_API_KEY =
  process.env.RENTCAST_API_KEY || process.env.NEXT_PUBLIC_RENTCAST_API_KEY;
const RENTCAST_BASE_URL = "https://api.rentcast.io/v1";

// San Diego County market assumptions (2025) — used for fallback + value-add model.
const SD_DEFAULT_PRICE_PER_SQFT = 700; // fallback $/sqft for a detached SFR
const ADU_CAP_RATE = 0.055; // income-approach cap rate for accessory rental units
const ADU_SQFT_VALUE_FACTOR = 0.65; // ADU sqft typically appraises at ~65% of the main home's $/sqft
const ADU_COST_VALUE_FACTOR_LOW = 1.0; // ADU returns at least ~100% of build cost in value

export interface ComparableSale {
  address: string;
  price: number;
  sqft: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  distanceMi: number | null;
  pricePerSqft: number | null;
}

export interface PropertyValuation {
  estimatedValue: number | null;
  valueLow: number | null;
  valueHigh: number | null;
  pricePerSqft: number | null;
  comps: ComparableSale[];
  confidence: number; // 0-100
  available: boolean;
  source: "rentcast" | "estimated";
}

export interface AduValueAdd {
  low: number;
  expected: number;
  high: number;
  method: string;
}

export interface PropertyOwner {
  names: string[]; // owner name(s) of public record
  ownerType: string | null; // e.g. "Individual", "Trust", "Company"
  heldInTrust: boolean; // true when the title is vested in a trust/LLC/corp
  ownerOccupied: boolean | null; // owner lives at the property vs. investor-held
  available: boolean;
  source: "rentcast" | "estimated";
}

interface RentCastValueResponse {
  price?: number;
  priceRangeLow?: number;
  priceRangeHigh?: number;
  comparables?: Array<{
    formattedAddress?: string;
    price?: number;
    squareFootage?: number;
    bedrooms?: number;
    bathrooms?: number;
    distance?: number;
  }>;
}

interface RentCastPropertyRecord {
  owner?: {
    names?: string[];
    type?: string;
  };
  ownerOccupied?: boolean;
}

export function isValuationLiveDataAvailable(): boolean {
  return Boolean(RENTCAST_API_KEY);
}

function round(n: number): number {
  return Math.round(n);
}

/**
 * Estimate a property's current market value and pull nearby comparable sales.
 * Live data via RentCast /avm/value; graceful San Diego estimate otherwise.
 */
export async function getPropertyValuation(
  address: string,
  homeAreaSqFt?: number | null
): Promise<PropertyValuation> {
  const fallback = buildFallbackValuation(homeAreaSqFt);

  if (!RENTCAST_API_KEY) return fallback;

  try {
    const params = new URLSearchParams({
      address,
      propertyType: "Single Family",
      compCount: "6",
    });
    if (homeAreaSqFt && homeAreaSqFt > 0) {
      params.set("squareFootage", String(Math.round(homeAreaSqFt)));
    }

    const response = await fetch(`${RENTCAST_BASE_URL}/avm/value?${params.toString()}`, {
      headers: { Accept: "application/json", "X-Api-Key": RENTCAST_API_KEY },
    });

    if (!response.ok) return fallback;

    const data: RentCastValueResponse = await response.json();
    if (!data.price || data.price <= 0) return fallback;

    const estimatedValue = round(data.price);
    const valueLow = data.priceRangeLow ? round(data.priceRangeLow) : round(estimatedValue * 0.92);
    const valueHigh = data.priceRangeHigh ? round(data.priceRangeHigh) : round(estimatedValue * 1.08);
    const pricePerSqft =
      homeAreaSqFt && homeAreaSqFt > 0 ? round(estimatedValue / homeAreaSqFt) : null;

    const comps: ComparableSale[] = (data.comparables || [])
      .filter((c) => c.price && c.price > 0)
      .slice(0, 6)
      .map((c) => ({
        address: c.formattedAddress || "Nearby comparable",
        price: round(c.price as number),
        sqft: c.squareFootage ? round(c.squareFootage) : null,
        bedrooms: typeof c.bedrooms === "number" ? c.bedrooms : null,
        bathrooms: typeof c.bathrooms === "number" ? c.bathrooms : null,
        distanceMi: typeof c.distance === "number" ? Math.round(c.distance * 100) / 100 : null,
        pricePerSqft:
          c.price && c.squareFootage && c.squareFootage > 0
            ? round(c.price / c.squareFootage)
            : null,
      }));

    return {
      estimatedValue,
      valueLow,
      valueHigh,
      pricePerSqft,
      comps,
      confidence: 82,
      available: true,
      source: "rentcast",
    };
  } catch {
    return fallback;
  }
}

const OWNER_TRUST_PATTERN = /\b(trust|living trust|family trust|revocable|llc|l\.l\.c|inc|incorporated|corp|company|properties|partners|holdings|estate)\b/i;

function inferHeldInTrust(names: string[], ownerType: string | null): boolean {
  if (ownerType && OWNER_TRUST_PATTERN.test(ownerType)) return true;
  return names.some((n) => OWNER_TRUST_PATTERN.test(n));
}

/**
 * Look up the property owner of public record (name(s), owner type, and whether
 * title is held in a trust/entity) via RentCast's /properties records endpoint.
 * Returns a clearly-labeled "unavailable" record when no key is configured or the
 * lookup fails — callers should treat `available: false` as "not on record."
 */
export async function getPropertyOwner(address: string): Promise<PropertyOwner> {
  const fallback: PropertyOwner = {
    names: [],
    ownerType: null,
    heldInTrust: false,
    ownerOccupied: null,
    available: false,
    source: "estimated",
  };

  if (!RENTCAST_API_KEY) return fallback;

  try {
    const params = new URLSearchParams({ address });
    const response = await fetch(`${RENTCAST_BASE_URL}/properties?${params.toString()}`, {
      headers: { Accept: "application/json", "X-Api-Key": RENTCAST_API_KEY },
    });

    if (!response.ok) return fallback;

    const json = await response.json();
    // /properties returns an array of matching records (or, rarely, a single object).
    const record: RentCastPropertyRecord | undefined = Array.isArray(json) ? json[0] : json;

    const names = (record?.owner?.names || [])
      .map((n) => (typeof n === "string" ? n.trim() : ""))
      .filter((n) => n.length > 0);

    if (names.length === 0) return fallback;

    const ownerType = record?.owner?.type?.trim() || null;

    return {
      names,
      ownerType,
      heldInTrust: inferHeldInTrust(names, ownerType),
      ownerOccupied: typeof record?.ownerOccupied === "boolean" ? record.ownerOccupied : null,
      available: true,
      source: "rentcast",
    };
  } catch {
    return fallback;
  }
}

function buildFallbackValuation(homeAreaSqFt?: number | null): PropertyValuation {
  if (!homeAreaSqFt || homeAreaSqFt <= 0) {
    return {
      estimatedValue: null,
      valueLow: null,
      valueHigh: null,
      pricePerSqft: null,
      comps: [],
      confidence: 0,
      available: false,
      source: "estimated",
    };
  }
  const estimatedValue = round(homeAreaSqFt * SD_DEFAULT_PRICE_PER_SQFT);
  return {
    estimatedValue,
    valueLow: round(estimatedValue * 0.88),
    valueHigh: round(estimatedValue * 1.12),
    pricePerSqft: SD_DEFAULT_PRICE_PER_SQFT,
    comps: [],
    confidence: 45,
    available: true,
    source: "estimated",
  };
}

/**
 * Estimate how much value the recommended ADU adds to the property.
 * Blends a comps/$-per-sqft approach with a rental-income (cap-rate) approach,
 * bounded by a cost-recovery range. Mirrors how appraisers value income ADUs.
 */
export function computeAduValueAdd(args: {
  recommendedAduSqFt: number;
  homePricePerSqft: number | null;
  aduAnnualNetIncome?: number | null;
  aduTotalCost?: number | null;
}): AduValueAdd {
  const { recommendedAduSqFt, homePricePerSqft, aduAnnualNetIncome, aduTotalCost } = args;
  const candidates: number[] = [];

  // Comps / $-per-sqft approach
  const ppsf = homePricePerSqft && homePricePerSqft > 0 ? homePricePerSqft : SD_DEFAULT_PRICE_PER_SQFT;
  if (recommendedAduSqFt > 0) {
    candidates.push(recommendedAduSqFt * ppsf * ADU_SQFT_VALUE_FACTOR);
  }

  // Income (cap-rate) approach
  if (aduAnnualNetIncome && aduAnnualNetIncome > 0) {
    candidates.push(aduAnnualNetIncome / ADU_CAP_RATE);
  }

  // Cost approach — anchored at ~1.3x build cost (matches the site's value-add model)
  const hasCost = Boolean(aduTotalCost && aduTotalCost > 0);
  if (hasCost) {
    candidates.push((aduTotalCost as number) * 1.3);
  }

  if (candidates.length === 0) {
    return { low: 0, expected: 0, high: 0, method: "Insufficient data to estimate value added." };
  }

  // Use the median of the approaches so a single optimistic method can't dominate.
  const sorted = [...candidates].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  let expected =
    sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];

  // Anchor to a defensible cost-recovery band (1.0x–1.6x build cost).
  if (hasCost) {
    const cost = aduTotalCost as number;
    expected = Math.min(Math.max(expected, cost * ADU_COST_VALUE_FACTOR_LOW), cost * 1.6);
  }

  let low = expected * 0.82;
  let high = expected * 1.2;
  if (hasCost) {
    low = Math.max(low, (aduTotalCost as number) * 0.9);
  }

  return {
    low: round(low),
    expected: round(expected),
    high: round(high),
    method:
      "Based on comparable home values nearby and the rental income the ADU can produce.",
  };
}

/**
 * Parse a recommended ADU square footage from a size-range label
 * such as "1,000 - 1,200 sq ft". Returns the upper bound (best case),
 * falling back to the midpoint or a single value.
 */
export function parseRecommendedSqFt(sizeRange: string | undefined | null): number | null {
  if (!sizeRange) return null;
  const nums = (sizeRange.match(/\d[\d,]*/g) || []).map((n) => parseInt(n.replace(/,/g, ""), 10));
  const valid = nums.filter((n) => Number.isFinite(n) && n >= 100 && n <= 5000);
  if (valid.length === 0) return null;
  return Math.max(...valid);
}

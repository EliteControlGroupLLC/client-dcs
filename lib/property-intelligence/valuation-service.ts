// Valuation Service — Home value (AVM), comparable sales, and ADU value-add
// Powers the "Home Value & Equity" module on the Build Your ADU scanner.
// Uses RentCast's value AVM (price + nearby comparables) for THIS address. When
// RentCast can't value it, the home value is "Not available" — never a
// county-average $/sqft × size stand-in. Value-add figures state their basis.

// This service runs server-side only (via /api/property-valuation), so prefer the
// server-only secret. Fall back to the NEXT_PUBLIC_ name for existing deployments
// that still set it there, so production keeps working during the migration.
const RENTCAST_API_KEY =
  process.env.RENTCAST_API_KEY || process.env.NEXT_PUBLIC_RENTCAST_API_KEY;
const RENTCAST_BASE_URL = "https://api.rentcast.io/v1";

// Value-add model assumptions (stated in the returned `method` text).
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
  /** Why the value is unavailable (shown instead of a number). */
  unavailableReason?: string;
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
  /** Address of the record the owner came from (must match the searched address). */
  recordAddress?: string | null;
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
  formattedAddress?: string;
  addressLine1?: string;
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
  const unavailable = (reason: string): PropertyValuation => ({
    estimatedValue: null,
    valueLow: null,
    valueHigh: null,
    pricePerSqft: null,
    comps: [],
    confidence: 0,
    available: false,
    source: "estimated",
    unavailableReason: reason,
  });

  if (!RENTCAST_API_KEY) return unavailable("Automated valuation service is not configured.");

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
      signal: AbortSignal.timeout(10000),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`[PROVIDER-ERROR] RentCast value AVM: HTTP ${response.status}`);
      return unavailable("The automated valuation service couldn't value this address right now.");
    }

    const data: RentCastValueResponse = await response.json();
    if (!data.price || data.price <= 0) return unavailable("No automated valuation is available for this address.");

    const estimatedValue = round(data.price);
    // Only the provider's own range — never an invented ± band.
    const valueLow = data.priceRangeLow ? round(data.priceRangeLow) : null;
    const valueHigh = data.priceRangeHigh ? round(data.priceRangeHigh) : null;
    const pricePerSqft =
      homeAreaSqFt && homeAreaSqFt > 0 ? round(estimatedValue / homeAreaSqFt) : null;

    const comps: ComparableSale[] = (data.comparables || [])
      .filter((c) => c.price && c.price > 0 && c.formattedAddress)
      .slice(0, 6)
      .map((c) => ({
        address: c.formattedAddress as string,
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
  } catch (err) {
    console.error(`[PROVIDER-ERROR] RentCast value AVM: ${err instanceof Error ? err.message : String(err)}`);
    return unavailable("The automated valuation service couldn't be reached.");
  }
}

/** "4920 63RD ST, SAN DIEGO, CA" → "4920 63rd st" (house number + street, normalized). */
function streetKey(address: string | null | undefined): string {
  const first = (address ?? "").split(",")[0].toLowerCase();
  return first
    .replace(/\b(street)\b/g, "st")
    .replace(/\b(avenue)\b/g, "ave")
    .replace(/\b(drive)\b/g, "dr")
    .replace(/\b(road)\b/g, "rd")
    .replace(/\b(boulevard)\b/g, "blvd")
    .replace(/\b(place)\b/g, "pl")
    .replace(/\b(court)\b/g, "ct")
    .replace(/\b(lane)\b/g, "ln")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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
      signal: AbortSignal.timeout(10000),
      cache: "no-store",
    });

    if (!response.ok) return fallback;

    const json = await response.json();
    // /properties returns an array of matching records (or, rarely, a single object).
    // Only accept the record for THIS house number + street — never a neighbor's.
    const records: RentCastPropertyRecord[] = Array.isArray(json) ? json : json ? [json] : [];
    const want = streetKey(address);
    const record = records.find((r) => streetKey(r.formattedAddress ?? r.addressLine1) === want);
    if (!record) return fallback;

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
      recordAddress: record.formattedAddress ?? null,
      available: true,
      source: "rentcast",
    };
  } catch {
    return fallback;
  }
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
  const used: string[] = [];

  // Comps / $-per-sqft approach — only with a REAL $/sqft for this home.
  if (recommendedAduSqFt > 0 && homePricePerSqft && homePricePerSqft > 0) {
    candidates.push(recommendedAduSqFt * homePricePerSqft * ADU_SQFT_VALUE_FACTOR);
    used.push(
      `${recommendedAduSqFt.toLocaleString()} sq ft × this home's AVM value of $${Math.round(homePricePerSqft).toLocaleString()}/sq ft × ${ADU_SQFT_VALUE_FACTOR} (ADU space valued below main-home space)`
    );
  }

  // Income (cap-rate) approach
  if (aduAnnualNetIncome && aduAnnualNetIncome > 0) {
    candidates.push(aduAnnualNetIncome / ADU_CAP_RATE);
    used.push(`ADU net operating income of $${Math.round(aduAnnualNetIncome).toLocaleString()}/yr ÷ ${(ADU_CAP_RATE * 100).toFixed(1)}% cap rate`);
  }

  // Cost approach — ~1.3× project cost
  const hasCost = Boolean(aduTotalCost && aduTotalCost > 0);
  if (hasCost) {
    candidates.push((aduTotalCost as number) * 1.3);
    used.push(`1.3× the $${Math.round(aduTotalCost as number).toLocaleString()} project cost`);
  }

  if (candidates.length === 0) {
    return { low: 0, expected: 0, high: 0, method: "Insufficient data to estimate value added." };
  }

  // Use the median of the approaches so a single optimistic method can't dominate.
  const sorted = [...candidates].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  let expected =
    sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];

  // Anchor to a cost-recovery band (1.0x–1.6x project cost).
  if (hasCost) {
    const cost = aduTotalCost as number;
    expected = Math.min(Math.max(expected, cost * ADU_COST_VALUE_FACTOR_LOW), cost * 1.6);
  }

  let low = expected * 0.82;
  const high = expected * 1.2;
  if (hasCost) {
    low = Math.max(low, (aduTotalCost as number) * 0.9);
  }

  return {
    low: round(low),
    expected: round(expected),
    high: round(high),
    method: `Planning estimate, not an appraisal: median of ${used.join("; ")}${hasCost ? ", kept within 1.0–1.6× project cost" : ""}. Range −18% / +20%.`,
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

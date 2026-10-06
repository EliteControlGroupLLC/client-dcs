/**
 * Unified Recommendation Engine
 * 
 * CORE PRINCIPLE: The scanner CANNOT recommend one ADU product in the summary,
 * then calculate rents, recommended paths, and financial preview using a different product.
 * Every output on the page MUST be based on the same main recommendation.
 * 
 * This engine provides a single source of truth for:
 * 1. Primary recommended ADU type and size
 * 2. Rent estimates derived from that recommendation
 * 3. Financial scenarios derived from that recommendation
 * 4. All downstream UI components
 */

import type { FeasibilityResult, FinancialScenario } from "./jurisdictions/types";
import type { MarketRentComparable, MarketRentOutcome } from "./rentcast-service";
import { resolveRent, type ResolvedRentBasis } from "./rent-resolution";
import {
  FLOOR_PLANS_SORTED,
  estimateAduPriceRange,
  formatPriceRange,
  getRecommendedFloorPlan,
  getRentEstimate as getCanonicalRentEstimate,
  normalizeAduType,
  type FloorPlan,
  type FloorPlanVariation,
} from "../data/site-data";

type CanonicalAduType = ReturnType<typeof normalizeAduType>;

export interface UnifiedRecommendation {
  // Primary recommendation (drives all downstream outputs)
  primaryType: string;
  primarySizeSqFt: number;
  primaryBedrooms: number;
  primaryBathrooms: number;
  primaryUnitLabel: string;
  
  // Secondary recommendation (optional, clearly labeled as secondary)
  secondaryType?: string;
  secondarySizeSqFt?: number;
  secondaryBedrooms?: number;
  secondaryBathrooms?: number;
  secondaryUnitLabel?: string;
  
  // Pricing (derived from primary)
  estimatedBuildCost: number;
  estimatedSoftCost: number;
  estimatedTotalCost: number;
  priceRange: string;
  
  // Rent estimates (derived from primary, using correct zip code)
  primaryRentEstimate: {
    monthlyRent: number;
    annualRent: number;
    rentRangeLow: number;
    rentRangeHigh: number;
    pricePerSqft: number;
  };
  
  // Combined rent if secondary exists
  combinedMonthlyRent?: number;
  
  // Financial preview (derived from primary)
  financialPreview: {
    monthlyPayment: number;
    monthlyIncome: number;
    monthlyCashFlow: number;
    roi: number;
    paybackYears: number;
    valueAdd: number;
  };
  
  // Smart banner text
  bannerRecommendation: string;
  bannerDetails: string;
  
  // Audit trail
  derivedFromFeasibility: string;
  zipCode: string | null;
  /**
   * Where the ONE resolved rent figure came from:
   * "verified-comps"  — nearby same-configuration rentals + new-construction allowance
   * "truthcore-floor" — comps came in under TruthCore's own rents, so ours was used
   * "truthcore-table" — not enough verified comps nearby
   */
  rentSource: ResolvedRentBasis;
  /** True only when the number is backed by verified nearby rentals. */
  rentIsMarketVerified: boolean;
  /** Plain-English, client-facing basis of the rent figure shown. */
  rentBasis: string;
  /** Short label for pills / table headers. */
  rentSourceLabel: string;
  /** Nearby rental comps behind the figure (empty when none qualified). */
  rentComparables: MarketRentComparable[];
  rentComparableCount: number;
  /** Radius the comps came from, in miles (null when there are none). */
  rentComparableRadiusMiles: number | null;
  /**
   * The floor-plan the recommendation is anchored to. The report's floor-plan
   * section prints the resolved rent on THIS row so the two never disagree.
   */
  primaryPlanId: string;
  /** Planning assumptions behind the cost / financing / cash-flow figures. */
  financialAssumptions: string[];
}

export interface UnifiedRecommendationInput {
  address: string;
  zipCode: string | null;
  lotSizeSqFt: number;
  openYardSqFt: number;
  buildableEnvelopeSqFt: number;
  hasGarage: boolean;
  feasibilityResults: FeasibilityResult[];
  bestRecommendationType: string;
  maxAllowedSqFt: number; // From jurisdiction rules (typically 1200 for detached)
  jaduMaxSqFt: number;    // From jurisdiction rules (typically 500)
  /**
   * Hard cap on the modeled unit size from the REAL site fit (e.g. the
   * largest detached footprint that fits after setbacks, or stalls × 200 sq
   * ft for a garage). Never exceeded, even if it's below the smallest plan.
   */
  hardSizeCapSqFt?: number;
  /** Plain-English reason prepended to the banner details (why this type). */
  contextNote?: string;
  /** Extra site cost (USD) added to the price range, e.g. a steep-lot engineered foundation. */
  siteCostAdderUsd?: number;
  /**
   * Verified rental comparables for the modeled unit's CONFIGURATION near this
   * address. Matched on bedrooms / bathrooms, not square footage. The outcome
   * is explicit about whether enough comps were found; see resolveRent for how
   * it is reconciled against TruthCore's own rent table.
   */
  marketRentLookup?: (q: {
    bedrooms: number;
    bathrooms: number;
    propertyType: "Single Family" | "Apartment";
  }) => Promise<MarketRentOutcome>;
}

// Financing / operating assumptions for the planning cash-flow model.
const LOAN_TO_COST = 0.8;
const INTEREST_RATE = 0.0725;
const TERM_YEARS = 30;
const VACANCY = 0.05;
const RESERVES_PCT_OF_RENT = 0.1;
const RESERVES_FIXED_MONTHLY = 250;
const SOFT_COST_SHARE = 0.15;
const VALUE_ADD_MULTIPLE = 1.35;

/**
 * Generate a unified recommendation that drives ALL downstream outputs
 */
export async function generateUnifiedRecommendation(
  input: UnifiedRecommendationInput
): Promise<UnifiedRecommendation> {
  const {
    zipCode,
    buildableEnvelopeSqFt,
    bestRecommendationType,
    maxAllowedSqFt,
  } = input;

  // JADU (inside the existing home) is priced/rented like a small attached unit.
  const isJadu = bestRecommendationType === "JADU";
  const normalizedType = isJadu
    ? "attached"
    : normalizeAduType(bestRecommendationType, bestRecommendationType === "Second-Story ADU" ? 2 : 1);
  const hardCap = input.hardSizeCapSqFt && input.hardSizeCapSqFt > 0 ? input.hardSizeCapSqFt : Infinity;
  const allowedSqFt = Math.min(hardCap, Math.max(400, Math.min(buildableEnvelopeSqFt, maxAllowedSqFt)));
  const plan = pickPrimaryPlan(normalizedType, allowedSqFt);
  const variation = pickPrimaryVariation(plan, normalizedType);
  const primaryType = isJadu ? "JADU" : labelForType(normalizedType);
  const primarySizeSqFt = Math.round(Math.min(plan.sqFt, allowedSqFt, isJadu ? input.jaduMaxSqFt : Infinity));

  const basePricing = estimateAduPriceRange({
    sqFt: primarySizeSqFt,
    // JADU is priced like the small attached unit its rent comes from (same
    // basis as the recommendation card), not as a detached build.
    type: isJadu ? "Attached ADU" : primaryType,
    bedrooms: variation.bedrooms,
    bathrooms: variation.bathrooms,
    stories: variation.stories,
    garageStalls: plan.id === "garage-conversion" && variation.bedrooms > 0 ? 3 : 2,
  });
  const siteAdder = input.siteCostAdderUsd && input.siteCostAdderUsd > 0 ? input.siteCostAdderUsd : 0;
  const pricing = { low: basePricing.low + siteAdder, high: basePricing.high + siteAdder };
  const totalCost = roundToNearest((pricing.low + pricing.high) / 2, 1000);
  const softCost = Math.round(totalCost * SOFT_COST_SHARE);
  const buildCost = totalCost - softCost;

  // Rent: ONE resolved figure. Verified same-configuration rentals within about
  // a mile lead, a new-construction allowance is added on top, and TruthCore's
  // own configuration-matched rent table is the floor. See ./rent-resolution.
  const unitIsHouseLike = (normalizedType === "detached" || normalizedType === "two-story") && variation.bedrooms >= 2;
  const market: MarketRentOutcome = input.marketRentLookup
    ? await input
        .marketRentLookup({
          bedrooms: variation.bedrooms,
          bathrooms: variation.bathrooms,
          propertyType: unitIsHouseLike ? "Single Family" : "Apartment",
        })
        .catch((err: unknown) => ({
          status: "unavailable" as const,
          reason: err instanceof Error ? err.message : String(err),
        }))
    : { status: "unavailable", reason: "Market rent lookup not configured" };

  // TruthCore's own rents for this CONFIGURATION (bedrooms / type), not for
  // this square footage. This is the same row the floor-plan section prints.
  const tableRange = getCanonicalRentEstimate(primarySizeSqFt, plan.type, variation.bedrooms, {
    stories: variation.stories,
    garageStalls: plan.id === "garage-conversion" && variation.bedrooms > 0 ? 3 : 2,
  });
  const resolvedRent = resolveRent({
    market,
    truthcoreRange: tableRange,
    bedrooms: variation.bedrooms,
    bathrooms: variation.bathrooms,
  });
  const rentRange = { low: resolvedRent.rentRangeLow, high: resolvedRent.rentRangeHigh };
  const monthlyRent = resolvedRent.monthlyRent;
  const rentBasis = resolvedRent.explanation;

  const loanAmount = Math.round(totalCost * LOAN_TO_COST);
  const monthlyPayment = calculateMonthlyPayment(loanAmount, INTEREST_RATE, TERM_YEARS);
  const monthlyReserves = Math.round(monthlyRent * RESERVES_PCT_OF_RENT + RESERVES_FIXED_MONTHLY);
  const monthlyCashFlow = Math.round(monthlyRent * (1 - VACANCY)) - monthlyPayment - monthlyReserves;
  const annualNetCashFlow = monthlyCashFlow * 12;
  const roi = totalCost > 0 ? Math.round((annualNetCashFlow / totalCost) * 1000) / 10 : 0;
  const paybackYears = annualNetCashFlow > 0 ? Math.round((totalCost / annualNetCashFlow) * 10) / 10 : 99;
  const valueAdd = roundToNearest(totalCost * VALUE_ADD_MULTIPLE, 1000);
  const financialAssumptions = [
    `Project cost = TruthCore turnkey price for this plan (${formatPriceRange(pricing.low, pricing.high)}, midpoint used)${siteAdder ? `, incl. $${siteAdder.toLocaleString()} measured-slope foundation allowance` : ""}; ${Math.round(SOFT_COST_SHARE * 100)}% of it shown as soft costs (design, permits, fees)`,
    `Financing: ${Math.round(LOAN_TO_COST * 100)}% of project cost at ${(INTEREST_RATE * 100).toFixed(2)}% for ${TERM_YEARS} years, ${Math.round((1 - LOAN_TO_COST) * 100)}% down`,
    `Rent: ${resolvedRent.explanation} Cash flow nets ${Math.round(VACANCY * 100)}% vacancy and reserves of ${Math.round(RESERVES_PCT_OF_RENT * 100)}% of rent + $${RESERVES_FIXED_MONTHLY}/mo`,
    "ROI = annual net cash flow ÷ total project cost",
    `Value add = ${VALUE_ADD_MULTIPLE}× project cost (cost-based rule of thumb, not an appraisal)`,
  ];

  const { bannerRecommendation, bannerDetails } = generateSmartBannerText(
    primaryType,
    isJadu ? "Junior ADU (JADU)" : plan.name,
    primarySizeSqFt,
    variation,
    pricing.low,
    pricing.high,
    rentRange.low,
    rentRange.high,
    resolvedRent.label,
    buildableEnvelopeSqFt > maxAllowedSqFt
  );
  const bannerDetailsFinal = input.contextNote ? `${input.contextNote} ${bannerDetails}` : bannerDetails;

  return {
    primaryType,
    primarySizeSqFt,
    primaryBedrooms: variation.bedrooms,
    primaryBathrooms: variation.bathrooms,
    primaryUnitLabel: variation.label,
    estimatedBuildCost: buildCost,
    estimatedSoftCost: softCost,
    estimatedTotalCost: totalCost,
    priceRange:
      basePricing.matchedPlan &&
      basePricing.low === basePricing.matchedPlan.priceLow &&
      basePricing.high === basePricing.matchedPlan.priceHigh &&
      Math.abs(basePricing.matchedPlan.sqFt - primarySizeSqFt) >= 100
        ? `${formatPriceRange(pricing.low, pricing.high)} (priced from TruthCore's ${basePricing.matchedPlan.sqFt.toLocaleString()} sq ft ${basePricing.matchedPlan.name} plan)`
        : formatPriceRange(pricing.low, pricing.high),
    primaryRentEstimate: {
      monthlyRent,
      annualRent: monthlyRent * 12,
      rentRangeLow: rentRange.low,
      rentRangeHigh: rentRange.high,
      pricePerSqft: Number((monthlyRent / primarySizeSqFt).toFixed(2)),
    },
    financialPreview: {
      monthlyPayment,
      monthlyIncome: monthlyRent,
      monthlyCashFlow,
      roi,
      paybackYears,
      valueAdd,
    },
    
    bannerRecommendation,
    bannerDetails: bannerDetailsFinal,
    derivedFromFeasibility: bestRecommendationType,
    zipCode,
    rentSource: resolvedRent.basis,
    rentIsMarketVerified: resolvedRent.basis === "verified-comps",
    rentBasis,
    rentSourceLabel: resolvedRent.label,
    rentComparables: resolvedRent.comparables,
    rentComparableCount: resolvedRent.comparableCount,
    rentComparableRadiusMiles: resolvedRent.radiusMiles,
    primaryPlanId: plan.id,
    financialAssumptions,
  };
}

function calculateMonthlyPayment(loanAmount: number, annualRate: number, termYears: number): number {
  const monthlyRate = annualRate / 12;
  const numPayments = termYears * 12;
  if (monthlyRate === 0) return Math.round(loanAmount / numPayments);
  return Math.round(
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1)
  );
}

function generateSmartBannerText(
  primaryType: string,
  planName: string,
  primarySizeSqFt: number,
  primaryVariation: FloorPlanVariation,
  priceLow: number,
  priceHigh: number,
  rentLow: number,
  rentHigh: number,
  rentSourceLabel: string,
  sizeIsCappedByRules: boolean
): { bannerRecommendation: string; bannerDetails: string } {
  const sizeLabel = primarySizeSqFt.toLocaleString();
  const layoutLabel =
    primaryVariation.bedrooms === 0
      ? "studio / 1-bath"
      : `${primaryVariation.bedrooms}-bed / ${primaryVariation.bathrooms}-bath`;

  return {
    bannerRecommendation: `Best fit for this property: ${planName} at ${sizeLabel} sq ft`,
    bannerDetails: `${primaryType} recommendation aligned to the current parcel allowance${sizeIsCappedByRules ? " and city size cap" : ""}. Recommended configuration: ${layoutLabel}. Estimated project investment (TruthCore plan pricing): ${formatPriceRange(priceLow, priceHigh)}. Estimated rent: $${rentLow.toLocaleString()}\u00A0– $${rentHigh.toLocaleString()}/month (${rentSourceLabel}).`,
  };
}

function labelForType(type: CanonicalAduType): string {
  if (type === "garage-conversion") return "Garage Conversion";
  if (type === "attached") return "Attached ADU";
  if (type === "two-story") return "Second-Story ADU";
  return "Detached ADU";
}

function getPlansForType(type: CanonicalAduType): FloorPlan[] {
  return FLOOR_PLANS_SORTED.filter((plan) => normalizeAduType(plan.type, plan.stories) === type);
}

function pickPrimaryPlan(type: CanonicalAduType, allowedSqFt: number): FloorPlan {
  const candidates = getPlansForType(type);
  const withinCap = [...candidates].filter((plan) => plan.sqFt <= allowedSqFt).sort((a, b) => b.sqFt - a.sqFt);
  if (withinCap.length > 0) return withinCap[0];

  return (
    getRecommendedFloorPlan({
      sqFt: allowedSqFt,
      type: labelForType(type),
      stories: type === "two-story" ? 2 : 1,
      garageStalls: 2,
    }) ||
    candidates[0] ||
    FLOOR_PLANS_SORTED[0]
  );
}

function pickPrimaryVariation(plan: FloorPlan, type: CanonicalAduType): FloorPlanVariation {
  if (type === "garage-conversion") {
    return plan.supportedVariations[0];
  }

  return [...plan.supportedVariations].sort((a, b) => {
    if (b.bedrooms !== a.bedrooms) return b.bedrooms - a.bedrooms;
    if (b.bathrooms !== a.bathrooms) return b.bathrooms - a.bathrooms;
    if (b.stories !== a.stories) return b.stories - a.stories;
    return b.priceHigh - a.priceHigh;
  })[0];
}

function roundToNearest(value: number, increment = 1000): number {
  return Math.round(value / increment) * increment;
}

/**
 * Build rent scenarios that ONLY reflect the primary recommendation
 * (plus secondary if applicable)
 */
export function buildUnifiedRentScenarios(
  recommendation: UnifiedRecommendation
): Array<{
  aduType: string;
  isPrimary: boolean;
  sizeSqFt: number;
  unitLabel: string;
  conservative: { monthlyRent: number; annualRent: number };
  market: { monthlyRent: number; annualRent: number };
  premium: { monthlyRent: number; annualRent: number };
}> {
  const scenarios: Array<{
    aduType: string;
    isPrimary: boolean;
    sizeSqFt: number;
    unitLabel: string;
    conservative: { monthlyRent: number; annualRent: number };
    market: { monthlyRent: number; annualRent: number };
    premium: { monthlyRent: number; annualRent: number };
  }> = [];
  
  // Primary scenario (always first)
  const primaryMarket = recommendation.primaryRentEstimate.monthlyRent;
  const primaryConservative = recommendation.primaryRentEstimate.rentRangeLow;
  const primaryPremium = recommendation.primaryRentEstimate.rentRangeHigh;
  
  scenarios.push({
    aduType: `${recommendation.primarySizeSqFt.toLocaleString()} sq ft ${recommendation.primaryType}`,
    isPrimary: true,
    sizeSqFt: recommendation.primarySizeSqFt,
    unitLabel: recommendation.primaryUnitLabel,
    conservative: { monthlyRent: primaryConservative, annualRent: primaryConservative * 12 },
    market: { monthlyRent: primaryMarket, annualRent: primaryMarket * 12 },
    premium: { monthlyRent: primaryPremium, annualRent: primaryPremium * 12 },
  });
  
  // Secondary scenario (only if exists, clearly labeled)
  if (recommendation.secondaryType && recommendation.secondarySizeSqFt && recommendation.combinedMonthlyRent) {
    const secondaryMarket = recommendation.combinedMonthlyRent - primaryMarket;
    const secondaryConservative = Math.round(secondaryMarket * 0.85);
    const secondaryPremium = Math.round(secondaryMarket * 1.15);
    
    scenarios.push({
      aduType: `${recommendation.secondarySizeSqFt.toLocaleString()} sq ft ${recommendation.secondaryType} (Additional)`,
      isPrimary: false,
      sizeSqFt: recommendation.secondarySizeSqFt,
      unitLabel: recommendation.secondaryUnitLabel || "Studio",
      conservative: { monthlyRent: secondaryConservative, annualRent: secondaryConservative * 12 },
      market: { monthlyRent: secondaryMarket, annualRent: secondaryMarket * 12 },
      premium: { monthlyRent: secondaryPremium, annualRent: secondaryPremium * 12 },
    });
  }
  
  return scenarios;
}

/**
 * Build financial scenarios that ONLY reflect the primary recommendation
 */
export function buildUnifiedFinancialScenarios(
  recommendation: UnifiedRecommendation
): FinancialScenario[] {
  const fp = recommendation.financialPreview;
  return [{
    scenarioName: `${recommendation.primarySizeSqFt.toLocaleString()} sq ft ${recommendation.primaryType}`,
    scenarioType: recommendation.primaryType.toLowerCase().replace(/\s+/g, "-"),
    projectedUnits: 1,
    estimatedBuildCost: recommendation.estimatedBuildCost,
    estimatedSoftCost: recommendation.estimatedSoftCost,
    estimatedTotalCost: recommendation.estimatedTotalCost,
    estimatedLoanAmount: Math.round(recommendation.estimatedTotalCost * LOAN_TO_COST),
    estimatedDownPayment: recommendation.estimatedTotalCost - Math.round(recommendation.estimatedTotalCost * LOAN_TO_COST),
    estimatedMonthlyPayment: fp.monthlyPayment,
    estimatedMonthlyIncome: fp.monthlyIncome,
    estimatedMonthlyCashflow: fp.monthlyCashFlow,
    estimatedAnnualGrossIncome: fp.monthlyIncome * 12,
    estimatedAnnualNetCashflow: fp.monthlyCashFlow * 12,
    estimatedRoi: fp.roi,
    estimatedPaybackYears: fp.paybackYears,
    estimatedValueAdd: fp.valueAdd,
    rentSource: recommendation.rentIsMarketVerified ? "rentcast" : "estimated",
    rentBasis: recommendation.rentBasis,
    assumptions: recommendation.financialAssumptions,
  }];
}

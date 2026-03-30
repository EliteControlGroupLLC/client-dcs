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
import {
  FLOOR_PLANS_SORTED,
  estimateAduPriceRange,
  formatPriceRange,
  getAverageMonthlyRent,
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
  zipCode: string;
  rentSource: "market-data" | "estimated";
}

export interface UnifiedRecommendationInput {
  address: string;
  zipCode: string;
  lotSizeSqFt: number;
  openYardSqFt: number;
  buildableEnvelopeSqFt: number;
  hasGarage: boolean;
  feasibilityResults: FeasibilityResult[];
  bestRecommendationType: string;
  maxAllowedSqFt: number; // From jurisdiction rules (typically 1200 for detached)
  jaduMaxSqFt: number;    // From jurisdiction rules (typically 500)
}

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

  const normalizedType = normalizeAduType(bestRecommendationType, bestRecommendationType === "Second-Story ADU" ? 2 : 1);
  const allowedSqFt = Math.max(400, Math.min(buildableEnvelopeSqFt, maxAllowedSqFt));
  const plan = pickPrimaryPlan(normalizedType, allowedSqFt);
  const variation = pickPrimaryVariation(plan, normalizedType);
  const primaryType = labelForType(normalizedType);
  const primarySizeSqFt = Math.min(plan.sqFt, allowedSqFt);

  const pricing = estimateAduPriceRange({
    sqFt: primarySizeSqFt,
    type: primaryType,
    bedrooms: variation.bedrooms,
    bathrooms: variation.bathrooms,
    stories: variation.stories,
    garageStalls: plan.id === "garage-conversion" && variation.bedrooms > 0 ? 3 : 2,
  });
  const totalCost = roundToNearest((pricing.low + pricing.high) / 2, 1000);
  const softCost = Math.round(totalCost * 0.15);
  const buildCost = totalCost - softCost;

  const rentRange = getCanonicalRentEstimate(primarySizeSqFt, plan.type, variation.bedrooms, {
    stories: variation.stories,
    garageStalls: plan.id === "garage-conversion" && variation.bedrooms > 0 ? 3 : 2,
  });
  const monthlyRent = getAverageMonthlyRent(primarySizeSqFt, plan.type, variation.bedrooms, {
    stories: variation.stories,
    garageStalls: plan.id === "garage-conversion" && variation.bedrooms > 0 ? 3 : 2,
  });

  const loanAmount = totalCost; // zero-down planning assumption, aligned with the site calculators
  const monthlyPayment = calculateMonthlyPayment(loanAmount, 0.0725, 30);
  const monthlyReserves = Math.round(monthlyRent * 0.10 + 250);
  const monthlyCashFlow = Math.round(monthlyRent * 0.95) - monthlyPayment - monthlyReserves;
  const annualNetCashFlow = monthlyCashFlow * 12;
  const roi = totalCost > 0 ? Math.round((annualNetCashFlow / totalCost) * 1000) / 10 : 0;
  const paybackYears = annualNetCashFlow > 0 ? Math.round((totalCost / annualNetCashFlow) * 10) / 10 : 99;
  const valueAdd = roundToNearest(totalCost * 1.35, 1000);

  const { bannerRecommendation, bannerDetails } = generateSmartBannerText(
    primaryType,
    plan.name,
    primarySizeSqFt,
    variation,
    pricing.low,
    pricing.high,
    rentRange.low,
    rentRange.high,
    zipCode,
    buildableEnvelopeSqFt > maxAllowedSqFt
  );

  return {
    primaryType,
    primarySizeSqFt,
    primaryBedrooms: variation.bedrooms,
    primaryBathrooms: variation.bathrooms,
    primaryUnitLabel: variation.label,
    estimatedBuildCost: buildCost,
    estimatedSoftCost: softCost,
    estimatedTotalCost: totalCost,
    priceRange: formatPriceRange(pricing.low, pricing.high),
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
    bannerDetails,
    derivedFromFeasibility: bestRecommendationType,
    zipCode,
    rentSource: "estimated",
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
  zipCode: string,
  sizeIsCappedByRules: boolean
): { bannerRecommendation: string; bannerDetails: string } {
  const sizeLabel = primarySizeSqFt.toLocaleString();
  const layoutLabel =
    primaryVariation.bedrooms === 0
      ? "studio / 1-bath"
      : `${primaryVariation.bedrooms}-bed / ${primaryVariation.bathrooms}-bath`;

  return {
    bannerRecommendation: `Best fit for this property: ${planName} at ${sizeLabel} sq ft`,
    bannerDetails: `${primaryType} recommendation aligned to the current parcel allowance${sizeIsCappedByRules ? " and city size cap" : ""}. Recommended configuration: ${layoutLabel}. Estimated project investment: ${formatPriceRange(priceLow, priceHigh)}. Estimated market rent for ZIP ${zipCode}: $${rentLow.toLocaleString()}-$${rentHigh.toLocaleString()}/month.`,
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
    estimatedLoanAmount: Math.round(recommendation.estimatedTotalCost * 0.80),
    estimatedDownPayment: Math.round(recommendation.estimatedTotalCost * 0.20),
    estimatedMonthlyPayment: fp.monthlyPayment,
    estimatedMonthlyIncome: fp.monthlyIncome,
    estimatedMonthlyCashflow: fp.monthlyCashFlow,
    estimatedAnnualGrossIncome: fp.monthlyIncome * 12,
    estimatedAnnualNetCashflow: fp.monthlyCashFlow * 12,
    estimatedRoi: fp.roi,
    estimatedPaybackYears: fp.paybackYears,
    estimatedValueAdd: fp.valueAdd,
  }];
}

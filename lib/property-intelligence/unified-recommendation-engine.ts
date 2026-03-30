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
import type { RentEstimate } from "./rentcast-service";
import { inferUnitConfig, getRentEstimate } from "./rentcast-service";

// DCS Pricing - Single source of truth matching site-data.ts
const DCS_PRICING = {
  "Detached ADU": {
    baseCostPerSqFt: 450,
    minCost: 175000,
  },
  "Attached ADU": {
    baseCostPerSqFt: 400,
    minCost: 150000,
  },
  "Garage Conversion": {
    baseCostPerSqFt: 300,
    minCost: 120000,
  },
  "JADU": {
    baseCostPerSqFt: 350,
    minCost: 80000,
  },
  "Second-Story ADU": {
    baseCostPerSqFt: 500,
    minCost: 200000,
  },
} as const;

// San Diego market rent assumptions by bedroom count and zip code tier
// Based on 2025 Q4 market data
const RENT_ASSUMPTIONS = {
  // Rent per sqft/month by bedroom count
  byBedrooms: {
    0: 5.50,  // Studio: ~$2,200/mo for 400 sqft
    1: 4.75,  // 1-bed: ~$3,300/mo for 700 sqft
    2: 4.25,  // 2-bed: ~$4,250/mo for 1000 sqft
    3: 3.75,  // 3-bed: ~$4,500/mo for 1200 sqft
    4: 3.50,  // 4-bed: ~$5,250/mo for 1500 sqft
  } as Record<number, number>,
  
  // Zip code tier adjustments (multiplier)
  zipTiers: {
    premium: 1.15,   // 92037 (La Jolla), 92067 (Rancho Santa Fe), 92014 (Del Mar)
    high: 1.08,      // 92109 (Pacific Beach), 92106 (Point Loma), 92101 (Downtown)
    standard: 1.00,  // Most zip codes
    affordable: 0.92, // 91911, 91950, 92113, 92114
  } as Record<string, number>,
  
  // Map zip codes to tiers
  zipToTier: {
    "92037": "premium", "92067": "premium", "92014": "premium", "92075": "premium",
    "92109": "high", "92106": "high", "92101": "high", "92103": "high", "92107": "high",
    "92104": "high", "92116": "high", "92115": "standard", "92120": "standard",
    "91911": "affordable", "91950": "affordable", "92113": "affordable", "92114": "affordable",
  } as Record<string, string>,
};

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
    address,
    zipCode,
    buildableEnvelopeSqFt,
    feasibilityResults,
    bestRecommendationType,
    maxAllowedSqFt,
    jaduMaxSqFt,
  } = input;
  
  // Step 1: Determine primary recommendation size
  // Use the buildable envelope, capped at jurisdiction max
  const primarySizeSqFt = Math.min(buildableEnvelopeSqFt, maxAllowedSqFt);
  const primaryType = bestRecommendationType;
  
  // Step 2: Determine unit configuration based on size
  const primaryConfig = inferUnitConfig(primarySizeSqFt);
  
  // Step 3: Calculate DCS pricing for primary
  const pricing = DCS_PRICING[primaryType as keyof typeof DCS_PRICING] || DCS_PRICING["Detached ADU"];
  const buildCost = Math.max(pricing.minCost, Math.round(primarySizeSqFt * pricing.baseCostPerSqFt));
  const softCost = Math.round(buildCost * 0.15);
  const totalCost = buildCost + softCost;
  
  // Step 4: Get rent estimate for primary using correct zip code
  const rentEstimate = await getSmartRentEstimate(
    address,
    zipCode,
    primarySizeSqFt,
    primaryConfig.bedrooms,
    primaryConfig.bathrooms
  );
  
  // Step 5: Calculate financial preview for primary
  const downPayment = Math.round(totalCost * 0.20);
  const loanAmount = totalCost - downPayment;
  const monthlyPayment = calculateMonthlyPayment(loanAmount, 0.07, 30);
  const effectiveMonthlyRent = Math.round(rentEstimate.monthlyRent * 0.95); // 5% vacancy
  const monthlyExpenses = Math.round((totalCost * 0.011 + 600 + totalCost * 0.01) / 12);
  const monthlyCashFlow = effectiveMonthlyRent - monthlyPayment - monthlyExpenses;
  const annualNetCashFlow = monthlyCashFlow * 12;
  const roi = totalCost > 0 ? Math.round((annualNetCashFlow / totalCost) * 1000) / 10 : 0;
  const paybackYears = annualNetCashFlow > 0 ? Math.round((totalCost / annualNetCashFlow) * 10) / 10 : 99;
  const valueAdd = Math.round(totalCost * 1.3);
  
  // Step 6: Determine if secondary (JADU) opportunity exists
  let secondaryType: string | undefined;
  let secondarySizeSqFt: number | undefined;
  let secondaryConfig: { bedrooms: number; bathrooms: number; unitType: string } | undefined;
  let secondaryRent: number | undefined;
  
  // Check if JADU is feasible as secondary
  const jaduFeasibility = feasibilityResults.find(f => f.type === "JADU");
  if (jaduFeasibility && (jaduFeasibility.feasibility === "likely" || jaduFeasibility.feasibility === "possible")) {
    secondaryType = "JADU";
    secondarySizeSqFt = Math.min(jaduMaxSqFt, 500);
    secondaryConfig = inferUnitConfig(secondarySizeSqFt);
    const secondaryRentEstimate = await getSmartRentEstimate(
      address,
      zipCode,
      secondarySizeSqFt,
      secondaryConfig.bedrooms,
      secondaryConfig.bathrooms
    );
    secondaryRent = secondaryRentEstimate.monthlyRent;
  }
  
  // Step 7: Generate smart banner text
  const { bannerRecommendation, bannerDetails } = generateSmartBannerText(
    primaryType,
    primarySizeSqFt,
    primaryConfig,
    secondaryType,
    secondarySizeSqFt,
    rentEstimate.monthlyRent,
    secondaryRent
  );
  
  // Step 8: Build price range string
  const priceRange = `$${Math.round(totalCost / 1000)}K`;
  
  return {
    primaryType,
    primarySizeSqFt,
    primaryBedrooms: primaryConfig.bedrooms,
    primaryBathrooms: primaryConfig.bathrooms,
    primaryUnitLabel: primaryConfig.unitType,
    
    secondaryType,
    secondarySizeSqFt,
    secondaryBedrooms: secondaryConfig?.bedrooms,
    secondaryBathrooms: secondaryConfig?.bathrooms,
    secondaryUnitLabel: secondaryConfig?.unitType,
    
    estimatedBuildCost: buildCost,
    estimatedSoftCost: softCost,
    estimatedTotalCost: totalCost,
    priceRange,
    
    primaryRentEstimate: {
      monthlyRent: rentEstimate.monthlyRent,
      annualRent: rentEstimate.annualRent,
      rentRangeLow: rentEstimate.rentRangeLow,
      rentRangeHigh: rentEstimate.rentRangeHigh,
      pricePerSqft: rentEstimate.pricePerSqft,
    },
    
    combinedMonthlyRent: secondaryRent 
      ? rentEstimate.monthlyRent + secondaryRent 
      : undefined,
    
    financialPreview: {
      monthlyPayment,
      monthlyIncome: effectiveMonthlyRent,
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

/**
 * Get smart rent estimate using zip code tier adjustments
 */
async function getSmartRentEstimate(
  address: string,
  zipCode: string,
  sqft: number,
  bedrooms: number,
  bathrooms: number
): Promise<{
  monthlyRent: number;
  annualRent: number;
  rentRangeLow: number;
  rentRangeHigh: number;
  pricePerSqft: number;
}> {
  // Try RentCast first
  try {
    const rentCastEstimate = await getRentEstimate(address, bedrooms, bathrooms, sqft);
    if (rentCastEstimate.available && rentCastEstimate.source === "rentcast") {
      return {
        monthlyRent: rentCastEstimate.estimatedMonthlyRent,
        annualRent: rentCastEstimate.estimatedAnnualRent,
        rentRangeLow: rentCastEstimate.rentRangeLow,
        rentRangeHigh: rentCastEstimate.rentRangeHigh,
        pricePerSqft: rentCastEstimate.pricePerSqft,
      };
    }
  } catch {
    // Fall through to internal estimate
  }
  
  // Calculate internal estimate using zip code tier
  const tierName = RENT_ASSUMPTIONS.zipToTier[zipCode] || "standard";
  const tierMultiplier = RENT_ASSUMPTIONS.zipTiers[tierName] || 1.0;
  const baseRentPerSqft = RENT_ASSUMPTIONS.byBedrooms[bedrooms] || 4.25;
  const adjustedRentPerSqft = baseRentPerSqft * tierMultiplier;
  
  const monthlyRent = Math.round(sqft * adjustedRentPerSqft);
  const annualRent = monthlyRent * 12;
  
  return {
    monthlyRent,
    annualRent,
    rentRangeLow: Math.round(monthlyRent * 0.85),
    rentRangeHigh: Math.round(monthlyRent * 1.15),
    pricePerSqft: adjustedRentPerSqft,
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
  primarySizeSqFt: number,
  primaryConfig: { bedrooms: number; bathrooms: number; unitType: string },
  secondaryType?: string,
  secondarySizeSqFt?: number,
  primaryRent?: number,
  secondaryRent?: number
): { bannerRecommendation: string; bannerDetails: string } {
  const sizeLabel = primarySizeSqFt.toLocaleString();
  const configLabel = primaryConfig.unitType;
  
  // Build recommendation text
  let bannerRecommendation: string;
  let bannerDetails: string;
  
  if (secondaryType && secondarySizeSqFt) {
    // Primary + Secondary opportunity
    const combinedRent = (primaryRent || 0) + (secondaryRent || 0);
    bannerRecommendation = `This property can support up to a ${sizeLabel} sq ft ${primaryType} plus a ${secondarySizeSqFt} sq ft ${secondaryType}`;
    bannerDetails = `Based on your property scan, you have room for a ${configLabel} ${primaryType.toLowerCase()} as your primary ADU, plus a ${secondaryType} for additional income. Combined potential rent: $${combinedRent.toLocaleString()}/month.`;
  } else {
    // Primary only
    bannerRecommendation = `Best fit for your property: ${primaryType} up to ${sizeLabel} sq ft`;
    bannerDetails = `Your property has sufficient buildable area for a ${configLabel} ${primaryType.toLowerCase()}. Estimated monthly rent: $${(primaryRent || 0).toLocaleString()}/month based on San Diego market data for this zip code.`;
  }
  
  return { bannerRecommendation, bannerDetails };
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
  const scenarios: FinancialScenario[] = [];
  
  // Primary scenario
  const fp = recommendation.financialPreview;
  scenarios.push({
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
  });
  
  // If secondary exists, add combined scenario
  if (recommendation.secondaryType && recommendation.combinedMonthlyRent) {
    const secondaryPricing = DCS_PRICING[recommendation.secondaryType as keyof typeof DCS_PRICING] || DCS_PRICING["JADU"];
    const secondarySqFt = recommendation.secondarySizeSqFt || 500;
    const secondaryBuildCost = Math.max(secondaryPricing.minCost, Math.round(secondarySqFt * secondaryPricing.baseCostPerSqFt));
    const secondarySoftCost = Math.round(secondaryBuildCost * 0.15);
    const secondaryTotalCost = secondaryBuildCost + secondarySoftCost;
    
    const combinedTotalCost = recommendation.estimatedTotalCost + secondaryTotalCost;
    const combinedLoan = Math.round(combinedTotalCost * 0.80);
    const combinedDownPayment = Math.round(combinedTotalCost * 0.20);
    const combinedMonthlyPayment = calculateMonthlyPayment(combinedLoan, 0.07, 30);
    const combinedMonthlyIncome = Math.round(recommendation.combinedMonthlyRent * 0.95);
    const combinedMonthlyExpenses = Math.round((combinedTotalCost * 0.011 + 1200 + combinedTotalCost * 0.01) / 12);
    const combinedCashFlow = combinedMonthlyIncome - combinedMonthlyPayment - combinedMonthlyExpenses;
    const combinedAnnualNet = combinedCashFlow * 12;
    const combinedRoi = combinedTotalCost > 0 ? Math.round((combinedAnnualNet / combinedTotalCost) * 1000) / 10 : 0;
    const combinedPayback = combinedAnnualNet > 0 ? Math.round((combinedTotalCost / combinedAnnualNet) * 10) / 10 : 99;
    
    scenarios.push({
      scenarioName: "Maximize This Property",
      scenarioType: "maximize",
      projectedUnits: 2,
      estimatedBuildCost: recommendation.estimatedBuildCost + secondaryBuildCost,
      estimatedSoftCost: recommendation.estimatedSoftCost + secondarySoftCost,
      estimatedTotalCost: combinedTotalCost,
      estimatedLoanAmount: combinedLoan,
      estimatedDownPayment: combinedDownPayment,
      estimatedMonthlyPayment: combinedMonthlyPayment,
      estimatedMonthlyIncome: combinedMonthlyIncome,
      estimatedMonthlyCashflow: combinedCashFlow,
      estimatedAnnualGrossIncome: combinedMonthlyIncome * 12,
      estimatedAnnualNetCashflow: combinedAnnualNet,
      estimatedRoi: combinedRoi,
      estimatedPaybackYears: combinedPayback,
      estimatedValueAdd: Math.round(combinedTotalCost * 1.3),
    });
  }
  
  return scenarios;
}

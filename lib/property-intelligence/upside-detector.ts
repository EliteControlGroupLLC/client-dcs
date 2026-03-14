// Property Maximization / Upside Detection Engine
// Detects opportunities beyond a standard single-ADU approach

import type { JurisdictionProfile, FeasibilityResult, UpsideOpportunity } from "./jurisdictions/types";

interface UpsideInput {
  lotSizeSqFt: number;
  footprintSqFt: number;
  homeAreaSqFt: number;
  openYardSqFt: number;
  lotWidth: number;
  lotDepth: number;
  zoning: string;
  hasGarage: boolean;
  feasibilityResults: FeasibilityResult[];
}

/**
 * Detect upside opportunities beyond a standard single-ADU approach.
 * Triggers when property may support more value than initially expected.
 */
export function detectUpsideOpportunities(
  input: UpsideInput,
  jurisdiction: JurisdictionProfile
): UpsideOpportunity[] {
  const opportunities: UpsideOpportunity[] = [];
  const likelyResults = input.feasibilityResults.filter((r) => r.feasibility === "likely" || r.feasibility === "possible");

  // ── ADU + JADU Combo ──
  // If both ADU and JADU are feasible, that's a combo opportunity
  const hasAduFeasible = likelyResults.some((r) => r.type === "Detached ADU" || r.type === "Attached ADU");
  const hasJaduFeasible = likelyResults.some((r) => r.type === "JADU");

  if (hasAduFeasible && hasJaduFeasible && jurisdiction.eligibility.allowsJadu) {
    opportunities.push({
      triggerType: "adu-jadu-combo",
      title: "ADU + JADU Combination",
      summary:
        "This property may support both a full ADU and a JADU (Junior ADU), allowing you to add two rental units instead of one. A JADU is created within your existing home while the ADU is a separate structure.",
      scenarioCount: 2,
      estimatedUpsideLevel: "high",
      recommendedFollowupFlow: "dual-unit-calculator",
    });
  }

  // ── Garage Conversion + Detached ADU ──
  const hasGarageConversion = likelyResults.some((r) => r.type === "Garage Conversion");
  const hasDetachedAdu = likelyResults.some((r) => r.type === "Detached ADU");

  if (hasGarageConversion && hasDetachedAdu && input.hasGarage) {
    opportunities.push({
      triggerType: "garage-plus-detached",
      title: "Garage Conversion + New Detached ADU",
      summary:
        "Your property may support converting the existing garage into one unit while also building a new detached ADU. This dual approach can significantly increase rental income potential.",
      scenarioCount: 2,
      estimatedUpsideLevel: "high",
      recommendedFollowupFlow: "dual-unit-calculator",
    });
  }

  // ── SB 9 Lot Split Potential ──
  if (
    input.lotSizeSqFt >= 2400 &&
    jurisdiction.sb9.sb9LotSplitPossibleFlag &&
    !input.zoning.toLowerCase().includes("multi")
  ) {
    const canSplit = input.lotSizeSqFt >= 2400; // minimum 1,200 sq ft per parcel after split

    if (canSplit) {
      opportunities.push({
        triggerType: "sb9-lot-split",
        title: "Potential SB 9 Pathway",
        summary:
          input.lotSizeSqFt >= 5000
            ? "Based on this property's size and local rules, there may be a higher-yield development path worth reviewing. SB 9 may allow a lot split creating two parcels, each potentially supporting a duplex — up to 4 units total."
            : "This property may qualify for SB 9 provisions, which could allow additional units beyond a standard ADU. Additional review recommended for lot-maximization strategy.",
        scenarioCount: input.lotSizeSqFt >= 5000 ? 3 : 2,
        estimatedUpsideLevel: input.lotSizeSqFt >= 7500 ? "high" : "moderate",
        recommendedFollowupFlow: "sb9-scenario-calculator",
      });
    }
  }

  // ── Large Lot Multiple ADU Potential ──
  if (input.lotSizeSqFt >= 10000 && likelyResults.length >= 2) {
    opportunities.push({
      triggerType: "large-lot-multi-unit",
      title: "Large Lot Multi-Unit Potential",
      summary:
        "This property may support more value than a standard single-ADU approach. The lot size and layout suggest multiple development paths that could significantly increase property value and income.",
      scenarioCount: 3,
      estimatedUpsideLevel: "high",
      recommendedFollowupFlow: "maximize-property-calculator",
    });
  }

  // ── Multifamily ADU Opportunities ──
  if (
    input.zoning.toLowerCase().includes("multi") ||
    input.zoning.toLowerCase().includes("rm") ||
    input.zoning.toLowerCase().includes("r-2") ||
    input.zoning.toLowerCase().includes("r-3")
  ) {
    opportunities.push({
      triggerType: "multifamily-adu",
      title: "Multifamily ADU Pathway",
      summary:
        "This property appears to be in a multifamily zone, which may allow additional ADU options including conversion of existing non-habitable space and detached ADUs beyond single-family limits.",
      scenarioCount: 2,
      estimatedUpsideLevel: "moderate",
      recommendedFollowupFlow: "multifamily-calculator",
    });
  }

  // ── Bonus ADU Program (San Diego specific) ──
  if (
    jurisdiction.identity.id === "san-diego-city" &&
    jurisdiction.sizeRules.bonusProgramNotes.toLowerCase().includes("bonus")
  ) {
    if (input.lotSizeSqFt >= 5000) {
      opportunities.push({
        triggerType: "bonus-adu-program",
        title: "San Diego Bonus ADU Program",
        summary:
          "This property may qualify for the City of San Diego's Bonus ADU program, which allows additional ADUs with affordability deed restrictions. This could significantly increase the number of units on your property.",
        scenarioCount: 2,
        estimatedUpsideLevel: "moderate",
        recommendedFollowupFlow: "bonus-adu-calculator",
      });
    }
  }

  return opportunities;
}

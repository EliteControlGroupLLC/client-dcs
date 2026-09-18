// Enhanced Feasibility Engine — Jurisdiction-aware ADU feasibility analysis

import type { JurisdictionProfile, FeasibilityResult, FeasibilityLevel } from "./jurisdictions/types";
import type { AduTypeName, AduTypeVerdict } from "./adu-fit-rules";

interface FeasibilityInput {
  lotSizeSqFt: number;
  footprintSqFt: number;
  homeAreaSqFt: number;
  openYardSqFt: number;
  lotWidth: number;
  lotDepth: number;
  slope: string;
  parcelShape: string;
  cornerLot: boolean;
  hasGarage: boolean;
  yearBuilt: number | null;
  zoning: string;
  overlays: string[];
}

// Cost per sqft assumptions by project type
const COST_PER_SQFT: Record<string, { low: number; mid: number; high: number }> = {
  "detached-adu": { low: 350, mid: 425, high: 500 },
  "attached-adu": { low: 300, mid: 375, high: 450 },
  "garage-conversion": { low: 200, mid: 275, high: 350 },
  "jadu": { low: 250, mid: 325, high: 400 },
};

function formatPriceRange(minSqft: number, maxSqft: number, type: string): string {
  const costs = COST_PER_SQFT[type] || COST_PER_SQFT["detached-adu"];
  const low = Math.round((minSqft * costs.low) / 1000) * 1000;
  const high = Math.round((maxSqft * costs.high) / 1000) * 1000;
  return `$${low.toLocaleString()} – $${high.toLocaleString()}`;
}

function assessFeasibilityLevel(score: number): FeasibilityLevel {
  if (score >= 80) return "likely";
  if (score >= 60) return "possible";
  if (score >= 40) return "limited";
  return "not-recommended";
}

const VERDICT_LEVEL: Record<AduTypeVerdict["level"], FeasibilityLevel> = {
  Likely: "likely",
  Possible: "possible",
  Limited: "limited",
  "Not Recommended": "not-recommended",
};
const VERDICT_CONFIDENCE: Record<AduTypeVerdict["level"], number> = {
  Likely: 85,
  Possible: 65,
  Limited: 45,
  "Not Recommended": 20,
};
const VERDICT_COST_KEY: Record<string, string> = {
  "Detached ADU": "detached-adu",
  "Attached ADU": "attached-adu",
  "Garage Conversion": "garage-conversion",
  JADU: "jadu",
};

function verdictToResult(v: AduTypeVerdict): FeasibilityResult {
  const hasSize = v.maxSqFt > 0;
  return {
    type: v.type,
    feasibility: VERDICT_LEVEL[v.level],
    maxSizeSqft: v.maxSqFt,
    minSizeSqft: v.minSqFt,
    estimatedSizeRange: v.sizeLabel,
    priceRange: hasSize ? formatPriceRange(v.minSqFt || v.maxSqFt, v.maxSqFt, VERDICT_COST_KEY[v.type] ?? "detached-adu") : "N/A",
    description: v.description,
    constraints: v.constraints,
    confidence: VERDICT_CONFIDENCE[v.level],
  };
}

/**
 * Evaluate feasibility. When `verdicts` (from adu-fit-rules, driven by real
 * parcel/footprint/assessor data) are supplied they are authoritative for
 * Detached, Attached, Garage Conversion and JADU so this list can never
 * contradict the recommendation cards.
 */
export function evaluateFeasibility(
  input: FeasibilityInput,
  jurisdiction: JurisdictionProfile,
  verdicts?: Record<AduTypeName, AduTypeVerdict>
): FeasibilityResult[] {
  const heuristic = evaluateFeasibilityHeuristic(input, jurisdiction);
  if (!verdicts) return heuristic;
  const out = heuristic.map((r) => (r.type in verdicts ? verdictToResult(verdicts[r.type as AduTypeName]) : r));
  // Garage conversion is only emitted by the heuristic when a garage was
  // assumed; with real assessor data always show the honest verdict.
  if (jurisdiction.eligibility.allowsConversionAdu && !out.some((r) => r.type === "Garage Conversion")) {
    const jaduIdx = out.findIndex((r) => r.type === "JADU");
    const entry = verdictToResult(verdicts["Garage Conversion"]);
    if (jaduIdx >= 0) out.splice(jaduIdx, 0, entry);
    else out.push(entry);
  }
  return out;
}

function evaluateFeasibilityHeuristic(
  input: FeasibilityInput,
  jurisdiction: JurisdictionProfile
): FeasibilityResult[] {
  const results: FeasibilityResult[] = [];
  const { setbacks, sizeRules, height, separation, eligibility } = jurisdiction;

  // ── Detached ADU ──
  if (eligibility.allowsDetachedAdu) {
    let score = 70;
    const constraints: string[] = [];

    // Lot size check
    if (input.lotSizeSqFt < 3000) {
      score -= 30;
      constraints.push("Lot may be too small for a detached ADU");
    } else if (input.lotSizeSqFt < 5000) {
      score -= 10;
      constraints.push("Smaller lot may limit ADU size");
    } else if (input.lotSizeSqFt >= 7500) {
      score += 10;
    }

    // Open yard check
    const minBuildArea = 400; // minimum practical ADU footprint
    const usableYard = input.openYardSqFt - (2 * setbacks.sideSetbackFt * input.lotDepth);
    if (usableYard < minBuildArea) {
      score -= 25;
      constraints.push("Limited open yard area after setbacks");
    }

    // Setback-adjusted buildable area
    const buildableWidth = Math.max(0, input.lotWidth - 2 * setbacks.sideSetbackFt);
    const mainHomeDepth = input.footprintSqFt > 0 ? Math.round(input.footprintSqFt / input.lotWidth) : 30;
    const buildableDepth = Math.max(0, input.lotDepth - setbacks.rearSetbackFt - separation.minDistanceFromPrimaryHomeFt - mainHomeDepth);
    const buildableEnvelope = buildableWidth * buildableDepth;

    // Max size capped by jurisdiction rules
    const maxFootprint = Math.min(buildableEnvelope, sizeRules.detachedAduMaxSqft);
    const maxSize = height.twoStoryAllowed
      ? Math.min(sizeRules.detachedAduMaxSqft, maxFootprint * 1.5)
      : Math.min(sizeRules.detachedAduMaxSqft, maxFootprint);
    const minSize = Math.max(sizeRules.detachedAduMinSqft, 200);

    if (maxFootprint < 200) {
      score -= 30;
      constraints.push("Buildable envelope is very limited");
    }

    // Slope penalty
    if (input.slope === "Steep" || input.slope === "Very Steep") {
      score -= 15;
      constraints.push("Steep slope may increase foundation costs");
    } else if (input.slope === "Moderate") {
      score -= 5;
      constraints.push("Moderate slope may require grading");
    }

    // Corner lot
    if (input.cornerLot) {
      score -= 5;
      constraints.push("Corner lot setbacks may reduce buildable area");
    }

    // Irregular parcel
    if (input.parcelShape !== "Rectangular" && input.parcelShape !== "Square") {
      score -= 5;
      constraints.push("Irregular parcel shape may affect placement options");
    }

    // Overlay penalties
    if (input.overlays.includes("coastal")) {
      score -= 10;
      constraints.push("Coastal zone may require additional review");
    }
    if (input.overlays.includes("hillside")) {
      score -= 10;
      constraints.push("Hillside overlay may add requirements");
    }

    const cappedSize = Math.max(minSize, Math.min(maxSize, sizeRules.detachedAduMaxSqft));

    results.push({
      type: "Detached ADU",
      feasibility: assessFeasibilityLevel(Math.max(0, Math.min(100, score))),
      maxSizeSqft: Math.round(cappedSize),
      minSizeSqft: minSize,
      estimatedSizeRange: `${minSize} – ${Math.round(cappedSize)} sq ft`,
      priceRange: formatPriceRange(minSize, Math.round(cappedSize), "detached-adu"),
      description: score >= 60
        ? "A standalone structure in your yard. This is the most common and typically highest-value ADU option."
        : "Space constraints may make a detached ADU challenging on this lot.",
      constraints,
      confidence: Math.max(0, Math.min(100, score)),
    });
  }

  // ── Attached ADU ──
  if (eligibility.allowsAttachedAdu) {
    let score = 65;
    const constraints: string[] = [];

    // Attached ADUs are viable on more lots since they don't need separation distance
    if (input.lotSizeSqFt < 2500) {
      score -= 20;
      constraints.push("Lot may be too small for an attached ADU");
    }

    // Check if there's a buildable wall to attach to
    if (input.footprintSqFt > 0) {
      score += 5;
    }

    const maxSize = Math.min(sizeRules.attachedAduMaxSqft, Math.round(input.homeAreaSqFt * 0.5));
    const minSize = Math.max(sizeRules.attachedAduMinSqft, 200);

    if (input.slope === "Steep" || input.slope === "Very Steep") {
      score -= 10;
      constraints.push("Slope may complicate attachment to existing structure");
    }

    if (input.overlays.includes("coastal")) {
      score -= 10;
      constraints.push("Coastal zone review required");
    }

    results.push({
      type: "Attached ADU",
      feasibility: assessFeasibilityLevel(Math.max(0, Math.min(100, score))),
      maxSizeSqft: Math.max(minSize, maxSize),
      minSizeSqft: minSize,
      estimatedSizeRange: `${minSize} – ${Math.max(minSize, maxSize)} sq ft`,
      priceRange: formatPriceRange(minSize, Math.max(minSize, maxSize), "attached-adu"),
      description: score >= 60
        ? "An addition connected to your existing home. Often more affordable than a standalone structure."
        : "Attachment options may be limited on this property.",
      constraints,
      confidence: Math.max(0, Math.min(100, score)),
    });
  }

  // ── Garage Conversion ──
  if (eligibility.allowsConversionAdu && input.hasGarage) {
    let score = 75;
    const constraints: string[] = [];

    // Garage conversions are usually the most feasible
    const garageSize = Math.min(500, Math.round(input.footprintSqFt * 0.3));

    if (garageSize < 200) {
      score -= 20;
      constraints.push("Estimated garage size may be too small for a functional ADU");
    }

    constraints.push("No additional parking replacement required per state law");

    results.push({
      type: "Garage Conversion",
      feasibility: assessFeasibilityLevel(Math.max(0, Math.min(100, score))),
      maxSizeSqft: Math.max(200, garageSize),
      minSizeSqft: 200,
      estimatedSizeRange: `${200} – ${Math.max(200, garageSize)} sq ft`,
      priceRange: formatPriceRange(200, Math.max(200, garageSize), "garage-conversion"),
      description: score >= 60
        ? "Convert your existing garage into a living unit. Typically the most affordable ADU path."
        : "Garage conversion may have limitations on this property.",
      constraints,
      confidence: Math.max(0, Math.min(100, score)),
    });
  }

  // ── JADU ──
  if (eligibility.allowsJadu) {
    let score = 60;
    const constraints: string[] = [];

    // JADU must be within existing home or attached garage
    if (input.homeAreaSqFt < 800) {
      score -= 25;
      constraints.push("Home may be too small for a JADU conversion");
    } else if (input.homeAreaSqFt >= 1500) {
      score += 10;
    }

    const maxSize = Math.min(sizeRules.jaduMaxSqft, Math.round(input.homeAreaSqFt * 0.4));

    constraints.push("Must be within existing home footprint or attached garage");
    constraints.push("Owner occupancy may be required for JADU");

    results.push({
      type: "JADU",
      feasibility: assessFeasibilityLevel(Math.max(0, Math.min(100, score))),
      maxSizeSqft: Math.min(sizeRules.jaduMaxSqft, Math.max(150, maxSize)),
      minSizeSqft: 150,
      estimatedSizeRange: `150 – ${Math.min(sizeRules.jaduMaxSqft, Math.max(150, maxSize))} sq ft`,
      priceRange: formatPriceRange(150, Math.min(sizeRules.jaduMaxSqft, Math.max(150, maxSize)), "jadu"),
      description: score >= 60
        ? "A small unit carved out of your existing home. Maximum 500 sq ft with a shared or separate entrance."
        : "JADU may not be practical given the existing home size.",
      constraints,
      confidence: Math.max(0, Math.min(100, score)),
    });
  }

  return results;
}

/**
 * Determine the best recommended path from feasibility results
 */
export function determineRecommendedPath(results: FeasibilityResult[]): {
  path: string;
  description: string;
} {
  // Priority: likely > possible > limited
  const likely = results.filter((r) => r.feasibility === "likely");
  const possible = results.filter((r) => r.feasibility === "possible");

  if (likely.length > 0) {
    // Prefer detached, then attached, then garage, then JADU
    const priority = ["Detached ADU", "Attached ADU", "Garage Conversion", "JADU"];
    for (const type of priority) {
      const match = likely.find((r) => r.type === type);
      if (match) {
        return {
          path: match.type,
          description: `Based on your lot size, setbacks, and local regulations, a ${match.type.toLowerCase()} appears to be the strongest option for this property.`,
        };
      }
    }
  }

  if (possible.length > 0) {
    const best = possible[0];
    return {
      path: best.type,
      description: `A ${best.type.toLowerCase()} may be feasible on this property, though some constraints should be reviewed with a professional.`,
    };
  }

  // Fallback
  const garageConv = results.find((r) => r.type === "Garage Conversion");
  if (garageConv && garageConv.feasibility !== "not-recommended") {
    return {
      path: "Garage Conversion",
      description: "Your lot appears limited for a traditional ADU. A garage conversion may be the most practical path.",
    };
  }

  return {
    path: "Consultation Recommended",
    description: "This property has some constraints that may affect ADU feasibility. We recommend a professional site evaluation to explore your options.",
  };
}

// Property Intelligence Analysis Engine
// Orchestrates data resolution, elevation lookup, and ADU recommendation generation

import {
  type PropertyAnalysisResult,
  type ADURecommendation,
  type FeasibilityLevel,
  type BuildableAnalysis,
  type SmartBannerData,
  type LotDimensions,
} from "./types";
import { resolvePropertyData } from "./property-data-resolver";
import { geocodeAddress } from "./geocoding-service";
import { getElevationData } from "./elevation-service";

export async function analyzeProperty(address: string): Promise<PropertyAnalysisResult> {
  // Step 1: Geocode the address
  const geocoded = await geocodeAddress(address);

  // Step 2: Get elevation/slope data if we have coordinates
  let slopeData: { slope: string; confidence: number; sources: string[] } | undefined;
  if (geocoded) {
    slopeData = await getElevationData(geocoded.lat, geocoded.lng);
  }

  // Step 3: Resolve property data from all sources
  const resolved = resolvePropertyData(
    address,
    geocoded?.formattedAddress,
    slopeData
  );

  const { intelligence, rawLotSizeSqFt, rawFootprintSqFt } = resolved;

  // Step 4: Calculate buildable area
  const buildable = calculateBuildableArea(rawLotSizeSqFt, rawFootprintSqFt);

  // Step 5: Generate ADU recommendations
  const openYard = intelligence.openYardSqFt.value;
  const recommendations = generateRecommendations(rawLotSizeSqFt, openYard, buildable.estimatedBuildableEnvelopeSqFt);

  // Step 6: Determine best recommendation
  const bestRec = determineBestRecommendation(recommendations);

  // Step 7: Generate smart banner
  const smartBanner = generateSmartBanner(bestRec, buildable, rawLotSizeSqFt);

  // Step 8: Calculate lot dimensions for site diagram
  const lotWidth = Math.round(Math.sqrt(rawLotSizeSqFt * 0.5));
  const lotDepth = Math.round(rawLotSizeSqFt / lotWidth);
  const mainHomeWidth = Math.round(Math.sqrt(rawFootprintSqFt * 0.7));
  const mainHomeDepth = Math.round(rawFootprintSqFt / mainHomeWidth);

  const lotDimensions: LotDimensions = {
    lotWidth,
    lotDepth,
    mainHomeWidth,
    mainHomeDepth,
  };

  return {
    property: intelligence,
    buildable,
    recommendations,
    bestRecommendation: bestRec,
    smartBanner,
    lotDimensions,
    disclaimer:
      "Preliminary estimate only. Data sourced from public records and satellite analysis. Final feasibility depends on site verification, title review, zoning confirmation, utility conditions, and city approval.",
  };
}

function calculateBuildableArea(lotSizeSqFt: number, footprintSqFt: number): BuildableAnalysis {
  const separationFt = 6;
  const setbackFt = lotSizeSqFt > 8000 ? 4 : 3;

  // Estimate buildable envelope
  const lotWidth = Math.round(Math.sqrt(lotSizeSqFt * 0.5));
  const lotDepth = Math.round(lotSizeSqFt / lotWidth);
  const usableWidth = Math.max(0, lotWidth - 2 * setbackFt);
  const usableDepth = Math.max(0, lotDepth - setbackFt - separationFt - Math.round(footprintSqFt / lotWidth));
  const buildableEnvelope = Math.max(0, usableWidth * usableDepth);
  const cappedEnvelope = Math.min(buildableEnvelope, 1200); // CA ADU max

  return {
    requiredMainHomeSeparationFt: separationFt,
    requiredPropertyLineSetbackFt: setbackFt,
    estimatedBuildableEnvelopeSqFt: cappedEnvelope,
    oneStoryPotential: `Up to ${cappedEnvelope.toLocaleString()} sq ft estimated`,
    twoStoryPotential:
      cappedEnvelope > 400
        ? `Up to ${Math.min(1200, cappedEnvelope * 1.5).toLocaleString()} sq ft estimated depending on design/review`
        : "Limited — lot constraints may restrict two-story options",
  };
}

function generateRecommendations(
  lotSizeSqFt: number,
  openYardSqFt: number,
  buildableEnvelope: number
): ADURecommendation[] {
  const isLargeLot = lotSizeSqFt > 6500;
  const hasGoodYard = openYardSqFt > 2000;
  const hasModerateYard = openYardSqFt > 1200;

  const detachedFeasibility: FeasibilityLevel =
    hasGoodYard && buildableEnvelope > 500
      ? "Likely"
      : hasModerateYard
      ? "Possible"
      : "Limited";

  const attachedFeasibility: FeasibilityLevel =
    buildableEnvelope > 300 ? "Possible" : "Limited";

  const garageFeasibility: FeasibilityLevel =
    isLargeLot || lotSizeSqFt > 5500 ? "Likely" : "Possible";

  const secondStoryFeasibility: FeasibilityLevel =
    lotSizeSqFt > 5000 ? "Possible" : "Limited";

  return [
    {
      type: "Detached ADU",
      feasibility: detachedFeasibility,
      estimatedSizeRange: hasGoodYard
        ? "600 - 1,200 sq ft"
        : hasModerateYard
        ? "400 - 600 sq ft"
        : "Up to 400 sq ft",
      priceRange: hasGoodYard ? "$175K - $350K" : "$120K - $200K",
      description: hasGoodYard
        ? "Based on this preliminary scan, a detached ADU appears feasible. Your lot has sufficient open area to accommodate a standalone unit with required setbacks."
        : "Your lot appears tight for a detached ADU. Limited buildable area may restrict unit size, but a smaller detached unit may still be possible.",
    },
    {
      type: "Attached ADU",
      feasibility: attachedFeasibility,
      estimatedSizeRange: "400 - 800 sq ft",
      priceRange: "$130K - $250K",
      description:
        "An attached ADU extends from your existing home. This option can work well when yard space is limited, as it shares a wall with the main residence.",
    },
    {
      type: "Garage Conversion",
      feasibility: garageFeasibility,
      estimatedSizeRange: "350 - 500 sq ft",
      priceRange: "$80K - $160K",
      description:
        "Your property may qualify for a garage conversion. This is often the most cost-effective ADU option, converting existing structure into livable space.",
    },
    {
      type: "Second-Story ADU",
      feasibility: secondStoryFeasibility,
      estimatedSizeRange: "400 - 1,000 sq ft",
      priceRange: "$200K - $400K",
      description:
        "A second-story ADU is built above your existing home or garage. This option maximizes yard space while adding significant livable area.",
    },
  ];
}

function determineBestRecommendation(recommendations: ADURecommendation[]): string {
  const priority: Record<FeasibilityLevel, number> = {
    Likely: 4,
    Possible: 3,
    Limited: 2,
    "Not Recommended": 1,
  };

  // Prefer: Detached > Garage > Attached > Second-Story when feasibility is equal
  const typePriority: Record<string, number> = {
    "Detached ADU": 4,
    "Garage Conversion": 3,
    "Attached ADU": 2,
    "Second-Story ADU": 1,
  };

  const sorted = [...recommendations].sort((a, b) => {
    const fDiff = priority[b.feasibility] - priority[a.feasibility];
    if (fDiff !== 0) return fDiff;
    return (typePriority[b.type] || 0) - (typePriority[a.type] || 0);
  });

  return sorted[0].type;
}

function generateSmartBanner(
  bestType: string,
  buildable: BuildableAnalysis,
  lotSizeSqFt: number
): SmartBannerData {
  const isLargeLot = lotSizeSqFt > 6500;

  if (bestType === "Detached ADU") {
    return {
      recommendation: `Best fit for your property: Detached ADU up to approximately ${buildable.estimatedBuildableEnvelopeSqFt.toLocaleString()} sq ft`,
      details: isLargeLot
        ? `Your property has sufficient open yard area and favorable lot dimensions to support a standalone ADU. With an estimated buildable envelope of ${buildable.estimatedBuildableEnvelopeSqFt.toLocaleString()} sq ft, you have strong potential for a comfortable 1-2 bedroom detached unit.`
        : `Your lot may support a detached ADU, though size may be limited. Consider booking a site review to confirm exact buildable area.`,
    };
  }

  if (bestType === "Garage Conversion") {
    return {
      recommendation:
        "Your lot appears limited for a detached ADU. A garage conversion may be the better path.",
      details:
        "Your lot looks tight for a detached ADU, but you may still have strong conversion options. A garage conversion is typically the most affordable path and can deliver a beautiful, functional living space.",
    };
  }

  return {
    recommendation: `Consider an ${bestType.toLowerCase()} to maximize your property's potential.`,
    details: `Based on the available buildable area, an ${bestType.toLowerCase()} would maximize your property's ADU potential while working within the existing lot constraints.`,
  };
}

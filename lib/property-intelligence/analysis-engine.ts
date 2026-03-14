// Property Intelligence Analysis Engine
// Orchestrates data resolution, elevation lookup, jurisdiction detection,
// feasibility analysis, upside detection, financial scenarios, and confidence scoring

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
import { getOSMPropertyData } from "./osm-service";
import { getAttomPropertyData } from "./attom-service";
import { detectJurisdictionFromAddress, detectOverlays } from "./jurisdictions/detector";
import { COMMON_FINANCIAL_DISCLAIMER } from "./jurisdictions/profiles";
import { evaluateFeasibility, determineRecommendedPath } from "./feasibility-engine";
import { detectUpsideOpportunities } from "./upside-detector";
import { generateFinancialScenarios } from "./financial-scenarios";
import { calculateConfidence } from "./confidence-model";

export async function analyzeProperty(address: string): Promise<PropertyAnalysisResult> {
  // Step 1: Geocode the address
  const geocoded = await geocodeAddress(address);

  // Step 2: Get ATTOM data, elevation/slope data, AND OSM data in parallel
  let slopeData: { slope: string; confidence: number; sources: string[] } | undefined;
  let osmData: Awaited<ReturnType<typeof getOSMPropertyData>> | undefined;
  const attomData = await getAttomPropertyData(address);

  if (geocoded) {
    const [slope, osm] = await Promise.all([
      getElevationData(geocoded.lat, geocoded.lng),
      getOSMPropertyData(geocoded.lat, geocoded.lng),
    ]);
    slopeData = slope;
    osmData = osm;
  }

  // Step 3: Resolve property data from all sources (ATTOM + OSM + estimates)
  const resolved = resolvePropertyData(
    address,
    geocoded?.formattedAddress,
    slopeData,
    osmData,
    attomData
  );

  const { intelligence, rawLotSizeSqFt, rawFootprintSqFt } = resolved;

  // Step 4: Detect jurisdiction
  const formattedAddress = geocoded?.formattedAddress || address;
  const jurisdictionResult = detectJurisdictionFromAddress(formattedAddress);
  const profile = jurisdictionResult.profile;

  // Step 5: Calculate buildable area using jurisdiction-specific setbacks
  const jSetback = Math.min(profile.setbacks.sideSetbackFt, profile.setbacks.rearSetbackFt);
  const jSeparation = profile.separation.minDistanceFromPrimaryHomeFt;
  const buildable = calculateBuildableArea(rawLotSizeSqFt, rawFootprintSqFt, jSetback, jSeparation);

  // Step 6: Detect overlays
  const slopeStr = intelligence.slope.value;
  let slopePercent: number | undefined;
  if (slopeStr === "Steep") slopePercent = 20;
  else if (slopeStr === "Moderate") slopePercent = 10;
  else if (slopeStr === "Mostly flat") slopePercent = 3;
  const overlays = detectOverlays(formattedAddress, jurisdictionResult.jurisdictionId, slopePercent);

  // Step 7: Enhanced feasibility analysis
  const lotWidth = Math.round(Math.sqrt(rawLotSizeSqFt * 0.5));
  const lotDepth = Math.round(rawLotSizeSqFt / lotWidth);
  const openYard = intelligence.openYardSqFt.value;
  const zoning = intelligence.zoning.value;
  const homeArea = intelligence.homeAreaSqFt.value;
  const parcelShape = intelligence.parcelShape.value;

  const enhancedFeasibility = evaluateFeasibility(
    {
      lotSizeSqFt: rawLotSizeSqFt,
      footprintSqFt: rawFootprintSqFt,
      homeAreaSqFt: homeArea,
      openYardSqFt: openYard,
      lotWidth,
      lotDepth,
      slope: slopeStr,
      parcelShape,
      cornerLot: false,
      hasGarage: rawFootprintSqFt > 800,
      yearBuilt: attomData?.yearBuilt || null,
      zoning,
      overlays: overlays.filter((o) => o.detected).map((o) => o.type),
    },
    profile
  );

  // Step 8: Detect upside opportunities
  const upsideOpportunities = detectUpsideOpportunities(
    {
      lotSizeSqFt: rawLotSizeSqFt,
      footprintSqFt: rawFootprintSqFt,
      homeAreaSqFt: homeArea,
      openYardSqFt: openYard,
      lotWidth,
      lotDepth,
      zoning,
      hasGarage: rawFootprintSqFt > 800,
      feasibilityResults: enhancedFeasibility,
    },
    profile
  );

  // Step 9: Generate financial scenarios
  const financialScenarios = generateFinancialScenarios(enhancedFeasibility);

  // Step 10: Calculate confidence score
  const confidenceResult = calculateConfidence(
    {
      jurisdictionConfidence: jurisdictionResult.confidence,
      jurisdictionUncertain: jurisdictionResult.uncertain,
      lotSizeSqFt: rawLotSizeSqFt,
      footprintSqFt: rawFootprintSqFt,
      hasGeometry: false,
      hasDimensions: lotWidth > 0 && lotDepth > 0,
      hasAttomData: attomData?.available === true,
      hasOsmData: osmData?.parcel !== null && osmData?.parcel !== undefined,
      slope: slopeStr,
      parcelShape,
      cornerLot: false,
      overlays,
      zoning,
      rulesVersion: profile.identity.rulesVersion,
    },
    profile
  );

  // Step 11: Generate legacy recommendations (backward compatibility)
  const recommendations = generateRecommendations(rawLotSizeSqFt, openYard, buildable.estimatedBuildableEnvelopeSqFt);
  const bestRec = determineBestRecommendation(recommendations);
  const smartBanner = generateSmartBanner(bestRec, buildable, rawLotSizeSqFt, upsideOpportunities.length > 0);

  // Step 12: Calculate lot dimensions for site diagram
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
      "Recommendations are based on parcel data, mapped jurisdiction standards, and publicly available regulations. Final feasibility depends on site conditions, utilities, easements, overlays, and formal city review.",

    // Enhanced v2 layers
    jurisdiction: {
      id: jurisdictionResult.jurisdictionId,
      name: jurisdictionResult.jurisdictionName,
      type: profile.identity.type,
      confidence: jurisdictionResult.confidence,
      uncertain: jurisdictionResult.uncertain,
      rulesVersion: profile.identity.rulesVersion,
      sourceUrls: profile.identity.sourceUrls,
    },
    aduRulesSnapshot: {
      detachedMaxSqft: profile.sizeRules.detachedAduMaxSqft,
      attachedMaxSqft: profile.sizeRules.attachedAduMaxSqft,
      jaduMaxSqft: profile.sizeRules.jaduMaxSqft,
      sideSetbackFt: profile.setbacks.sideSetbackFt,
      rearSetbackFt: profile.setbacks.rearSetbackFt,
      maxHeightFt: profile.height.maxHeightFt,
      twoStoryAllowed: profile.height.twoStoryAllowed,
      parkingRequired: profile.parking.parkingRequired,
      ownerOccupancyNotes: profile.eligibility.ownerOccupancyNotes,
      bonusProgramNotes: profile.sizeRules.bonusProgramNotes,
    },
    overlays,
    enhancedFeasibility,
    upsideDetected: upsideOpportunities.length > 0,
    upsideOpportunities,
    financialScenarios,
    confidenceScore: confidenceResult.score,
    confidenceBand: confidenceResult.band,
    manualReviewRequired: confidenceResult.manualReviewRequired,
    manualReviewReasons: confidenceResult.manualReviewReasons,
    confidenceSignals: {
      positive: confidenceResult.positiveSignals,
      negative: confidenceResult.negativeSignals,
    },
    financialDisclaimer: COMMON_FINANCIAL_DISCLAIMER,
  };
}

function calculateBuildableArea(
  lotSizeSqFt: number,
  footprintSqFt: number,
  setbackFt: number = 3,
  separationFt: number = 6
): BuildableAnalysis {
  // Estimate buildable envelope using jurisdiction-specific setbacks
  const lotWidth = Math.round(Math.sqrt(lotSizeSqFt * 0.5));
  const lotDepth = Math.round(lotSizeSqFt / lotWidth);
  // Subtract 3ft setback from each side (left + right)
  const usableWidth = Math.max(0, lotWidth - 2 * setbackFt);
  // Subtract rear setback (3ft) + separation from main home (6ft) + main home footprint depth
  const mainHomeDepthEst = Math.round(footprintSqFt / lotWidth);
  const usableDepth = Math.max(0, lotDepth - setbackFt - separationFt - mainHomeDepthEst);
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
  lotSizeSqFt: number,
  hasUpside: boolean = false
): SmartBannerData {
  const isLargeLot = lotSizeSqFt > 6500;

  if (hasUpside) {
    return {
      recommendation: `This property may support more value than a standard single-ADU approach.`,
      details: isLargeLot
        ? `Based on this property's size and local rules, there may be a higher-yield development path worth reviewing. Scroll down to see your opportunity analysis and financial projections.`
        : `Your property may qualify for additional development options beyond a single ADU. Review the opportunity analysis below for details.`,
    };
  }

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

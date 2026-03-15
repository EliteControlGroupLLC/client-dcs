// Property Intelligence Analysis Engine
// Orchestrates data resolution, elevation lookup, jurisdiction detection,
// Zoneomics enrichment, feasibility analysis, upside detection,
// RentCast-powered financial scenarios, Mapbox visualization, and confidence scoring

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
import { evaluateFeasibility } from "./feasibility-engine";
import { detectUpsideOpportunities } from "./upside-detector";
import { generateFinancialScenarios } from "./financial-scenarios";
import { calculateConfidence } from "./confidence-model";
import {
  generateParcelVisualization,
  getStaticMapUrl,
  isMapboxAvailable,
  type ParcelVisualization,
} from "./mapbox-service";
import {
  getZoneomicsData,
  enrichOverlaysFromZoneomics,
  getZoningInterpretation,
  isZoneomicsAvailable,
  type ZoneomicsZoningData,
} from "./zoneomics-service";
import {
  getRentEstimate,
  inferUnitConfig,
  isRentCastAvailable,
  type RentEstimate,
} from "./rentcast-service";
import type { OverlayDetection } from "./jurisdictions/types";
import { runSanityChecks } from "./sanity-check-engine";
import { analyzeSiteConstraints } from "./site-constraint-engine";
import { reconcileAllSources } from "./source-reconciliation-engine";

export async function analyzeProperty(address: string): Promise<PropertyAnalysisResult> {
  // Step 1: Geocode the address (Google Places API)
  const geocoded = await geocodeAddress(address);
  if (!geocoded) {
    console.error(`[PROVIDER-ERROR] Google Places: geocoding failed for address "${address}"`);
  }

  // Step 2: Get ATTOM data, elevation/slope data, OSM data, AND Zoneomics data in parallel
  let slopeData: { slope: string; confidence: number; sources: string[] } | undefined;
  let osmData: Awaited<ReturnType<typeof getOSMPropertyData>> | undefined;
  let zoneomicsData: ZoneomicsZoningData | undefined;
  const attomData = await getAttomPropertyData(address);
  if (!attomData.available) {
    console.error(`[PROVIDER-ERROR] ATTOM Property: no data returned for address "${address}"`);
  }

  if (geocoded) {
    const [slope, osm, zoneomics] = await Promise.all([
      getElevationData(geocoded.lat, geocoded.lng),
      getOSMPropertyData(geocoded.lat, geocoded.lng),
      getZoneomicsData(geocoded.lat, geocoded.lng),
    ]);
    slopeData = slope;
    osmData = osm;
    zoneomicsData = zoneomics;

    if (!zoneomics.available) {
      console.error(`[PROVIDER-ERROR] Zoneomics: no zoning data returned for (${geocoded.lat}, ${geocoded.lng})`);
    }
  }

  // Step 3: Resolve property data from all sources (ATTOM + OSM + estimates)
  const resolved = resolvePropertyData(
    address,
    geocoded?.formattedAddress,
    slopeData,
    osmData,
    attomData
  );

  const { intelligence, rawLotSizeSqFt } = resolved;
  let { rawFootprintSqFt } = resolved;

  // Step 3b: Run sanity checks before proceeding
  const sanityResult = runSanityChecks({
    lotSizeSqFt: rawLotSizeSqFt,
    footprintSqFt: rawFootprintSqFt,
    homeAreaSqFt: intelligence.homeAreaSqFt.value,
    openYardSqFt: intelligence.openYardSqFt.value,
    lotWidth: 0, // computed later
    lotDepth: 0,
    zoning: intelligence.zoning.value,
    slope: intelligence.slope.value,
    parcelShape: intelligence.parcelShape.value,
    hasAttomData: attomData?.available === true,
    hasOsmData: osmData?.parcel !== null && osmData?.parcel !== undefined,
    hasGeocoded: Boolean(geocoded),
  });

  // Apply sanity adjustments
  for (const adj of sanityResult.adjustments) {
    if (adj.field === "footprintSqFt") {
      rawFootprintSqFt = adj.adjustedValue;
      console.warn(`[SANITY-CHECK] Adjusted footprint: ${adj.originalValue} -> ${adj.adjustedValue} (${adj.reason})`);
    }
  }

  if (!sanityResult.passed) {
    const failures = sanityResult.checks.filter((c) => !c.passed && c.severity === "error");
    for (const f of failures) {
      console.warn(`[SANITY-CHECK] FAILED: ${f.name} — ${f.message}`);
    }
  }

  // Step 3c: Multi-structure detection from OSM data
  const detectedStructures: { type: string; areaSqFt: number; confidence: number }[] = [];
  if (osmData?.parcel && osmData.parcel.buildings.length > 0) {
    const sorted = [...osmData.parcel.buildings].sort((a, b) => b.areaSqFt - a.areaSqFt);
    for (let i = 0; i < sorted.length; i++) {
      const b = sorted[i];
      let structureType = "accessory structure";
      if (i === 0) {
        structureType = "main residence";
      } else if (b.buildingType === "garage" || (b.areaSqFt >= 200 && b.areaSqFt <= 500)) {
        structureType = "detached garage";
      } else if (b.buildingType === "yes" && b.areaSqFt >= 400 && b.areaSqFt <= 1200) {
        structureType = "possible detached ADU";
      }
      detectedStructures.push({
        type: structureType,
        areaSqFt: b.areaSqFt,
        confidence: i === 0 ? 80 : 60,
      });
    }
  }

  // Step 4: Detect jurisdiction
  const formattedAddress = geocoded?.formattedAddress || address;
  const jurisdictionResult = detectJurisdictionFromAddress(formattedAddress);
  const profile = jurisdictionResult.profile;

  // Step 4b: Slope percent extraction for constraint analysis
  const slopeStr = intelligence.slope.value;
  let slopePercent: number = 0;
  if (slopeStr === "Steep slope" || slopeStr === "Steep") slopePercent = 20;
  else if (slopeStr === "Moderate slope" || slopeStr === "Moderate") slopePercent = 10;
  else if (slopeStr === "Mostly flat") slopePercent = 3;
  else if (slopeStr === "Flat") slopePercent = 1;

  // Step 4c: Site Constraint Intelligence Layer
  // Runs after zoning determination and before buildable-area calculations
  const hasCoastalOverlay = false; // will be updated after overlay detection
  const siteConstraints = analyzeSiteConstraints({
    lat: geocoded?.lat || 0,
    lng: geocoded?.lng || 0,
    slopeCategory: slopeStr,
    slopePercent,
    jurisdictionId: jurisdictionResult.jurisdictionId,
    formattedAddress,
    lotSizeSqFt: rawLotSizeSqFt,
    zoning: intelligence.zoning.value,
    hasCoastalOverlay,
    hasHillsideOverlay: slopePercent > 15,
    overlayTypes: [],
  });

  // Step 5: Calculate buildable area using jurisdiction-specific setbacks
  const jSetback = Math.min(profile.setbacks.sideSetbackFt, profile.setbacks.rearSetbackFt);
  const jSeparation = profile.separation.minDistanceFromPrimaryHomeFt;
  const buildable = calculateBuildableArea(rawLotSizeSqFt, rawFootprintSqFt, jSetback, jSeparation);

  // Step 6: Detect overlays (base detection + Zoneomics enrichment)
  const baseOverlays = detectOverlays(formattedAddress, jurisdictionResult.jurisdictionId, slopePercent);

  // Enrich overlays with Zoneomics data
  let overlays = baseOverlays;
  if (zoneomicsData?.available) {
    const zEnrichment = enrichOverlaysFromZoneomics(zoneomicsData);
    const additionalOverlays: OverlayDetection[] = [];

    if (zEnrichment.designReview && !overlays.some((o) => o.type === "design-review")) {
      additionalOverlays.push({
        type: "design-review",
        name: "Design Review Overlay",
        detected: true,
        confidence: 70,
        notes: "Zoneomics indicates this property is in a design review area.",
      });
    }
    if (zEnrichment.historicDistrict && !overlays.some((o) => o.type === "historic")) {
      additionalOverlays.push({
        type: "historic",
        name: "Historic District",
        detected: true,
        confidence: 65,
        notes: "Zoneomics indicates this property may be in a historic district.",
      });
    }
    if (zEnrichment.coastalZone && !overlays.some((o) => o.type === "coastal")) {
      additionalOverlays.push({
        type: "coastal",
        name: "Coastal Zone",
        detected: true,
        confidence: 65,
        notes: "Zoneomics indicates this property may be in the Coastal Zone.",
      });
    }

    overlays = [...baseOverlays, ...additionalOverlays];
  }

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

  // Step 9: Get RentCast rent estimates for financial scenarios
  let rentEstimates: Map<string, RentEstimate> | undefined;
  const feasibleTypes = enhancedFeasibility.filter(
    (r) => r.feasibility === "likely" || r.feasibility === "possible"
  );

  if (feasibleTypes.length > 0) {
    const rentPromises = feasibleTypes.map(async (f) => {
      const midSqft = Math.round((f.minSizeSqft + f.maxSizeSqft) / 2);
      const unitConfig = inferUnitConfig(midSqft);
      const estimate = await getRentEstimate(
        formattedAddress,
        unitConfig.bedrooms,
        unitConfig.bathrooms,
        midSqft
      );
      return { type: f.type, estimate };
    });

    const results = await Promise.allSettled(rentPromises);
    rentEstimates = new Map();
    for (const result of results) {
      if (result.status === "fulfilled") {
        rentEstimates.set(result.value.type, result.value.estimate);
      } else {
        console.error(`[PROVIDER-ERROR] RentCast: rent estimate failed — ${result.reason}`);
      }
    }
  }

  if (!isRentCastAvailable()) {
    console.error("[PROVIDER-ERROR] RentCast: API key not configured — using fallback estimates");
  }

  if (!isMapboxAvailable()) {
    console.error("[PROVIDER-ERROR] Mapbox: token not configured — map visualization unavailable");
  }

  // Step 10: Generate financial scenarios (enhanced with RentCast data + site constraint cost adjustments)
  const financialScenarios = generateFinancialScenarios(enhancedFeasibility, rentEstimates);

  // Apply site constraint cost adjustments to financial scenarios
  if (siteConstraints.costAdjustmentPercent > 0) {
    const multiplier = 1 + siteConstraints.costAdjustmentPercent / 100;
    for (const scenario of financialScenarios) {
      scenario.estimatedBuildCost = Math.round(scenario.estimatedBuildCost * multiplier);
      scenario.estimatedSoftCost = Math.round(scenario.estimatedSoftCost * multiplier);
      scenario.estimatedTotalCost = scenario.estimatedBuildCost + scenario.estimatedSoftCost;
      scenario.estimatedDownPayment = Math.round(scenario.estimatedTotalCost * 0.20);
      scenario.estimatedLoanAmount = scenario.estimatedTotalCost - scenario.estimatedDownPayment;
    }
  }

  // Step 11: Generate Mapbox parcel visualization
  let parcelVisualization: ParcelVisualization | undefined;
  let staticMapUrl: string | null = null;

  if (geocoded) {
    const mvHomeWidth = Math.round(Math.sqrt(rawFootprintSqFt * 0.7));
    const mvHomeDepth = Math.round(rawFootprintSqFt / mvHomeWidth);

    parcelVisualization = generateParcelVisualization(
      geocoded.lat,
      geocoded.lng,
      lotWidth,
      lotDepth,
      mvHomeWidth,
      mvHomeDepth,
      profile.setbacks.sideSetbackFt,
      profile.setbacks.rearSetbackFt,
      15, // front setback estimate
      profile.separation.minDistanceFromPrimaryHomeFt
    );

    staticMapUrl = getStaticMapUrl(geocoded.lat, geocoded.lng);
  }

  // Step 12: Calculate confidence score (enhanced with new data sources)
  const confidenceResult = calculateConfidence(
    {
      jurisdictionConfidence: jurisdictionResult.confidence,
      jurisdictionUncertain: jurisdictionResult.uncertain,
      lotSizeSqFt: rawLotSizeSqFt,
      footprintSqFt: rawFootprintSqFt,
      hasGeometry: parcelVisualization !== undefined,
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

  // Boost confidence if additional data sources are available
  let adjustedScore = confidenceResult.score;
  const additionalPositiveSignals = [...confidenceResult.positiveSignals];
  const additionalNegativeSignals = [...confidenceResult.negativeSignals];

  if (zoneomicsData?.available) {
    adjustedScore = Math.min(100, adjustedScore + 3);
    additionalPositiveSignals.push("Zoneomics zoning data available");
  }
  if (rentEstimates && rentEstimates.size > 0) {
    const hasRentCast = Array.from(rentEstimates.values()).some((r) => r.source === "rentcast");
    if (hasRentCast) {
      adjustedScore = Math.min(100, adjustedScore + 2);
      additionalPositiveSignals.push("RentCast market rent data available");
    }
  }
  if (isMapboxAvailable()) {
    adjustedScore = Math.min(100, adjustedScore + 2);
    additionalPositiveSignals.push("Mapbox parcel visualization available");
  }

  // Apply site constraint confidence signals
  if (siteConstraints.overallRiskLevel === "High") {
    adjustedScore = Math.max(0, adjustedScore - 3);
    additionalNegativeSignals.push(`High site constraint risk: ${siteConstraints.summary}`);
  } else if (siteConstraints.overallRiskLevel === "Low") {
    adjustedScore = Math.min(100, adjustedScore + 2);
    additionalPositiveSignals.push("Site constraint analysis: low risk conditions");
  }

  // Apply sanity check confidence adjustment
  if (sanityResult.overallConfidenceAdjustment !== 0) {
    adjustedScore = Math.max(0, Math.min(100, adjustedScore + sanityResult.overallConfidenceAdjustment));
    if (sanityResult.overallConfidenceAdjustment < 0) {
      additionalNegativeSignals.push(`Data quality issues detected (${sanityResult.checks.filter((c) => !c.passed).length} checks flagged)`);
    } else {
      additionalPositiveSignals.push("Multi-source data cross-validation passed");
    }
  }

  const adjustedBand: "high" | "moderate" | "low" = adjustedScore >= 85 ? "high" : adjustedScore >= 65 ? "moderate" : "low";

  // Step 13: Generate legacy recommendations (backward compatibility)
  const recommendations = generateRecommendations(rawLotSizeSqFt, openYard, buildable.estimatedBuildableEnvelopeSqFt);
  const bestRec = determineBestRecommendation(recommendations);
  const smartBanner = generateSmartBanner(bestRec, buildable, rawLotSizeSqFt, upsideOpportunities.length > 0);

  // Build zoning enrichment summary
  const zoningEnrichment = zoneomicsData?.available
    ? {
        zoningCode: zoneomicsData.zoningCode,
        zoningDescription: zoneomicsData.zoningDescription,
        landUseCategory: zoneomicsData.landUseCategory,
        overlayDistricts: zoneomicsData.overlayDistricts,
        maxLotCoverage: zoneomicsData.planningAttributes.maxLotCoverage,
        maxFAR: zoneomicsData.planningAttributes.maxFAR,
        interpretation: getZoningInterpretation(zoneomicsData),
        confidence: zoneomicsData.confidence,
        available: true as const,
      }
    : undefined;

  // Build rent data summary
  const rentData = rentEstimates
    ? {
        estimates: Array.from(rentEstimates.entries()).map(([type, est]) => ({
          aduType: type,
          monthlyRent: est.estimatedMonthlyRent,
          annualRent: est.estimatedAnnualRent,
          rentRange: `$${est.rentRangeLow.toLocaleString()} - $${est.rentRangeHigh.toLocaleString()}`,
          pricePerSqft: est.pricePerSqft,
          source: est.source,
          confidence: est.confidence,
        })),
        available: true as const,
        source: (Array.from(rentEstimates.values()).some((r) => r.source === "rentcast")
          ? "rentcast"
          : "estimated") as "rentcast" | "estimated",
      }
    : undefined;

  // Step 14: Source Cross-Reference & Reconciliation (v6)
  // Collect ALL candidate values from every source, reconcile per-field,
  // detect discrepancies, and build full audit trail.
  const sourceAudit = reconcileAllSources({
    rawAddress: address,
    geocodedAddress: geocoded?.formattedAddress || null,
    attomData: attomData || null,
    osmData: osmData || null,
    zoneomicsData: zoneomicsData || null,
    rentEstimates: rentEstimates || null,
    slopeData: slopeData || null,
    resolvedLotSizeSqFt: rawLotSizeSqFt,
    resolvedHomeAreaSqFt: intelligence.homeAreaSqFt.value,
    resolvedFootprintSqFt: rawFootprintSqFt,
    resolvedOpenYardSqFt: intelligence.openYardSqFt.value,
    resolvedZoning: intelligence.zoning.value,
    resolvedParcelShape: intelligence.parcelShape.value,
    resolvedApn: intelligence.apn.value,
    bestRecommendation: bestRec,
  });

  // Log reconciliation summary
  console.log(
    `[RECONCILIATION] ${sourceAudit.totalSourcesConsulted} sources consulted | ` +
    `${sourceAudit.verifiedFieldCount}/${sourceAudit.fieldCount} verified | ` +
    `${sourceAudit.discrepancies.length} discrepancies detected`
  );
  for (const d of sourceAudit.discrepancies) {
    console.warn(`[DISCREPANCY] ${d.field}: ${d.description} (severity: ${d.severity})`);
  }

  // Step 15: Calculate lot dimensions for site diagram
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
    confidenceScore: adjustedScore,
    confidenceBand: adjustedBand,
    manualReviewRequired: confidenceResult.manualReviewRequired,
    manualReviewReasons: confidenceResult.manualReviewReasons,
    confidenceSignals: {
      positive: additionalPositiveSignals,
      negative: additionalNegativeSignals,
    },
    financialDisclaimer: COMMON_FINANCIAL_DISCLAIMER,

    // New v3 layers
    geocoded: geocoded
      ? {
          lat: geocoded.lat,
          lng: geocoded.lng,
          placeId: geocoded.placeId,
          formattedAddress: geocoded.formattedAddress,
          city: geocoded.components.city || null,
          state: geocoded.components.state || null,
          zip: geocoded.components.zip || null,
        }
      : undefined,
    parcelVisualization: parcelVisualization || undefined,
    staticMapUrl: staticMapUrl || undefined,
    zoningEnrichment,
    rentData,
    dataSources: {
      googlePlaces: Boolean(geocoded),
      attom: attomData?.available === true,
      openStreetMap: osmData?.parcel !== null && osmData?.parcel !== undefined,
      zoneomics: zoneomicsData?.available === true,
      rentCast: isRentCastAvailable(),
      mapbox: isMapboxAvailable(),
    },

    // v4 layers — Architecture enhancements
    sanityChecks: {
      passed: sanityResult.passed,
      checks: sanityResult.checks,
      adjustments: sanityResult.adjustments,
    },
    detectedStructures: detectedStructures.length > 0 ? detectedStructures : undefined,
    rentScenarios: buildRentScenarios(rentEstimates),
    imageryWarning: "Aerial imagery may not reflect recent construction or site changes. A professional site visit is recommended to verify current conditions.",

    // v6 layers — Source Cross-Reference & Reconciliation
    sourceAudit,

    // v5 layers — Site Constraint Intelligence
    siteConstraints,
  };
}

/** Build conservative / market / premium rent scenarios from RentCast data */
function buildRentScenarios(
  rentEstimates?: Map<string, RentEstimate>
): { conservative: { monthlyRent: number; annualRent: number }; market: { monthlyRent: number; annualRent: number }; premium: { monthlyRent: number; annualRent: number }; source: "rentcast" | "estimated"; aduType: string }[] | undefined {
  if (!rentEstimates || rentEstimates.size === 0) return undefined;

  return Array.from(rentEstimates.entries()).map(([type, est]) => {
    const marketRent = est.estimatedMonthlyRent;
    // Conservative: use low end of range or 85% of market
    const conservativeRent = est.rentRangeLow > 0 ? est.rentRangeLow : Math.round(marketRent * 0.85);
    // Premium: use high end of range or 115% of market
    const premiumRent = est.rentRangeHigh > 0 ? est.rentRangeHigh : Math.round(marketRent * 1.15);

    return {
      aduType: type,
      source: est.source,
      conservative: { monthlyRent: conservativeRent, annualRent: conservativeRent * 12 },
      market: { monthlyRent: marketRent, annualRent: marketRent * 12 },
      premium: { monthlyRent: premiumRent, annualRent: premiumRent * 12 },
    };
  });
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

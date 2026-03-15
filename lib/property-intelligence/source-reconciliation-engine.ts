// Source Cross-Reference & Reconciliation Engine (v6 + v7)
// Compares multiple data sources per field, applies tier-based priority,
// detects discrepancies, scores confidence, and produces a full audit trail.
//
// Source Policy Hierarchy:
//   PRIMARY BACKBONE (never overridden by reference-only sources):
//     - ATTOM Property API (parcel/property facts)
//     - Official city/county/state sources (zoning, ADU regulations, setbacks)
//     - Parcel geometry / footprint vectors (assessor-linked structured data)
//     - Zoneomics (zoning intelligence)
//     - RentCast (market rent data)
//     - Google Places (geocoding)
//
//   REFERENCE ONLY (never primary legal truth):
//     - Zillow, Realtor.com, Redfin
//     - May cross-check living area, bedroom/bath count, improvements, market context
//     - Must NOT override backbone for: lot size, APN, parcel geometry, zoning,
//       legal feasibility, setbacks, ADU/JADU rules

import type {
  SourceAudit,
  ReconciledField,
  SourceCandidate,
  DiscrepancyRecord,
  FieldVerificationStatus,
  SourceTier,
  SourcePolicy,
} from "./types";
import type { AttomPropertyData } from "./attom-service";
import type { OSMPropertyData } from "./osm-service";
import type { ZoneomicsZoningData } from "./zoneomics-service";
import type { RentEstimate } from "./rentcast-service";

// ─── Input: all raw source data collected during analysis ───

export interface ReconciliationInput {
  rawAddress: string;
  geocodedAddress: string | null;
  attomData: AttomPropertyData | null;
  osmData: OSMPropertyData | null;
  zoneomicsData: ZoneomicsZoningData | null;
  rentEstimates: Map<string, RentEstimate> | null;
  slopeData: { slope: string; confidence: number; sources: string[] } | null;
  resolvedLotSizeSqFt: number;
  resolvedHomeAreaSqFt: number;
  resolvedFootprintSqFt: number;
  resolvedOpenYardSqFt: number;
  resolvedZoning: string;
  resolvedParcelShape: string;
  resolvedApn: string;
  bestRecommendation: string;
  // v7 geometry fields
  geometryStatus?: "polygon-verified" | "polygon-estimated" | "rectangle-fallback";
  parcelSource?: string;
  footprintSource?: string;
  placementMethod?: string;
  geometryConfidence?: number;
}

// ─── Source Classification ───

const TIER_WEIGHT: Record<SourceTier, number> = {
  tier1: 1.0,
  tier2: 0.7,
  tier3: 0.4,
};

/** Classify a source name into its policy tier */
function classifySource(sourceName: string): { tier: SourceTier; policy: SourcePolicy } {
  const lower = sourceName.toLowerCase();

  // PRIMARY BACKBONE sources
  if (lower.includes("attom")) return { tier: "tier1", policy: "primary-backbone" };
  if (lower.includes("google") || lower.includes("geocod")) return { tier: "tier1", policy: "primary-backbone" };
  if (lower.includes("zoneomics")) return { tier: "tier1", policy: "primary-backbone" };
  if (lower.includes("rentcast")) return { tier: "tier1", policy: "primary-backbone" };
  if (lower.includes("city") || lower.includes("municipal") || lower.includes("county") || lower.includes("state"))
    return { tier: "tier1", policy: "primary-backbone" };
  if (lower.includes("assessor") || lower.includes("official")) return { tier: "tier1", policy: "primary-backbone" };

  // TIER 2 — Geometry / Visual Validation
  if (lower.includes("osm") || lower.includes("openstreetmap") || lower.includes("overpass"))
    return { tier: "tier2", policy: "primary-backbone" };
  if (lower.includes("polygon") || lower.includes("footprint") || lower.includes("vector"))
    return { tier: "tier2", policy: "primary-backbone" };
  if (lower.includes("nominatim")) return { tier: "tier2", policy: "primary-backbone" };
  if (lower.includes("mapbox") || lower.includes("elevation")) return { tier: "tier2", policy: "primary-backbone" };

  // REFERENCE ONLY sources
  if (lower.includes("zillow") || lower.includes("redfin") || lower.includes("realtor"))
    return { tier: "tier3", policy: "reference-only" };

  // Default to tier2 backbone for unknown sources
  return { tier: "tier2", policy: "primary-backbone" };
}

// ─── Reconciliation Helpers ───

function reconcileNumeric(
  fieldName: string,
  candidates: SourceCandidate<number>[],
  tolerancePercent: number = 10,
  isCritical: boolean = false
): { field: ReconciledField<number>; discrepancies: DiscrepancyRecord[] } {
  const discrepancies: DiscrepancyRecord[] = [];

  if (candidates.length === 0) {
    return {
      field: {
        finalValue: 0,
        finalConfidence: 0,
        finalStatus: isCritical ? "under-review" : "estimated",
        selectedSource: "none",
        selectionReason: "No data available",
        candidates: [],
        discrepancyDetected: false,
      },
      discrepancies,
    };
  }

  // Sort by tier weight * confidence (backbone sources always preferred)
  const sorted = [...candidates].sort((a, b) => {
    // Primary backbone always beats reference-only for legal/property fields
    if (a.sourcePolicy === "primary-backbone" && b.sourcePolicy === "reference-only") return -1;
    if (a.sourcePolicy === "reference-only" && b.sourcePolicy === "primary-backbone") return 1;
    return (TIER_WEIGHT[b.sourceTier] * b.confidence) - (TIER_WEIGHT[a.sourceTier] * a.confidence);
  });

  const best = sorted[0];

  // Check for discrepancies between backbone sources
  for (let i = 1; i < sorted.length; i++) {
    const other = sorted[i];
    if (best.value === 0 || other.value === 0) continue;

    const diff = Math.abs(best.value - other.value) / Math.max(best.value, 1);
    if (diff > tolerancePercent / 100) {
      const severity: DiscrepancyRecord["severity"] =
        diff > 0.3 ? "high" : diff > 0.15 ? "medium" : "low";

      discrepancies.push({
        field: fieldName,
        description: `${fieldName} differs by ${(diff * 100).toFixed(1)}% between ${best.sourceName} and ${other.sourceName}`,
        severity,
        sourceA: best.sourceName,
        sourceAValue: String(best.value),
        sourceB: other.sourceName,
        sourceBValue: String(other.value),
        resolution: `Using ${best.sourceName} (${best.sourcePolicy}, ${best.sourceTier})`,
        confidenceImpact: severity === "high" ? -15 : severity === "medium" ? -8 : -3,
      });
    }
  }

  // Determine status
  let status: FieldVerificationStatus;
  const confidenceImpact = discrepancies.reduce((s, d) => s + d.confidenceImpact, 0);
  const adjustedConfidence = Math.max(10, best.confidence + confidenceImpact);

  if (candidates.length >= 2 && discrepancies.length === 0) {
    status = "verified";
  } else if (discrepancies.some(d => d.severity === "high")) {
    status = isCritical ? "under-review" : "estimated";
  } else if (best.sourcePolicy === "primary-backbone" && best.confidence >= 80) {
    status = "verified";
  } else {
    status = "estimated";
  }

  return {
    field: {
      finalValue: best.value,
      finalConfidence: adjustedConfidence,
      finalStatus: status,
      selectedSource: best.sourceName,
      selectionReason: `Highest-priority ${best.sourcePolicy} source (${best.sourceTier})`,
      candidates: sorted,
      discrepancyDetected: discrepancies.length > 0,
      discrepancyDetail: discrepancies.length > 0
        ? discrepancies.map(d => d.description).join("; ")
        : undefined,
    },
    discrepancies,
  };
}

function reconcileString(
  fieldName: string,
  candidates: SourceCandidate<string>[],
  isCritical: boolean = false
): { field: ReconciledField<string>; discrepancies: DiscrepancyRecord[] } {
  const discrepancies: DiscrepancyRecord[] = [];

  if (candidates.length === 0) {
    return {
      field: {
        finalValue: "",
        finalConfidence: 0,
        finalStatus: isCritical ? "under-review" : "estimated",
        selectedSource: "none",
        selectionReason: "No data available",
        candidates: [],
        discrepancyDetected: false,
      },
      discrepancies,
    };
  }

  // Sort by policy priority then tier weight * confidence
  const sorted = [...candidates].sort((a, b) => {
    if (a.sourcePolicy === "primary-backbone" && b.sourcePolicy === "reference-only") return -1;
    if (a.sourcePolicy === "reference-only" && b.sourcePolicy === "primary-backbone") return 1;
    return (TIER_WEIGHT[b.sourceTier] * b.confidence) - (TIER_WEIGHT[a.sourceTier] * a.confidence);
  });

  const best = sorted[0];

  // Check for discrepancies
  for (let i = 1; i < sorted.length; i++) {
    const other = sorted[i];
    if (!best.value || !other.value) continue;

    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (normalize(best.value) !== normalize(other.value)) {
      discrepancies.push({
        field: fieldName,
        description: `${fieldName} differs between ${best.sourceName} ("${best.value}") and ${other.sourceName} ("${other.value}")`,
        severity: isCritical ? "high" : "medium",
        sourceA: best.sourceName,
        sourceAValue: best.value,
        sourceB: other.sourceName,
        sourceBValue: other.value,
        resolution: `Using ${best.sourceName} (${best.sourcePolicy}, ${best.sourceTier})`,
        confidenceImpact: isCritical ? -15 : -5,
      });
    }
  }

  let status: FieldVerificationStatus;
  const confidenceImpact = discrepancies.reduce((s, d) => s + d.confidenceImpact, 0);
  const adjustedConfidence = Math.max(10, best.confidence + confidenceImpact);

  if (candidates.length >= 2 && discrepancies.length === 0) {
    status = "verified";
  } else if (discrepancies.some(d => d.severity === "high")) {
    status = isCritical ? "under-review" : "estimated";
  } else if (best.sourcePolicy === "primary-backbone" && best.confidence >= 80) {
    status = "verified";
  } else {
    status = "estimated";
  }

  return {
    field: {
      finalValue: best.value,
      finalConfidence: adjustedConfidence,
      finalStatus: status,
      selectedSource: best.sourceName,
      selectionReason: `Highest-priority ${best.sourcePolicy} source (${best.sourceTier})`,
      candidates: sorted,
      discrepancyDetected: discrepancies.length > 0,
      discrepancyDetail: discrepancies.length > 0
        ? discrepancies.map(d => d.description).join("; ")
        : undefined,
    },
    discrepancies,
  };
}

function makeCandidate<T>(
  value: T,
  sourceName: string,
  confidence: number
): SourceCandidate<T> {
  const { tier, policy } = classifySource(sourceName);
  return {
    value,
    sourceName,
    sourceTier: tier,
    sourcePolicy: policy,
    confidence,
    timestamp: new Date().toISOString(),
    status: confidence >= 80 ? "verified" : confidence >= 50 ? "estimated" : "under-review",
  };
}

// ─── Main Reconciliation Function ───

export function reconcileAllSources(input: ReconciliationInput): SourceAudit {
  const allDiscrepancies: DiscrepancyRecord[] = [];

  // ── Address ──
  const addressCandidates: SourceCandidate<string>[] = [];
  addressCandidates.push(makeCandidate(input.rawAddress, "User Input", 70));
  if (input.geocodedAddress) {
    addressCandidates.push(makeCandidate(input.geocodedAddress, "Google Geocoding", 95));
  }
  if (input.osmData?.nominatimAddress) {
    addressCandidates.push(makeCandidate(input.osmData.nominatimAddress, "OpenStreetMap Nominatim", 72));
  }
  const addressResult = reconcileString("address", addressCandidates);
  allDiscrepancies.push(...addressResult.discrepancies);

  // ── APN ──
  const apnCandidates: SourceCandidate<string>[] = [];
  if (input.attomData?.apn) {
    apnCandidates.push(makeCandidate(input.attomData.apn, "ATTOM Property Data", 97));
  }
  if (input.resolvedApn && !input.resolvedApn.includes("Estimated")) {
    apnCandidates.push(makeCandidate(input.resolvedApn, "Resolved (multi-source)", 80));
  }
  const apnResult = reconcileString("apn", apnCandidates, true);
  allDiscrepancies.push(...apnResult.discrepancies);

  // ── Lot Size (CRITICAL — backbone only) ──
  const lotCandidates: SourceCandidate<number>[] = [];
  if (input.attomData?.lotSizeSqFt) {
    lotCandidates.push(makeCandidate(input.attomData.lotSizeSqFt, "ATTOM Property Data", 95));
  }
  if (input.osmData?.boundingBox) {
    const [minLat, maxLat, minLon, maxLon] = input.osmData.boundingBox;
    const latM = (maxLat - minLat) * 111320;
    const lonM = (maxLon - minLon) * 111320 * Math.cos(((minLat + maxLat) / 2 * Math.PI) / 180);
    const bbSqFt = Math.round(latM * lonM * 10.7639 * 0.7);
    if (bbSqFt > 1000 && bbSqFt < 100000) {
      lotCandidates.push(makeCandidate(bbSqFt, "OpenStreetMap Nominatim (bbox)", 60));
    }
  }
  lotCandidates.push(makeCandidate(input.resolvedLotSizeSqFt, "Resolved (multi-source)", 75));
  const lotResult = reconcileNumeric("lotSizeSqFt", lotCandidates, 15, true);
  allDiscrepancies.push(...lotResult.discrepancies);

  // ── Zoning (CRITICAL — backbone only) ──
  const zoningCandidates: SourceCandidate<string>[] = [];
  if (input.zoneomicsData?.available && input.zoneomicsData.zoningCode) {
    zoningCandidates.push(makeCandidate(input.zoneomicsData.zoningCode, "Zoneomics", 88));
  }
  if (input.attomData?.zoning) {
    zoningCandidates.push(makeCandidate(input.attomData.zoning, "ATTOM Property Data", 82));
  }
  zoningCandidates.push(makeCandidate(input.resolvedZoning, "City Zoning GIS (estimated)", 75));
  const zoningResult = reconcileString("zoning", zoningCandidates, true);
  allDiscrepancies.push(...zoningResult.discrepancies);

  // ── Land Use ──
  const landUseCandidates: SourceCandidate<string>[] = [];
  if (input.attomData?.landUse) {
    landUseCandidates.push(makeCandidate(input.attomData.landUse, "ATTOM Property Data", 90));
  }
  if (input.zoneomicsData?.available && input.zoneomicsData.landUseCategory) {
    landUseCandidates.push(makeCandidate(input.zoneomicsData.landUseCategory, "Zoneomics", 85));
  }
  if (input.osmData?.parcel?.landuse) {
    landUseCandidates.push(makeCandidate(input.osmData.parcel.landuse, "OpenStreetMap", 65));
  }
  const landUseResult = reconcileString("landUse", landUseCandidates);
  allDiscrepancies.push(...landUseResult.discrepancies);

  // ── Home Area (living sqft — distinguish from footprint) ──
  const homeAreaCandidates: SourceCandidate<number>[] = [];
  if (input.attomData?.homeAreaSqFt) {
    homeAreaCandidates.push(makeCandidate(input.attomData.homeAreaSqFt, "ATTOM Property Data", 95));
  }
  if (input.osmData?.parcel?.mainBuildingAreaSqFt) {
    homeAreaCandidates.push(makeCandidate(input.osmData.parcel.mainBuildingAreaSqFt, "OpenStreetMap (footprint × levels)", 72));
  }
  homeAreaCandidates.push(makeCandidate(input.resolvedHomeAreaSqFt, "Resolved (multi-source)", 70));
  const homeAreaResult = reconcileNumeric("homeAreaSqFt", homeAreaCandidates, 15);
  allDiscrepancies.push(...homeAreaResult.discrepancies);

  // ── Footprint (ground floor sqft — NOT living area) ──
  const footprintCandidates: SourceCandidate<number>[] = [];
  if (input.attomData?.footprintSqFt) {
    footprintCandidates.push(makeCandidate(input.attomData.footprintSqFt, "ATTOM Property Data", 92));
  }
  if (input.osmData?.parcel?.mainBuildingFootprintSqFt) {
    footprintCandidates.push(makeCandidate(input.osmData.parcel.mainBuildingFootprintSqFt, "OpenStreetMap building outline", 82));
  }
  footprintCandidates.push(makeCandidate(input.resolvedFootprintSqFt, "Resolved (multi-source)", 65));
  const footprintResult = reconcileNumeric("footprintSqFt", footprintCandidates, 20, true);
  allDiscrepancies.push(...footprintResult.discrepancies);

  // ── Open Yard ──
  const yardCandidates: SourceCandidate<number>[] = [];
  yardCandidates.push(makeCandidate(input.resolvedOpenYardSqFt, "Derived (lot - footprint - hardscape)", 60));
  const yardResult = reconcileNumeric("openYardSqFt", yardCandidates, 20);
  allDiscrepancies.push(...yardResult.discrepancies);

  // ── Parcel Shape ──
  const shapeCandidates: SourceCandidate<string>[] = [];
  shapeCandidates.push(makeCandidate(input.resolvedParcelShape, "Derived from lot dimensions", 65));
  const shapeResult = reconcileString("parcelShape", shapeCandidates);
  allDiscrepancies.push(...shapeResult.discrepancies);

  // ── Slope ──
  const slopeCandidates: SourceCandidate<string>[] = [];
  if (input.slopeData) {
    slopeCandidates.push(makeCandidate(input.slopeData.slope, input.slopeData.sources.join(", "), input.slopeData.confidence));
  }
  const slopeResult = reconcileString("slope", slopeCandidates);
  allDiscrepancies.push(...slopeResult.discrepancies);

  // ── Rent Estimate ──
  const rentCandidates: SourceCandidate<number>[] = [];
  if (input.rentEstimates && input.rentEstimates.size > 0) {
    const firstEst = Array.from(input.rentEstimates.values())[0];
    rentCandidates.push(makeCandidate(
      firstEst.estimatedMonthlyRent,
      firstEst.source === "rentcast" ? "RentCast" : "Estimated rent model",
      firstEst.confidence
    ));
  }
  const rentResult = reconcileNumeric("rentEstimate", rentCandidates);
  allDiscrepancies.push(...rentResult.discrepancies);

  // ── Recommended ADU Path ──
  const recCandidates: SourceCandidate<string>[] = [];
  recCandidates.push(makeCandidate(input.bestRecommendation, "Feasibility Engine", 75));
  const recResult = reconcileString("recommendedAduPath", recCandidates);
  allDiscrepancies.push(...recResult.discrepancies);

  // ── v7 Geometry Source Fields ──
  const parcelGeoCandidates: SourceCandidate<string>[] = [];
  if (input.parcelSource) {
    parcelGeoCandidates.push(makeCandidate(
      input.parcelSource,
      input.parcelSource,
      input.geometryConfidence || 50
    ));
  }
  const parcelGeoResult = reconcileString("parcelGeometry", parcelGeoCandidates, true);
  allDiscrepancies.push(...parcelGeoResult.discrepancies);

  const footprintGeoCandidates: SourceCandidate<string>[] = [];
  if (input.footprintSource) {
    footprintGeoCandidates.push(makeCandidate(
      input.footprintSource,
      input.footprintSource,
      input.geometryConfidence || 50
    ));
  }
  const footprintGeoResult = reconcileString("footprintGeometry", footprintGeoCandidates, true);
  allDiscrepancies.push(...footprintGeoResult.discrepancies);

  const placementCandidates: SourceCandidate<string>[] = [];
  if (input.placementMethod) {
    placementCandidates.push(makeCandidate(
      input.placementMethod,
      input.footprintSource || "Geometry Engine",
      input.geometryConfidence || 50
    ));
  }
  const placementResult = reconcileString("structurePlacement", placementCandidates, true);
  allDiscrepancies.push(...placementResult.discrepancies);

  // ── Aggregate stats ──
  const allFields = [
    addressResult.field, apnResult.field, lotResult.field, zoningResult.field,
    landUseResult.field, homeAreaResult.field, footprintResult.field, yardResult.field,
    shapeResult.field, slopeResult.field, rentResult.field, recResult.field,
    parcelGeoResult.field, footprintGeoResult.field, placementResult.field,
  ];

  const fieldCount = allFields.length;
  const verifiedCount = allFields.filter(f => f.finalStatus === "verified").length;
  const estimatedCount = allFields.filter(f => f.finalStatus === "estimated").length;
  const underReviewCount = allFields.filter(f => f.finalStatus === "under-review").length;

  // Determine total unique sources consulted
  const allSources = new Set<string>();
  for (const f of allFields) {
    for (const c of f.candidates) {
      allSources.add(c.sourceName);
    }
  }

  return {
    address: addressResult.field,
    apn: apnResult.field,
    lotSizeSqFt: lotResult.field,
    zoning: zoningResult.field,
    landUse: landUseResult.field,
    homeAreaSqFt: homeAreaResult.field,
    footprintSqFt: footprintResult.field,
    openYardSqFt: yardResult.field,
    parcelShape: shapeResult.field,
    slope: slopeResult.field,
    rentEstimate: rentResult.field,
    recommendedAduPath: recResult.field,
    parcelGeometry: parcelGeoResult.field,
    footprintGeometry: footprintGeoResult.field,
    structurePlacement: placementResult.field,
    discrepancies: allDiscrepancies,
    reconciliationTimestamp: new Date().toISOString(),
    totalSourcesConsulted: allSources.size,
    fieldCount,
    verifiedFieldCount: verifiedCount,
    estimatedFieldCount: estimatedCount,
    underReviewFieldCount: underReviewCount,
    sourcePolicy: {
      primaryBackbone: [
        "ATTOM Property Data",
        "Google Geocoding",
        "Official city/county/state sources",
        "Zoneomics",
        "RentCast",
        "OpenStreetMap building outlines",
      ],
      referenceOnly: [
        "Zillow",
        "Realtor.com",
        "Redfin",
      ],
    },
  };
}

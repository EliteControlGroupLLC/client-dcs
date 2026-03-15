// Source Cross-Reference & Reconciliation Engine (v6)
// Compares multiple data sources per field, applies tier-based priority,
// detects discrepancies, scores confidence, and produces a full audit trail.
//
// Source Priority Hierarchy:
//   Tier 1 — Primary / Trusted / Structured (Google Places, ATTOM, official jurisdiction, Zoneomics, RentCast)
//   Tier 2 — Geometry / Visual Validation (parcel polygons, footprint vectors, OSM, slope/terrain)
//   Tier 3 — Supplemental Reference (Zillow, Redfin, Realtor.com — context only, never primary)

import type {
  SourceAudit,
  ReconciledField,
  SourceCandidate,
  DiscrepancyRecord,
  FieldVerificationStatus,
  SourceTier,
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
}

// ─── Tier weights for confidence scoring ───

const TIER_WEIGHT: Record<SourceTier, number> = {
  tier1: 1.0,
  tier2: 0.7,
  tier3: 0.4,
};

// ─── Helpers ───

function now(): string {
  return new Date().toISOString();
}

function statusFromConfidence(confidence: number): FieldVerificationStatus {
  if (confidence >= 90) return "verified";
  if (confidence >= 70) return "estimated";
  if (confidence >= 50) return "inferred";
  return "under-review";
}

/**
 * Reconcile a numeric field from multiple source candidates.
 * Uses tier priority, then confidence, with discrepancy detection.
 */
function reconcileNumeric(
  fieldName: string,
  candidates: SourceCandidate<number>[],
  discrepancies: DiscrepancyRecord[],
  tolerancePercent: number = 20
): ReconciledField<number> {
  if (candidates.length === 0) {
    return {
      finalValue: 0,
      finalConfidence: 0,
      finalStatus: "under-review",
      selectedSource: "none",
      selectionReason: "No source data available",
      candidates: [],
      discrepancyDetected: false,
    };
  }

  // Sort by tier priority (tier1 first), then by confidence
  const sorted = [...candidates]
    .filter((c) => c.status !== "rejected")
    .sort((a, b) => {
      const tierDiff = TIER_WEIGHT[b.sourceTier] - TIER_WEIGHT[a.sourceTier];
      if (Math.abs(tierDiff) > 0.01) return tierDiff > 0 ? 1 : -1;
      return b.confidence - a.confidence;
    });

  const winner = sorted[0];

  // Detect discrepancies between top candidates
  let discrepancyDetected = false;
  let discrepancyDetail: string | undefined;

  for (let i = 1; i < sorted.length; i++) {
    const other = sorted[i];
    if (winner.value === 0 || other.value === 0) continue;
    const diff = Math.abs(winner.value - other.value) / Math.max(winner.value, 1);
    if (diff > tolerancePercent / 100) {
      discrepancyDetected = true;
      discrepancyDetail = `${fieldName}: ${winner.sourceName} reports ${winner.value.toLocaleString()} vs ${other.sourceName} reports ${other.value.toLocaleString()} (${Math.round(diff * 100)}% difference)`;

      discrepancies.push({
        field: fieldName,
        description: discrepancyDetail,
        severity: diff > 0.5 ? "high" : diff > 0.3 ? "medium" : "low",
        sourceA: winner.sourceName,
        sourceAValue: winner.value.toLocaleString(),
        sourceB: other.sourceName,
        sourceBValue: other.value.toLocaleString(),
        resolution: `Selected ${winner.sourceName} (Tier ${winner.sourceTier.replace("tier", "")}, confidence ${winner.confidence}%)`,
        confidenceImpact: diff > 0.5 ? -15 : diff > 0.3 ? -10 : -5,
      });
      break; // only record the most significant discrepancy per field
    }
  }

  // Adjust confidence if discrepancy detected
  let adjustedConfidence = winner.confidence;
  if (discrepancyDetected) {
    adjustedConfidence = Math.max(30, adjustedConfidence - 10);
  }

  return {
    finalValue: winner.value,
    finalConfidence: adjustedConfidence,
    finalStatus: statusFromConfidence(adjustedConfidence),
    selectedSource: winner.sourceName,
    selectionReason: discrepancyDetected
      ? `Selected highest-tier source (${winner.sourceName}) despite discrepancy with other sources`
      : `Highest-tier source with confidence ${winner.confidence}%`,
    candidates,
    discrepancyDetected,
    discrepancyDetail,
  };
}

/**
 * Reconcile a string field from multiple source candidates.
 */
function reconcileString(
  fieldName: string,
  candidates: SourceCandidate<string>[],
  discrepancies: DiscrepancyRecord[]
): ReconciledField<string> {
  if (candidates.length === 0) {
    return {
      finalValue: "",
      finalConfidence: 0,
      finalStatus: "under-review",
      selectedSource: "none",
      selectionReason: "No source data available",
      candidates: [],
      discrepancyDetected: false,
    };
  }

  const sorted = [...candidates]
    .filter((c) => c.status !== "rejected")
    .sort((a, b) => {
      const tierDiff = TIER_WEIGHT[b.sourceTier] - TIER_WEIGHT[a.sourceTier];
      if (Math.abs(tierDiff) > 0.01) return tierDiff > 0 ? 1 : -1;
      return b.confidence - a.confidence;
    });

  const winner = sorted[0];

  // Detect discrepancies
  let discrepancyDetected = false;
  let discrepancyDetail: string | undefined;

  for (let i = 1; i < sorted.length; i++) {
    const other = sorted[i];
    if (!other.value || !winner.value) continue;
    const winnerNorm = winner.value.toLowerCase().trim();
    const otherNorm = other.value.toLowerCase().trim();
    if (winnerNorm !== otherNorm && !winnerNorm.includes(otherNorm) && !otherNorm.includes(winnerNorm)) {
      discrepancyDetected = true;
      discrepancyDetail = `${fieldName}: ${winner.sourceName} reports "${winner.value}" vs ${other.sourceName} reports "${other.value}"`;

      discrepancies.push({
        field: fieldName,
        description: discrepancyDetail,
        severity: "medium",
        sourceA: winner.sourceName,
        sourceAValue: winner.value,
        sourceB: other.sourceName,
        sourceBValue: other.value,
        resolution: `Selected ${winner.sourceName} (Tier ${winner.sourceTier.replace("tier", "")}, confidence ${winner.confidence}%)`,
        confidenceImpact: -5,
      });
      break;
    }
  }

  let adjustedConfidence = winner.confidence;
  if (discrepancyDetected) {
    adjustedConfidence = Math.max(30, adjustedConfidence - 10);
  }

  return {
    finalValue: winner.value,
    finalConfidence: adjustedConfidence,
    finalStatus: statusFromConfidence(adjustedConfidence),
    selectedSource: winner.sourceName,
    selectionReason: discrepancyDetected
      ? `Selected highest-tier source (${winner.sourceName}) despite discrepancy`
      : `Highest-tier source with confidence ${winner.confidence}%`,
    candidates,
    discrepancyDetected,
    discrepancyDetail,
  };
}

// ─── Main Reconciliation Function ───

export function reconcileAllSources(input: ReconciliationInput): SourceAudit {
  const discrepancies: DiscrepancyRecord[] = [];
  const ts = now();
  const hasAttom = input.attomData?.available === true;
  const hasOSM = input.osmData?.parcel !== null && input.osmData?.parcel !== undefined;
  const hasZoneomics = input.zoneomicsData?.available === true;

  // ── ADDRESS ──
  const addressCandidates: SourceCandidate<string>[] = [
    { value: input.rawAddress, sourceName: "User Input", sourceTier: "tier3", confidence: 60, timestamp: ts, status: "inferred" },
  ];
  if (input.geocodedAddress) {
    addressCandidates.push({
      value: input.geocodedAddress,
      sourceName: "Google Places API",
      sourceTier: "tier1",
      confidence: 98,
      timestamp: ts,
      status: "verified",
    });
  }
  const address = reconcileString("address", addressCandidates, discrepancies);

  // ── APN ──
  const apnCandidates: SourceCandidate<string>[] = [];
  if (hasAttom && input.attomData!.apn) {
    apnCandidates.push({
      value: input.attomData!.apn,
      sourceName: "ATTOM Property Data",
      sourceTier: "tier1",
      confidence: 97,
      timestamp: ts,
      status: "verified",
    });
  }
  if (!hasAttom) {
    apnCandidates.push({
      value: input.resolvedApn,
      sourceName: "Estimated (zone-based)",
      sourceTier: "tier3",
      confidence: 45,
      timestamp: ts,
      status: "estimated",
    });
  }
  const apn = reconcileString("apn", apnCandidates, discrepancies);

  // ── LOT SIZE ──
  const lotCandidates: SourceCandidate<number>[] = [];
  if (hasAttom && input.attomData!.lotSizeSqFt) {
    lotCandidates.push({
      value: input.attomData!.lotSizeSqFt,
      sourceName: "ATTOM Property Data",
      sourceTier: "tier1",
      confidence: 95,
      timestamp: ts,
      status: "verified",
    });
  }
  if (hasOSM && input.osmData!.boundingBox) {
    const [minLat, maxLat, minLon, maxLon] = input.osmData!.boundingBox;
    const latM = (maxLat - minLat) * 111320;
    const lonM = (maxLon - minLon) * 111320 * Math.cos(((minLat + maxLat) / 2 * Math.PI) / 180);
    const bbAreaSqFt = Math.round(latM * lonM * 10.7639 * 0.7);
    if (bbAreaSqFt > 1000 && bbAreaSqFt < 100000) {
      lotCandidates.push({
        value: bbAreaSqFt,
        sourceName: "OpenStreetMap Bounding Box",
        sourceTier: "tier2",
        confidence: 62,
        timestamp: ts,
        status: "estimated",
      });
    }
  }
  if (lotCandidates.length === 0) {
    lotCandidates.push({
      value: input.resolvedLotSizeSqFt,
      sourceName: "Zone-based estimate",
      sourceTier: "tier3",
      confidence: 50,
      timestamp: ts,
      status: "estimated",
    });
  }
  const lotSizeSqFt = reconcileNumeric("lotSizeSqFt", lotCandidates, discrepancies, 25);

  // ── ZONING ──
  const zoningCandidates: SourceCandidate<string>[] = [];
  if (hasZoneomics && input.zoneomicsData!.zoningCode) {
    zoningCandidates.push({
      value: input.zoneomicsData!.zoningCode,
      sourceName: "Zoneomics",
      sourceTier: "tier1",
      confidence: input.zoneomicsData!.confidence,
      timestamp: ts,
      status: statusFromConfidence(input.zoneomicsData!.confidence),
    });
  }
  if (hasAttom && input.attomData!.zoning) {
    zoningCandidates.push({
      value: input.attomData!.zoning,
      sourceName: "ATTOM Property Data",
      sourceTier: "tier1",
      confidence: 80,
      timestamp: ts,
      status: "estimated",
    });
  }
  if (zoningCandidates.length === 0) {
    zoningCandidates.push({
      value: input.resolvedZoning,
      sourceName: "Zone-based estimate (City GIS)",
      sourceTier: "tier2",
      confidence: 70,
      timestamp: ts,
      status: "estimated",
    });
  }
  const zoning = reconcileString("zoning", zoningCandidates, discrepancies);

  // ── LAND USE ──
  const landUseCandidates: SourceCandidate<string>[] = [];
  if (hasZoneomics && input.zoneomicsData!.landUseCategory) {
    landUseCandidates.push({
      value: input.zoneomicsData!.landUseCategory,
      sourceName: "Zoneomics",
      sourceTier: "tier1",
      confidence: input.zoneomicsData!.confidence - 5,
      timestamp: ts,
      status: "estimated",
    });
  }
  if (hasAttom && input.attomData!.landUse) {
    landUseCandidates.push({
      value: input.attomData!.landUse,
      sourceName: "ATTOM Property Data",
      sourceTier: "tier1",
      confidence: 85,
      timestamp: ts,
      status: "verified",
    });
  }
  if (landUseCandidates.length === 0) {
    landUseCandidates.push({
      value: "Residential (assumed)",
      sourceName: "Default assumption",
      sourceTier: "tier3",
      confidence: 40,
      timestamp: ts,
      status: "inferred",
    });
  }
  const landUse = reconcileString("landUse", landUseCandidates, discrepancies);

  // ── HOME AREA (Living Space) ──
  const homeAreaCandidates: SourceCandidate<number>[] = [];
  if (hasAttom && input.attomData!.homeAreaSqFt) {
    homeAreaCandidates.push({
      value: input.attomData!.homeAreaSqFt,
      sourceName: "ATTOM Property Data",
      sourceTier: "tier1",
      confidence: 95,
      timestamp: ts,
      status: "verified",
    });
  }
  if (hasOSM && input.osmData!.parcel && input.osmData!.parcel.buildings.length > 0) {
    homeAreaCandidates.push({
      value: input.osmData!.parcel.mainBuildingAreaSqFt,
      sourceName: "OpenStreetMap (footprint x levels)",
      sourceTier: "tier2",
      confidence: 72,
      timestamp: ts,
      status: "estimated",
    });
  }
  if (homeAreaCandidates.length === 0) {
    homeAreaCandidates.push({
      value: input.resolvedHomeAreaSqFt,
      sourceName: "Zone-based estimate",
      sourceTier: "tier3",
      confidence: 40,
      timestamp: ts,
      status: "estimated",
    });
  }
  const homeAreaSqFt = reconcileNumeric("homeAreaSqFt", homeAreaCandidates, discrepancies);

  // ── FOOTPRINT ──
  const footprintCandidates: SourceCandidate<number>[] = [];
  if (hasAttom && input.attomData!.footprintSqFt) {
    footprintCandidates.push({
      value: input.attomData!.footprintSqFt,
      sourceName: "ATTOM Property Data",
      sourceTier: "tier1",
      confidence: 92,
      timestamp: ts,
      status: "verified",
    });
  }
  if (hasOSM && input.osmData!.parcel && input.osmData!.parcel.buildings.length > 0) {
    footprintCandidates.push({
      value: input.osmData!.parcel.mainBuildingFootprintSqFt,
      sourceName: "OpenStreetMap building outline",
      sourceTier: "tier2",
      confidence: 82,
      timestamp: ts,
      status: "estimated",
    });
  }
  if (footprintCandidates.length === 0) {
    footprintCandidates.push({
      value: input.resolvedFootprintSqFt,
      sourceName: "Zone-based estimate",
      sourceTier: "tier3",
      confidence: 45,
      timestamp: ts,
      status: "estimated",
    });
  }
  const footprintSqFt = reconcileNumeric("footprintSqFt", footprintCandidates, discrepancies);

  // ── OPEN YARD AREA ──
  // Derived from lot size minus footprint minus hardscape. Only calculated after
  // lot size and footprint are reconciled.
  const openYardCandidates: SourceCandidate<number>[] = [];
  openYardCandidates.push({
    value: input.resolvedOpenYardSqFt,
    sourceName: "Derived (lot - footprint - hardscape)",
    sourceTier: "tier2",
    confidence: Math.min(lotSizeSqFt.finalConfidence, footprintSqFt.finalConfidence) - 5,
    timestamp: ts,
    status: statusFromConfidence(Math.min(lotSizeSqFt.finalConfidence, footprintSqFt.finalConfidence) - 5),
  });
  const openYardSqFt = reconcileNumeric("openYardSqFt", openYardCandidates, discrepancies);

  // ── PARCEL SHAPE ──
  const parcelShapeCandidates: SourceCandidate<string>[] = [];
  if (hasAttom && input.attomData!.lotWidth && input.attomData!.lotDepth) {
    const ratio = input.attomData!.lotDepth / input.attomData!.lotWidth;
    const shape = ratio > 2.5 ? "Deep narrow lot" : ratio > 1.5 ? "Rectangular" : "Nearly square";
    parcelShapeCandidates.push({
      value: `${shape} (${Math.round(input.attomData!.lotWidth)}ft x ${Math.round(input.attomData!.lotDepth)}ft)`,
      sourceName: "ATTOM Property Data",
      sourceTier: "tier1",
      confidence: 90,
      timestamp: ts,
      status: "verified",
    });
  }
  if (hasOSM && input.osmData!.boundingBox) {
    parcelShapeCandidates.push({
      value: input.resolvedParcelShape,
      sourceName: "OpenStreetMap + derived dimensions",
      sourceTier: "tier2",
      confidence: 65,
      timestamp: ts,
      status: "estimated",
    });
  }
  if (parcelShapeCandidates.length === 0) {
    parcelShapeCandidates.push({
      value: input.resolvedParcelShape,
      sourceName: "Derived from lot dimensions",
      sourceTier: "tier3",
      confidence: 50,
      timestamp: ts,
      status: "inferred",
    });
  }
  const parcelShape = reconcileString("parcelShape", parcelShapeCandidates, discrepancies);

  // ── SLOPE ──
  const slopeCandidates: SourceCandidate<string>[] = [];
  if (input.slopeData) {
    slopeCandidates.push({
      value: input.slopeData.slope,
      sourceName: input.slopeData.sources.join(", "),
      sourceTier: "tier2",
      confidence: input.slopeData.confidence,
      timestamp: ts,
      status: statusFromConfidence(input.slopeData.confidence),
    });
  } else {
    slopeCandidates.push({
      value: "Mostly flat",
      sourceName: "Default assumption",
      sourceTier: "tier3",
      confidence: 40,
      timestamp: ts,
      status: "inferred",
    });
  }
  const slope = reconcileString("slope", slopeCandidates, discrepancies);

  // ── RENT ESTIMATE ──
  const rentCandidates: SourceCandidate<number>[] = [];
  if (input.rentEstimates && input.rentEstimates.size > 0) {
    for (const [type, est] of input.rentEstimates) {
      if (est.source === "rentcast") {
        rentCandidates.push({
          value: est.estimatedMonthlyRent,
          sourceName: `RentCast (${type})`,
          sourceTier: "tier1",
          confidence: est.confidence,
          timestamp: ts,
          status: statusFromConfidence(est.confidence),
        });
      } else {
        rentCandidates.push({
          value: est.estimatedMonthlyRent,
          sourceName: `Estimated (${type})`,
          sourceTier: "tier3",
          confidence: est.confidence,
          timestamp: ts,
          status: "estimated",
        });
      }
    }
  }
  if (rentCandidates.length === 0) {
    rentCandidates.push({
      value: 0,
      sourceName: "No rent data available",
      sourceTier: "tier3",
      confidence: 0,
      timestamp: ts,
      status: "under-review",
    });
  }
  const rentEstimate = reconcileNumeric("rentEstimate", rentCandidates, discrepancies, 30);

  // ── RECOMMENDED ADU PATH ──
  const recommendedAduPathCandidates: SourceCandidate<string>[] = [
    {
      value: input.bestRecommendation,
      sourceName: "Feasibility Engine (multi-factor analysis)",
      sourceTier: "tier1",
      confidence: 80,
      timestamp: ts,
      status: "estimated",
    },
  ];
  const recommendedAduPath = reconcileString("recommendedAduPath", recommendedAduPathCandidates, discrepancies);

  // ── Count sources consulted ──
  let totalSources = 1; // user input always present
  if (input.geocodedAddress) totalSources++;
  if (hasAttom) totalSources++;
  if (hasOSM) totalSources++;
  if (hasZoneomics) totalSources++;
  if (input.rentEstimates && input.rentEstimates.size > 0) totalSources++;
  if (input.slopeData) totalSources++;

  // ── Count field statuses ──
  const allFields = [
    address, apn, lotSizeSqFt, zoning, landUse,
    homeAreaSqFt, footprintSqFt, openYardSqFt,
    parcelShape, slope, rentEstimate, recommendedAduPath,
  ];
  const fieldCount = allFields.length;
  const verifiedFieldCount = allFields.filter((f) => f.finalStatus === "verified").length;
  const estimatedFieldCount = allFields.filter((f) => f.finalStatus === "estimated" || f.finalStatus === "inferred").length;
  const underReviewFieldCount = allFields.filter((f) => f.finalStatus === "under-review").length;

  return {
    address,
    apn,
    lotSizeSqFt,
    zoning,
    landUse,
    homeAreaSqFt,
    footprintSqFt,
    openYardSqFt,
    parcelShape,
    slope,
    rentEstimate,
    recommendedAduPath,
    discrepancies,
    reconciliationTimestamp: ts,
    totalSourcesConsulted: totalSources,
    fieldCount,
    verifiedFieldCount,
    estimatedFieldCount,
    underReviewFieldCount,
  };
}

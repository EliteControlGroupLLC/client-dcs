// Confidence Model — 0-100 scoring with bands and manual review triggers

import type { JurisdictionProfile, OverlayDetection } from "./jurisdictions/types";

interface ConfidenceInput {
  jurisdictionConfidence: number;
  jurisdictionUncertain: boolean;
  lotSizeSqFt: number;
  footprintSqFt: number;
  hasGeometry: boolean;
  hasDimensions: boolean;
  hasAttomData: boolean;
  hasOsmData: boolean;
  slope: string;
  parcelShape: string;
  cornerLot: boolean;
  overlays: OverlayDetection[];
  zoning: string;
  rulesVersion: string;
}

export type ConfidenceBand = "high" | "moderate" | "low";

export interface ConfidenceResult {
  score: number;
  band: ConfidenceBand;
  manualReviewRequired: boolean;
  manualReviewReasons: string[];
  positiveSignals: string[];
  negativeSignals: string[];
}

export function calculateConfidence(
  input: ConfidenceInput,
  jurisdiction: JurisdictionProfile
): ConfidenceResult {
  let score = jurisdiction.confidence.confidenceDefault;
  const positiveSignals: string[] = [];
  const negativeSignals: string[] = [];
  const manualReviewReasons: string[] = [];

  // ── Positive signals ──

  // Jurisdiction match confidence
  if (input.jurisdictionConfidence >= 85) {
    score += 8;
    positiveSignals.push("Verified jurisdiction match");
  } else if (input.jurisdictionConfidence >= 60) {
    score += 3;
    positiveSignals.push("Likely jurisdiction match");
  }

  // ATTOM data available (authoritative source)
  if (input.hasAttomData) {
    score += 10;
    positiveSignals.push("ATTOM property data available");
  }

  // OSM data available
  if (input.hasOsmData) {
    score += 5;
    positiveSignals.push("OpenStreetMap building data available");
  }

  // Geometry / dimensions available
  if (input.hasGeometry) {
    score += 5;
    positiveSignals.push("Parcel geometry available");
  }
  if (input.hasDimensions) {
    score += 3;
    positiveSignals.push("Lot dimensions available");
  }

  // Fresh rules
  if (input.rulesVersion) {
    positiveSignals.push(`Regulation profile version: ${input.rulesVersion}`);
    score += 2;
  }

  // Standard lot and shape
  if (input.parcelShape === "Rectangular" || input.parcelShape === "Square") {
    score += 3;
    positiveSignals.push("Standard parcel shape");
  }

  // No overlays
  const detectedOverlays = input.overlays.filter((o) => o.detected);
  if (detectedOverlays.length === 0) {
    score += 5;
    positiveSignals.push("No overlay conflicts detected");
  }

  // ── Negative signals ──

  // Jurisdiction uncertainty
  if (input.jurisdictionUncertain) {
    score -= 15;
    negativeSignals.push("Jurisdiction detection uncertain");
    manualReviewReasons.push("Uncertain jurisdiction boundary");
  }

  // Slope
  // `slope` is the bare category from USGS 3DEP sampling (see
  // elevation-service slopeCategoryFromLabel); tolerate full labels too.
  const slopeCat = (input.slope || "").split("—")[0].trim().toLowerCase();
  if (slopeCat.startsWith("very steep")) {
    score -= 15;
    negativeSignals.push("Very steep slope (>25% measured grade)");
    manualReviewReasons.push(
      "Very steep lot (>25% grade) — geotechnical report and civil/structural engineering needed before quoting a detached ADU"
    );
  } else if (slopeCat.startsWith("steep")) {
    score -= 10;
    negativeSignals.push("Steep slope (15–25% measured grade) — expect foundation, retaining and grading costs");
  } else if (slopeCat.startsWith("moderate")) {
    score -= 5;
    negativeSignals.push("Moderate slope (10–15% measured grade)");
  } else if (slopeCat === "" || slopeCat.startsWith("unavailable") || slopeCat.startsWith("not available")) {
    score -= 3;
    negativeSignals.push("Slope data unavailable (USGS elevation service did not respond)");
  }

  // Missing data
  if (!input.hasAttomData && !input.hasOsmData) {
    score -= 10;
    negativeSignals.push("No authoritative property data sources available");
  }

  if (!input.hasGeometry && !input.hasDimensions) {
    score -= 8;
    negativeSignals.push("Missing parcel geometry and dimensions");
  }

  // Irregular parcel
  if (input.parcelShape !== "Rectangular" && input.parcelShape !== "Square" && input.parcelShape !== "Nearly Rectangular") {
    score -= 5;
    negativeSignals.push("Irregular parcel shape");
    manualReviewReasons.push("Irregular parcel may affect build placement");
  }

  // Corner lot
  if (input.cornerLot) {
    score -= 3;
    negativeSignals.push("Corner lot (additional setback considerations)");
  }

  // Overlay penalties
  for (const overlay of detectedOverlays) {
    if (overlay.type === "coastal") {
      score -= 10;
      negativeSignals.push("Possible coastal zone");
      manualReviewReasons.push("Coastal zone may require CDP review");
    } else if (overlay.type === "hillside") {
      score -= 8;
      negativeSignals.push("Hillside overlay detected");
      manualReviewReasons.push("Hillside overlay may add requirements");
    } else if (overlay.type === "historic") {
      score -= 8;
      negativeSignals.push("Historic district detected");
      manualReviewReasons.push("Historic review may be required");
    } else if (overlay.type === "flood") {
      score -= 10;
      negativeSignals.push("Flood zone detected");
      manualReviewReasons.push("Flood zone restrictions may apply");
    } else if (overlay.type === "fire") {
      score -= 5;
      negativeSignals.push("Fire hazard area");
      manualReviewReasons.push("Fire severity zone requirements may apply");
    }
  }

  // Small lot
  if (input.lotSizeSqFt < 3000) {
    score -= 5;
    negativeSignals.push("Small lot size");
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  // Determine band
  let band: ConfidenceBand;
  if (score >= 85) {
    band = "high";
  } else if (score >= 65) {
    band = "moderate";
  } else {
    band = "low";
  }

  // Manual review required?
  const manualReviewRequired = manualReviewReasons.length > 0 || score < 65;

  return {
    score,
    band,
    manualReviewRequired,
    manualReviewReasons,
    positiveSignals,
    negativeSignals,
  };
}

// Elevation Service — real lot slope for the property "Slope" field.
//
// Source: USGS 3DEP 1 m lidar-derived elevation (free, keyless), sampled on a
// grid across the actual SANDAG parcel polygon (see lidar-elevation-service).
// Google Elevation is used only as a last resort and only when it actually
// answers "OK". When nothing responds the field is honestly "Not available"
// (confidence 0 → status "Unavailable") — never a fabricated "Mostly flat".

import {
  sampleParcelTerrain,
  type LngLatRings,
  type SlopeCategory,
  type SlopeStats,
} from "./lidar-elevation-service";

export const SLOPE_NOT_AVAILABLE = "Not available";

export interface ElevationResult {
  /** Display label, e.g. "Gentle — 6.2% avg slope, ~7 ft change across lot" or "Not available" */
  slope: string;
  confidence: number;
  sources: string[];
  /** Machine-readable details (absent when unavailable) */
  category?: SlopeCategory;
  stats?: SlopeStats;
  available: boolean;
  durationMs: number;
}

/**
 * Map a slope label (new "Category — details" labels, legacy labels, or
 * "Not available") to the bare category string used by feasibility,
 * confidence and constraint engines.
 * Returns "Flat" | "Gentle" | "Moderate" | "Steep" | "Very Steep" | "Unavailable".
 */
export function slopeCategoryFromLabel(label: string | null | undefined): SlopeCategory | "Unavailable" {
  const head = (label ?? "").split("—")[0].trim().toLowerCase();
  if (!head || head.startsWith("not available") || head.startsWith("unavailable") || head.startsWith("unknown")) {
    return "Unavailable";
  }
  if (head.startsWith("very steep")) return "Very Steep";
  if (head.startsWith("steep")) return "Steep";
  if (head.startsWith("moderate")) return "Moderate";
  if (head.startsWith("gentle")) return "Gentle";
  if (head.startsWith("flat") || head.startsWith("mostly flat")) return "Flat";
  return "Unavailable";
}

function fmtPct(v: number): string {
  return `${v.toFixed(1)}%`;
}

export async function getElevationData(
  lat: number,
  lng: number,
  parcelRings?: LngLatRings | null
): Promise<ElevationResult> {
  const res = await sampleParcelTerrain(lat, lng, { parcelRings });

  if (!res.available || !res.stats) {
    return {
      slope: SLOPE_NOT_AVAILABLE,
      confidence: 0,
      sources: ["USGS elevation service unavailable"],
      available: false,
      durationMs: res.durationMs,
    };
  }

  const s = res.stats;
  console.log(
    `[ELEVATION] ${res.sourceLabel} in ${res.durationMs} ms: ${s.category}, avg ${s.averageSlopePercent}% / max ${s.maxSlopePercent}%, Δ${s.elevationChangeFt} ft`
  );
  const where = res.parcelClipped ? "across lot" : "near geocoded point";
  const label = `${s.category} — ${fmtPct(s.averageSlopePercent)} avg slope (max ${fmtPct(
    s.maxSlopePercent
  )}), ~${Math.round(s.elevationChangeFt)} ft elevation change ${where}`;

  const isUSGS = res.provider === "usgs-3dep-imageserver" || res.provider === "usgs-epqs";
  let confidence = isUSGS ? 80 : 65;
  if (isUSGS && res.parcelClipped && s.sampleCount >= 12) confidence = 88;
  else if (isUSGS && res.parcelClipped && s.sampleCount >= 6) confidence = 85;
  if (!res.parcelClipped) confidence -= 10;

  return {
    slope: label,
    confidence,
    sources: [res.sourceLabel],
    category: s.category,
    stats: s,
    available: true,
    durationMs: res.durationMs,
  };
}

// Site Constraint Intelligence Layer
// Analyzes environmental and regulatory conditions affecting property development.
// Runs after zoning determination and before buildable-area calculations.
// Evaluates: flood risk, fire hazard, terrain/slope, coastal zone, easements.
// Every category comes from a real query for THIS parcel (FEMA NFHL, CAL FIRE
// + City fire maps, Coastal Zone boundary, SanGIS recorded easements, USGS
// 3DEP slope). A category that couldn't be checked says "Not available" with
// confidence 0 — it is never assumed to be hazard-free.

import type { ParcelOverlays } from "./hazard-overlay-service";

export interface SiteConstraint {
  category: "flood" | "fire" | "terrain" | "coastal" | "easement";
  classification: string;
  severity: "none" | "low" | "moderate" | "high" | "very-high";
  constructionImpact: string;
  recommendation: string;
  confidence: number;
  source: string;
}

export interface FloodRiskAnalysis {
  floodZone: string;
  floodRisk: "None" | "Low" | "Moderate" | "Elevated" | "High" | "Unknown";
  baseFloodElevation: string | null;
  developmentRestrictions: string;
  source: string;
  /** True when FEMA's map was actually queried for this parcel. */
  checked: boolean;
}

export interface FireHazardAnalysis {
  hazardZone: "None" | "Moderate" | "High" | "Very High" | "Unknown";
  classification: string;
  constructionImplications: string;
  source: string;
  checked: boolean;
}

export interface TerrainAnalysis {
  averageSlopePercent: number;
  terrainClassification: "Flat" | "Gentle" | "Moderate" | "Steep" | "Very Steep" | "Unknown";
  constructionImpact: string;
  costMultiplier: number;
  /** Max slope measured on the lot (%), when measured */
  maxSlopePercent?: number;
  /** Highest minus lowest sampled elevation on the lot (ft), when measured */
  elevationChangeFt?: number;
  /** Slope in the likely ADU area (rear yard), when measured */
  aduAreaSlopePercent?: number | null;
  /** Where the slope numbers came from */
  source: string;
  /** Whether real elevation data backed this analysis */
  measured: boolean;
}

export interface CoastalZoneAnalysis {
  inCoastalZone: boolean;
  permitRequirement: string;
  additionalApprovalLayers: string[];
  source: string;
  checked: boolean;
}

export interface EasementAnalysis {
  possibleEasements: {
    type: string;
    description: string;
    confidence: number;
  }[];
  buildableAreaImpact: string;
  source: string;
  checked: boolean;
}

export type ConstraintRiskLevel = "Low" | "Moderate" | "High";

export interface SiteConstraintResult {
  constraints: SiteConstraint[];
  floodRisk: FloodRiskAnalysis;
  fireHazard: FireHazardAnalysis;
  terrain: TerrainAnalysis;
  coastalZone: CoastalZoneAnalysis;
  easements: EasementAnalysis;
  overallRiskLevel: ConstraintRiskLevel;
  overallRiskScore: number; // 0-100, higher = more constrained
  costAdjustmentPercent: number; // additional cost % from constraints
  timelineAdjustmentMonths: number; // additional months from constraints
  summary: string;
}

interface ConstraintInput {
  lat: number;
  lng: number;
  slopeCategory: string; // from elevation service ("Flat" | "Gentle" | "Moderate" | "Steep" | "Very Steep" | "Unavailable")
  slopePercent: number;
  /** Optional measured terrain details (USGS 3DEP) */
  maxSlopePercent?: number;
  elevationChangeFt?: number;
  aduAreaSlopePercent?: number | null;
  slopeSource?: string;
  jurisdictionId: string;
  formattedAddress: string;
  lotSizeSqFt: number;
  zoning: string;
  hasHillsideOverlay: boolean;
  /** Real per-parcel overlay queries (null when no parcel polygon). */
  overlays: ParcelOverlays | null;
}

// ──────────────────────────────────────────────────────────
// FLOOD RISK — FEMA NFHL queried with the real parcel polygon
// (hazard-overlay-service). Not checked ⇒ says so; never assumed "minimal".
// ──────────────────────────────────────────────────────────

function analyzeFloodRisk(input: ConstraintInput): FloodRiskAnalysis {
  const f = input.overlays?.flood;
  if (!f || !f.available) {
    return {
      floodZone: "Not available",
      floodRisk: "Unknown",
      baseFloodElevation: null,
      developmentRestrictions: "FEMA flood map could not be checked for this parcel — confirm the flood zone at msc.fema.gov.",
      source: f?.source ?? "FEMA National Flood Hazard Layer (not queried)",
      checked: false,
    };
  }
  const bfe = f.baseFloodElevationFt != null ? `${f.baseFloodElevationFt} ft (FEMA static BFE)` : null;
  if (f.anySfha) {
    const centerIsSfha = f.zone != null && f.sfhaZones.includes(f.zone);
    return {
      floodZone: centerIsSfha
        ? `${f.zone} (Special Flood Hazard Area)`
        : `${f.zone ?? "Unmapped"} at lot center; part of the lot touches Zone ${f.sfhaZones.join("/")}`,
      floodRisk: centerIsSfha ? "High" : "Elevated",
      baseFloodElevation: bfe ?? (centerIsSfha ? "Not published — site-specific BFE determination needed" : null),
      developmentRestrictions: centerIsSfha
        ? "Parcel is in a FEMA Special Flood Hazard Area: new habitable floor must be elevated above base flood elevation; flood insurance required with a federally backed mortgage."
        : "Part of the parcel is mapped in a FEMA Special Flood Hazard Area — keep the ADU outside it or elevate; confirm with an elevation certificate.",
      source: f.source,
      checked: true,
    };
  }
  const zone = f.zone ?? "Unmapped";
  const subtype = f.zoneSubtype ? ` — ${f.zoneSubtype.toLowerCase()}` : "";
  const shaded = /0\.2|500/i.test(f.zoneSubtype ?? "");
  return {
    floodZone: `${zone}${subtype}`,
    floodRisk: f.zone ? (shaded ? "Moderate" : "Low") : "Unknown",
    baseFloodElevation: null,
    developmentRestrictions: f.zone
      ? "Outside FEMA's Special Flood Hazard Area — no flood-related building restrictions."
      : "Parcel is not on a FEMA flood map panel — confirm with the City/County floodplain administrator.",
    source: f.source,
    checked: true,
  };
}

// ──────────────────────────────────────────────────────────
// FIRE HAZARD — CAL FIRE LRA/SRA maps + City of San Diego adopted VHFHSZ map
// ──────────────────────────────────────────────────────────

function analyzeFireHazard(input: ConstraintInput): FireHazardAnalysis {
  const f = input.overlays?.fire;
  if (!f || !f.available) {
    return {
      hazardZone: "Unknown",
      classification: "Fire hazard zone not available",
      constructionImplications:
        "The CAL FIRE / City fire hazard maps could not be checked for this parcel — confirm the Fire Hazard Severity Zone before design.",
      source: f?.sources.join("; ") || "CAL FIRE Fire Hazard Severity Zone maps (not queried)",
      checked: false,
    };
  }
  const by = f.determinedBy ? ` (${f.determinedBy})` : "";
  const src = f.sources.join("; ");
  if (f.hazardClass === "Very High") {
    return {
      hazardZone: "Very High",
      classification: `Very High Fire Hazard Severity Zone${by}`,
      constructionImplications:
        "Wildland-urban interface building standards apply (CBC Ch. 7A: ignition-resistant exterior, Class A roof, ember-resistant vents); defensible space required. In the City of San Diego this also means 4 ft ADU side/rear setbacks.",
      source: src,
      checked: true,
    };
  }
  if (f.hazardClass === "High" || f.hazardClass === "Moderate") {
    return {
      hazardZone: f.hazardClass,
      classification: `${f.hazardClass} Fire Hazard Severity Zone${by}`,
      constructionImplications:
        f.responsibilityArea === "SRA" || f.hazardClass === "High"
          ? "Wildland-urban interface building standards (CBC Ch. 7A) likely apply; defensible space required."
          : "Moderate zone — confirm with the local fire authority whether CBC Ch. 7A standards apply.",
      source: src,
      checked: true,
    };
  }
  return {
    hazardZone: "None",
    classification: "Not in a mapped Fire Hazard Severity Zone",
    constructionImplications: "Standard construction codes apply — no wildland-urban interface requirements from the state or City maps.",
    source: src,
    checked: true,
  };
}

// ──────────────────────────────────────────────────────────
// TERRAIN AND SLOPE ANALYSIS
// Enhanced from elevation service data with cost implications
// ──────────────────────────────────────────────────────────

function analyzeTerrain(input: ConstraintInput): TerrainAnalysis {
  const { slopePercent, maxSlopePercent, elevationChangeFt, aduAreaSlopePercent } = input;
  const cat = (input.slopeCategory || "").toLowerCase();
  const unmeasured =
    cat.startsWith("unavailable") || cat.startsWith("not available") || cat.startsWith("unknown") || cat === "";

  if (unmeasured) {
    return {
      averageSlopePercent: 0,
      terrainClassification: "Unknown",
      constructionImpact:
        "Slope could not be measured (USGS elevation service unavailable). Grade, grading and foundation needs must be confirmed by a site survey.",
      costMultiplier: 1.0,
      source: input.slopeSource || "USGS elevation service unavailable",
      measured: false,
    };
  }

  // Measured details appended to the impact text so the report shows real numbers.
  const detailParts: string[] = [];
  if (typeof elevationChangeFt === "number") detailParts.push(`~${Math.round(elevationChangeFt)} ft elevation change across the lot`);
  if (typeof maxSlopePercent === "number") detailParts.push(`max slope ${maxSlopePercent}%`);
  if (typeof aduAreaSlopePercent === "number") detailParts.push(`likely ADU area grade ${aduAreaSlopePercent}%`);
  let detail = detailParts.length ? ` Measured: ${detailParts.join(", ")}.` : "";
  // The likely ADU spot can be steeper than the lot average (e.g. a flat pad
  // with a sloping rear yard) — call that out so the cost note isn't missed.
  const band = (p: number) => (p < 5 ? 0 : p < 10 ? 1 : p < 15 ? 2 : p < 25 ? 3 : 4);
  if (typeof aduAreaSlopePercent === "number" && band(aduAreaSlopePercent) > band(slopePercent)) {
    const aduNote = [
      "",
      "a raised perimeter footing or minor pad grading (typically +$5k–$10k)",
      "stepped footings, grading and possibly low retaining walls (typically +$15k–$25k)",
      "an engineered foundation, retaining walls and grading with civil/structural engineering (typically +$30k–$60k)",
      "drilled piers/caissons and a geotechnical report — manual review recommended (typically +$50k–$100k+)",
    ][band(aduAreaSlopePercent)];
    detail += ` The likely detached-ADU area is steeper (${aduAreaSlopePercent}% grade) and would need ${aduNote}.`;
  }
  const base = {
    averageSlopePercent: slopePercent,
    maxSlopePercent,
    elevationChangeFt,
    aduAreaSlopePercent: aduAreaSlopePercent ?? null,
    source: input.slopeSource || "USGS 3DEP elevation",
    measured: true,
  };

  // Bands: Flat <5, Gentle 5–10, Moderate 10–15, Steep 15–25, Very Steep >25 (% grade)
  if (slopePercent < 5) {
    return {
      ...base,
      terrainClassification: "Flat",
      constructionImpact: `Lot is essentially flat — normal construction conditions.${detail}`,
      costMultiplier: 1.0,
    };
  }

  if (slopePercent < 10) {
    return {
      ...base,
      terrainClassification: "Gentle",
      constructionImpact: `Minor pad grading or a raised perimeter footing may be needed (typically +$5k–$10k).${detail}`,
      costMultiplier: 1.03,
    };
  }

  if (slopePercent < 15) {
    return {
      ...base,
      terrainClassification: "Moderate",
      constructionImpact: `Grading and stepped/engineered footings likely; low retaining walls possible (typically +$15k–$25k).${detail}`,
      costMultiplier: 1.10,
    };
  }

  if (slopePercent < 25) {
    return {
      ...base,
      terrainClassification: "Steep",
      constructionImpact: `Detached ADU on a steep lot: engineered foundation (piers/grade beams), retaining walls, grading and drainage design expected; civil/structural engineering and a soils report likely (typically +$30k–$60k).${detail}`,
      costMultiplier: 1.25,
    };
  }

  return {
    ...base,
    terrainClassification: "Very Steep",
    constructionImpact: `Very steep hillside (>25%): drilled piers/caissons, significant retaining and grading, geotechnical report required; hillside/grading permits may apply. Manual review recommended before quoting (typically +$50k–$100k+).${detail}`,
    costMultiplier: 1.40,
  };
}

// ──────────────────────────────────────────────────────────
// COASTAL ZONE — Coastal Commission boundary queried with the parcel polygon
// ──────────────────────────────────────────────────────────

function analyzeCoastalZone(input: ConstraintInput): CoastalZoneAnalysis {
  const c = input.overlays?.coastal;
  if (!c || !c.available) {
    return {
      inCoastalZone: false,
      checked: false,
      permitRequirement: "Coastal Zone boundary could not be checked — confirm whether a Coastal Development Permit applies.",
      additionalApprovalLayers: [],
      source: c?.source ?? "California Coastal Zone boundary (not queried)",
    };
  }
  if (c.inCoastalZone) {
    return {
      inCoastalZone: true,
      checked: true,
      permitRequirement:
        "Parcel is inside the California Coastal Zone — a Coastal Development Permit (or exemption) is typically required for an ADU.",
      additionalApprovalLayers: [
        "Coastal Development Permit or exemption determination",
        ...(input.jurisdictionId !== "san-diego-city" ? ["Coastal Commission appeal jurisdiction may apply"] : []),
      ],
      source: c.source,
    };
  }
  return {
    inCoastalZone: false,
    checked: true,
    permitRequirement: "Outside the Coastal Zone — no Coastal Development Permit needed.",
    additionalApprovalLayers: [],
    source: c.source,
  };
}

// ──────────────────────────────────────────────────────────
// EASEMENTS — only RECORDED open-space/conservation easements are public GIS
// data. Utility/access/drainage easements live in the title report; we never
// guess them.
// ──────────────────────────────────────────────────────────

function analyzeEasements(input: ConstraintInput): EasementAnalysis {
  const e = input.overlays?.recordedEasements;
  const titleNote = "Utility, access and drainage easements are only shown on a title report / survey (not checked here).";
  if (!e || !e.available) {
    return {
      possibleEasements: [],
      checked: false,
      buildableAreaImpact: `Recorded easement map could not be checked. ${titleNote}`,
      source: e?.source ?? "SanGIS recorded easements (not queried)",
    };
  }
  return {
    possibleEasements: e.easements.map((x) => ({
      type: "open-space",
      description: `Recorded open-space/conservation-type easement overlapping the parcel${x.docNumber ? ` (Doc. ${x.docNumber}` : ""}${x.recordedDate ? `${x.docNumber ? ", " : " ("}recorded ${x.recordedDate})` : x.docNumber ? ")" : ""}.`,
      confidence: 80,
    })),
    checked: true,
    buildableAreaImpact:
      e.easements.length > 0
        ? `A recorded open-space/conservation easement overlaps this parcel — no building is allowed inside it; its exact location must be confirmed on the recorded document. ${titleNote}`
        : `No recorded open-space/conservation easement on this parcel. ${titleNote}`,
    source: e.source,
  };
}

// ──────────────────────────────────────────────────────────
// BUILD SITE CONSTRAINTS INTO UNIFIED RESULT
// ──────────────────────────────────────────────────────────

function buildConstraints(
  flood: FloodRiskAnalysis,
  fire: FireHazardAnalysis,
  terrain: TerrainAnalysis,
  coastal: CoastalZoneAnalysis,
  easements: EasementAnalysis,
): SiteConstraint[] {
  const constraints: SiteConstraint[] = [];

  // Flood constraint
  const floodSeverityMap: Record<FloodRiskAnalysis["floodRisk"], SiteConstraint["severity"]> = {
    None: "none",
    Low: "none",
    Moderate: "low",
    Elevated: "moderate",
    High: "high",
    Unknown: "none",
  };
  constraints.push({
    category: "flood",
    classification: flood.checked ? `FEMA Flood Zone: ${flood.floodZone}` : "Flood zone not available",
    severity: floodSeverityMap[flood.floodRisk] || "none",
    constructionImpact: flood.developmentRestrictions,
    recommendation: !flood.checked
      ? "Look up the parcel on FEMA's Flood Map Service Center (msc.fema.gov) before design."
      : flood.floodRisk === "High" || flood.floodRisk === "Elevated"
        ? "Get an elevation certificate and plan the ADU floor above base flood elevation."
        : "No action needed.",
    confidence: flood.checked ? 90 : 0,
    source: flood.source,
  });

  // Fire constraint
  const fireSeverityMap: Record<FireHazardAnalysis["hazardZone"], SiteConstraint["severity"]> = {
    None: "none",
    Moderate: "low",
    High: "moderate",
    "Very High": "high",
    Unknown: "none",
  };
  constraints.push({
    category: "fire",
    classification: fire.classification,
    severity: fireSeverityMap[fire.hazardZone] || "none",
    constructionImpact: fire.constructionImplications,
    recommendation: !fire.checked
      ? "Confirm the Fire Hazard Severity Zone with the local fire authority before design."
      : fire.hazardZone === "None"
        ? "No additional fire safety measures required."
        : "Design to wildland-urban interface standards (ignition-resistant materials, defensible space).",
    confidence: fire.checked ? 90 : 0,
    source: fire.source,
  });

  // Terrain constraint
  const terrainSeverityMap: Record<string, SiteConstraint["severity"]> = {
    Flat: "none",
    Gentle: "none",
    Moderate: "low",
    Steep: "moderate",
    "Very Steep": "high",
    Unknown: "none",
  };
  constraints.push({
    category: "terrain",
    classification: terrain.measured
      ? `${terrain.terrainClassification} (${terrain.averageSlopePercent}% avg slope)`
      : "Slope not available",
    severity: terrainSeverityMap[terrain.terrainClassification] || "none",
    constructionImpact: terrain.constructionImpact,
    recommendation: !terrain.measured
      ? "Confirm grade with a site survey before finalizing foundation and grading scope."
      : terrain.terrainClassification === "Flat" || terrain.terrainClassification === "Gentle"
      ? "Standard foundation design acceptable."
      : terrain.terrainClassification === "Very Steep"
      ? "Manual review required: geotechnical report and civil/structural engineering before pricing a detached ADU."
      : "Geotechnical report recommended. Budget for engineered foundation, grading and retaining.",
    confidence: terrain.measured ? 85 : 0,
    source: terrain.source,
  });

  // Coastal constraint
  constraints.push({
    category: "coastal",
    classification: !coastal.checked ? "Coastal Zone not available" : coastal.inCoastalZone ? "In the Coastal Zone" : "Outside the Coastal Zone",
    severity: coastal.inCoastalZone ? "moderate" : "none",
    constructionImpact: coastal.inCoastalZone
      ? "Coastal Development Permit review adds time to approval (commonly 2–6 months)."
      : coastal.checked
        ? "No coastal-related impact."
        : "Not checked.",
    recommendation: coastal.permitRequirement,
    confidence: coastal.checked ? 90 : 0,
    source: coastal.source,
  });

  // Easement constraint (recorded open-space/conservation easements only)
  const recorded = easements.possibleEasements.length;
  constraints.push({
    category: "easement",
    classification: !easements.checked
      ? "Recorded easements not available"
      : recorded > 0
        ? `${recorded} recorded open-space/conservation easement(s) on the parcel`
        : "No recorded open-space/conservation easement",
    severity: recorded > 0 ? "moderate" : "none",
    constructionImpact: easements.buildableAreaImpact,
    recommendation:
      recorded > 0
        ? "Pull the recorded easement document and a survey to locate it before siting the ADU."
        : "A preliminary title report will show any utility/access easements.",
    confidence: easements.checked ? 80 : 0,
    source: easements.source,
  });

  return constraints;
}

// ──────────────────────────────────────────────────────────
// OVERALL RISK SCORING
// ──────────────────────────────────────────────────────────

function calculateOverallRisk(constraints: SiteConstraint[]): {
  riskLevel: ConstraintRiskLevel;
  riskScore: number;
  costAdjustmentPercent: number;
  timelineAdjustmentMonths: number;
} {
  const severityScores: Record<SiteConstraint["severity"], number> = {
    "none": 0,
    "low": 10,
    "moderate": 25,
    "high": 45,
    "very-high": 65,
  };

  let totalScore = 0;
  let costAdjustment = 0;
  let timelineAdjustment = 0;

  for (const c of constraints) {
    totalScore += severityScores[c.severity];

    // No blanket % cost markup: measured-slope foundation cost is already
    // priced into the build estimate (adu-fit-rules siteCostUsd), and flood/
    // fire/coastal cost impacts are design-specific, so they're described in
    // words rather than invented as a percentage.
    costAdjustment += 0;

    // Timeline adjustments (planning estimates for extra review steps)
    if (c.category === "coastal" && c.severity !== "none") timelineAdjustment += 3;
    if (c.category === "flood" && (c.severity === "moderate" || c.severity === "high")) timelineAdjustment += 1;
  }

  // Normalize score to 0-100
  const maxPossibleScore = constraints.length * 65;
  const normalizedScore = Math.round((totalScore / maxPossibleScore) * 100);

  // Any single high-severity condition (e.g. a Very High fire zone or a
  // mapped flood zone) makes the overall picture at least Moderate.
  const worst = constraints.some((c) => c.severity === "high" || c.severity === "very-high");
  const riskLevel: ConstraintRiskLevel =
    normalizedScore >= 40 ? "High" : normalizedScore >= 15 || worst ? "Moderate" : "Low";

  return {
    riskLevel,
    riskScore: normalizedScore,
    costAdjustmentPercent: costAdjustment,
    timelineAdjustmentMonths: timelineAdjustment,
  };
}

// ──────────────────────────────────────────────────────────
// MAIN ENTRY POINT
// ──────────────────────────────────────────────────────────

export function analyzeSiteConstraints(input: ConstraintInput): SiteConstraintResult {
  const floodRisk = analyzeFloodRisk(input);
  const fireHazard = analyzeFireHazard(input);
  const terrain = analyzeTerrain(input);
  const coastalZone = analyzeCoastalZone(input);
  const easements = analyzeEasements(input);

  const constraints = buildConstraints(floodRisk, fireHazard, terrain, coastalZone, easements);
  const risk = calculateOverallRisk(constraints);

  // Generate human-readable summary
  const activeConstraints = constraints.filter((c) => c.severity !== "none");
  const summary = activeConstraints.length === 0
    ? "No significant site constraints detected. Standard construction conditions expected."
    : `${activeConstraints.length} site constraint(s) identified: ${activeConstraints.map((c) => `${c.category} (${c.severity})`).join(", ")}. ${risk.riskLevel} overall constraint risk.`;

  return {
    constraints,
    floodRisk,
    fireHazard,
    terrain,
    coastalZone,
    easements,
    overallRiskLevel: risk.riskLevel,
    overallRiskScore: risk.riskScore,
    costAdjustmentPercent: risk.costAdjustmentPercent,
    timelineAdjustmentMonths: risk.timelineAdjustmentMonths,
    summary,
  };
}

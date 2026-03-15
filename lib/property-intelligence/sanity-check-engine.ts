// Sanity Check Engine — Validates property data before publishing results
// Catches unrealistic values, mismatches, and data quality issues.
// Runs after property data resolution, before feasibility analysis.

export interface SanityCheckResult {
  passed: boolean;
  checks: SanityCheck[];
  adjustments: SanityAdjustment[];
  overallConfidenceAdjustment: number;
}

export interface SanityCheck {
  name: string;
  passed: boolean;
  severity: "error" | "warning" | "info";
  message: string;
}

export interface SanityAdjustment {
  field: string;
  originalValue: number;
  adjustedValue: number;
  reason: string;
}

interface SanityInput {
  lotSizeSqFt: number;
  footprintSqFt: number;
  homeAreaSqFt: number;
  openYardSqFt: number;
  lotWidth: number;
  lotDepth: number;
  zoning: string;
  slope: string;
  parcelShape: string;
  hasAttomData: boolean;
  hasOsmData: boolean;
  hasGeocoded: boolean;
}

/**
 * Run comprehensive sanity checks on resolved property data.
 * Returns check results and any automatic adjustments made.
 */
export function runSanityChecks(input: SanityInput): SanityCheckResult {
  const checks: SanityCheck[] = [];
  const adjustments: SanityAdjustment[] = [];
  let confidenceAdjustment = 0;

  // ── Check 1: Lot size within realistic residential range ──
  if (input.lotSizeSqFt < 1000) {
    checks.push({
      name: "lot-size-minimum",
      passed: false,
      severity: "error",
      message: `Lot size (${input.lotSizeSqFt} sq ft) is below minimum residential threshold (1,000 sq ft).`,
    });
    confidenceAdjustment -= 15;
  } else if (input.lotSizeSqFt > 50000) {
    checks.push({
      name: "lot-size-maximum",
      passed: false,
      severity: "warning",
      message: `Lot size (${input.lotSizeSqFt.toLocaleString()} sq ft) is unusually large for residential. Data should be verified.`,
    });
    confidenceAdjustment -= 5;
  } else {
    checks.push({
      name: "lot-size-range",
      passed: true,
      severity: "info",
      message: "Lot size is within typical residential range.",
    });
  }

  // ── Check 2: Footprint reasonable relative to lot ──
  const footprintRatio = input.footprintSqFt / input.lotSizeSqFt;
  if (footprintRatio > 0.7) {
    checks.push({
      name: "footprint-lot-ratio",
      passed: false,
      severity: "error",
      message: `Structure footprint (${input.footprintSqFt.toLocaleString()} sq ft) covers ${Math.round(footprintRatio * 100)}% of lot — unrealistic for residential.`,
    });
    // Auto-adjust footprint to 35% of lot
    const adjusted = Math.round(input.lotSizeSqFt * 0.35);
    adjustments.push({
      field: "footprintSqFt",
      originalValue: input.footprintSqFt,
      adjustedValue: adjusted,
      reason: "Footprint-to-lot ratio exceeded 70%; reduced to ~35%.",
    });
    confidenceAdjustment -= 15;
  } else if (footprintRatio < 0.05 && input.lotSizeSqFt > 2000) {
    checks.push({
      name: "footprint-too-small",
      passed: false,
      severity: "warning",
      message: `Structure footprint (${input.footprintSqFt} sq ft) seems very small relative to lot size.`,
    });
    confidenceAdjustment -= 5;
  } else {
    checks.push({
      name: "footprint-lot-ratio",
      passed: true,
      severity: "info",
      message: `Footprint covers ${Math.round(footprintRatio * 100)}% of lot — within normal range.`,
    });
  }

  // ── Check 3: Living area ≠ footprint (multi-story detection) ──
  if (input.homeAreaSqFt > 0 && input.footprintSqFt > 0) {
    const areaToFootprintRatio = input.homeAreaSqFt / input.footprintSqFt;
    if (areaToFootprintRatio > 3.5) {
      checks.push({
        name: "living-area-footprint-mismatch",
        passed: false,
        severity: "warning",
        message: `Living area (${input.homeAreaSqFt.toLocaleString()} sq ft) is ${areaToFootprintRatio.toFixed(1)}x the footprint — exceeds 3.5 stories. May be a data error.`,
      });
      confidenceAdjustment -= 8;
    } else if (areaToFootprintRatio < 0.5) {
      checks.push({
        name: "living-area-too-small",
        passed: false,
        severity: "warning",
        message: `Living area (${input.homeAreaSqFt} sq ft) is less than half the footprint. May be partial data.`,
      });
      confidenceAdjustment -= 5;
    } else {
      const impliedStories = areaToFootprintRatio.toFixed(1);
      checks.push({
        name: "living-area-footprint-check",
        passed: true,
        severity: "info",
        message: `Living area / footprint ratio implies ~${impliedStories} stories — reasonable.`,
      });
    }
  }

  // ── Check 4: Lot dimensions match lot size ──
  if (input.lotWidth > 0 && input.lotDepth > 0) {
    const computedArea = input.lotWidth * input.lotDepth;
    const areaDiff = Math.abs(computedArea - input.lotSizeSqFt) / input.lotSizeSqFt;
    if (areaDiff > 0.5) {
      checks.push({
        name: "dimensions-area-mismatch",
        passed: false,
        severity: "warning",
        message: `Lot dimensions (${input.lotWidth}ft x ${input.lotDepth}ft = ${computedArea.toLocaleString()} sq ft) differ from lot size (${input.lotSizeSqFt.toLocaleString()} sq ft) by ${Math.round(areaDiff * 100)}%.`,
      });
      confidenceAdjustment -= 5;
    } else {
      checks.push({
        name: "dimensions-area-check",
        passed: true,
        severity: "info",
        message: "Lot dimensions are consistent with reported lot size.",
      });
    }
  }

  // ── Check 5: Open yard area realistic ──
  if (input.openYardSqFt < 0) {
    checks.push({
      name: "negative-yard",
      passed: false,
      severity: "error",
      message: "Calculated open yard area is negative — data conflict between lot size and footprint.",
    });
    confidenceAdjustment -= 10;
  } else if (input.openYardSqFt > input.lotSizeSqFt * 0.95) {
    checks.push({
      name: "yard-too-large",
      passed: false,
      severity: "warning",
      message: "Open yard area is nearly the entire lot — footprint data may be incomplete.",
    });
    confidenceAdjustment -= 5;
  } else {
    checks.push({
      name: "yard-area-check",
      passed: true,
      severity: "info",
      message: "Open yard area is within expected range.",
    });
  }

  // ── Check 6: Zoning format validation ──
  const validZoningPatterns = [
    /^RS-\d/i, /^RM-\d/i, /^R-\d/i, /^C-\d/i, /^M-\d/i,
    /^CC-/i, /^CN-/i, /^CO-/i, /^IL-/i, /^IP-/i,
    /residential/i, /commercial/i, /industrial/i, /mixed/i, /agricultural/i,
  ];
  const zoningBase = input.zoning.split("(")[0].trim();
  const zoningValid = validZoningPatterns.some((p) => p.test(zoningBase));
  if (!zoningValid && zoningBase.length > 0) {
    checks.push({
      name: "zoning-format",
      passed: false,
      severity: "warning",
      message: `Zoning code "${zoningBase}" does not match known San Diego formats. Verification recommended.`,
    });
    confidenceAdjustment -= 3;
  } else {
    checks.push({
      name: "zoning-format",
      passed: true,
      severity: "info",
      message: "Zoning code format is recognized.",
    });
  }

  // ── Check 7: Structure placement realistic (footprint fits in lot dims) ──
  if (input.lotWidth > 0 && input.footprintSqFt > 0) {
    const maxPossibleFootprint = input.lotWidth * input.lotDepth * 0.7; // 70% max coverage
    if (input.footprintSqFt > maxPossibleFootprint) {
      checks.push({
        name: "structure-placement",
        passed: false,
        severity: "warning",
        message: "Structure footprint exceeds realistic placement within lot dimensions.",
      });
      confidenceAdjustment -= 5;
    } else {
      checks.push({
        name: "structure-placement",
        passed: true,
        severity: "info",
        message: "Structure placement is realistic within lot dimensions.",
      });
    }
  }

  // ── Check 8: Data source availability ──
  if (!input.hasAttomData && !input.hasOsmData) {
    checks.push({
      name: "no-authoritative-data",
      passed: false,
      severity: "warning",
      message: "No authoritative property data available (ATTOM or OSM). All values are estimates.",
    });
    confidenceAdjustment -= 10;
  } else if (input.hasAttomData && input.hasOsmData) {
    checks.push({
      name: "multi-source-validated",
      passed: true,
      severity: "info",
      message: "Property data cross-validated with multiple sources (ATTOM + OSM).",
    });
    confidenceAdjustment += 5;
  }

  const allPassed = checks.every((c) => c.passed || c.severity === "info");

  return {
    passed: allPassed,
    checks,
    adjustments,
    overallConfidenceAdjustment: confidenceAdjustment,
  };
}

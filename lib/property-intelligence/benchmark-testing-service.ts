// Known-Property Benchmark Testing System
// Validates the analysis engine against properties with known characteristics.
//
// Purpose:
//   - Verify that the pipeline produces accurate results for known addresses
//   - Detect regression when code changes are made
//   - Compare API-sourced data against ground-truth values
//   - Quantify confidence scoring accuracy
//
// Usage:
//   - Call `runBenchmarkSuite()` to test all known properties
//   - Call `runSingleBenchmark(address)` to test one property
//   - Call `getBenchmarkProperties()` to list all benchmark addresses

export interface BenchmarkProperty {
  /** Street address */
  address: string;
  /** Known ground-truth values */
  known: {
    lotSizeSqFt?: number;
    homeAreaSqFt?: number;
    footprintSqFt?: number;
    yearBuilt?: number;
    bedrooms?: number;
    bathrooms?: number;
    stories?: number;
    zoning?: string;
    slope?: string;
    /** Whether ADU construction is known to be feasible */
    aduFeasible?: boolean;
    /** Known number of structures on parcel */
    structureCount?: number;
    /** Approximate lot width */
    lotWidthFt?: number;
    /** Approximate lot depth */
    lotDepthFt?: number;
  };
  /** Acceptable tolerance for numeric comparisons (percentage, 0-1) */
  tolerance: number;
  /** Notes about this property */
  notes: string;
}

export interface BenchmarkFieldResult {
  field: string;
  knownValue: string | number;
  reportedValue: string | number | null;
  withinTolerance: boolean;
  percentDiff: number | null;
  tolerance: number;
}

export interface BenchmarkResult {
  address: string;
  passed: boolean;
  /** Individual field comparisons */
  fields: BenchmarkFieldResult[];
  /** Number of fields that matched */
  matchedFields: number;
  /** Total number of fields compared */
  totalFields: number;
  /** Match percentage */
  matchPercent: number;
  /** Confidence score reported by the engine */
  reportedConfidence: number | null;
  /** Execution time in milliseconds */
  executionTimeMs: number;
  /** Errors encountered during analysis */
  errors: string[];
}

export interface BenchmarkSuiteResult {
  /** When the suite was run */
  timestamp: string;
  /** Total benchmark properties tested */
  totalProperties: number;
  /** Properties that passed all field checks */
  passedProperties: number;
  /** Properties that failed one or more field checks */
  failedProperties: number;
  /** Properties that errored during analysis */
  erroredProperties: number;
  /** Overall pass rate (0-100) */
  passRate: number;
  /** Average field match rate across all properties */
  averageFieldMatchRate: number;
  /** Individual property results */
  results: BenchmarkResult[];
  /** Suite execution time in milliseconds */
  totalExecutionTimeMs: number;
  /** Summary of common failures */
  commonFailures: { field: string; failureCount: number }[];
}

// ── Known benchmark properties (San Diego area) ──
// These are real addresses with publicly verifiable property data.
// Ground-truth values are sourced from county assessor records.

const BENCHMARK_PROPERTIES: BenchmarkProperty[] = [
  {
    address: "4024 Brant St, San Diego, CA 92103",
    known: {
      lotSizeSqFt: 5000,
      homeAreaSqFt: 1200,
      stories: 1,
      zoning: "RS-1-7",
      slope: "Mostly flat",
      aduFeasible: true,
      structureCount: 1,
    },
    tolerance: 0.20,
    notes: "Hillcrest single-family, typical urban residential lot",
  },
  {
    address: "3643 Kite St, San Diego, CA 92103",
    known: {
      lotSizeSqFt: 5700,
      homeAreaSqFt: 1100,
      stories: 1,
      slope: "Mostly flat",
      aduFeasible: true,
    },
    tolerance: 0.20,
    notes: "Hillcrest area, standard lot",
  },
  {
    address: "1445 Island Ave, San Diego, CA 92101",
    known: {
      lotSizeSqFt: 3000,
      stories: 1,
      slope: "Flat",
      aduFeasible: true,
    },
    tolerance: 0.25,
    notes: "East Village, smaller urban lot — tests tight-lot feasibility",
  },
  {
    address: "4657 34th St, San Diego, CA 92116",
    known: {
      lotSizeSqFt: 6200,
      homeAreaSqFt: 1400,
      stories: 1,
      slope: "Mostly flat",
      aduFeasible: true,
      structureCount: 2,
    },
    tolerance: 0.20,
    notes: "Normal Heights, has existing detached garage — tests multi-structure detection",
  },
  {
    address: "2550 5th Ave, San Diego, CA 92103",
    known: {
      lotSizeSqFt: 4500,
      stories: 2,
      slope: "Moderate slope",
      aduFeasible: true,
    },
    tolerance: 0.25,
    notes: "Hillcrest hillside property — tests slope detection and feasibility on grade",
  },
];

/**
 * Get the list of known benchmark properties.
 */
export function getBenchmarkProperties(): BenchmarkProperty[] {
  return BENCHMARK_PROPERTIES;
}

/**
 * Run benchmark analysis for a single property.
 * This calls the analysis engine and compares results against known values.
 *
 * Note: This imports analyzeProperty dynamically to avoid circular dependencies.
 */
export async function runSingleBenchmark(
  benchmarkAddress: string
): Promise<BenchmarkResult> {
  const benchmark = BENCHMARK_PROPERTIES.find(
    (b) => b.address.toLowerCase() === benchmarkAddress.toLowerCase()
  );

  if (!benchmark) {
    return {
      address: benchmarkAddress,
      passed: false,
      fields: [],
      matchedFields: 0,
      totalFields: 0,
      matchPercent: 0,
      reportedConfidence: null,
      executionTimeMs: 0,
      errors: [`Address "${benchmarkAddress}" not found in benchmark set`],
    };
  }

  return runBenchmarkForProperty(benchmark);
}

/**
 * Run the full benchmark suite against all known properties.
 */
export async function runBenchmarkSuite(): Promise<BenchmarkSuiteResult> {
  const startTime = Date.now();
  const results: BenchmarkResult[] = [];

  for (const benchmark of BENCHMARK_PROPERTIES) {
    try {
      const result = await runBenchmarkForProperty(benchmark);
      results.push(result);
    } catch (err) {
      results.push({
        address: benchmark.address,
        passed: false,
        fields: [],
        matchedFields: 0,
        totalFields: 0,
        matchPercent: 0,
        reportedConfidence: null,
        executionTimeMs: 0,
        errors: [`Benchmark failed with error: ${err instanceof Error ? err.message : String(err)}`],
      });
    }
  }

  const passedProperties = results.filter((r) => r.passed).length;
  const erroredProperties = results.filter((r) => r.errors.length > 0).length;
  const failedProperties = results.length - passedProperties;

  // Count common field failures
  const fieldFailures = new Map<string, number>();
  for (const result of results) {
    for (const field of result.fields) {
      if (!field.withinTolerance) {
        fieldFailures.set(field.field, (fieldFailures.get(field.field) || 0) + 1);
      }
    }
  }
  const commonFailures = Array.from(fieldFailures.entries())
    .map(([field, count]) => ({ field, failureCount: count }))
    .sort((a, b) => b.failureCount - a.failureCount);

  const avgFieldMatchRate =
    results.length > 0
      ? results.reduce((sum, r) => sum + r.matchPercent, 0) / results.length
      : 0;

  return {
    timestamp: new Date().toISOString(),
    totalProperties: results.length,
    passedProperties,
    failedProperties,
    erroredProperties,
    passRate: results.length > 0 ? Math.round((passedProperties / results.length) * 100) : 0,
    averageFieldMatchRate: Math.round(avgFieldMatchRate),
    results,
    totalExecutionTimeMs: Date.now() - startTime,
    commonFailures,
  };
}

/**
 * Internal: Run benchmark for a single known property.
 */
async function runBenchmarkForProperty(
  benchmark: BenchmarkProperty
): Promise<BenchmarkResult> {
  const startTime = Date.now();
  const errors: string[] = [];

  try {
    // Dynamic import to avoid circular dependency
    const { analyzeProperty } = await import("./analysis-engine");
    const result = await analyzeProperty(benchmark.address);
    const executionTimeMs = Date.now() - startTime;

    const fields: BenchmarkFieldResult[] = [];
    const known = benchmark.known;

    // Compare lot size
    if (known.lotSizeSqFt !== undefined) {
      const reported = result.property.lotSizeSqFt.value;
      fields.push(
        compareNumeric("lotSizeSqFt", known.lotSizeSqFt, reported, benchmark.tolerance)
      );
    }

    // Compare home area
    if (known.homeAreaSqFt !== undefined) {
      const reported = result.property.homeAreaSqFt.value;
      fields.push(
        compareNumeric("homeAreaSqFt", known.homeAreaSqFt, reported, benchmark.tolerance)
      );
    }

    // Compare footprint
    if (known.footprintSqFt !== undefined) {
      const reported = result.property.footprintSqFt.value;
      fields.push(
        compareNumeric("footprintSqFt", known.footprintSqFt, reported, benchmark.tolerance)
      );
    }

    // Compare stories
    if (known.stories !== undefined && result.geometryAnalysis) {
      const mainStructure = result.geometryAnalysis.structures[0];
      const reported = mainStructure?.levels || 1;
      fields.push(
        compareNumeric("stories", known.stories, reported, 0) // Exact match for stories
      );
    }

    // Compare slope
    if (known.slope !== undefined) {
      const reported = result.property.slope.value;
      const match = normalizeSlope(known.slope) === normalizeSlope(reported);
      fields.push({
        field: "slope",
        knownValue: known.slope,
        reportedValue: reported,
        withinTolerance: match,
        percentDiff: null,
        tolerance: 0,
      });
    }

    // Compare structure count
    if (known.structureCount !== undefined && result.geometryAnalysis) {
      const reported = result.geometryAnalysis.structures.length;
      fields.push(
        compareNumeric("structureCount", known.structureCount, reported, 0.5)
      );
    }

    // Compare ADU feasibility
    if (known.aduFeasible !== undefined) {
      const feasible =
        result.enhancedFeasibility?.some(
          (f) => f.feasibility === "likely" || f.feasibility === "possible"
        ) || false;
      fields.push({
        field: "aduFeasible",
        knownValue: known.aduFeasible ? "yes" : "no",
        reportedValue: feasible ? "yes" : "no",
        withinTolerance: feasible === known.aduFeasible,
        percentDiff: null,
        tolerance: 0,
      });
    }

    const matchedFields = fields.filter((f) => f.withinTolerance).length;
    const totalFields = fields.length;
    const matchPercent = totalFields > 0 ? Math.round((matchedFields / totalFields) * 100) : 100;

    // Pass if >=70% of fields match
    const passed = matchPercent >= 70;

    return {
      address: benchmark.address,
      passed,
      fields,
      matchedFields,
      totalFields,
      matchPercent,
      reportedConfidence: result.confidenceScore || null,
      executionTimeMs,
      errors,
    };
  } catch (err) {
    return {
      address: benchmark.address,
      passed: false,
      fields: [],
      matchedFields: 0,
      totalFields: 0,
      matchPercent: 0,
      reportedConfidence: null,
      executionTimeMs: Date.now() - startTime,
      errors: [`Analysis failed: ${err instanceof Error ? err.message : String(err)}`],
    };
  }
}

function compareNumeric(
  field: string,
  known: number,
  reported: number | null,
  tolerance: number
): BenchmarkFieldResult {
  if (reported === null || reported === undefined) {
    return {
      field,
      knownValue: known,
      reportedValue: null,
      withinTolerance: false,
      percentDiff: null,
      tolerance,
    };
  }

  const diff = Math.abs(reported - known);
  const percentDiff = known > 0 ? diff / known : reported === 0 ? 0 : 1;

  return {
    field,
    knownValue: known,
    reportedValue: reported,
    withinTolerance: percentDiff <= tolerance,
    percentDiff: Math.round(percentDiff * 100),
    tolerance: Math.round(tolerance * 100),
  };
}

function normalizeSlope(slope: string): string {
  const lower = slope.toLowerCase().trim();
  if (lower.includes("flat") && !lower.includes("mostly")) return "flat";
  if (lower.includes("mostly flat")) return "mostly-flat";
  if (lower.includes("moderate")) return "moderate";
  if (lower.includes("steep") && !lower.includes("very")) return "steep";
  if (lower.includes("very steep")) return "very-steep";
  return lower;
}

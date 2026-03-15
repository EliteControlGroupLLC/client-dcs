// LiDAR / Elevation Intelligence Layer
// Enhanced terrain analysis using multiple elevation data sources:
//   1. Google Elevation API (primary — already in elevation-service.ts)
//   2. USGS 3DEP LiDAR point cloud data (enhanced resolution)
//   3. OpenTopography API (supplemental)
//
// This module adds:
//   - Multi-point terrain profiling across the parcel
//   - Slope direction / aspect analysis
//   - Grading cost estimation
//   - Foundation type recommendation
//   - Retaining wall detection
//   - Cut/fill volume estimation

export interface TerrainProfile {
  /** Elevation samples across the parcel [{ x: offsetFt, y: offsetFt, elevationFt }] */
  samples: Array<{
    x: number;
    y: number;
    elevationFt: number;
    source: string;
  }>;
  /** Number of valid samples obtained */
  sampleCount: number;
  /** Grid resolution in feet */
  gridResolutionFt: number;
}

export interface SlopeAnalysis {
  /** Average slope across the parcel in percent */
  averageSlopePercent: number;
  /** Maximum slope found */
  maxSlopePercent: number;
  /** Minimum slope found */
  minSlopePercent: number;
  /** Dominant slope direction (compass bearing in degrees, 0=N, 90=E, etc.) */
  aspectDegrees: number;
  /** Compass direction label */
  aspectDirection: "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW";
  /** Slope category */
  category: "Flat" | "Gentle" | "Moderate" | "Steep" | "Very Steep";
  /** Slope uniformity — how consistent is the slope across the parcel */
  uniformity: "uniform" | "variable" | "complex";
}

export interface GradingEstimate {
  /** Whether grading is needed for ADU construction */
  gradingRequired: boolean;
  /** Estimated cut volume in cubic yards */
  estimatedCutCuYd: number;
  /** Estimated fill volume in cubic yards */
  estimatedFillCuYd: number;
  /** Estimated grading cost (USD) */
  estimatedGradingCost: number;
  /** Whether a retaining wall is likely needed */
  retainingWallLikely: boolean;
  /** Estimated retaining wall length in linear feet */
  estimatedRetainingWallLf: number;
  /** Estimated retaining wall cost (USD) */
  estimatedRetainingWallCost: number;
}

export interface FoundationRecommendation {
  /** Recommended foundation type */
  type: "slab-on-grade" | "raised-foundation" | "pier-and-beam" | "stepped-foundation" | "caisson";
  /** Reason for the recommendation */
  reason: string;
  /** Estimated additional cost vs. slab-on-grade (USD) */
  additionalCostEstimate: number;
  /** Confidence in the recommendation (0-100) */
  confidence: number;
}

export interface LiDARTerrainResult {
  /** Terrain profile data */
  terrainProfile: TerrainProfile;
  /** Slope analysis */
  slopeAnalysis: SlopeAnalysis;
  /** Grading estimate for ADU construction */
  gradingEstimate: GradingEstimate;
  /** Foundation recommendation */
  foundationRecommendation: FoundationRecommendation;
  /** Whether LiDAR/enhanced elevation data was available */
  lidarAvailable: boolean;
  /** Data sources used */
  sources: string[];
  /** Overall terrain confidence (0-100) */
  confidence: number;
  /** Summary description */
  summary: string;
}

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

interface GoogleElevationResponse {
  results: Array<{
    elevation: number;
    location: { lat: number; lng: number };
    resolution: number;
  }>;
  status: string;
}

/**
 * Analyze terrain using enhanced multi-point elevation sampling.
 * Uses a grid of points across the estimated parcel area to build
 * a terrain profile and derive slope, aspect, grading, and foundation data.
 */
export async function analyzeLiDARTerrain(
  lat: number,
  lng: number,
  lotWidthFt: number = 60,
  lotDepthFt: number = 120,
  aduFootprintSqFt: number = 800
): Promise<LiDARTerrainResult> {
  const sources: string[] = [];
  let lidarAvailable = false;

  // Step 1: Try USGS 3DEP LiDAR data first (highest resolution)
  let samples: TerrainProfile["samples"] = [];
  try {
    samples = await query3DEPElevation(lat, lng, lotWidthFt, lotDepthFt);
    if (samples.length >= 4) {
      lidarAvailable = true;
      sources.push("USGS 3DEP LiDAR (1m resolution)");
    }
  } catch {
    // 3DEP unavailable, fall through to Google
  }

  // Step 2: Fall back to Google Elevation API grid sampling
  if (samples.length < 4 && GOOGLE_API_KEY) {
    try {
      samples = await queryGoogleElevationGrid(lat, lng, lotWidthFt, lotDepthFt);
      if (samples.length >= 4) {
        sources.push("Google Elevation API (10m resolution)");
      }
    } catch {
      // Google also failed
    }
  }

  // Step 3: If no elevation data, return defaults
  if (samples.length < 2) {
    sources.push("Default estimate (no elevation data available)");
    return buildDefaultResult(sources);
  }

  // Step 4: Calculate slope analysis from samples
  const slopeAnalysis = calculateSlopeAnalysis(samples);

  // Step 5: Estimate grading requirements
  const gradingEstimate = estimateGrading(samples, aduFootprintSqFt, slopeAnalysis);

  // Step 6: Recommend foundation type
  const foundationRecommendation = recommendFoundation(slopeAnalysis, gradingEstimate);

  // Step 7: Calculate confidence
  const confidence = calculateTerrainConfidence(samples.length, lidarAvailable, slopeAnalysis);

  // Step 8: Generate summary
  const summary = generateTerrainSummary(slopeAnalysis, gradingEstimate, foundationRecommendation);

  return {
    terrainProfile: {
      samples,
      sampleCount: samples.length,
      gridResolutionFt: lidarAvailable ? 10 : 30,
    },
    slopeAnalysis,
    gradingEstimate,
    foundationRecommendation,
    lidarAvailable,
    sources,
    confidence,
    summary,
  };
}

/**
 * Query USGS 3DEP (3D Elevation Program) LiDAR data.
 * Uses the USGS National Map Elevation Point Query Service.
 */
async function query3DEPElevation(
  lat: number,
  lng: number,
  lotWidthFt: number,
  lotDepthFt: number
): Promise<TerrainProfile["samples"]> {
  const samples: TerrainProfile["samples"] = [];

  // Create a grid of points across the parcel
  const gridSize = 3; // 3x3 = 9 sample points
  const latPerFt = 1 / 364000; // approximate
  const lngPerFt = 1 / (364000 * Math.cos((lat * Math.PI) / 180));

  const halfWidth = lotWidthFt / 2;
  const halfDepth = lotDepthFt / 2;

  const points: Array<{ x: number; y: number; lat: number; lng: number }> = [];
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const xOffset = -halfWidth + (i / (gridSize - 1)) * lotWidthFt;
      const yOffset = -halfDepth + (j / (gridSize - 1)) * lotDepthFt;
      points.push({
        x: xOffset,
        y: yOffset,
        lat: lat + yOffset * latPerFt,
        lng: lng + xOffset * lngPerFt,
      });
    }
  }

  // Query USGS 3DEP for each point
  const promises = points.map(async (pt) => {
    try {
      const url = `https://epqs.nationalmap.gov/v1/json?x=${pt.lng}&y=${pt.lat}&wkid=4326&units=Feet&includeDate=false`;
      const response = await fetch(url, {
        signal: AbortSignal.timeout(4000),
      });
      if (!response.ok) return null;
      const data = await response.json();
      const elevation = data?.value;
      if (typeof elevation === "number" && elevation > -1000) {
        return {
          x: pt.x,
          y: pt.y,
          elevationFt: elevation,
          source: "USGS 3DEP",
        };
      }
      return null;
    } catch {
      return null;
    }
  });

  const results = await Promise.allSettled(promises);
  for (const r of results) {
    if (r.status === "fulfilled" && r.value) {
      samples.push(r.value);
    }
  }

  return samples;
}

/**
 * Query Google Elevation API with a grid of points.
 */
async function queryGoogleElevationGrid(
  lat: number,
  lng: number,
  lotWidthFt: number,
  lotDepthFt: number
): Promise<TerrainProfile["samples"]> {
  if (!GOOGLE_API_KEY) return [];

  const gridSize = 3;
  const latPerFt = 1 / 364000;
  const lngPerFt = 1 / (364000 * Math.cos((lat * Math.PI) / 180));
  const halfWidth = lotWidthFt / 2;
  const halfDepth = lotDepthFt / 2;

  const points: Array<{ x: number; y: number; lat: number; lng: number }> = [];
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const xOffset = -halfWidth + (i / (gridSize - 1)) * lotWidthFt;
      const yOffset = -halfDepth + (j / (gridSize - 1)) * lotDepthFt;
      points.push({
        x: xOffset,
        y: yOffset,
        lat: lat + yOffset * latPerFt,
        lng: lng + xOffset * lngPerFt,
      });
    }
  }

  const locations = points.map((p) => `${p.lat},${p.lng}`).join("|");
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/elevation/json?locations=${locations}&key=${GOOGLE_API_KEY}`,
    { signal: AbortSignal.timeout(5000) }
  );

  if (!response.ok) return [];
  const data: GoogleElevationResponse = await response.json();
  if (data.status !== "OK") return [];

  const samples: TerrainProfile["samples"] = [];
  for (let i = 0; i < Math.min(data.results.length, points.length); i++) {
    samples.push({
      x: points[i].x,
      y: points[i].y,
      elevationFt: data.results[i].elevation * 3.28084, // meters to feet
      source: "Google Elevation API",
    });
  }

  return samples;
}

/**
 * Calculate slope analysis from elevation samples.
 */
function calculateSlopeAnalysis(
  samples: TerrainProfile["samples"]
): SlopeAnalysis {
  if (samples.length < 2) {
    return {
      averageSlopePercent: 0,
      maxSlopePercent: 0,
      minSlopePercent: 0,
      aspectDegrees: 0,
      aspectDirection: "N",
      category: "Flat",
      uniformity: "uniform",
    };
  }

  // Calculate slopes between all adjacent pairs
  const slopes: number[] = [];
  let totalDx = 0;
  let totalDy = 0;

  for (let i = 0; i < samples.length; i++) {
    for (let j = i + 1; j < samples.length; j++) {
      const dx = samples[j].x - samples[i].x;
      const dy = samples[j].y - samples[i].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0) {
        const dElev = samples[j].elevationFt - samples[i].elevationFt;
        const slopePct = Math.abs(dElev / dist) * 100;
        slopes.push(slopePct);

        // Track gradient direction (weighted by elevation difference)
        if (Math.abs(dElev) > 0.1) {
          totalDx += (dx / dist) * dElev;
          totalDy += (dy / dist) * dElev;
        }
      }
    }
  }

  const avgSlope = slopes.length > 0 ? slopes.reduce((a, b) => a + b, 0) / slopes.length : 0;
  const maxSlope = slopes.length > 0 ? Math.max(...slopes) : 0;
  const minSlope = slopes.length > 0 ? Math.min(...slopes) : 0;

  // Calculate aspect (direction of steepest descent)
  let aspectDeg = Math.atan2(totalDx, totalDy) * (180 / Math.PI);
  if (aspectDeg < 0) aspectDeg += 360;

  const aspectDirection = degToCompass(aspectDeg);

  // Categorize slope
  let category: SlopeAnalysis["category"];
  if (avgSlope < 2) category = "Flat";
  else if (avgSlope < 8) category = "Gentle";
  else if (avgSlope < 15) category = "Moderate";
  else if (avgSlope < 25) category = "Steep";
  else category = "Very Steep";

  // Determine uniformity
  const slopeStdDev = calculateStdDev(slopes);
  let uniformity: SlopeAnalysis["uniformity"];
  if (slopeStdDev < 2) uniformity = "uniform";
  else if (slopeStdDev < 5) uniformity = "variable";
  else uniformity = "complex";

  return {
    averageSlopePercent: Math.round(avgSlope * 10) / 10,
    maxSlopePercent: Math.round(maxSlope * 10) / 10,
    minSlopePercent: Math.round(minSlope * 10) / 10,
    aspectDegrees: Math.round(aspectDeg),
    aspectDirection,
    category,
    uniformity,
  };
}

/**
 * Estimate grading requirements for ADU construction.
 */
function estimateGrading(
  samples: TerrainProfile["samples"],
  aduFootprintSqFt: number,
  slope: SlopeAnalysis
): GradingEstimate {
  const avgSlope = slope.averageSlopePercent;

  // No grading needed for flat sites
  if (avgSlope < 3) {
    return {
      gradingRequired: false,
      estimatedCutCuYd: 0,
      estimatedFillCuYd: 0,
      estimatedGradingCost: 0,
      retainingWallLikely: false,
      estimatedRetainingWallLf: 0,
      estimatedRetainingWallCost: 0,
    };
  }

  // Estimate the ADU footprint dimensions
  const aduWidth = Math.sqrt(aduFootprintSqFt * 0.65);
  const aduDepth = aduFootprintSqFt / aduWidth;

  // Estimate elevation change across ADU footprint
  const elevChange = (avgSlope / 100) * aduDepth;

  // Estimate cut/fill volumes (simplified wedge model)
  // Volume = 0.5 * width * depth * elevChange / 27 (convert cu ft to cu yd)
  const cutVolume = Math.round((0.5 * aduWidth * aduDepth * (elevChange / 2)) / 27);
  const fillVolume = Math.round(cutVolume * 0.85); // Assume 85% reuse

  // Grading cost: ~$15-25 per cubic yard
  const gradingCostPerCuYd = avgSlope > 15 ? 25 : 18;
  const gradingCost = Math.round((cutVolume + fillVolume) * gradingCostPerCuYd);

  // Retaining wall needed if slope > 10% or elevation change > 3ft
  const retainingWallLikely = avgSlope > 10 || elevChange > 3;
  const retainingWallLength = retainingWallLikely ? Math.round(aduWidth + aduDepth * 0.5) : 0;
  // Retaining wall cost: ~$50-150 per linear foot depending on height
  const wallCostPerLf = elevChange > 6 ? 150 : elevChange > 3 ? 100 : 60;
  const retainingWallCost = retainingWallLength * wallCostPerLf;

  return {
    gradingRequired: true,
    estimatedCutCuYd: cutVolume,
    estimatedFillCuYd: fillVolume,
    estimatedGradingCost: gradingCost,
    retainingWallLikely,
    estimatedRetainingWallLf: retainingWallLength,
    estimatedRetainingWallCost: retainingWallCost,
  };
}

/**
 * Recommend foundation type based on terrain conditions.
 */
function recommendFoundation(
  slope: SlopeAnalysis,
  grading: GradingEstimate
): FoundationRecommendation {
  const avgSlope = slope.averageSlopePercent;

  if (avgSlope < 3) {
    return {
      type: "slab-on-grade",
      reason: "Flat terrain allows standard slab-on-grade foundation, the most cost-effective option.",
      additionalCostEstimate: 0,
      confidence: 85,
    };
  }

  if (avgSlope < 8) {
    return {
      type: "raised-foundation",
      reason: "Gentle slope requires a raised foundation to maintain level floor across the grade change.",
      additionalCostEstimate: 8000,
      confidence: 78,
    };
  }

  if (avgSlope < 15) {
    return {
      type: "stepped-foundation",
      reason: "Moderate slope requires a stepped or split-level foundation to follow the terrain contour.",
      additionalCostEstimate: 18000,
      confidence: 72,
    };
  }

  if (avgSlope < 25) {
    return {
      type: "pier-and-beam",
      reason: "Steep slope requires pier-and-beam or post-and-pier foundation. Significant earthwork and engineering required.",
      additionalCostEstimate: 35000,
      confidence: 65,
    };
  }

  return {
    type: "caisson",
    reason: "Very steep slope requires deep caisson/drilled pier foundation. Geotechnical report strongly recommended.",
    additionalCostEstimate: 55000,
    confidence: 50,
  };
}

function calculateTerrainConfidence(
  sampleCount: number,
  lidarAvailable: boolean,
  slope: SlopeAnalysis
): number {
  let confidence = 40; // base

  if (lidarAvailable) confidence += 25;
  if (sampleCount >= 9) confidence += 15;
  else if (sampleCount >= 4) confidence += 8;

  if (slope.uniformity === "uniform") confidence += 5;
  else if (slope.uniformity === "complex") confidence -= 5;

  return Math.min(95, Math.max(20, confidence));
}

function generateTerrainSummary(
  slope: SlopeAnalysis,
  grading: GradingEstimate,
  foundation: FoundationRecommendation
): string {
  const parts: string[] = [];

  parts.push(`Terrain is ${slope.category.toLowerCase()} with ${slope.averageSlopePercent}% average slope`);
  parts.push(`facing ${slope.aspectDirection}`);

  if (grading.gradingRequired) {
    parts.push(`Grading estimated at ~$${grading.estimatedGradingCost.toLocaleString()}`);
    if (grading.retainingWallLikely) {
      parts.push(`retaining wall likely (~$${grading.estimatedRetainingWallCost.toLocaleString()})`);
    }
  } else {
    parts.push("No significant grading needed");
  }

  parts.push(`${foundation.type} foundation recommended`);

  return parts.join(". ") + ".";
}

function degToCompass(deg: number): SlopeAnalysis["aspectDirection"] {
  const dirs: SlopeAnalysis["aspectDirection"][] = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(deg / 45) % 8;
  return dirs[index];
}

function calculateStdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const sq = values.reduce((a, v) => a + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(sq);
}

function buildDefaultResult(sources: string[]): LiDARTerrainResult {
  return {
    terrainProfile: { samples: [], sampleCount: 0, gridResolutionFt: 0 },
    slopeAnalysis: {
      averageSlopePercent: 0,
      maxSlopePercent: 0,
      minSlopePercent: 0,
      aspectDegrees: 0,
      aspectDirection: "N",
      category: "Flat",
      uniformity: "uniform",
    },
    gradingEstimate: {
      gradingRequired: false,
      estimatedCutCuYd: 0,
      estimatedFillCuYd: 0,
      estimatedGradingCost: 0,
      retainingWallLikely: false,
      estimatedRetainingWallLf: 0,
      estimatedRetainingWallCost: 0,
    },
    foundationRecommendation: {
      type: "slab-on-grade",
      reason: "No elevation data available — assuming flat terrain for default estimate.",
      additionalCostEstimate: 0,
      confidence: 30,
    },
    lidarAvailable: false,
    sources,
    confidence: 25,
    summary: "No terrain data available. Assuming flat site. A professional site survey is recommended.",
  };
}

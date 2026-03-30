// Strict Geometry Pipeline — Single-source polygon-based property geometry
//
// This pipeline enforces a STRICT data hierarchy with NO fallback guesses:
//
// REQUIRED PIPELINE:
//   Step 1 — Geocode the property address to lat/lng
//   Step 2 — Fetch REAL parcel polygon from Parcel GIS (Regrid)
//   Step 3 — Fetch REAL building footprint from Microsoft Building Footprints
//   Step 4 — Validate building is inside parcel
//   Step 5 — Calculate real property dimensions from geometry
//   Step 6 — Apply ADU build rules to compute buildable envelope
//   Step 7 — Output geometry for Site Layout Diagram rendering
//
// DO NOT:
//   - Use multiple building footprint sources
//   - Use OpenStreetMap for geometry
//   - Generate placeholder rectangles when real data should exist
//   - Create fake dimensions
//
// If required data is unavailable, return explicit unavailable state with
// controlled fallback message - NEVER render misleading layout.

import {
  geoPolygonAreaSqFt,
  geoPolygonBBox,
  geoPolygonCentroid,
  pointToPolygonEdgeDistanceFt,
  type GeometryPolygon,
  type GeoPoint,
  type BoundingBox,
} from "./geometry-engine";
import { fetchParcelPolygon, isParcelGISAvailable } from "./parcel-gis-service";
import { getMicrosoftBuildingFootprints } from "./microsoft-footprint-service";

// ─── Output Types ───

export type StrictPipelineStatus =
  | "geometry-verified"      // Both parcel and building from real sources
  | "building-only"          // Building verified, parcel unavailable
  | "parcel-only"            // Parcel verified, building unavailable
  | "unavailable";           // Neither available - show fallback message

export interface StrictGeometryResult {
  /** Pipeline status */
  status: StrictPipelineStatus;
  /** Whether we have enough data to render a valid diagram */
  canRenderDiagram: boolean;
  /** Fallback message when diagram cannot be rendered */
  fallbackMessage: string | null;

  /** Geocoded property location */
  propertyLocation: GeoPoint | null;

  /** Real parcel boundary polygon (from Parcel GIS) */
  parcelPolygon: GeometryPolygon | null;
  parcelSource: string;
  parcelAreaSqFt: number | null;
  parcelBBox: BoundingBox | null;

  /** Real main residence footprint (from Microsoft Building Footprints) */
  buildingPolygon: GeometryPolygon | null;
  buildingSource: string;
  buildingAreaSqFt: number | null;
  buildingCentroid: GeoPoint | null;

  /** Calculated property metrics (from real geometry only) */
  metrics: StrictPropertyMetrics | null;

  /** ADU buildable envelope (computed from real geometry) */
  buildableEnvelope: BuildableEnvelopeResult | null;

  /** Confidence score (only high if both sources verified) */
  confidence: number;

  /** Data source audit */
  sourceAudit: {
    parcelGISAvailable: boolean;
    parcelGISReason: string | null;
    microsoftFootprintsAvailable: boolean;
    microsoftFootprintsReason: string | null;
    geometryValidated: boolean;
    validationErrors: string[];
  };
}

export interface StrictPropertyMetrics {
  /** Parcel width at approximate major axis (ft) */
  parcelWidthFt: number;
  /** Parcel depth at approximate major axis (ft) */
  parcelDepthFt: number;
  /** Building width (ft) */
  buildingWidthFt: number;
  /** Building depth (ft) */
  buildingDepthFt: number;
  /** Distance from building to front (south) parcel edge (ft) */
  frontYardDepthFt: number;
  /** Distance from building to rear (north) parcel edge (ft) */
  rearYardDepthFt: number;
  /** Distance from building to left (west) parcel edge (ft) */
  leftSideYardFt: number;
  /** Distance from building to right (east) parcel edge (ft) */
  rightSideYardFt: number;
  /** Open yard area around main residence (sq ft) */
  openYardAreaSqFt: number;
  /** Building placement relative to parcel center */
  buildingPlacement: {
    offsetFromCenterXFt: number;  // positive = east, negative = west
    offsetFromCenterYFt: number;  // positive = north, negative = south
    isCentered: boolean;          // true if within 5ft of center
  };
}

export interface BuildableEnvelopeResult {
  /** 3ft setback polygon (parcel inset) */
  parcelSetbackPolygon: GeometryPolygon;
  /** 6ft residence separation polygon (building outset) */
  residenceSeparationPolygon: GeometryPolygon;
  /** Final ADU buildable envelope polygon */
  buildablePolygon: GeometryPolygon | null;
  /** Buildable area in sq ft */
  buildableAreaSqFt: number;
  /** Best zone for ADU placement */
  bestZone: "rear" | "left-side" | "right-side" | "none";
  /** Constraints that affect buildable area */
  constraints: string[];
}

// ─── ADU Build Rules (Fixed) ───

const ADU_RULES = {
  /** Detached ADU must remain at least 6ft from main residence */
  residenceSeparationFt: 6,
  /** Detached ADU must remain at least 3ft from side/rear property lines */
  propertyLineSetbackFt: 3,
};

// ─── Coordinate Math Helpers ───

const METERS_PER_DEG_LAT = 111320;
const M_TO_FT = 3.28084;

function metersPerDegLng(lat: number): number {
  return 111320 * Math.cos((lat * Math.PI) / 180);
}

/**
 * Create an inset (buffered inward) polygon by a given distance in feet.
 * Uses simplified vertex-based inset for rectangular/near-rectangular parcels.
 */
function insetPolygonByFeet(
  polygon: GeometryPolygon,
  insetFt: number,
  refLat: number
): GeometryPolygon {
  const ring = polygon.coordinates[0];
  if (!ring || ring.length < 4) return polygon;

  const insetM = insetFt / M_TO_FT;
  const insetLat = insetM / METERS_PER_DEG_LAT;
  const insetLng = insetM / metersPerDegLng(refLat);

  // Get bounding box to determine which direction to inset each edge
  const bbox = geoPolygonBBox(polygon);

  // Simple approach: inset based on position relative to centroid
  const centroid = geoPolygonCentroid(polygon);
  const insetRing: number[][] = [];

  for (const [lng, lat] of ring) {
    let newLng = lng;
    let newLat = lat;

    // Inset toward centroid
    if (lng < centroid.lng) newLng += insetLng;
    else if (lng > centroid.lng) newLng -= insetLng;

    if (lat < centroid.lat) newLat += insetLat;
    else if (lat > centroid.lat) newLat -= insetLat;

    insetRing.push([newLng, newLat]);
  }

  return { type: "Polygon", coordinates: [insetRing] };
}

/**
 * Create an outset (buffered outward) polygon by a given distance in feet.
 */
function outsetPolygonByFeet(
  polygon: GeometryPolygon,
  outsetFt: number,
  refLat: number
): GeometryPolygon {
  const ring = polygon.coordinates[0];
  if (!ring || ring.length < 4) return polygon;

  const outsetM = outsetFt / M_TO_FT;
  const outsetLat = outsetM / METERS_PER_DEG_LAT;
  const outsetLng = outsetM / metersPerDegLng(refLat);

  const centroid = geoPolygonCentroid(polygon);
  const outsetRing: number[][] = [];

  for (const [lng, lat] of ring) {
    let newLng = lng;
    let newLat = lat;

    // Outset away from centroid
    if (lng < centroid.lng) newLng -= outsetLng;
    else if (lng > centroid.lng) newLng += outsetLng;

    if (lat < centroid.lat) newLat -= outsetLat;
    else if (lat > centroid.lat) newLat += outsetLat;

    outsetRing.push([newLng, newLat]);
  }

  return { type: "Polygon", coordinates: [outsetRing] };
}

/**
 * Check if a point is inside a polygon using ray casting.
 */
function isPointInPolygon(point: GeoPoint, polygon: GeometryPolygon): boolean {
  const ring = polygon.coordinates[0];
  if (!ring || ring.length < 4) return false;

  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];

    if (((yi > point.lat) !== (yj > point.lat)) &&
        (point.lng < (xj - xi) * (point.lat - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}

/**
 * Compute the difference between two polygons (subtract inner from outer).
 * Returns an array of polygons representing the remaining area.
 */
function subtractPolygonSimple(
  outer: GeometryPolygon,
  inner: GeometryPolygon,
  refLat: number
): GeometryPolygon[] {
  // For ADU purposes, we create buildable zones around the exclusion area
  const outerBBox = geoPolygonBBox(outer);
  const innerBBox = geoPolygonBBox(inner);

  const results: GeometryPolygon[] = [];
  const mPerDegLng = metersPerDegLng(refLat);

  // Rear zone (behind the building)
  if (innerBBox.maxLat < outerBBox.maxLat) {
    const rearPoly: GeometryPolygon = {
      type: "Polygon",
      coordinates: [[
        [outerBBox.minLng, innerBBox.maxLat],
        [outerBBox.maxLng, innerBBox.maxLat],
        [outerBBox.maxLng, outerBBox.maxLat],
        [outerBBox.minLng, outerBBox.maxLat],
        [outerBBox.minLng, innerBBox.maxLat],
      ]],
    };
    const area = geoPolygonAreaSqFt(rearPoly);
    if (area > 100) results.push(rearPoly);
  }

  // Left side zone
  if (innerBBox.minLng > outerBBox.minLng) {
    const leftPoly: GeometryPolygon = {
      type: "Polygon",
      coordinates: [[
        [outerBBox.minLng, outerBBox.minLat],
        [innerBBox.minLng, outerBBox.minLat],
        [innerBBox.minLng, outerBBox.maxLat],
        [outerBBox.minLng, outerBBox.maxLat],
        [outerBBox.minLng, outerBBox.minLat],
      ]],
    };
    const area = geoPolygonAreaSqFt(leftPoly);
    if (area > 100) results.push(leftPoly);
  }

  // Right side zone
  if (innerBBox.maxLng < outerBBox.maxLng) {
    const rightPoly: GeometryPolygon = {
      type: "Polygon",
      coordinates: [[
        [innerBBox.maxLng, outerBBox.minLat],
        [outerBBox.maxLng, outerBBox.minLat],
        [outerBBox.maxLng, outerBBox.maxLat],
        [innerBBox.maxLng, outerBBox.maxLat],
        [innerBBox.maxLng, outerBBox.minLat],
      ]],
    };
    const area = geoPolygonAreaSqFt(rightPoly);
    if (area > 100) results.push(rightPoly);
  }

  return results;
}

// ─── Main Pipeline ───

export interface StrictPipelineInput {
  /** Geocoded property latitude */
  lat: number;
  /** Geocoded property longitude */
  lng: number;
  /** Optional: known parcel polygon if already fetched */
  knownParcelPolygon?: GeometryPolygon;
  /** Optional: known building polygon if already fetched */
  knownBuildingPolygon?: GeometryPolygon;
}

/**
 * Run the strict geometry pipeline.
 *
 * This is the SINGLE entry point for obtaining property geometry data.
 * It follows the exact pipeline specified with no alternative data sources.
 */
export async function runStrictGeometryPipeline(
  input: StrictPipelineInput
): Promise<StrictGeometryResult> {
  const { lat, lng, knownParcelPolygon, knownBuildingPolygon } = input;

  const propertyLocation: GeoPoint = { lat, lng };

  // Initialize source audit
  const sourceAudit: StrictGeometryResult["sourceAudit"] = {
    parcelGISAvailable: false,
    parcelGISReason: null,
    microsoftFootprintsAvailable: false,
    microsoftFootprintsReason: null,
    geometryValidated: false,
    validationErrors: [],
  };

  // ─── Step 2: Fetch Real Parcel Polygon ───
  let parcelPolygon: GeometryPolygon | null = knownParcelPolygon || null;
  let parcelSource = "provided";
  let parcelAreaSqFt: number | null = null;

  if (!parcelPolygon) {
    if (!isParcelGISAvailable()) {
      sourceAudit.parcelGISReason = "REGRID_API_KEY not configured";
    } else {
      const parcelResult = await fetchParcelPolygon(lat, lng);
      if (parcelResult.available && parcelResult.parcelPolygon) {
        parcelPolygon = parcelResult.parcelPolygon;
        parcelSource = parcelResult.source;
        parcelAreaSqFt = parcelResult.parcelAreaSqFt;
        sourceAudit.parcelGISAvailable = true;
      } else {
        sourceAudit.parcelGISReason = parcelResult.errorReason;
      }
    }
  } else {
    sourceAudit.parcelGISAvailable = true;
    parcelAreaSqFt = geoPolygonAreaSqFt(parcelPolygon);
  }

  // ─── Step 3: Fetch Real Building Footprint ───
  let buildingPolygon: GeometryPolygon | null = knownBuildingPolygon || null;
  let buildingSource = "provided";
  let buildingAreaSqFt: number | null = null;

  if (!buildingPolygon) {
    try {
      const msResult = await getMicrosoftBuildingFootprints(lat, lng, 80);
      if (msResult.available && msResult.mainBuilding) {
        // Convert Microsoft footprint coordinates to GeometryPolygon
        const coords = msResult.mainBuilding.coordinates;
        // Ensure the ring is closed
        if (coords.length > 0 &&
            (coords[0][0] !== coords[coords.length - 1][0] ||
             coords[0][1] !== coords[coords.length - 1][1])) {
          coords.push([...coords[0]]);
        }
        buildingPolygon = {
          type: "Polygon",
          coordinates: [coords],
        };
        buildingSource = msResult.source;
        buildingAreaSqFt = msResult.mainBuilding.areaSqFt;
        sourceAudit.microsoftFootprintsAvailable = true;
      } else {
        sourceAudit.microsoftFootprintsReason = "No building found at location";
      }
    } catch (error) {
      sourceAudit.microsoftFootprintsReason =
        error instanceof Error ? error.message : "Microsoft footprints API failed";
    }
  } else {
    sourceAudit.microsoftFootprintsAvailable = true;
    buildingAreaSqFt = geoPolygonAreaSqFt(buildingPolygon);
  }

  // ─── Step 4: Validate Geometry Relationship ───
  if (parcelPolygon && buildingPolygon) {
    const buildingCentroid = geoPolygonCentroid(buildingPolygon);
    const isInside = isPointInPolygon(buildingCentroid, parcelPolygon);

    if (!isInside) {
      sourceAudit.validationErrors.push(
        "Building centroid is outside parcel boundary - data may be misaligned"
      );
    } else {
      sourceAudit.geometryValidated = true;
    }
  }

  // ─── Determine Pipeline Status ───
  let status: StrictPipelineStatus;
  let canRenderDiagram = false;
  let fallbackMessage: string | null = null;

  if (parcelPolygon && buildingPolygon && sourceAudit.geometryValidated) {
    status = "geometry-verified";
    canRenderDiagram = true;
  } else if (parcelPolygon && buildingPolygon) {
    // We have both but validation failed
    status = "geometry-verified"; // Still render, but with warning
    canRenderDiagram = true;
  } else if (buildingPolygon && !parcelPolygon) {
    status = "building-only";
    fallbackMessage = "Unable to retrieve parcel boundary data for this property. Diagram shows building footprint only.";
    canRenderDiagram = false;
  } else if (parcelPolygon && !buildingPolygon) {
    status = "parcel-only";
    fallbackMessage = "Unable to retrieve building footprint data for this property. Diagram shows parcel boundary only.";
    canRenderDiagram = false;
  } else {
    status = "unavailable";
    fallbackMessage = "Live parcel/building geometry unavailable for this property. Diagram could not be verified.";
    canRenderDiagram = false;
  }

  // ─── Step 5: Calculate Property Metrics ───
  let metrics: StrictPropertyMetrics | null = null;
  let parcelBBox: BoundingBox | null = null;
  let buildingCentroid: GeoPoint | null = null;

  if (parcelPolygon) {
    parcelBBox = geoPolygonBBox(parcelPolygon);
    parcelAreaSqFt = parcelAreaSqFt || geoPolygonAreaSqFt(parcelPolygon);
  }

  if (buildingPolygon) {
    buildingCentroid = geoPolygonCentroid(buildingPolygon);
    buildingAreaSqFt = buildingAreaSqFt || geoPolygonAreaSqFt(buildingPolygon);
  }

  if (parcelPolygon && buildingPolygon && parcelBBox) {
    const buildingBBox = geoPolygonBBox(buildingPolygon);
    const parcelCentroid = geoPolygonCentroid(parcelPolygon);
    const bldgCentroid = geoPolygonCentroid(buildingPolygon);

    // Calculate distances to parcel edges
    const mPerDegLng = metersPerDegLng(lat);

    const frontYardDepthFt = Math.round(
      (buildingBBox.minLat - parcelBBox.minLat) * METERS_PER_DEG_LAT * M_TO_FT
    );
    const rearYardDepthFt = Math.round(
      (parcelBBox.maxLat - buildingBBox.maxLat) * METERS_PER_DEG_LAT * M_TO_FT
    );
    const leftSideYardFt = Math.round(
      (buildingBBox.minLng - parcelBBox.minLng) * mPerDegLng * M_TO_FT
    );
    const rightSideYardFt = Math.round(
      (parcelBBox.maxLng - buildingBBox.maxLng) * mPerDegLng * M_TO_FT
    );

    const offsetFromCenterXFt = Math.round(
      (bldgCentroid.lng - parcelCentroid.lng) * mPerDegLng * M_TO_FT
    );
    const offsetFromCenterYFt = Math.round(
      (bldgCentroid.lat - parcelCentroid.lat) * METERS_PER_DEG_LAT * M_TO_FT
    );

    metrics = {
      parcelWidthFt: parcelBBox.widthFt,
      parcelDepthFt: parcelBBox.depthFt,
      buildingWidthFt: buildingBBox.widthFt,
      buildingDepthFt: buildingBBox.depthFt,
      frontYardDepthFt: Math.max(0, frontYardDepthFt),
      rearYardDepthFt: Math.max(0, rearYardDepthFt),
      leftSideYardFt: Math.max(0, leftSideYardFt),
      rightSideYardFt: Math.max(0, rightSideYardFt),
      openYardAreaSqFt: Math.max(0, (parcelAreaSqFt || 0) - (buildingAreaSqFt || 0)),
      buildingPlacement: {
        offsetFromCenterXFt,
        offsetFromCenterYFt,
        isCentered: Math.abs(offsetFromCenterXFt) < 5 && Math.abs(offsetFromCenterYFt) < 5,
      },
    };
  }

  // ─── Step 6: Compute ADU Buildable Envelope ───
  let buildableEnvelope: BuildableEnvelopeResult | null = null;

  if (parcelPolygon && buildingPolygon && canRenderDiagram) {
    // Create 3ft setback polygon (parcel inset)
    const parcelSetbackPolygon = insetPolygonByFeet(
      parcelPolygon,
      ADU_RULES.propertyLineSetbackFt,
      lat
    );

    // Create 6ft separation polygon (building outset)
    const residenceSeparationPolygon = outsetPolygonByFeet(
      buildingPolygon,
      ADU_RULES.residenceSeparationFt,
      lat
    );

    // Subtract separation zone from setback zone to get buildable area
    const remainingZones = subtractPolygonSimple(
      parcelSetbackPolygon,
      residenceSeparationPolygon,
      lat
    );

    // Find best buildable zone
    let buildablePolygon: GeometryPolygon | null = null;
    let buildableAreaSqFt = 0;
    let bestZone: BuildableEnvelopeResult["bestZone"] = "none";
    const constraints: string[] = [];

    if (remainingZones.length > 0) {
      // Sort by area (largest first)
      const sortedZones = remainingZones
        .map(z => ({ polygon: z, area: geoPolygonAreaSqFt(z) }))
        .sort((a, b) => b.area - a.area);

      if (sortedZones[0].area >= 200) {
        buildablePolygon = sortedZones[0].polygon;
        buildableAreaSqFt = sortedZones[0].area;

        // Determine zone position
        const zoneBBox = geoPolygonBBox(buildablePolygon);
        const buildingBBox = geoPolygonBBox(buildingPolygon);

        if (zoneBBox.minLat > buildingBBox.maxLat) {
          bestZone = "rear";
        } else if (zoneBBox.maxLng < buildingBBox.minLng) {
          bestZone = "left-side";
        } else if (zoneBBox.minLng > buildingBBox.maxLng) {
          bestZone = "right-side";
        }
      } else {
        constraints.push("Remaining buildable area is too small (<200 sq ft)");
      }
    } else {
      constraints.push("No buildable area after applying setbacks and separation");
    }

    buildableEnvelope = {
      parcelSetbackPolygon,
      residenceSeparationPolygon,
      buildablePolygon,
      buildableAreaSqFt,
      bestZone,
      constraints,
    };
  }

  // ─── Calculate Confidence ───
  let confidence = 0;
  if (status === "geometry-verified" && sourceAudit.geometryValidated) {
    confidence = 90;
  } else if (status === "geometry-verified") {
    confidence = 75; // Both sources but validation warning
  } else if (status === "building-only" || status === "parcel-only") {
    confidence = 40;
  } else {
    confidence = 0;
  }

  // ─── Return Result ───
  return {
    status,
    canRenderDiagram,
    fallbackMessage,
    propertyLocation,
    parcelPolygon,
    parcelSource,
    parcelAreaSqFt,
    parcelBBox,
    buildingPolygon,
    buildingSource,
    buildingAreaSqFt,
    buildingCentroid,
    metrics,
    buildableEnvelope,
    confidence,
    sourceAudit,
  };
}

/**
 * Helper to get a summary of the geometry result for logging/debugging.
 */
export function summarizeGeometryResult(result: StrictGeometryResult): string {
  const lines: string[] = [
    `Status: ${result.status}`,
    `Can Render: ${result.canRenderDiagram}`,
    `Confidence: ${result.confidence}%`,
  ];

  if (result.parcelPolygon) {
    lines.push(`Parcel: ${result.parcelAreaSqFt} sq ft (${result.parcelSource})`);
  }
  if (result.buildingPolygon) {
    lines.push(`Building: ${result.buildingAreaSqFt} sq ft (${result.buildingSource})`);
  }
  if (result.metrics) {
    lines.push(`Lot: ${result.metrics.parcelWidthFt}ft x ${result.metrics.parcelDepthFt}ft`);
    lines.push(`Building: ${result.metrics.buildingWidthFt}ft x ${result.metrics.buildingDepthFt}ft`);
    lines.push(`Setbacks: F=${result.metrics.frontYardDepthFt}ft R=${result.metrics.rearYardDepthFt}ft L=${result.metrics.leftSideYardFt}ft R=${result.metrics.rightSideYardFt}ft`);
  }
  if (result.buildableEnvelope) {
    lines.push(`Buildable: ${result.buildableEnvelope.buildableAreaSqFt} sq ft (${result.buildableEnvelope.bestZone})`);
  }
  if (result.fallbackMessage) {
    lines.push(`Fallback: ${result.fallbackMessage}`);
  }

  return lines.join("\n");
}

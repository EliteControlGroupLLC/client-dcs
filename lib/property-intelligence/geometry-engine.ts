// Geometry Engine — Polygon-based property geometry operations (v7)
//
// Provides polygon math for:
//   - footprint detection as actual polygons (not rectangles)
//   - parcel-anchored house placement
//   - setback inset computation
//   - leftover buildable polygon calculation
//   - structure separation zones
//   - polygon area, centroid, bounding box, distance calculations
//
// All coordinates are in [lng, lat] format (GeoJSON standard).
// Distance calculations use local meter approximation.

// ─── Core Types ───

export interface Point {
  x: number;
  y: number;
}

export interface GeoPoint {
  lng: number;
  lat: number;
}

/** A closed polygon ring as an array of [lng, lat] pairs. First and last point must match. */
export type PolygonRing = number[][];

/** GeoJSON-compatible polygon with optional holes */
export interface GeometryPolygon {
  type: "Polygon";
  coordinates: PolygonRing[];
}

export interface BoundingBox {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
  widthFt: number;
  depthFt: number;
}

export type StructureClassification =
  | "main-residence"
  | "detached-adu"
  | "detached-garage"
  | "accessory-structure"
  | "unknown-detached";

export interface DetectedStructure {
  classification: StructureClassification;
  polygon: GeometryPolygon;
  areaSqFt: number;
  centroid: GeoPoint;
  confidence: number;
  source: string;
  levels?: number;
}

export interface SetbackDistances {
  frontFt: number;
  rearFt: number;
  leftFt: number;
  rightFt: number;
}

export interface ParcelPlacement {
  /** Main structure polygon anchored within parcel */
  structurePolygon: GeometryPolygon;
  /** Measured distances from structure edges to parcel edges */
  measuredSetbacks: SetbackDistances;
  /** Whether structure fits within parcel boundaries */
  fitsWithinParcel: boolean;
  /** Placement confidence */
  confidence: number;
  /** How the placement was determined */
  placementMethod: "vector-anchored" | "osm-anchored" | "centroid-estimated" | "fallback-centered";
}

export interface LeftoverZone {
  polygon: GeometryPolygon;
  areaSqFt: number;
  centroid: GeoPoint;
  /** Position relative to main structure */
  position: "rear" | "left-side" | "right-side" | "front" | "interior";
  /** Build quality ranking (higher = better for ADU placement) */
  buildQuality: number;
  /** Width at narrowest point (ft) */
  minWidthFt: number;
  /** Depth at shallowest point (ft) */
  minDepthFt: number;
  /** Suitable ADU types for this zone */
  suitableFor: string[];
}

export interface GeometryAnalysis {
  /** Parcel boundary polygon */
  parcelPolygon: GeometryPolygon;
  /** Parcel bounding box with dimensions */
  parcelBBox: BoundingBox;
  /** All detected structures on the property */
  structures: DetectedStructure[];
  /** Main residence structure (largest) */
  mainStructure: DetectedStructure | null;
  /** Secondary/detached structures */
  secondaryStructures: DetectedStructure[];
  /** Main structure placement within parcel */
  placement: ParcelPlacement | null;
  /** Setback-inset boundary polygon */
  setbackEnvelope: GeometryPolygon | null;
  /** Leftover buildable zones after subtracting structures and setbacks */
  leftoverZones: LeftoverZone[];
  /** Best ADU candidate zone */
  bestAduZone: LeftoverZone | null;
  /** Best side-yard candidate zone */
  bestSideYardZone: LeftoverZone | null;
  /** Attached ADU candidate walls/areas */
  attachedCandidateWalls: ("rear" | "left" | "right")[];
  /** Garage conversion candidate */
  garageConversionCandidate: DetectedStructure | null;
  /** Overall geometry confidence */
  geometryConfidence: number;
  /** Whether geometry is estimated vs measured */
  geometryStatus: "polygon-verified" | "polygon-estimated" | "rectangle-fallback";
  /** Source of parcel geometry */
  parcelSource: string;
  /** Source of footprint geometry */
  footprintSource: string;
  /** Summary of area breakdown */
  areaSummary: {
    parcelSqFt: number;
    mainFootprintSqFt: number;
    mainLivingSqFt: number;
    totalStructureFootprintSqFt: number;
    totalSetbackAreaSqFt: number;
    totalLeftoverSqFt: number;
    bestBuildableZoneSqFt: number;
  };
}

// ─── Coordinate Conversion Constants ───

const METERS_PER_DEG_LAT = 111320;
function metersPerDegLng(lat: number): number {
  return 111320 * Math.cos((lat * Math.PI) / 180);
}

const SQ_M_TO_SQ_FT = 10.7639;
const M_TO_FT = 3.28084;

// ─── Low-Level Polygon Math ───

/** Convert a GeoJSON polygon ring to local XY meters relative to a reference point */
export function ringToLocalXY(ring: PolygonRing, refLat: number, refLng: number): Point[] {
  const mPerDegLng = metersPerDegLng(refLat);
  return ring.map(([lng, lat]) => ({
    x: (lng - refLng) * mPerDegLng,
    y: (lat - refLat) * METERS_PER_DEG_LAT,
  }));
}

/** Convert local XY meters back to lng/lat */
export function localXYToRing(points: Point[], refLat: number, refLng: number): PolygonRing {
  const mPerDegLng = metersPerDegLng(refLat);
  return points.map((p) => [
    refLng + p.x / mPerDegLng,
    refLat + p.y / METERS_PER_DEG_LAT,
  ]);
}

/** Calculate polygon area in square meters using Shoelace formula */
export function polygonAreaSqM(points: Point[]): number {
  if (points.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area) / 2;
}

/** Calculate polygon area in square feet from a GeoJSON polygon */
export function geoPolygonAreaSqFt(polygon: GeometryPolygon): number {
  const ring = polygon.coordinates[0];
  if (!ring || ring.length < 4) return 0;
  const refLat = ring[0][1];
  const refLng = ring[0][0];
  const local = ringToLocalXY(ring.slice(0, -1), refLat, refLng); // remove closing point
  return Math.round(polygonAreaSqM(local) * SQ_M_TO_SQ_FT);
}

/** Calculate centroid of a polygon ring */
export function polygonCentroid(points: Point[]): Point {
  if (points.length === 0) return { x: 0, y: 0 };
  let cx = 0, cy = 0;
  for (const p of points) {
    cx += p.x;
    cy += p.y;
  }
  return { x: cx / points.length, y: cy / points.length };
}

/** Calculate centroid of a GeoJSON polygon in lng/lat */
export function geoPolygonCentroid(polygon: GeometryPolygon): GeoPoint {
  const ring = polygon.coordinates[0];
  if (!ring || ring.length < 4) return { lng: 0, lat: 0 };
  // Exclude closing point
  const pts = ring.slice(0, -1);
  let lng = 0, lat = 0;
  for (const p of pts) {
    lng += p[0];
    lat += p[1];
  }
  return { lng: lng / pts.length, lat: lat / pts.length };
}

/** Calculate bounding box of a GeoJSON polygon with dimensions in feet */
export function geoPolygonBBox(polygon: GeometryPolygon): BoundingBox {
  const ring = polygon.coordinates[0];
  if (!ring || ring.length < 4) {
    return { minLng: 0, minLat: 0, maxLng: 0, maxLat: 0, widthFt: 0, depthFt: 0 };
  }

  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
  for (const [lng, lat] of ring) {
    if (lng < minLng) minLng = lng;
    if (lat < minLat) minLat = lat;
    if (lng > maxLng) maxLng = lng;
    if (lat > maxLat) maxLat = lat;
  }

  const midLat = (minLat + maxLat) / 2;
  const widthM = (maxLng - minLng) * metersPerDegLng(midLat);
  const depthM = (maxLat - minLat) * METERS_PER_DEG_LAT;

  return {
    minLng, minLat, maxLng, maxLat,
    widthFt: Math.round(widthM * M_TO_FT),
    depthFt: Math.round(depthM * M_TO_FT),
  };
}

/** Calculate distance between two geo points in feet */
export function geoDistanceFt(a: GeoPoint, b: GeoPoint): number {
  const dLat = (b.lat - a.lat) * METERS_PER_DEG_LAT;
  const midLat = (a.lat + b.lat) / 2;
  const dLng = (b.lng - a.lng) * metersPerDegLng(midLat);
  return Math.sqrt(dLat * dLat + dLng * dLng) * M_TO_FT;
}

/** Calculate minimum distance from a point to a polygon edge in feet */
export function pointToPolygonEdgeDistanceFt(
  point: GeoPoint,
  polygon: GeometryPolygon
): number {
  const ring = polygon.coordinates[0];
  if (!ring || ring.length < 4) return 0;

  const refLat = point.lat;
  const refLng = point.lng;
  const mPerDegLng = metersPerDegLng(refLat);

  const px = 0; // point is the reference
  const py = 0;

  let minDist = Infinity;
  for (let i = 0; i < ring.length - 1; i++) {
    const ax = (ring[i][0] - refLng) * mPerDegLng;
    const ay = (ring[i][1] - refLat) * METERS_PER_DEG_LAT;
    const bx = (ring[i + 1][0] - refLng) * mPerDegLng;
    const by = (ring[i + 1][1] - refLat) * METERS_PER_DEG_LAT;

    const dist = pointToSegmentDistance(px, py, ax, ay, bx, by);
    if (dist < minDist) minDist = dist;
  }

  return minDist * M_TO_FT;
}

/** Point-to-segment distance in 2D */
function pointToSegmentDistance(
  px: number, py: number,
  ax: number, ay: number,
  bx: number, by: number
): number {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.sqrt((px - ax) ** 2 + (py - ay) ** 2);

  let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));

  const projX = ax + t * dx;
  const projY = ay + t * dy;
  return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2);
}

/** Check if a point is inside a polygon (ray casting) */
export function pointInPolygon(point: Point, polygon: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    if ((yi > point.y) !== (yj > point.y) &&
        point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

// ─── Polygon Inset (Setback) ───

/** 
 * Inset a polygon by a given distance (in meters) using simplified Minkowski offset.
 * Works for convex and mildly concave polygons.
 */
export function insetPolygon(points: Point[], distanceM: number): Point[] {
  if (points.length < 3) return [];

  const n = points.length;
  const edges: { nx: number; ny: number }[] = [];

  // Compute inward normals for each edge
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const dx = points[j].x - points[i].x;
    const dy = points[j].y - points[i].y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) {
      edges.push({ nx: 0, ny: 0 });
      continue;
    }
    // Inward normal (assuming CCW winding)
    edges.push({ nx: dy / len, ny: -dx / len });
  }

  // Check winding direction - if CW, flip normals
  let crossSum = 0;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    crossSum += points[i].x * points[j].y - points[j].x * points[i].y;
  }
  const isCW = crossSum < 0;
  if (isCW) {
    for (const e of edges) {
      e.nx = -e.nx;
      e.ny = -e.ny;
    }
  }

  // Offset each edge inward
  const result: Point[] = [];
  for (let i = 0; i < n; i++) {
    const prevEdge = edges[(i - 1 + n) % n];
    const currEdge = edges[i];

    // Offset lines
    const p1 = {
      x: points[(i - 1 + n) % n].x + prevEdge.nx * distanceM,
      y: points[(i - 1 + n) % n].y + prevEdge.ny * distanceM,
    };
    const p2 = {
      x: points[i].x + prevEdge.nx * distanceM,
      y: points[i].y + prevEdge.ny * distanceM,
    };
    const p3 = {
      x: points[i].x + currEdge.nx * distanceM,
      y: points[i].y + currEdge.ny * distanceM,
    };
    const p4 = {
      x: points[(i + 1) % n].x + currEdge.nx * distanceM,
      y: points[(i + 1) % n].y + currEdge.ny * distanceM,
    };

    // Intersect the two offset lines
    const intersection = lineLineIntersection(p1, p2, p3, p4);
    if (intersection) {
      result.push(intersection);
    } else {
      // Fallback: use midpoint of offset
      result.push({
        x: (p2.x + p3.x) / 2,
        y: (p2.y + p3.y) / 2,
      });
    }
  }

  // Validate result area
  const resultArea = polygonAreaSqM(result);
  const originalArea = polygonAreaSqM(points);
  if (resultArea <= 0 || resultArea > originalArea) {
    return []; // Inset collapsed the polygon
  }

  return result;
}

/** Line-line intersection */
function lineLineIntersection(
  p1: Point, p2: Point, p3: Point, p4: Point
): Point | null {
  const d1x = p2.x - p1.x, d1y = p2.y - p1.y;
  const d2x = p4.x - p3.x, d2y = p4.y - p3.y;
  const cross = d1x * d2y - d1y * d2x;
  if (Math.abs(cross) < 1e-10) return null;

  const t = ((p3.x - p1.x) * d2y - (p3.y - p1.y) * d2x) / cross;
  return {
    x: p1.x + t * d1x,
    y: p1.y + t * d1y,
  };
}

// ─── Polygon Set Operations (Simplified) ───

/**
 * Subtract a hole polygon from a larger polygon.
 * Returns the remaining area as separate polygons (simplified approach).
 * For complex geometry this produces approximate results.
 */
export function subtractPolygonSimple(
  outer: Point[],
  hole: Point[]
): Point[][] {
  // For the property analysis use case, we don't need exact boolean ops.
  // Instead, we split the remaining area into zones (rear, left, right, front).
  // This is handled by the zone splitting logic in analyzeLeftoverZones.
  // Here we just verify the hole fits inside the outer polygon.

  const holeCentroid = polygonCentroid(hole);
  if (!pointInPolygon(holeCentroid, outer)) {
    return [outer]; // hole is outside, return original
  }

  // Return the outer polygon with the hole conceptually removed
  // Actual zone splitting is done by analyzeLeftoverZones
  return [outer];
}

// ─── High-Level Geometry Functions ───

/**
 * Create a rectangular polygon from center, width, and depth (in feet).
 * Oriented N-S (depth along lat) and E-W (width along lng).
 */
export function createRectPolygon(
  centerLat: number,
  centerLng: number,
  widthFt: number,
  depthFt: number
): GeometryPolygon {
  const halfWidthM = (widthFt / M_TO_FT) / 2;
  const halfDepthM = (depthFt / M_TO_FT) / 2;

  const mPerDegLng = metersPerDegLng(centerLat);
  const dLng = halfWidthM / mPerDegLng;
  const dLat = halfDepthM / METERS_PER_DEG_LAT;

  return {
    type: "Polygon",
    coordinates: [[
      [centerLng - dLng, centerLat - dLat],
      [centerLng + dLng, centerLat - dLat],
      [centerLng + dLng, centerLat + dLat],
      [centerLng - dLng, centerLat + dLat],
      [centerLng - dLng, centerLat - dLat],
    ]],
  };
}

/**
 * Convert OSM building nodes to a GeometryPolygon
 */
export function osmNodesToPolygon(
  nodes: Array<{ lat: number; lon: number }>
): GeometryPolygon {
  if (nodes.length < 3) {
    return { type: "Polygon", coordinates: [[]] };
  }
  const coords = nodes.map((n) => [n.lon, n.lat]);
  // Close the ring
  if (coords[0][0] !== coords[coords.length - 1][0] ||
      coords[0][1] !== coords[coords.length - 1][1]) {
    coords.push([...coords[0]]);
  }
  return { type: "Polygon", coordinates: [coords] };
}

/**
 * Measure setback distances from a structure polygon to parcel boundary edges.
 * Returns distances to front (south), rear (north), left (west), right (east) edges.
 */
export function measureSetbacksToParcel(
  structurePolygon: GeometryPolygon,
  parcelPolygon: GeometryPolygon
): SetbackDistances {
  const structBBox = geoPolygonBBox(structurePolygon);
  const parcelBBox = geoPolygonBBox(parcelPolygon);

  const midLat = (parcelBBox.minLat + parcelBBox.maxLat) / 2;
  const mPerDegLng = metersPerDegLng(midLat);

  // Front = distance from structure south edge to parcel south edge
  const frontM = (structBBox.minLat - parcelBBox.minLat) * METERS_PER_DEG_LAT;
  // Rear = distance from structure north edge to parcel north edge
  const rearM = (parcelBBox.maxLat - structBBox.maxLat) * METERS_PER_DEG_LAT;
  // Left = distance from structure west edge to parcel west edge
  const leftM = (structBBox.minLng - parcelBBox.minLng) * mPerDegLng;
  // Right = distance from structure east edge to parcel east edge
  const rightM = (parcelBBox.maxLng - structBBox.maxLng) * mPerDegLng;

  return {
    frontFt: Math.max(0, Math.round(frontM * M_TO_FT)),
    rearFt: Math.max(0, Math.round(rearM * M_TO_FT)),
    leftFt: Math.max(0, Math.round(leftM * M_TO_FT)),
    rightFt: Math.max(0, Math.round(rightM * M_TO_FT)),
  };
}

/**
 * Compute the setback-inset envelope of a parcel polygon.
 * Applies different setback distances per edge (front/rear/sides).
 */
export function computeSetbackEnvelope(
  parcelPolygon: GeometryPolygon,
  frontSetbackFt: number,
  rearSetbackFt: number,
  sideSetbackFt: number
): GeometryPolygon | null {
  const bbox = geoPolygonBBox(parcelPolygon);
  const midLat = (bbox.minLat + bbox.maxLat) / 2;
  const frontM = frontSetbackFt / M_TO_FT;
  const rearM = rearSetbackFt / M_TO_FT;
  const sideM = sideSetbackFt / M_TO_FT;

  // For complex polygons, apply per-edge setbacks using bbox-relative approach
  const ring = parcelPolygon.coordinates[0];
  if (!ring || ring.length < 4) return null;

  const refLat = midLat;
  const refLng = (bbox.minLng + bbox.maxLng) / 2;

  const local = ringToLocalXY(ring.slice(0, -1), refLat, refLng);

  // For each vertex, determine which edges it's closest to and apply appropriate inset
  const insetPoints: Point[] = [];
  const localBBox = {
    minX: Math.min(...local.map(p => p.x)),
    maxX: Math.max(...local.map(p => p.x)),
    minY: Math.min(...local.map(p => p.y)),
    maxY: Math.max(...local.map(p => p.y)),
  };

  for (const p of local) {
    // Determine inset based on edge proximity
    const distToBottom = p.y - localBBox.minY;
    const distToTop = localBBox.maxY - p.y;
    const distToLeft = p.x - localBBox.minX;
    const distToRight = localBBox.maxX - p.x;

    let dx = 0, dy = 0;

    // Side insets
    if (distToLeft < distToRight) {
      dx = sideM; // move right
    } else {
      dx = -sideM; // move left
    }

    // Front/rear insets (front = bottom/south, rear = top/north)
    if (distToBottom < distToTop) {
      dy = frontM; // move up from front
    } else {
      dy = -rearM; // move down from rear
    }

    insetPoints.push({ x: p.x + dx, y: p.y + dy });
  }

  // Validate the inset polygon has positive area
  const insetArea = polygonAreaSqM(insetPoints);
  if (insetArea <= 0) return null;

  const insetRing = localXYToRing(insetPoints, refLat, refLng);
  insetRing.push([...insetRing[0]]); // close ring

  return { type: "Polygon", coordinates: [insetRing] };
}

/**
 * Analyze leftover zones after placing main structure within setback envelope.
 * Splits remaining area into rear, left-side, right-side, and front zones.
 */
export function analyzeLeftoverZones(
  parcelPolygon: GeometryPolygon,
  mainStructure: DetectedStructure,
  secondaryStructures: DetectedStructure[],
  frontSetbackFt: number,
  rearSetbackFt: number,
  sideSetbackFt: number,
  separationFt: number
): LeftoverZone[] {
  const parcelBBox = geoPolygonBBox(parcelPolygon);
  const structBBox = geoPolygonBBox(mainStructure.polygon);
  const midLat = (parcelBBox.minLat + parcelBBox.maxLat) / 2;
  const mPerDegLng = metersPerDegLng(midLat);

  const zones: LeftoverZone[] = [];

  // Convert setbacks and separation to degrees
  const frontSetbackDeg = (frontSetbackFt / M_TO_FT) / METERS_PER_DEG_LAT;
  const rearSetbackDeg = (rearSetbackFt / M_TO_FT) / METERS_PER_DEG_LAT;
  const sideSetbackDeg = (sideSetbackFt / M_TO_FT) / mPerDegLng;
  const separationDeg = (separationFt / M_TO_FT) / METERS_PER_DEG_LAT;
  const separationDegLng = (separationFt / M_TO_FT) / mPerDegLng;

  // Calculate secondary structure footprint areas to subtract
  const secondaryBBoxes = secondaryStructures.map(s => geoPolygonBBox(s.polygon));

  // ── Rear Zone (behind main house, between structure north edge and parcel north edge minus rear setback) ──
  const rearSouth = structBBox.maxLat + separationDeg;
  const rearNorth = parcelBBox.maxLat - rearSetbackDeg;
  const rearWest = parcelBBox.minLng + sideSetbackDeg;
  const rearEast = parcelBBox.maxLng - sideSetbackDeg;

  if (rearNorth > rearSouth && rearEast > rearWest) {
    const rearPoly: GeometryPolygon = {
      type: "Polygon",
      coordinates: [[
        [rearWest, rearSouth],
        [rearEast, rearSouth],
        [rearEast, rearNorth],
        [rearWest, rearNorth],
        [rearWest, rearSouth],
      ]],
    };

    let rearArea = geoPolygonAreaSqFt(rearPoly);
    const rearWidthFt = Math.round((rearEast - rearWest) * mPerDegLng * M_TO_FT);
    const rearDepthFt = Math.round((rearNorth - rearSouth) * METERS_PER_DEG_LAT * M_TO_FT);

    // Subtract any secondary structures in this zone
    for (const sBBox of secondaryBBoxes) {
      if (sBBox.minLat >= rearSouth && sBBox.maxLat <= rearNorth) {
        rearArea -= sBBox.widthFt * sBBox.depthFt;
      }
    }
    rearArea = Math.max(0, rearArea);

    if (rearArea > 50) {
      zones.push({
        polygon: rearPoly,
        areaSqFt: rearArea,
        centroid: geoPolygonCentroid(rearPoly),
        position: "rear",
        buildQuality: rearArea > 400 ? 90 : rearArea > 200 ? 70 : 50,
        minWidthFt: rearWidthFt,
        minDepthFt: rearDepthFt,
        suitableFor: determineSuitableAduTypes(rearWidthFt, rearDepthFt, rearArea),
      });
    }
  }

  // ── Left Side Zone ──
  const leftEast = structBBox.minLng - separationDegLng;
  const leftWest = parcelBBox.minLng + sideSetbackDeg;
  const leftSouth = parcelBBox.minLat + frontSetbackDeg;
  const leftNorth = parcelBBox.maxLat - rearSetbackDeg;

  if (leftEast > leftWest && leftNorth > leftSouth) {
    const leftPoly: GeometryPolygon = {
      type: "Polygon",
      coordinates: [[
        [leftWest, leftSouth],
        [leftEast, leftSouth],
        [leftEast, leftNorth],
        [leftWest, leftNorth],
        [leftWest, leftSouth],
      ]],
    };

    const leftWidthFt = Math.round((leftEast - leftWest) * mPerDegLng * M_TO_FT);
    const leftDepthFt = Math.round((leftNorth - leftSouth) * METERS_PER_DEG_LAT * M_TO_FT);
    const leftArea = geoPolygonAreaSqFt(leftPoly);

    if (leftArea > 50 && leftWidthFt > 5) {
      zones.push({
        polygon: leftPoly,
        areaSqFt: leftArea,
        centroid: geoPolygonCentroid(leftPoly),
        position: "left-side",
        buildQuality: leftWidthFt > 15 ? 70 : leftWidthFt > 8 ? 50 : 30,
        minWidthFt: leftWidthFt,
        minDepthFt: leftDepthFt,
        suitableFor: determineSuitableAduTypes(leftWidthFt, leftDepthFt, leftArea),
      });
    }
  }

  // ── Right Side Zone ──
  const rightWest = structBBox.maxLng + separationDegLng;
  const rightEast = parcelBBox.maxLng - sideSetbackDeg;
  const rightSouth = parcelBBox.minLat + frontSetbackDeg;
  const rightNorth = parcelBBox.maxLat - rearSetbackDeg;

  if (rightEast > rightWest && rightNorth > rightSouth) {
    const rightPoly: GeometryPolygon = {
      type: "Polygon",
      coordinates: [[
        [rightWest, rightSouth],
        [rightEast, rightSouth],
        [rightEast, rightNorth],
        [rightWest, rightNorth],
        [rightWest, rightSouth],
      ]],
    };

    const rightWidthFt = Math.round((rightEast - rightWest) * mPerDegLng * M_TO_FT);
    const rightDepthFt = Math.round((rightNorth - rightSouth) * METERS_PER_DEG_LAT * M_TO_FT);
    const rightArea = geoPolygonAreaSqFt(rightPoly);

    if (rightArea > 50 && rightWidthFt > 5) {
      zones.push({
        polygon: rightPoly,
        areaSqFt: rightArea,
        centroid: geoPolygonCentroid(rightPoly),
        position: "right-side",
        buildQuality: rightWidthFt > 15 ? 70 : rightWidthFt > 8 ? 50 : 30,
        minWidthFt: rightWidthFt,
        minDepthFt: rightDepthFt,
        suitableFor: determineSuitableAduTypes(rightWidthFt, rightDepthFt, rightArea),
      });
    }
  }

  // ── Front Zone (between front setback and structure front edge) ──
  const frontSouth = parcelBBox.minLat + frontSetbackDeg;
  const frontNorth = structBBox.minLat - separationDeg;
  const frontWest = parcelBBox.minLng + sideSetbackDeg;
  const frontEast = parcelBBox.maxLng - sideSetbackDeg;

  if (frontNorth > frontSouth && frontEast > frontWest) {
    const frontPoly: GeometryPolygon = {
      type: "Polygon",
      coordinates: [[
        [frontWest, frontSouth],
        [frontEast, frontSouth],
        [frontEast, frontNorth],
        [frontWest, frontNorth],
        [frontWest, frontSouth],
      ]],
    };

    const frontWidthFt = Math.round((frontEast - frontWest) * mPerDegLng * M_TO_FT);
    const frontDepthFt = Math.round((frontNorth - frontSouth) * METERS_PER_DEG_LAT * M_TO_FT);
    const frontArea = geoPolygonAreaSqFt(frontPoly);

    if (frontArea > 100 && frontDepthFt > 8) {
      zones.push({
        polygon: frontPoly,
        areaSqFt: frontArea,
        centroid: geoPolygonCentroid(frontPoly),
        position: "front",
        buildQuality: 30, // Front zones are typically low priority for ADU
        minWidthFt: frontWidthFt,
        minDepthFt: frontDepthFt,
        suitableFor: [], // Front yard ADUs are rarely feasible
      });
    }
  }

  // Sort zones by build quality (best first)
  zones.sort((a, b) => b.buildQuality - a.buildQuality);

  return zones;
}

/** Determine suitable ADU types based on zone dimensions */
function determineSuitableAduTypes(
  widthFt: number,
  depthFt: number,
  areaSqFt: number
): string[] {
  const types: string[] = [];
  if (areaSqFt >= 400 && widthFt >= 16 && depthFt >= 20) {
    types.push("Detached ADU");
  }
  if (areaSqFt >= 200 && widthFt >= 12 && depthFt >= 16) {
    types.push("Small Detached ADU");
  }
  if (widthFt >= 8 && depthFt >= 10) {
    types.push("JADU");
  }
  return types;
}

// ─── Intelligent Footprint Merger (OSM + Microsoft) ───

export interface MergedFootprintResult {
  buildings: Array<{
    areaSqFt: number;
    buildingType?: string;
    nodes: Array<{ lat: number; lon: number }>;
    levels?: number;
  }>;
  source: string;
  mergeNotes: string[];
}

/**
 * Intelligently merge OSM and Microsoft building footprints.
 * - If only one source has data, use it.
 * - If both have data, compare and select best polygons per structure.
 * - Uses overlap detection, shape quality, and area plausibility.
 */
export function mergeFootprintSources(
  osmBuildings: Array<{
    areaSqFt: number;
    buildingType?: string;
    nodes: Array<{ lat: number; lon: number }>;
    levels?: number;
  }>,
  msBuildings: Array<{
    areaSqFt: number;
    buildingType?: string;
    nodes: Array<{ lat: number; lon: number }>;
    levels?: number;
  }>,
  parcelAreaSqFt: number
): MergedFootprintResult {
  const notes: string[] = [];

  // Case 1: No data from either source
  if (osmBuildings.length === 0 && msBuildings.length === 0) {
    return { buildings: [], source: "none", mergeNotes: ["No footprint data from OSM or Microsoft"] };
  }

  // Case 2: Only one source has data
  if (osmBuildings.length === 0) {
    notes.push(`Using Microsoft footprints only (${msBuildings.length} buildings)`);
    return { buildings: msBuildings, source: "Microsoft Building Footprints", mergeNotes: notes };
  }
  if (msBuildings.length === 0) {
    notes.push(`Using OSM footprints only (${osmBuildings.length} buildings)`);
    return { buildings: osmBuildings, source: "OpenStreetMap", mergeNotes: notes };
  }

  // Case 3: Both sources have data — intelligent merge
  notes.push(`Merging: OSM has ${osmBuildings.length} buildings, Microsoft has ${msBuildings.length} buildings`);

  // Score each source's overall quality
  const osmTotalArea = osmBuildings.reduce((s, b) => s + b.areaSqFt, 0);
  const msTotalArea = msBuildings.reduce((s, b) => s + b.areaSqFt, 0);

  // Plausibility: total footprint should be < 60% of parcel
  const osmPlausible = osmTotalArea < parcelAreaSqFt * 0.6 && osmTotalArea > 0;
  const msPlausible = msTotalArea < parcelAreaSqFt * 0.6 && msTotalArea > 0;

  // Shape quality: more nodes = better polygon shape (OSM often has better detail)
  const osmAvgNodes = osmBuildings.reduce((s, b) => s + b.nodes.length, 0) / osmBuildings.length;
  const msAvgNodes = msBuildings.reduce((s, b) => s + b.nodes.length, 0) / msBuildings.length;

  // Building type metadata (OSM has richer tagging)
  const osmHasTypes = osmBuildings.some(b => b.buildingType && b.buildingType !== "yes");
  const osmHasLevels = osmBuildings.some(b => b.levels && b.levels > 0);

  // Score each source
  let osmScore = 0;
  let msScore = 0;

  if (osmPlausible) osmScore += 20; else osmScore -= 10;
  if (msPlausible) msScore += 20; else msScore -= 10;
  if (osmAvgNodes > msAvgNodes) osmScore += 10; else msScore += 10;
  if (osmHasTypes) osmScore += 10;
  if (osmHasLevels) osmScore += 5;

  // Microsoft footprints have consistent ML quality
  msScore += 5;

  // More buildings detected = potentially more complete coverage
  if (osmBuildings.length > msBuildings.length) osmScore += 5;
  if (msBuildings.length > osmBuildings.length) msScore += 5;

  // Check for overlap: if main buildings are similar area (within 20%), sources agree
  const osmMain = osmBuildings.reduce((best, b) => b.areaSqFt > best.areaSqFt ? b : best, osmBuildings[0]);
  const msMain = msBuildings.reduce((best, b) => b.areaSqFt > best.areaSqFt ? b : best, msBuildings[0]);
  const mainAreaDiff = Math.abs(osmMain.areaSqFt - msMain.areaSqFt) / Math.max(osmMain.areaSqFt, msMain.areaSqFt);

  if (mainAreaDiff < 0.2) {
    notes.push(`Main building area agrees within ${(mainAreaDiff * 100).toFixed(0)}% — sources consistent`);
    // Both agree — prefer the one with better polygon quality
  } else {
    notes.push(`Main building area differs by ${(mainAreaDiff * 100).toFixed(0)}% — using higher-scoring source`);
  }

  // Select primary source
  const usedBuildings = osmScore >= msScore ? osmBuildings : msBuildings;
  const primarySource = osmScore >= msScore ? "OpenStreetMap" : "Microsoft Building Footprints";
  const secondarySource = osmScore >= msScore ? "Microsoft Building Footprints" : "OpenStreetMap";
  const secondaryBuildings = osmScore >= msScore ? msBuildings : osmBuildings;

  notes.push(`Primary: ${primarySource} (score ${Math.max(osmScore, msScore)}), Secondary: ${secondarySource} (score ${Math.min(osmScore, msScore)})`);

  // Check if secondary source detected structures the primary missed
  // (e.g., a detached garage or ADU that only one source found)
  const merged = [...usedBuildings];

  if (secondaryBuildings.length > usedBuildings.length) {
    // Secondary found more buildings — check for unique structures
    for (const secBuilding of secondaryBuildings) {
      const hasOverlap = usedBuildings.some(primary => {
        const areaDiff = Math.abs(primary.areaSqFt - secBuilding.areaSqFt) / Math.max(primary.areaSqFt, secBuilding.areaSqFt);
        // Check centroid proximity
        if (primary.nodes.length > 0 && secBuilding.nodes.length > 0) {
          const pCentLat = primary.nodes.reduce((s, n) => s + n.lat, 0) / primary.nodes.length;
          const pCentLon = primary.nodes.reduce((s, n) => s + n.lon, 0) / primary.nodes.length;
          const sCentLat = secBuilding.nodes.reduce((s, n) => s + n.lat, 0) / secBuilding.nodes.length;
          const sCentLon = secBuilding.nodes.reduce((s, n) => s + n.lon, 0) / secBuilding.nodes.length;
          const distM = Math.sqrt(
            Math.pow((pCentLat - sCentLat) * 111320, 2) +
            Math.pow((pCentLon - sCentLon) * 111320 * Math.cos(pCentLat * Math.PI / 180), 2)
          );
          return distM < 15 || areaDiff < 0.3; // Within 15m or similar area
        }
        return areaDiff < 0.3;
      });

      if (!hasOverlap && secBuilding.areaSqFt > 100) {
        merged.push(secBuilding);
        notes.push(`Added unique structure from ${secondarySource}: ${secBuilding.areaSqFt} sq ft`);
      }
    }
  }

  return {
    buildings: merged,
    source: `${primarySource} + ${secondarySource} (merged)`,
    mergeNotes: notes,
  };
}

// ─── Structure Classification ───

/**
 * Classify detected structures based on area, position, and building type.
 */
export function classifyStructures(
  buildings: Array<{
    areaSqFt: number;
    buildingType?: string;
    nodes: Array<{ lat: number; lon: number }>;
    levels?: number;
  }>,
  source: string
): DetectedStructure[] {
  if (buildings.length === 0) return [];

  // Sort by area (largest first)
  const sorted = [...buildings].sort((a, b) => b.areaSqFt - a.areaSqFt);

  return sorted.map((b, i) => {
    const polygon = osmNodesToPolygon(b.nodes);
    const centroid = geoPolygonCentroid(polygon);
    let classification: StructureClassification;
    let confidence: number;

    if (i === 0) {
      classification = "main-residence";
      confidence = 85;
    } else if (b.buildingType === "garage" || (b.areaSqFt >= 150 && b.areaSqFt <= 600 && !b.buildingType)) {
      classification = "detached-garage";
      confidence = 65;
    } else if (b.buildingType === "yes" && b.areaSqFt >= 300 && b.areaSqFt <= 1200) {
      classification = "detached-adu";
      confidence = 55;
    } else if (b.areaSqFt < 150) {
      classification = "accessory-structure";
      confidence = 60;
    } else {
      classification = "unknown-detached";
      confidence = 45;
    }

    return {
      classification,
      polygon,
      areaSqFt: b.areaSqFt,
      centroid,
      confidence,
      source,
      levels: b.levels,
    };
  });
}

// ─── Geometry Sanity Checks ───

export interface GeometrySanityResult {
  passed: boolean;
  checks: {
    name: string;
    passed: boolean;
    severity: "error" | "warning" | "info";
    message: string;
  }[];
  adjustedConfidence: number;
}

/**
 * Run geometry sanity checks before publishing site layout.
 */
export function runGeometrySanityChecks(
  analysis: GeometryAnalysis,
  knownLivingAreaSqFt: number
): GeometrySanityResult {
  const checks: GeometrySanityResult["checks"] = [];
  let confidence = analysis.geometryConfidence;

  // Check 1: Does main house fit within parcel?
  if (analysis.mainStructure && analysis.parcelBBox.widthFt > 0) {
    const structBBox = geoPolygonBBox(analysis.mainStructure.polygon);
    const fitsWidth = structBBox.widthFt <= analysis.parcelBBox.widthFt;
    const fitsDepth = structBBox.depthFt <= analysis.parcelBBox.depthFt;
    const fits = fitsWidth && fitsDepth;

    checks.push({
      name: "structure-fits-parcel",
      passed: fits,
      severity: fits ? "info" : "error",
      message: fits
        ? "Main structure fits within parcel boundaries"
        : `Main structure (${structBBox.widthFt}x${structBBox.depthFt}ft) exceeds parcel (${analysis.parcelBBox.widthFt}x${analysis.parcelBBox.depthFt}ft)`,
    });
    if (!fits) confidence -= 25;
  }

  // Check 2: Does polygon area align with known living area?
  if (analysis.mainStructure && knownLivingAreaSqFt > 0) {
    const footprint = analysis.mainStructure.areaSqFt;
    const levels = analysis.mainStructure.levels || 1;
    const impliedLiving = footprint * levels;
    const ratio = impliedLiving / knownLivingAreaSqFt;
    const reasonable = ratio >= 0.5 && ratio <= 2.0;

    checks.push({
      name: "footprint-living-area-alignment",
      passed: reasonable,
      severity: reasonable ? "info" : "warning",
      message: reasonable
        ? `Footprint area (${footprint} sqft x ${levels} levels = ${impliedLiving} sqft) aligns with known living area (${knownLivingAreaSqFt} sqft)`
        : `Footprint area (${footprint} sqft x ${levels} levels = ${impliedLiving} sqft) diverges from known living area (${knownLivingAreaSqFt} sqft) — ratio: ${ratio.toFixed(2)}`,
    });
    if (!reasonable) confidence -= 15;
  }

  // Check 3: Is the footprint unrealistically large relative to lot?
  if (analysis.mainStructure && analysis.areaSummary.parcelSqFt > 0) {
    const lotCoverage = analysis.mainStructure.areaSqFt / analysis.areaSummary.parcelSqFt;
    const reasonable = lotCoverage <= 0.7;

    checks.push({
      name: "lot-coverage-reasonable",
      passed: reasonable,
      severity: reasonable ? "info" : "warning",
      message: reasonable
        ? `Lot coverage ${(lotCoverage * 100).toFixed(1)}% is reasonable`
        : `Lot coverage ${(lotCoverage * 100).toFixed(1)}% seems unrealistically high`,
    });
    if (!reasonable) confidence -= 10;
  }

  // Check 4: Are detached structures incorrectly merged?
  if (analysis.structures.length === 1 && analysis.areaSummary.parcelSqFt > 8000) {
    checks.push({
      name: "possible-merged-structures",
      passed: true,
      severity: "warning",
      message: "Only one structure detected on a large lot — detached structures may be missing from data",
    });
    confidence -= 5;
  }

  // Check 5: Are setback distances plausible?
  if (analysis.placement) {
    const sb = analysis.placement.measuredSetbacks;
    const plausible = sb.frontFt >= 0 && sb.rearFt >= 0 && sb.leftFt >= 0 && sb.rightFt >= 0;
    const tooTight = sb.frontFt < 3 || sb.rearFt < 2 || sb.leftFt < 2 || sb.rightFt < 2;

    checks.push({
      name: "setback-distances-plausible",
      passed: plausible && !tooTight,
      severity: !plausible ? "error" : tooTight ? "warning" : "info",
      message: plausible && !tooTight
        ? `Setbacks: front=${sb.frontFt}ft rear=${sb.rearFt}ft left=${sb.leftFt}ft right=${sb.rightFt}ft`
        : `Setbacks may be implausible: front=${sb.frontFt}ft rear=${sb.rearFt}ft left=${sb.leftFt}ft right=${sb.rightFt}ft`,
    });
    if (!plausible) confidence -= 15;
    if (tooTight) confidence -= 5;
  }

  // Check 6: Does leftover yard geometry make sense?
  const totalLeftover = analysis.leftoverZones.reduce((s, z) => s + z.areaSqFt, 0);
  const expectedYard = analysis.areaSummary.parcelSqFt - analysis.areaSummary.totalStructureFootprintSqFt;
  if (expectedYard > 0) {
    const yardRatio = totalLeftover / expectedYard;
    const reasonable = yardRatio >= 0.2 && yardRatio <= 1.5;

    checks.push({
      name: "leftover-yard-reasonable",
      passed: reasonable,
      severity: reasonable ? "info" : "warning",
      message: reasonable
        ? `Leftover yard area (${totalLeftover} sqft) is consistent with expected yard (${Math.round(expectedYard)} sqft)`
        : `Leftover yard area (${totalLeftover} sqft) diverges from expected yard (${Math.round(expectedYard)} sqft) — geometry may be inaccurate`,
    });
    if (!reasonable) confidence -= 10;
  }

  const passed = checks.every(c => c.severity !== "error" || c.passed);

  return {
    passed,
    checks,
    adjustedConfidence: Math.max(10, Math.min(100, confidence)),
  };
}

// ─── Main Analysis Orchestrator ───

export interface GeometryInput {
  lat: number;
  lng: number;
  /** ATTOM lot size */
  attomLotSizeSqFt: number | null;
  /** ATTOM lot dimensions */
  attomLotWidth: number | null;
  attomLotDepth: number | null;
  /** ATTOM footprint */
  attomFootprintSqFt: number | null;
  /** ATTOM living area */
  attomLivingAreaSqFt: number | null;
  /** ATTOM stories */
  attomStories: number | null;
  /** OSM buildings with polygon nodes */
  osmBuildings: Array<{
    areaSqFt: number;
    buildingType?: string;
    nodes: Array<{ lat: number; lon: number }>;
    levels?: number;
  }>;
  /** OSM bounding box */
  osmBoundingBox: [number, number, number, number] | null;
  /** Jurisdiction setbacks */
  frontSetbackFt: number;
  rearSetbackFt: number;
  sideSetbackFt: number;
  separationFt: number;
}

/**
 * Run the full geometry analysis pipeline.
 *
 * Footprint detection hierarchy:
 *   1. OSM building polygon vectors (real shape)
 *   2. ATTOM footprint data + parcel dimensions (rectangle approximation)
 *   3. Fallback low-confidence rectangle from estimated lot dimensions
 *
 * Source backbone enforcement:
 *   - ATTOM for lot size, APN, parcel dimensions (Tier 1 backbone)
 *   - OSM for building polygon shapes (Tier 2 geometry)
 *   - Official city sources for setbacks/zoning (Tier 1 backbone)
 */
export function analyzePropertyGeometry(input: GeometryInput): GeometryAnalysis {
  const {
    lat, lng,
    attomLotSizeSqFt, attomLotWidth, attomLotDepth,
    attomFootprintSqFt, attomLivingAreaSqFt, attomStories,
    osmBuildings, osmBoundingBox,
    frontSetbackFt, rearSetbackFt, sideSetbackFt, separationFt,
  } = input;

  // ── Step 1: Determine parcel polygon ──
  let parcelPolygon: GeometryPolygon;
  let parcelSource: string;

  if (attomLotWidth && attomLotDepth && attomLotWidth > 0 && attomLotDepth > 0) {
    // Best case: ATTOM has real lot dimensions
    parcelPolygon = createRectPolygon(lat, lng, attomLotWidth, attomLotDepth);
    parcelSource = "ATTOM Property Data (lot dimensions)";
  } else if (attomLotSizeSqFt && attomLotSizeSqFt > 0) {
    // ATTOM has lot size but no dimensions — estimate rectangular shape
    const estWidth = Math.round(Math.sqrt(attomLotSizeSqFt * 0.5));
    const estDepth = Math.round(attomLotSizeSqFt / estWidth);
    parcelPolygon = createRectPolygon(lat, lng, estWidth, estDepth);
    parcelSource = "ATTOM Property Data (lot size, estimated dimensions)";
  } else if (osmBoundingBox) {
    // Fallback to OSM bounding box
    const [minLat, maxLat, minLon, maxLon] = osmBoundingBox;
    parcelPolygon = {
      type: "Polygon",
      coordinates: [[
        [minLon, minLat],
        [maxLon, minLat],
        [maxLon, maxLat],
        [minLon, maxLat],
        [minLon, minLat],
      ]],
    };
    parcelSource = "OpenStreetMap Nominatim (bounding box estimate)";
  } else {
    // Last resort: estimate from typical residential lot
    parcelPolygon = createRectPolygon(lat, lng, 55, 110);
    parcelSource = "Estimated (no parcel data available)";
  }

  const parcelBBox = geoPolygonBBox(parcelPolygon);
  const parcelAreaSqFt = attomLotSizeSqFt || geoPolygonAreaSqFt(parcelPolygon);

  // ── Step 2: Detect structures as polygons ──
  let structures: DetectedStructure[] = [];
  let footprintSource: string;
  let geometryStatus: GeometryAnalysis["geometryStatus"];

  if (osmBuildings.length > 0) {
    // Best case: OSM has real building polygons
    structures = classifyStructures(osmBuildings, "OpenStreetMap building outlines");
    footprintSource = "OpenStreetMap building outlines (polygon vectors)";
    geometryStatus = "polygon-verified";
  } else if (attomFootprintSqFt && attomFootprintSqFt > 0) {
    // ATTOM has footprint area — create rectangle approximation
    const stories = attomStories || 1;
    const fpWidth = Math.round(Math.sqrt(attomFootprintSqFt * 0.65));
    const fpDepth = Math.round(attomFootprintSqFt / fpWidth);

    // Position structure slightly toward front of lot (typical placement)
    const offsetLat = -(parcelBBox.depthFt * 0.1 / M_TO_FT) / METERS_PER_DEG_LAT;
    const structurePoly = createRectPolygon(lat + offsetLat, lng, fpWidth, fpDepth);

    structures = [{
      classification: "main-residence",
      polygon: structurePoly,
      areaSqFt: attomFootprintSqFt,
      centroid: { lng, lat: lat + offsetLat },
      confidence: 70,
      source: "ATTOM Property Data (footprint area, rectangle approximation)",
      levels: stories,
    }];
    footprintSource = "ATTOM Property Data (rectangle approximation)";
    geometryStatus = "polygon-estimated";
  } else {
    // Last resort: estimate from lot size
    const estFootprint = Math.round(parcelAreaSqFt * 0.25);
    const fpWidth = Math.round(Math.sqrt(estFootprint * 0.65));
    const fpDepth = Math.round(estFootprint / fpWidth);
    const offsetLat = -(parcelBBox.depthFt * 0.1 / M_TO_FT) / METERS_PER_DEG_LAT;
    const structurePoly = createRectPolygon(lat + offsetLat, lng, fpWidth, fpDepth);

    structures = [{
      classification: "main-residence",
      polygon: structurePoly,
      areaSqFt: estFootprint,
      centroid: { lng, lat: lat + offsetLat },
      confidence: 35,
      source: "Estimated from lot size (low confidence)",
      levels: 1,
    }];
    footprintSource = "Estimated (no footprint data available)";
    geometryStatus = "rectangle-fallback";
  }

  // ── Step 3: Identify main structure and secondary structures ──
  const mainStructure = structures.find(s => s.classification === "main-residence") || structures[0] || null;
  const secondaryStructures = structures.filter(s => s !== mainStructure);

  // ── Step 4: Anchor main structure placement within parcel ──
  let placement: ParcelPlacement | null = null;
  if (mainStructure) {
    const measuredSetbacks = measureSetbacksToParcel(mainStructure.polygon, parcelPolygon);

    let placementMethod: ParcelPlacement["placementMethod"];
    if (geometryStatus === "polygon-verified") {
      placementMethod = "osm-anchored";
    } else if (attomLotWidth && attomLotDepth) {
      placementMethod = "centroid-estimated";
    } else {
      placementMethod = "fallback-centered";
    }

    placement = {
      structurePolygon: mainStructure.polygon,
      measuredSetbacks,
      fitsWithinParcel: measuredSetbacks.frontFt >= 0 && measuredSetbacks.rearFt >= 0 &&
                         measuredSetbacks.leftFt >= 0 && measuredSetbacks.rightFt >= 0,
      confidence: mainStructure.confidence,
      placementMethod,
    };
  }

  // ── Step 5: Compute setback envelope ──
  const setbackEnvelope = computeSetbackEnvelope(
    parcelPolygon, frontSetbackFt, rearSetbackFt, sideSetbackFt
  );

  // ── Step 6: Analyze leftover buildable zones ──
  let leftoverZones: LeftoverZone[] = [];
  if (mainStructure) {
    leftoverZones = analyzeLeftoverZones(
      parcelPolygon, mainStructure, secondaryStructures,
      frontSetbackFt, rearSetbackFt, sideSetbackFt, separationFt
    );
  }

  const bestAduZone = leftoverZones.find(z =>
    z.suitableFor.includes("Detached ADU") || z.suitableFor.includes("Small Detached ADU")
  ) || null;

  const bestSideYardZone = leftoverZones.find(z =>
    z.position === "left-side" || z.position === "right-side"
  ) || null;

  // ── Step 7: Identify attached ADU candidate walls ──
  const attachedCandidateWalls: ("rear" | "left" | "right")[] = [];
  if (placement) {
    if (placement.measuredSetbacks.rearFt >= 4) attachedCandidateWalls.push("rear");
    if (placement.measuredSetbacks.leftFt >= 8) attachedCandidateWalls.push("left");
    if (placement.measuredSetbacks.rightFt >= 8) attachedCandidateWalls.push("right");
  }

  // ── Step 8: Identify garage conversion candidate ──
  const garageConversionCandidate = secondaryStructures.find(
    s => s.classification === "detached-garage"
  ) || null;

  // ── Step 9: Calculate area summary ──
  const mainFootprintSqFt = mainStructure?.areaSqFt || 0;
  const mainLevels = mainStructure?.levels || (attomStories || 1);
  const mainLivingSqFt = attomLivingAreaSqFt || mainFootprintSqFt * mainLevels;
  const totalStructureFootprintSqFt = structures.reduce((s, st) => s + st.areaSqFt, 0);
  const totalLeftoverSqFt = leftoverZones.reduce((s, z) => s + z.areaSqFt, 0);
  const totalSetbackAreaSqFt = Math.max(0, parcelAreaSqFt - (setbackEnvelope ? geoPolygonAreaSqFt(setbackEnvelope) : 0));
  const bestBuildableZoneSqFt = bestAduZone?.areaSqFt || 0;

  // ── Step 10: Calculate overall geometry confidence ──
  let geometryConfidence: number;
  if (geometryStatus === "polygon-verified") {
    geometryConfidence = 80;
  } else if (geometryStatus === "polygon-estimated") {
    geometryConfidence = 55;
  } else {
    geometryConfidence = 30;
  }

  // Boost confidence if ATTOM backbone data is available
  if (attomLotSizeSqFt) geometryConfidence = Math.min(95, geometryConfidence + 5);
  if (attomLotWidth && attomLotDepth) geometryConfidence = Math.min(95, geometryConfidence + 5);
  if (attomFootprintSqFt) geometryConfidence = Math.min(95, geometryConfidence + 3);

  return {
    parcelPolygon,
    parcelBBox,
    structures,
    mainStructure,
    secondaryStructures,
    placement,
    setbackEnvelope,
    leftoverZones,
    bestAduZone,
    bestSideYardZone,
    attachedCandidateWalls,
    garageConversionCandidate,
    geometryConfidence,
    geometryStatus,
    parcelSource,
    footprintSource,
    areaSummary: {
      parcelSqFt: parcelAreaSqFt,
      mainFootprintSqFt,
      mainLivingSqFt,
      totalStructureFootprintSqFt,
      totalSetbackAreaSqFt,
      totalLeftoverSqFt,
      bestBuildableZoneSqFt,
    },
  };
}

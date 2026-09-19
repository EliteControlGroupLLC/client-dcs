// LiDAR / Elevation Intelligence Layer
//
// Real terrain analysis from the USGS 3D Elevation Program (3DEP) — the
// county-wide 1 m lidar-derived bare-earth DEM. Free and keyless.
//
// Data sources, in order:
//   1. USGS 3DEP ImageServer `getSamples` — every sample point in ONE request
//      (same 3DEP DEM that EPQS reads; typically 150–600 ms total).
//   2. USGS EPQS (Elevation Point Query Service) — one request per point,
//      concurrency-limited, per-request timeout + one retry. Used when the
//      batch endpoint is down.
//   3. Google Elevation API — only when a key is configured AND the API
//      actually answers status "OK" (the production key's GCP project has
//      billing disabled, so this normally never contributes).
//   If none respond inside the time budget the result is honestly
//   "unavailable" — never a fabricated "Mostly flat" default.
//
// Sampling covers the ACTUAL parcel: when the SANDAG/SanGIS parcel polygon is
// known, a regular grid is laid over its bounding box and only points inside
// the polygon are sampled. Without a polygon, a rectangle of the estimated
// lot dimensions around the geocoded point is used (lower confidence).
//
// From the samples this module derives: elevation change across the lot,
// average / median / max slope (per-point gradients on the grid), a
// least-squares plane fit (overall grade + aspect), the slope inside the
// likely ADU zone (rear yard) when that polygon is supplied, grading/retaining
// estimates and a foundation recommendation.

// ──────────────────────────────────────────────────────────
// Public types
// ──────────────────────────────────────────────────────────

export type SlopeCategory = "Flat" | "Gentle" | "Moderate" | "Steep" | "Very Steep";

export interface TerrainProfile {
  /** Elevation samples across the parcel (x/y = feet east/north of the parcel center) */
  samples: Array<{
    x: number;
    y: number;
    elevationFt: number;
    source: string;
  }>;
  /** Number of valid samples obtained */
  sampleCount: number;
  /** Grid spacing in feet */
  gridResolutionFt: number;
}

export interface SlopeAnalysis {
  /** Average slope across the parcel in percent (mean of per-point gradients) */
  averageSlopePercent: number;
  /** Maximum slope found */
  maxSlopePercent: number;
  /** Minimum slope found */
  minSlopePercent: number;
  /** Median slope (robust to a single steep bank on a graded pad lot) */
  medianSlopePercent: number;
  /** Overall grade of the least-squares plane through all samples */
  planeSlopePercent: number;
  /** Highest minus lowest sampled elevation on the lot (ft) */
  elevationChangeFt: number;
  /** Slope inside the likely ADU zone (rear yard), when that zone is known */
  aduAreaSlopePercent: number | null;
  /** Dominant downhill direction (compass bearing in degrees, 0=N, 90=E, etc.) */
  aspectDegrees: number;
  /** Compass direction label */
  aspectDirection: "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW";
  /** Slope category (from averageSlopePercent) — "Unknown" only when no data */
  category: SlopeCategory | "Unknown";
  /** Slope uniformity — how consistent is the slope across the parcel */
  uniformity: "uniform" | "variable" | "complex";
  /** Number of elevation samples used */
  sampleCount: number;
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
  type: "slab-on-grade" | "raised-foundation" | "pier-and-beam" | "stepped-foundation" | "caisson" | "undetermined";
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
  /** Whether USGS 3DEP (lidar-derived) elevation data was obtained */
  lidarAvailable: boolean;
  /** Data sources used */
  sources: string[];
  /** Overall terrain confidence (0-100) */
  confidence: number;
  /** Summary description */
  summary: string;
}

/** Raw sampling result shared by elevation-service and analyzeLiDARTerrain. */
export interface TerrainSampleResult {
  available: boolean;
  provider: "usgs-3dep-imageserver" | "usgs-epqs" | "google" | "none";
  /** Human-readable source label, e.g. "USGS 3DEP elevation (EPQS), 16 samples" */
  sourceLabel: string;
  samples: GridSample[];
  gridSpacingFt: number;
  /** True when the grid was clipped to the real parcel polygon */
  parcelClipped: boolean;
  durationMs: number;
  /** Why data is unavailable (only when available=false) */
  reason?: string;
  /** Lot-wide slope stats (null when unavailable) */
  stats: SlopeStats | null;
}

export interface SlopeStats {
  averageSlopePercent: number;
  medianSlopePercent: number;
  maxSlopePercent: number;
  minSlopePercent: number;
  planeSlopePercent: number;
  elevationChangeFt: number;
  aspectDegrees: number;
  category: SlopeCategory;
  uniformity: SlopeAnalysis["uniformity"];
  sampleCount: number;
}

export interface GridSample {
  i: number;
  j: number;
  /** feet east of origin */
  x: number;
  /** feet north of origin */
  y: number;
  lat: number;
  lng: number;
  elevationFt: number;
}

/** Esri/GeoJSON rings: [ring][vertex][lng, lat] in WGS84. */
export type LngLatRings = number[][][];

// ──────────────────────────────────────────────────────────
// Config
// ──────────────────────────────────────────────────────────

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
const USGS_IMAGESERVER_URL =
  "https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer/getSamples";
const USGS_EPQS_URL = "https://epqs.nationalmap.gov/v1/json";

/** Hard ceiling on total time spent fetching elevations for one analysis. */
const TOTAL_BUDGET_MS = 6000;
const BATCH_TIMEOUT_MS = 2200;
const BATCH_RETRY_TIMEOUT_MS = 1600;
const EPQS_TIMEOUT_MS = 1500;
const EPQS_CONCURRENCY = 8;
const EPQS_MAX_POINTS = 16;
const MIN_GRID_SPACING_FT = 8; // 3DEP DEM is ~1 m (3.3 ft); tighter spacing is just noise
const MIN_VALID_SAMPLES = 4;

const FT_PER_DEG_LAT = 364_173; // 111,000 m × 3.28084
const M_TO_FT = 3.28084;

// ──────────────────────────────────────────────────────────
// Classification
// ──────────────────────────────────────────────────────────

/** Flat (<5%), Gentle (5–10%), Moderate (10–15%), Steep (15–25%), Very Steep (>25%). */
export function classifySlopePercent(pct: number): SlopeCategory {
  if (pct < 5) return "Flat";
  if (pct < 10) return "Gentle";
  if (pct < 15) return "Moderate";
  if (pct < 25) return "Steep";
  return "Very Steep";
}

// ──────────────────────────────────────────────────────────
// Sampling (cached so elevation-service + analyzeLiDARTerrain share one fetch)
// ──────────────────────────────────────────────────────────

const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_MAX = 100;
const sampleCache = new Map<string, { t: number; p: Promise<TerrainSampleResult> }>();

function cacheKey(lat: number, lng: number, rings: LngLatRings | null | undefined, w: number, d: number): string {
  if (rings && rings.length > 0 && rings[0].length > 0) {
    let h = 0;
    for (const ring of rings) for (const [x, y] of ring) h = (h * 31 + Math.round(x * 1e6) * 7 + Math.round(y * 1e6)) | 0;
    return `rings:${rings.length}:${rings[0].length}:${h}`;
  }
  return `pt:${lat.toFixed(6)},${lng.toFixed(6)}:${Math.round(w)}x${Math.round(d)}`;
}

/**
 * Sample USGS 3DEP elevations across the parcel and compute lot-wide slope
 * statistics. Never throws; returns available=false with a reason on failure.
 * Results are memoised for 10 minutes per parcel.
 */
export function sampleParcelTerrain(
  lat: number,
  lng: number,
  opts: { parcelRings?: LngLatRings | null; lotWidthFt?: number; lotDepthFt?: number } = {}
): Promise<TerrainSampleResult> {
  const w = opts.lotWidthFt && opts.lotWidthFt > 0 ? opts.lotWidthFt : 60;
  const d = opts.lotDepthFt && opts.lotDepthFt > 0 ? opts.lotDepthFt : 120;
  const key = cacheKey(lat, lng, opts.parcelRings, w, d);
  const now = Date.now();
  const hit = sampleCache.get(key);
  if (hit && now - hit.t < CACHE_TTL_MS) return hit.p;
  // Also reuse a parcel-clipped result for the same point when the caller has no rings.
  if (!opts.parcelRings) {
    const alias = sampleCache.get(`alias:${lat.toFixed(6)},${lng.toFixed(6)}`);
    if (alias && now - alias.t < CACHE_TTL_MS) return alias.p;
  }

  const p = doSample(lat, lng, opts.parcelRings ?? null, w, d).then((res) => {
    // Don't keep failures around — the next request should retry USGS.
    if (!res.available) sampleCache.delete(key);
    return res;
  });
  if (sampleCache.size >= CACHE_MAX) {
    const oldest = sampleCache.keys().next().value;
    if (oldest !== undefined) sampleCache.delete(oldest);
  }
  sampleCache.set(key, { t: now, p });
  if (opts.parcelRings) sampleCache.set(`alias:${lat.toFixed(6)},${lng.toFixed(6)}`, { t: now, p });
  return p;
}

async function doSample(
  lat: number,
  lng: number,
  rings: LngLatRings | null,
  lotWidthFt: number,
  lotDepthFt: number
): Promise<TerrainSampleResult> {
  const started = Date.now();
  const deadline = started + TOTAL_BUDGET_MS;
  const validRings = rings && rings.length > 0 && rings[0].length >= 4 ? rings : null;

  const denseGrid = buildGrid(lat, lng, validRings, lotWidthFt, lotDepthFt, 36);
  const failures: string[] = [];

  const finish = (
    provider: TerrainSampleResult["provider"],
    label: string,
    samples: GridSample[],
    spacing: number
  ): TerrainSampleResult => {
    const stats = computeSlopeStats(samples, spacing);
    return {
      available: true,
      provider,
      sourceLabel: `${label}, ${samples.length} samples${validRings ? " across parcel" : " around geocoded point"}`,
      samples,
      gridSpacingFt: spacing,
      parcelClipped: Boolean(validRings),
      durationMs: Date.now() - started,
      stats,
    };
  };

  // 1. USGS 3DEP ImageServer — one request for all points, retried once.
  for (const timeout of [BATCH_TIMEOUT_MS, BATCH_RETRY_TIMEOUT_MS]) {
    const remaining = deadline - Date.now();
    if (remaining < 400) break;
    try {
      const got = await fetch3DEPBatch(denseGrid.points, Math.min(timeout, remaining));
      if (got.length >= MIN_VALID_SAMPLES) {
        return finish("usgs-3dep-imageserver", "USGS 3DEP elevation (ImageServer)", got, denseGrid.spacingFt);
      }
      failures.push(`3DEP ImageServer returned ${got.length} valid samples`);
    } catch (err) {
      failures.push(`3DEP ImageServer: ${errMsg(err)}`);
    }
  }

  // 2. USGS EPQS — per-point, concurrency-limited, retry once each.
  if (deadline - Date.now() > 800) {
    const sparseGrid = buildGrid(lat, lng, validRings, lotWidthFt, lotDepthFt, EPQS_MAX_POINTS);
    const got = await fetchEPQSPoints(sparseGrid.points.slice(0, EPQS_MAX_POINTS), deadline);
    if (got.length >= MIN_VALID_SAMPLES) {
      return finish("usgs-epqs", "USGS 3DEP elevation (EPQS)", got, sparseGrid.spacingFt);
    }
    failures.push(`EPQS returned ${got.length} valid samples`);
  }

  // 3. Google Elevation — only counts if the API actually answers "OK".
  if (GOOGLE_API_KEY && deadline - Date.now() > 500) {
    try {
      const got = await fetchGoogleElevations(denseGrid.points, Math.min(2000, deadline - Date.now()));
      if (got.length >= MIN_VALID_SAMPLES) {
        return finish("google", "Google Elevation API", got, denseGrid.spacingFt);
      }
      failures.push("Google Elevation returned too few samples");
    } catch (err) {
      failures.push(`Google Elevation: ${errMsg(err)}`);
    }
  }

  console.error(`[ELEVATION] USGS elevation unavailable after ${Date.now() - started} ms: ${failures.join("; ")}`);
  return {
    available: false,
    provider: "none",
    sourceLabel: "USGS elevation service unavailable",
    samples: [],
    gridSpacingFt: denseGrid.spacingFt,
    parcelClipped: Boolean(validRings),
    durationMs: Date.now() - started,
    reason: failures.join("; ") || "no elevation provider responded",
    stats: null,
  };
}

function errMsg(err: unknown): string {
  if (err instanceof Error) return err.name === "TimeoutError" || err.name === "AbortError" ? "timeout" : err.message;
  return String(err);
}

// ──────────────────────────────────────────────────────────
// Grid construction
// ──────────────────────────────────────────────────────────

interface GridPoint {
  i: number;
  j: number;
  x: number;
  y: number;
  lat: number;
  lng: number;
}

function pointInRings(lng: number, lat: number, rings: LngLatRings): boolean {
  // Even-odd rule across all rings (handles holes and multi-part parcels).
  let inside = false;
  for (const ring of rings) {
    for (let a = 0, b = ring.length - 1; a < ring.length; b = a++) {
      const [xa, ya] = ring[a];
      const [xb, yb] = ring[b];
      if (ya > lat !== yb > lat && lng < ((xb - xa) * (lat - ya)) / (yb - ya) + xa) inside = !inside;
    }
  }
  return inside;
}

/**
 * Regular grid over the parcel (clipped to the polygon) with roughly
 * `target` points inside. Origin (x=0,y=0) is the bbox center.
 */
function buildGrid(
  lat: number,
  lng: number,
  rings: LngLatRings | null,
  lotWidthFt: number,
  lotDepthFt: number,
  target: number
): { points: GridPoint[]; spacingFt: number } {
  let minLng: number, maxLng: number, minLat: number, maxLat: number;
  if (rings) {
    minLng = Infinity; maxLng = -Infinity; minLat = Infinity; maxLat = -Infinity;
    for (const ring of rings) {
      for (const [x, y] of ring) {
        if (x < minLng) minLng = x;
        if (x > maxLng) maxLng = x;
        if (y < minLat) minLat = y;
        if (y > maxLat) maxLat = y;
      }
    }
  } else {
    const dLat = lotDepthFt / 2 / FT_PER_DEG_LAT;
    const dLng = lotWidthFt / 2 / (FT_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180));
    minLat = lat - dLat; maxLat = lat + dLat; minLng = lng - dLng; maxLng = lng + dLng;
  }

  const lat0 = (minLat + maxLat) / 2;
  const lng0 = (minLng + maxLng) / 2;
  const ftPerDegLng = FT_PER_DEG_LAT * Math.cos((lat0 * Math.PI) / 180);
  const widthFt = Math.max(1, (maxLng - minLng) * ftPerDegLng);
  const heightFt = Math.max(1, (maxLat - minLat) * FT_PER_DEG_LAT);

  const gen = (spacing: number): GridPoint[] => {
    const nx = Math.max(1, Math.floor(widthFt / spacing));
    const ny = Math.max(1, Math.floor(heightFt / spacing));
    // Center the grid inside the bbox
    const x0 = -((nx - 1) * spacing) / 2;
    const y0 = -((ny - 1) * spacing) / 2;
    const pts: GridPoint[] = [];
    for (let i = 0; i < nx; i++) {
      for (let j = 0; j < ny; j++) {
        const x = x0 + i * spacing;
        const y = y0 + j * spacing;
        const pLat = lat0 + y / FT_PER_DEG_LAT;
        const pLng = lng0 + x / ftPerDegLng;
        if (rings && !pointInRings(pLng, pLat, rings)) continue;
        pts.push({ i, j, x, y, lat: pLat, lng: pLng });
      }
    }
    return pts;
  };

  // Start from the bbox area; shrink spacing until enough points land inside.
  let spacing = Math.max(MIN_GRID_SPACING_FT, Math.sqrt((widthFt * heightFt) / target));
  let pts = gen(spacing);
  for (let k = 0; k < 8 && pts.length < Math.min(target * 0.6, 12) && spacing > MIN_GRID_SPACING_FT; k++) {
    spacing = Math.max(MIN_GRID_SPACING_FT, spacing * 0.8);
    pts = gen(spacing);
  }
  // Too many (very compact polygon inside large bbox): widen a bit.
  for (let k = 0; k < 6 && pts.length > target * 1.5; k++) {
    spacing *= 1.15;
    pts = gen(spacing);
  }
  if (pts.length === 0) {
    // Sliver parcel — at least sample the geocoded point.
    pts = [{ i: 0, j: 0, x: (lng - lng0) * ftPerDegLng, y: (lat - lat0) * FT_PER_DEG_LAT, lat, lng }];
  }
  return { points: pts, spacingFt: Math.round(spacing * 10) / 10 };
}

// ──────────────────────────────────────────────────────────
// Providers
// ──────────────────────────────────────────────────────────

async function fetch3DEPBatch(points: GridPoint[], timeoutMs: number): Promise<GridSample[]> {
  const url = new URL(USGS_IMAGESERVER_URL);
  url.searchParams.set(
    "geometry",
    JSON.stringify({
      points: points.map((p) => [Number(p.lng.toFixed(7)), Number(p.lat.toFixed(7))]),
      spatialReference: { wkid: 4326 },
    })
  );
  url.searchParams.set("geometryType", "esriGeometryMultipoint");
  url.searchParams.set("returnFirstValueOnly", "true");
  url.searchParams.set("interpolation", "RSP_BilinearInterpolation");
  url.searchParams.set("f", "json");

  const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs), cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as {
    samples?: Array<{ locationId?: number; value?: string | number }>;
    error?: { message?: string };
  };
  if (data.error) throw new Error(data.error.message || "service error");
  const out: GridSample[] = [];
  for (const s of data.samples ?? []) {
    const idx = typeof s.locationId === "number" ? s.locationId : -1;
    const meters = typeof s.value === "number" ? s.value : parseFloat(String(s.value));
    if (idx < 0 || idx >= points.length || !Number.isFinite(meters) || meters < -500 || meters > 9000) continue;
    out.push({ ...points[idx], elevationFt: meters * M_TO_FT });
  }
  return out;
}

async function fetchEPQSPoint(p: GridPoint, deadline: number): Promise<GridSample | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const remaining = deadline - Date.now();
    if (remaining < 250) return null;
    try {
      const url = `${USGS_EPQS_URL}?x=${p.lng.toFixed(7)}&y=${p.lat.toFixed(7)}&wkid=4326&units=Feet&includeDate=false`;
      const res = await fetch(url, { signal: AbortSignal.timeout(Math.min(EPQS_TIMEOUT_MS, remaining)), cache: "no-store" });
      if (!res.ok) continue;
      const data = (await res.json()) as { value?: number | string };
      const ft = typeof data?.value === "number" ? data.value : parseFloat(String(data?.value));
      if (Number.isFinite(ft) && ft > -1000 && ft < 30000) return { ...p, elevationFt: ft };
      return null; // "no data" at this point — retrying won't help
    } catch {
      // timeout / network — retry once
    }
  }
  return null;
}

async function fetchEPQSPoints(points: GridPoint[], deadline: number): Promise<GridSample[]> {
  const results: Array<GridSample | null> = new Array(points.length).fill(null);
  let next = 0;
  const worker = async () => {
    while (next < points.length) {
      const k = next++;
      results[k] = await fetchEPQSPoint(points[k], deadline);
    }
  };
  await Promise.all(Array.from({ length: Math.min(EPQS_CONCURRENCY, points.length) }, worker));
  return results.filter((r): r is GridSample => r !== null);
}

async function fetchGoogleElevations(points: GridPoint[], timeoutMs: number): Promise<GridSample[]> {
  if (!GOOGLE_API_KEY) return [];
  const locations = points.map((p) => `${p.lat.toFixed(7)},${p.lng.toFixed(7)}`).join("|");
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/elevation/json?locations=${locations}&key=${GOOGLE_API_KEY}`,
    { signal: AbortSignal.timeout(timeoutMs), cache: "no-store" }
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as { status: string; results?: Array<{ elevation: number }> };
  if (data.status !== "OK" || !data.results) throw new Error(`status ${data.status}`);
  const out: GridSample[] = [];
  for (let k = 0; k < Math.min(points.length, data.results.length); k++) {
    const m = data.results[k].elevation;
    if (Number.isFinite(m)) out.push({ ...points[k], elevationFt: m * M_TO_FT });
  }
  return out;
}

// ──────────────────────────────────────────────────────────
// Slope math
// ──────────────────────────────────────────────────────────

/** Least-squares plane z = a·x + b·y + c. Returns gradient (ft/ft) components. */
function fitPlane(samples: Array<{ x: number; y: number; elevationFt: number }>): { a: number; b: number } | null {
  const n = samples.length;
  if (n < 3) return null;
  let mx = 0, my = 0, mz = 0;
  for (const s of samples) { mx += s.x; my += s.y; mz += s.elevationFt; }
  mx /= n; my /= n; mz /= n;
  let sxx = 0, syy = 0, sxy = 0, sxz = 0, syz = 0;
  for (const s of samples) {
    const dx = s.x - mx, dy = s.y - my, dz = s.elevationFt - mz;
    sxx += dx * dx; syy += dy * dy; sxy += dx * dy; sxz += dx * dz; syz += dy * dz;
  }
  const det = sxx * syy - sxy * sxy;
  if (Math.abs(det) < 1e-9) {
    // Collinear samples — slope along the line only.
    if (sxx > 1e-9) return { a: sxz / sxx, b: 0 };
    if (syy > 1e-9) return { a: 0, b: syz / syy };
    return null;
  }
  return { a: (sxz * syy - syz * sxy) / det, b: (syz * sxx - sxz * sxy) / det };
}

function bearingDownhill(a: number, b: number): number {
  // Downhill = -gradient. Compass bearing: atan2(east, north).
  let deg = (Math.atan2(-a, -b) * 180) / Math.PI;
  if (deg < 0) deg += 360;
  return deg;
}

function round1(v: number): number {
  return Math.round(v * 10) / 10;
}

/** Per-point gradients from grid neighbours (central differences where possible). */
function gridGradients(samples: GridSample[], spacing: number): number[] {
  const byIdx = new Map<string, number>();
  for (const s of samples) byIdx.set(`${s.i},${s.j}`, s.elevationFt);
  const z = (i: number, j: number) => byIdx.get(`${i},${j}`);
  const out: number[] = [];
  for (const s of samples) {
    const e = z(s.i + 1, s.j), w = z(s.i - 1, s.j), n = z(s.i, s.j + 1), so = z(s.i, s.j - 1);
    let gx: number | null = null, gy: number | null = null;
    if (e !== undefined && w !== undefined) gx = (e - w) / (2 * spacing);
    else if (e !== undefined) gx = (e - s.elevationFt) / spacing;
    else if (w !== undefined) gx = (s.elevationFt - w) / spacing;
    if (n !== undefined && so !== undefined) gy = (n - so) / (2 * spacing);
    else if (n !== undefined) gy = (n - s.elevationFt) / spacing;
    else if (so !== undefined) gy = (s.elevationFt - so) / spacing;
    if (gx === null || gy === null) continue;
    out.push(Math.sqrt(gx * gx + gy * gy) * 100);
  }
  return out;
}

export function computeSlopeStats(samples: GridSample[], spacing: number): SlopeStats {
  const elevs = samples.map((s) => s.elevationFt);
  const elevationChangeFt = elevs.length ? Math.max(...elevs) - Math.min(...elevs) : 0;
  const plane = fitPlane(samples);
  const planeSlope = plane ? Math.sqrt(plane.a * plane.a + plane.b * plane.b) * 100 : 0;

  let gradients = gridGradients(samples, spacing);
  if (gradients.length < 3) {
    // Sparse / irregular samples: fall back to pairwise slopes between near neighbours.
    gradients = [];
    for (let a = 0; a < samples.length; a++) {
      for (let b = a + 1; b < samples.length; b++) {
        const dist = Math.hypot(samples[b].x - samples[a].x, samples[b].y - samples[a].y);
        if (dist > 0 && dist <= spacing * 1.6) {
          gradients.push((Math.abs(samples[b].elevationFt - samples[a].elevationFt) / dist) * 100);
        }
      }
    }
    if (gradients.length === 0) gradients = [planeSlope];
  }
  const sorted = [...gradients].sort((p, q) => p - q);
  const mean = gradients.reduce((p, q) => p + q, 0) / gradients.length;
  const median = sorted[Math.floor(sorted.length / 2)];
  const std = calculateStdDev(gradients);

  return {
    averageSlopePercent: round1(mean),
    medianSlopePercent: round1(median),
    maxSlopePercent: round1(sorted[sorted.length - 1]),
    minSlopePercent: round1(sorted[0]),
    planeSlopePercent: round1(planeSlope),
    elevationChangeFt: round1(elevationChangeFt),
    aspectDegrees: plane ? Math.round(bearingDownhill(plane.a, plane.b)) : 0,
    category: classifySlopePercent(mean),
    uniformity: std < 3 ? "uniform" : std < 8 ? "variable" : "complex",
    sampleCount: samples.length,
  };
}

// ──────────────────────────────────────────────────────────
// ADU-zone (rear yard) slope
// ──────────────────────────────────────────────────────────

async function aduZoneSlope(
  lot: TerrainSampleResult,
  zoneRings: LngLatRings,
  deadlineMs: number
): Promise<number | null> {
  if (!zoneRings.length || zoneRings[0].length < 4) return null;
  // Reuse lot samples that fall inside the zone when there are enough.
  const inside = lot.samples.filter((s) => pointInRings(s.lng, s.lat, zoneRings));
  if (inside.length >= 5) {
    const plane = fitPlane(inside);
    if (plane) return round1(Math.sqrt(plane.a ** 2 + plane.b ** 2) * 100);
  }
  // Otherwise one cheap batch request for a small grid inside the zone.
  if (lot.provider !== "usgs-3dep-imageserver" && lot.provider !== "usgs-epqs") return null;
  const c = zoneRings[0][0];
  const grid = buildGrid(c[1], c[0], zoneRings, 0, 0, 12);
  if (grid.points.length < 3) return null;
  try {
    const got = await fetch3DEPBatch(grid.points, deadlineMs);
    const plane = got.length >= 3 ? fitPlane(got) : null;
    return plane ? round1(Math.sqrt(plane.a ** 2 + plane.b ** 2) * 100) : null;
  } catch {
    return null;
  }
}

// ──────────────────────────────────────────────────────────
// Main entry
// ──────────────────────────────────────────────────────────

/**
 * Analyze terrain from real USGS 3DEP elevations sampled across the parcel.
 * `parcelRings` (SANDAG polygon) makes the grid cover the actual lot;
 * `aduZoneRings` (best ADU zone, usually the rear yard) adds the slope where
 * the ADU would go. Returns lidarAvailable=false + category "Unknown" when
 * no elevation provider answered — never a fabricated flat default.
 */
export async function analyzeLiDARTerrain(
  lat: number,
  lng: number,
  lotWidthFt: number = 60,
  lotDepthFt: number = 120,
  aduFootprintSqFt: number = 800,
  opts: { parcelRings?: LngLatRings | null; aduZoneRings?: LngLatRings | null } = {}
): Promise<LiDARTerrainResult> {
  const lot = await sampleParcelTerrain(lat, lng, { parcelRings: opts.parcelRings, lotWidthFt, lotDepthFt });
  if (!lot.available || !lot.stats) {
    return buildUnavailableResult(lot.reason);
  }
  const stats = lot.stats;
  const aduSlope = opts.aduZoneRings ? await aduZoneSlope(lot, opts.aduZoneRings, 1500) : null;

  const slopeAnalysis: SlopeAnalysis = {
    averageSlopePercent: stats.averageSlopePercent,
    maxSlopePercent: stats.maxSlopePercent,
    minSlopePercent: stats.minSlopePercent,
    medianSlopePercent: stats.medianSlopePercent,
    planeSlopePercent: stats.planeSlopePercent,
    elevationChangeFt: stats.elevationChangeFt,
    aduAreaSlopePercent: aduSlope,
    aspectDegrees: stats.aspectDegrees,
    aspectDirection: degToCompass(stats.aspectDegrees),
    category: stats.category,
    uniformity: stats.uniformity,
    sampleCount: stats.sampleCount,
  };

  // Grading/foundation are driven by the grade where the ADU would sit when
  // we know it (a graded flat pad with a steep rear bank shouldn't be priced
  // like a hillside), else by the lot average.
  const designSlope = aduSlope ?? stats.averageSlopePercent;
  const gradingEstimate = estimateGrading(aduFootprintSqFt, designSlope);
  const foundationRecommendation = recommendFoundation(designSlope, aduSlope !== null);
  const isUSGS = lot.provider === "usgs-3dep-imageserver" || lot.provider === "usgs-epqs";
  const confidence = calculateTerrainConfidence(lot, slopeAnalysis);

  const sources = [lot.sourceLabel];
  if (aduSlope !== null) sources.push("ADU-zone slope from USGS 3DEP samples inside the rear-yard zone");

  return {
    terrainProfile: {
      samples: lot.samples.map((s) => ({ x: round1(s.x), y: round1(s.y), elevationFt: round1(s.elevationFt), source: lot.provider })),
      sampleCount: lot.samples.length,
      gridResolutionFt: lot.gridSpacingFt,
    },
    slopeAnalysis,
    gradingEstimate,
    foundationRecommendation,
    lidarAvailable: isUSGS,
    sources,
    confidence,
    summary: generateTerrainSummary(slopeAnalysis, gradingEstimate, foundationRecommendation),
  };
}

/**
 * Estimate grading requirements for ADU construction from the design slope.
 */
function estimateGrading(aduFootprintSqFt: number, slopePct: number): GradingEstimate {
  // Flat band (<5%): ordinary pad prep only — no separate grading line item.
  if (slopePct < 5) {
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

  // Size the pad for a real ADU (callers may pass the whole candidate zone
  // area) and cap the grade used by this simple wedge model — above ~35%
  // the answer is "engineer it" (see foundation + manual review), not a
  // bigger cut/fill number.
  const footprint = Math.min(Math.max(aduFootprintSqFt, 300), 1200);
  const modelSlope = Math.min(slopePct, 35);
  const aduWidth = Math.sqrt(footprint * 0.65);
  const aduDepth = footprint / aduWidth;
  // Elevation change across the ADU footprint
  const elevChange = (modelSlope / 100) * aduDepth;

  // Simplified balanced cut/fill wedge: cut half the footprint to mid-height.
  const cutVolume = Math.round((0.5 * aduWidth * aduDepth * (elevChange / 2)) / 27);
  const fillVolume = Math.round(cutVolume * 0.85);
  const gradingCostPerCuYd = modelSlope > 15 ? 25 : 18;
  const gradingCost = Math.round((cutVolume + fillVolume) * gradingCostPerCuYd);

  const retainingWallLikely = slopePct >= 10 || elevChange > 3;
  const retainingWallLength = retainingWallLikely ? Math.round(aduWidth + aduDepth * 0.5) : 0;
  const wallCostPerLf = elevChange > 6 ? 150 : elevChange > 3 ? 100 : 60;

  return {
    gradingRequired: true,
    estimatedCutCuYd: cutVolume,
    estimatedFillCuYd: fillVolume,
    estimatedGradingCost: gradingCost,
    retainingWallLikely,
    estimatedRetainingWallLf: retainingWallLength,
    estimatedRetainingWallCost: retainingWallLength * wallCostPerLf,
  };
}

/**
 * Recommend foundation type from the design slope (same bands as classifySlopePercent).
 */
function recommendFoundation(slopePct: number, fromAduZone: boolean): FoundationRecommendation {
  const where = fromAduZone ? "in the likely ADU area" : "across the lot";
  const pct = `${round1(slopePct)}%`;
  if (slopePct < 5) {
    return {
      type: "slab-on-grade",
      reason: `Measured grade ${where} is ${pct} (flat) — standard slab-on-grade is appropriate.`,
      additionalCostEstimate: 0,
      confidence: 85,
    };
  }
  if (slopePct < 10) {
    return {
      type: "raised-foundation",
      reason: `Gentle ${pct} grade ${where} — raised perimeter footing or minor pad grading to keep a level floor.`,
      additionalCostEstimate: 8000,
      confidence: 78,
    };
  }
  if (slopePct < 15) {
    return {
      type: "stepped-foundation",
      reason: `Moderate ${pct} grade ${where} — stepped footings and some grading/retaining likely.`,
      additionalCostEstimate: 18000,
      confidence: 72,
    };
  }
  if (slopePct < 25) {
    return {
      type: "pier-and-beam",
      reason: `Steep ${pct} grade ${where} — engineered pier/grade-beam foundation, retaining walls and grading; structural/civil engineering expected.`,
      additionalCostEstimate: 35000,
      confidence: 65,
    };
  }
  return {
    type: "caisson",
    reason: `Very steep ${pct} grade ${where} — drilled piers/caissons and a geotechnical report are typically required. Manual review recommended.`,
    additionalCostEstimate: 55000,
    confidence: 50,
  };
}

function calculateTerrainConfidence(lot: TerrainSampleResult, slope: SlopeAnalysis): number {
  let confidence = 45;
  if (lot.provider === "usgs-3dep-imageserver" || lot.provider === "usgs-epqs") confidence += 20; // 1 m lidar DEM
  if (lot.parcelClipped) confidence += 10;
  if (slope.sampleCount >= 12) confidence += 10;
  else if (slope.sampleCount >= 6) confidence += 5;
  if (slope.uniformity === "complex") confidence -= 5;
  return Math.min(92, Math.max(20, confidence));
}

function generateTerrainSummary(
  slope: SlopeAnalysis,
  grading: GradingEstimate,
  foundation: FoundationRecommendation
): string {
  const parts: string[] = [];
  parts.push(
    `Terrain is ${slope.category.toLowerCase()}: ${slope.averageSlopePercent}% average slope (max ${slope.maxSlopePercent}%), ~${Math.round(slope.elevationChangeFt)} ft elevation change across the lot, draining ${slope.aspectDirection}`
  );
  if (slope.aduAreaSlopePercent !== null) parts.push(`Likely ADU area grade is ${slope.aduAreaSlopePercent}%`);
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
  return dirs[Math.round(deg / 45) % 8];
}

function calculateStdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(values.reduce((a, v) => a + (v - mean) ** 2, 0) / values.length);
}

function buildUnavailableResult(reason?: string): LiDARTerrainResult {
  return {
    terrainProfile: { samples: [], sampleCount: 0, gridResolutionFt: 0 },
    slopeAnalysis: {
      averageSlopePercent: 0,
      maxSlopePercent: 0,
      minSlopePercent: 0,
      medianSlopePercent: 0,
      planeSlopePercent: 0,
      elevationChangeFt: 0,
      aduAreaSlopePercent: null,
      aspectDegrees: 0,
      aspectDirection: "N",
      category: "Unknown",
      uniformity: "uniform",
      sampleCount: 0,
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
      type: "undetermined",
      reason: "Slope could not be measured (USGS elevation service unavailable) — foundation type depends on a site survey.",
      additionalCostEstimate: 0,
      confidence: 0,
    },
    lidarAvailable: false,
    sources: [`USGS elevation service unavailable${reason ? ` (${reason})` : ""}`],
    confidence: 0,
    summary: "Slope not available — the USGS elevation service did not respond. A site survey is needed to confirm grade.",
  };
}

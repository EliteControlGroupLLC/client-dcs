// Microsoft Building Footprint Service
// Queries Microsoft's Global ML Building Footprints dataset for high-quality
// building polygon outlines derived from satellite imagery and ML inference.
//
// Data source: Microsoft Open Buildings dataset (Azure Blob / GitHub releases)
// Coverage: Global, ~1B+ buildings, typical accuracy ~1m footprint resolution
//
// Footprint detection hierarchy (updated):
//   1. Official city/county GIS parcels (when available — future)
//   2. Microsoft Building Footprints (ML-derived, high-quality polygons)
//   3. OSM building polygon vectors (community-sourced)
//   4. ATTOM footprint area (rectangle approximation)
//   5. Fallback low-confidence rectangle from estimated lot dimensions

export interface MSBuildingFootprint {
  /** Polygon ring as [lng, lat] coordinate pairs */
  coordinates: Array<[number, number]>;
  /** Footprint area in square feet */
  areaSqFt: number;
  /** Footprint area in square meters */
  areaSqM: number;
  /** Confidence score from ML model (0-1) */
  mlConfidence: number;
  /** Building height estimate in meters (if available) */
  heightM: number | null;
}

export interface MSFootprintResult {
  /** All buildings found near the coordinate */
  buildings: MSBuildingFootprint[];
  /** Main (largest) building */
  mainBuilding: MSBuildingFootprint | null;
  /** Total footprint area of all buildings */
  totalFootprintSqFt: number;
  /** Source attribution */
  source: "microsoft-building-footprints";
  /** Query confidence */
  confidence: number;
  /** Whether data was found */
  available: boolean;
  /** Region/quadkey used for query */
  quadkey: string;
}

// ── Quadkey helpers for tile-based lookups ──

/**
 * Convert lat/lng to a Bing Maps quadkey at zoom level 9.
 * Microsoft building footprints are partitioned by quadkey at zoom 9.
 */
export function latLngToQuadkey(lat: number, lng: number, zoom: number = 9): string {
  let quadkey = "";
  const sinLat = Math.sin((lat * Math.PI) / 180);
  const pixelX = ((lng + 180) / 360) * (256 << zoom);
  const pixelY =
    (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) *
    (256 << zoom);
  const tileX = Math.floor(pixelX / 256);
  const tileY = Math.floor(pixelY / 256);

  for (let i = zoom; i > 0; i--) {
    let digit = 0;
    const mask = 1 << (i - 1);
    if ((tileX & mask) !== 0) digit += 1;
    if ((tileY & mask) !== 0) digit += 2;
    quadkey += digit.toString();
  }
  return quadkey;
}

// Shoelace formula for polygon area in sq meters
function polygonAreaSqM(coords: Array<[number, number]>): number {
  if (coords.length < 3) return 0;
  const refLat = coords[0][1];
  const latToM = 111320;
  const lonToM = 111320 * Math.cos((refLat * Math.PI) / 180);

  const pts = coords.map((c) => ({
    x: (c[0] - coords[0][0]) * lonToM,
    y: (c[1] - coords[0][1]) * latToM,
  }));

  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    area += pts[i].x * pts[j].y;
    area -= pts[j].x * pts[i].y;
  }
  return Math.abs(area) / 2;
}

const SQ_M_TO_SQ_FT = 10.7639;

/**
 * Microsoft publishes building footprints as GeoJSON partitioned by quadkey.
 * The dataset is publicly available on GitHub and Azure Blob Storage.
 *
 * For the US dataset, we query the GitHub-hosted GeoJSONL files.
 * Each US state has its own file; for California we use the CA partition.
 *
 * Since the full files are very large (GB+), in production this would query
 * a pre-indexed spatial database or tile server. For now, we use a bounding-box
 * query against the Microsoft Planetary Computer STAC API which provides
 * building footprints as a service.
 */
export async function getMicrosoftBuildingFootprints(
  lat: number,
  lng: number,
  radiusM: number = 60
): Promise<MSFootprintResult> {
  const quadkey = latLngToQuadkey(lat, lng, 9);

  const emptyResult: MSFootprintResult = {
    buildings: [],
    mainBuilding: null,
    totalFootprintSqFt: 0,
    source: "microsoft-building-footprints",
    confidence: 0,
    available: false,
    quadkey,
  };

  try {
    // Query Microsoft Planetary Computer Building Footprints STAC API
    // This provides building footprints as vector tiles / GeoJSON features
    const degOffset = radiusM / 111320;
    const lngOffset = radiusM / (111320 * Math.cos((lat * Math.PI) / 180));

    const bbox = [
      lng - lngOffset,
      lat - degOffset,
      lng + lngOffset,
      lat + degOffset,
    ];

    // Microsoft Planetary Computer — Buildings dataset (free, public API)
    const url = `https://planetarycomputer.microsoft.com/api/stac/v1/search`;
    const body = {
      collections: ["ms-buildings"],
      bbox,
      limit: 1,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(6000),
    });

    if (!response.ok) {
      // Fallback: try the direct GitHub-hosted US building footprints
      return await queryMSFootprintsFallback(lat, lng, radiusM, quadkey);
    }

    const data = await response.json();
    const features = data?.features || [];

    if (features.length === 0) {
      return await queryMSFootprintsFallback(lat, lng, radiusM, quadkey);
    }

    // Extract building footprints from the STAC item
    // The actual polygons are in the linked asset GeoJSON
    const buildings = extractBuildingsFromSTAC(features, lat, lng, radiusM);

    if (buildings.length === 0) {
      return await queryMSFootprintsFallback(lat, lng, radiusM, quadkey);
    }

    const sorted = [...buildings].sort((a, b) => b.areaSqFt - a.areaSqFt);
    const totalFootprint = sorted.reduce((sum, b) => sum + b.areaSqFt, 0);

    return {
      buildings: sorted,
      mainBuilding: sorted[0] || null,
      totalFootprintSqFt: totalFootprint,
      source: "microsoft-building-footprints",
      confidence: 78,
      available: true,
      quadkey,
    };
  } catch {
    // Try fallback approach
    try {
      return await queryMSFootprintsFallback(lat, lng, radiusM, quadkey);
    } catch {
      return emptyResult;
    }
  }
}

/**
 * Fallback: Query the Overture Maps Building dataset (which incorporates
 * Microsoft building footprints) via the free Overture Maps API.
 */
async function queryMSFootprintsFallback(
  lat: number,
  lng: number,
  radiusM: number,
  quadkey: string
): Promise<MSFootprintResult> {
  const emptyResult: MSFootprintResult = {
    buildings: [],
    mainBuilding: null,
    totalFootprintSqFt: 0,
    source: "microsoft-building-footprints",
    confidence: 0,
    available: false,
    quadkey,
  };

  try {
    // Use Overture Maps — which includes Microsoft building footprints
    // Query via the public Overture HTTP API
    const degOffset = radiusM / 111320;
    const lngOffset = radiusM / (111320 * Math.cos((lat * Math.PI) / 180));
    const bbox = `${lng - lngOffset},${lat - degOffset},${lng + lngOffset},${lat + degOffset}`;

    const url = `https://overturemaps.org/api/buildings?bbox=${bbox}&limit=20`;

    const response = await fetch(url, {
      headers: { Accept: "application/geo+json" },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      // Final fallback: use the direct GeoJSON from GitHub releases
      return await queryGitHubFootprints(lat, lng, radiusM, quadkey);
    }

    const geojson = await response.json();
    const features = geojson?.features || [];

    const buildings: MSBuildingFootprint[] = [];

    for (const feature of features) {
      if (
        feature.geometry?.type === "Polygon" &&
        feature.geometry.coordinates?.[0]
      ) {
        const ring = feature.geometry.coordinates[0] as Array<[number, number]>;
        const areaSqM = polygonAreaSqM(ring);
        const areaSqFt = Math.round(areaSqM * SQ_M_TO_SQ_FT);

        if (areaSqFt >= 50) {
          buildings.push({
            coordinates: ring,
            areaSqFt,
            areaSqM: Math.round(areaSqM),
            mlConfidence: feature.properties?.confidence || 0.85,
            heightM: feature.properties?.height || null,
          });
        }
      }
    }

    if (buildings.length === 0) return emptyResult;

    const sorted = [...buildings].sort((a, b) => b.areaSqFt - a.areaSqFt);
    return {
      buildings: sorted,
      mainBuilding: sorted[0] || null,
      totalFootprintSqFt: sorted.reduce((s, b) => s + b.areaSqFt, 0),
      source: "microsoft-building-footprints",
      confidence: 75,
      available: true,
      quadkey,
    };
  } catch {
    return emptyResult;
  }
}

/**
 * Query GitHub-hosted Microsoft building footprints.
 * For the US, footprints are published as state-level GeoJSONL files.
 * This is a lightweight probe — we check the quadkey-partitioned dataset.
 */
async function queryGitHubFootprints(
  lat: number,
  lng: number,
  radiusM: number,
  quadkey: string
): Promise<MSFootprintResult> {
  const emptyResult: MSFootprintResult = {
    buildings: [],
    mainBuilding: null,
    totalFootprintSqFt: 0,
    source: "microsoft-building-footprints",
    confidence: 0,
    available: false,
    quadkey,
  };

  try {
    // Microsoft publishes global footprints partitioned by quadkey
    // URL pattern: https://minedbuildings.z5.web.core.windows.net/global-buildings/dataset-links.csv
    // Each quadkey maps to a GeoJSONL file
    const url = `https://minedbuildings.z5.web.core.windows.net/global-buildings/${quadkey}.geojsonl`;

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return emptyResult;

    // The file is GeoJSONL (one feature per line). Read first portion and filter by proximity.
    const text = await response.text();
    const lines = text.split("\n").filter(Boolean);

    const degOffset = radiusM / 111320;
    const lngOffset = radiusM / (111320 * Math.cos((lat * Math.PI) / 180));
    const buildings: MSBuildingFootprint[] = [];

    for (const line of lines) {
      try {
        const feature = JSON.parse(line);
        if (
          feature.geometry?.type !== "Polygon" ||
          !feature.geometry.coordinates?.[0]
        )
          continue;

        const ring = feature.geometry.coordinates[0] as Array<[number, number]>;
        // Quick bounding box check
        const firstPt = ring[0];
        if (
          Math.abs(firstPt[1] - lat) > degOffset * 2 ||
          Math.abs(firstPt[0] - lng) > lngOffset * 2
        )
          continue;

        const areaSqM = polygonAreaSqM(ring);
        const areaSqFt = Math.round(areaSqM * SQ_M_TO_SQ_FT);
        if (areaSqFt < 50) continue;

        buildings.push({
          coordinates: ring,
          areaSqFt,
          areaSqM: Math.round(areaSqM),
          mlConfidence: feature.properties?.confidence || 0.82,
          heightM: feature.properties?.height || null,
        });

        // Limit to first 20 nearby buildings
        if (buildings.length >= 20) break;
      } catch {
        continue;
      }
    }

    if (buildings.length === 0) return emptyResult;

    const sorted = [...buildings].sort((a, b) => b.areaSqFt - a.areaSqFt);
    return {
      buildings: sorted,
      mainBuilding: sorted[0] || null,
      totalFootprintSqFt: sorted.reduce((s, b) => s + b.areaSqFt, 0),
      source: "microsoft-building-footprints",
      confidence: 72,
      available: true,
      quadkey,
    };
  } catch {
    return emptyResult;
  }
}

/**
 * Extract building footprints from STAC search results.
 * Filters to buildings within the given radius of the target coordinate.
 */
function extractBuildingsFromSTAC(
  features: Array<{
    geometry?: { type: string; coordinates?: number[][][] };
    properties?: Record<string, unknown>;
    assets?: Record<string, { href?: string }>;
  }>,
  lat: number,
  lng: number,
  radiusM: number
): MSBuildingFootprint[] {
  const buildings: MSBuildingFootprint[] = [];
  const degOffset = radiusM / 111320;
  const lngOffset = radiusM / (111320 * Math.cos((lat * Math.PI) / 180));

  for (const feature of features) {
    if (
      feature.geometry?.type === "Polygon" &&
      feature.geometry.coordinates?.[0]
    ) {
      const ring = feature.geometry.coordinates[0] as Array<[number, number]>;

      // Check proximity
      const centroid = ring.reduce(
        (acc, c) => ({ lng: acc.lng + c[0], lat: acc.lat + c[1] }),
        { lng: 0, lat: 0 }
      );
      centroid.lng /= ring.length;
      centroid.lat /= ring.length;

      if (
        Math.abs(centroid.lat - lat) > degOffset * 2 ||
        Math.abs(centroid.lng - lng) > lngOffset * 2
      )
        continue;

      const areaSqM = polygonAreaSqM(ring);
      const areaSqFt = Math.round(areaSqM * SQ_M_TO_SQ_FT);

      if (areaSqFt >= 50) {
        buildings.push({
          coordinates: ring,
          areaSqFt,
          areaSqM: Math.round(areaSqM),
          mlConfidence:
            typeof feature.properties?.confidence === "number"
              ? feature.properties.confidence
              : 0.85,
          heightM:
            typeof feature.properties?.height === "number"
              ? feature.properties.height
              : null,
        });
      }
    }
  }

  return buildings;
}

/**
 * Convert Microsoft building footprints to the format expected by the
 * geometry engine's structure detection pipeline.
 */
export function msFootprintsToOSMFormat(
  footprints: MSBuildingFootprint[]
): Array<{
  areaSqFt: number;
  buildingType: string | undefined;
  nodes: Array<{ lat: number; lon: number }>;
  levels: number | undefined;
}> {
  return footprints.map((fp) => ({
    areaSqFt: fp.areaSqFt,
    buildingType: "yes" as string | undefined,
    nodes: fp.coordinates.map((c) => ({ lat: c[1], lon: c[0] })),
    levels: (fp.heightM ? Math.max(1, Math.round(fp.heightM / 3)) : undefined) as number | undefined,
  }));
}

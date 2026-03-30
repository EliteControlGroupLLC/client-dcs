// Parcel GIS Service — Fetches real parcel boundary polygons
//
// This service is the SINGLE source for parcel geometry data.
// Uses the Regrid (Loveland) Parcel API for authoritative parcel boundaries.
//
// Data pipeline (STRICT - no alternatives):
//   1. Regrid Parcel API (primary source for US parcel boundaries)
//   2. If unavailable: return explicit failure state (no fallback guesses)
//
// DO NOT:
//   - Use OpenStreetMap for parcel data
//   - Generate placeholder rectangles
//   - Estimate parcel shapes from lot sizes

import type { GeometryPolygon } from "./geometry-engine";

export interface ParcelGISResult {
  /** Whether real parcel geometry was retrieved */
  available: boolean;
  /** The parcel boundary polygon (GeoJSON) */
  parcelPolygon: GeometryPolygon | null;
  /** Parcel area in square feet (from authoritative source) */
  parcelAreaSqFt: number | null;
  /** Assessor Parcel Number */
  apn: string | null;
  /** Source attribution */
  source: "regrid-parcel-api" | "unavailable";
  /** Confidence score (0-100) */
  confidence: number;
  /** Error message if unavailable */
  errorReason: string | null;
  /** Raw parcel data for debugging */
  rawData?: Record<string, unknown>;
}

const REGRID_API_KEY = process.env.REGRID_API_KEY;
const REGRID_BASE_URL = "https://app.regrid.com/api/v2";

/**
 * Check if Regrid API is configured
 */
export function isParcelGISAvailable(): boolean {
  return Boolean(REGRID_API_KEY);
}

/**
 * Fetch real parcel boundary polygon from Regrid Parcel API.
 *
 * This is the ONLY function for obtaining parcel geometry.
 * If it fails, the caller MUST handle the unavailable state explicitly.
 */
export async function fetchParcelPolygon(
  lat: number,
  lng: number
): Promise<ParcelGISResult> {
  const unavailableResult: ParcelGISResult = {
    available: false,
    parcelPolygon: null,
    parcelAreaSqFt: null,
    apn: null,
    source: "unavailable",
    confidence: 0,
    errorReason: null,
  };

  // Check if API key is configured
  if (!REGRID_API_KEY) {
    return {
      ...unavailableResult,
      errorReason: "REGRID_API_KEY not configured. Real parcel boundaries require a Regrid API subscription.",
    };
  }

  try {
    // Query Regrid API by coordinates (point-in-parcel lookup)
    const url = `${REGRID_BASE_URL}/parcels/point?lat=${lat}&lon=${lng}&return_geometry=true`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${REGRID_API_KEY}`,
        "Accept": "application/json",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      if (response.status === 401) {
        return {
          ...unavailableResult,
          errorReason: "Regrid API authentication failed. Check API key.",
        };
      }
      if (response.status === 404) {
        return {
          ...unavailableResult,
          errorReason: "No parcel found at this location in Regrid database.",
        };
      }
      return {
        ...unavailableResult,
        errorReason: `Regrid API returned status ${response.status}`,
      };
    }

    const data = await response.json();

    // Regrid returns parcels in GeoJSON FeatureCollection format
    const features = data?.features || data?.results || [];
    if (!features.length) {
      return {
        ...unavailableResult,
        errorReason: "Regrid returned no parcels for this location.",
      };
    }

    // Take the first (closest) parcel
    const parcel = features[0];
    const geometry = parcel.geometry;
    const properties = parcel.properties || {};

    // Validate geometry type
    if (!geometry || geometry.type !== "Polygon") {
      // Handle MultiPolygon by taking the largest polygon
      if (geometry?.type === "MultiPolygon" && geometry.coordinates?.length > 0) {
        // Find the largest polygon by number of coordinates
        let largestIdx = 0;
        let largestLen = 0;
        for (let i = 0; i < geometry.coordinates.length; i++) {
          const len = geometry.coordinates[i][0]?.length || 0;
          if (len > largestLen) {
            largestLen = len;
            largestIdx = i;
          }
        }
        const largestPolygon: GeometryPolygon = {
          type: "Polygon",
          coordinates: geometry.coordinates[largestIdx],
        };
        return buildSuccessResult(largestPolygon, properties, data);
      }

      return {
        ...unavailableResult,
        errorReason: `Unexpected geometry type: ${geometry?.type || "none"}`,
      };
    }

    // Build the parcel polygon
    const parcelPolygon: GeometryPolygon = {
      type: "Polygon",
      coordinates: geometry.coordinates,
    };

    return buildSuccessResult(parcelPolygon, properties, data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      ...unavailableResult,
      errorReason: `Regrid API request failed: ${message}`,
    };
  }
}

/**
 * Build a successful result from Regrid parcel data
 */
function buildSuccessResult(
  parcelPolygon: GeometryPolygon,
  properties: Record<string, unknown>,
  rawData: Record<string, unknown>
): ParcelGISResult {
  // Extract APN (Regrid uses various field names)
  const apn = (
    properties.apn ||
    properties.parcelnumb ||
    properties.parcel_id ||
    properties.parno ||
    null
  ) as string | null;

  // Extract area (Regrid provides area in various formats)
  let parcelAreaSqFt: number | null = null;
  if (typeof properties.ll_gisacre === "number") {
    parcelAreaSqFt = Math.round(properties.ll_gisacre * 43560);
  } else if (typeof properties.gisacre === "number") {
    parcelAreaSqFt = Math.round(properties.gisacre * 43560);
  } else if (typeof properties.sqft === "number") {
    parcelAreaSqFt = Math.round(properties.sqft);
  } else if (typeof properties.ll_gissqft === "number") {
    parcelAreaSqFt = Math.round(properties.ll_gissqft);
  }

  return {
    available: true,
    parcelPolygon,
    parcelAreaSqFt,
    apn,
    source: "regrid-parcel-api",
    confidence: 95, // High confidence for authoritative parcel data
    errorReason: null,
    rawData,
  };
}

/**
 * Fetch parcel by APN (Assessor Parcel Number) instead of coordinates.
 * Useful when you have an APN from ATTOM but need the actual boundary.
 */
export async function fetchParcelByAPN(
  apn: string,
  county?: string,
  state?: string
): Promise<ParcelGISResult> {
  const unavailableResult: ParcelGISResult = {
    available: false,
    parcelPolygon: null,
    parcelAreaSqFt: null,
    apn: null,
    source: "unavailable",
    confidence: 0,
    errorReason: null,
  };

  if (!REGRID_API_KEY) {
    return {
      ...unavailableResult,
      errorReason: "REGRID_API_KEY not configured.",
    };
  }

  try {
    // Build search query
    let query = `parcelnumb:${apn.replace(/-/g, "")}`;
    if (county) query += ` AND county:${county}`;
    if (state) query += ` AND state2:${state}`;

    const url = `${REGRID_BASE_URL}/parcels?query=${encodeURIComponent(query)}&return_geometry=true&limit=1`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${REGRID_API_KEY}`,
        "Accept": "application/json",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return {
        ...unavailableResult,
        errorReason: `Regrid API returned status ${response.status}`,
      };
    }

    const data = await response.json();
    const features = data?.features || [];

    if (!features.length) {
      return {
        ...unavailableResult,
        errorReason: `No parcel found with APN: ${apn}`,
      };
    }

    const parcel = features[0];
    const geometry = parcel.geometry;
    const properties = parcel.properties || {};

    if (!geometry || geometry.type !== "Polygon") {
      if (geometry?.type === "MultiPolygon" && geometry.coordinates?.length > 0) {
        const parcelPolygon: GeometryPolygon = {
          type: "Polygon",
          coordinates: geometry.coordinates[0],
        };
        return buildSuccessResult(parcelPolygon, properties, data);
      }
      return {
        ...unavailableResult,
        errorReason: `Unexpected geometry type for APN ${apn}`,
      };
    }

    const parcelPolygon: GeometryPolygon = {
      type: "Polygon",
      coordinates: geometry.coordinates,
    };

    return buildSuccessResult(parcelPolygon, properties, data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      ...unavailableResult,
      errorReason: `Regrid API request failed: ${message}`,
    };
  }
}

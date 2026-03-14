// Zoneomics Service — Supplemental zoning/planning data enrichment layer
// Uses Zoneomics API to enrich zoning interpretation and planning context.
// This is a SUPPORT layer — final ADU legality defers to official jurisdiction rules.

const ZONEOMICS_API_KEY = process.env.NEXT_PUBLIC_ZONEOMICS_API_KEY;
const ZONEOMICS_BASE_URL = "https://api.zoneomics.com/v2";

// Zoneomics API response can vary — support multiple response shapes
interface ZoneomicsApiResponse {
  status?: string;
  zoning_code?: string;
  zone_code?: string;
  zone_name?: string;
  zone_type?: string;
  zone_description?: string;
  land_use?: string;
  land_use_category?: string;
  land_use_description?: string;
  overlay_districts?: string[];
  overlays?: string[];
  min_lot_size?: number;
  max_lot_coverage?: number;
  max_far?: number;
  max_height?: number;
  max_density?: string;
  parking_required?: boolean;
  landscaping_required?: boolean;
  design_review?: boolean;
  historic_district?: boolean;
  coastal_zone?: boolean;
  source_url?: string;
  data?: {
    zoning_code?: string;
    zone_code?: string;
    zone_name?: string;
    zone_type?: string;
    zoning_description?: string;
    zone_description?: string;
    land_use_category?: string;
    land_use_description?: string;
    land_use?: string;
    zoning_district?: string;
    overlay_districts?: string[];
    overlays?: string[];
    min_lot_size?: number;
    max_lot_coverage?: number;
    max_far?: number;
    max_height?: number;
    max_density?: string;
    parking_required?: boolean;
    landscaping_required?: boolean;
    design_review?: boolean;
    historic_district?: boolean;
    coastal_zone?: boolean;
    source_url?: string;
  };
}

export interface ZoneomicsZoningData {
  zoningCode: string | null;
  zoningDescription: string | null;
  landUseCategory: string | null;
  landUseDescription: string | null;
  zoningDistrict: string | null;
  overlayDistricts: string[];
  planningAttributes: {
    minLotSize: number | null;
    maxLotCoverage: number | null;
    maxFAR: number | null;
    maxHeight: number | null;
    maxDensity: string | null;
  };
  controls: {
    parkingRequired: boolean | null;
    landscapingRequired: boolean | null;
    designReview: boolean | null;
    historicDistrict: boolean | null;
    coastalZone: boolean | null;
  };
  sourceUrl: string | null;
  confidence: number;
  available: boolean;
}

/**
 * Check if Zoneomics API is configured
 */
export function isZoneomicsAvailable(): boolean {
  return Boolean(ZONEOMICS_API_KEY);
}

/**
 * Normalize fields from a Zoneomics response — handles both top-level
 * and nested `data` shapes, plus field name variations (zone_code vs zoning_code, etc.)
 */
function normalizeZoneomicsFields(raw: ZoneomicsApiResponse) {
  const d = raw.data ?? raw;
  return {
    zoning_code: d.zoning_code || d.zone_code || null,
    zoning_description: d.zone_description || (raw.data ? raw.data.zoning_description : null) || d.zone_name || null,
    land_use_category: d.land_use_category || d.land_use || null,
    land_use_description: d.land_use_description || null,
    zoning_district: (raw.data ? raw.data.zoning_district : null) || d.zone_type || null,
    overlay_districts: d.overlay_districts || d.overlays || [],
    min_lot_size: d.min_lot_size ?? null,
    max_lot_coverage: d.max_lot_coverage ?? null,
    max_far: d.max_far ?? null,
    max_height: d.max_height ?? null,
    max_density: d.max_density ?? null,
    parking_required: d.parking_required ?? null,
    landscaping_required: d.landscaping_required ?? null,
    design_review: d.design_review ?? null,
    historic_district: d.historic_district ?? null,
    coastal_zone: d.coastal_zone ?? null,
    source_url: d.source_url ?? null,
  };
}

const EMPTY_ZONEOMICS_RESULT: ZoneomicsZoningData = {
  zoningCode: null,
  zoningDescription: null,
  landUseCategory: null,
  landUseDescription: null,
  zoningDistrict: null,
  overlayDistricts: [],
  planningAttributes: {
    minLotSize: null,
    maxLotCoverage: null,
    maxFAR: null,
    maxHeight: null,
    maxDensity: null,
  },
  controls: {
    parkingRequired: null,
    landscapingRequired: null,
    designReview: null,
    historicDistrict: null,
    coastalZone: null,
  },
  sourceUrl: null,
  confidence: 0,
  available: false,
};

/**
 * Fetch zoning data from Zoneomics for a given location.
 * Tries `zoneDetail` (primary) then falls back to `zoning` endpoint.
 */
export async function getZoneomicsData(
  lat: number,
  lng: number
): Promise<ZoneomicsZoningData> {
  if (!ZONEOMICS_API_KEY) return EMPTY_ZONEOMICS_RESULT;

  // Endpoints to try in order (zoneDetail is the documented v2 endpoint)
  const endpoints = [
    `${ZONEOMICS_BASE_URL}/zoneDetail?lat=${lat}&lng=${lng}&api_key=${ZONEOMICS_API_KEY}`,
    `${ZONEOMICS_BASE_URL}/zoning?lat=${lat}&lng=${lng}&api_key=${ZONEOMICS_API_KEY}`,
  ];

  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) continue;

      const raw: ZoneomicsApiResponse = await response.json();
      const z = normalizeZoneomicsFields(raw);

      // Count available fields
      let fieldsAvailable = 0;
      const totalFields = 6;
      if (z.zoning_code) fieldsAvailable++;
      if (z.zoning_description) fieldsAvailable++;
      if (z.land_use_category) fieldsAvailable++;
      if (z.zoning_district) fieldsAvailable++;
      if (z.min_lot_size || z.max_lot_coverage || z.max_far) fieldsAvailable++;
      if (z.overlay_districts && z.overlay_districts.length > 0) fieldsAvailable++;

      if (fieldsAvailable === 0) continue;

      return {
        zoningCode: z.zoning_code,
        zoningDescription: z.zoning_description,
        landUseCategory: z.land_use_category,
        landUseDescription: z.land_use_description,
        zoningDistrict: z.zoning_district,
        overlayDistricts: z.overlay_districts || [],
        planningAttributes: {
          minLotSize: z.min_lot_size,
          maxLotCoverage: z.max_lot_coverage,
          maxFAR: z.max_far,
          maxHeight: z.max_height,
          maxDensity: z.max_density,
        },
        controls: {
          parkingRequired: z.parking_required,
          landscapingRequired: z.landscaping_required,
          designReview: z.design_review,
          historicDistrict: z.historic_district,
          coastalZone: z.coastal_zone,
        },
        sourceUrl: z.source_url,
        confidence: Math.round((fieldsAvailable / totalFields) * 100),
        available: true,
      };
    } catch {
      continue;
    }
  }

  return EMPTY_ZONEOMICS_RESULT;
}

/**
 * Enrich overlay detection with Zoneomics data.
 * Returns additional overlay flags that may not be detectable from address alone.
 */
export function enrichOverlaysFromZoneomics(
  zoneomicsData: ZoneomicsZoningData
): {
  designReview: boolean;
  historicDistrict: boolean;
  coastalZone: boolean;
  overlayDistricts: string[];
} {
  return {
    designReview: zoneomicsData.controls.designReview === true,
    historicDistrict: zoneomicsData.controls.historicDistrict === true,
    coastalZone: zoneomicsData.controls.coastalZone === true,
    overlayDistricts: zoneomicsData.overlayDistricts,
  };
}

/**
 * Get zoning interpretation notes for display
 */
export function getZoningInterpretation(
  zoneomicsData: ZoneomicsZoningData
): string | null {
  if (!zoneomicsData.available) return null;

  const parts: string[] = [];

  if (zoneomicsData.zoningCode && zoneomicsData.zoningDescription) {
    parts.push(`Zoned ${zoneomicsData.zoningCode} (${zoneomicsData.zoningDescription})`);
  } else if (zoneomicsData.zoningCode) {
    parts.push(`Zoned ${zoneomicsData.zoningCode}`);
  }

  if (zoneomicsData.landUseCategory) {
    parts.push(`Land use: ${zoneomicsData.landUseCategory}`);
  }

  if (zoneomicsData.planningAttributes.maxLotCoverage) {
    parts.push(`Max lot coverage: ${zoneomicsData.planningAttributes.maxLotCoverage}%`);
  }

  if (zoneomicsData.planningAttributes.maxFAR) {
    parts.push(`Max FAR: ${zoneomicsData.planningAttributes.maxFAR}`);
  }

  if (zoneomicsData.overlayDistricts.length > 0) {
    parts.push(`Overlay districts: ${zoneomicsData.overlayDistricts.join(", ")}`);
  }

  return parts.length > 0 ? parts.join(". ") + "." : null;
}

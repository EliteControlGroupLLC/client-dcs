// Zoneomics Service — Supplemental zoning/planning data enrichment layer
// Uses Zoneomics API to enrich zoning interpretation and planning context.
// This is a SUPPORT layer — final ADU legality defers to official jurisdiction rules.

const ZONEOMICS_API_KEY = process.env.NEXT_PUBLIC_ZONEOMICS_API_KEY;
const ZONEOMICS_BASE_URL = "https://api.zoneomics.com/v2";

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

interface ZoneomicsResponse {
  status?: string;
  data?: {
    zoning_code?: string;
    zoning_description?: string;
    land_use_category?: string;
    land_use_description?: string;
    zoning_district?: string;
    overlay_districts?: string[];
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

/**
 * Check if Zoneomics API is configured
 */
export function isZoneomicsAvailable(): boolean {
  return Boolean(ZONEOMICS_API_KEY);
}

/**
 * Fetch zoning data from Zoneomics for a given location
 */
export async function getZoneomicsData(
  lat: number,
  lng: number
): Promise<ZoneomicsZoningData> {
  const emptyResult: ZoneomicsZoningData = {
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

  if (!ZONEOMICS_API_KEY) return emptyResult;

  try {
    const url = `${ZONEOMICS_BASE_URL}/zoning?lat=${lat}&lng=${lng}&api_key=${ZONEOMICS_API_KEY}`;
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) return emptyResult;

    const data: ZoneomicsResponse = await response.json();

    if (!data.data) return emptyResult;

    const zData = data.data;
    let fieldsAvailable = 0;
    const totalFields = 6;

    if (zData.zoning_code) fieldsAvailable++;
    if (zData.zoning_description) fieldsAvailable++;
    if (zData.land_use_category) fieldsAvailable++;
    if (zData.zoning_district) fieldsAvailable++;
    if (zData.min_lot_size || zData.max_lot_coverage || zData.max_far) fieldsAvailable++;
    if (zData.overlay_districts && zData.overlay_districts.length > 0) fieldsAvailable++;

    const confidence = Math.round((fieldsAvailable / totalFields) * 100);

    return {
      zoningCode: zData.zoning_code || null,
      zoningDescription: zData.zoning_description || null,
      landUseCategory: zData.land_use_category || null,
      landUseDescription: zData.land_use_description || null,
      zoningDistrict: zData.zoning_district || null,
      overlayDistricts: zData.overlay_districts || [],
      planningAttributes: {
        minLotSize: zData.min_lot_size || null,
        maxLotCoverage: zData.max_lot_coverage || null,
        maxFAR: zData.max_far || null,
        maxHeight: zData.max_height || null,
        maxDensity: zData.max_density || null,
      },
      controls: {
        parkingRequired: zData.parking_required ?? null,
        landscapingRequired: zData.landscaping_required ?? null,
        designReview: zData.design_review ?? null,
        historicDistrict: zData.historic_district ?? null,
        coastalZone: zData.coastal_zone ?? null,
      },
      sourceUrl: zData.source_url || null,
      confidence,
      available: fieldsAvailable > 0,
    };
  } catch {
    return emptyResult;
  }
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

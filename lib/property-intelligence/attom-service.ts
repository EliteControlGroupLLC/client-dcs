// ATTOM Property Data Service
// Integrates with ATTOM API for accurate parcel, building, and zoning data.
// Falls back gracefully when API key is not configured.

const ATTOM_API_KEY = process.env.NEXT_PUBLIC_ATTOM_API_KEY;
const ATTOM_BASE_URL = "https://api.gateway.attomdata.com/propertyapi/v1.0.0";

export interface AttomPropertyData {
  apn: string | null;
  lotSizeSqFt: number | null;
  homeAreaSqFt: number | null;
  footprintSqFt: number | null;
  yearBuilt: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  stories: number | null;
  zoning: string | null;
  landUse: string | null;
  lotWidth: number | null;
  lotDepth: number | null;
  confidence: number;
  available: boolean;
}

interface AttomResponse {
  status?: { code: number; msg: string };
  property?: Array<{
    identifier?: {
      apn?: string;
      fips?: string;
    };
    lot?: {
      lotSize1?: number; // acres
      lotSize2?: number; // sq ft
      lotNum?: string;
      depth?: number;
      frontage?: number;
    };
    building?: {
      size?: {
        universalSize?: number;
        livingSize?: number;
        groundFloorSize?: number;
        bldgSize?: number;
      };
      rooms?: {
        beds?: number;
        bathsFull?: number;
        bathsHalf?: number;
      };
      summary?: {
        levels?: number;
        storyDesc?: string;
        yearBuilt?: number;
      };
    };
    summary?: {
      propClass?: string;
      propSubType?: string;
      propType?: string;
      yearBuilt?: number;
      legal1?: string;
    };
    utilities?: {
      heatingType?: string;
      coolingType?: string;
    };
  }>;
}

async function fetchAttomProperty(
  address1: string,
  address2: string
): Promise<AttomResponse | null> {
  if (!ATTOM_API_KEY) return null;

  try {
    const url = `${ATTOM_BASE_URL}/property/detail?address1=${encodeURIComponent(address1)}&address2=${encodeURIComponent(address2)}`;
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        apikey: ATTOM_API_KEY,
      },
    });

    if (!response.ok) return null;
    const data: AttomResponse = await response.json();
    return data;
  } catch {
    return null;
  }
}

// Parse a full address into address1 (street) and address2 (city, state zip)
function parseAddress(fullAddress: string): { address1: string; address2: string } {
  // Common pattern: "123 Main St, San Diego, CA 92101"
  const parts = fullAddress.split(",").map((p) => p.trim());

  if (parts.length >= 3) {
    return {
      address1: parts[0],
      address2: parts.slice(1).join(", "),
    };
  }

  if (parts.length === 2) {
    return {
      address1: parts[0],
      address2: parts[1],
    };
  }

  // Try to split on last comma or just use as-is
  return {
    address1: fullAddress,
    address2: "San Diego, CA",
  };
}

export async function getAttomPropertyData(
  address: string
): Promise<AttomPropertyData> {
  const emptyResult: AttomPropertyData = {
    apn: null,
    lotSizeSqFt: null,
    homeAreaSqFt: null,
    footprintSqFt: null,
    yearBuilt: null,
    bedrooms: null,
    bathrooms: null,
    stories: null,
    zoning: null,
    landUse: null,
    lotWidth: null,
    lotDepth: null,
    confidence: 0,
    available: false,
  };

  if (!ATTOM_API_KEY) return emptyResult;

  const { address1, address2 } = parseAddress(address);
  const data = await fetchAttomProperty(address1, address2);

  if (!data?.property || data.property.length === 0) return emptyResult;

  const prop = data.property[0];
  const building = prop.building;
  const lot = prop.lot;

  // Extract lot size in sq ft
  let lotSizeSqFt: number | null = null;
  if (lot?.lotSize2 && lot.lotSize2 > 0) {
    lotSizeSqFt = Math.round(lot.lotSize2);
  } else if (lot?.lotSize1 && lot.lotSize1 > 0) {
    lotSizeSqFt = Math.round(lot.lotSize1 * 43560); // acres to sq ft
  }

  // Extract home area (living space)
  const homeAreaSqFt =
    building?.size?.livingSize ||
    building?.size?.universalSize ||
    building?.size?.bldgSize ||
    null;

  // Extract structure footprint (ground floor)
  const footprintSqFt =
    building?.size?.groundFloorSize ||
    (homeAreaSqFt && building?.summary?.levels
      ? Math.round(homeAreaSqFt / building.summary.levels)
      : null);

  // Extract stories
  const stories = building?.summary?.levels || null;

  // Extract year built
  const yearBuilt = building?.summary?.yearBuilt || prop.summary?.yearBuilt || null;

  // Extract bedrooms/bathrooms
  const bedrooms = building?.rooms?.beds || null;
  const bathrooms = building?.rooms?.bathsFull
    ? building.rooms.bathsFull + (building.rooms.bathsHalf || 0) * 0.5
    : null;

  // Calculate confidence based on available data fields
  let fieldsAvailable = 0;
  const totalFields = 6;
  if (lotSizeSqFt) fieldsAvailable++;
  if (homeAreaSqFt) fieldsAvailable++;
  if (footprintSqFt) fieldsAvailable++;
  if (prop.identifier?.apn) fieldsAvailable++;
  if (yearBuilt) fieldsAvailable++;
  if (lot?.depth || lot?.frontage) fieldsAvailable++;

  const confidence = Math.round((fieldsAvailable / totalFields) * 100);

  return {
    apn: prop.identifier?.apn || null,
    lotSizeSqFt,
    homeAreaSqFt: homeAreaSqFt ? Math.round(homeAreaSqFt) : null,
    footprintSqFt: footprintSqFt ? Math.round(footprintSqFt) : null,
    yearBuilt,
    bedrooms,
    bathrooms,
    stories,
    zoning: prop.summary?.propSubType || prop.summary?.propType || null,
    landUse: prop.summary?.propClass || null,
    lotWidth: lot?.frontage || null,
    lotDepth: lot?.depth || null,
    confidence,
    available: fieldsAvailable > 0,
  };
}

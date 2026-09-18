// Real San Diego property data — free/keyless government GIS.
//
// Parcels: SANDAG/SanGIS hosted FeatureServer (lot size, existing units,
// living area, garage, jurisdiction, APN).
// Zoning: City of San Diego DSD Zoning_Base MapServer (ZONE_NAME).
//
// This replaces the address-seeded fabrication that made the tool
// inaccurate. If the real parcel/zoning can't be resolved we return
// available:false (never invented numbers).

const PARCELS_URL =
  "https://geo.sandag.org/server/rest/services/Hosted/Parcels/FeatureServer/0/query";
const CITY_ZONING_URL =
  "https://webmaps.sandiego.gov/arcgis/rest/services/DSD/Zoning_Base/MapServer/0/query";

export interface SanDiegoParcel {
  available: boolean;
  apn: string | null;
  lotSizeSqFt: number | null;
  livingAreaSqFt: number | null;
  existingUnits: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  garageStalls: number | null;
  hasGarageConversion: boolean;
  hasPool: boolean;
  jurisdiction: string | null; // "SD" = City of San Diego
  situsAddress: string | null;
  yearEffective: number | null;
  matchQuality: "exact-address" | "nearest" | "none";
}

interface ParcelAttrs {
  apn?: string | null;
  SHAPE__Area?: number | null;
  total_lvg_area?: number | null;
  unitqty?: number | null;
  bedrooms?: number | null;
  baths?: number | null;
  garage_stalls?: number | null;
  garage_conversion?: string | number | null;
  pool?: string | number | null;
  situs_juris?: string | null;
  situs_address?: string | null;
  situs_street?: string | null;
  year_effective?: number | null;
}

const num = (v: unknown): number | null => {
  const n = typeof v === "number" ? v : v == null ? NaN : Number(v);
  return Number.isFinite(n) ? n : null;
};
const truthyFlag = (v: unknown): boolean => {
  if (v == null) return false;
  const s = String(v).trim().toLowerCase();
  return s === "y" || s === "yes" || s === "1" || s === "true";
};

/**
 * Resolve the parcel for a geocoded point + street number. Because free
 * geocoders (Census/ArcGIS) return an interpolated point that can land just
 * off the parcel, we query a small buffer and pick the parcel whose situs
 * house-number matches; otherwise the closest returned parcel.
 */
export async function getSanDiegoParcel(
  lat: number,
  lng: number,
  houseNumber?: string,
  streetName?: string
): Promise<SanDiegoParcel> {
  const empty: SanDiegoParcel = {
    available: false,
    apn: null,
    lotSizeSqFt: null,
    livingAreaSqFt: null,
    existingUnits: null,
    bedrooms: null,
    bathrooms: null,
    garageStalls: null,
    hasGarageConversion: false,
    hasPool: false,
    jurisdiction: null,
    situsAddress: null,
    yearEffective: null,
    matchQuality: "none",
  };

  const outFields = [
    "apn", "SHAPE__Area", "total_lvg_area", "unitqty", "bedrooms", "baths",
    "garage_stalls", "garage_conversion", "pool", "situs_juris",
    "situs_address", "situs_street", "year_effective",
  ].join(",");

  try {
    // 1) Try exact point first (cheapest, works when geocode is rooftop).
    let features = await queryParcels(`${lng},${lat}`, outFields, 0);
    let matchQuality: SanDiegoParcel["matchQuality"] = features.length ? "nearest" : "none";

    // 2) Buffer if the point missed the polygon.
    if (features.length === 0) {
      features = await queryParcels(`${lng},${lat}`, outFields, 45);
    }
    if (features.length === 0) return empty;

    // Pick the parcel whose situs house-number matches the input.
    let chosen: ParcelAttrs | undefined;
    if (houseNumber) {
      const hn = houseNumber.trim();
      const streetU = (streetName ?? "").trim().toUpperCase();
      chosen = features.find((a) => {
        const addrNum = String(a.situs_address ?? "").trim();
        const streetOk = !streetU || String(a.situs_street ?? "").toUpperCase().includes(streetU.split(" ")[0]);
        return addrNum === hn && streetOk;
      });
      if (chosen) matchQuality = "exact-address";
    }
    if (!chosen) chosen = features[0]; // nearest by query order

    const lot = num(chosen.SHAPE__Area);
    return {
      available: true,
      apn: chosen.apn ? String(chosen.apn) : null,
      lotSizeSqFt: lot ? Math.round(lot) : null,
      livingAreaSqFt: num(chosen.total_lvg_area),
      existingUnits: num(chosen.unitqty),
      bedrooms: num(chosen.bedrooms),
      bathrooms: num(chosen.baths),
      garageStalls: num(chosen.garage_stalls),
      hasGarageConversion: truthyFlag(chosen.garage_conversion),
      hasPool: truthyFlag(chosen.pool),
      jurisdiction: chosen.situs_juris ? String(chosen.situs_juris) : null,
      situsAddress: [chosen.situs_address, chosen.situs_street].filter(Boolean).join(" ") || null,
      yearEffective: num(chosen.year_effective),
      matchQuality,
    };
  } catch {
    return empty;
  }
}

async function queryParcels(
  geometry: string,
  outFields: string,
  distanceM: number
): Promise<ParcelAttrs[]> {
  const params = new URLSearchParams({
    geometry,
    geometryType: "esriGeometryPoint",
    inSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    returnGeometry: "false",
    outFields,
    f: "json",
  });
  if (distanceM > 0) {
    params.set("distance", String(distanceM));
    params.set("units", "esriSRUnit_Meter");
  }
  const res = await fetch(`${PARCELS_URL}?${params.toString()}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { features?: Array<{ attributes: ParcelAttrs }> };
  return (data.features ?? []).map((f) => f.attributes);
}

export interface SanDiegoZoning {
  available: boolean;
  zoneName: string | null; // e.g. "RS-1-7", "RM-1-1"
  ordinanceNumber: string | null;
}

/** City of San Diego base zoning at a point. */
export async function getSanDiegoZoning(lat: number, lng: number): Promise<SanDiegoZoning> {
  try {
    const params = new URLSearchParams({
      geometry: `${lng},${lat}`,
      geometryType: "esriGeometryPoint",
      inSR: "4326",
      spatialRel: "esriSpatialRelIntersects",
      returnGeometry: "false",
      outFields: "ZONE_NAME,ORDNUM",
      f: "json",
    });
    const res = await fetch(`${CITY_ZONING_URL}?${params.toString()}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return { available: false, zoneName: null, ordinanceNumber: null };
    const data = (await res.json()) as {
      features?: Array<{ attributes: { ZONE_NAME?: string; ORDNUM?: string } }>;
    };
    const a = data.features?.[0]?.attributes;
    if (!a?.ZONE_NAME) return { available: false, zoneName: null, ordinanceNumber: null };
    return { available: true, zoneName: a.ZONE_NAME, ordinanceNumber: a.ORDNUM ?? null };
  } catch {
    return { available: false, zoneName: null, ordinanceNumber: null };
  }
}

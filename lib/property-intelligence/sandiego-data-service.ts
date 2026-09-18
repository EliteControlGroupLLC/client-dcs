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

/** Rough centroid (avg of exterior ring vertices) of an Esri polygon. */
function ringCentroid(geometry?: { rings?: number[][][] }): { x: number; y: number } | null {
  const ring = geometry?.rings?.[0];
  if (!ring || ring.length === 0) return null;
  let sx = 0;
  let sy = 0;
  for (const [x, y] of ring) {
    sx += x;
    sy += y;
  }
  return { x: sx / ring.length, y: sy / ring.length };
}

/**
 * Resolve the parcel for a geocoded point + the original address. Free
 * geocoders (Census/ArcGIS) return an interpolated point that often lands
 * just off the parcel and give a block RANGE, not the house number — so we:
 *   1. parse the house number from the input address,
 *   2. query a small buffer WITH geometry,
 *   3. prefer the parcel whose situs house-number matches exactly,
 *   4. otherwise pick the geometrically NEAREST parcel (not query order).
 */
export async function getSanDiegoParcel(
  lat: number,
  lng: number,
  address?: string,
  streetName?: string
): Promise<SanDiegoParcel> {
  const houseNumber = address ? (address.trim().match(/^\s*(\d+)/)?.[1] ?? undefined) : undefined;
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
    // Query a small buffer WITH geometry so we can rank by distance.
    // (The exact point often misses the polygon because free geocoders
    // interpolate along the block.)
    let features = await queryParcels(`${lng},${lat}`, outFields, 0);
    if (features.length === 0) features = await queryParcels(`${lng},${lat}`, outFields, 35);
    if (features.length === 0) return empty;

    let matchQuality: SanDiegoParcel["matchQuality"] = "nearest";
    let chosen: ParcelFeature | undefined;

    // 1) Prefer the parcel whose situs house-number matches exactly (and
    //    same street). This is the reliable match once we've parsed the
    //    real house number from the input address.
    if (houseNumber) {
      const streetU = (streetName ?? "").trim().toUpperCase().split(" ")[0];
      const matches = features.filter((f) => {
        const addrNum = String(f.attrs.situs_address ?? "").trim();
        const streetOk = !streetU || String(f.attrs.situs_street ?? "").toUpperCase().includes(streetU);
        return addrNum === houseNumber && streetOk;
      });
      if (matches.length > 0) {
        chosen = nearest(matches, lng, lat);
        matchQuality = "exact-address";
      }
    }

    // 2) Fall back to the geometrically NEAREST parcel (by centroid), never
    //    query order — that's what previously grabbed a random condo unit.
    if (!chosen) chosen = nearest(features, lng, lat);

    const attrs = chosen.attrs;
    const lot = num(attrs.SHAPE__Area);
    return {
      available: true,
      apn: attrs.apn ? String(attrs.apn) : null,
      lotSizeSqFt: lot ? Math.round(lot) : null,
      livingAreaSqFt: num(attrs.total_lvg_area),
      existingUnits: num(attrs.unitqty),
      bedrooms: num(attrs.bedrooms),
      bathrooms: num(attrs.baths),
      garageStalls: num(attrs.garage_stalls),
      hasGarageConversion: truthyFlag(attrs.garage_conversion),
      hasPool: truthyFlag(attrs.pool),
      jurisdiction: attrs.situs_juris ? String(attrs.situs_juris) : null,
      situsAddress: [attrs.situs_address, attrs.situs_street].filter(Boolean).join(" ") || null,
      yearEffective: num(attrs.year_effective),
      matchQuality,
    };
  } catch {
    return empty;
  }
}

interface ParcelFeature {
  attrs: ParcelAttrs;
  centroid: { x: number; y: number } | null;
}

/** Pick the parcel whose centroid is closest to the query point. */
function nearest(features: ParcelFeature[], lng: number, lat: number): ParcelFeature {
  let best = features[0];
  let bestD = Infinity;
  for (const f of features) {
    if (!f.centroid) continue;
    const dx = f.centroid.x - lng;
    const dy = f.centroid.y - lat;
    const d = dx * dx + dy * dy;
    if (d < bestD) {
      bestD = d;
      best = f;
    }
  }
  return best;
}

async function queryParcels(
  geometry: string,
  outFields: string,
  distanceM: number
): Promise<ParcelFeature[]> {
  const params = new URLSearchParams({
    geometry,
    geometryType: "esriGeometryPoint",
    inSR: "4326",
    outSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    returnGeometry: "true",
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
  const data = (await res.json()) as {
    features?: Array<{ attributes: ParcelAttrs; geometry?: { rings?: number[][][] } }>;
  };
  return (data.features ?? []).map((f) => ({
    attrs: f.attributes,
    centroid: ringCentroid(f.geometry),
  }));
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

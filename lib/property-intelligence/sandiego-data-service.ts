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
  /**
   * Real parcel boundary from SANDAG/SanGIS, WGS84 (EPSG:4326) Esri rings:
   * rings[ringIndex][vertexIndex] = [lng, lat]. Null when unavailable.
   */
  parcelRings: number[][][] | null;
  /** True when the geocoded point falls inside the chosen parcel polygon. */
  geocodeInParcel: boolean;
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
  nucleus_situs_from_nbr?: number | null;
  nucleus_situs_thru_nbr?: number | null;
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
    parcelRings: null,
    geocodeInParcel: false,
  };

  const outFields = [
    "apn", "SHAPE__Area", "total_lvg_area", "unitqty", "bedrooms", "baths",
    "garage_stalls", "garage_conversion", "pool", "situs_juris",
    "situs_address", "situs_street", "year_effective",
    "nucleus_situs_from_nbr", "nucleus_situs_thru_nbr",
  ].join(",");

  try {
    // Query a small buffer WITH geometry so we can rank by distance.
    // (The exact point often misses the polygon because free geocoders
    // interpolate along the block.)
    const pointFeatures = await queryParcels(`${lng},${lat}`, outFields, 0);
    let features = pointFeatures;

    let matchQuality: SanDiegoParcel["matchQuality"] = "nearest";
    let chosen: ParcelFeature | undefined;

    // 1) Prefer the parcel whose situs house-number matches exactly (and
    //    same street) — including multi-address situs ranges (e.g. 4712-4714).
    //    The geocoded point may sit in a NEIGHBOR's lot, so if the point's
    //    parcel doesn't match we also search a 35 m buffer for the real one.
    const streetU = (streetName ?? "").trim().toUpperCase().split(" ")[0];
    const houseN = houseNumber ? Number(houseNumber) : NaN;
    const exactMatches = (fs: ParcelFeature[]) =>
      fs.filter((f) => {
        const streetOk = !streetU || String(f.attrs.situs_street ?? "").toUpperCase().includes(streetU);
        if (!streetOk) return false;
        if (String(f.attrs.situs_address ?? "").trim() === houseNumber) return true;
        const from = num(f.attrs.nucleus_situs_from_nbr);
        const thru = num(f.attrs.nucleus_situs_thru_nbr);
        return from != null && thru != null && thru > from && houseN >= from && houseN <= thru && (houseN - from) % 2 === 0;
      });
    if (houseNumber) {
      let matches = exactMatches(features);
      if (matches.length === 0) {
        const buffered = await queryParcels(`${lng},${lat}`, outFields, 35);
        matches = exactMatches(buffered);
        if (features.length === 0) features = buffered;
      }
      if (matches.length > 0) {
        chosen = nearest(matches, lng, lat);
        matchQuality = "exact-address";
      }
    } else if (features.length === 0) {
      features = await queryParcels(`${lng},${lat}`, outFields, 35);
    }
    if (!chosen && features.length === 0) return empty;

    // 2) Fall back to the parcel containing the geocoded point, else the
    //    geometrically NEAREST parcel (by centroid), never query order —
    //    that's what previously grabbed a random condo unit.
    if (!chosen) chosen = nearest(features, lng, lat);
    const chosenApn = chosen.attrs.apn;
    const geocodeInParcel = pointFeatures.some((f) => f.attrs.apn === chosenApn);

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
      parcelRings: chosen.rings,
      geocodeInParcel,
    };
  } catch {
    return empty;
  }
}

interface ParcelFeature {
  attrs: ParcelAttrs;
  centroid: { x: number; y: number } | null;
  rings: number[][][] | null;
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
    rings: f.geometry?.rings && f.geometry.rings.length > 0 ? f.geometry.rings : null,
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

// ─── Real building footprints (SANDAG Building_Outlines) ───
//
// County-wide (all 18 cities + unincorporated), free and keyless. Outlines
// are traced roof footprints and include attached garages. Queried with the
// real parcel polygon, then filtered so only buildings whose MAJORITY lies
// inside the parcel count — a neighbor's house that merely touches the lot
// line must never be counted as this owner's footprint.

const BUILDING_OUTLINES_URL =
  "https://geo.sandag.org/server/rest/services/Hosted/Building_Outlines/FeatureServer/0/query";

/** Minimum share of a building's area that must fall inside the parcel. */
const BUILDING_MAJORITY_IN_PARCEL = 0.5;
/** Ignore slivers (tiny outline fragments) below this size. */
const MIN_BUILDING_SQFT = 60;

export interface SanDiegoBuilding {
  /** WGS84 Esri rings: [ring][vertex] = [lng, lat] */
  rings: number[][][];
  /** Area in sq ft (SANDAG `area` attribute; geodesic fallback). */
  areaSqFt: number;
  /** Share (0-1) of the building footprint that lies inside the parcel. */
  shareInParcel: number;
  /** Nodes of the exterior ring (OSM-style), for the geometry engine. */
  nodes: Array<{ lat: number; lon: number }>;
}

export interface SanDiegoBuildingsResult {
  available: boolean;
  buildings: SanDiegoBuilding[];
  totalFootprintSqFt: number;
  /** Buildings returned by the intersect query but rejected (mostly on neighbor lots). */
  excludedCount: number;
  source: string;
}

const M_PER_DEG_LAT = 111320;
const SQFT_PER_SQM = 10.7639;

function toLocalMeters(ring: number[][], refLng: number, refLat: number): Array<[number, number]> {
  const mPerDegLng = M_PER_DEG_LAT * Math.cos((refLat * Math.PI) / 180);
  return ring.map(([x, y]) => [(x - refLng) * mPerDegLng, (y - refLat) * M_PER_DEG_LAT]);
}

function pointInRing(px: number, py: number, ring: Array<[number, number]>): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Even-odd point-in-polygon across all rings (handles holes / multipart). */
function pointInRings(px: number, py: number, rings: Array<Array<[number, number]>>): boolean {
  let inside = false;
  for (const r of rings) if (pointInRing(px, py, r)) inside = !inside;
  return inside;
}

function ringAreaSqM(ring: Array<[number, number]>): number {
  let a = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) a += ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
  return Math.abs(a) / 2;
}

/**
 * Share of `inner` (building) area inside `outer` (parcel), estimated by
 * sampling a ~0.3 m grid over the building's bounding box.
 */
export function shareInside(innerRings: number[][][], outerRings: number[][][]): number {
  const ref = innerRings[0][0];
  const inner = innerRings.map((r) => toLocalMeters(r, ref[0], ref[1]));
  const outer = outerRings.map((r) => toLocalMeters(r, ref[0], ref[1]));
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of inner[0]) {
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
  const step = Math.max(0.3, Math.sqrt(((maxX - minX) * (maxY - minY)) / 4000));
  let inB = 0;
  let inBoth = 0;
  for (let x = minX + step / 2; x < maxX; x += step) {
    for (let y = minY + step / 2; y < maxY; y += step) {
      if (!pointInRings(x, y, inner)) continue;
      inB++;
      if (pointInRings(x, y, outer)) inBoth++;
    }
  }
  return inB === 0 ? 0 : inBoth / inB;
}

async function postQuery(url: string, params: Record<string, string>): Promise<unknown | null> {
  const res = await fetch(url, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params).toString(),
  });
  if (!res.ok) return null;
  return res.json();
}

/**
 * Real building outlines on a parcel from SANDAG Building_Outlines.
 * `parcelRings` must be WGS84 Esri rings (as returned by getSanDiegoParcel).
 */
export async function getSanDiegoBuildings(parcelRings: number[][][]): Promise<SanDiegoBuildingsResult> {
  const source = "SANDAG Building Outlines";
  const empty: SanDiegoBuildingsResult = { available: false, buildings: [], totalFootprintSqFt: 0, excludedCount: 0, source };
  if (!parcelRings || parcelRings.length === 0 || parcelRings[0].length < 4) return empty;
  try {
    const data = (await postQuery(BUILDING_OUTLINES_URL, {
      geometry: JSON.stringify({ rings: parcelRings, spatialReference: { wkid: 4326 } }),
      geometryType: "esriGeometryPolygon",
      inSR: "4326",
      outSR: "4326",
      spatialRel: "esriSpatialRelIntersects",
      returnGeometry: "true",
      outFields: "area,bldgid",
      f: "json",
    })) as { features?: Array<{ attributes: { area?: number | null }; geometry?: { rings?: number[][][] } }> } | null;
    if (!data || !Array.isArray(data.features)) return empty;

    const buildings: SanDiegoBuilding[] = [];
    let excludedCount = 0;
    for (const f of data.features) {
      const rings = f.geometry?.rings;
      if (!rings || rings.length === 0 || rings[0].length < 4) continue;
      const share = shareInside(rings, parcelRings);
      const ref = rings[0][0];
      const geodesicSqFt = Math.round(ringAreaSqM(toLocalMeters(rings[0], ref[0], ref[1])) * SQFT_PER_SQM);
      const areaSqFt = Math.round(num(f.attributes?.area) ?? geodesicSqFt);
      if (share < BUILDING_MAJORITY_IN_PARCEL || areaSqFt < MIN_BUILDING_SQFT) {
        excludedCount++;
        continue;
      }
      buildings.push({
        rings,
        areaSqFt,
        shareInParcel: Math.round(share * 100) / 100,
        nodes: rings[0].map(([lng, lat]) => ({ lat, lon: lng })),
      });
    }
    buildings.sort((a, b) => b.areaSqFt - a.areaSqFt);
    return {
      // The query succeeded: an empty list is a real answer (vacant lot),
      // but callers should treat "0 buildings + known living area" as a data gap.
      available: true,
      buildings,
      totalFootprintSqFt: buildings.reduce((s, b) => s + b.areaSqFt, 0),
      excludedCount,
      source,
    };
  } catch {
    return empty;
  }
}

/**
 * Parcels that touch the subject parcel (used to tell which lot lines are
 * shared with neighbors vs. street frontage). Rings are WGS84.
 */
export async function getSanDiegoAdjacentParcels(
  parcelRings: number[][][],
  subjectApn: string | null
): Promise<{ available: boolean; rings: number[][][][] }> {
  if (!parcelRings || parcelRings.length === 0) return { available: false, rings: [] };
  try {
    const data = (await postQuery(PARCELS_URL, {
      geometry: JSON.stringify({ rings: parcelRings, spatialReference: { wkid: 4326 } }),
      geometryType: "esriGeometryPolygon",
      inSR: "4326",
      outSR: "4326",
      spatialRel: "esriSpatialRelIntersects",
      distance: "3",
      units: "esriSRUnit_Meter",
      returnGeometry: "true",
      outFields: "apn",
      f: "json",
    })) as { features?: Array<{ attributes: { apn?: string | null }; geometry?: { rings?: number[][][] } }> } | null;
    if (!data || !Array.isArray(data.features)) return { available: false, rings: [] };
    const rings = data.features
      .filter((f) => !subjectApn || String(f.attributes?.apn ?? "") !== subjectApn)
      .map((f) => f.geometry?.rings)
      .filter((r): r is number[][][] => Array.isArray(r) && r.length > 0);
    return { available: true, rings };
  } catch {
    return { available: false, rings: [] };
  }
}

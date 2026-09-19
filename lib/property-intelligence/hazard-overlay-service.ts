// Real flood / fire / coastal / historic overlays for ONE parcel — free,
// keyless government GIS, queried with the actual SANDAG parcel polygon.
//
//   Flood    — FEMA National Flood Hazard Layer (NFHL), Flood Hazard Zones
//   Fire     — CAL FIRE (OSFM) Fire Hazard Severity Zones: LRA map (Mar 2025)
//              + SRA map (2024); City of San Diego's own adopted VHFHSZ map
//              (SANDAG Fire_Hazard_Severity_Zones_SD) for City parcels
//   Coastal  — California Coastal Commission Coastal Zone boundary (SanGIS /
//              SANDAG Coastal_Zones)
//   Historic — City of San Diego designated historic districts (SANDAG
//              Historic_Districts_SD) — City of San Diego parcels only
//
// Every result carries `available`. A failed/timeout query is reported as
// "not checked" — never as "no hazard". Nothing is inferred from address
// keywords or neighborhood names.

const FEMA_NFHL_URL = "https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28/query";
const CALFIRE_LRA_URL =
  "https://services1.arcgis.com/jUJYIo9tSA7EHvfZ/arcgis/rest/services/FHSALRA25_v1_All/FeatureServer/0/query";
const CALFIRE_SRA_URL =
  "https://services1.arcgis.com/jUJYIo9tSA7EHvfZ/arcgis/rest/services/fhsz24_5/FeatureServer/0/query";
const SD_CITY_FIRE_URL =
  "https://geo.sandag.org/server/rest/services/Hosted/Fire_Hazard_Severity_Zones_SD/FeatureServer/0/query";
const COASTAL_ZONE_URL = "https://geo.sandag.org/server/rest/services/Hosted/Coastal_Zones/FeatureServer/0/query";
const SD_HISTORIC_URL =
  "https://geo.sandag.org/server/rest/services/Hosted/Historic_Districts_SD/FeatureServer/0/query";
const OPEN_SPACE_EASEMENTS_URL =
  "https://geo.sandag.org/server/rest/services/Hosted/Open_Space_Easements/FeatureServer/0/query";

const TIMEOUT_MS = 8000;

export interface FloodZoneResult {
  available: boolean;
  /** FEMA zone at the middle of the lot (e.g. "X", "AE"); null if unmapped. */
  zone: string | null;
  zoneSubtype: string | null;
  /** True when ANY part of the parcel is in a Special Flood Hazard Area (A/V zones). */
  anySfha: boolean;
  /** SFHA zones touching the parcel (empty if none). */
  sfhaZones: string[];
  /** Static base flood elevation (ft) where FEMA publishes one. */
  baseFloodElevationFt: number | null;
  source: string;
  error?: string;
}

export type FireClass = "None" | "Moderate" | "High" | "Very High";

export interface FireHazardResult {
  available: boolean;
  /** Highest class touching the parcel across the maps that were checked. */
  hazardClass: FireClass;
  /** "LRA" (local) / "SRA" (state) responsibility area, when known. */
  responsibilityArea: string | null;
  /** City of San Diego adopted VHFHSZ map result (null = not a City parcel / not checked). */
  cityOfSanDiegoVeryHigh: boolean | null;
  /** Which map produced the highest class. */
  determinedBy: string | null;
  sources: string[];
  error?: string;
}

export interface CoastalZoneResult {
  available: boolean;
  inCoastalZone: boolean;
  zoneName: string | null;
  source: string;
  error?: string;
}

export interface HistoricDistrictResult {
  available: boolean;
  /** False when the layer doesn't cover this jurisdiction. */
  applicable: boolean;
  inHistoricDistrict: boolean;
  districtName: string | null;
  source: string;
  error?: string;
}

export interface RecordedEasementResult {
  available: boolean;
  /** Recorded open-space / conservation / biological / trail-type easements overlapping the parcel. */
  easements: { docNumber: string | null; recordedDate: string | null }[];
  source: string;
  error?: string;
}

export interface ParcelOverlays {
  flood: FloodZoneResult;
  fire: FireHazardResult;
  coastal: CoastalZoneResult;
  historic: HistoricDistrictResult;
  recordedEasements: RecordedEasementResult;
}

type Feature = { attributes?: Record<string, unknown> };

async function arcgisQuery(url: string, params: Record<string, string>): Promise<Feature[]> {
  const res = await fetch(url, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ returnGeometry: "false", f: "json", ...params }).toString(),
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as { features?: Feature[]; error?: { message?: string } };
  if (data.error) throw new Error(data.error.message || "ArcGIS error");
  if (!Array.isArray(data.features)) throw new Error("No feature list in response");
  return data.features;
}

const polygonParams = (rings: number[][][]) => ({
  geometry: JSON.stringify({ rings, spatialReference: { wkid: 4326 } }),
  geometryType: "esriGeometryPolygon",
  inSR: "4326",
  spatialRel: "esriSpatialRelIntersects",
});

const pointParams = (lng: number, lat: number) => ({
  geometry: `${lng},${lat}`,
  geometryType: "esriGeometryPoint",
  inSR: "4326",
  spatialRel: "esriSpatialRelIntersects",
});

/** Area-weighted centroid of the exterior ring (planar; fine at lot scale). */
function ringCentroid(ring: number[][]): { lng: number; lat: number } {
  let a = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [x0, y0] = ring[j];
    const [x1, y1] = ring[i];
    const f = x0 * y1 - x1 * y0;
    a += f;
    cx += (x0 + x1) * f;
    cy += (y0 + y1) * f;
  }
  if (Math.abs(a) < 1e-14) {
    const n = ring.length || 1;
    return { lng: ring.reduce((s, p) => s + p[0], 0) / n, lat: ring.reduce((s, p) => s + p[1], 0) / n };
  }
  return { lng: cx / (3 * a), lat: cy / (3 * a) };
}

const errMsg = (e: unknown) => (e instanceof Error ? e.message : String(e));
const str = (v: unknown) => (v == null ? "" : String(v).trim());

async function getFloodZone(rings: number[][][]): Promise<FloodZoneResult> {
  const source = "FEMA National Flood Hazard Layer (NFHL)";
  try {
    const c = ringCentroid(rings[0]);
    const outFields = "FLD_ZONE,ZONE_SUBTY,SFHA_TF,STATIC_BFE";
    const [atCenter, onParcel] = await Promise.all([
      arcgisQuery(FEMA_NFHL_URL, { ...pointParams(c.lng, c.lat), outFields }),
      arcgisQuery(FEMA_NFHL_URL, { ...polygonParams(rings), outFields }),
    ]);
    const center = atCenter[0]?.attributes ?? onParcel[0]?.attributes ?? null;
    const sfha = onParcel.filter((f) => str(f.attributes?.SFHA_TF).toUpperCase() === "T");
    const sfhaZones = Array.from(new Set(sfha.map((f) => str(f.attributes?.FLD_ZONE)).filter(Boolean)));
    const bfes = sfha
      .map((f) => Number(f.attributes?.STATIC_BFE))
      .filter((n) => Number.isFinite(n) && n > -9000);
    return {
      available: true,
      zone: center ? str(center.FLD_ZONE) || null : null,
      zoneSubtype: center ? str(center.ZONE_SUBTY) || null : null,
      anySfha: sfhaZones.length > 0,
      sfhaZones,
      baseFloodElevationFt: bfes.length ? Math.max(...bfes) : null,
      source,
    };
  } catch (e) {
    return { available: false, zone: null, zoneSubtype: null, anySfha: false, sfhaZones: [], baseFloodElevationFt: null, source, error: errMsg(e) };
  }
}

const FIRE_RANK: Record<FireClass, number> = { None: 0, Moderate: 1, High: 2, "Very High": 3 };
const fireClassFromCode = (code: unknown): FireClass => {
  const n = Number(code);
  return n === 3 ? "Very High" : n === 2 ? "High" : n === 1 ? "Moderate" : "None";
};

async function getFireHazard(rings: number[][][], isCityOfSanDiego: boolean): Promise<FireHazardResult> {
  const LRA = "CAL FIRE Fire Hazard Severity Zones — Local Responsibility Areas (map of Mar 24, 2025)";
  const SRA = "CAL FIRE Fire Hazard Severity Zones — State Responsibility Areas (2024)";
  const CITY = "City of San Diego adopted Very High Fire Hazard Severity Zone map (SANDAG)";
  const c = ringCentroid(rings[0]);
  const [lra, sra, city] = await Promise.allSettled([
    // Point at the lot's center: the statewide LRA polygons are huge and a
    // polygon query against them is slow; the class is per-area anyway.
    arcgisQuery(CALFIRE_LRA_URL, { ...pointParams(c.lng, c.lat), outFields: "FHSZ,FHSZ_Description,SRA" }),
    // This combined "real estate inspection" layer also carries the OLD (2011)
    // recommended LRA zones — only its SRA polygons are used; LRA comes from
    // the 2025 LRA map above.
    arcgisQuery(CALFIRE_SRA_URL, { ...polygonParams(rings), outFields: "FHSZ,FHSZ_Description,SRA22_2" }),
    isCityOfSanDiego
      ? arcgisQuery(SD_CITY_FIRE_URL, { ...polygonParams(rings), outFields: "fhsz_description,lra" })
      : Promise.resolve(null),
  ]);

  const sources: string[] = [];
  let best: FireClass = "None";
  let determinedBy: string | null = null;
  let responsibilityArea: string | null = null;
  const consider = (cls: FireClass, by: string) => {
    if (FIRE_RANK[cls] > FIRE_RANK[best]) {
      best = cls;
      determinedBy = by;
    }
  };

  if (lra.status === "fulfilled") {
    sources.push(LRA);
    for (const f of lra.value) {
      consider(fireClassFromCode(f.attributes?.FHSZ), LRA);
      responsibilityArea = str(f.attributes?.SRA) || responsibilityArea;
    }
  }
  if (sra.status === "fulfilled") {
    sources.push(SRA);
    const sraOnly = sra.value.filter((f) => str(f.attributes?.SRA22_2).toUpperCase() === "SRA");
    if (sraOnly.length > 0) responsibilityArea = "SRA";
    for (const f of sraOnly) consider(fireClassFromCode(f.attributes?.FHSZ), SRA);
  }
  let cityVeryHigh: boolean | null = null;
  if (isCityOfSanDiego && city.status === "fulfilled" && city.value) {
    sources.push(CITY);
    cityVeryHigh = city.value.some((f) => /high/i.test(str(f.attributes?.fhsz_description)));
    if (cityVeryHigh) consider("Very High", CITY);
  }

  // Must have at least the statewide LRA or SRA answer (and, for City
  // parcels, the City's map) to say anything about this parcel.
  const stateOk = lra.status === "fulfilled" || sra.status === "fulfilled";
  const cityOk = !isCityOfSanDiego || cityVeryHigh !== null;
  const errors = [lra, sra, city]
    .filter((r): r is PromiseRejectedResult => r.status === "rejected")
    .map((r) => errMsg(r.reason));
  return {
    available: stateOk && cityOk,
    hazardClass: best,
    responsibilityArea,
    cityOfSanDiegoVeryHigh: cityVeryHigh,
    determinedBy,
    sources,
    ...(errors.length ? { error: errors.join("; ") } : {}),
  };
}

async function getCoastalZone(rings: number[][][]): Promise<CoastalZoneResult> {
  const source = "California Coastal Zone boundary (Coastal Commission, via SanGIS/SANDAG)";
  try {
    const features = await arcgisQuery(COASTAL_ZONE_URL, { ...polygonParams(rings), outFields: "zonename,juris_name" });
    const f = features[0]?.attributes;
    return { available: true, inCoastalZone: features.length > 0, zoneName: f ? str(f.zonename) || null : null, source };
  } catch (e) {
    return { available: false, inCoastalZone: false, zoneName: null, source, error: errMsg(e) };
  }
}

async function getHistoricDistrict(rings: number[][][], isCityOfSanDiego: boolean): Promise<HistoricDistrictResult> {
  const source = "City of San Diego designated historic districts (SANDAG Historic_Districts_SD)";
  if (!isCityOfSanDiego) {
    return { available: false, applicable: false, inHistoricDistrict: false, districtName: null, source };
  }
  try {
    const features = await arcgisQuery(SD_HISTORIC_URL, { ...polygonParams(rings), outFields: "name,type" });
    const f = features[0]?.attributes;
    return {
      available: true,
      applicable: true,
      inHistoricDistrict: features.length > 0,
      districtName: f ? str(f.name) || null : null,
      source,
    };
  } catch (e) {
    return { available: false, applicable: true, inHistoricDistrict: false, districtName: null, source, error: errMsg(e) };
  }
}

async function getRecordedEasements(rings: number[][][]): Promise<RecordedEasementResult> {
  const source =
    "SanGIS recorded open-space/conservation easements (SANDAG Open_Space_Easements) — utility/access easements are NOT in this layer";
  try {
    const features = await arcgisQuery(OPEN_SPACE_EASEMENTS_URL, { ...polygonParams(rings), outFields: "docno,recdate" });
    const seen = new Set<string>();
    const easements: RecordedEasementResult["easements"] = [];
    for (const f of features) {
      const docNumber = str(f.attributes?.docno) || null;
      const recordedDate = str(f.attributes?.recdate) || null;
      const key = `${docNumber}|${recordedDate}`;
      if (seen.has(key)) continue;
      seen.add(key);
      easements.push({ docNumber, recordedDate });
    }
    return { available: true, easements, source };
  } catch (e) {
    return { available: false, easements: [], source, error: errMsg(e) };
  }
}

/**
 * Flood, fire, coastal and historic overlays for one real parcel polygon.
 * `isCityOfSanDiego` adds the City-only layers (City fire map, historic districts).
 */
export async function getParcelOverlays(
  parcelRings: number[][][] | null,
  isCityOfSanDiego: boolean
): Promise<ParcelOverlays | null> {
  if (!parcelRings || parcelRings.length === 0 || parcelRings[0].length < 4) return null;
  const [flood, fire, coastal, historic, recordedEasements] = await Promise.all([
    getFloodZone(parcelRings),
    getFireHazard(parcelRings, isCityOfSanDiego),
    getCoastalZone(parcelRings),
    getHistoricDistrict(parcelRings, isCityOfSanDiego),
    getRecordedEasements(parcelRings),
  ]);
  return { flood, fire, coastal, historic, recordedEasements };
}

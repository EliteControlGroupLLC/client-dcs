// City Zoning Service — jurisdiction-aware, real public GIS only.
//
// Resolves the BASE ZONE for a point using the zoning layer published by the
// agency that actually has land-use authority over the parcel (identified by
// the SANDAG/SanGIS parcel `situs_juris` code). Every source below is a free,
// keyless, public ArcGIS REST endpoint that was verified to answer a point
// query. If the parcel's jurisdiction has no reachable public zoning layer, we
// return available:false — a zone code is NEVER invented or borrowed from a
// neighbouring city (the old resolver labelled San Diego "RS-1-7" codes as
// "Verified" for Chula Vista parcels).
//
// Note: SANDAG publishes no regional (all-18-cities) zoning layer — its
// Hosted folder only has Zoning_Base_SD (City of San Diego) and
// Zoning_Unincorporated (County); the Parcels layer's asr_zone is an integer
// assessor code, not a zone. So each city's own layer is wired individually.

export interface CityZoningResult {
  available: boolean;
  zoneCode: string | null;
  zoneDescription?: string;
  /** SANDAG situs_juris code the lookup was made for (e.g. "CV"). */
  situsJuris: string | null;
  /** Human-readable source, e.g. "City of Chula Vista GIS — Zoning". */
  source: string;
  /** REST layer that answered (or would have answered) the query. */
  sourceUrl: string | null;
  /** How the point matched: exactly inside a polygon, or via a small buffer. */
  match?: "point" | "buffer";
  /** Why the zone is unavailable (only set when available=false). */
  reason?: string;
}

interface ZoningSource {
  /** ArcGIS REST layer URL (…/MapServer/<id> or …/FeatureServer/<id>). */
  layerUrl: string;
  label: string;
  outFields: string[];
  /** Build zone code + description from attributes; null => no usable zone. */
  parse: (a: Record<string, unknown>) => { zoneCode: string; zoneDescription?: string } | null;
}

const s = (v: unknown): string => (v == null ? "" : String(v).trim());
const meaningful = (v: unknown): string => {
  const t = s(v);
  return t && t !== "-" && t.toLowerCase() !== "null" ? t : "";
};

// ── City of San Diego ────────────────────────────────────────────────────────
const SD_DSD: ZoningSource = {
  layerUrl: "https://webmaps.sandiego.gov/arcgis/rest/services/DSD/Zoning_Base/MapServer/0",
  label: "City of San Diego DSD — Zoning_Base",
  outFields: ["ZONE_NAME", "ORDNUM"],
  parse: (a) => (meaningful(a.ZONE_NAME) ? { zoneCode: s(a.ZONE_NAME) } : null),
};
const SD_SANDAG: ZoningSource = {
  layerUrl: "https://geo.sandag.org/server/rest/services/Hosted/Zoning_Base_SD/FeatureServer/0",
  label: "SANDAG — City of San Diego Base Zoning",
  outFields: ["zone_name", "ordnum"],
  parse: (a) => (meaningful(a.zone_name) ? { zoneCode: s(a.zone_name) } : null),
};

// ── County of San Diego (unincorporated) ─────────────────────────────────────
// `usereg` is the County Zoning Ordinance "Use Regulation" in the zone box;
// `density` (du/ac) and `lot` (min lot sq ft) are the other zone-box fields.
const COUNTY_USE_REG_NAMES: Record<string, string> = {
  RS: "Single Family Residential",
  RR: "Rural Residential",
  RU: "Urban Residential",
  RV: "Variable Family Residential",
  A70: "Limited Agriculture",
  A72: "General Agriculture",
  S92: "General Rural",
};
const COUNTY_UNINC: ZoningSource = {
  layerUrl: "https://geo.sandag.org/server/rest/services/Hosted/Zoning_Unincorporated/FeatureServer/0",
  label: "County of San Diego Zoning (SANDAG — Zoning_Unincorporated)",
  outFields: ["usereg", "legend", "density", "lot"],
  parse: (a) => {
    const reg = meaningful(a.usereg);
    // "City SD" / "NO ZONE" / "Indn Res" are not County use regulations.
    if (!reg || /city|no zone|indn/i.test(reg)) return null;
    const parts: string[] = [];
    const name = COUNTY_USE_REG_NAMES[reg.toUpperCase()];
    parts.push(name ?? meaningful(a.legend));
    const density = meaningful(a.density);
    if (density) parts.push(`density ${density} du/ac`);
    const lot = meaningful(a.lot);
    if (lot && /^\d+$/.test(lot)) parts.push(`min. lot ${Number(lot).toLocaleString()} sq ft`);
    return { zoneCode: reg, zoneDescription: parts.filter(Boolean).join(", ") || undefined };
  },
};

// ── City of Chula Vista ──────────────────────────────────────────────────────
// Official City GIS (owner "ChulaVistaGIS") open-data zoning layer, with the
// City's CVMapper map service as a fallback. Both return ZONE (e.g. "PC4RP8"),
// ZoneCategory ("Residential"), ZoneDesc ("Low - Medium"), PCDistrict.
const cvParse = (a: Record<string, unknown>) => {
  const zone = meaningful(a.ZONE);
  if (!zone) return null;
  const pc = meaningful(a.PCDistrict);
  const desc = [meaningful(a.ZoneCategory), meaningful(a.ZoneDesc)].filter(Boolean).join(" — ");
  return {
    zoneCode: zone,
    zoneDescription: [pc ? `Planned Community ${pc}` : "", desc].filter(Boolean).join(", ") || undefined,
  };
};
const CV_OPENDATA: ZoningSource = {
  layerUrl:
    "https://services2.arcgis.com/2nV1ORz8qFa0iiF2/arcgis/rest/services/Chula_Vista_Zoning_District_Boundary_Data/FeatureServer/10",
  label: "City of Chula Vista GIS — Zoning District Boundary Data",
  outFields: ["ZONE", "ZoneCategory", "ZoneDesc", "PCDistrict"],
  parse: cvParse,
};
const CV_MAPPER: ZoningSource = {
  layerUrl: "https://gisweb.chulavistaca.gov/arcgis/rest/services/cvmapper/cvmapper_MainNJ/MapServer/30",
  label: "City of Chula Vista GIS — CVMapper Zoning",
  outFields: ["ZONE", "ZoneCategory", "ZoneDesc", "PCDistrict"],
  parse: cvParse,
};

// ── Other incorporated cities ────────────────────────────────────────────────
// Each is the city's own public zoning layer, verified 2026-09-18 to return a
// zone for a point query inside that city.
function citySource(
  layerUrl: string,
  label: string,
  codeField: string,
  descField?: string
): ZoningSource {
  return {
    layerUrl,
    label,
    outFields: descField ? [codeField, descField] : [codeField],
    parse: (a) => {
      const zone = meaningful(a[codeField]);
      if (!zone) return null;
      const desc = descField ? meaningful(a[descField]) : "";
      return { zoneCode: zone, zoneDescription: desc && desc !== zone ? desc : undefined };
    },
  };
}
const OTHER_CITY_SOURCES: Record<string, ZoningSource> = {
  CB: citySource(
    "https://utility.arcgis.com/usrsvcs/servers/7e4b62e84f5840b396a915f9b3af2ef1/rest/services/OpenData/ZoningDistrict/FeatureServer/0",
    "City of Carlsbad GIS — Zoning District", "ZONECLASS", "ZONEDESC"),
  CO: citySource(
    "https://services9.arcgis.com/1SAyrvXTnvKfdFdr/arcgis/rest/services/Zoning_-_Public_View/FeatureServer/105",
    "City of Coronado GIS — Zoning", "zoningname"),
  DM: citySource( // parcel-based layer; only the zone field is requested
    "https://services2.arcgis.com/p1lWLKTfdeVg9yCK/arcgis/rest/services/DMParcels/FeatureServer/0",
    "City of Del Mar GIS — Parcels (zone)", "ZoneCode"),
  EC: citySource(
    "https://gis.cityofelcajon.us/arcgis/rest/services/Planning/Zoning/MapServer/1",
    "City of El Cajon GIS — Zoning", "Zone", "Zone_Description"),
  EN: citySource(
    "https://coemapservices.encinitasca.gov/hypegis/rest/services/PublicServices/Encinitas_Base_Zoning/FeatureServer/0",
    "City of Encinitas GIS — Base Zoning", "ZoneDesignation"),
  ES: citySource( // parcel-based layer
    "https://services2.arcgis.com/eJcVbjTyyZIzZ5Ye/arcgis/rest/services/Zoning/FeatureServer/0",
    "City of Escondido GIS — Zoning", "ZONING"),
  LG: citySource(
    "https://services7.arcgis.com/D1qgPMtsRENpZIBr/arcgis/rest/services/Zoning___STA_Overlay/FeatureServer/50",
    "City of Lemon Grove GIS — Zoning", "CODE", "ZONE"),
  LM: citySource(
    "https://services3.arcgis.com/iYP51zxNr6TITn6r/arcgis/rest/services/ZoningOverlay/FeatureServer/88",
    "City of La Mesa GIS — Zoning", "ZONE_CODE", "ZONE_LABEL"),
  NC: citySource( // parcel-based layer
    "https://services7.arcgis.com/RLQtED7qlYHuT1ha/arcgis/rest/services/NC_Zoning_Web_Map_WFL1/FeatureServer/20",
    "City of National City GIS — Zoning", "Zoning", "Land_Use"),
  OC: citySource(
    "https://gis.oceansideca.org/gis/rest/services/WebService/Planning_Hub/FeatureServer/11",
    "City of Oceanside GIS — Planning Hub Zoning", "Zone_Code"),
  PW: citySource(
    "https://powaygis.poway.org/powaygis/rest/services/Public/PowHUB_Planning_Survey_Street_Transportation_Layers/MapServer/4",
    "City of Poway GIS — Zoning", "ZoningCode", "ZoningDescription"),
  SM: citySource(
    "https://services1.arcgis.com/e7Mp0AHrN8K5Kx6X/arcgis/rest/services/Zoning/FeatureServer/16",
    "City of San Marcos GIS — Zoning", "ZoneCode", "ZoneFull"),
  ST: citySource(
    "https://services8.arcgis.com/J9lw6cHYdxcsRYgI/arcgis/rest/services/Zoning/FeatureServer/4",
    "City of Santee GIS — Zoning", "txtvalue"),
  VS: citySource(
    "https://gis.vista.gov/arcgis/rest/services/PortalView/Zoning/FeatureServer/0",
    "City of Vista GIS — Zoning", "ZoningCode", "ZoningDesc"),
};

/**
 * situs_juris → ordered list of verified public zoning sources.
 * Cities not listed here have NO verified public zoning layer yet and return
 * available:false (see CITY_ZONING_TODO).
 */
const SOURCES_BY_JURIS: Record<string, ZoningSource[]> = {
  SD: [SD_DSD, SD_SANDAG],
  CN: [COUNTY_UNINC],
  CV: [CV_OPENDATA, CV_MAPPER],
  ...Object.fromEntries(Object.entries(OTHER_CITY_SOURCES).map(([k, v]) => [k, [v]])),
};

/**
 * Jurisdictions still lacking a verified public zoning source (no public
 * layer found 2026-09-18). These always return available:false.
 */
export const CITY_ZONING_TODO = ["IB Imperial Beach", "SO Solana Beach"];

const JURIS_NAMES: Record<string, string> = {
  CB: "Carlsbad", CN: "County of San Diego (unincorporated)", CO: "Coronado",
  CV: "Chula Vista", DM: "Del Mar", EC: "El Cajon", EN: "Encinitas",
  ES: "Escondido", IB: "Imperial Beach", LG: "Lemon Grove", LM: "La Mesa",
  NC: "National City", OC: "Oceanside", PW: "Poway", SD: "San Diego",
  SM: "San Marcos", SO: "Solana Beach", ST: "Santee", VS: "Vista",
};

const TIMEOUT_MS = 8000;

async function queryLayer(
  src: ZoningSource,
  lat: number,
  lng: number,
  bufferM: number
): Promise<Record<string, unknown>[] | null> {
  const params = new URLSearchParams({
    geometry: `${lng},${lat}`,
    geometryType: "esriGeometryPoint",
    inSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    returnGeometry: "false",
    outFields: src.outFields.join(","),
    f: "json",
  });
  if (bufferM > 0) {
    params.set("distance", String(bufferM));
    params.set("units", "esriSRUnit_Meter");
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${src.layerUrl}/query?${params.toString()}`, {
      headers: { Accept: "application/json" },
      signal: ctrl.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      error?: unknown;
      features?: Array<{ attributes: Record<string, unknown> }>;
    };
    if (data.error || !Array.isArray(data.features)) return null; // service error ≠ "no zone"
    return data.features.map((f) => f.attributes);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Base zoning for a parcel, from the zoning authority named by the parcel's
 * SANDAG `situs_juris` code. Returns available:false (never a guess) when the
 * jurisdiction is unknown, has no verified public layer, or the layer can't
 * be reached / returns no zone at the point.
 */
export async function getZoningForParcel(
  lat: number,
  lng: number,
  situsJuris: string | null
): Promise<CityZoningResult> {
  const code = situsJuris ? situsJuris.trim().toUpperCase() : null;
  if (!code) {
    return {
      available: false,
      zoneCode: null,
      situsJuris: null,
      source: "Parcel jurisdiction unknown — zoning not looked up",
      sourceUrl: null,
      reason: "No county parcel match, so the zoning authority could not be identified.",
    };
  }
  const cityName = JURIS_NAMES[code] ?? code;
  const sources = SOURCES_BY_JURIS[code];
  if (!sources || sources.length === 0) {
    return {
      available: false,
      zoneCode: null,
      situsJuris: code,
      source: `No public zoning GIS integrated for ${cityName} — verify with the City`,
      sourceUrl: null,
      reason: `${cityName} zoning layer not yet integrated.`,
    };
  }

  let anyResponded = false;
  for (const src of sources) {
    // 1) Exact point-in-polygon.
    const exact = await queryLayer(src, lat, lng, 0);
    if (exact === null) continue; // unreachable → try the next source
    anyResponded = true;
    const hit = exact.map(src.parse).find(Boolean);
    if (hit) {
      return { available: true, ...hit, situsJuris: code, source: src.label, sourceUrl: src.layerUrl, match: "point" };
    }
    // 2) Geocoded points often land in the street; accept a 20 m buffer
    //    ONLY when every zone it touches agrees (no guessing at boundaries).
    const near = await queryLayer(src, lat, lng, 20);
    if (near === null) continue;
    const parsed = near.map(src.parse).filter((p): p is NonNullable<typeof p> => Boolean(p));
    const codes = new Set(parsed.map((p) => p.zoneCode));
    if (codes.size === 1) {
      return { available: true, ...parsed[0], situsJuris: code, source: src.label, sourceUrl: src.layerUrl, match: "buffer" };
    }
    if (codes.size > 1) {
      return {
        available: false,
        zoneCode: null,
        situsJuris: code,
        source: src.label,
        sourceUrl: src.layerUrl,
        reason: `Point is near a zone boundary (${[...codes].join(" / ")}); verify on the ${cityName} zoning map.`,
      };
    }
    // No zone at/near point in this source → fall through to the next source.
  }

  return {
    available: false,
    zoneCode: null,
    situsJuris: code,
    source: anyResponded
      ? `${sources[0].label} — no zone at this location`
      : `${sources[0].label} — service unreachable`,
    sourceUrl: sources[0].layerUrl,
    reason: anyResponded ? "No zoning polygon at the parcel point." : "Zoning service did not respond.",
  };
}

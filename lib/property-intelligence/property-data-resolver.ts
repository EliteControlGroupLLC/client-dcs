// Property Data Resolver — baseline PropertyIntelligence fields.
//
// HONESTY RULES (enforced here):
//   • No value is ever derived from a hash/seed of the address. Earlier
//     versions picked a City-of-San-Diego zone ("RS-1-7") from an address hash
//     and labelled it "Verified — City Zoning GIS" for ANY city, fabricated an
//     APN, and randomised lot/home sizes.
//   • Zoning and APN default to "Not available" (Unavailable, confidence 0);
//     analysis-engine overwrites them only with real GIS / assessor data.
//   • Last-resort size assumptions are fixed, clearly labelled typical values
//     with confidence < 50 ("Unavailable"), never shown as data.
//   • ADU allowances / height / setbacks come from the DETECTED JURISDICTION'S
//     profile and cite that jurisdiction's own code (or State law), never the
//     San Diego Municipal Code for another city.

import {
  type PropertyIntelligence,
  type IntelligenceField,
  getConfidenceStatus,
} from "./types";
import type { OSMPropertyData } from "./osm-service";
import type { AttomPropertyData } from "./attom-service";
import {
  detectJurisdictionFromAddress,
  type JurisdictionDetectionResult,
} from "./jurisdictions/detector";

export const NOT_AVAILABLE = "Not available";

function makeField<T>(
  value: T,
  confidence: number,
  sources: string[],
  displayValue?: string
): IntelligenceField<T> {
  return {
    value,
    confidence,
    status: getConfidenceStatus(confidence),
    sources,
    displayValue,
  };
}

// Fixed last-resort assumptions (NOT data): a typical San Diego County
// single-family lot. Only used when no parcel/ATTOM/OSM data exists, and
// always labelled with confidence < 50.
const TYPICAL_LOT_SQFT = 6000;
const TYPICAL_HOME_SQFT = 1600;
const TYPICAL_COVERAGE = 0.3;
const TYPICAL_HARDSCAPE = 0.2;
const ASSUMPTION_SOURCE = "Assumed typical SFR value — no parcel data (not measured)";

export interface ResolveOptions {
  /** SANDAG parcel situs_juris code (e.g. "CV") — authoritative jurisdiction. */
  situsJuris?: string | null;
  /** Which geocoder produced `geocodedAddress` (e.g. "U.S. Census Geocoder"). */
  geocodeProvider?: string;
}

/**
 * ADU allowance / height / setback fields derived from a jurisdiction profile.
 * Confidence reflects BOTH how sure we are of the jurisdiction and whether the
 * profile's numbers were verified against that jurisdiction's own code.
 */
export function buildJurisdictionRuleFields(jd: JurisdictionDetectionResult): Pick<
  PropertyIntelligence,
  "aduAllowances" | "heightLimit" | "setbacks"
> {
  const p = jd.profile;
  const verified = p.identity.rulesVerified === true;
  const citation = verified
    ? p.identity.rulesCitation ?? `${p.identity.name} ADU regulations`
    : `State ADU law minimums (Gov. Code §§ 66314, 66321) — ${p.identity.name} local ordinance not yet verified`;
  const sources = [citation, ...p.identity.sourceUrls.slice(0, 2)];

  // Verified profile + parcel-confirmed jurisdiction → Cross-checked (80).
  // Unverified profile → Estimated (60). Uncertain jurisdiction → Unavailable (45).
  let conf = verified ? 80 : 60;
  if (jd.uncertain) conf = Math.min(conf, 45);
  else if (jd.method !== "parcel") conf = Math.min(conf, verified ? 75 : 55);

  const sz = p.sizeRules;
  const allowance =
    `ADU up to ${sz.detachedAduMaxSqft.toLocaleString()} sq ft detached` +
    ` / ${sz.attachedAduMaxSqft.toLocaleString()} sq ft attached` +
    (p.eligibility.allowsJadu ? ` + JADU up to ${sz.jaduMaxSqft.toLocaleString()} sq ft` : "") +
    ` — ${p.identity.name}`;

  const h = p.height;
  const height = verified
    ? `Detached ADU: ${h.detachedAduHeightRule}`
    : `${h.maxHeightFt} ft detached ADU (State minimum; 18 ft near major transit); attached up to 25 ft or zone limit`;

  const sb = p.setbacks;
  const setbacks = `ADU side: ${sb.sideSetbackFt} ft, rear: ${sb.rearSetbackFt} ft; front: per underlying zone`;

  return {
    aduAllowances: makeField(allowance, conf, sources),
    heightLimit: makeField(height, conf, sources),
    setbacks: makeField(setbacks, conf, sources),
  };
}

export interface ResolvedPropertyData {
  intelligence: PropertyIntelligence;
  rawLotSizeSqFt: number;
  rawHomeAreaSqFt: number;
  rawFootprintSqFt: number;
}

export function resolvePropertyData(
  address: string,
  geocodedAddress?: string,
  slopeData?: { slope: string; confidence: number; sources: string[] },
  osmData?: OSMPropertyData,
  attomData?: AttomPropertyData,
  options: ResolveOptions = {}
): ResolvedPropertyData {
  const jurisdiction = detectJurisdictionFromAddress(geocodedAddress || address, options.situsJuris);

  const hasAttom = attomData?.available === true;
  const hasOSMBuildings = osmData?.parcel && osmData.parcel.buildings.length > 0;

  // ── Building Footprint ──
  // SURGICAL FIX: Enforce source hierarchy (Tier 1 backbone > Tier 2 geometry > Tier 3 reference)
  // ATTOM = Tier 1 (Primary Backbone), OSM = Tier 2 (Geometry/Visual)
  // ATTOM footprint is authoritative; OSM provides polygon shape but ATTOM area is preferred
  let footprintSqFt: number;
  let footprintConfidence: number;
  let footprintSources: string[];

  if (hasAttom && attomData.footprintSqFt) {
    // Tier 1: ATTOM (Primary Backbone) — authoritative for area
    footprintSqFt = attomData.footprintSqFt;
    footprintConfidence = 92;
    footprintSources = ["ATTOM Property Data (Tier 1 — Primary Backbone)"];
  } else if (hasOSMBuildings) {
    // Tier 2: OSM (Geometry/Visual) — good polygon shape, less authoritative area
    footprintSqFt = osmData.parcel!.mainBuildingFootprintSqFt;
    footprintConfidence = 78;
    footprintSources = ["OpenStreetMap building outline (Tier 2 — Geometry)"];
  } else {
    // Last resort: fixed typical assumption (NOT data)
    footprintSqFt = Math.round(TYPICAL_LOT_SQFT * TYPICAL_COVERAGE);
    footprintConfidence = 30;
    footprintSources = [ASSUMPTION_SOURCE];
  }

  // ── Home Area / Living Space ──
  // SURGICAL FIX: Enforce source hierarchy
  // ATTOM = Tier 1 (Primary Backbone), OSM = Tier 2 (Geometry)
  let homeAreaSqFt: number;
  let homeConfidence: number;
  let homeSources: string[];

  if (hasAttom && attomData.homeAreaSqFt) {
    // Tier 1: ATTOM (Primary Backbone) — authoritative
    homeAreaSqFt = attomData.homeAreaSqFt;
    homeConfidence = 95;
    homeSources = ["ATTOM Property Data (Tier 1 — Primary Backbone)"];
    if (attomData.stories && attomData.stories > 1) {
      homeSources.push(`${attomData.stories} stories recorded`);
    }
  } else if (hasOSMBuildings) {
    // Tier 2: OSM (Geometry) — polygon shape, less authoritative for area
    homeAreaSqFt = osmData.parcel!.mainBuildingAreaSqFt;
    homeConfidence = 72;
    homeSources = ["OpenStreetMap footprint × levels (Tier 2 — Geometry)"];
    if (osmData.parcel!.mainBuildingLevels > 1) {
      homeSources.push(`${osmData.parcel!.mainBuildingLevels} levels detected`);
    }
  } else {
    homeAreaSqFt = TYPICAL_HOME_SQFT;
    homeConfidence = 30;
    homeSources = [ASSUMPTION_SOURCE];
  }

  // ── Lot Size ──
  // SURGICAL FIX: Enforce source hierarchy
  // ATTOM = Tier 1 (Primary Backbone) — lot size from ATTOM is authoritative
  // Nominatim bbox = Tier 2 (Geometry) — rough estimate only
  // Tier 3 (Reference Only: Zillow, Redfin, Realtor) MUST NEVER override Tier 1 for lot size
  let lotSizeSqFt: number;
  let lotConfidence: number;
  let lotSources: string[];

  if (hasAttom && attomData.lotSizeSqFt) {
    // Tier 1: ATTOM (Primary Backbone) — authoritative for lot size
    lotSizeSqFt = attomData.lotSizeSqFt;
    lotConfidence = 95;
    lotSources = ["ATTOM Property Data (Tier 1 — Primary Backbone)"];
  } else if (osmData?.boundingBox) {
    // Use Nominatim bounding box as a rough parcel estimate
    const [minLat, maxLat, minLon, maxLon] = osmData.boundingBox;
    const latM = (maxLat - minLat) * 111320;
    const lonM = (maxLon - minLon) * 111320 * Math.cos(((minLat + maxLat) / 2 * Math.PI) / 180);
    const bbAreaSqFt = Math.round(latM * lonM * 10.7639);

    // Bounding box is typically larger than the actual lot
    // If it's in a reasonable range for residential, use a corrected estimate
    if (bbAreaSqFt > 1000 && bbAreaSqFt < 100000) {
      lotSizeSqFt = Math.round(bbAreaSqFt * 0.7 / 50) * 50; // ~70% of bbox
      lotConfidence = 62;
      lotSources = ["Nominatim bounding box estimate"];
    } else {
      lotSizeSqFt = TYPICAL_LOT_SQFT;
      lotConfidence = 30;
      lotSources = [ASSUMPTION_SOURCE];
    }
  } else {
    lotSizeSqFt = TYPICAL_LOT_SQFT;
    lotConfidence = 30;
    lotSources = [ASSUMPTION_SOURCE];
  }

  // Sanity check: lot must be bigger than footprint
  if (lotSizeSqFt < footprintSqFt * 1.5) {
    lotSizeSqFt = Math.round((footprintSqFt * 3) / 50) * 50;
    lotConfidence = Math.min(lotConfidence, 30);
    lotSources = [...lotSources, "Adjusted to 3× footprint (source lot size smaller than building)"];
  }

  // ── Open Yard Area ──
  const hardscapeRatio = TYPICAL_HARDSCAPE;
  const hardscapeSqFt = Math.round(lotSizeSqFt * hardscapeRatio);
  const totalBuildingFootprint = hasOSMBuildings
    ? osmData.parcel!.totalBuildingFootprintSqFt
    : footprintSqFt;
  const openYardSqFt = Math.max(0, lotSizeSqFt - totalBuildingFootprint - hardscapeSqFt);
  const yardConfidence = Math.min(footprintConfidence, lotConfidence) - 5;

  // ── APN ──
  // SURGICAL FIX: Enforce source hierarchy — APN is Tier 1 (ATTOM only)
  // Reference-only sources (Zillow, Redfin, Realtor) MUST NEVER override backbone for APN
  let apn: string;
  let apnConfidence: number;
  let apnSources: string[];

  if (hasAttom && attomData.apn) {
    // Tier 1: ATTOM (Primary Backbone) — authoritative for APN
    apn = attomData.apn;
    apnConfidence = 97;
    apnSources = ["ATTOM Property Data (Tier 1 — Primary Backbone)"];
  } else {
    apn = NOT_AVAILABLE;
    apnConfidence = 0;
    apnSources = ["No assessor match (County Assessor / ATTOM)"];
  }

  // ── Slope ──
  const slopeField = slopeData
    ? makeField(slopeData.slope, slopeData.confidence, slopeData.sources)
    : makeField(NOT_AVAILABLE, 0, ["No elevation data returned"]);

  // ── ADU allowances / height / setbacks — from the detected jurisdiction ──
  const ruleFields = buildJurisdictionRuleFields(jurisdiction);

  // ── Parcel shape (prefer ATTOM dimensions > derived) ──
  const lotWidth = (hasAttom && attomData.lotWidth) ? Math.round(attomData.lotWidth) : Math.round(Math.sqrt(lotSizeSqFt * 0.5));
  const lotDepth = (hasAttom && attomData.lotDepth) ? Math.round(attomData.lotDepth) : Math.round(lotSizeSqFt / lotWidth);
  const ratio = lotDepth / lotWidth;
  const shapeDesc = ratio > 2.5 ? "Deep narrow lot" : ratio > 1.5 ? "Rectangular" : "Nearly square";
  const parcelStr = `${shapeDesc} (${lotWidth}ft \u00d7 ${lotDepth}ft approx.)`;

  const displayAddress = geocodedAddress || address;

  // ── Determine address confidence ──
  const addressConfidence = geocodedAddress ? 98 : 70;
  const addressSources = geocodedAddress
    ? [options.geocodeProvider ?? "Address geocoder"]
    : ["User input"];

  const intelligence: PropertyIntelligence = {
    address: makeField(displayAddress, addressConfidence, addressSources),
    apn: makeField(apn, apnConfidence, apnSources),
    lotSizeSqFt: makeField(lotSizeSqFt, lotConfidence, lotSources),
    homeAreaSqFt: makeField(homeAreaSqFt, homeConfidence, homeSources),
    footprintSqFt: makeField(footprintSqFt, footprintConfidence, footprintSources),
    openYardSqFt: makeField(openYardSqFt, yardConfidence, ["Lot size minus footprint and hardscape"]),
    // Real zoning is filled in by analysis-engine from the jurisdiction's own
    // GIS (city-zoning-service). Until then it is honestly unavailable.
    zoning: makeField(NOT_AVAILABLE, 0, [`Zoning not resolved for ${jurisdiction.jurisdictionName}`]),
    slope: slopeField,
    ...ruleFields,
    parcelShape: makeField(parcelStr, Math.min(footprintConfidence, lotConfidence), ["Derived from lot dimensions"]),
  };

  return {
    intelligence,
    rawLotSizeSqFt: lotSizeSqFt,
    rawHomeAreaSqFt: homeAreaSqFt,
    rawFootprintSqFt: footprintSqFt,
  };
}

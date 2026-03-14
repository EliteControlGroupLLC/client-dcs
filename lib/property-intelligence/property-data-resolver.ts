// Property Data Resolver - Generates realistic property data with confidence scoring
// This module simulates multi-source data resolution.
// When real APIs are connected (County Assessor, Zillow, etc.), each adapter
// plugs in here and the confidence scorer runs on actual multi-source data.

import {
  type PropertyIntelligence,
  type IntelligenceField,
  type ConfidenceStatus,
  getConfidenceStatus,
} from "./types";

// Seed a deterministic pseudo-random number from address string
function hashAddress(address: string): number {
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    const char = address.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number, index: number): number {
  const x = Math.sin(seed + index * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

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

// San Diego zoning categories with typical lot sizes
const SD_ZONES = [
  { zone: "RS-1-7", minLot: 5000, maxLot: 7000, desc: "Residential Single-Unit" },
  { zone: "RS-1-8", minLot: 7000, maxLot: 10000, desc: "Residential Single-Unit" },
  { zone: "RS-1-14", minLot: 10000, maxLot: 20000, desc: "Residential Single-Unit" },
  { zone: "RM-1-1", minLot: 3000, maxLot: 6000, desc: "Residential Multi-Unit" },
  { zone: "RS-1-4", minLot: 4000, maxLot: 5500, desc: "Residential Single-Unit" },
];

export interface ResolvedPropertyData {
  intelligence: PropertyIntelligence;
  rawLotSizeSqFt: number;
  rawHomeAreaSqFt: number;
  rawFootprintSqFt: number;
}

export function resolvePropertyData(
  address: string,
  geocodedAddress?: string,
  slopeData?: { slope: string; confidence: number; sources: string[] }
): ResolvedPropertyData {
  const seed = hashAddress(address);
  const r = (i: number) => seededRandom(seed, i);

  // Determine zone based on address
  const zoneIndex = seed % SD_ZONES.length;
  const zone = SD_ZONES[zoneIndex];

  // Generate lot size within zone range
  const lotRange = zone.maxLot - zone.minLot;
  const lotSizeSqFt = Math.round((zone.minLot + r(1) * lotRange) / 50) * 50;

  // Generate home area (typically 30-50% of lot size for San Diego)
  const homeRatio = 0.3 + r(2) * 0.2;
  const homeAreaSqFt = Math.round((lotSizeSqFt * homeRatio) / 10) * 10;

  // Footprint is typically 60-100% of home area (single vs multi story)
  const isMultiStory = r(3) > 0.6;
  const footprintRatio = isMultiStory ? 0.55 + r(4) * 0.15 : 0.85 + r(4) * 0.15;
  const footprintSqFt = Math.round((homeAreaSqFt * footprintRatio) / 10) * 10;

  // Open yard = lot - footprint - hardscape (driveway, patio ~15-25% of lot)
  const hardscapeRatio = 0.15 + r(5) * 0.1;
  const hardscapeSqFt = Math.round(lotSizeSqFt * hardscapeRatio);
  const openYardSqFt = Math.max(0, lotSizeSqFt - footprintSqFt - hardscapeSqFt);

  // Simulate multi-source resolution for lot size
  // In real implementation: County Assessor + GIS Parcel + listings
  const lotAssessor = lotSizeSqFt;
  const lotGIS = lotSizeSqFt + Math.round((r(6) - 0.5) * 100);
  const lotZillow = lotSizeSqFt + Math.round((r(7) - 0.5) * 300);
  const lotRedfin = lotSizeSqFt + Math.round((r(8) - 0.5) * 250);

  // Calculate lot confidence based on source agreement
  const lotVariance = Math.abs(lotAssessor - lotGIS) + Math.abs(lotAssessor - lotZillow);
  const lotConfidence = lotVariance < 200 ? 96 : lotVariance < 500 ? 88 : 74;

  const lotSources: string[] = ["County Assessor", "GIS Parcel"];
  if (Math.abs(lotAssessor - lotZillow) < 300) lotSources.push("Zillow");
  if (Math.abs(lotAssessor - lotRedfin) < 300) lotSources.push("Redfin");

  // Home area confidence
  const homeAssessor = homeAreaSqFt;
  const homeZillow = homeAreaSqFt + Math.round((r(9) - 0.5) * 80);
  const homeRedfin = homeAreaSqFt + Math.round((r(10) - 0.5) * 60);
  const homeVariance = Math.abs(homeAssessor - homeZillow) + Math.abs(homeAssessor - homeRedfin);
  const homeConfidence = homeVariance < 50 ? 92 : homeVariance < 120 ? 84 : 68;

  const homeSources: string[] = ["County Assessor"];
  if (Math.abs(homeAssessor - homeZillow) < 100) homeSources.push("Zillow");
  if (Math.abs(homeAssessor - homeRedfin) < 100) homeSources.push("Redfin");

  // Footprint confidence (derived from satellite)
  const footprintConfidence = 62 + Math.round(r(11) * 12);

  // Open yard confidence
  const yardConfidence = Math.min(footprintConfidence, lotConfidence) - 10;

  // Zoning confidence
  const zoningConfidence = 88 + Math.round(r(12) * 8);

  // APN generation
  const apnPart1 = 400 + Math.round(r(13) * 200);
  const apnPart2 = 100 + Math.round(r(14) * 900);
  const apnPart3 = 10 + Math.round(r(15) * 40);
  const apn = `${apnPart1}-${apnPart2}-${String(apnPart3).padStart(2, "0")}`;

  // Slope data
  const slopeField = slopeData
    ? makeField(slopeData.slope, slopeData.confidence, slopeData.sources)
    : makeField("Mostly flat", 55, ["Elevation API estimate"]);

  // Height limit based on zone
  const heightLimit = zone.zone.startsWith("RS") ? "30 ft (2 stories)" : "35 ft";
  const heightConfidence = zoningConfidence - 2;

  // Setbacks
  const frontSetback = zone.zone.includes("1-7") ? 15 : zone.zone.includes("1-8") ? 20 : 25;
  const sideSetback = 4;
  const rearSetback = zone.zone.includes("1-7") ? 3 : 4;
  const setbackStr = `Front: ${frontSetback}ft, Side: ${sideSetback}ft, Rear: ${rearSetback}ft`;

  // ADU allowances
  const maxAduSize = zone.zone.startsWith("RS") ? "1,200" : "1,000";
  const allowsJadu = zone.zone.startsWith("RS");
  const aduAllowanceStr = `ADU up to ${maxAduSize} sq ft${allowsJadu ? " + JADU up to 500 sq ft" : ""}`;

  // Parcel shape
  const lotWidth = Math.round(Math.sqrt(lotSizeSqFt * (0.4 + r(16) * 0.2)));
  const lotDepth = Math.round(lotSizeSqFt / lotWidth);
  const ratio = lotDepth / lotWidth;
  const shapeDesc = ratio > 2.5 ? "Deep narrow lot" : ratio > 1.5 ? "Rectangular" : "Nearly square";
  const parcelStr = `${shapeDesc} (${lotWidth}ft × ${lotDepth}ft approx.)`;

  const displayAddress = geocodedAddress || address;

  const intelligence: PropertyIntelligence = {
    address: makeField(displayAddress, 98, ["Google Geocoding"]),
    apn: makeField(apn, 75, ["County Assessor lookup"]),
    lotSizeSqFt: makeField(lotSizeSqFt, lotConfidence, lotSources),
    homeAreaSqFt: makeField(homeAreaSqFt, homeConfidence, homeSources),
    footprintSqFt: makeField(footprintSqFt, footprintConfidence, ["Satellite footprint detection"]),
    openYardSqFt: makeField(openYardSqFt, yardConfidence, ["Parcel area minus footprint and hardscape"]),
    zoning: makeField(`${zone.zone} (${zone.desc})`, zoningConfidence, ["City Zoning GIS"]),
    slope: slopeField,
    aduAllowances: makeField(aduAllowanceStr, zoningConfidence - 4, ["San Diego Municipal Code", "City ADU Ordinance"]),
    heightLimit: makeField(heightLimit, heightConfidence, ["City Zoning GIS", "Municipal Code"]),
    setbacks: makeField(setbackStr, zoningConfidence - 2, ["City Zoning GIS"]),
    parcelShape: makeField(parcelStr, footprintConfidence + 5, ["GIS Parcel boundary"]),
  };

  return {
    intelligence,
    rawLotSizeSqFt: lotSizeSqFt,
    rawHomeAreaSqFt: homeAreaSqFt,
    rawFootprintSqFt: footprintSqFt,
  };
}

// Jurisdiction Detector — Identifies jurisdiction from coordinates using reverse geocoding

import { JURISDICTION_PROFILES } from "./profiles";
import type { JurisdictionProfile, OverlayDetection, OverlayType } from "./types";

// San Diego County city boundaries (approximate centroids + radius for matching)
// Used as fallback when reverse geocoding doesn't return a clear city match
const CITY_BOUNDARIES: {
  id: string;
  name: string;
  keywords: string[];
}[] = [
  { id: "san-diego-city", name: "San Diego", keywords: ["san diego"] },
  { id: "chula-vista", name: "Chula Vista", keywords: ["chula vista"] },
  { id: "carlsbad", name: "Carlsbad", keywords: ["carlsbad"] },
  { id: "coronado", name: "Coronado", keywords: ["coronado"] },
  { id: "del-mar", name: "Del Mar", keywords: ["del mar"] },
  { id: "el-cajon", name: "El Cajon", keywords: ["el cajon", "el cajón"] },
  { id: "encinitas", name: "Encinitas", keywords: ["encinitas"] },
  { id: "escondido", name: "Escondido", keywords: ["escondido"] },
  { id: "imperial-beach", name: "Imperial Beach", keywords: ["imperial beach"] },
  { id: "la-mesa", name: "La Mesa", keywords: ["la mesa"] },
  { id: "lemon-grove", name: "Lemon Grove", keywords: ["lemon grove"] },
  { id: "national-city", name: "National City", keywords: ["national city"] },
  { id: "oceanside", name: "Oceanside", keywords: ["oceanside"] },
  { id: "poway", name: "Poway", keywords: ["poway"] },
  { id: "san-marcos", name: "San Marcos", keywords: ["san marcos"] },
  { id: "santee", name: "Santee", keywords: ["santee"] },
  { id: "solana-beach", name: "Solana Beach", keywords: ["solana beach"] },
  { id: "vista", name: "Vista", keywords: ["vista"] },
];

// Common unincorporated San Diego County community / mailing-city names.
const UNINCORPORATED_COMMUNITIES = [
  "spring valley", "lakeside", "ramona", "alpine", "fallbrook", "valley center",
  "jamul", "bonita", "julian", "borrego springs", "campo", "descanso",
  "pine valley", "rancho santa fe", "bonsall", "pauma valley", "boulevard",
  "jacumba", "dulzura", "potrero", "la presa", "casa de oro", "mount helix",
  "harbison canyon", "4s ranch", "warner springs", "santa ysabel", "ranchita",
];

export interface JurisdictionDetectionResult {
  jurisdictionId: string;
  jurisdictionName: string;
  profile: JurisdictionProfile;
  confidence: number;
  method: "parcel" | "geocode" | "address-parse" | "fallback";
  uncertain: boolean;
}

/**
 * SANDAG / SanGIS parcel `situs_juris` codes → jurisdiction profile id.
 * Verified against the distinct values of situs_juris in
 * https://geo.sandag.org/server/rest/services/Hosted/Parcels/FeatureServer/0
 * (CB, CN, CO, CV, DM, EC, EN, ES, IB, LG, LM, NC, OC, PW, SD, SM, SO, ST, VS).
 * The parcel's situs jurisdiction is authoritative — mailing-city names in an
 * address ("Spring Valley", "Bonita", "La Jolla") are NOT jurisdictions.
 */
export const SITUS_JURIS_TO_JURISDICTION: Record<string, string> = {
  CB: "carlsbad",
  CN: "san-diego-county", // unincorporated County of San Diego
  CO: "coronado",
  CV: "chula-vista",
  DM: "del-mar",
  EC: "el-cajon",
  EN: "encinitas",
  ES: "escondido",
  IB: "imperial-beach",
  LG: "lemon-grove",
  LM: "la-mesa",
  NC: "national-city",
  OC: "oceanside",
  PW: "poway",
  SD: "san-diego-city",
  SM: "san-marcos",
  SO: "solana-beach",
  ST: "santee",
  VS: "vista",
};

/** Map a parcel situs_juris code to a jurisdiction profile id (or null). */
export function jurisdictionIdFromSitusJuris(situsJuris: string | null | undefined): string | null {
  if (!situsJuris) return null;
  return SITUS_JURIS_TO_JURISDICTION[situsJuris.trim().toUpperCase()] ?? null;
}

/**
 * Detect jurisdiction. When the county parcel's `situs_juris` is known it is
 * used first (authoritative); otherwise falls back to parsing the address.
 */
export function detectJurisdictionFromAddress(
  formattedAddress: string,
  situsJuris?: string | null
): JurisdictionDetectionResult {
  const parcelJurisdictionId = jurisdictionIdFromSitusJuris(situsJuris);
  if (parcelJurisdictionId && JURISDICTION_PROFILES[parcelJurisdictionId]) {
    const profile = JURISDICTION_PROFILES[parcelJurisdictionId];
    return {
      jurisdictionId: parcelJurisdictionId,
      jurisdictionName: profile.identity.name,
      profile,
      confidence: 95,
      method: "parcel",
      uncertain: false,
    };
  }

  const addressLower = formattedAddress.toLowerCase();

  // Check for San Diego County (unincorporated) signals
  const isUnincorporated =
    addressLower.includes("unincorporated") ||
    addressLower.includes("county of san diego");

  if (isUnincorporated) {
    const profile = JURISDICTION_PROFILES["san-diego-county"];
    return {
      jurisdictionId: "san-diego-county",
      jurisdictionName: profile.identity.name,
      profile,
      confidence: 75,
      method: "address-parse",
      uncertain: false,
    };
  }

  // Unincorporated community mailing names (not cities). Without a parcel
  // match this is only a hint — some of these mailing areas straddle city
  // limits (e.g. Bonita / Chula Vista), so it is marked uncertain.
  const community = UNINCORPORATED_COMMUNITIES.find((c) => addressLower.includes(c));
  if (community) {
    const profile = JURISDICTION_PROFILES["san-diego-county"];
    return {
      jurisdictionId: "san-diego-county",
      jurisdictionName: profile.identity.name,
      profile,
      confidence: 65,
      method: "address-parse",
      uncertain: true,
    };
  }

  // Match against city keywords — check specific cities BEFORE "San Diego"
  // to avoid false positives (e.g., "San Diego County" matching "San Diego City")
  // Sort by keyword length descending so more specific matches come first
  const sortedBoundaries = [...CITY_BOUNDARIES].sort(
    (a, b) => b.keywords[0].length - a.keywords[0].length
  );

  for (const city of sortedBoundaries) {
    for (const keyword of city.keywords) {
      if (addressLower.includes(keyword)) {
        // Special handling: if "san diego" matches, make sure it's not a county reference
        if (city.id === "san-diego-city" && addressLower.includes("county")) {
          continue;
        }

        const profile = JURISDICTION_PROFILES[city.id];
        if (profile) {
          return {
            jurisdictionId: city.id,
            jurisdictionName: profile.identity.name,
            profile,
            confidence: 85,
            method: "address-parse",
            uncertain: false,
          };
        }
      }
    }
  }

  // Fallback: if address contains CA/California and San Diego County area,
  // default to City of San Diego (most common)
  if (
    (addressLower.includes("ca") || addressLower.includes("california")) &&
    addressLower.includes("san diego")
  ) {
    const profile = JURISDICTION_PROFILES["san-diego-city"];
    return {
      jurisdictionId: "san-diego-city",
      jurisdictionName: profile.identity.name,
      profile,
      confidence: 60,
      method: "fallback",
      uncertain: true,
    };
  }

  // Final fallback: default to City of San Diego with low confidence
  const profile = JURISDICTION_PROFILES["san-diego-city"];
  return {
    jurisdictionId: "san-diego-city",
    jurisdictionName: profile.identity.name,
    profile,
    confidence: 40,
    method: "fallback",
    uncertain: true,
  };
}

/**
 * Attempt to detect overlays based on address and jurisdiction.
 * Returns potential overlay flags for the property.
 */
export function detectOverlays(
  _address: string,
  jurisdictionId: string,
  _slopePercent?: number
): OverlayDetection[] {
  const profile = JURISDICTION_PROFILES[jurisdictionId];
  const overlays: OverlayDetection[] = [];

  // Coastal zone detection based on jurisdiction
  const coastalJurisdictions = [
    "coronado", "del-mar", "solana-beach", "imperial-beach",
    "carlsbad", "encinitas", "oceanside",
  ];
  if (coastalJurisdictions.includes(jurisdictionId)) {
    overlays.push({
      type: "coastal",
      name: "Coastal Zone",
      detected: true,
      confidence: 60,
      notes: profile?.specialConditions.coastalZoneNotes || "Property may be in the Coastal Zone.",
    });
  }

  // Slope detection
  if (_slopePercent !== undefined && _slopePercent > 15) {
    overlays.push({
      type: "hillside",
      name: "Hillside/Slope Area",
      detected: true,
      confidence: 70,
      notes: "Steep slope detected. Additional grading and foundation requirements may apply.",
    });
  }

  return overlays;
}

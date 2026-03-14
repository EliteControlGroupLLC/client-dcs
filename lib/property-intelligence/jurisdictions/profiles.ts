// Jurisdiction Profiles — All San Diego County jurisdictions
// Source: Official city planning departments, municipal codes, CA HCD guidance
// Each profile contains structured ADU/JADU/SB9 rules

import type { JurisdictionProfile } from "./types";

const COMMON_CLIENT_DISCLAIMER =
  "Recommendations are based on parcel data, mapped jurisdiction standards, and publicly available regulations. Final feasibility depends on site conditions, utilities, easements, overlays, and formal city review.";

const COMMON_FINANCIAL_DISCLAIMER =
  "Cost, financing, income, and ROI results are planning estimates only and are not loan offers, appraisals, or guaranteed investment returns.";

const COMMON_INTERNAL_DISCLAIMER =
  "This is a pre-feasibility and opportunity engine, not a permit approval determination.";

function makeProfile(overrides: Partial<JurisdictionProfile> & { identity: JurisdictionProfile["identity"] }): JurisdictionProfile {
  const defaults: Omit<JurisdictionProfile, "identity"> = {
    eligibility: {
      allowsDetachedAdu: true,
      allowsAttachedAdu: true,
      allowsJadu: true,
      allowsConversionAdu: true,
      singleFamilyRulesSummary: "One ADU and one JADU permitted on single-family lots per state law.",
      multifamilyRulesSummary: "Detached ADUs allowed; conversion ADUs may be permitted in existing non-habitable space.",
      ownerOccupancyNotes: "No owner-occupancy requirement for ADUs per state law (through 2025 and extended). JADUs may require owner occupancy.",
      rentalTermNotes: "ADUs may not be rented for less than 30 days per state law.",
      saleSeparabilityNotes: "ADUs generally may not be sold separately from the primary residence unless local ordinance allows under specific conditions.",
    },
    sizeRules: {
      detachedAduMaxSqft: 1200,
      attachedAduMaxSqft: 1200,
      jaduMaxSqft: 500,
      detachedAduMinSqft: 150,
      attachedAduMinSqft: 150,
      conversionAduSizeNotes: "Garage conversions follow the footprint of the existing structure.",
      multifamilyDetachedAduRule: "Up to 2 detached ADUs may be permitted on multifamily lots.",
      multifamilyConversionAduRule: "Conversion of existing non-habitable space to ADUs is generally permitted.",
      bonusProgramNotes: "Check local bonus ADU programs for additional allowances.",
    },
    setbacks: {
      sideSetbackFt: 4,
      rearSetbackFt: 4,
      frontSetbackRule: "Must comply with underlying zone front setback.",
      streetSideSetbackRule: "Must comply with underlying zone street-side setback.",
      convertedStructureSetbackRule: "No additional setback required for conversion of existing legal structure.",
      attachedAduSetbackNotes: "Attached ADUs follow primary structure setback rules.",
      detachedAduSetbackNotes: "4 ft side and rear setbacks for detached ADUs per state law.",
      encroachmentNotes: "Eaves and architectural features may encroach up to 2 ft into setbacks.",
      cornerLotNotes: "Corner lots must comply with street-side setback on the secondary frontage.",
    },
    height: {
      maxHeightFt: 16,
      detachedAduHeightRule: "16 ft for detached ADUs; up to 18 ft if within 1/2 mile of transit.",
      attachedAduHeightRule: "Must not exceed height of primary residence.",
      twoStoryAllowed: false,
      secondStoryNotes: "Two-story detached ADUs may be allowed in some jurisdictions with additional height allowance.",
      roofDeckNotes: "Roof decks generally not permitted on ADUs.",
      stairProjectionNotes: "Exterior stairs may project into setback area in some cases.",
    },
    separation: {
      minDistanceFromPrimaryHomeFt: 6,
      minDistanceBetweenStructuresNotes: "Minimum 6 ft separation between structures per fire code.",
      rearYardPlacementNotes: "Rear yard is the most common placement for detached ADUs.",
      frontYardFeasibilityNotes: "Front-yard ADUs are generally restricted but may be possible on large lots.",
      garageConversionNotes: "Existing garages may be converted to ADUs. Replacement parking generally not required within 1/2 mile of transit.",
      accessoryStructureConversionNotes: "Other accessory structures may be converted if they meet building code.",
    },
    parking: {
      parkingRequired: false,
      parkingSpacesRequired: 0,
      parkingExemptions: "No parking required within 1/2 mile of public transit, in historic districts, in architecturally significant areas, or when part of an existing structure.",
      replacementParkingRequired: false,
      tandemParkingAllowed: true,
      accessNotes: "ADU must have independent exterior access.",
    },
    infrastructure: {
      sprinklerNotes: "Fire sprinklers required if primary residence has sprinklers.",
      utilityConnectionNotes: "Separate utility connections may be required for detached ADUs.",
      sewerWaterNotes: "Sewer/water connection fees may apply. Some jurisdictions waive fees for ADUs under certain conditions.",
      electricalNotes: "Separate electrical panel may be required.",
      drainageNotes: "Must comply with local stormwater management requirements.",
      easementRedFlags: "Check for utility easements that may restrict building placement.",
    },
    process: {
      permitNotes: "ADU permits are ministerial (non-discretionary) per state law.",
      reviewTimelineNotes: "60-day review period required by state law for ADU applications.",
      standardPlanNotes: "Some jurisdictions offer pre-approved standard ADU plans.",
      submittalNotes: "Typical submittal: site plan, floor plans, elevations, structural calcs.",
      localProcessNotes: "Check with local planning department for specific submittal requirements.",
      discretionaryReviewNotes: "ADUs should not require discretionary review per state law.",
      coastalOrDesignReviewNotes: "Coastal zone properties may require additional CDP review.",
      schoolFeeNotes: "School impact fees may apply for ADUs over 500 sq ft.",
      impactFeeNotes: "Impact fees for ADUs under 750 sq ft are waived per state law.",
    },
    specialConditions: {
      coastalZoneNotes: "Properties in the Coastal Zone may require a Coastal Development Permit.",
      hillsideNotes: "Hillside properties may have additional grading and foundation requirements.",
      historicReviewNotes: "Properties in historic districts may require additional design review.",
      lotCoverageNotes: "ADU lot coverage limits may not apply if the ADU is 800 sq ft or less.",
      farNotes: "FAR limits may not apply to ADUs per state law.",
      openSpaceNotes: "Check local open space requirements.",
      knownLocalExceptions: "",
      manualReviewTriggers: [
        "Coastal zone property",
        "Steep slope (>15%)",
        "Historic district",
        "Irregular parcel shape",
        "Uncertain jurisdiction boundary",
        "Easement conflicts",
      ],
    },
    sb9: {
      sb9ApplicabilityGeneral: "SB 9 allows up to 4 units on single-family lots in qualifying situations.",
      sb9LotSplitPossibleFlag: true,
      sb9DuplexPossibleFlag: true,
      sb9MaxPrimaryUnitsGeneral: 4,
      sb9GeneralConstraints: "Property must be in a single-family residential zone. Not applicable in historic districts, flood zones, or high-fire severity zones.",
      sb9OwnerOccupancyNotes: "Owner must sign affidavit of intent to occupy one unit for at least 3 years after lot split.",
      sb9LotSplitNotes: "Lot split creates two parcels; each may have a duplex. Minimum parcel size 1,200 sq ft.",
      sb9CombinationStrategyNotes: "SB 9 units combined with ADU/JADU provisions can maximize housing yield on a single parcel.",
      propertyMaximizationNotes: "Review SB 9 + ADU combination strategies for maximum property value.",
    },
    confidence: {
      confidenceDefault: 70,
      confidenceExplanation: "Default confidence based on publicly available jurisdiction rules and parcel data.",
      blockedRecommendationConditions: [
        "Property not in a residential zone",
        "Lot size below minimum for detached ADU",
        "Multiple unresolved overlay conflicts",
      ],
      requiresManualReviewIf: [
        "Coastal zone detected",
        "Steep slope detected",
        "Historic district detected",
        "Corner lot with complex setbacks",
        "Jurisdiction boundary uncertainty",
      ],
      clientDisclaimerShort: COMMON_CLIENT_DISCLAIMER,
      internalDisclaimerLong: COMMON_INTERNAL_DISCLAIMER,
    },
  };

  return {
    identity: overrides.identity,
    eligibility: { ...defaults.eligibility, ...overrides.eligibility },
    sizeRules: { ...defaults.sizeRules, ...overrides.sizeRules },
    setbacks: { ...defaults.setbacks, ...overrides.setbacks },
    height: { ...defaults.height, ...overrides.height },
    separation: { ...defaults.separation, ...overrides.separation },
    parking: { ...defaults.parking, ...overrides.parking },
    infrastructure: { ...defaults.infrastructure, ...overrides.infrastructure },
    process: { ...defaults.process, ...overrides.process },
    specialConditions: { ...defaults.specialConditions, ...overrides.specialConditions },
    sb9: { ...defaults.sb9, ...overrides.sb9 },
    confidence: { ...defaults.confidence, ...overrides.confidence },
  };
}

// ─── CITY OF SAN DIEGO ───
const sanDiegoCity = makeProfile({
  identity: {
    id: "san-diego-city",
    slug: "san-diego",
    name: "City of San Diego",
    type: "city",
    county: "San Diego",
    state: "CA",
    active: true,
    rulesVersion: "2024-01",
    lastVerifiedDate: "2024-12-01",
    sourceUrls: [
      "https://www.sandiego.gov/planning/work/housing/toolkit/accessory-dwelling-units",
    ],
    notesInternal: "San Diego has a bonus ADU program for properties in certain planning areas.",
  },
  setbacks: {
    sideSetbackFt: 4,
    rearSetbackFt: 4,
    frontSetbackRule: "Must comply with underlying zone front setback; no front-yard ADUs.",
    streetSideSetbackRule: "Street-side setback per underlying zone.",
    convertedStructureSetbackRule: "No additional setback for existing legal structures.",
    attachedAduSetbackNotes: "Follows primary structure setback rules.",
    detachedAduSetbackNotes: "4 ft side and rear setbacks. State law minimum applies.",
    encroachmentNotes: "Eave projections up to 2 ft allowed.",
    cornerLotNotes: "Street-side setback applies on secondary frontage.",
  },
  height: {
    maxHeightFt: 16,
    detachedAduHeightRule: "16 ft standard; 18 ft within 1/2 mile of major transit stop.",
    attachedAduHeightRule: "May not exceed primary residence height.",
    twoStoryAllowed: true,
    secondStoryNotes: "Two-story ADUs allowed with 18 ft height near transit. Privacy windows may be required.",
    roofDeckNotes: "Generally not allowed on ADUs.",
    stairProjectionNotes: "Exterior stairs may encroach into setbacks.",
  },
  sizeRules: {
    detachedAduMaxSqft: 1200,
    attachedAduMaxSqft: 1200,
    jaduMaxSqft: 500,
    detachedAduMinSqft: 150,
    attachedAduMinSqft: 150,
    conversionAduSizeNotes: "Garage conversions follow existing footprint.",
    multifamilyDetachedAduRule: "Up to 2 detached ADUs on multifamily lots.",
    multifamilyConversionAduRule: "Up to 25% of existing units may be converted.",
    bonusProgramNotes: "Bonus ADU program allows additional ADUs in Community Plan areas with affordability deed restrictions.",
  },
});

// ─── COUNTY OF SAN DIEGO (UNINCORPORATED) ───
const sanDiegoCounty = makeProfile({
  identity: {
    id: "san-diego-county",
    slug: "san-diego-county",
    name: "County of San Diego (Unincorporated)",
    type: "county",
    county: "San Diego",
    state: "CA",
    active: true,
    rulesVersion: "2024-01",
    lastVerifiedDate: "2024-12-01",
    sourceUrls: [
      "https://www.sandiegocounty.gov/pds/zoning/formhtml/ADU.html",
    ],
  },
  setbacks: {
    sideSetbackFt: 4,
    rearSetbackFt: 4,
    frontSetbackRule: "Per underlying zone.",
    streetSideSetbackRule: "Per underlying zone.",
    convertedStructureSetbackRule: "No additional setback for existing legal structures.",
    attachedAduSetbackNotes: "Per primary structure rules.",
    detachedAduSetbackNotes: "4 ft side and rear.",
    encroachmentNotes: "Standard eave projection allowances.",
    cornerLotNotes: "Per underlying zone.",
  },
  height: {
    maxHeightFt: 16,
    detachedAduHeightRule: "16 ft for detached ADUs.",
    attachedAduHeightRule: "Per primary structure height limit.",
    twoStoryAllowed: false,
    secondStoryNotes: "Two-story generally not permitted for detached ADUs in unincorporated areas unless near transit.",
    roofDeckNotes: "Not applicable.",
    stairProjectionNotes: "Standard rules apply.",
  },
});

// ─── CHULA VISTA ───
const chulaVista = makeProfile({
  identity: {
    id: "chula-vista",
    slug: "chula-vista",
    name: "City of Chula Vista",
    type: "city",
    county: "San Diego",
    state: "CA",
    active: true,
    rulesVersion: "2024-01",
    lastVerifiedDate: "2024-12-01",
    sourceUrls: [
      "https://www.chulavistaca.gov/departments/development-services/planning/accessory-dwelling-units",
    ],
  },
  height: {
    maxHeightFt: 16,
    detachedAduHeightRule: "16 ft for detached ADUs.",
    attachedAduHeightRule: "Must not exceed primary residence height.",
    twoStoryAllowed: false,
    secondStoryNotes: "Two-story ADUs may be allowed near transit stops.",
    roofDeckNotes: "Not typically allowed.",
    stairProjectionNotes: "Standard rules apply.",
  },
});

// ─── CARLSBAD ───
const carlsbad = makeProfile({
  identity: {
    id: "carlsbad",
    slug: "carlsbad",
    name: "City of Carlsbad",
    type: "city",
    county: "San Diego",
    state: "CA",
    active: true,
    rulesVersion: "2024-01",
    lastVerifiedDate: "2024-12-01",
    sourceUrls: [
      "https://www.carlsbadca.gov/departments/community-development/planning/accessory-dwelling-units",
    ],
  },
  specialConditions: {
    coastalZoneNotes: "Significant portions of Carlsbad are in the Coastal Zone. CDP may be required.",
    hillsideNotes: "Some areas have hillside development standards.",
    historicReviewNotes: "Village area has design review requirements.",
    lotCoverageNotes: "Per underlying zone.",
    farNotes: "ADUs under 800 sq ft exempt from FAR.",
    openSpaceNotes: "Per underlying zone.",
    knownLocalExceptions: "Carlsbad has local Coastal Zone ADU provisions.",
    manualReviewTriggers: [
      "Coastal zone property",
      "Village area design review",
      "Steep slope",
      "Historic overlay",
    ],
  },
});

// ─── CORONADO ───
const coronado = makeProfile({
  identity: {
    id: "coronado",
    slug: "coronado",
    name: "City of Coronado",
    type: "city",
    county: "San Diego",
    state: "CA",
    active: true,
    rulesVersion: "2024-01",
    lastVerifiedDate: "2024-12-01",
    sourceUrls: [],
    notesInternal: "Coronado has historically been restrictive on ADUs. State law preempts many local restrictions.",
  },
  specialConditions: {
    coastalZoneNotes: "Most of Coronado is in the Coastal Zone.",
    hillsideNotes: "Minimal hillside concerns.",
    historicReviewNotes: "Historic district properties may need additional review.",
    lotCoverageNotes: "Per underlying zone.",
    farNotes: "ADUs under 800 sq ft exempt from FAR per state law.",
    openSpaceNotes: "Per underlying zone.",
    knownLocalExceptions: "Coronado has specific local ADU provisions that may differ from other cities.",
    manualReviewTriggers: [
      "Coastal zone property",
      "Historic district",
      "Small lot",
    ],
  },
});

// ─── DEL MAR ───
const delMar = makeProfile({
  identity: {
    id: "del-mar",
    slug: "del-mar",
    name: "City of Del Mar",
    type: "city",
    county: "San Diego",
    state: "CA",
    active: true,
    rulesVersion: "2024-01",
    lastVerifiedDate: "2024-12-01",
    sourceUrls: [],
  },
  specialConditions: {
    coastalZoneNotes: "Most of Del Mar is in the Coastal Zone. CDP likely required.",
    hillsideNotes: "Some hillside lots along bluffs.",
    historicReviewNotes: "Design review may apply.",
    lotCoverageNotes: "Per underlying zone.",
    farNotes: "ADUs exempt per state law.",
    openSpaceNotes: "Per underlying zone.",
    knownLocalExceptions: "Small city with limited ADU precedent.",
    manualReviewTriggers: [
      "Coastal zone property",
      "Bluff-top lot",
      "Design review area",
    ],
  },
});

// ─── EL CAJON ───
const elCajon = makeProfile({
  identity: {
    id: "el-cajon",
    slug: "el-cajon",
    name: "City of El Cajon",
    type: "city",
    county: "San Diego",
    state: "CA",
    active: true,
    rulesVersion: "2024-01",
    lastVerifiedDate: "2024-12-01",
    sourceUrls: [],
  },
});

// ─── ENCINITAS ───
const encinitas = makeProfile({
  identity: {
    id: "encinitas",
    slug: "encinitas",
    name: "City of Encinitas",
    type: "city",
    county: "San Diego",
    state: "CA",
    active: true,
    rulesVersion: "2024-01",
    lastVerifiedDate: "2024-12-01",
    sourceUrls: [
      "https://www.encinitasca.gov/government/departments/development-services/housing/accessory-dwelling-units",
    ],
  },
  specialConditions: {
    coastalZoneNotes: "Western portions of Encinitas are in the Coastal Zone.",
    hillsideNotes: "Some hillside areas exist.",
    historicReviewNotes: "Historic Encinitas area may have design considerations.",
    lotCoverageNotes: "Per underlying zone.",
    farNotes: "ADUs exempt per state law.",
    openSpaceNotes: "Per underlying zone.",
    knownLocalExceptions: "",
    manualReviewTriggers: [
      "Coastal zone property",
      "Hillside lot",
    ],
  },
});

// ─── ESCONDIDO ───
const escondido = makeProfile({
  identity: {
    id: "escondido",
    slug: "escondido",
    name: "City of Escondido",
    type: "city",
    county: "San Diego",
    state: "CA",
    active: true,
    rulesVersion: "2024-01",
    lastVerifiedDate: "2024-12-01",
    sourceUrls: [],
  },
});

// ─── IMPERIAL BEACH ───
const imperialBeach = makeProfile({
  identity: {
    id: "imperial-beach",
    slug: "imperial-beach",
    name: "City of Imperial Beach",
    type: "city",
    county: "San Diego",
    state: "CA",
    active: true,
    rulesVersion: "2024-01",
    lastVerifiedDate: "2024-12-01",
    sourceUrls: [],
  },
  specialConditions: {
    coastalZoneNotes: "Significant portions of Imperial Beach are in the Coastal Zone.",
    hillsideNotes: "Minimal hillside concerns.",
    historicReviewNotes: "Limited historic review areas.",
    lotCoverageNotes: "Per underlying zone.",
    farNotes: "ADUs exempt per state law.",
    openSpaceNotes: "Per underlying zone.",
    knownLocalExceptions: "",
    manualReviewTriggers: [
      "Coastal zone property",
      "Flood zone property",
    ],
  },
});

// ─── LA MESA ───
const laMesa = makeProfile({
  identity: {
    id: "la-mesa",
    slug: "la-mesa",
    name: "City of La Mesa",
    type: "city",
    county: "San Diego",
    state: "CA",
    active: true,
    rulesVersion: "2024-01",
    lastVerifiedDate: "2024-12-01",
    sourceUrls: [],
  },
});

// ─── LEMON GROVE ───
const lemonGrove = makeProfile({
  identity: {
    id: "lemon-grove",
    slug: "lemon-grove",
    name: "City of Lemon Grove",
    type: "city",
    county: "San Diego",
    state: "CA",
    active: true,
    rulesVersion: "2024-01",
    lastVerifiedDate: "2024-12-01",
    sourceUrls: [],
  },
});

// ─── NATIONAL CITY ───
const nationalCity = makeProfile({
  identity: {
    id: "national-city",
    slug: "national-city",
    name: "City of National City",
    type: "city",
    county: "San Diego",
    state: "CA",
    active: true,
    rulesVersion: "2024-01",
    lastVerifiedDate: "2024-12-01",
    sourceUrls: [],
  },
});

// ─── OCEANSIDE ───
const oceanside = makeProfile({
  identity: {
    id: "oceanside",
    slug: "oceanside",
    name: "City of Oceanside",
    type: "city",
    county: "San Diego",
    state: "CA",
    active: true,
    rulesVersion: "2024-01",
    lastVerifiedDate: "2024-12-01",
    sourceUrls: [
      "https://www.ci.oceanside.ca.us/gov/dev/planning/adu.asp",
    ],
  },
  specialConditions: {
    coastalZoneNotes: "Western portions of Oceanside are in the Coastal Zone.",
    hillsideNotes: "Some hillside areas in eastern Oceanside.",
    historicReviewNotes: "Downtown area has heritage zone considerations.",
    lotCoverageNotes: "Per underlying zone.",
    farNotes: "ADUs exempt per state law.",
    openSpaceNotes: "Per underlying zone.",
    knownLocalExceptions: "",
    manualReviewTriggers: [
      "Coastal zone property",
      "Heritage zone",
    ],
  },
});

// ─── POWAY ───
const poway = makeProfile({
  identity: {
    id: "poway",
    slug: "poway",
    name: "City of Poway",
    type: "city",
    county: "San Diego",
    state: "CA",
    active: true,
    rulesVersion: "2024-01",
    lastVerifiedDate: "2024-12-01",
    sourceUrls: [],
  },
});

// ─── SAN MARCOS ───
const sanMarcos = makeProfile({
  identity: {
    id: "san-marcos",
    slug: "san-marcos",
    name: "City of San Marcos",
    type: "city",
    county: "San Diego",
    state: "CA",
    active: true,
    rulesVersion: "2024-01",
    lastVerifiedDate: "2024-12-01",
    sourceUrls: [],
  },
});

// ─── SANTEE ───
const santee = makeProfile({
  identity: {
    id: "santee",
    slug: "santee",
    name: "City of Santee",
    type: "city",
    county: "San Diego",
    state: "CA",
    active: true,
    rulesVersion: "2024-01",
    lastVerifiedDate: "2024-12-01",
    sourceUrls: [],
  },
});

// ─── SOLANA BEACH ───
const solanaBeach = makeProfile({
  identity: {
    id: "solana-beach",
    slug: "solana-beach",
    name: "City of Solana Beach",
    type: "city",
    county: "San Diego",
    state: "CA",
    active: true,
    rulesVersion: "2024-01",
    lastVerifiedDate: "2024-12-01",
    sourceUrls: [],
  },
  specialConditions: {
    coastalZoneNotes: "Most of Solana Beach is in the Coastal Zone.",
    hillsideNotes: "Bluff-top lots have additional restrictions.",
    historicReviewNotes: "Limited historic areas.",
    lotCoverageNotes: "Per underlying zone.",
    farNotes: "ADUs exempt per state law.",
    openSpaceNotes: "Per underlying zone.",
    knownLocalExceptions: "",
    manualReviewTriggers: [
      "Coastal zone property",
      "Bluff-top lot",
    ],
  },
});

// ─── VISTA ───
const vista = makeProfile({
  identity: {
    id: "vista",
    slug: "vista",
    name: "City of Vista",
    type: "city",
    county: "San Diego",
    state: "CA",
    active: true,
    rulesVersion: "2024-01",
    lastVerifiedDate: "2024-12-01",
    sourceUrls: [],
  },
});

// ─── REGISTRY ───
export const JURISDICTION_PROFILES: Record<string, JurisdictionProfile> = {
  "san-diego-city": sanDiegoCity,
  "san-diego-county": sanDiegoCounty,
  "chula-vista": chulaVista,
  "carlsbad": carlsbad,
  "coronado": coronado,
  "del-mar": delMar,
  "el-cajon": elCajon,
  "encinitas": encinitas,
  "escondido": escondido,
  "imperial-beach": imperialBeach,
  "la-mesa": laMesa,
  "lemon-grove": lemonGrove,
  "national-city": nationalCity,
  "oceanside": oceanside,
  "poway": poway,
  "san-marcos": sanMarcos,
  "santee": santee,
  "solana-beach": solanaBeach,
  "vista": vista,
};

export const JURISDICTION_LIST = Object.values(JURISDICTION_PROFILES).map((p) => ({
  id: p.identity.id,
  name: p.identity.name,
  slug: p.identity.slug,
  type: p.identity.type,
}));

export { COMMON_CLIENT_DISCLAIMER, COMMON_FINANCIAL_DISCLAIMER, COMMON_INTERNAL_DISCLAIMER };

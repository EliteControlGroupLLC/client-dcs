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

/** Each rule section may be partially overridden; missing fields come from the State-law defaults. */
type ProfileOverrides = { identity: JurisdictionProfile["identity"] } & {
  [K in Exclude<keyof JurisdictionProfile, "identity">]?: Partial<JurisdictionProfile[K]>;
};

/**
 * Building-code basis for the default ADU ↔ home separation. State ADU law
 * sets no separation; CA Residential Code R302.1 / Table R302.1(1) measures
 * fire separation distance to an imaginary line between two buildings on the
 * lot: walls < 5 ft from it need a 1-hour rating and openings are not allowed
 * < 3 ft (25% max at 3–5 ft). 6 ft total (3 ft each side) is therefore the
 * practical minimum for a unit with windows facing the home; ≥ 10 ft allows
 * unrated walls with unlimited openings.
 */
const CRC_SEPARATION_NOTE =
  "6 ft default — State ADU law sets no separation; CA Residential Code R302.1 / Table R302.1(1) requires 1-hr walls within 5 ft of the line between buildings and bars openings within 3 ft, so 6 ft (3 ft each side) is the practical minimum for facing windows (10 ft+ allows unrated walls).";

function makeProfile(overrides: ProfileOverrides): JurisdictionProfile {
  const defaults: Omit<JurisdictionProfile, "identity"> = {
    eligibility: {
      allowsDetachedAdu: true,
      allowsAttachedAdu: true,
      allowsJadu: true,
      allowsConversionAdu: true,
      singleFamilyRulesSummary: "One ADU and one JADU permitted on single-family lots per state law.",
      multifamilyRulesSummary: "Detached ADUs allowed; conversion ADUs may be permitted in existing non-habitable space.",
      ownerOccupancyNotes: "Local agencies may not impose owner-occupancy on ADUs (Gov. Code § 66315, made permanent by AB 976). JADUs require the owner to live in either the JADU or the primary dwelling (Gov. Code § 66333).",
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
      frontSetbackFt: 15,
      setbackCitation:
        "Side/rear 4 ft: Gov. Code § 66314(d)(7) (max a city may require). Front 15 ft: typical San Diego County base-zone front setback, used when the parcel's zone isn't in our verified zone table — ADU front setbacks follow the base zone.",
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
      detachedAduHeightRule: "State minimum: 16 ft detached; 18 ft within 1/2 mile of a major transit stop / high-quality transit corridor (+2 ft for roof pitch); 18 ft on multistory multifamily lots (Gov. Code § 66321(b)(4)).",
      attachedAduHeightRule: "State minimum: 25 ft or the zone height limit, whichever is lower (Gov. Code § 66321(b)(4)(D)).",
      twoStoryAllowed: false,
      secondStoryNotes: "Two-story detached ADUs may be allowed in some jurisdictions with additional height allowance.",
      roofDeckNotes: "Roof decks generally not permitted on ADUs.",
      stairProjectionNotes: "Exterior stairs may project into setback area in some cases.",
    },
    separation: {
      minDistanceFromPrimaryHomeFt: 6,
      separationCitation: CRC_SEPARATION_NOTE,
      minDistanceBetweenStructuresNotes: "Minimum 6 ft separation between structures per fire code.",
      rearYardPlacementNotes: "Rear yard is the most common placement for detached ADUs.",
      frontYardFeasibilityNotes: "Front-yard ADUs are generally restricted but may be possible on large lots.",
      garageConversionNotes: "Existing garages may be converted to ADUs. Replacement parking generally not required within 1/2 mile of transit.",
      accessoryStructureConversionNotes: "Other accessory structures may be converted if they meet building code.",
    },
    parking: {
      parkingRequired: false,
      parkingSpacesRequired: 0,
      parkingExemptions: "State law caps ADU parking at 1 space per ADU or bedroom, whichever is less (Gov. Code § 66314(d)(10)); none may be required within 1/2 mile of public transit, in historic districts, for conversions, or near car-share (Gov. Code § 66322).",
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
    rulesVersion: "O-21989",
    lastVerifiedDate: "2026-09-18",
    sourceUrls: [
      "https://www.sandiego.gov/development-services/news-programs/programs/companion-junior-units",
      "https://docs.sandiego.gov/municode/MuniCodeChapter14/Ch14Art01Division03.pdf",
    ],
    rulesVerified: true,
    rulesCitation: "City of San Diego — SDMC § 141.0302 (O-21989, eff. 8/22/2025)",
    notesInternal: "San Diego has a bonus ADU program for properties in certain planning areas.",
  },
  setbacks: {
    // Standard (conservative) case: 4 ft — required inside a High/Very High
    // Fire Hazard Severity Zone, and for ADUs > 16 ft tall next to residential
    // lots (SDMC § 141.0302(b)(9)(C)(ii), (b)(9)(D)).
    sideSetbackFt: 4,
    rearSetbackFt: 4,
    // Base-zone front setback; 15 ft = RS-1-6/RS-1-7 minimum (SDMC Table
    // 131-04D). Zone-specific values live in jurisdictions/zone-standards.ts.
    frontSetbackFt: 15,
    setbackCitation:
      "SDMC § 141.0302(b)(9) (7-2026 text, O-22109): front per base zone; interior side/rear 0 ft for ADUs ≤ 16 ft tall outside a High/Very High Fire Hazard Severity Zone, otherwise 4 ft. Base-zone front setbacks per SDMC Tables 131-04D/131-04G.",
    lowProfileSideRearSetbackFt: 0,
    lowProfileMaxHeightFt: 16,
    lowProfileExcludedInFireZone: true,
    lowProfileCitation:
      "SDMC § 141.0302(b)(9)(C)(i): no minimum interior side/rear setback for ADUs ≤ 16 ft tall outside a High or Very High Fire Hazard Severity Zone (Fire Code Official may require more); 4 ft inside those zones — (b)(9)(C)(ii).",
    frontSetbackRule: "Front setback per base zone (SDMC § 141.0302(b)(9)(A)); street side 4 ft or base zone, whichever is less.",
    streetSideSetbackRule: "Street-side setback per underlying zone.",
    convertedStructureSetbackRule: "No additional setback for existing legal structures.",
    attachedAduSetbackNotes: "Follows primary structure setback rules.",
    detachedAduSetbackNotes: "SDMC § 141.0302(b)(9): no interior side/rear setback for ADUs ≤ 16 ft tall outside High/Very High Fire Hazard zones; 4 ft inside those zones, and 4 ft (or the base-zone minimum, if less) for taller ADUs next to residential lots. Engine uses 0 ft for a one-story unit only when the City fire hazard map confirms the parcel is outside the zone; otherwise 4 ft.",
    encroachmentNotes: "Eave projections up to 2 ft allowed.",
    cornerLotNotes: "Street-side setback applies on secondary frontage.",
  },
  height: {
    maxHeightFt: 16,
    detachedAduHeightRule: "Overall maximum height of the base/overlay zone applies (SDMC § 141.0302(b)(8)(C)); on lots allowing single- but not multiple-dwelling development, detached ADUs may not exceed two stories ((b)(8)(A)).",
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
    conversionAduSizeNotes: "ADU within an existing/proposed single dwelling structure has no max GFA (SDMC § 141.0302(b)(7)(C)); new attached or detached ADU max 1,200 sq ft, min 150 sq ft.",
    multifamilyDetachedAduRule: "On a lot with an existing multifamily dwelling, up to 8 detached ADUs but not more than the number of existing units; 2 detached ADUs with a proposed multifamily building (Gov. Code § 66323(a)(4), SB 1211; SDMC § 141.0302(b)(3)).",
    multifamilyConversionAduRule: "At least one, and up to 25% of existing units, from non-livable space in multifamily buildings (Gov. Code § 66323(a)(3)).",
    bonusProgramNotes: "ADU Bonus program narrowed by O-21989 (2025): barred in RS-1-1/2/3/4/8/9/10/11 unless in a high-opportunity area; unit caps 4/5/6 by lot size; Community Enhancement Fee applies.",
  },
  parking: {
    parkingRequired: false,
    parkingSpacesRequired: 0,
    parkingExemptions: "No ADU parking required, except 1 space per ADU in the Beach Impact Area of the Parking Impact Overlay Zone outside a transit priority area (SDMC § 141.0302(b)(10)).",
    replacementParkingRequired: false,
    tandemParkingAllowed: true,
    accessNotes: "ADU must have independent exterior access.",
  },
  separation: {
    // SDMC § 131.0450: 6 ft between detached dwellings on the same premises
    // (3 ft to a nonhabitable accessory building). Also the CRC R302.1
    // practical minimum for facing windows.
    minDistanceFromPrimaryHomeFt: 6,
    separationCitation:
      "SDMC § 131.0450: detached dwellings keep a minimum 6 ft between dwellings (3 ft to a nonhabitable accessory building); consistent with CA Residential Code R302.1 fire-separation limits.",
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
    rulesVersion: "ord10986",
    lastVerifiedDate: "2026-09-18",
    sourceUrls: [
      "https://www.sandiegocounty.gov/content/sdc/pds/longrangeplanning/ADU-ZO.html",
      "https://files.amlegal.com/pdffiles/SanDiegoCo/ord10986.pdf",
    ],
    rulesVerified: true,
    rulesCitation: "County of San Diego — Zoning Ordinance § 6156 (Ord. 10986, 2026)",
  },
  setbacks: {
    sideSetbackFt: 4,
    rearSetbackFt: 4,
    frontSetbackRule: "Per underlying zone.",
    streetSideSetbackRule: "Per underlying zone.",
    convertedStructureSetbackRule: "No additional setback for existing legal structures.",
    attachedAduSetbackNotes: "Per primary structure rules.",
    detachedAduSetbackNotes: "Minimum 4 ft side and rear (SDZO § 6156); fire-hazard areas may require more.",
    encroachmentNotes: "Standard eave projection allowances.",
    cornerLotNotes: "Per underlying zone.",
  },
  height: {
    maxHeightFt: 25,
    detachedAduHeightRule: "Detached ADU limited to 25 ft in height (SDZO § 6156, Ord. 10986).",
    attachedAduHeightRule: "Per primary structure height limit.",
    twoStoryAllowed: true,
    secondStoryNotes: "25 ft height allows a two-story detached ADU; fire-hazard zones may require larger setbacks.",
    roofDeckNotes: "Not applicable.",
    stairProjectionNotes: "Standard rules apply.",
  },
  sizeRules: {
    detachedAduMaxSqft: 1200,
    attachedAduMaxSqft: 1200,
    jaduMaxSqft: 500,
    detachedAduMinSqft: 150,
    attachedAduMinSqft: 150,
    conversionAduSizeNotes: "No setbacks required to convert an existing permitted accessory structure (SDZO § 6156).",
    multifamilyDetachedAduRule: "Multiple detached ADUs allowed on multifamily lots per State law.",
    multifamilyConversionAduRule: "Conversion of non-livable space per State law.",
    bonusProgramNotes: "Detached ADU max 1,200 sq ft regardless of primary size; attached ADU max 50% of primary up to 1,200 sq ft (850/1,000 sq ft always allowed) — SDZO § 6156 (Ord. 10986).",
  },
  parking: {
    parkingRequired: true,
    parkingSpacesRequired: 1,
    parkingExemptions: "1 space per ADU unless a State exemption applies (Gov. Code § 66322: within 1/2 mile of transit, conversions, historic district, car-share).",
    replacementParkingRequired: false,
    tandemParkingAllowed: true,
    accessNotes: "ADU must have independent exterior access.",
  },
});


// ─── CHULA VISTA ───
// Chula Vista REPEALED its local ADU (CVMC 19.58.022) and JADU (CVMC 19.58.023)
// regulations by Ordinance 3592 (2025) and now applies State ADU law directly
// (Gov. Code §§ 66310–66342). Every number below is therefore the State
// standard, cited to the Government Code section it comes from.
const CV_STATE_LAW_NOTE = "Chula Vista applies State ADU law (Gov. Code §§ 66310–66342) — local CVMC 19.58.022/19.58.023 repealed by Ord. 3592 (2025).";
const chulaVista = makeProfile({
  identity: {
    id: "chula-vista",
    slug: "chula-vista",
    name: "City of Chula Vista",
    type: "city",
    county: "San Diego",
    state: "CA",
    active: true,
    rulesVersion: "2025-ord3592-state-law",
    lastVerifiedDate: "2026-09-18",
    sourceUrls: [
      "https://www.chulavistaca.gov/departments/development-services/permit-information/city-permits/accessory-dwelling-units",
      "https://chulavista.municipal.codes/CVMC/19.58.022",
      "https://chulavista.municipal.codes/CVMC/19.58.023",
      "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=66314",
      "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=66321",
      "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=66323",
    ],
    rulesVerified: true,
    rulesCitation: "Chula Vista — State ADU law (Gov. Code §§ 66314, 66321, 66323); local CVMC 19.58.022 repealed by Ord. 3592",
    notesInternal:
      "Verified 2026-09-18: municipal.codes lists CVMC 19.58.022 and 19.58.023 as repealed by Ord. 3592 § 1 (2025). " +
      "The City ADU page and municipal.codes are behind a Cloudflare bot check, so the City page text itself was not re-read in this pass. " +
      "P-C zone ADU section CVMC 19.48.145 (most of eastern CV, e.g. Eastlake/Otay Ranch PC zones) status NOT re-verified. " +
      "Third-party summary (snapadu.com, not authoritative) reports City staff allow 1 ADU under §66314 + 1 detached ≤800 sf under §66323 + 1 JADU on single-family lots.",
  },
  sizeRules: {
    detachedAduMaxSqft: 1200, // Gov. Code § 66314(d)(5)
    attachedAduMaxSqft: 1200, // capped by 50% of primary dwelling — § 66314(d)(4); 850/1,000 sf floor — § 66321(b)(2)
    jaduMaxSqft: 500, // Gov. Code § 66313(a)
    detachedAduMinSqft: 150,
    attachedAduMinSqft: 150,
    conversionAduSizeNotes: "Conversion of existing space (incl. garage) follows the existing structure; may add up to 150 sq ft for ingress/egress (Gov. Code § 66323(a)(1)).",
    multifamilyDetachedAduRule: "Up to 2 detached ADUs on a lot with an existing multifamily dwelling (Gov. Code § 66323(a)(4)).",
    multifamilyConversionAduRule: "At least one, and up to 25% of existing units, from non-livable space in multifamily buildings (Gov. Code § 66323(a)(3)).",
    bonusProgramNotes: `${CV_STATE_LAW_NOTE} Attached ADU may not exceed 50% of the existing primary dwelling (§ 66314(d)(4)), but an 800 sq ft ADU with 4 ft setbacks and 16 ft height can never be precluded (§ 66321(b)(3), § 66323(a)(2)).`,
  },
  setbacks: {
    sideSetbackFt: 4, // Gov. Code § 66314(d)(7)
    rearSetbackFt: 4, // Gov. Code § 66314(d)(7)
    frontSetbackRule: "Underlying zone front setback, unless it would preclude an 800 sq ft ADU (Gov. Code § 66321(b)(3)).",
    streetSideSetbackRule: "Underlying zone street-side setback, subject to the same 800 sq ft protection.",
    convertedStructureSetbackRule: "No setback required for an existing structure converted (or rebuilt in the same location and dimensions) — Gov. Code § 66314(d)(7).",
    attachedAduSetbackNotes: "4 ft side and rear maximum required (Gov. Code § 66314(d)(7)).",
    detachedAduSetbackNotes: "4 ft side and rear maximum required for new construction (Gov. Code § 66314(d)(7)).",
    encroachmentNotes: "Per underlying zone / building code.",
    cornerLotNotes: "Street-side setback per underlying zone.",
  },
  height: {
    maxHeightFt: 16, // Gov. Code § 66321(b)(4)(A)
    detachedAduHeightRule: "16 ft on a single-family lot; 18 ft within 1/2 mile of a major transit stop (+2 ft for roof pitch) or on a multistory multifamily lot — Gov. Code § 66321(b)(4).",
    attachedAduHeightRule: "25 ft or the zone height limit for the primary dwelling, whichever is lower; not required to exceed 2 stories — Gov. Code § 66321(b)(4)(D).",
    twoStoryAllowed: false,
    secondStoryNotes: "Two-story is practical for ATTACHED ADUs (up to 25 ft). Detached ADUs are guaranteed only 16–18 ft.",
    roofDeckNotes: "Not addressed by State law; verify with City.",
    stairProjectionNotes: "Per building code.",
  },
  parking: {
    parkingRequired: false,
    parkingSpacesRequired: 0,
    parkingExemptions: "State law caps ADU parking at 1 space per ADU or per bedroom, whichever is less (Gov. Code § 66314(d)(10)); none may be required within ½ mile walking distance of public transit, in a historic district, for conversions, JADUs, or where car-share is within one block (Gov. Code § 66322). Replacement parking for a converted garage is not required.",
    replacementParkingRequired: false,
    tandemParkingAllowed: true,
    accessNotes: "ADU must have independent exterior access.",
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
    lastVerifiedDate: "2026-09-18",
    sourceUrls: [
      "https://www.carlsbadca.gov/departments/community-development/planning/accessory-dwelling-units",
      "https://documents.coastal.ca.gov/reports/2022/2/Th13b/th13b-2-2022-exhibits.pdf",
    ],
    rulesVerified: false,
    notesInternal: "UNVERIFIED: CMC 21.10.030 text read only as of 2022 (1,200 sf detached; attached 50%/1,200; 16 ft 1-story; 1 space). A Feb 2026 amendment (reported by news only) may change stories/multifamily counts — verify before marking rulesVerified.",
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
    lastVerifiedDate: "2026-09-18",
    sourceUrls: [
      "https://coronado.municipal.codes/CMC/86.56.105",
      "https://www.hcd.ca.gov/sites/default/files/docs/policy-and-research/ordinance-review-letters/coronado-adu-findings-121025.pdf",
    ],
    rulesVerified: true,
    rulesCitation: "City of Coronado — CMC § 86.56.105 (Ord. 2024-02)",
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
  sizeRules: {
    detachedAduMaxSqft: 1000,
    attachedAduMaxSqft: 1000,
    jaduMaxSqft: 500,
    detachedAduMinSqft: 150,
    attachedAduMinSqft: 150,
    conversionAduSizeNotes: "Conversions of existing space follow the existing structure (State law).",
    multifamilyDetachedAduRule: "Per State law (Gov. Code § 66323).",
    multifamilyConversionAduRule: "Per State law (Gov. Code § 66323).",
    bonusProgramNotes: "Max 850 sq ft (studio/1BR) or 1,000 sq ft (2BR+); only 1 ADU OR 1 JADU per single-family lot; 6-month minimum rental. HCD found the ordinance noncompliant 12/10/2025 — State law may override.",
  },
  setbacks: {
    sideSetbackFt: 4,
    rearSetbackFt: 4,
    frontSetbackRule: "Per underlying zone (cannot preclude an 800 sq ft ADU — Gov. Code § 66321(b)(3)).",
    streetSideSetbackRule: "Per underlying zone.",
    convertedStructureSetbackRule: "No setback for conversion of an existing legal structure.",
    attachedAduSetbackNotes: "Per local code / State law.",
    detachedAduSetbackNotes: "4 ft for the State-guaranteed 800 sq ft ADU; otherwise zone standards.",
    encroachmentNotes: "Per underlying zone.",
    cornerLotNotes: "Street-side setback per underlying zone.",
  },
  height: {
    maxHeightFt: 16,
    detachedAduHeightRule: "16 ft (CMC § 86.56.105).",
    attachedAduHeightRule: "Attached ADU: 25 ft or zone limit, whichever is lower (Gov. Code § 66321(b)(4)(D)).",
    twoStoryAllowed: false,
    secondStoryNotes: "See detached height rule.",
    roofDeckNotes: "Verify with City.",
    stairProjectionNotes: "Per building code.",
  },
  parking: {
    parkingRequired: true,
    parkingSpacesRequired: 1,
    parkingExemptions: "Max 1 space; 0 if deed-restricted affordable; garage-conversion replacement parking required (CMC § 86.56.105).",
    replacementParkingRequired: false,
    tandemParkingAllowed: true,
    accessNotes: "ADU must have independent exterior access.",
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
    lastVerifiedDate: "2026-09-18",
    sourceUrls: [
      "https://www.delmar.ca.us/642/Accessory-Dwelling-Units-ADUs",
      "https://www.delmar.ca.us/DocumentCenter/View/9896/June-2025-Chapter-3091-ADU-Regulations",
    ],
    rulesVerified: true,
    rulesCitation: "City of Del Mar — DMMC Ch. 30.91 (eff. 6/12/2025)",
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
  sizeRules: {
    detachedAduMaxSqft: 1000,
    attachedAduMaxSqft: 1000,
    jaduMaxSqft: 500,
    detachedAduMinSqft: 150,
    attachedAduMinSqft: 150,
    conversionAduSizeNotes: "Conversions of existing space follow the existing structure (State law).",
    multifamilyDetachedAduRule: "Per State law (Gov. Code § 66323).",
    multifamilyConversionAduRule: "Per State law (Gov. Code § 66323).",
    bonusProgramNotes: "Detached max 850 sq ft (1BR) or 1,000 sq ft (2+BR), 800 sq ft always allowed; attached max 50% of primary habitable area. Only 1 detached ADU per lot. Incentive program (DMMC § 30.91.070): deed-restricted low-income ADU earns bonus 500 sq ft JADU + 500 sq ft floor area.",
  },
  setbacks: {
    sideSetbackFt: 4,
    rearSetbackFt: 4,
    frontSetbackRule: "Per underlying zone (cannot preclude an 800 sq ft ADU — Gov. Code § 66321(b)(3)).",
    streetSideSetbackRule: "Per underlying zone.",
    convertedStructureSetbackRule: "No setback for conversion of an existing legal structure.",
    attachedAduSetbackNotes: "Per local code / State law.",
    detachedAduSetbackNotes: "4 ft side and rear (DMMC § 30.91.040).",
    encroachmentNotes: "Per underlying zone.",
    cornerLotNotes: "Street-side setback per underlying zone.",
  },
  height: {
    maxHeightFt: 16,
    detachedAduHeightRule: "16 ft; 18 ft near transit; 14 ft in Bluff/Slope/Canyon overlay (DMMC § 30.91.040).",
    attachedAduHeightRule: "Attached ADU: 25 ft or zone limit, whichever is lower (Gov. Code § 66321(b)(4)(D)).",
    twoStoryAllowed: false,
    secondStoryNotes: "See detached height rule.",
    roofDeckNotes: "Verify with City.",
    stairProjectionNotes: "Per building code.",
  },
  parking: {
    parkingRequired: false,
    parkingSpacesRequired: 0,
    parkingExemptions: "None generally; 1 space on shoreline, high-fire-risk hillside and narrow-street lots (DMMC § 30.91.040).",
    replacementParkingRequired: false,
    tandemParkingAllowed: true,
    accessNotes: "ADU must have independent exterior access.",
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
    lastVerifiedDate: "2026-09-18",
    sourceUrls: [
      "https://ecode360.com/EL4925/laws/LF2084552.pdf",
      "https://www.hcd.ca.gov/sites/default/files/docs/policy-and-research/ordinance-review-letters/el-cajon-adu-findings-020625.pdf",
    ],
    rulesVerified: true,
    rulesCitation: "City of El Cajon — ECMC § 17.140.180 (Ord. 5142, 2024)",
  },
  sizeRules: {
    detachedAduMaxSqft: 1200,
    attachedAduMaxSqft: 1200,
    jaduMaxSqft: 500,
    detachedAduMinSqft: 150,
    attachedAduMinSqft: 150,
    conversionAduSizeNotes: "Conversions of existing space follow the existing structure (State law).",
    multifamilyDetachedAduRule: "Per State law (Gov. Code § 66323).",
    multifamilyConversionAduRule: "Per State law (Gov. Code § 66323).",
    bonusProgramNotes: "Max 1,200 sq ft but not larger than the primary dwelling (800 sq ft always allowed). HCD found Ord. 5142 noncompliant 2/6/2025 — code may have been amended since.",
  },
  setbacks: {
    sideSetbackFt: 4,
    rearSetbackFt: 4,
    frontSetbackRule: "Per underlying zone (cannot preclude an 800 sq ft ADU — Gov. Code § 66321(b)(3)).",
    streetSideSetbackRule: "Per underlying zone.",
    convertedStructureSetbackRule: "No setback for conversion of an existing legal structure.",
    attachedAduSetbackNotes: "Per local code / State law.",
    detachedAduSetbackNotes: "Tiered: 3 ft minimum setback (12 ft height), 4 ft (16 ft), 5 ft (20 ft) — ECMC § 17.140.180.",
    encroachmentNotes: "Per underlying zone.",
    cornerLotNotes: "Street-side setback per underlying zone.",
  },
  height: {
    maxHeightFt: 16,
    detachedAduHeightRule: "Tiered by setback: 12 ft at 3 ft, 16 ft at 4 ft, 20 ft at 5 ft; 18 ft (+2) near transit (ECMC § 17.140.180).",
    attachedAduHeightRule: "Attached ADU: 25 ft or zone limit, whichever is lower (Gov. Code § 66321(b)(4)(D)).",
    twoStoryAllowed: false,
    secondStoryNotes: "See detached height rule.",
    roofDeckNotes: "Verify with City.",
    stairProjectionNotes: "Per building code.",
  },
  parking: {
    parkingRequired: true,
    parkingSpacesRequired: 1,
    parkingExemptions: "1 space per ADU unless a State exemption applies (Gov. Code § 66322).",
    replacementParkingRequired: false,
    tandemParkingAllowed: true,
    accessNotes: "ADU must have independent exterior access.",
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
    lastVerifiedDate: "2026-09-18",
    sourceUrls: [
      "https://www.encinitasca.gov/government/departments/development-services/housing/accessory-dwelling-units",
      "https://documents.coastal.ca.gov/reports/2022/7/W18a/W18a-7-2022-report.pdf",
    ],
    rulesVerified: false,
    notesInternal: "UNVERIFIED: EMC 30.48.040 max sizes not confirmed (ecode360 blocks automated fetch).",
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
    lastVerifiedDate: "2026-09-18",
    sourceUrls: [
      "https://www.escondido.gov/238/Accessory-Dwelling-Units",
      "https://escondido.gov/DocumentCenter/View/549/",
    ],
    rulesVerified: true,
    rulesCitation: "City of Escondido — Zoning Code Art. 70 / § 33-1474",
  },
  sizeRules: {
    detachedAduMaxSqft: 1000,
    attachedAduMaxSqft: 1000,
    jaduMaxSqft: 500,
    detachedAduMinSqft: 150,
    attachedAduMinSqft: 150,
    conversionAduSizeNotes: "Conversions of existing space follow the existing structure (State law).",
    multifamilyDetachedAduRule: "Per State law (Gov. Code § 66323).",
    multifamilyConversionAduRule: "Per State law (Gov. Code § 66323).",
    bonusProgramNotes: "Detached up to 1,000 sq ft (850–1,000 by lot and primary size; 850 always allowed) — exact size table (Table 33-1474) not re-verified. Pre-Approved ADU (PAADU) program with 4 plans.",
  },
  setbacks: {
    sideSetbackFt: 4,
    rearSetbackFt: 4,
    frontSetbackRule: "Per underlying zone (cannot preclude an 800 sq ft ADU — Gov. Code § 66321(b)(3)).",
    streetSideSetbackRule: "Per underlying zone.",
    convertedStructureSetbackRule: "No setback for conversion of an existing legal structure.",
    attachedAduSetbackNotes: "Per local code / State law.",
    detachedAduSetbackNotes: "4 ft side and rear.",
    encroachmentNotes: "Per underlying zone.",
    cornerLotNotes: "Street-side setback per underlying zone.",
  },
  height: {
    maxHeightFt: 16,
    detachedAduHeightRule: "Zone limit, at least 16 ft; 18 ft near transit; 25 ft attached.",
    attachedAduHeightRule: "Attached ADU: 25 ft or zone limit, whichever is lower (Gov. Code § 66321(b)(4)(D)).",
    twoStoryAllowed: false,
    secondStoryNotes: "See detached height rule.",
    roofDeckNotes: "Verify with City.",
    stairProjectionNotes: "Per building code.",
  },
  parking: {
    parkingRequired: false,
    parkingSpacesRequired: 0,
    parkingExemptions: "No ADU parking required (§ 33-1474(c)(1)).",
    replacementParkingRequired: false,
    tandemParkingAllowed: true,
    accessNotes: "ADU must have independent exterior access.",
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
    lastVerifiedDate: "2026-09-18",
    sourceUrls: [
      "https://imperialbeachca.gov/268/Accessory-Dwelling-Units",
      "https://ecode360.com/IM4939/laws/LF1895652.pdf",
    ],
    rulesVerified: false,
    notesInternal: "UNVERIFIED: City ADU page (1,200 sf detached, 16/18 ft, 4 ft) conflicts with IBMC Ch. 19.66 Ord. 2021-1204 (2 parking spaces west of 3rd St / within 1/4 mile of beach access). No public zoning GIS layer found.",
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
    lastVerifiedDate: "2026-09-18",
    sourceUrls: [
      "https://www.cityoflamesa.gov/1821/Accessory-Dwelling-Units",
      "https://library.municode.com/ca/la_mesa/codes/code_of_ordinances?nodeId=TIT24ZO_CH24.05REZODEST_24.05.020PESTUS",
    ],
    rulesVerified: true,
    rulesCitation: "City of La Mesa — LMMC § 24.05.020(D)(8)–(9)",
  },
  sizeRules: {
    detachedAduMaxSqft: 1200,
    attachedAduMaxSqft: 1200,
    jaduMaxSqft: 500,
    detachedAduMinSqft: 150,
    attachedAduMinSqft: 150,
    conversionAduSizeNotes: "Conversions of existing space follow the existing structure (State law).",
    multifamilyDetachedAduRule: "Per State law (Gov. Code § 66323).",
    multifamilyConversionAduRule: "Per State law (Gov. Code § 66323).",
    bonusProgramNotes: "1,200 sq ft detached or attached (no % cap). +5% lot coverage for ADUs on lots ≤ 10,000 sq ft; pre-approved plans A–E.",
  },
  setbacks: {
    sideSetbackFt: 4,
    rearSetbackFt: 4,
    frontSetbackRule: "Per underlying zone (cannot preclude an 800 sq ft ADU — Gov. Code § 66321(b)(3)).",
    streetSideSetbackRule: "Per underlying zone.",
    convertedStructureSetbackRule: "No setback for conversion of an existing legal structure.",
    attachedAduSetbackNotes: "Per local code / State law.",
    detachedAduSetbackNotes: "4 ft side and rear (LMMC § 24.05.020(D)(8)).",
    encroachmentNotes: "Per underlying zone.",
    cornerLotNotes: "Street-side setback per underlying zone.",
  },
  height: {
    maxHeightFt: 16,
    detachedAduHeightRule: "Underlying zone height limit (no ADU-specific cap; State minimum 16 ft).",
    attachedAduHeightRule: "Attached ADU: 25 ft or zone limit, whichever is lower (Gov. Code § 66321(b)(4)(D)).",
    twoStoryAllowed: false,
    secondStoryNotes: "See detached height rule.",
    roofDeckNotes: "Verify with City.",
    stairProjectionNotes: "Per building code.",
  },
  parking: {
    parkingRequired: false,
    parkingSpacesRequired: 0,
    parkingExemptions: "No ADU parking required by local code.",
    replacementParkingRequired: false,
    tandemParkingAllowed: true,
    accessNotes: "ADU must have independent exterior access.",
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
    lastVerifiedDate: "2026-09-18",
    sourceUrls: [
      "https://www.lemongrove.ca.gov/media/tljp3xqe/adu-development-standards-handout.pdf",
      "https://www.hcd.ca.gov/sites/default/files/docs/policy-and-research/ordinance-review-letters/lemon-grove-adu-findings-121025.pdf",
    ],
    rulesVerified: true,
    rulesCitation: "City of Lemon Grove — LGMC § 17.24.060",
  },
  sizeRules: {
    detachedAduMaxSqft: 1200,
    attachedAduMaxSqft: 1200,
    jaduMaxSqft: 500,
    detachedAduMinSqft: 150,
    attachedAduMinSqft: 150,
    conversionAduSizeNotes: "Conversions of existing space follow the existing structure (State law).",
    multifamilyDetachedAduRule: "Per State law (Gov. Code § 66323).",
    multifamilyConversionAduRule: "Per State law (Gov. Code § 66323).",
    bonusProgramNotes: "1,200 sq ft and ≤ 100% of primary; 800 sq ft always allowed. HCD found the ordinance noncompliant on 16 items (12/10/2025).",
  },
  setbacks: {
    sideSetbackFt: 4,
    rearSetbackFt: 4,
    frontSetbackRule: "Per underlying zone (cannot preclude an 800 sq ft ADU — Gov. Code § 66321(b)(3)).",
    streetSideSetbackRule: "Per underlying zone.",
    convertedStructureSetbackRule: "No setback for conversion of an existing legal structure.",
    attachedAduSetbackNotes: "Per local code / State law.",
    detachedAduSetbackNotes: "4 ft side and rear.",
    encroachmentNotes: "Per underlying zone.",
    cornerLotNotes: "Street-side setback per underlying zone.",
  },
  height: {
    maxHeightFt: 16,
    detachedAduHeightRule: "16 ft; 18 ft near transit (+2 ft roof pitch); attached 25 ft (City handout).",
    attachedAduHeightRule: "Attached ADU: 25 ft or zone limit, whichever is lower (Gov. Code § 66321(b)(4)(D)).",
    twoStoryAllowed: false,
    secondStoryNotes: "See detached height rule.",
    roofDeckNotes: "Verify with City.",
    stairProjectionNotes: "Per building code.",
  },
  parking: {
    parkingRequired: false,
    parkingSpacesRequired: 0,
    parkingExemptions: "Exempt within 1/2 mile of a bus stop or station; base requirement not verified.",
    replacementParkingRequired: false,
    tandemParkingAllowed: true,
    accessNotes: "ADU must have independent exterior access.",
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
    lastVerifiedDate: "2026-09-18",
    sourceUrls: [
      "https://library.municode.com/ca/national_city/codes/code_of_ordinances?nodeId=CD_ORD_TIT18ZO_DIV3SPUS_CH18.30SPUSRE_18.30.380ACDWUN",
    ],
    rulesVerified: true,
    rulesCitation: "City of National City — NCMC §§ 18.30.380–18.30.390 (Ord. 2024-2529)",
  },
  sizeRules: {
    detachedAduMaxSqft: 1200,
    attachedAduMaxSqft: 1200,
    jaduMaxSqft: 500,
    detachedAduMinSqft: 150,
    attachedAduMinSqft: 150,
    conversionAduSizeNotes: "Conversions of existing space follow the existing structure (State law).",
    multifamilyDetachedAduRule: "Per State law (Gov. Code § 66323).",
    multifamilyConversionAduRule: "Per State law (Gov. Code § 66323).",
    bonusProgramNotes: "Detached 1,200 sq ft (no max within an existing footprint); attached 50% of primary or 1,200 sq ft, whichever is greater. One 24-inch box tree required.",
  },
  setbacks: {
    sideSetbackFt: 4,
    rearSetbackFt: 4,
    frontSetbackRule: "Per underlying zone (cannot preclude an 800 sq ft ADU — Gov. Code § 66321(b)(3)).",
    streetSideSetbackRule: "Per underlying zone.",
    convertedStructureSetbackRule: "No setback for conversion of an existing legal structure.",
    attachedAduSetbackNotes: "Per local code / State law.",
    detachedAduSetbackNotes: "4 ft side and rear (NCMC § 18.30.380).",
    encroachmentNotes: "Per underlying zone.",
    cornerLotNotes: "Street-side setback per underlying zone.",
  },
  height: {
    maxHeightFt: 16,
    detachedAduHeightRule: "Greater of primary height or 16 ft; 25 ft if over a garage or on a lot < 5,000 sq ft (NCMC § 18.30.380).",
    attachedAduHeightRule: "Attached ADU: 25 ft or zone limit, whichever is lower (Gov. Code § 66321(b)(4)(D)).",
    twoStoryAllowed: false,
    secondStoryNotes: "See detached height rule.",
    roofDeckNotes: "Verify with City.",
    stairProjectionNotes: "Per building code.",
  },
  parking: {
    parkingRequired: false,
    parkingSpacesRequired: 0,
    parkingExemptions: "No ADU parking required by local code.",
    replacementParkingRequired: false,
    tandemParkingAllowed: true,
    accessNotes: "ADU must have independent exterior access.",
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
    lastVerifiedDate: "2026-09-18",
    sourceUrls: [
      "https://www.ci.oceanside.ca.us/government/development-services/planning/accessory-dwelling-unit-adu",
      "https://www.hcd.ca.gov/sites/default/files/docs/policy-and-research/ordinance-review-letters/oceanside-adu-findings-05202025.pdf",
    ],
    rulesVerified: true,
    rulesCitation: "City of Oceanside — State ADU law applies (local Art. 30 § 3006 no longer applied; HCD findings 5/20/2025)",
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
  sizeRules: {
    detachedAduMaxSqft: 1200,
    attachedAduMaxSqft: 1200,
    jaduMaxSqft: 500,
    detachedAduMinSqft: 150,
    attachedAduMinSqft: 150,
    conversionAduSizeNotes: "Conversions of existing space follow the existing structure (State law).",
    multifamilyDetachedAduRule: "Per State law (Gov. Code § 66323).",
    multifamilyConversionAduRule: "Per State law (Gov. Code § 66323).",
    bonusProgramNotes: "Oceanside has no compliant local ordinance, so State ADU law (Gov. Code §§ 66314–66342) applies directly.",
  },
  setbacks: {
    sideSetbackFt: 4,
    rearSetbackFt: 4,
    frontSetbackRule: "Per underlying zone (cannot preclude an 800 sq ft ADU — Gov. Code § 66321(b)(3)).",
    streetSideSetbackRule: "Per underlying zone.",
    convertedStructureSetbackRule: "No setback for conversion of an existing legal structure.",
    attachedAduSetbackNotes: "Per local code / State law.",
    detachedAduSetbackNotes: "4 ft side and rear (Gov. Code § 66314(d)(7)).",
    encroachmentNotes: "Per underlying zone.",
    cornerLotNotes: "Street-side setback per underlying zone.",
  },
  height: {
    maxHeightFt: 16,
    detachedAduHeightRule: "State minimum: 16 ft; 18 ft within 1/2 mile of major transit (+2 ft roof pitch); attached up to 25 ft (Gov. Code § 66321(b)(4)).",
    attachedAduHeightRule: "Attached ADU: 25 ft or zone limit, whichever is lower (Gov. Code § 66321(b)(4)(D)).",
    twoStoryAllowed: false,
    secondStoryNotes: "See detached height rule.",
    roofDeckNotes: "Verify with City.",
    stairProjectionNotes: "Per building code.",
  },
  parking: {
    parkingRequired: false,
    parkingSpacesRequired: 0,
    parkingExemptions: "Up to 1 space per ADU allowed by State law unless exempt (Gov. Code §§ 66314(d)(10), 66322).",
    replacementParkingRequired: false,
    tandemParkingAllowed: true,
    accessNotes: "ADU must have independent exterior access.",
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
    lastVerifiedDate: "2026-09-18",
    sourceUrls: [
      "https://poway.org/DocumentCenter/View/8712/Accessory-Dwelling-Units-ADU-and-Junior-Accessory-Dwelling-Units-JADU",
    ],
    rulesVerified: true,
    rulesCitation: "City of Poway — PMC § 17.08.180(A) (handout 06/2024)",
  },
  sizeRules: {
    detachedAduMaxSqft: 1200,
    attachedAduMaxSqft: 1200,
    jaduMaxSqft: 500,
    detachedAduMinSqft: 150,
    attachedAduMinSqft: 150,
    conversionAduSizeNotes: "Conversions of existing space follow the existing structure (State law).",
    multifamilyDetachedAduRule: "Per State law (Gov. Code § 66323).",
    multifamilyConversionAduRule: "Per State law (Gov. Code § 66323).",
    bonusProgramNotes: "Detached/attached: 50% of primary or 1,500 sq ft, whichever is less — 1,200 sq ft detached always allowed; ADU capped at 800 sq ft when paired with a JADU. Engine uses the guaranteed 1,200 sq ft.",
  },
  setbacks: {
    sideSetbackFt: 4,
    rearSetbackFt: 4,
    frontSetbackRule: "Per underlying zone (cannot preclude an 800 sq ft ADU — Gov. Code § 66321(b)(3)).",
    streetSideSetbackRule: "Per underlying zone.",
    convertedStructureSetbackRule: "No setback for conversion of an existing legal structure.",
    attachedAduSetbackNotes: "Per local code / State law.",
    detachedAduSetbackNotes: "4 ft side and rear.",
    encroachmentNotes: "Per underlying zone.",
    cornerLotNotes: "Street-side setback per underlying zone.",
  },
  height: {
    maxHeightFt: 16,
    detachedAduHeightRule: "16 ft / 1 story if not meeting primary setbacks; may match primary height if it does (PMC § 17.08.180).",
    attachedAduHeightRule: "Attached ADU: 25 ft or zone limit, whichever is lower (Gov. Code § 66321(b)(4)(D)).",
    twoStoryAllowed: false,
    secondStoryNotes: "See detached height rule.",
    roofDeckNotes: "Verify with City.",
    stairProjectionNotes: "Per building code.",
  },
  parking: {
    parkingRequired: true,
    parkingSpacesRequired: 1,
    parkingExemptions: "1 space per ADU unless a State exemption applies (Gov. Code § 66322).",
    replacementParkingRequired: false,
    tandemParkingAllowed: true,
    accessNotes: "ADU must have independent exterior access.",
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
    lastVerifiedDate: "2026-09-18",
    sourceUrls: [
      "https://library.municode.com/ca/san_marcos/codes/code_of_ordinances?nodeId=TIT20ZO_CH20.410ACDWUNACST",
    ],
    rulesVerified: true,
    rulesCitation: "City of San Marcos — SMC Ch. 20.410 (Ord. 2024-1551)",
  },
  sizeRules: {
    detachedAduMaxSqft: 1000,
    attachedAduMaxSqft: 1000,
    jaduMaxSqft: 500,
    detachedAduMinSqft: 150,
    attachedAduMinSqft: 150,
    conversionAduSizeNotes: "Conversions of existing space follow the existing structure (State law).",
    multifamilyDetachedAduRule: "Per State law (Gov. Code § 66323).",
    multifamilyConversionAduRule: "Per State law (Gov. Code § 66323).",
    bonusProgramNotes: "Smallest of: 50% of primary (min 850), 850 sq ft (1BR), 1,000 sq ft (2+BR); detached 1,000 sq ft on lots ≥ 1 acre. No 1,200 sq ft tier. Must match primary architecture/materials.",
  },
  setbacks: {
    sideSetbackFt: 4,
    rearSetbackFt: 4,
    frontSetbackRule: "Per underlying zone (cannot preclude an 800 sq ft ADU — Gov. Code § 66321(b)(3)).",
    streetSideSetbackRule: "Per underlying zone.",
    convertedStructureSetbackRule: "No setback for conversion of an existing legal structure.",
    attachedAduSetbackNotes: "Per local code / State law.",
    detachedAduSetbackNotes: "4 ft side and rear; detached ADU must be in the rear 50% of the lot (SMC § 20.410.060).",
    encroachmentNotes: "Per underlying zone.",
    cornerLotNotes: "Street-side setback per underlying zone.",
  },
  height: {
    maxHeightFt: 16,
    detachedAduHeightRule: "16 ft; 18 ft near transit (+2 ft); attached 25 ft / 2 stories (SMC § 20.410.060).",
    attachedAduHeightRule: "Attached ADU: 25 ft or zone limit, whichever is lower (Gov. Code § 66321(b)(4)(D)).",
    twoStoryAllowed: false,
    secondStoryNotes: "See detached height rule.",
    roofDeckNotes: "Verify with City.",
    stairProjectionNotes: "Per building code.",
  },
  parking: {
    parkingRequired: true,
    parkingSpacesRequired: 1,
    parkingExemptions: "1 paved space per ADU unless a State exemption applies (SMC § 20.410.060).",
    replacementParkingRequired: false,
    tandemParkingAllowed: true,
    accessNotes: "ADU must have independent exterior access.",
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
    lastVerifiedDate: "2026-09-18",
    sourceUrls: [
      "https://www.cityofsanteeca.gov/documents/planning-building/adu/adu-jadu-guide.pdf",
    ],
    rulesVerified: true,
    rulesCitation: "City of Santee — SMC § 13.10.045 (ADU/JADU guide, 2026)",
  },
  sizeRules: {
    detachedAduMaxSqft: 1200,
    attachedAduMaxSqft: 1200,
    jaduMaxSqft: 500,
    detachedAduMinSqft: 150,
    attachedAduMinSqft: 150,
    conversionAduSizeNotes: "Conversions of existing space follow the existing structure (State law).",
    multifamilyDetachedAduRule: "Per State law (Gov. Code § 66323).",
    multifamilyConversionAduRule: "Per State law (Gov. Code § 66323).",
    bonusProgramNotes: "800 sq ft streamlined; up to 1,200 sq ft with added requirements. CALGreen Tier II required; ADU fee waiver ended 9/27/2024.",
  },
  setbacks: {
    sideSetbackFt: 4,
    rearSetbackFt: 4,
    frontSetbackRule: "Per underlying zone (cannot preclude an 800 sq ft ADU — Gov. Code § 66321(b)(3)).",
    streetSideSetbackRule: "Per underlying zone.",
    convertedStructureSetbackRule: "No setback for conversion of an existing legal structure.",
    attachedAduSetbackNotes: "Per local code / State law.",
    detachedAduSetbackNotes: "4 ft side and rear.",
    encroachmentNotes: "Per underlying zone.",
    cornerLotNotes: "Street-side setback per underlying zone.",
  },
  height: {
    maxHeightFt: 16,
    detachedAduHeightRule: "16 ft; 18–20 ft near transit.",
    attachedAduHeightRule: "Attached ADU: 25 ft or zone limit, whichever is lower (Gov. Code § 66321(b)(4)(D)).",
    twoStoryAllowed: false,
    secondStoryNotes: "See detached height rule.",
    roofDeckNotes: "Verify with City.",
    stairProjectionNotes: "Per building code.",
  },
  parking: {
    parkingRequired: false,
    parkingSpacesRequired: 0,
    parkingExemptions: "Parking only if ADU > 800 sq ft AND > 1/2 mile from transit.",
    replacementParkingRequired: false,
    tandemParkingAllowed: true,
    accessNotes: "ADU must have independent exterior access.",
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
    lastVerifiedDate: "2026-09-18",
    sourceUrls: [
      "https://www.codepublishing.com/CA/SolanaBeach/html/SolanaBeach17/SolanaBeach1760.html",
    ],
    rulesVerified: true,
    rulesCitation: "City of Solana Beach — SBMC § 17.60.210(A) (Ord. 542, 2026)",
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
  sizeRules: {
    detachedAduMaxSqft: 1000,
    attachedAduMaxSqft: 1000,
    jaduMaxSqft: 500,
    detachedAduMinSqft: 150,
    attachedAduMinSqft: 150,
    conversionAduSizeNotes: "Conversions of existing space follow the existing structure (State law).",
    multifamilyDetachedAduRule: "Per State law (Gov. Code § 66323).",
    multifamilyConversionAduRule: "Per State law (Gov. Code § 66323).",
    bonusProgramNotes: "Max 850 sq ft (studio/1BR) or 1,000 sq ft (2+BR). Must match primary style; ADU entrance not visible from street.",
  },
  setbacks: {
    sideSetbackFt: 4,
    rearSetbackFt: 4,
    frontSetbackRule: "Per underlying zone (cannot preclude an 800 sq ft ADU — Gov. Code § 66321(b)(3)).",
    streetSideSetbackRule: "Per underlying zone.",
    convertedStructureSetbackRule: "No setback for conversion of an existing legal structure.",
    attachedAduSetbackNotes: "Per local code / State law.",
    detachedAduSetbackNotes: "4 ft side and rear (SBMC § 17.60.210).",
    encroachmentNotes: "Per underlying zone.",
    cornerLotNotes: "Street-side setback per underlying zone.",
  },
  height: {
    maxHeightFt: 16,
    detachedAduHeightRule: "16 ft; 18 ft near transit (+2 ft); attached 25 ft / 2 stories (SBMC § 17.60.210).",
    attachedAduHeightRule: "Attached ADU: 25 ft or zone limit, whichever is lower (Gov. Code § 66321(b)(4)(D)).",
    twoStoryAllowed: false,
    secondStoryNotes: "See detached height rule.",
    roofDeckNotes: "Verify with City.",
    stairProjectionNotes: "Per building code.",
  },
  parking: {
    parkingRequired: true,
    parkingSpacesRequired: 1,
    parkingExemptions: "1 space per ADU unless a State exemption applies; none for JADU (SBMC § 17.60.210).",
    replacementParkingRequired: false,
    tandemParkingAllowed: true,
    accessNotes: "ADU must have independent exterior access.",
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
    lastVerifiedDate: "2026-09-18",
    sourceUrls: [
    ],
    rulesVerified: false,
    notesInternal: "UNVERIFIED: likely VMC Ch. 18.31; every official host blocked automated fetch.",
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

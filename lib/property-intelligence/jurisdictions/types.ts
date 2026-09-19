// Jurisdiction Rule Types — Structured profiles per jurisdiction

export type JurisdictionType = "city" | "county";

export interface JurisdictionIdentity {
  id: string;
  slug: string;
  name: string;
  type: JurisdictionType;
  county: string;
  state: string;
  active: boolean;
  rulesVersion: string;
  lastVerifiedDate: string;
  sourceUrls: string[];
  notesInternal?: string;
  /**
   * True only when the size/setback/height numbers in this profile were
   * checked against the jurisdiction's own ordinance (or, where the city has
   * no local ordinance, State law) on `lastVerifiedDate`. Unverified profiles
   * fall back to State-law defaults and must be labelled as such.
   */
  rulesVerified?: boolean;
  /** Short citation shown as the source of ADU rule fields, e.g. "SDMC § 141.0302". */
  rulesCitation?: string;
}

export interface EligibilityRules {
  allowsDetachedAdu: boolean;
  allowsAttachedAdu: boolean;
  allowsJadu: boolean;
  allowsConversionAdu: boolean;
  singleFamilyRulesSummary: string;
  multifamilyRulesSummary: string;
  ownerOccupancyNotes: string;
  rentalTermNotes: string;
  saleSeparabilityNotes: string;
}

export interface SizeRules {
  detachedAduMaxSqft: number;
  attachedAduMaxSqft: number;
  jaduMaxSqft: number;
  detachedAduMinSqft: number;
  attachedAduMinSqft: number;
  conversionAduSizeNotes: string;
  multifamilyDetachedAduRule: string;
  multifamilyConversionAduRule: string;
  bonusProgramNotes: string;
}

export interface SetbackRules {
  /** Interior side setback (ft) for a new detached ADU (standard case). */
  sideSetbackFt: number;
  /** Rear setback (ft) for a new detached ADU (standard case). */
  rearSetbackFt: number;
  /**
   * Front setback (ft) the site engine uses when the parcel's base zone is not
   * in a verified zone table (see zone-standards.ts). ADU front setbacks
   * follow the base zone, so this is a city-wide default, not a guarantee.
   */
  frontSetbackFt: number;
  /** Where the numeric side/rear/front values come from. */
  setbackCitation: string;
  /**
   * Reduced interior side/rear setback (ft) for a LOW-PROFILE detached ADU
   * (≤ lowProfileMaxHeightFt tall), where the city allows less than
   * sideSetbackFt/rearSetbackFt. Undefined = no reduction.
   */
  lowProfileSideRearSetbackFt?: number;
  /** Height (ft) at or below which the low-profile setback applies. */
  lowProfileMaxHeightFt?: number;
  /** The low-profile setback does NOT apply inside a (Very) High Fire Hazard Severity Zone. */
  lowProfileExcludedInFireZone?: boolean;
  /** Citation for the low-profile setback rule. */
  lowProfileCitation?: string;
  frontSetbackRule: string;
  streetSideSetbackRule: string;
  convertedStructureSetbackRule: string;
  attachedAduSetbackNotes: string;
  detachedAduSetbackNotes: string;
  encroachmentNotes: string;
  cornerLotNotes: string;
}

export interface HeightRules {
  maxHeightFt: number;
  detachedAduHeightRule: string;
  attachedAduHeightRule: string;
  twoStoryAllowed: boolean;
  secondStoryNotes: string;
  roofDeckNotes: string;
  stairProjectionNotes: string;
}

export interface SeparationRules {
  /** Minimum distance (ft) between a new detached ADU and the primary dwelling. */
  minDistanceFromPrimaryHomeFt: number;
  /** Basis for minDistanceFromPrimaryHomeFt (local code or building-code rationale). */
  separationCitation: string;
  minDistanceBetweenStructuresNotes: string;
  rearYardPlacementNotes: string;
  frontYardFeasibilityNotes: string;
  garageConversionNotes: string;
  accessoryStructureConversionNotes: string;
}

export interface ParkingRules {
  parkingRequired: boolean;
  parkingSpacesRequired: number;
  parkingExemptions: string;
  replacementParkingRequired: boolean;
  tandemParkingAllowed: boolean;
  accessNotes: string;
}

export interface InfrastructureRules {
  sprinklerNotes: string;
  utilityConnectionNotes: string;
  sewerWaterNotes: string;
  electricalNotes: string;
  drainageNotes: string;
  easementRedFlags: string;
}

export interface ProcessRules {
  permitNotes: string;
  reviewTimelineNotes: string;
  standardPlanNotes: string;
  submittalNotes: string;
  localProcessNotes: string;
  discretionaryReviewNotes: string;
  coastalOrDesignReviewNotes: string;
  schoolFeeNotes: string;
  impactFeeNotes: string;
}

export interface SpecialConditions {
  coastalZoneNotes: string;
  hillsideNotes: string;
  historicReviewNotes: string;
  lotCoverageNotes: string;
  farNotes: string;
  openSpaceNotes: string;
  knownLocalExceptions: string;
  manualReviewTriggers: string[];
}

export interface SB9Rules {
  sb9ApplicabilityGeneral: string;
  sb9LotSplitPossibleFlag: boolean;
  sb9DuplexPossibleFlag: boolean;
  sb9MaxPrimaryUnitsGeneral: number;
  sb9GeneralConstraints: string;
  sb9OwnerOccupancyNotes: string;
  sb9LotSplitNotes: string;
  sb9CombinationStrategyNotes: string;
  propertyMaximizationNotes: string;
}

export interface ConfidenceProfile {
  confidenceDefault: number;
  confidenceExplanation: string;
  blockedRecommendationConditions: string[];
  requiresManualReviewIf: string[];
  clientDisclaimerShort: string;
  internalDisclaimerLong: string;
}

export interface JurisdictionProfile {
  identity: JurisdictionIdentity;
  eligibility: EligibilityRules;
  sizeRules: SizeRules;
  setbacks: SetbackRules;
  height: HeightRules;
  separation: SeparationRules;
  parking: ParkingRules;
  infrastructure: InfrastructureRules;
  process: ProcessRules;
  specialConditions: SpecialConditions;
  sb9: SB9Rules;
  confidence: ConfidenceProfile;
}

// Overlay types that may apply to a property
export type OverlayType =
  | "coastal"
  | "hillside"
  | "flood"
  | "historic"
  | "fire"
  | "design-review"
  | "transit-priority";

export interface OverlayDetection {
  type: OverlayType;
  name: string;
  detected: boolean;
  confidence: number;
  notes: string;
}

// Feasibility result per ADU type
export type FeasibilityLevel = "likely" | "possible" | "limited" | "not-recommended" | "unknown";

export interface FeasibilityResult {
  type: string;
  feasibility: FeasibilityLevel;
  maxSizeSqft: number;
  minSizeSqft: number;
  estimatedSizeRange: string;
  priceRange: string;
  description: string;
  constraints: string[];
  confidence: number;
}

// Upside opportunity
export interface UpsideOpportunity {
  triggerType: string;
  title: string;
  summary: string;
  scenarioCount: number;
  estimatedUpsideLevel: "high" | "moderate" | "low";
  recommendedFollowupFlow: string;
}

// Financial scenario
export interface FinancialScenario {
  scenarioName: string;
  scenarioType: string;
  projectedUnits: number;
  estimatedBuildCost: number;
  estimatedSoftCost: number;
  estimatedTotalCost: number;
  estimatedLoanAmount: number;
  estimatedDownPayment: number;
  estimatedMonthlyPayment: number;
  estimatedMonthlyIncome: number;
  estimatedMonthlyCashflow: number;
  estimatedAnnualGrossIncome: number;
  estimatedAnnualNetCashflow: number;
  estimatedRoi: number;
  estimatedPaybackYears: number;
  estimatedValueAdd: number;
  /** Where the rent came from: RentCast market estimate or a labeled planning table. */
  rentSource?: "rentcast" | "estimated";
  rentBasis?: string;
  /** Stated planning assumptions behind the cost / financing / return figures. */
  assumptions?: string[];
}

// Full analysis result (enhanced)
export interface EnhancedPropertyAnalysis {
  // Property data
  address: string;
  normalizedAddress: string;

  // Jurisdiction
  jurisdictionId: string;
  jurisdictionName: string;
  jurisdictionProfile: JurisdictionProfile;
  overlays: OverlayDetection[];

  // Parcel data
  apn: string;
  lotSizeSqFt: number;
  existingHomeSqFt: number;
  footprintSqFt: number;
  openYardSqFt: number;
  lotWidth: number;
  lotDepth: number;
  slope: string;
  parcelShape: string;
  yearBuilt: number | null;
  cornerLot: boolean;
  alleyAccess: boolean;

  // Build envelope
  buildableEnvelopeSqFt: number;
  rearYardDepthFt: number;
  sideYardWidthFt: number;
  maxDetachedFootprintSqFt: number;
  maxAttachedFootprintSqFt: number;

  // Feasibility
  feasibilityResults: FeasibilityResult[];
  recommendedPath: string;
  recommendedPathDescription: string;

  // Upside detection
  upsideDetected: boolean;
  upsideOpportunities: UpsideOpportunity[];

  // Financial scenarios
  financialScenarios: FinancialScenario[];

  // Confidence
  confidenceScore: number;
  confidenceBand: "high" | "moderate" | "low";
  manualReviewRequired: boolean;
  manualReviewReasons: string[];

  // Disclaimers
  clientDisclaimer: string;
  financialDisclaimer: string;
}

// Property Intelligence Engine - Type Definitions

export type ConfidenceStatus = "Verified" | "Cross-checked" | "Estimated" | "Unavailable";

export interface IntelligenceField<T = string | number> {
  value: T;
  confidence: number;
  status: ConfidenceStatus;
  sources: string[];
  displayValue?: string;
}

export function getConfidenceStatus(score: number): ConfidenceStatus {
  if (score >= 90) return "Verified";
  if (score >= 75) return "Cross-checked";
  if (score >= 50) return "Estimated";
  return "Unavailable";
}

export function formatFieldValue(field: IntelligenceField<number>, unit: string): string {
  return displayFieldValue(field, unit);
}

/**
 * The one way a report field is printed. An "Unavailable" field (confidence
 * < 50 — e.g. an assumed typical value when no record exists) is shown as
 * "Not available", never as a number that looks like data.
 */
export function displayFieldValue(field: IntelligenceField<string | number> | null | undefined, unit?: string): string {
  if (!field) return "Not available";
  if (field.displayValue) return field.displayValue;
  const v = field.value;
  if (typeof v === "number") {
    if (field.status === "Unavailable" || !Number.isFinite(v)) return "Not available";
    const prefix = field.status === "Estimated" ? "Approx. " : "";
    return `${prefix}${v.toLocaleString()}${unit ? ` ${unit}` : ""}`;
  }
  const str = v == null ? "" : String(v).trim();
  return str === "" ? "Not available" : str;
}

export interface PropertyIntelligence {
  address: IntelligenceField<string>;
  apn: IntelligenceField<string>;
  lotSizeSqFt: IntelligenceField<number>;
  homeAreaSqFt: IntelligenceField<number>;
  footprintSqFt: IntelligenceField<number>;
  openYardSqFt: IntelligenceField<number>;
  zoning: IntelligenceField<string>;
  slope: IntelligenceField<string>;
  aduAllowances: IntelligenceField<string>;
  heightLimit: IntelligenceField<string>;
  setbacks: IntelligenceField<string>;
  parcelShape: IntelligenceField<string>;
}

export interface BuildableAnalysis {
  requiredMainHomeSeparationFt: number;
  requiredPropertyLineSetbackFt: number;
  estimatedBuildableEnvelopeSqFt: number;
  /** Display override when the envelope isn't a measured value (e.g. "Site review needed"). */
  envelopeLabel?: string;
  oneStoryPotential: string;
  twoStoryPotential: string;
}

// ─── FinalBuildabilityResult: Single Source of Truth ───
// All downstream systems (recommendations, banner, financial, report) MUST read from this.
// When polygon geometry is available, it drives these values.
// Rectangle fallback is only used when geometry engine fails or confidence is too low.

export interface FinalBuildabilityResult {
  totalBuildableAreaSqFt: number;
  bestAduZoneAreaSqFt: number;
  bestAduZonePolygon: { type: string; coordinates: number[][][] } | null;
  candidateZones: {
    polygon: { type: string; coordinates: number[][][] };
    areaSqFt: number;
    position: string;
    buildQuality: number;
    minWidthFt: number;
    minDepthFt: number;
    suitableFor: string[];
    /** Real-parcel analysis: total contiguous buildable area of the zone. */
    contiguousAreaSqFt?: number;
  }[];
  candidateZoneCount: number;
  buildabilityConfidence: number;
  structurePlacementConfidence: number;
  geometryMethodUsed: "polygon-verified" | "polygon-estimated" | "rectangle-fallback";
  notes: string[];
  warnings: string[];
  // Debug comparison: shows rectangle result alongside polygon result
  debugComparison?: {
    rectangleBuildableAreaSqFt: number;
    polygonBuildableAreaSqFt: number;
    deltaPercent: number;
    polygonIsSource: boolean;
  };
}

export type FeasibilityLevel = "Likely" | "Possible" | "Limited" | "Not Recommended";

export interface ADURecommendation {
  type: string;
  feasibility: FeasibilityLevel;
  estimatedSizeRange: string;
  priceRange: string;
  description: string;
}

export interface SmartBannerData {
  recommendation: string;
  details: string;
}

export interface LotDimensions {
  lotWidth: number;
  lotDepth: number;
  mainHomeWidth: number;
  mainHomeDepth: number;
}

/** A candidate ADU footprint rectangle on the real parcel. */
export interface SiteZone {
  areaSqFt: number;
  widthFt: number;
  depthFt: number;
  position: string;
  contiguousAreaSqFt: number | null;
}

/**
 * Real site facts behind the ADU-type verdicts (County Assessor + SANDAG
 * parcel polygon + SANDAG Building Outlines). Null fields = unknown.
 */
export interface SiteFacts {
  /** Estimated stories of the main home: (living + attached garage) ÷ footprint. */
  stories: number | null;
  storiesMethod: string;
  garageStalls: number | null;
  garageConverted: boolean;
  garageAttached: boolean | null;
  garageSqFtEstimate: number | null;
  livingAreaSqFt: number | null;
  lotSizeSqFt: number | null;
  mainFootprintSqFt: number | null;
  totalFootprintSqFt: number | null;
  buildingCount: number | null;
  openYardSqFt: number | null;
  geometryVerified: boolean;
  geometrySource: string;
  detachedZone: {
    areaSqFt: number;
    widthFt: number;
    depthFt: number;
    position: string;
    contiguousAreaSqFt: number | null;
  } | null;
  attachedFit: { areaSqFt: number; widthFt: number; depthFt: number } | null;
  measuredYards: { frontFt: number; rearFt: number; leftFt: number; rightFt: number } | null;
  setbacksUsed: {
    /** Standard side/rear setback (two-story / fire zone / unknown fire zone). */
    sideRearFt: number;
    frontFt: number;
    separationFt: number;
    /** Side/rear setback used for a one-story (≤ 16 ft) detached ADU. */
    oneStorySideRearFt?: number;
    /** Why the one-story setback is what it is (fire zone status etc.). */
    oneStorySetbackReason?: string;
    frontSource?: string;
    citation?: string;
  };
  /**
   * Detached-ADU footprint options on the real parcel: one-story vs.
   * two-story setbacks, keeping vs. replacing accessory structures (a
   * detached garage/shed). Zones are null when nothing fits.
   */
  detachedOptions?: {
    oneStory: { asIs: SiteZone | null; replaceAccessory: SiteZone | null };
    twoStory: { asIs: SiteZone | null; replaceAccessory: SiteZone | null } | null;
    /** Accessory structures an ADU could replace (detached garage, sheds). */
    replaceable: Array<{ areaSqFt: number; kind: "detached garage" | "accessory structure" }>;
  };
  /** Base-zone multi-unit density (multiple-dwelling zones only). */
  multiUnitZoning?: {
    zone: string;
    lotSqFtPerUnit: number;
    baseDensityUnits: number;
    citation: string;
  } | null;
  /**
   * County-record vintage check: the traced building outline is materially
   * larger than the recorded living area (+ garage), suggesting additions
   * not yet on the Assessor roll. Null when nothing looks stale.
   */
  recordsVintageNote?: string | null;
  /** Measured terrain (USGS 3DEP samples on the real parcel); null when unavailable. */
  terrain?: {
    lotSlopePercent: number;
    /** Grade inside the likely ADU zone (rear yard), when known. */
    aduAreaSlopePercent: number | null;
    foundationType: string;
    /** Extra foundation/site cost vs. slab-on-grade (USD). */
    foundationCostUsd: number;
  } | null;
  frontEdgeMethod?: string;
  /** How the County parcel was matched to the address. */
  parcelMatch?: "exact-address" | "address-point" | "nearest" | "none";
  sources: string[];
}

export interface PropertyAnalysisResult {
  property: PropertyIntelligence;
  /** Real site facts driving the ADU-type verdicts (optional). */
  siteFacts?: SiteFacts;
  buildable: BuildableAnalysis;
  finalBuildability: FinalBuildabilityResult;
  recommendations: ADURecommendation[];
  bestRecommendation: string;
  smartBanner: SmartBannerData;
  lotDimensions: LotDimensions;
  disclaimer: string;

  // Enhanced layers (v2)
  jurisdiction?: {
    id: string;
    name: string;
    type: string;
    confidence: number;
    uncertain: boolean;
    rulesVersion: string;
    sourceUrls: string[];
  };
  aduRulesSnapshot?: {
    detachedMaxSqft: number;
    attachedMaxSqft: number;
    jaduMaxSqft: number;
    sideSetbackFt: number;
    rearSetbackFt: number;
    maxHeightFt: number;
    twoStoryAllowed: boolean;
    parkingRequired: boolean;
    ownerOccupancyNotes: string;
    bonusProgramNotes: string;
  };
  overlays?: {
    type: string;
    name: string;
    detected: boolean;
    confidence: number;
    notes: string;
  }[];
  enhancedFeasibility?: {
    type: string;
    feasibility: string;
    maxSizeSqft: number;
    minSizeSqft: number;
    estimatedSizeRange: string;
    priceRange: string;
    description: string;
    constraints: string[];
    confidence: number;
  }[];
  upsideDetected?: boolean;
  upsideOpportunities?: {
    triggerType: string;
    title: string;
    summary: string;
    scenarioCount: number;
    estimatedUpsideLevel: string;
    recommendedFollowupFlow: string;
  }[];
  financialScenarios?: {
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
    rentSource?: "rentcast" | "estimated";
    rentBasis?: string;
    assumptions?: string[];
  }[];
  confidenceScore?: number;
  confidenceBand?: "high" | "moderate" | "low";
  manualReviewRequired?: boolean;
  manualReviewReasons?: string[];
  confidenceSignals?: {
    positive: string[];
    negative: string[];
  };
  financialDisclaimer?: string;

  // New v3 layers
  geocoded?: {
    lat: number;
    lng: number;
    placeId: string;
    formattedAddress: string;
    city: string | null;
    state: string | null;
    zip: string | null;
  };
  parcelVisualization?: {
    parcelBoundary: { type: string; coordinates: number[][][] } | null;
    structureFootprint: { type: string; coordinates: number[][][] } | null;
    setbackLines: { type: string; coordinates: number[][] }[];
    buildableEnvelope: { type: string; coordinates: number[][][] } | null;
    detachedCandidateZones: { type: string; coordinates: number[][][] }[];
    attachedCandidateZones: { type: string; coordinates: number[][][] }[];
    conversionCandidateZones: { type: string; coordinates: number[][][] }[];
    uncertaintyShading: { type: string; coordinates: number[][][] } | null;
    geometryConfidence: number;
  };
  staticMapUrl?: string;
  zoningEnrichment?: {
    zoningCode: string | null;
    zoningDescription: string | null;
    landUseCategory: string | null;
    overlayDistricts: string[];
    maxLotCoverage: number | null;
    maxFAR: number | null;
    interpretation: string | null;
    confidence: number;
    available: true;
  };
  rentData?: {
    estimates: {
      aduType: string;
      monthlyRent: number;
      annualRent: number;
      rentRange: string;
      pricePerSqft: number;
      source: "rentcast" | "estimated";
      confidence: number;
    }[];
    available: true;
    source: "rentcast" | "estimated";
    /** Plain-English basis of the rent shown (what was priced, and by whom). */
    basis?: string;
    /** Short label for pills / headers, e.g. "Verified rentals within 1 mile". */
    basisLabel?: string;
    comparableCount?: number;
    /** Radius the shown comparables came from, in miles. */
    comparableRadiusMiles?: number | null;
    comparables?: {
      address: string;
      monthlyRent: number;
      squareFootage: number | null;
      bedrooms: number | null;
      bathrooms: number | null;
      distanceMiles: number | null;
    }[];
  };
  /**
   * The floor plan the recommendation is anchored to, with the ONE resolved
   * rent figure. The floor-plan section of the report prints this figure on
   * this plan's row so it always matches the Financial Snapshot.
   */
  recommendedPlan?: {
    planId: string;
    sizeSqFt: number;
    bedrooms: number;
    bathrooms: number;
    monthlyRent: number;
    rentRangeLow: number;
    rentRangeHigh: number;
    rentBasis: string;
    rentBasisLabel: string;
  };
  dataSources?: {
    /** Which geocoder actually resolved the address (e.g. "U.S. Census Geocoder"). */
    geocoder?: string | null;
    googlePlaces: boolean;
    attom: boolean;
    openStreetMap: boolean;
    zoneomics: boolean;
    rentCast: boolean;
    mapbox: boolean;
    microsoftFootprints: boolean;
    lidar: boolean;
  };

  // v4 layers — Architecture enhancements
  sanityChecks?: {
    passed: boolean;
    checks: {
      name: string;
      passed: boolean;
      severity: "error" | "warning" | "info";
      message: string;
    }[];
    adjustments: {
      field: string;
      originalValue: number;
      adjustedValue: number;
      reason: string;
    }[];
  };
  detectedStructures?: {
    type: string;
    areaSqFt: number;
    confidence: number;
  }[];
  rentScenarios?: {
    conservative: { monthlyRent: number; annualRent: number };
    market: { monthlyRent: number; annualRent: number };
    premium: { monthlyRent: number; annualRent: number };
    source: "rentcast" | "estimated";
    aduType: string;
    basis?: string;
  }[];
  imageryWarning?: string;

  // v6 layers — Source Cross-Reference & Reconciliation
  sourceAudit?: SourceAudit;

  // v7 layers — Polygon Geometry & Source Backbone
  geometryAnalysis?: {
    /** Parcel boundary as GeoJSON polygon */
    parcelPolygon: { type: string; coordinates: number[][][] };
    /** All detected structure polygons */
    structures: {
      classification: string;
      polygon: { type: string; coordinates: number[][][] };
      areaSqFt: number;
      centroid: { lng: number; lat: number };
      confidence: number;
      source: string;
      levels?: number;
    }[];
    /** Main structure placement within parcel */
    placement: {
      measuredSetbacks: { frontFt: number; rearFt: number; leftFt: number; rightFt: number };
      fitsWithinParcel: boolean;
      confidence: number;
      placementMethod: string;
    } | null;
    /** Setback-inset envelope polygon */
    setbackEnvelope: { type: string; coordinates: number[][][] } | null;
    /** Leftover buildable zones */
    leftoverZones: {
      polygon: { type: string; coordinates: number[][][] };
      areaSqFt: number;
      position: string;
      buildQuality: number;
      minWidthFt: number;
      minDepthFt: number;
      suitableFor: string[];
    }[];
    /** Best ADU candidate zone index */
    bestAduZoneIndex: number | null;
    /** Attached ADU candidate walls */
    attachedCandidateWalls: string[];
    /** Garage conversion candidate */
    garageConversionCandidate: {
      classification: string;
      areaSqFt: number;
      confidence: number;
    } | null;
    /** Overall geometry confidence */
    geometryConfidence: number;
    /** Geometry quality status */
    geometryStatus: "polygon-verified" | "polygon-estimated" | "rectangle-fallback";
    /** Source of parcel data */
    parcelSource: string;
    /** Source of footprint data */
    footprintSource: string;
    /** Area breakdown separating footprint from living area */
    areaSummary: {
      parcelSqFt: number;
      mainFootprintSqFt: number;
      mainLivingSqFt: number;
      totalStructureFootprintSqFt: number;
      totalSetbackAreaSqFt: number;
      totalLeftoverSqFt: number;
      bestBuildableZoneSqFt: number;
    };
    /** Geometry sanity check results */
    geometrySanityChecks: {
      passed: boolean;
      checks: { name: string; passed: boolean; severity: string; message: string }[];
      adjustedConfidence: number;
    };
  };

  // Footprint merge audit trail (OSM + Microsoft intelligent merge)
  footprintMergeNotes?: string[];

  // v7.1 layers — Microsoft Building Footprints
  microsoftFootprints?: {
    buildingCount: number;
    totalFootprintSqFt: number;
    mainBuildingSqFt: number | null;
    confidence: number;
    quadkey: string;
    source: string;
  };

  // v8 layers — Strict Geometry Pipeline (single-source, no fallbacks)
  strictGeometry?: {
    /** Pipeline status: geometry-verified | building-only | parcel-only | unavailable */
    status: "geometry-verified" | "building-only" | "parcel-only" | "unavailable";
    /** Whether we have enough data to render a valid diagram */
    canRenderDiagram: boolean;
    /** Fallback message when diagram cannot be rendered */
    fallbackMessage: string | null;
    /** Real parcel boundary polygon (from Parcel GIS) */
    parcelPolygon: { type: string; coordinates: number[][][] } | null;
    /** Real main residence footprint (from Microsoft Building Footprints) */
    buildingPolygon: { type: string; coordinates: number[][][] } | null;
    /** Calculated property metrics (from real geometry only) */
    metrics: {
      parcelWidthFt: number;
      parcelDepthFt: number;
      buildingWidthFt: number;
      buildingDepthFt: number;
      frontYardDepthFt: number;
      rearYardDepthFt: number;
      leftSideYardFt: number;
      rightSideYardFt: number;
      openYardAreaSqFt: number;
      buildingPlacement: {
        offsetFromCenterXFt: number;
        offsetFromCenterYFt: number;
        isCentered: boolean;
      };
    } | null;
    /** ADU buildable envelope (computed from real geometry) */
    buildableEnvelope: {
      parcelSetbackPolygon: { type: string; coordinates: number[][][] };
      residenceSeparationPolygon: { type: string; coordinates: number[][][] };
      buildablePolygon: { type: string; coordinates: number[][][] } | null;
      buildableAreaSqFt: number;
      bestZone: "rear" | "left-side" | "right-side" | "none";
      constraints: string[];
      propertyLineSetbackFt?: number;
      residenceSeparationFt?: number;
    } | null;
    /** Parcel data source */
    parcelSource: string;
    /** Building data source */
    buildingSource: string;
    /** Confidence score (only high if both sources verified) */
    confidence: number;
    /** Source audit for debugging */
    sourceAudit: {
      parcelGISAvailable: boolean;
      parcelGISReason: string | null;
      microsoftFootprintsAvailable: boolean;
      microsoftFootprintsReason: string | null;
      geometryValidated: boolean;
      validationErrors: string[];
    };
  };

  // v7.2 layers — LiDAR / Enhanced Terrain Intelligence
  lidarTerrain?: {
    slopeAnalysis: {
      averageSlopePercent: number;
      maxSlopePercent: number;
      minSlopePercent: number;
      aspectDegrees: number;
      aspectDirection: string;
      category: string;
      uniformity: string;
    };
    gradingEstimate: {
      gradingRequired: boolean;
      estimatedCutCuYd: number;
      estimatedFillCuYd: number;
      estimatedGradingCost: number;
      retainingWallLikely: boolean;
      estimatedRetainingWallLf: number;
      estimatedRetainingWallCost: number;
    };
    foundationRecommendation: {
      type: string;
      reason: string;
      additionalCostEstimate: number;
      confidence: number;
    };
    lidarAvailable: boolean;
    sources: string[];
    confidence: number;
    summary: string;
  };

  // v5 layers — Site Constraint Intelligence
  siteConstraints?: {
    constraints: {
      category: "flood" | "fire" | "terrain" | "coastal" | "easement";
      classification: string;
      severity: "none" | "low" | "moderate" | "high" | "very-high";
      constructionImpact: string;
      recommendation: string;
      confidence: number;
      source: string;
    }[];
    floodRisk: {
      floodZone: string;
      floodRisk: string;
      baseFloodElevation: string | null;
      developmentRestrictions: string;
    };
    fireHazard: {
      hazardZone: string;
      classification: string;
      constructionImplications: string;
    };
    terrain: {
      averageSlopePercent: number;
      terrainClassification: string;
      constructionImpact: string;
      costMultiplier: number;
    };
    coastalZone: {
      inCoastalZone: boolean;
      permitRequirement: string;
      additionalApprovalLayers: string[];
    };
    easements: {
      possibleEasements: {
        type: string;
        description: string;
        confidence: number;
      }[];
      buildableAreaImpact: string;
    };
    overallRiskLevel: "Low" | "Moderate" | "High";
    overallRiskScore: number;
    costAdjustmentPercent: number;
    timelineAdjustmentMonths: number;
    summary: string;
  };
}

// Source tier classification
export type SourceTier = "tier1" | "tier2" | "tier3";

// Source policy classification
export type SourcePolicy = "primary-backbone" | "reference-only";

export interface DataSource {
  name: string;
  tier: SourceTier;
  policy: SourcePolicy;
  timestamp: string;
}

// ─── v6: Source Cross-Reference & Reconciliation Types ───

export type FieldVerificationStatus = "verified" | "estimated" | "inferred" | "under-review" | "rejected";

export interface SourceCandidate<T = string | number> {
  value: T;
  sourceName: string;
  sourceTier: SourceTier;
  sourcePolicy: SourcePolicy;
  confidence: number;
  timestamp: string | null;
  status: FieldVerificationStatus;
  rejectionReason?: string;
}

export interface ReconciledField<T = string | number> {
  finalValue: T;
  finalConfidence: number;
  finalStatus: FieldVerificationStatus;
  selectedSource: string;
  selectionReason: string;
  candidates: SourceCandidate<T>[];
  discrepancyDetected: boolean;
  discrepancyDetail?: string;
}

export interface SourceAudit {
  address: ReconciledField<string>;
  apn: ReconciledField<string>;
  lotSizeSqFt: ReconciledField<number>;
  zoning: ReconciledField<string>;
  landUse: ReconciledField<string>;
  homeAreaSqFt: ReconciledField<number>;
  footprintSqFt: ReconciledField<number>;
  openYardSqFt: ReconciledField<number>;
  parcelShape: ReconciledField<string>;
  slope: ReconciledField<string>;
  rentEstimate: ReconciledField<number>;
  recommendedAduPath: ReconciledField<string>;
  // v7 geometry source fields
  parcelGeometry: ReconciledField<string>;
  footprintGeometry: ReconciledField<string>;
  structurePlacement: ReconciledField<string>;
  discrepancies: DiscrepancyRecord[];
  reconciliationTimestamp: string;
  totalSourcesConsulted: number;
  fieldCount: number;
  verifiedFieldCount: number;
  estimatedFieldCount: number;
  underReviewFieldCount: number;
  sourcePolicy: {
    primaryBackbone: string[];
    referenceOnly: string[];
  };
}

export interface DiscrepancyRecord {
  field: string;
  description: string;
  severity: "low" | "medium" | "high";
  sourceA: string;
  sourceAValue: string;
  sourceB: string;
  sourceBValue: string;
  resolution: string;
  confidenceImpact: number;
}
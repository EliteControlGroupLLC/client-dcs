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
  const prefix = field.status === "Estimated" ? "Approx. " : "";
  return `${prefix}${field.value.toLocaleString()} ${unit}`;
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
  oneStoryPotential: string;
  twoStoryPotential: string;
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

export interface PropertyAnalysisResult {
  property: PropertyIntelligence;
  buildable: BuildableAnalysis;
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
  };
  dataSources?: {
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

  // v7.1 layers — Microsoft Building Footprints
  microsoftFootprints?: {
    buildingCount: number;
    totalFootprintSqFt: number;
    mainBuildingSqFt: number | null;
    confidence: number;
    quadkey: string;
    source: string;
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

export type FieldVerificationStatus =
  | "verified"
  | "estimated"
  | "inferred"
  | "under-review"
  | "rejected";

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

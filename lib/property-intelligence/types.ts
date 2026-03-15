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
}

// Source tier classification
export type SourceTier = "tier1" | "tier2" | "tier3";

export interface DataSource {
  name: string;
  tier: SourceTier;
  timestamp: string;
}

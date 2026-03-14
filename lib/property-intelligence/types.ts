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
}

// Source tier classification
export type SourceTier = "tier1" | "tier2" | "tier3";

export interface DataSource {
  name: string;
  tier: SourceTier;
  timestamp: string;
}

// Property Intelligence Engine - Main Entry Point

export { analyzeProperty } from "./analysis-engine";
export { geocodeAddress } from "./geocoding-service";
export { getElevationData } from "./elevation-service";
export { getOSMPropertyData } from "./osm-service";
export { getAttomPropertyData } from "./attom-service";
export { resolvePropertyData } from "./property-data-resolver";

export type {
  PropertyIntelligence,
  PropertyAnalysisResult,
  IntelligenceField,
  ConfidenceStatus,
  BuildableAnalysis,
  ADURecommendation,
  FeasibilityLevel,
  SmartBannerData,
  LotDimensions,
  SourceTier,
  DataSource,
} from "./types";

export { getConfidenceStatus, formatFieldValue } from "./types";

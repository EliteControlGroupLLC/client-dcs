// Property Intelligence Engine - Main Entry Point

export { analyzeProperty } from "./analysis-engine";
export { geocodeAddress } from "./geocoding-service";
export { getElevationData } from "./elevation-service";
export { getOSMPropertyData } from "./osm-service";
export { getAttomPropertyData } from "./attom-service";
export { resolvePropertyData } from "./property-data-resolver";

// New v3 service layers
export {
  isMapboxAvailable,
  generateParcelVisualization,
  getStaticMapUrl,
  getMapboxConfig,
} from "./mapbox-service";
export type { ParcelVisualization } from "./mapbox-service";

export {
  isZoneomicsAvailable,
  getZoneomicsData,
  enrichOverlaysFromZoneomics,
  getZoningInterpretation,
} from "./zoneomics-service";
export type { ZoneomicsZoningData } from "./zoneomics-service";

export {
  isRentCastAvailable,
  getRentEstimate,
  getRentEstimatesForScenarios,
  inferUnitConfig,
} from "./rentcast-service";
export type { RentEstimate } from "./rentcast-service";

export {
  getRegulationSources,
  getSourcesForJurisdiction,
  getRulesVersion,
  getRegulationHistory,
  runRegulationScan,
  getMonitoringStatus,
  validateRulesCurrency,
} from "./regulation-monitor";

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
  FieldVerificationStatus,
  SourceCandidate,
  ReconciledField,
  SourceAudit,
  DiscrepancyRecord,
} from "./types";

export { reconcileAllSources } from "./source-reconciliation-engine";
export type { ReconciliationInput } from "./source-reconciliation-engine";

export { getConfidenceStatus, formatFieldValue } from "./types";

// Data model types
export type {
  AddressRecord,
  PropertyScanRecord,
  JurisdictionRecord,
  RegulationSourceRecord,
  JurisdictionRuleRecord,
  GeometryAnalysisRecord,
  FeasibilityResultRecord,
  FinancialScenarioRecord,
  PropertyReportRecord,
  RegulationHistoryRecord,
  ZoningEnrichmentRecord,
  RentEstimateRecord,
  PropertyScanState,
} from "./data-model";
export { generateId } from "./data-model";

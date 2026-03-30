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
  FinalBuildabilityResult,
  ADURecommendation,
  FeasibilityLevel,
  SmartBannerData,
  LotDimensions,
  SourceTier,
  SourcePolicy,
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

// v7 — Geometry Engine
export {
  analyzePropertyGeometry,
  runGeometrySanityChecks,
  geoPolygonAreaSqFt,
  measureSetbacksToParcel,
  classifyStructures,
  createRectPolygon,
  osmNodesToPolygon,
} from "./geometry-engine";
export type {
  GeometryAnalysis,
  GeometryInput,
  GeometryPolygon,
  DetectedStructure,
  StructureClassification,
  SetbackDistances,
  ParcelPlacement,
  LeftoverZone,
  BoundingBox,
  GeometrySanityResult,
} from "./geometry-engine";

// v6 — Source Reconciliation Engine
export { reconcileAllSources } from "./source-reconciliation-engine";
export type { ReconciliationInput } from "./source-reconciliation-engine";

// v7.1 — Microsoft Building Footprint Service
export {
  getMicrosoftBuildingFootprints,
  msFootprintsToOSMFormat,
  latLngToQuadkey,
} from "./microsoft-footprint-service";
export type { MergedFootprintResult } from "./geometry-engine";
export type { MSBuildingFootprint, MSFootprintResult } from "./microsoft-footprint-service";

// v8 — Parcel GIS Service (Real Parcel Boundaries)
export {
  fetchParcelPolygon,
  fetchParcelByAPN,
  isParcelGISAvailable,
} from "./parcel-gis-service";
export type { ParcelGISResult } from "./parcel-gis-service";

// v8 — Strict Geometry Pipeline (Single Source of Truth)
export {
  runStrictGeometryPipeline,
  summarizeGeometryResult,
} from "./strict-geometry-pipeline";
export type {
  StrictGeometryResult,
  StrictPipelineInput,
  StrictPipelineStatus,
  StrictPropertyMetrics,
  BuildableEnvelopeResult,
} from "./strict-geometry-pipeline";

// v7.2 — LiDAR / Enhanced Terrain Intelligence
export { analyzeLiDARTerrain } from "./lidar-elevation-service";
export type {
  LiDARTerrainResult,
  TerrainProfile,
  SlopeAnalysis,
  GradingEstimate,
  FoundationRecommendation,
} from "./lidar-elevation-service";

// v7.3 — Benchmark Testing System
export {
  runBenchmarkSuite,
  runSingleBenchmark,
  getBenchmarkProperties,
} from "./benchmark-testing-service";
export type {
  BenchmarkProperty,
  BenchmarkResult,
  BenchmarkSuiteResult,
} from "./benchmark-testing-service";

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

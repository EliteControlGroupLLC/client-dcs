// Jurisdictions — Public API

export type {
  JurisdictionProfile,
  JurisdictionIdentity,
  EligibilityRules,
  SizeRules,
  SetbackRules,
  HeightRules,
  SeparationRules,
  ParkingRules,
  InfrastructureRules,
  ProcessRules,
  SpecialConditions,
  SB9Rules,
  ConfidenceProfile,
  OverlayType,
  OverlayDetection,
  FeasibilityResult,
  FeasibilityLevel,
  UpsideOpportunity,
  FinancialScenario,
  EnhancedPropertyAnalysis,
} from "./types";

export {
  JURISDICTION_PROFILES,
  JURISDICTION_LIST,
  COMMON_CLIENT_DISCLAIMER,
  COMMON_FINANCIAL_DISCLAIMER,
  COMMON_INTERNAL_DISCLAIMER,
} from "./profiles";

export {
  detectJurisdictionFromAddress,
  detectOverlays,
} from "./detector";

export type { JurisdictionDetectionResult as JurisdictionResult } from "./detector";

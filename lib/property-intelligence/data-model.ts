// Property Intelligence Engine — Internal Data Model
// Structured entities for the complete property intelligence ecosystem.
// These types define the data layer for addresses, scans, jurisdictions,
// regulation sources, rules, geometry, feasibility, financials, reports, and history.

// ─── 1. Addresses ───

export interface AddressRecord {
  id: string;
  rawInput: string;
  normalizedAddress: string;
  googlePlaceId: string | null;
  lat: number;
  lng: number;
  city: string;
  state: string;
  zip: string;
  county: string | null;
  createdAt: string;
}

// ─── 2. Property Scans ───

export interface PropertyScanRecord {
  id: string;
  addressId: string;
  attomPropertyId: string | null;
  apn: string | null;
  lotSizeSqFt: number | null;
  zoningCode: string | null;
  landUse: string | null;
  existingHomeSqFt: number | null;
  footprintSqFt: number | null;
  yearBuilt: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  stories: number | null;
  rawAttomPayload: Record<string, unknown> | null;
  rawZoneomicsPayload: Record<string, unknown> | null;
  rawRentcastPayload: Record<string, unknown> | null;
  scanTimestamp: string;
}

// ─── 3. Jurisdictions ───

export interface JurisdictionRecord {
  id: string;
  slug: string;
  name: string;
  type: "city" | "county";
  county: string;
  state: string;
  active: boolean;
  rulesVersion: string;
  lastVerifiedDate: string;
}

// ─── 4. Regulation Sources ───

export interface RegulationSourceRecord {
  id: string;
  jurisdictionId: string;
  sourceTitle: string;
  sourceUrl: string;
  sourceType: "municipal-code" | "planning-page" | "bulletin" | "ordinance" | "state-guidance" | "county-page";
  monitorFrequency: "daily" | "weekly" | "biweekly" | "monthly";
  lastChecked: string | null;
  lastChangeDetected: string | null;
  extractionConfidence: number;
  active: boolean;
}

// ─── 5. Jurisdiction Rules ───

export interface JurisdictionRuleRecord {
  id: string;
  jurisdictionId: string;
  ruleKey: string;
  ruleValueText: string | null;
  ruleValueNumber: number | null;
  ruleValueBoolean: boolean | null;
  units: string | null;
  sourceUrl: string | null;
  effectiveDate: string | null;
  expirationDate: string | null;
  confidence: number;
  lastUpdated: string;
}

// ─── 6. Geometry Analysis ───

export interface GeometryAnalysisRecord {
  id: string;
  propertyScanId: string;
  parcelPolygon: GeoJSONData | null;
  structurePolygon: GeoJSONData | null;
  setbackLines: GeoJSONData | null;
  buildableEnvelopePolygon: GeoJSONData | null;
  detachedCandidateZones: GeoJSONData | null;
  attachedCandidateZones: GeoJSONData | null;
  conversionCandidateZones: GeoJSONData | null;
  geometryConfidence: number;
  generatedAt: string;
}

export interface GeoJSONData {
  type: string;
  coordinates: unknown;
}

// ─── 7. Feasibility Results ───

export interface FeasibilityResultRecord {
  id: string;
  propertyScanId: string;
  detachedAduFeasible: boolean;
  attachedAduFeasible: boolean;
  garageConversionFeasible: boolean;
  jaduFeasible: boolean;
  sb9OpportunityFlag: boolean;
  multifamilyOpportunityFlag: boolean;
  recommendedPath: string;
  recommendedSizeRange: string;
  keyConstraints: string[];
  confidenceScore: number;
  manualReviewRequired: boolean;
  clientSummary: string;
  internalSummary: string;
  generatedAt: string;
}

// ─── 8. Financial Scenarios ───

export interface FinancialScenarioRecord {
  id: string;
  propertyScanId: string;
  scenarioName: string;
  scenarioType: string;
  projectedUnits: number;
  estimatedBuildCost: number;
  estimatedTotalCost: number;
  estimatedLoanAmount: number;
  estimatedMonthlyPayment: number;
  estimatedMonthlyIncome: number;
  estimatedMonthlyCashflow: number;
  estimatedRoi: number;
  estimatedPaybackYears: number;
  assumptionsJson: Record<string, unknown>;
  generatedAt: string;
}

// ─── 9. Property Reports ───

export interface PropertyReportRecord {
  id: string;
  propertyScanId: string;
  leadName: string;
  leadEmail: string;
  leadPhone: string | null;
  reportUrl: string | null;
  reportData: PropertyReportData | null;
  createdAt: string;
}

export interface PropertyReportData {
  propertySummary: {
    address: string;
    apn: string;
    lotSizeSqFt: number;
    homeAreaSqFt: number;
    yearBuilt: number | null;
    zoning: string;
  };
  jurisdictionSummary: {
    name: string;
    type: string;
    rulesVersion: string;
  };
  feasibilitySummary: {
    recommendedPath: string;
    recommendedSizeRange: string;
    feasibleOptions: string[];
    constraints: string[];
  };
  buildEnvelopeImageUrl: string | null;
  opportunityAnalysis: {
    upsideDetected: boolean;
    opportunities: string[];
  };
  financialSnapshot: {
    estimatedCost: string;
    estimatedMonthlyRent: string;
    estimatedRoi: string;
    estimatedPayback: string;
  };
  confidenceScore: number;
  confidenceBand: string;
  disclaimer: string;
  financialDisclaimer: string;
  generatedAt: string;
}

// ─── 10. Regulation History ───

export interface RegulationHistoryRecord {
  id: string;
  jurisdictionId: string;
  fieldName: string;
  oldValue: string;
  newValue: string;
  sourceUrl: string;
  updateTimestamp: string;
  extractionConfidence: number;
  reviewStatus: "pending" | "approved" | "rejected";
}

// ─── 11. Zoning Enrichment (from Zoneomics) ───

export interface ZoningEnrichmentRecord {
  id: string;
  propertyScanId: string;
  zoningCode: string | null;
  zoningDescription: string | null;
  landUseCategory: string | null;
  overlayDistricts: string[];
  maxLotCoverage: number | null;
  maxFAR: number | null;
  maxHeight: number | null;
  designReview: boolean;
  historicDistrict: boolean;
  coastalZone: boolean;
  confidence: number;
  fetchedAt: string;
}

// ─── 12. Rent Estimates (from RentCast) ───

export interface RentEstimateRecord {
  id: string;
  propertyScanId: string;
  scenarioName: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  estimatedMonthlyRent: number;
  rentRangeLow: number;
  rentRangeHigh: number;
  pricePerSqft: number;
  comparableCount: number;
  source: "rentcast" | "estimated";
  confidence: number;
  fetchedAt: string;
}

// ─── Utility: Generate unique IDs ───

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// ─── In-Memory Store (for client-side state, replaced by DB in production) ───

export interface PropertyScanState {
  address: AddressRecord;
  scan: PropertyScanRecord;
  geometry: GeometryAnalysisRecord | null;
  feasibility: FeasibilityResultRecord | null;
  financialScenarios: FinancialScenarioRecord[];
  zoningEnrichment: ZoningEnrichmentRecord | null;
  rentEstimates: RentEstimateRecord[];
  report: PropertyReportRecord | null;
}

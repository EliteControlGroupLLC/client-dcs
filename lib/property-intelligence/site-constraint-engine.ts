// Site Constraint Intelligence Layer
// Analyzes environmental and regulatory conditions affecting property development.
// Runs after zoning determination and before buildable-area calculations.
// Evaluates: flood risk, fire hazard, terrain/slope, coastal zone, easements.

export interface SiteConstraint {
  category: "flood" | "fire" | "terrain" | "coastal" | "easement";
  classification: string;
  severity: "none" | "low" | "moderate" | "high" | "very-high";
  constructionImpact: string;
  recommendation: string;
  confidence: number;
  source: string;
}

export interface FloodRiskAnalysis {
  floodZone: string;
  floodRisk: "None" | "Low" | "Moderate" | "Elevated" | "High";
  baseFloodElevation: string | null;
  developmentRestrictions: string;
}

export interface FireHazardAnalysis {
  hazardZone: "None" | "Moderate" | "High" | "Very High";
  classification: string;
  constructionImplications: string;
}

export interface TerrainAnalysis {
  averageSlopePercent: number;
  terrainClassification: "Flat" | "Gentle" | "Moderate" | "Steep" | "Hillside";
  constructionImpact: string;
  costMultiplier: number;
}

export interface CoastalZoneAnalysis {
  inCoastalZone: boolean;
  permitRequirement: string;
  additionalApprovalLayers: string[];
}

export interface EasementAnalysis {
  possibleEasements: {
    type: string;
    description: string;
    confidence: number;
  }[];
  buildableAreaImpact: string;
}

export type ConstraintRiskLevel = "Low" | "Moderate" | "High";

export interface SiteConstraintResult {
  constraints: SiteConstraint[];
  floodRisk: FloodRiskAnalysis;
  fireHazard: FireHazardAnalysis;
  terrain: TerrainAnalysis;
  coastalZone: CoastalZoneAnalysis;
  easements: EasementAnalysis;
  overallRiskLevel: ConstraintRiskLevel;
  overallRiskScore: number; // 0-100, higher = more constrained
  costAdjustmentPercent: number; // additional cost % from constraints
  timelineAdjustmentMonths: number; // additional months from constraints
  summary: string;
}

interface ConstraintInput {
  lat: number;
  lng: number;
  slopeCategory: string; // from elevation service
  slopePercent: number;
  jurisdictionId: string;
  formattedAddress: string;
  lotSizeSqFt: number;
  zoning: string;
  hasCoastalOverlay: boolean;
  hasHillsideOverlay: boolean;
  overlayTypes: string[];
}

// ──────────────────────────────────────────────────────────
// FLOOD RISK ANALYSIS
// Uses FEMA flood zone classification based on location data
// ──────────────────────────────────────────────────────────

function analyzeFloodRisk(input: ConstraintInput): FloodRiskAnalysis {
  // San Diego County flood zone estimation based on geographic indicators
  const { lat, lng, formattedAddress } = input;
  const addressLower = formattedAddress.toLowerCase();

  // Known flood-prone areas in San Diego County
  const floodProneKeywords = [
    "mission valley", "fashion valley", "hotel circle",
    "mission bay", "pacific beach", "ocean beach",
    "san diego river", "sweetwater", "otay river",
    "tijuana river", "chollas creek", "tecolote",
    "rose canyon", "los penasquitos",
  ];

  const nearFloodArea = floodProneKeywords.some((kw) => addressLower.includes(kw));

  // Low-elevation coastal areas
  const isLowCoastal = lat > 0 && lng < -117.1 && lat < 32.85;

  if (nearFloodArea) {
    return {
      floodZone: "AE (estimated)",
      floodRisk: "Elevated",
      baseFloodElevation: "Varies — site-specific BFE determination needed",
      developmentRestrictions: "Elevated foundations or flood mitigation may be required. FEMA flood insurance likely required.",
    };
  }

  if (isLowCoastal) {
    return {
      floodZone: "X (Moderate)",
      floodRisk: "Moderate",
      baseFloodElevation: null,
      developmentRestrictions: "Standard construction permitted. Flood insurance may be recommended but not required.",
    };
  }

  return {
    floodZone: "X (Minimal)",
    floodRisk: "Low",
    baseFloodElevation: null,
    developmentRestrictions: "No flood-related development restrictions expected.",
  };
}

// ──────────────────────────────────────────────────────────
// FIRE HAZARD ZONE ANALYSIS
// Uses California wildfire hazard severity zone classifications
// ──────────────────────────────────────────────────────────

function analyzeFireHazard(input: ConstraintInput): FireHazardAnalysis {
  const { formattedAddress, slopePercent } = input;
  const addressLower = formattedAddress.toLowerCase();

  // Known Very High Fire Hazard Severity Zones in San Diego County
  const veryHighFireAreas = [
    "rancho bernardo", "4s ranch", "rancho penasquitos",
    "scripps ranch", "tierrasanta", "san pasqual",
    "ramona", "julian", "alpine", "jamul", "lakeside",
    "harbison canyon", "dehesa", "crest", "flinn springs",
    "eucalyptus hills", "blossom valley", "mount helix",
    "rancho san diego", "dictionary hill",
  ];

  // High Fire Hazard areas
  const highFireAreas = [
    "poway", "san marcos", "escondido", "valley center",
    "fallbrook", "bonsall", "vista", "elfin forest",
    "harmony grove", "san elijo", "olivenhain",
    "del dios", "rancho santa fe",
  ];

  // Moderate fire areas (hillside / semi-rural)
  const moderateFireAreas = [
    "la jolla", "torrey pines", "carmel valley",
    "del mar", "solana beach", "encinitas",
    "carlsbad", "san dieguito",
  ];

  const isVeryHigh = veryHighFireAreas.some((a) => addressLower.includes(a));
  const isHigh = highFireAreas.some((a) => addressLower.includes(a));
  const isModerate = moderateFireAreas.some((a) => addressLower.includes(a));

  // Slope > 15% also increases fire risk
  const slopeElevated = slopePercent > 15;

  if (isVeryHigh || (isHigh && slopeElevated)) {
    return {
      hazardZone: "Very High",
      classification: "Very High Fire Hazard Severity Zone (VHFHSZ)",
      constructionImplications: "Ignition-resistant materials required. Enhanced defensible space (100ft+). Fire-rated roofing, eaves, and vents mandatory. May require fire sprinkler system for ADU.",
    };
  }

  if (isHigh) {
    return {
      hazardZone: "High",
      classification: "High Fire Hazard Severity Zone",
      constructionImplications: "Ignition-resistant materials may be required. Defensible space requirements apply. Fire-rated roofing recommended.",
    };
  }

  if (isModerate || slopeElevated) {
    return {
      hazardZone: "Moderate",
      classification: "Moderate Fire Hazard Severity Zone",
      constructionImplications: "Standard fire safety construction codes apply. Ignition-resistant materials recommended but may not be mandatory.",
    };
  }

  return {
    hazardZone: "None",
    classification: "Non-Fire Hazard Area",
    constructionImplications: "Standard construction codes apply. No additional fire-related requirements.",
  };
}

// ──────────────────────────────────────────────────────────
// TERRAIN AND SLOPE ANALYSIS
// Enhanced from elevation service data with cost implications
// ──────────────────────────────────────────────────────────

function analyzeTerrain(input: ConstraintInput): TerrainAnalysis {
  const { slopePercent } = input;

  if (slopePercent < 2) {
    return {
      averageSlopePercent: slopePercent,
      terrainClassification: "Flat",
      constructionImpact: "Normal construction conditions. Standard foundation design.",
      costMultiplier: 1.0,
    };
  }

  if (slopePercent < 5) {
    return {
      averageSlopePercent: slopePercent,
      terrainClassification: "Gentle",
      constructionImpact: "Minimal grading may be needed. Standard foundation acceptable.",
      costMultiplier: 1.0,
    };
  }

  if (slopePercent < 15) {
    return {
      averageSlopePercent: slopePercent,
      terrainClassification: "Moderate",
      constructionImpact: "Grading and engineered foundation likely required. Stepped or pier foundation design may be recommended.",
      costMultiplier: 1.10, // 10% cost increase
    };
  }

  if (slopePercent < 25) {
    return {
      averageSlopePercent: slopePercent,
      terrainClassification: "Steep",
      constructionImpact: "Specialized foundation design required. Significant grading, retaining walls, and drainage engineering needed.",
      costMultiplier: 1.25, // 25% cost increase
    };
  }

  return {
    averageSlopePercent: slopePercent,
    terrainClassification: "Hillside",
    constructionImpact: "Hillside construction with specialized engineering required. Custom foundation, extensive grading, retaining walls, and drainage systems needed. May require geotechnical report.",
    costMultiplier: 1.40, // 40% cost increase
  };
}

// ──────────────────────────────────────────────────────────
// COASTAL ZONE ANALYSIS
// Determines if property is in a regulated coastal zone
// ──────────────────────────────────────────────────────────

function analyzeCoastalZone(input: ConstraintInput): CoastalZoneAnalysis {
  const { hasCoastalOverlay, formattedAddress, jurisdictionId } = input;
  const addressLower = formattedAddress.toLowerCase();

  // Coastal jurisdictions in San Diego County
  const coastalJurisdictions = [
    "coronado", "del-mar", "solana-beach", "imperial-beach",
    "carlsbad", "encinitas", "oceanside",
  ];

  // Coastal neighborhoods within City of San Diego
  const coastalNeighborhoods = [
    "ocean beach", "pacific beach", "mission beach",
    "la jolla", "point loma", "sunset cliffs",
    "torrey pines", "del mar heights", "carmel valley",
    "bird rock", "windansea",
  ];

  const isCoastalJurisdiction = coastalJurisdictions.includes(jurisdictionId);
  const isCoastalNeighborhood = coastalNeighborhoods.some((n) => addressLower.includes(n));
  const inCoastalZone = hasCoastalOverlay || isCoastalJurisdiction || isCoastalNeighborhood;

  if (inCoastalZone) {
    const approvalLayers: string[] = [
      "Coastal Development Permit (CDP) likely required",
    ];

    if (isCoastalJurisdiction && jurisdictionId !== "san-diego-city") {
      approvalLayers.push("California Coastal Commission review may apply");
    }

    if (addressLower.includes("la jolla") || addressLower.includes("torrey pines")) {
      approvalLayers.push("Community Plan area review may be required");
    }

    return {
      inCoastalZone: true,
      permitRequirement: "Coastal Development Permit likely required. Additional review timelines apply.",
      additionalApprovalLayers: approvalLayers,
    };
  }

  return {
    inCoastalZone: false,
    permitRequirement: "No coastal permit required.",
    additionalApprovalLayers: [],
  };
}

// ──────────────────────────────────────────────────────────
// UTILITY AND EASEMENT DETECTION
// Flags potential easements based on parcel characteristics
// ──────────────────────────────────────────────────────────

function analyzeEasements(input: ConstraintInput): EasementAnalysis {
  const { lotSizeSqFt, formattedAddress } = input;
  const addressLower = formattedAddress.toLowerCase();
  const possibleEasements: { type: string; description: string; confidence: number }[] = [];

  // Standard utility easement — most residential parcels have one
  possibleEasements.push({
    type: "utility",
    description: "Standard utility easement likely present along property boundaries (typically 5-10 ft).",
    confidence: 70,
  });

  // Sewer easement detection
  const sewerKeywords = ["canyon", "creek", "valley", "river", "wash"];
  if (sewerKeywords.some((kw) => addressLower.includes(kw))) {
    possibleEasements.push({
      type: "sewer",
      description: "Possible sewer or drainage easement — property near natural drainage feature.",
      confidence: 50,
    });
  }

  // Access easement on larger lots or flag lots
  if (lotSizeSqFt > 10000) {
    possibleEasements.push({
      type: "access",
      description: "Possible access easement — larger lot may have shared driveway or utility access corridor.",
      confidence: 40,
    });
  }

  // Drainage easement near hillside
  if (input.slopePercent > 10) {
    possibleEasements.push({
      type: "drainage",
      description: "Possible drainage easement — sloped terrain may have runoff management requirements.",
      confidence: 45,
    });
  }

  // Corner lots often have additional easements
  if (addressLower.includes("corner") || addressLower.includes("intersection")) {
    possibleEasements.push({
      type: "utility",
      description: "Corner lot may have additional utility easements along both street frontages.",
      confidence: 55,
    });
  }

  const impactCount = possibleEasements.filter((e) => e.confidence >= 50).length;
  const buildableAreaImpact = impactCount >= 2
    ? "Buildable area may be reduced by multiple easements. Professional survey recommended."
    : impactCount === 1
    ? "Minor buildable area reduction possible. Verification recommended."
    : "Minimal easement impact expected. Standard utility easements assumed.";

  return {
    possibleEasements,
    buildableAreaImpact,
  };
}

// ──────────────────────────────────────────────────────────
// BUILD SITE CONSTRAINTS INTO UNIFIED RESULT
// ──────────────────────────────────────────────────────────

function buildConstraints(
  flood: FloodRiskAnalysis,
  fire: FireHazardAnalysis,
  terrain: TerrainAnalysis,
  coastal: CoastalZoneAnalysis,
  easements: EasementAnalysis,
): SiteConstraint[] {
  const constraints: SiteConstraint[] = [];

  // Flood constraint
  const floodSeverityMap: Record<string, SiteConstraint["severity"]> = {
    None: "none",
    Low: "low",
    Moderate: "moderate",
    Elevated: "high",
    High: "very-high",
  };
  constraints.push({
    category: "flood",
    classification: `Flood Zone: ${flood.floodZone}`,
    severity: floodSeverityMap[flood.floodRisk] || "low",
    constructionImpact: flood.developmentRestrictions,
    recommendation: flood.floodRisk === "Low"
      ? "No action needed."
      : "Obtain FEMA flood determination letter. Consider flood insurance.",
    confidence: flood.floodRisk === "Low" ? 70 : 55,
    source: "FEMA Flood Zone Estimation",
  });

  // Fire constraint
  const fireSeverityMap: Record<string, SiteConstraint["severity"]> = {
    None: "none",
    Moderate: "moderate",
    High: "high",
    "Very High": "very-high",
  };
  constraints.push({
    category: "fire",
    classification: fire.classification,
    severity: fireSeverityMap[fire.hazardZone] || "none",
    constructionImpact: fire.constructionImplications,
    recommendation: fire.hazardZone === "None"
      ? "No additional fire safety measures required."
      : "Plan for ignition-resistant materials and defensible space requirements.",
    confidence: fire.hazardZone === "None" ? 70 : 60,
    source: "CAL FIRE Hazard Severity Zone Estimation",
  });

  // Terrain constraint
  const terrainSeverityMap: Record<string, SiteConstraint["severity"]> = {
    Flat: "none",
    Gentle: "none",
    Moderate: "low",
    Steep: "moderate",
    Hillside: "high",
  };
  constraints.push({
    category: "terrain",
    classification: `${terrain.terrainClassification} (${terrain.averageSlopePercent}% avg slope)`,
    severity: terrainSeverityMap[terrain.terrainClassification] || "none",
    constructionImpact: terrain.constructionImpact,
    recommendation: terrain.terrainClassification === "Flat" || terrain.terrainClassification === "Gentle"
      ? "Standard foundation design acceptable."
      : "Geotechnical report recommended. Budget for engineered foundation.",
    confidence: 72,
    source: "Google Elevation API / Terrain Analysis",
  });

  // Coastal constraint
  constraints.push({
    category: "coastal",
    classification: coastal.inCoastalZone ? "Coastal Zone" : "Non-Coastal",
    severity: coastal.inCoastalZone ? "moderate" : "none",
    constructionImpact: coastal.inCoastalZone
      ? "Additional permitting required. Expect 2-6 months added to approval timeline."
      : "No coastal-related impact.",
    recommendation: coastal.permitRequirement,
    confidence: coastal.inCoastalZone ? 60 : 75,
    source: "California Coastal Commission Zone Estimation",
  });

  // Easement constraint
  const highConfEasements = easements.possibleEasements.filter((e) => e.confidence >= 50);
  constraints.push({
    category: "easement",
    classification: highConfEasements.length > 0
      ? `${highConfEasements.length} possible easement(s) detected`
      : "Standard utility easements assumed",
    severity: highConfEasements.length >= 2 ? "moderate" : highConfEasements.length === 1 ? "low" : "none",
    constructionImpact: easements.buildableAreaImpact,
    recommendation: highConfEasements.length > 0
      ? "Professional title search and property survey recommended to verify easement locations."
      : "No action needed. Standard easements assumed.",
    confidence: 50,
    source: "Parcel Characteristic Analysis",
  });

  return constraints;
}

// ──────────────────────────────────────────────────────────
// OVERALL RISK SCORING
// ──────────────────────────────────────────────────────────

function calculateOverallRisk(constraints: SiteConstraint[]): {
  riskLevel: ConstraintRiskLevel;
  riskScore: number;
  costAdjustmentPercent: number;
  timelineAdjustmentMonths: number;
} {
  const severityScores: Record<SiteConstraint["severity"], number> = {
    "none": 0,
    "low": 10,
    "moderate": 25,
    "high": 45,
    "very-high": 65,
  };

  let totalScore = 0;
  let costAdjustment = 0;
  let timelineAdjustment = 0;

  for (const c of constraints) {
    totalScore += severityScores[c.severity];

    // Cost adjustments by severity
    if (c.severity === "moderate") costAdjustment += 5;
    else if (c.severity === "high") costAdjustment += 12;
    else if (c.severity === "very-high") costAdjustment += 20;

    // Timeline adjustments
    if (c.category === "coastal" && c.severity !== "none") timelineAdjustment += 3;
    if (c.category === "flood" && (c.severity === "high" || c.severity === "very-high")) timelineAdjustment += 2;
    if (c.category === "fire" && c.severity === "very-high") timelineAdjustment += 1;
    if (c.category === "terrain" && (c.severity === "moderate" || c.severity === "high")) timelineAdjustment += 1;
  }

  // Normalize score to 0-100
  const maxPossibleScore = constraints.length * 65;
  const normalizedScore = Math.round((totalScore / maxPossibleScore) * 100);

  const riskLevel: ConstraintRiskLevel =
    normalizedScore >= 40 ? "High" : normalizedScore >= 15 ? "Moderate" : "Low";

  return {
    riskLevel,
    riskScore: normalizedScore,
    costAdjustmentPercent: costAdjustment,
    timelineAdjustmentMonths: timelineAdjustment,
  };
}

// ──────────────────────────────────────────────────────────
// MAIN ENTRY POINT
// ──────────────────────────────────────────────────────────

export function analyzeSiteConstraints(input: ConstraintInput): SiteConstraintResult {
  const floodRisk = analyzeFloodRisk(input);
  const fireHazard = analyzeFireHazard(input);
  const terrain = analyzeTerrain(input);
  const coastalZone = analyzeCoastalZone(input);
  const easements = analyzeEasements(input);

  const constraints = buildConstraints(floodRisk, fireHazard, terrain, coastalZone, easements);
  const risk = calculateOverallRisk(constraints);

  // Generate human-readable summary
  const activeConstraints = constraints.filter((c) => c.severity !== "none");
  const summary = activeConstraints.length === 0
    ? "No significant site constraints detected. Standard construction conditions expected."
    : `${activeConstraints.length} site constraint(s) identified: ${activeConstraints.map((c) => `${c.category} (${c.severity})`).join(", ")}. ${risk.riskLevel} overall constraint risk.`;

  return {
    constraints,
    floodRisk,
    fireHazard,
    terrain,
    coastalZone,
    easements,
    overallRiskLevel: risk.riskLevel,
    overallRiskScore: risk.riskScore,
    costAdjustmentPercent: risk.costAdjustmentPercent,
    timelineAdjustmentMonths: risk.timelineAdjustmentMonths,
    summary,
  };
}

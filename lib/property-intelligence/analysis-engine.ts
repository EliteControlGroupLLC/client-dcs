// Property Intelligence Analysis Engine
// Orchestrates data resolution, elevation lookup, jurisdiction detection,
// Zoneomics enrichment, feasibility analysis, upside detection,
// RentCast-powered financial scenarios, Mapbox visualization, and confidence scoring

import {
  type PropertyAnalysisResult,
  type ADURecommendation,
  type BuildableAnalysis,
  type SmartBannerData,
  type LotDimensions,
  type IntelligenceField,
  getConfidenceStatus,
} from "./types";
import { resolvePropertyData } from "./property-data-resolver";
import { geocodeAddress } from "./geocoding-service";
import {
  getSanDiegoParcel,
  type SanDiegoParcel,
} from "./sandiego-data-service";
import { getZoningForParcel, type CityZoningResult } from "./city-zoning-service";
import {
  getSanDiegoBuildings,
  getSanDiegoAdjacentParcels,
  shareInside,
  type SanDiegoBuildingsResult,
} from "./sandiego-data-service";
import {
  evaluateAduTypeFit,
  estimateStories,
  pickBestAduType,
  GARAGE_SQFT_PER_STALL,
  type AduTypeName,
  type AduTypeVerdict,
  type SiteFacts,
} from "./adu-fit-rules";
import { getElevationData } from "./elevation-service";
import { getOSMPropertyData } from "./osm-service";
import { getAttomPropertyData } from "./attom-service";
import { detectJurisdictionFromAddress, detectOverlays } from "./jurisdictions/detector";
import { COMMON_FINANCIAL_DISCLAIMER } from "./jurisdictions/profiles";
import { evaluateFeasibility } from "./feasibility-engine";
import { detectUpsideOpportunities } from "./upside-detector";
import { generateFinancialScenarios } from "./financial-scenarios";
import { calculateConfidence } from "./confidence-model";
import {
  generateParcelVisualization,
  getStaticMapUrl,
  isMapboxAvailable,
  type ParcelVisualization,
} from "./mapbox-service";
import {
  getZoneomicsData,
  enrichOverlaysFromZoneomics,
  getZoningInterpretation,
  isZoneomicsAvailable,
  type ZoneomicsZoningData,
} from "./zoneomics-service";
import {
  isRentCastAvailable,
  type RentEstimate,
} from "./rentcast-service";
import type { OverlayDetection } from "./jurisdictions/types";
import { runSanityChecks } from "./sanity-check-engine";
import { analyzeSiteConstraints } from "./site-constraint-engine";
import {
  analyzePropertyGeometry,
  runGeometrySanityChecks,
  mergeFootprintSources,
  type GeometryAnalysis,
} from "./geometry-engine";
import type { FinalBuildabilityResult } from "./types";
import { reconcileAllSources } from "./source-reconciliation-engine";
import {
  getMicrosoftBuildingFootprints,
  msFootprintsToOSMFormat,
  type MSFootprintResult,
} from "./microsoft-footprint-service";
import { analyzeLiDARTerrain, type LiDARTerrainResult } from "./lidar-elevation-service";
import {
  runStrictGeometryPipeline,
  summarizeGeometryResult,
  type StrictGeometryResult,
} from "./strict-geometry-pipeline";
import {
  generateUnifiedRecommendation,
  buildUnifiedRentScenarios,
  buildUnifiedFinancialScenarios,
  type UnifiedRecommendation,
} from "./unified-recommendation-engine";
import {
  estimateAduPriceRange,
  formatPriceRange,
} from "../data/site-data";

export async function analyzeProperty(address: string): Promise<PropertyAnalysisResult> {
  // Step 1: Geocode the address (Google Places API)
  const geocoded = await geocodeAddress(address);
  if (!geocoded) {
    console.error(`[PROVIDER-ERROR] Google Places: geocoding failed for address "${address}"`);
  }

  // Step 2: Get ATTOM data, elevation/slope data, OSM data, Zoneomics data, AND Microsoft footprints in parallel
  let slopeData: { slope: string; confidence: number; sources: string[] } | undefined;
  let osmData: Awaited<ReturnType<typeof getOSMPropertyData>> | undefined;
  let zoneomicsData: ZoneomicsZoningData | undefined;
  let msFootprints: MSFootprintResult | undefined;
  let lidarTerrain: LiDARTerrainResult | undefined;
  const attomData = await getAttomPropertyData(address);
  if (!attomData.available) {
    console.error(`[PROVIDER-ERROR] ATTOM Property: no data returned for address "${address}"`);
  }

  if (geocoded) {
    const [slope, osm, zoneomics, msBuildings] = await Promise.all([
      getElevationData(geocoded.lat, geocoded.lng),
      getOSMPropertyData(geocoded.lat, geocoded.lng),
      getZoneomicsData(geocoded.lat, geocoded.lng),
      getMicrosoftBuildingFootprints(geocoded.lat, geocoded.lng).catch((err) => {
        console.error(`[PROVIDER-ERROR] Microsoft Building Footprints: ${err}`);
        return undefined;
      }),
    ]);
    slopeData = slope;
    osmData = osm;
    zoneomicsData = zoneomics;
    msFootprints = msBuildings;

    if (!zoneomics.available) {
      console.error(`[PROVIDER-ERROR] Zoneomics: no zoning data returned for (${geocoded.lat}, ${geocoded.lng})`);
    }
    if (msFootprints?.available) {
      console.log(
        `[MS-FOOTPRINTS] Found ${msFootprints.buildings.length} buildings, total ${msFootprints.totalFootprintSqFt} sq ft`
      );
    }
  }

  // Real San Diego parcel + zoning from free government GIS (SANDAG parcels +
  // City of San Diego DSD zoning). This is the accurate core that replaces
  // the old address-seeded fabrication for the headline facts.
  let sdParcel: SanDiegoParcel | undefined;
  let cityZoning: CityZoningResult | undefined;
  if (geocoded) {
    sdParcel = await getSanDiegoParcel(geocoded.lat, geocoded.lng, address, geocoded.components.route);
    // Zoning from the parcel's OWN jurisdiction (SANDAG situs_juris), never
    // City-of-San-Diego codes for another city. available:false if unknown.
    cityZoning = await getZoningForParcel(geocoded.lat, geocoded.lng, sdParcel?.jurisdiction ?? null);
  }

  // Step 2b: REAL site geometry — SANDAG building outlines on the real
  // parcel polygon (county-wide, free) + adjacent parcels (to find the
  // street frontage). These are authoritative over OSM/Microsoft/estimates.
  let sdBuildings: SanDiegoBuildingsResult | undefined;
  let sdAdjacentRings: number[][][][] | undefined;
  if (sdParcel?.available && sdParcel.parcelRings) {
    const [bldgs, adjacent] = await Promise.all([
      getSanDiegoBuildings(sdParcel.parcelRings),
      getSanDiegoAdjacentParcels(sdParcel.parcelRings, sdParcel.apn),
    ]);
    sdBuildings = bldgs;
    sdAdjacentRings = adjacent.available ? adjacent.rings : undefined;
    if (!bldgs.available) {
      console.error(`[PROVIDER-ERROR] SANDAG Building Outlines: query failed for APN ${sdParcel.apn}`);
    } else {
      console.log(
        `[SANDAG-BUILDINGS] ${bldgs.buildings.length} building(s) on parcel (${bldgs.totalFootprintSqFt} sq ft), ${bldgs.excludedCount} neighbor outline(s) excluded`
      );
    }
  }

  // Step 3: Resolve property data from all sources (ATTOM + OSM + estimates)
  const resolved = resolvePropertyData(address, geocoded?.formattedAddress, slopeData, osmData, attomData, {
    situsJuris: sdParcel?.jurisdiction ?? null,
    geocodeProvider: geocoded?.provider,
  });

  const { intelligence } = resolved;
  let { rawLotSizeSqFt, rawFootprintSqFt } = resolved;

  // Step 3-REAL: Override the fabricated/estimated headline facts with REAL
  // San Diego records where we have them. Honest source labels + high
  // confidence. If SD data is unavailable, the resolver's values stand
  // (and confidence stays low), never fabricated as "verified".
  const realField = <T,>(value: T, confidence: number, source: string): IntelligenceField<T> => ({
    value,
    confidence,
    status: getConfidenceStatus(confidence),
    sources: [source],
  });
  if (sdParcel?.available) {
    const exact = sdParcel.matchQuality === "exact-address";
    if (sdParcel.lotSizeSqFt && sdParcel.lotSizeSqFt > 0) {
      intelligence.lotSizeSqFt = realField(sdParcel.lotSizeSqFt, exact ? 95 : 80, "San Diego County Assessor (SanGIS)");
      rawLotSizeSqFt = sdParcel.lotSizeSqFt;
    }
    if (sdParcel.livingAreaSqFt && sdParcel.livingAreaSqFt > 0) {
      intelligence.homeAreaSqFt = realField(sdParcel.livingAreaSqFt, exact ? 92 : 78, "San Diego County Assessor");
    }
    if (sdParcel.apn) {
      intelligence.apn = realField(sdParcel.apn, 96, "San Diego County Assessor");
    }
  }
  if (cityZoning) {
    intelligence.zoning = cityZoning.available && cityZoning.zoneCode
      ? {
          ...realField(
            cityZoning.zoneDescription ? `${cityZoning.zoneCode} (${cityZoning.zoneDescription})` : cityZoning.zoneCode,
            cityZoning.match === "point" ? 92 : 80,
            cityZoning.source
          ),
          sources: [cityZoning.source, ...(cityZoning.sourceUrl ? [cityZoning.sourceUrl] : [])],
        }
      : realField("Not available", 0, cityZoning.reason ? `${cityZoning.source} — ${cityZoning.reason}` : cityZoning.source);
  }

  // Step 3b: Run sanity checks before proceeding
  const sanityResult = runSanityChecks({
    lotSizeSqFt: rawLotSizeSqFt,
    footprintSqFt: rawFootprintSqFt,
    homeAreaSqFt: intelligence.homeAreaSqFt.value,
    openYardSqFt: intelligence.openYardSqFt.value,
    lotWidth: 0, // computed later
    lotDepth: 0,
    zoning: intelligence.zoning.value,
    slope: intelligence.slope.value,
    parcelShape: intelligence.parcelShape.value,
    hasAttomData: attomData?.available === true,
    hasOsmData: osmData?.parcel !== null && osmData?.parcel !== undefined,
    hasGeocoded: Boolean(geocoded),
  });

  // Apply sanity adjustments
  for (const adj of sanityResult.adjustments) {
    if (adj.field === "footprintSqFt") {
      rawFootprintSqFt = adj.adjustedValue;
      console.warn(
        `[SANITY-CHECK] Adjusted footprint: ${adj.originalValue} -> ${adj.adjustedValue} (${adj.reason})`
      );
    }
  }

  if (!sanityResult.passed) {
    const failures = sanityResult.checks.filter((c) => !c.passed && c.severity === "error");
    for (const f of failures) {
      console.warn(`[SANITY-CHECK] FAILED: ${f.name} — ${f.message}`);
    }
  }

  // Step 3c: Multi-structure detection from OSM data
  const detectedStructures: { type: string; areaSqFt: number; confidence: number }[] = [];
  if (osmData?.parcel && osmData.parcel.buildings.length > 0) {
    const sorted = [...osmData.parcel.buildings].sort((a, b) => b.areaSqFt - a.areaSqFt);
    for (let i = 0; i < sorted.length; i++) {
      const b = sorted[i];
      let structureType = "accessory structure";
      if (i === 0) {
        structureType = "main residence";
      } else if (b.buildingType === "garage" || (b.areaSqFt >= 200 && b.areaSqFt <= 500)) {
        structureType = "detached garage";
      } else if (b.buildingType === "yes" && b.areaSqFt >= 400 && b.areaSqFt <= 1200) {
        structureType = "possible detached ADU";
      }
      detectedStructures.push({
        type: structureType,
        areaSqFt: b.areaSqFt,
        confidence: i === 0 ? 80 : 60,
      });
    }
  }

  // Step 3d declaration — geometry analysis runs after jurisdiction profile is loaded (Step 4)
  let geometryAnalysis: GeometryAnalysis | null = null;

  // Step 4: Detect jurisdiction
  const formattedAddress = geocoded?.formattedAddress || address;
  const jurisdictionResult = detectJurisdictionFromAddress(formattedAddress, sdParcel?.jurisdiction ?? null);
  const profile = jurisdictionResult.profile;

  // Step 3d (cont.): v7 — Polygon-based geometry analysis
  // Runs after jurisdiction profile is loaded so we can use real setback values.
  // SURGICAL FIX: Intelligent merge of OSM + Microsoft footprints (not OSM-only blocker)
  let footprintMergeNotes: string[] = [];
  // Real parcel polygon (SANDAG/SanGIS) — authoritative when present.
  const realParcelRings = sdParcel?.available && sdParcel.parcelRings ? sdParcel.parcelRings : null;
  const sdMainBuilding = sdBuildings?.buildings[0] ?? null;
  const sdSecondaryBuildings = sdBuildings?.buildings.slice(1) ?? [];
  // Garage: the assessor gives stall count; if a separate outline on the lot
  // is garage-sized we treat the garage as detached, otherwise it's inside
  // the main outline (attached) — which matters for the stories estimate.
  const assessorStalls = sdParcel?.available ? sdParcel.garageStalls ?? 0 : null;
  const detachedGarageOutline =
    assessorStalls && assessorStalls > 0
      ? sdSecondaryBuildings.find(
          (b) => b.areaSqFt >= assessorStalls * GARAGE_SQFT_PER_STALL * 0.6 && b.areaSqFt <= assessorStalls * GARAGE_SQFT_PER_STALL * 1.8
        ) ?? null
      : null;
  const garageAttached: boolean | null = assessorStalls && assessorStalls > 0 ? !detachedGarageOutline : null;
  const storiesInfo = estimateStories(
    sdParcel?.livingAreaSqFt ?? null,
    sdMainBuilding?.areaSqFt ?? null,
    assessorStalls,
    garageAttached
  );
  try {
    const rawOsmBuildings = (osmData?.parcel?.buildings || []).map((b) => ({
      areaSqFt: b.areaSqFt,
      buildingType: b.buildingType,
      nodes: b.nodes,
      levels: b.levels,
    }));

    const rawMsBuildings = msFootprints?.available ? msFootprintsToOSMFormat(msFootprints.buildings) : [];

    // Intelligent merge: both sources contribute, best polygons selected
    const mergedFootprints = mergeFootprintSources(rawOsmBuildings, rawMsBuildings, rawLotSizeSqFt);
    // With a real parcel, keep only OSM/Microsoft buildings mostly inside it
    // (a neighbor's house must never count as this owner's footprint).
    const osmBuildings = realParcelRings
      ? mergedFootprints.buildings.filter(
          (b) => b.nodes.length >= 3 && shareInside([b.nodes.map((n) => [n.lon, n.lat])], realParcelRings) >= 0.5
        )
      : mergedFootprints.buildings;
    footprintMergeNotes = mergedFootprints.mergeNotes;
    console.log(
      `[FOOTPRINT-MERGE] Source: ${mergedFootprints.source}, buildings: ${osmBuildings.length}, notes: ${mergedFootprints.mergeNotes.join(
        "; "
      )}`
    );

    geometryAnalysis = analyzePropertyGeometry({
      lat: geocoded?.lat || 0,
      lng: geocoded?.lng || 0,
      attomLotSizeSqFt: attomData?.lotSizeSqFt || null,
      attomLotWidth: attomData?.lotWidth || null,
      attomLotDepth: attomData?.lotDepth || null,
      attomFootprintSqFt: attomData?.footprintSqFt || null,
      attomLivingAreaSqFt: attomData?.homeAreaSqFt || sdParcel?.livingAreaSqFt || null,
      attomStories: attomData?.stories || null,
      osmBuildings,
      osmBoundingBox: osmData?.boundingBox || null,
      frontSetbackFt: 15,
      rearSetbackFt: profile.setbacks.rearSetbackFt,
      sideSetbackFt: profile.setbacks.sideSetbackFt,
      separationFt: profile.separation.minDistanceFromPrimaryHomeFt,
      realParcel: realParcelRings
        ? {
            polygon: { type: "Polygon", coordinates: realParcelRings },
            areaSqFt: sdParcel?.lotSizeSqFt || 0,
            source: "San Diego County parcel (SANDAG/SanGIS)",
            adjacentParcelRings: sdAdjacentRings,
          }
        : null,
      authoritativeBuildings:
        sdBuildings?.available && sdBuildings.buildings.length > 0
          ? {
              source: sdBuildings.source,
              buildings: sdBuildings.buildings.map((b) => ({
                areaSqFt: b.areaSqFt,
                nodes: b.nodes,
                buildingType: detachedGarageOutline === b ? "garage" : undefined,
              })),
            }
          : null,
      storiesEstimate: storiesInfo.stories,
    });

    const geoSanity = runGeometrySanityChecks(geometryAnalysis, attomData?.homeAreaSqFt || intelligence.homeAreaSqFt.value);

    (geometryAnalysis as GeometryAnalysis & { sanityChecks?: typeof geoSanity }).sanityChecks = geoSanity;

    if (geometryAnalysis.areaSummary.mainFootprintSqFt > 0 && geometryAnalysis.geometryConfidence > 60) {
      rawFootprintSqFt = geometryAnalysis.areaSummary.mainFootprintSqFt;
    }
    if (geometryAnalysis.areaSummary.parcelSqFt > 0 && geometryAnalysis.geometryConfidence > 60) {
      rawLotSizeSqFt = geometryAnalysis.areaSummary.parcelSqFt;
    }

    console.log(
      `[GEOMETRY-ENGINE] Status: ${geometryAnalysis.geometryStatus}, confidence: ${geometryAnalysis.geometryConfidence}%, structures: ${geometryAnalysis.structures.length}`
    );
  } catch (err) {
    console.error("[GEOMETRY-ENGINE] Failed to run geometry analysis:", err);
  }

  // Step 3e: Real footprint + open yard from SANDAG outlines on the real
  // parcel (replaces "estimated from zone averages"). Open yard = lot − all
  // building footprints, so it can never exceed the lot.
  // Parcel identity: the assessor situs matches the house number, or (when
  // the county has no situs for this number) the geocoded point lies inside
  // the parcel. A merely "nearest" parcel is never treated as verified.
  const exactParcelMatch = sdParcel?.matchQuality === "exact-address" || sdParcel?.geocodeInParcel === true;
  const geometryVerified = Boolean(
    geometryAnalysis?.parcelIsReal &&
      geometryAnalysis.footprintIsReal &&
      geometryAnalysis.geometryStatus === "polygon-verified" &&
      sdBuildings?.available &&
      (sdBuildings.buildings.length ?? 0) > 0 &&
      exactParcelMatch
  );
  if (geometryAnalysis?.parcelIsReal && geometryAnalysis.footprintIsReal && sdBuildings?.buildings.length) {
    const conf = exactParcelMatch ? 92 : 78;
    const summary = geometryAnalysis.areaSummary;
    intelligence.footprintSqFt = {
      ...realField(summary.mainFootprintSqFt, conf, "SANDAG Building Outlines (traced footprint, incl. attached garage)"),
      displayValue:
        sdBuildings.buildings.length > 1
          ? `${summary.mainFootprintSqFt.toLocaleString()} sq ft main building (+${(summary.totalStructureFootprintSqFt - summary.mainFootprintSqFt).toLocaleString()} sq ft other structures)`
          : undefined,
    };
    const yard = summary.openYardSqFt ?? Math.max(0, summary.parcelSqFt - summary.totalStructureFootprintSqFt);
    intelligence.openYardSqFt = realField(
      yard,
      conf - 4,
      "County parcel area minus SANDAG building outlines (includes driveway/hardscape)"
    );
    rawFootprintSqFt = summary.mainFootprintSqFt;
  }
  // A parcel that is merely the NEAREST to the address point is real
  // geometry, but not verified to be THIS property — never label it so.
  if (geometryAnalysis?.parcelIsReal && !exactParcelMatch && geometryAnalysis.geometryStatus === "polygon-verified") {
    geometryAnalysis.geometryStatus = "polygon-estimated";
    geometryAnalysis.geometryConfidence = Math.min(geometryAnalysis.geometryConfidence, 60);
    geometryAnalysis.parcelSource = `${geometryAnalysis.parcelSource} — nearest parcel to the address point (house number not on County record)`;
  }

  // Step 4a.5: LiDAR / Enhanced Terrain Analysis
  // Runs after geometry analysis to use real lot dimensions when available
  if (geocoded) {
    try {
      const estLotWidth = attomData?.lotWidth || Math.round(Math.sqrt(rawLotSizeSqFt * 0.5));
      const estLotDepth = attomData?.lotDepth || Math.round(rawLotSizeSqFt / estLotWidth);
      const estAduFootprint = geometryAnalysis?.bestAduZone?.areaSqFt || 800;
      lidarTerrain = await analyzeLiDARTerrain(geocoded.lat, geocoded.lng, estLotWidth, estLotDepth, estAduFootprint);
      if (lidarTerrain.lidarAvailable) {
        console.log(
          `[LIDAR-TERRAIN] LiDAR data available, ${lidarTerrain.terrainProfile.sampleCount} samples, slope: ${lidarTerrain.slopeAnalysis.averageSlopePercent}%`
        );
      }
    } catch (err) {
      console.error("[LIDAR-TERRAIN] Failed to run LiDAR terrain analysis:", err);
    }
  }

  // Step 4b: v8 — Run Strict Geometry Pipeline
  // This is the single-source-of-truth for site diagram rendering.
  // Tries Regrid for parcel boundaries + Microsoft Building Footprints for structures.
  // Falls back to existing polygon engine data when Regrid is unavailable.
  let strictGeometry: StrictGeometryResult | undefined;
  if (geocoded) {
    try {
      // Pass existing polygon engine data as fallback so the strict pipeline
      // can render the site diagram even without a Regrid API key.
      const knownParcelPolygon = geometryAnalysis?.parcelPolygon || undefined;
      const knownBuildingPolygon = geometryAnalysis?.mainStructure?.polygon || undefined;

      strictGeometry = await runStrictGeometryPipeline({
        lat: geocoded.lat,
        lng: geocoded.lng,
        knownParcelPolygon,
        knownBuildingPolygon,
      });

      console.log(`[STRICT-GEOMETRY] ${summarizeGeometryResult(strictGeometry).replace(/\n/g, " | ")}`);

      // Update metrics from strict geometry if verified
      if (strictGeometry.status === "geometry-verified" && strictGeometry.metrics) {
        if (strictGeometry.parcelAreaSqFt && strictGeometry.confidence > 80) {
          // Only override if strict geometry is highly confident
          console.log(`[STRICT-GEOMETRY] Overriding lot size: ${rawLotSizeSqFt} -> ${strictGeometry.parcelAreaSqFt}`);
        }
      }
    } catch (err) {
      console.error("[STRICT-GEOMETRY] Pipeline failed:", err);
    }
  }

  // Step 4b.1: With verified SANDAG geometry, the site diagram must show the
  // SAME buildable zone the verdicts use (the strict pipeline's own envelope
  // assumes a north-facing rear yard and doesn't subtract the house).
  if (strictGeometry && geometryAnalysis && geometryAnalysis.parcelIsReal && geometryAnalysis.footprintIsReal) {
    strictGeometry.parcelSource = geometryAnalysis.parcelSource;
    strictGeometry.buildingSource = geometryAnalysis.footprintSource;
    const y = geometryAnalysis.measuredYards;
    if (strictGeometry.metrics && y) {
      strictGeometry.metrics.frontYardDepthFt = y.frontFt;
      strictGeometry.metrics.rearYardDepthFt = y.rearFt;
      strictGeometry.metrics.leftSideYardFt = y.leftFt;
      strictGeometry.metrics.rightSideYardFt = y.rightFt;
      strictGeometry.metrics.openYardAreaSqFt = geometryAnalysis.areaSummary.openYardSqFt ?? strictGeometry.metrics.openYardAreaSqFt;
      if (geometryAnalysis.orientedLotDims) {
        strictGeometry.metrics.parcelWidthFt = geometryAnalysis.orientedLotDims.widthFt;
        strictGeometry.metrics.parcelDepthFt = geometryAnalysis.orientedLotDims.depthFt;
      }
    }
    if (strictGeometry.buildableEnvelope) {
      const z = geometryAnalysis.bestAduZone;
      strictGeometry.buildableEnvelope.buildablePolygon = z ? z.polygon : null;
      strictGeometry.buildableEnvelope.buildableAreaSqFt = z ? z.areaSqFt : 0;
      strictGeometry.buildableEnvelope.bestZone =
        z && (z.position === "rear" || z.position === "left-side" || z.position === "right-side") ? z.position : "none";
      strictGeometry.buildableEnvelope.constraints = z
        ? [`Largest detached footprint after setbacks: ${z.minWidthFt} x ${z.minDepthFt} ft`]
        : ["No detached ADU footprint fits after required setbacks and separation"];
    }
  }

  // Step 4c: Slope percent extraction for constraint analysis
  const slopeStr = intelligence.slope.value;
  let slopePercent: number = 0;
  // Use LiDAR slope data if available (higher resolution than Google Elevation basic)
  if (lidarTerrain && lidarTerrain.confidence > 50) {
    slopePercent = lidarTerrain.slopeAnalysis.averageSlopePercent;
  } else if (slopeStr === "Steep slope" || slopeStr === "Steep") slopePercent = 20;
  else if (slopeStr === "Moderate slope" || slopeStr === "Moderate") slopePercent = 10;
  else if (slopeStr === "Mostly flat") slopePercent = 3;
  else if (slopeStr === "Flat") slopePercent = 1;

  // Step 4c: Site Constraint Intelligence Layer
  // Runs after zoning determination and before buildable-area calculations
  const hasCoastalOverlay = false; // will be updated after overlay detection
  const siteConstraints = analyzeSiteConstraints({
    lat: geocoded?.lat || 0,
    lng: geocoded?.lng || 0,
    slopeCategory: slopeStr,
    slopePercent,
    jurisdictionId: jurisdictionResult.jurisdictionId,
    formattedAddress,
    lotSizeSqFt: rawLotSizeSqFt,
    zoning: intelligence.zoning.value,
    hasCoastalOverlay,
    hasHillsideOverlay: slopePercent > 15,
    overlayTypes: [],
  });

  // Step 5: Calculate buildable area
  // SURGICAL FIX: Rectangle method is retained ONLY as debug fallback.
  // The polygon engine is the single source of truth for all user-facing buildable area.
  const jSetback = Math.min(profile.setbacks.sideSetbackFt, profile.setbacks.rearSetbackFt);
  const jSeparation = profile.separation.minDistanceFromPrimaryHomeFt;
  const rectangleFallback = calculateBuildableArea(rawLotSizeSqFt, rawFootprintSqFt, jSetback, jSeparation);

  // SURGICAL FIX: Build FinalBuildabilityResult — single source of truth
  const finalBuildability = buildFinalBuildabilityResult(geometryAnalysis, rectangleFallback, rawLotSizeSqFt);

  // Step 5b: Real site facts → ADU-type verdicts (single source of truth for
  // cards, feasibility list, best recommendation, banner and financials).
  const bestDetachedZone = geometryAnalysis?.bestAduZone ?? null;
  const siteFacts: SiteFacts = {
    stories: storiesInfo.stories,
    storiesMethod:
      storiesInfo.ratio != null
        ? `(assessor living area ${sdParcel?.livingAreaSqFt?.toLocaleString()} sq ft${garageAttached && assessorStalls ? ` + ${assessorStalls}-car attached garage ≈ ${(assessorStalls * GARAGE_SQFT_PER_STALL).toLocaleString()} sq ft` : ""}) ÷ building footprint ${sdMainBuilding?.areaSqFt.toLocaleString()} sq ft = ${storiesInfo.ratio}`
        : "Unavailable — needs assessor living area and a real building outline",
    garageStalls: sdParcel?.available ? assessorStalls : null,
    garageConverted: sdParcel?.hasGarageConversion === true,
    garageAttached,
    garageSqFtEstimate: detachedGarageOutline
      ? detachedGarageOutline.areaSqFt
      : assessorStalls && assessorStalls > 0
        ? assessorStalls * GARAGE_SQFT_PER_STALL
        : null,
    livingAreaSqFt: sdParcel?.livingAreaSqFt ?? null,
    lotSizeSqFt: sdParcel?.lotSizeSqFt ?? null,
    mainFootprintSqFt: sdMainBuilding?.areaSqFt ?? null,
    totalFootprintSqFt: sdBuildings?.available ? sdBuildings.totalFootprintSqFt : null,
    buildingCount: sdBuildings?.available ? sdBuildings.buildings.length : null,
    openYardSqFt: geometryAnalysis?.parcelIsReal && geometryAnalysis.footprintIsReal
      ? geometryAnalysis.areaSummary.openYardSqFt ?? null
      : null,
    geometryVerified,
    geometrySource: geometryAnalysis
      ? `${geometryAnalysis.parcelSource}; ${geometryAnalysis.footprintSource}`
      : "Unavailable",
    detachedZone:
      geometryVerified && bestDetachedZone
        ? {
            areaSqFt: bestDetachedZone.areaSqFt,
            widthFt: bestDetachedZone.minWidthFt,
            depthFt: bestDetachedZone.minDepthFt,
            position: bestDetachedZone.position,
            contiguousAreaSqFt: bestDetachedZone.contiguousAreaSqFt ?? null,
          }
        : null,
    attachedFit: geometryAnalysis?.attachedFit
      ? {
          areaSqFt: geometryAnalysis.attachedFit.areaSqFt,
          widthFt: geometryAnalysis.attachedFit.widthFt,
          depthFt: geometryAnalysis.attachedFit.depthFt,
        }
      : null,
    measuredYards: geometryAnalysis?.measuredYards ?? null,
    setbacksUsed: {
      sideRearFt: Math.max(profile.setbacks.sideSetbackFt, profile.setbacks.rearSetbackFt),
      frontFt: 15,
      separationFt: profile.separation.minDistanceFromPrimaryHomeFt,
    },
    frontEdgeMethod: geometryAnalysis?.frontEdgeMethod,
    parcelMatch: !sdParcel?.available
      ? "none"
      : sdParcel.matchQuality === "exact-address"
        ? "exact-address"
        : sdParcel.geocodeInParcel
          ? "address-point"
          : "nearest",
    sources: [
      ...(sdParcel?.available ? ["San Diego County Assessor (SANDAG parcels)"] : []),
      ...(realParcelRings ? ["SANDAG/SanGIS parcel polygon"] : []),
      ...(sdBuildings?.buildings.length ? ["SANDAG Building Outlines"] : []),
    ],
  };
  const aduVerdicts = evaluateAduTypeFit(siteFacts, profile);
  if (!geometryVerified) {
    finalBuildability.warnings.push(
      "Real parcel/building geometry could not be verified for this address — detached ADU size requires a manual site review."
    );
  } else if (sdParcel?.matchQuality !== "exact-address") {
    finalBuildability.warnings.push(
      `County records have no situs for this house number; analyzed the parcel containing the address point (APN ${sdParcel?.apn}, situs ${sdParcel?.situsAddress ?? "n/a"}).`
    );
  }

  // GEOMETRY ASSERTION: If polygon geometry exists with valid zones,
  // user-facing buildable area MUST come from polygon, not rectangle.
  if (geometryAnalysis && geometryAnalysis.leftoverZones.length > 0 && finalBuildability.geometryMethodUsed === "rectangle-fallback") {
    console.error(
      "[GEOMETRY-ASSERTION] BUG: Polygon geometry available with valid zones but rectangle fallback was used. This should not happen."
    );
  }

  // The buildable object used downstream — driven by polygon when available
  const allowanceCapSqFt = parseAduAllowanceCap(intelligence.aduAllowances.value) ?? profile.sizeRules.detachedAduMaxSqft;
  const effectiveAduCapSqFt = Math.min(finalBuildability.totalBuildableAreaSqFt, allowanceCapSqFt);

  const detachedVerdict = aduVerdicts["Detached ADU"];
  const buildable: BuildableAnalysis = geometryVerified
    ? {
        requiredMainHomeSeparationFt: rectangleFallback.requiredMainHomeSeparationFt,
        requiredPropertyLineSetbackFt: rectangleFallback.requiredPropertyLineSetbackFt,
        estimatedBuildableEnvelopeSqFt: detachedVerdict.maxSqFt,
        envelopeLabel: detachedVerdict.maxSqFt > 0 ? undefined : "None after required setbacks",
        oneStoryPotential:
          detachedVerdict.maxSqFt > 0
            ? `Detached footprint up to ${detachedVerdict.maxSqFt.toLocaleString()} sq ft fits after setbacks`
            : "Not recommended — no detached footprint fits after required setbacks",
        twoStoryPotential:
          detachedVerdict.maxSqFt > 0 && profile.height.twoStoryAllowed
            ? `Two-story detached up to ${Math.min(profile.sizeRules.detachedAduMaxSqft, detachedVerdict.maxSqFt * 2).toLocaleString()} sq ft with city review`
            : "Not recommended — no detached footprint fits after required setbacks",
      }
    : {
        requiredMainHomeSeparationFt: rectangleFallback.requiredMainHomeSeparationFt,
        requiredPropertyLineSetbackFt: rectangleFallback.requiredPropertyLineSetbackFt,
        estimatedBuildableEnvelopeSqFt: effectiveAduCapSqFt,
        envelopeLabel: "Site review needed",
        oneStoryPotential: "Site review needed — real yard geometry unverified",
        twoStoryPotential: "Site review needed — real yard geometry unverified",
      };

  // Step 6: Detect overlays (base detection + Zoneomics enrichment)
  const baseOverlays = detectOverlays(formattedAddress, jurisdictionResult.jurisdictionId, slopePercent);

  // Enrich overlays with Zoneomics data
  let overlays = baseOverlays;
  if (zoneomicsData?.available) {
    const zEnrichment = enrichOverlaysFromZoneomics(zoneomicsData);
    const additionalOverlays: OverlayDetection[] = [];

    if (zEnrichment.designReview && !overlays.some((o) => o.type === "design-review")) {
      additionalOverlays.push({
        type: "design-review",
        name: "Design Review Overlay",
        detected: true,
        confidence: 70,
        notes: "Zoneomics indicates this property is in a design review area.",
      });
    }
    if (zEnrichment.historicDistrict && !overlays.some((o) => o.type === "historic")) {
      additionalOverlays.push({
        type: "historic",
        name: "Historic District",
        detected: true,
        confidence: 65,
        notes: "Zoneomics indicates this property may be in a historic district.",
      });
    }
    if (zEnrichment.coastalZone && !overlays.some((o) => o.type === "coastal")) {
      additionalOverlays.push({
        type: "coastal",
        name: "Coastal Zone",
        detected: true,
        confidence: 65,
        notes: "Zoneomics indicates this property may be in the Coastal Zone.",
      });
    }

    overlays = [...baseOverlays, ...additionalOverlays];
  }

  // Step 7: Enhanced feasibility analysis
  // Real frontage-aligned lot dimensions when the SANDAG parcel is known.
  const lotWidth = geometryAnalysis?.orientedLotDims?.widthFt || Math.round(Math.sqrt(rawLotSizeSqFt * 0.5));
  const lotDepth = geometryAnalysis?.orientedLotDims?.depthFt || Math.round(rawLotSizeSqFt / lotWidth);
  const openYard = intelligence.openYardSqFt.value;
  const zoning = intelligence.zoning.value;
  const homeArea = intelligence.homeAreaSqFt.value;
  const parcelShape = intelligence.parcelShape.value;

  const enhancedFeasibility = evaluateFeasibility(
    {
      lotSizeSqFt: rawLotSizeSqFt,
      footprintSqFt: rawFootprintSqFt,
      homeAreaSqFt: homeArea,
      openYardSqFt: openYard,
      lotWidth,
      lotDepth,
      slope: slopeStr,
      parcelShape,
      cornerLot: false,
      hasGarage: (sdParcel?.garageStalls ?? 0) > 0 || sdParcel?.hasGarageConversion === true || rawFootprintSqFt > 800,
      yearBuilt: attomData?.yearBuilt || null,
      zoning,
      overlays: overlays.filter((o) => o.detected).map((o) => o.type),
    },
    profile,
    aduVerdicts
  );

  // Step 8: Detect upside opportunities
  const upsideOpportunities = detectUpsideOpportunities(
    {
      lotSizeSqFt: rawLotSizeSqFt,
      footprintSqFt: rawFootprintSqFt,
      homeAreaSqFt: homeArea,
      openYardSqFt: openYard,
      lotWidth,
      lotDepth,
      zoning,
      hasGarage: (sdParcel?.garageStalls ?? 0) > 0 || sdParcel?.hasGarageConversion === true || rawFootprintSqFt > 800,
      feasibilityResults: enhancedFeasibility,
    },
    profile
  );

  // Step 9: Generate recommendations FIRST to determine primary recommendation
  // This ensures all downstream outputs derive from the same recommendation
  let recommendations = generateRecommendations(aduVerdicts);
  let bestRec: string = pickBestAduType(aduVerdicts);
  const bestVerdict: AduTypeVerdict = aduVerdicts[bestRec as AduTypeName];

  // Step 9b: Generate UNIFIED recommendation that drives rent and financial scenarios
  // This is the single source of truth for the entire page
  const zipCode = geocoded?.components.zip || "92115";
  let unifiedRecommendation: UnifiedRecommendation | undefined;

  try {
    unifiedRecommendation = await generateUnifiedRecommendation({
      address: formattedAddress,
      zipCode,
      lotSizeSqFt: rawLotSizeSqFt,
      openYardSqFt: openYard,
      buildableEnvelopeSqFt: bestVerdict.maxSqFt > 0 ? bestVerdict.maxSqFt : Math.min(600, effectiveAduCapSqFt || 600),
      hasGarage: (sdParcel?.garageStalls ?? 0) > 0 || sdParcel?.hasGarageConversion === true || rawFootprintSqFt > 800,
      feasibilityResults: enhancedFeasibility,
      bestRecommendationType: bestRec,
      maxAllowedSqFt:
        bestRec === "Detached ADU" ? allowanceCapSqFt : bestVerdict.maxSqFt > 0 ? bestVerdict.maxSqFt : allowanceCapSqFt,
      jaduMaxSqFt: profile.sizeRules.jaduMaxSqft,
      // Never model a unit bigger than what really fits; unverified sites are
      // modeled conservatively (≤ 600 sq ft) pending a site review.
      hardSizeCapSqFt: bestVerdict.maxSqFt > 0 ? bestVerdict.maxSqFt : 600,
      contextNote: buildBestContextNote(bestRec as AduTypeName, aduVerdicts, siteFacts),
    });
  } catch (err) {
    console.error("[UNIFIED-RECOMMENDATION] Failed to generate unified recommendation:", err);
  }

  if (unifiedRecommendation) {
    bestRec = unifiedRecommendation.primaryType;
    recommendations = synchronizeRecommendations(recommendations, unifiedRecommendation, aduVerdicts);
  }

  // Step 9c: Build rent estimates map from unified recommendation (for backward compatibility)
  // This ensures rentData aligns with the primary recommendation
  let rentEstimates: Map<string, RentEstimate> | undefined;
  if (unifiedRecommendation) {
    rentEstimates = new Map();
    rentEstimates.set(unifiedRecommendation.primaryType, {
      estimatedMonthlyRent: unifiedRecommendation.primaryRentEstimate.monthlyRent,
      estimatedAnnualRent: unifiedRecommendation.primaryRentEstimate.annualRent,
      rentRangeLow: unifiedRecommendation.primaryRentEstimate.rentRangeLow,
      rentRangeHigh: unifiedRecommendation.primaryRentEstimate.rentRangeHigh,
      pricePerSqft: unifiedRecommendation.primaryRentEstimate.pricePerSqft,
      comparableCount: 0,
      bedrooms: unifiedRecommendation.primaryBedrooms,
      bathrooms: unifiedRecommendation.primaryBathrooms,
      sqft: unifiedRecommendation.primarySizeSqFt,
      propertyType: "apartment",
      confidence: 75,
      available: true,
      source: "estimated",
    });
  }

  if (!isMapboxAvailable()) {
    console.error("[PROVIDER-ERROR] Mapbox: token not configured — map visualization unavailable");
  }

  // Step 10: Generate financial scenarios from UNIFIED recommendation
  // This ensures financial preview matches the primary recommendation exactly
  const financialScenarios = unifiedRecommendation
    ? buildUnifiedFinancialScenarios(unifiedRecommendation)
    : generateFinancialScenarios(enhancedFeasibility, rentEstimates);

  // Apply site constraint cost adjustments to financial scenarios
  if (siteConstraints.costAdjustmentPercent > 0) {
    const multiplier = 1 + siteConstraints.costAdjustmentPercent / 100;
    for (const scenario of financialScenarios) {
      scenario.estimatedBuildCost = Math.round(scenario.estimatedBuildCost * multiplier);
      scenario.estimatedSoftCost = Math.round(scenario.estimatedSoftCost * multiplier);
      scenario.estimatedTotalCost = scenario.estimatedBuildCost + scenario.estimatedSoftCost;
      scenario.estimatedDownPayment = Math.round(scenario.estimatedTotalCost * 0.2);
      scenario.estimatedLoanAmount = scenario.estimatedTotalCost - scenario.estimatedDownPayment;
    }
  }

  // Step 11: Generate Mapbox parcel visualization
  // v7: Use real polygon shapes from geometry analysis when available
  let parcelVisualization: ParcelVisualization | undefined;
  let staticMapUrl: string | null = null;

  if (geocoded) {
    if (geometryAnalysis && geometryAnalysis.geometryConfidence > 40) {
      // v7: Build visualization from real polygon geometry
      parcelVisualization = {
        parcelBoundary: geometryAnalysis.parcelPolygon,
        structureFootprint: geometryAnalysis.mainStructure?.polygon || null,
        setbackLines: [],
        buildableEnvelope: geometryAnalysis.setbackEnvelope,
        detachedCandidateZones: geometryAnalysis.leftoverZones
          .filter((z) => z.suitableFor.some((s) => s.includes("ADU")))
          .map((z) => z.polygon),
        attachedCandidateZones: [],
        conversionCandidateZones: geometryAnalysis.garageConversionCandidate
          ? [geometryAnalysis.garageConversionCandidate.polygon]
          : [],
        uncertaintyShading: geometryAnalysis.geometryStatus === "rectangle-fallback" ? geometryAnalysis.parcelPolygon : null,
        geometryConfidence: geometryAnalysis.geometryConfidence,
      };
    } else {
      // Fallback: estimated rectangular polygons
      const mvHomeWidth = Math.round(Math.sqrt(rawFootprintSqFt * 0.7));
      const mvHomeDepth = Math.round(rawFootprintSqFt / mvHomeWidth);

      parcelVisualization = generateParcelVisualization(
        geocoded.lat,
        geocoded.lng,
        lotWidth,
        lotDepth,
        mvHomeWidth,
        mvHomeDepth,
        profile.setbacks.sideSetbackFt,
        profile.setbacks.rearSetbackFt,
        15,
        profile.separation.minDistanceFromPrimaryHomeFt
      );
    }

    staticMapUrl = getStaticMapUrl(geocoded.lat, geocoded.lng);
  }

  // Step 12: Calculate confidence score (enhanced with new data sources)
  const confidenceResult = calculateConfidence(
    {
      jurisdictionConfidence: jurisdictionResult.confidence,
      jurisdictionUncertain: jurisdictionResult.uncertain,
      lotSizeSqFt: rawLotSizeSqFt,
      footprintSqFt: rawFootprintSqFt,
      hasGeometry: parcelVisualization !== undefined,
      hasDimensions: lotWidth > 0 && lotDepth > 0,
      hasAttomData: attomData?.available === true,
      hasOsmData: osmData?.parcel !== null && osmData?.parcel !== undefined,
      slope: slopeStr,
      parcelShape,
      cornerLot: false,
      overlays,
      zoning,
      rulesVersion: profile.identity.rulesVersion,
    },
    profile
  );

  // Boost confidence if additional data sources are available
  let adjustedScore = confidenceResult.score;
  const additionalPositiveSignals = [...confidenceResult.positiveSignals];
  const additionalNegativeSignals = [...confidenceResult.negativeSignals];

  if (zoneomicsData?.available) {
    adjustedScore = Math.min(100, adjustedScore + 3);
    additionalPositiveSignals.push("Additional planning data available");
  }
  if (rentEstimates && rentEstimates.size > 0) {
    const hasRentCast = Array.from(rentEstimates.values()).some((r) => r.source === "rentcast");
    if (hasRentCast) {
      adjustedScore = Math.min(100, adjustedScore + 2);
      additionalPositiveSignals.push("Additional market rent data available");
    }
  }
  if (isMapboxAvailable()) {
    adjustedScore = Math.min(100, adjustedScore + 2);
    additionalPositiveSignals.push("Mapbox parcel visualization available");
  }

  // Apply site constraint confidence signals
  if (siteConstraints.overallRiskLevel === "High") {
    adjustedScore = Math.max(0, adjustedScore - 3);
    additionalNegativeSignals.push(`High site constraint risk: ${siteConstraints.summary}`);
  } else if (siteConstraints.overallRiskLevel === "Low") {
    adjustedScore = Math.min(100, adjustedScore + 2);
    additionalPositiveSignals.push("Site constraint analysis: low risk conditions");
  }

  // Apply sanity check confidence adjustment
  if (sanityResult.overallConfidenceAdjustment !== 0) {
    adjustedScore = Math.max(0, Math.min(100, adjustedScore + sanityResult.overallConfidenceAdjustment));
    if (sanityResult.overallConfidenceAdjustment < 0) {
      additionalNegativeSignals.push(
        `Data quality issues detected (${sanityResult.checks.filter((c) => !c.passed).length} checks flagged)`
      );
    } else {
      additionalPositiveSignals.push("Multi-source data cross-validation passed");
    }
  }

  // v7: Apply geometry confidence signals
  if (geometryAnalysis) {
    if (geometryAnalysis.geometryStatus === "polygon-verified") {
      adjustedScore = Math.min(100, adjustedScore + 4);
      additionalPositiveSignals.push(`Polygon-verified geometry: ${geometryAnalysis.footprintSource} on ${geometryAnalysis.parcelSource}`);
    } else if (geometryAnalysis.geometryStatus === "polygon-estimated") {
      adjustedScore = Math.min(100, adjustedScore + 2);
      additionalPositiveSignals.push(`Estimated polygon geometry (${geometryAnalysis.footprintSource})`);
    } else {
      additionalNegativeSignals.push("Rectangle-fallback geometry — low confidence placement");
    }
  }

  const adjustedBand: "high" | "moderate" | "low" =
    adjustedScore >= 85 ? "high" : adjustedScore >= 65 ? "moderate" : "low";

  // Step 13: Generate smart banner from UNIFIED recommendation
  // This ensures the banner text matches the rent and financial scenarios
  let smartBanner: SmartBannerData;
  if (unifiedRecommendation) {
    smartBanner = {
      recommendation: unifiedRecommendation.bannerRecommendation,
      details: unifiedRecommendation.bannerDetails,
    };
  } else {
    smartBanner = generateSmartBanner(bestRec, buildable, rawLotSizeSqFt, upsideOpportunities.length > 0);
  }

  // FAIL-CLOSED RULE: If polygon geometry missing or low-confidence,
  // mark scan as low confidence and warn user
  if (finalBuildability.geometryMethodUsed === "rectangle-fallback") {
    smartBanner.recommendation = `[Estimated] ${smartBanner.recommendation}`;
    smartBanner.details = `Note: This analysis used simplified geometry (rectangle fallback). Polygon-based analysis was not available. Results should be verified with a professional site review. ${smartBanner.details}`;
  }

  // Build zoning enrichment summary
  const zoningEnrichment = zoneomicsData?.available
    ? {
        zoningCode: zoneomicsData.zoningCode,
        zoningDescription: zoneomicsData.zoningDescription,
        landUseCategory: zoneomicsData.landUseCategory,
        overlayDistricts: zoneomicsData.overlayDistricts,
        maxLotCoverage: zoneomicsData.planningAttributes.maxLotCoverage,
        maxFAR: zoneomicsData.planningAttributes.maxFAR,
        interpretation: getZoningInterpretation(zoneomicsData),
        confidence: zoneomicsData.confidence,
        available: true as const,
      }
    : undefined;

  // Build rent data summary
  const rentData = rentEstimates
    ? {
        estimates: Array.from(rentEstimates.entries()).map(([type, est]) => ({
          aduType: type,
          monthlyRent: est.estimatedMonthlyRent,
          annualRent: est.estimatedAnnualRent,
          rentRange: `$${est.rentRangeLow.toLocaleString()} - $${est.rentRangeHigh.toLocaleString()}`,
          pricePerSqft: est.pricePerSqft,
          source: est.source,
          confidence: est.confidence,
        })),
        available: true as const,
        source: (Array.from(rentEstimates.values()).some((r) => r.source === "rentcast") ? "rentcast" : "estimated") as
          | "rentcast"
          | "estimated",
      }
    : undefined;

  // Step 14: Calculate lot dimensions for site diagram
  const mainHomeWidth = Math.round(Math.sqrt(rawFootprintSqFt * 0.7));
  const mainHomeDepth = Math.round(rawFootprintSqFt / mainHomeWidth);

  const lotDimensions: LotDimensions = {
    lotWidth,
    lotDepth,
    mainHomeWidth,
    mainHomeDepth,
  };

  return {
    property: intelligence,
    siteFacts,
    buildable,
    finalBuildability,
    recommendations,
    bestRecommendation: bestRec,
    smartBanner,
    lotDimensions,
    disclaimer:
      "Recommendations are based on parcel data, mapped jurisdiction standards, and publicly available regulations. Final feasibility depends on site conditions, utilities, easements, overlays, and formal city review.",

    // Enhanced v2 layers
    jurisdiction: {
      id: jurisdictionResult.jurisdictionId,
      name: jurisdictionResult.jurisdictionName,
      type: profile.identity.type,
      confidence: jurisdictionResult.confidence,
      uncertain: jurisdictionResult.uncertain,
      rulesVersion: profile.identity.rulesVersion,
      sourceUrls: profile.identity.sourceUrls,
    },
    aduRulesSnapshot: {
      detachedMaxSqft: profile.sizeRules.detachedAduMaxSqft,
      attachedMaxSqft: profile.sizeRules.attachedAduMaxSqft,
      jaduMaxSqft: profile.sizeRules.jaduMaxSqft,
      sideSetbackFt: profile.setbacks.sideSetbackFt,
      rearSetbackFt: profile.setbacks.rearSetbackFt,
      maxHeightFt: profile.height.maxHeightFt,
      twoStoryAllowed: profile.height.twoStoryAllowed,
      parkingRequired: profile.parking.parkingRequired,
      ownerOccupancyNotes: profile.eligibility.ownerOccupancyNotes,
      bonusProgramNotes: profile.sizeRules.bonusProgramNotes,
    },
    overlays,
    enhancedFeasibility,
    upsideDetected: upsideOpportunities.length > 0,
    upsideOpportunities,
    financialScenarios,
    confidenceScore: adjustedScore,
    confidenceBand: adjustedBand,
    manualReviewRequired: confidenceResult.manualReviewRequired,
    manualReviewReasons: confidenceResult.manualReviewReasons,
    confidenceSignals: {
      positive: additionalPositiveSignals,
      negative: additionalNegativeSignals,
    },
    financialDisclaimer: COMMON_FINANCIAL_DISCLAIMER,

    // New v3 layers
    geocoded: geocoded
      ? {
          lat: geocoded.lat,
          lng: geocoded.lng,
          placeId: geocoded.placeId,
          formattedAddress: geocoded.formattedAddress,
          city: geocoded.components.city || null,
          state: geocoded.components.state || null,
          zip: geocoded.components.zip || null,
        }
      : undefined,
    parcelVisualization: parcelVisualization || undefined,
    staticMapUrl: staticMapUrl || undefined,
    zoningEnrichment,
    rentData,
    dataSources: {
      googlePlaces: Boolean(geocoded),
      attom: attomData?.available === true,
      openStreetMap: osmData?.parcel !== null && osmData?.parcel !== undefined,
      zoneomics: zoneomicsData?.available === true,
      rentCast: isRentCastAvailable(),
      mapbox: isMapboxAvailable(),
      microsoftFootprints: msFootprints?.available === true,
      lidar: lidarTerrain?.lidarAvailable === true,
    },

    // v4 layers — Architecture enhancements
    sanityChecks: {
      passed: sanityResult.passed,
      checks: sanityResult.checks,
      adjustments: sanityResult.adjustments,
    },
    detectedStructures: undefined, // Removed from client-facing UI per requirements
    rentScenarios: unifiedRecommendation
      ? buildUnifiedRentScenarios(unifiedRecommendation).map((s) => ({
          aduType: s.aduType,
          source: "estimated" as const,
          conservative: s.conservative,
          market: s.market,
          premium: s.premium,
        }))
      : buildRentScenarios(rentEstimates),
    imageryWarning:
      "Aerial imagery may not reflect recent construction or site changes. A professional site visit is recommended to verify current conditions.",

    // v5 layers — Site Constraint Intelligence
    siteConstraints,

    // v7.1 layers — Microsoft Building Footprints
    microsoftFootprints: msFootprints?.available
      ? {
          buildingCount: msFootprints.buildings.length,
          totalFootprintSqFt: msFootprints.totalFootprintSqFt,
          mainBuildingSqFt: msFootprints.mainBuilding?.areaSqFt || null,
          confidence: msFootprints.confidence,
          quadkey: msFootprints.quadkey,
          source: msFootprints.source,
        }
      : undefined,

    // Footprint merge audit trail
    footprintMergeNotes,

    // v7.2 layers — LiDAR / Enhanced Terrain Intelligence
    lidarTerrain: lidarTerrain
      ? {
          slopeAnalysis: lidarTerrain.slopeAnalysis,
          gradingEstimate: lidarTerrain.gradingEstimate,
          foundationRecommendation: lidarTerrain.foundationRecommendation,
          lidarAvailable: lidarTerrain.lidarAvailable,
          sources: lidarTerrain.sources,
          confidence: lidarTerrain.confidence,
          summary: lidarTerrain.summary,
        }
      : undefined,

    // v6 layers — Source Cross-Reference & Reconciliation
    sourceAudit: reconcileAllSources({
      rawAddress: address,
      geocodedAddress: geocoded?.formattedAddress || null,
      attomData: attomData || null,
      osmData: osmData || null,
      zoneomicsData: zoneomicsData || null,
      rentEstimates: rentEstimates || null,
      slopeData: slopeData ? { slope: slopeData.slope, confidence: slopeData.confidence, sources: slopeData.sources } : null,
      resolvedLotSizeSqFt: rawLotSizeSqFt,
      resolvedHomeAreaSqFt: intelligence.homeAreaSqFt.value,
      resolvedFootprintSqFt: rawFootprintSqFt,
      resolvedOpenYardSqFt: intelligence.openYardSqFt.value,
      resolvedZoning: intelligence.zoning.value,
      resolvedZoningSource: intelligence.zoning.sources[0],
      resolvedZoningConfidence: intelligence.zoning.confidence,
      geocodeProvider: geocoded?.provider,
      resolvedParcelShape: intelligence.parcelShape.value,
      resolvedApn: intelligence.apn.value,
      bestRecommendation: bestRec,
      geometryStatus: geometryAnalysis?.geometryStatus,
      parcelSource: geometryAnalysis?.parcelSource,
      footprintSource: geometryAnalysis?.footprintSource,
      placementMethod: geometryAnalysis?.placement?.placementMethod,
      geometryConfidence: geometryAnalysis?.geometryConfidence,
    }),

    // v8 layers — Strict Geometry Pipeline (single-source, for site diagram)
    strictGeometry: strictGeometry
      ? {
          status: strictGeometry.status,
          canRenderDiagram: strictGeometry.canRenderDiagram,
          fallbackMessage: strictGeometry.fallbackMessage,
          parcelPolygon: strictGeometry.parcelPolygon,
          buildingPolygon: strictGeometry.buildingPolygon,
          metrics: strictGeometry.metrics,
          buildableEnvelope: strictGeometry.buildableEnvelope
            ? {
                parcelSetbackPolygon: strictGeometry.buildableEnvelope.parcelSetbackPolygon,
                residenceSeparationPolygon: strictGeometry.buildableEnvelope.residenceSeparationPolygon,
                buildablePolygon: strictGeometry.buildableEnvelope.buildablePolygon,
                buildableAreaSqFt: strictGeometry.buildableEnvelope.buildableAreaSqFt,
                bestZone: strictGeometry.buildableEnvelope.bestZone,
                constraints: strictGeometry.buildableEnvelope.constraints,
              }
            : null,
          parcelSource: strictGeometry.parcelSource,
          buildingSource: strictGeometry.buildingSource,
          confidence: strictGeometry.confidence,
          sourceAudit: strictGeometry.sourceAudit,
        }
      : undefined,

    // v7 layers — Polygon Geometry & Source Backbone
    geometryAnalysis: geometryAnalysis
      ? {
          parcelPolygon: geometryAnalysis.parcelPolygon,
          structures: geometryAnalysis.structures.map((s) => ({
            classification: s.classification,
            polygon: s.polygon,
            areaSqFt: s.areaSqFt,
            centroid: s.centroid,
            confidence: s.confidence,
            source: s.source,
            levels: s.levels,
          })),
          placement: geometryAnalysis.placement
            ? {
                measuredSetbacks: geometryAnalysis.placement.measuredSetbacks,
                fitsWithinParcel: geometryAnalysis.placement.fitsWithinParcel,
                confidence: geometryAnalysis.placement.confidence,
                placementMethod: geometryAnalysis.placement.placementMethod,
              }
            : null,
          setbackEnvelope: geometryAnalysis.setbackEnvelope,
          leftoverZones: geometryAnalysis.leftoverZones.map((z) => ({
            polygon: z.polygon,
            areaSqFt: z.areaSqFt,
            position: z.position,
            buildQuality: z.buildQuality,
            minWidthFt: z.minWidthFt,
            minDepthFt: z.minDepthFt,
            suitableFor: z.suitableFor,
          })),
          bestAduZoneIndex: geometryAnalysis.bestAduZone ? geometryAnalysis.leftoverZones.indexOf(geometryAnalysis.bestAduZone) : null,
          attachedCandidateWalls: geometryAnalysis.attachedCandidateWalls,
          garageConversionCandidate: geometryAnalysis.garageConversionCandidate
            ? {
                classification: geometryAnalysis.garageConversionCandidate.classification,
                areaSqFt: geometryAnalysis.garageConversionCandidate.areaSqFt,
                confidence: geometryAnalysis.garageConversionCandidate.confidence,
              }
            : null,
          geometryConfidence: geometryAnalysis.geometryConfidence,
          geometryStatus: geometryAnalysis.geometryStatus,
          parcelSource: geometryAnalysis.parcelSource,
          footprintSource: geometryAnalysis.footprintSource,
          areaSummary: geometryAnalysis.areaSummary,
          geometrySanityChecks: {
            passed: true,
            checks: [],
            adjustedConfidence: geometryAnalysis.geometryConfidence,
          },
        }
      : undefined,
  };
}

/** Build conservative / market / premium rent scenarios from RentCast data */
function buildRentScenarios(
  rentEstimates?: Map<string, RentEstimate>
):
  | {
      conservative: { monthlyRent: number; annualRent: number };
      market: { monthlyRent: number; annualRent: number };
      premium: { monthlyRent: number; annualRent: number };
      source: "rentcast" | "estimated";
      aduType: string;
    }[]
  | undefined {
  if (!rentEstimates || rentEstimates.size === 0) return undefined;

  return Array.from(rentEstimates.entries()).map(([type, est]) => {
    const marketRent = est.estimatedMonthlyRent;
    // Conservative: use low end of range or 85% of market
    const conservativeRent = est.rentRangeLow > 0 ? est.rentRangeLow : Math.round(marketRent * 0.85);
    // Premium: use high end of range or 115% of market
    const premiumRent = est.rentRangeHigh > 0 ? est.rentRangeHigh : Math.round(marketRent * 1.15);

    return {
      aduType: type,
      source: est.source,
      conservative: { monthlyRent: conservativeRent, annualRent: conservativeRent * 12 },
      market: { monthlyRent: marketRent, annualRent: marketRent * 12 },
      premium: { monthlyRent: premiumRent, annualRent: premiumRent * 12 },
    };
  });
}

// ─── SURGICAL FIX: Build FinalBuildabilityResult ───
// This is the single source of truth for all downstream systems.
// When polygon geometry is available, it drives the values.
// Rectangle fallback is only used when geometry engine fails.
function buildFinalBuildabilityResult(
  geometryAnalysis: GeometryAnalysis | null,
  rectangleFallback: BuildableAnalysis,
  _lotSizeSqFt: number
): FinalBuildabilityResult {
  const notes: string[] = [];
  const warnings: string[] = [];

  // Case 0: REAL parcel polygon + REAL building outlines (SANDAG). The raster
  // analysis is authoritative even when nothing fits — "0 sq ft buildable"
  // is a true, verified answer, never a reason to fall back to a rectangle.
  if (geometryAnalysis && geometryAnalysis.parcelIsReal && geometryAnalysis.footprintIsReal && geometryAnalysis.geometryStatus === "polygon-verified") {
    const bestZone = geometryAnalysis.bestAduZone;
    const bestZoneArea = bestZone ? Math.min(bestZone.areaSqFt, 1200) : 0;
    const y = geometryAnalysis.measuredYards;
    notes.push(`Parcel: ${geometryAnalysis.parcelSource}; footprints: ${geometryAnalysis.footprintSource}`);
    notes.push(`Street frontage identified by ${geometryAnalysis.frontEdgeMethod ?? "n/a"}`);
    if (y) notes.push(`Measured yards around main home: front ${y.frontFt} ft, rear ${y.rearFt} ft, sides ${y.leftFt} ft / ${y.rightFt} ft`);
    notes.push(
      bestZone
        ? `Largest detached footprint after setbacks + separation: ${bestZone.minWidthFt} x ${bestZone.minDepthFt} ft (${bestZone.areaSqFt} sq ft, ${bestZone.position})`
        : "No area large enough for a detached ADU remains after setbacks + separation"
    );
    const rectArea = rectangleFallback.estimatedBuildableEnvelopeSqFt;
    return {
      totalBuildableAreaSqFt: bestZoneArea,
      bestAduZoneAreaSqFt: bestZoneArea,
      bestAduZonePolygon: bestZone ? bestZone.polygon : null,
      candidateZones: geometryAnalysis.leftoverZones.map((z) => ({
        polygon: z.polygon,
        areaSqFt: z.areaSqFt,
        position: z.position,
        buildQuality: z.buildQuality,
        minWidthFt: z.minWidthFt,
        minDepthFt: z.minDepthFt,
        suitableFor: z.suitableFor,
        contiguousAreaSqFt: z.contiguousAreaSqFt,
      })),
      candidateZoneCount: geometryAnalysis.leftoverZones.filter((z) => z.suitableFor.length > 0).length,
      buildabilityConfidence: geometryAnalysis.geometryConfidence,
      structurePlacementConfidence: geometryAnalysis.placement?.confidence || 0,
      geometryMethodUsed: "polygon-verified",
      notes,
      warnings,
      debugComparison: {
        rectangleBuildableAreaSqFt: rectArea,
        polygonBuildableAreaSqFt: bestZoneArea,
        deltaPercent: rectArea > 0 ? Math.round(((bestZoneArea - rectArea) / rectArea) * 100) : 0,
        polygonIsSource: true,
      },
    };
  }

  // Case 1: Polygon geometry available with valid candidate zones
  if (geometryAnalysis && geometryAnalysis.leftoverZones.length > 0 && geometryAnalysis.geometryConfidence > 30) {
    const bestZone = geometryAnalysis.bestAduZone || geometryAnalysis.leftoverZones[0];
    const bestZoneArea = Math.min(bestZone.areaSqFt, 1200); // CA ADU max cap

    const methodUsed: FinalBuildabilityResult["geometryMethodUsed"] =
      geometryAnalysis.geometryStatus === "polygon-verified" ? "polygon-verified" : "polygon-estimated";

    notes.push(`Polygon engine: ${geometryAnalysis.leftoverZones.length} candidate zones found`);
    notes.push(`Geometry status: ${geometryAnalysis.geometryStatus}, confidence: ${geometryAnalysis.geometryConfidence}%`);
    notes.push(`Parcel source: ${geometryAnalysis.parcelSource}, footprint source: ${geometryAnalysis.footprintSource}`);

    if (geometryAnalysis.geometryConfidence < 60) {
      warnings.push("Geometry confidence below 60% — results should be verified with professional site review");
    }

    // Debug comparison with rectangle method
    const rectArea = rectangleFallback.estimatedBuildableEnvelopeSqFt;
    const polyArea = bestZoneArea;
    const deltaPercent = rectArea > 0 ? Math.round(((polyArea - rectArea) / rectArea) * 100) : 0;

    return {
      totalBuildableAreaSqFt: bestZoneArea,
      bestAduZoneAreaSqFt: bestZoneArea,
      bestAduZonePolygon: bestZone.polygon,
      candidateZones: geometryAnalysis.leftoverZones.map((z) => ({
        polygon: z.polygon,
        areaSqFt: z.areaSqFt,
        position: z.position,
        buildQuality: z.buildQuality,
        minWidthFt: z.minWidthFt,
        minDepthFt: z.minDepthFt,
        suitableFor: z.suitableFor,
      })),
      candidateZoneCount: geometryAnalysis.leftoverZones.length,
      buildabilityConfidence: geometryAnalysis.geometryConfidence,
      structurePlacementConfidence: geometryAnalysis.placement?.confidence || 0,
      geometryMethodUsed: methodUsed,
      notes,
      warnings,
      debugComparison: {
        rectangleBuildableAreaSqFt: rectArea,
        polygonBuildableAreaSqFt: polyArea,
        deltaPercent,
        polygonIsSource: true,
      },
    };
  }

  // Case 2: Geometry engine ran but no valid zones (e.g., lot too small, all zones below threshold)
  if (geometryAnalysis && geometryAnalysis.leftoverZones.length === 0) {
    warnings.push("Polygon geometry engine found no suitable ADU zones");
    warnings.push("Falling back to rectangle estimation — manual review recommended");
    notes.push(`Geometry ran but no zones: status=${geometryAnalysis.geometryStatus}, confidence=${geometryAnalysis.geometryConfidence}%`);
  }

  // Case 3: Geometry engine not available — rectangle fallback
  if (!geometryAnalysis) {
    warnings.push("Polygon geometry engine not available — using rectangle fallback estimate");
    warnings.push("This is a low-confidence estimate. Manual review recommended.");
  }

  const fallbackArea = rectangleFallback.estimatedBuildableEnvelopeSqFt;

  return {
    totalBuildableAreaSqFt: fallbackArea,
    bestAduZoneAreaSqFt: fallbackArea,
    bestAduZonePolygon: null,
    candidateZones: [],
    candidateZoneCount: 0,
    buildabilityConfidence: Math.min(40, geometryAnalysis?.geometryConfidence || 25),
    structurePlacementConfidence: 0,
    geometryMethodUsed: "rectangle-fallback",
    notes,
    warnings,
    debugComparison: {
      rectangleBuildableAreaSqFt: fallbackArea,
      polygonBuildableAreaSqFt: 0,
      deltaPercent: 0,
      polygonIsSource: false,
    },
  };
}

function calculateBuildableArea(
  lotSizeSqFt: number,
  footprintSqFt: number,
  setbackFt: number = 3,
  separationFt: number = 6
): BuildableAnalysis {
  // Estimate buildable envelope using jurisdiction-specific setbacks
  const lotWidth = Math.round(Math.sqrt(lotSizeSqFt * 0.5));
  const lotDepth = Math.round(lotSizeSqFt / lotWidth);
  // Subtract 3ft setback from each side (left + right)
  const usableWidth = Math.max(0, lotWidth - 2 * setbackFt);
  // Subtract rear setback (3ft) + separation from main home (6ft) + main home footprint depth
  const mainHomeDepthEst = Math.round(footprintSqFt / lotWidth);
  const usableDepth = Math.max(0, lotDepth - setbackFt - separationFt - mainHomeDepthEst);
  const buildableEnvelope = Math.max(0, usableWidth * usableDepth);
  const cappedEnvelope = Math.min(buildableEnvelope, 1200); // CA ADU max

  return {
    requiredMainHomeSeparationFt: separationFt,
    requiredPropertyLineSetbackFt: setbackFt,
    estimatedBuildableEnvelopeSqFt: cappedEnvelope,
    oneStoryPotential: `Up to ${cappedEnvelope.toLocaleString()} sq ft estimated`,
    twoStoryPotential:
      cappedEnvelope > 400
        ? `Up to ${Math.min(1200, cappedEnvelope * 1.5).toLocaleString()} sq ft estimated depending on design/review`
        : "Limited — lot constraints may restrict two-story options",
  };
}

/**
 * Recommendation cards straight from the real-data ADU-type verdicts
 * (adu-fit-rules). JADU is shown only when it's the best available path.
 */
function generateRecommendations(verdicts: Record<AduTypeName, AduTypeVerdict>): ADURecommendation[] {
  const types: AduTypeName[] = ["Detached ADU", "Attached ADU", "Garage Conversion", "Second-Story ADU"];
  if (pickBestAduType(verdicts) === "JADU") types.push("JADU");
  return types.map((type) => {
    const v = verdicts[type];
    return {
      type,
      feasibility: v.level,
      estimatedSizeRange: v.sizeLabel,
      priceRange: verdictPriceRange(v),
      description: v.description,
    };
  });
}

function verdictPriceRange(v: AduTypeVerdict): string {
  if (v.maxSqFt <= 0 || v.level === "Not Recommended") return "N/A";
  const price = estimateAduPriceRange({
    sqFt: v.maxSqFt,
    type: v.type === "JADU" ? "Attached ADU" : v.type,
    stories: v.type === "Second-Story ADU" ? 2 : 1,
    garageStalls: v.type === "Garage Conversion" ? (v.maxSqFt >= 3 * GARAGE_SQFT_PER_STALL ? 3 : 2) : undefined,
  });
  return formatPriceRange(price.low, price.high);
}

/** One plain-English sentence explaining why the best type was chosen. */
function buildBestContextNote(
  best: AduTypeName,
  verdicts: Record<AduTypeName, AduTypeVerdict>,
  facts: SiteFacts
): string | undefined {
  const detached = verdicts["Detached ADU"];
  const parts: string[] = [];
  if (best !== "Detached ADU" && detached.level === "Not Recommended") {
    parts.push(`A detached ADU doesn't fit: ${detached.description.split(";")[0].replace(/\.$/, "")}.`);
  } else if (best !== "Detached ADU" && !facts.geometryVerified) {
    parts.push("Detached ADU size couldn't be verified from real parcel data and needs a site review.");
  }
  if (best === "Garage Conversion" && facts.garageStalls) {
    parts.push(
      facts.parcelMatch === "nearest"
        ? `County records for the nearest parcel show a ${facts.garageStalls}-car garage — confirm on site.`
        : `County records show a ${facts.garageStalls}-car garage that can be converted.`
    );
  }
  if (facts.stories != null && facts.stories >= 2 && best !== "Second-Story ADU") {
    parts.push(`The home is already ${facts.stories === 2 ? "two" : facts.stories} stories.`);
  }
  return parts.length ? parts.join(" ") : undefined;
}

function parseAduAllowanceCap(value: string): number | null {
  const match = value.match(/ADU up to ([\d,]+)\s*sq ft/i);
  if (!match) return null;
  const parsed = Number(match[1].replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function synchronizeRecommendations(
  recommendations: ADURecommendation[],
  unifiedRecommendation: UnifiedRecommendation,
  verdicts: Record<AduTypeName, AduTypeVerdict>
): ADURecommendation[] {
  return recommendations
    .map((recommendation) => {
      if (recommendation.type !== unifiedRecommendation.primaryType) return recommendation;
      const verdict = verdicts[recommendation.type as AduTypeName];
      const sizeKnown = verdict ? verdict.maxSqFt > 0 : true;
      const rent = `$${unifiedRecommendation.primaryRentEstimate.rentRangeLow.toLocaleString()}-$${unifiedRecommendation.primaryRentEstimate.rentRangeHigh.toLocaleString()}/month`;
      return {
        ...recommendation,
        // Feasibility stays exactly what the real-data rules said — the
        // primary pick is never promoted to "Likely" just for being first.
        estimatedSizeRange: sizeKnown
          ? `${unifiedRecommendation.primarySizeSqFt.toLocaleString()} sq ft`
          : recommendation.estimatedSizeRange,
        priceRange: unifiedRecommendation.priceRange,
        description: sizeKnown
          ? `${recommendation.description} Best fit: ${unifiedRecommendation.primaryUnitLabel} at ${unifiedRecommendation.primarySizeSqFt.toLocaleString()} sq ft, estimated market rent ${rent}.`
          : `${recommendation.description} Financials below model a ${unifiedRecommendation.primarySizeSqFt.toLocaleString()} sq ft unit pending site review.`,
      };
    })
    .sort((a, b) => Number(b.type === unifiedRecommendation.primaryType) - Number(a.type === unifiedRecommendation.primaryType));
}

function generateSmartBanner(
  bestType: string,
  buildable: BuildableAnalysis,
  lotSizeSqFt: number,
  hasUpside: boolean = false
): SmartBannerData {
  const isLargeLot = lotSizeSqFt > 6500;

  if (hasUpside) {
    return {
      recommendation: `This property may support more value than a standard single-ADU approach.`,
      details: isLargeLot
        ? `Based on this property's size and local rules, there may be a higher-yield development path worth reviewing. Scroll down to see your opportunity analysis and financial projections.`
        : `Your property may qualify for additional development options beyond a single ADU. Review the opportunity analysis below for details.`,
    };
  }

  if (bestType === "Detached ADU") {
    return {
      recommendation: `Best fit for your property: Detached ADU up to approximately ${buildable.estimatedBuildableEnvelopeSqFt.toLocaleString()} sq ft`,
      details: isLargeLot
        ? `Your property has sufficient open yard area and favorable lot dimensions to support a standalone ADU. With an estimated buildable envelope of ${buildable.estimatedBuildableEnvelopeSqFt.toLocaleString()} sq ft, you have strong potential for a comfortable 1-2 bedroom detached unit.`
        : `Your lot may support a detached ADU, though size may be limited. Consider booking a site review to confirm exact buildable area.`,
    };
  }

  if (bestType === "Garage Conversion") {
    return {
      recommendation: "Your lot appears limited for a detached ADU. A garage conversion may be the better path.",
      details:
        "Your lot looks tight for a detached ADU, but you may still have strong conversion options. A garage conversion is typically the most affordable path and can deliver a beautiful, functional living space.",
    };
  }

  return {
    recommendation: `Consider an ${bestType.toLowerCase()} to maximize your property's potential.`,
    details: `Based on the available buildable area, an ${bestType.toLowerCase()} would maximize your property's ADU potential while working within the existing lot constraints.`,
  };
}

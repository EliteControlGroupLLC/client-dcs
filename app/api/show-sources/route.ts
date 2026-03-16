// Show Sources API Route
// SURGICAL FIX: Internal debugging endpoint that shows source candidates,
// tiers, confidence, and rejection reasons for each important field.

import { NextRequest, NextResponse } from "next/server";
import { analyzeProperty } from "@/lib/property-intelligence";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address } = body;

    if (!address || typeof address !== "string") {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    console.log(`[SHOW-SOURCES] Running source audit for: ${address}`);
    const result = await analyzeProperty(address);

    // Build the source audit trail for each mandatory field
    const sourceAudit = {
      address,
      timestamp: new Date().toISOString(),

      // Mandatory fields with source audit
      fields: {
        lotSize: {
          finalValue: result.property.lotSizeSqFt.value,
          displayValue: `${result.property.lotSizeSqFt.value.toLocaleString()} sq ft`,
          confidence: result.property.lotSizeSqFt.confidence,
          status: result.property.lotSizeSqFt.status,
          sources: result.property.lotSizeSqFt.sources,
          tier: result.property.lotSizeSqFt.sources.some((s: string) => s.includes("ATTOM")) ? "Tier 1 — Primary Backbone" : "Tier 2 — Geometry",
        },
        zoning: {
          finalValue: result.property.zoning.value,
          confidence: result.property.zoning.confidence,
          status: result.property.zoning.status,
          sources: result.property.zoning.sources,
          tier: "Tier 1 — Primary Backbone",
          enrichment: result.zoningEnrichment || null,
        },
        primaryLivingArea: {
          finalValue: result.property.homeAreaSqFt.value,
          displayValue: `${result.property.homeAreaSqFt.value.toLocaleString()} sq ft`,
          confidence: result.property.homeAreaSqFt.confidence,
          status: result.property.homeAreaSqFt.status,
          sources: result.property.homeAreaSqFt.sources,
          tier: result.property.homeAreaSqFt.sources.some((s: string) => s.includes("ATTOM")) ? "Tier 1 — Primary Backbone" : "Tier 2 — Geometry",
        },
        footprint: {
          finalValue: result.property.footprintSqFt.value,
          displayValue: `${result.property.footprintSqFt.value.toLocaleString()} sq ft`,
          confidence: result.property.footprintSqFt.confidence,
          status: result.property.footprintSqFt.status,
          sources: result.property.footprintSqFt.sources,
          tier: result.property.footprintSqFt.sources.some((s: string) => s.includes("ATTOM")) ? "Tier 1 — Primary Backbone" : "Tier 2 — Geometry",
        },
        detachedStructureDetection: {
          structureCount: result.detectedStructures?.length || 0,
          structures: result.detectedStructures || [],
          geometryStructures: result.geometryAnalysis?.structures || [],
          source: result.geometryAnalysis ? "Polygon Geometry Engine" : "OSM Detection",
        },
        buildableArea: {
          finalValue: result.finalBuildability.totalBuildableAreaSqFt,
          displayValue: `${result.finalBuildability.totalBuildableAreaSqFt.toLocaleString()} sq ft`,
          geometryMethod: result.finalBuildability.geometryMethodUsed,
          confidence: result.finalBuildability.buildabilityConfidence,
          candidateZoneCount: result.finalBuildability.candidateZoneCount,
          debugComparison: result.finalBuildability.debugComparison,
          notes: result.finalBuildability.notes,
          warnings: result.finalBuildability.warnings,
        },
        bestAduZone: {
          areaSqFt: result.finalBuildability.bestAduZoneAreaSqFt,
          hasPolygon: result.finalBuildability.bestAduZonePolygon !== null,
          candidateZones: result.finalBuildability.candidateZones.map(z => ({
            position: z.position,
            areaSqFt: z.areaSqFt,
            buildQuality: z.buildQuality,
            suitableFor: z.suitableFor,
          })),
        },
        slope: {
          finalValue: result.property.slope.value,
          confidence: result.property.slope.confidence,
          sources: result.property.slope.sources,
          lidarAvailable: result.lidarTerrain?.lidarAvailable || false,
          lidarSlope: result.lidarTerrain?.slopeAnalysis?.averageSlopePercent || null,
        },
        rentEstimate: {
          available: !!result.rentData,
          source: result.rentData?.source || "none",
          estimates: result.rentData?.estimates || [],
        },
        recommendationPath: {
          bestRecommendation: result.bestRecommendation,
          recommendations: result.recommendations.map(r => ({
            type: r.type,
            feasibility: r.feasibility,
          })),
          smartBanner: result.smartBanner,
        },
      },

      // Geometry source audit
      geometry: {
        parcelPolygonSource: result.geometryAnalysis?.parcelSource || "none",
        osmSource: result.dataSources?.openStreetMap ? "available" : "unavailable",
        microsoftSource: result.dataSources?.microsoftFootprints ? "available" : "unavailable",
        selectedSource: result.geometryAnalysis?.footprintSource || "none",
        geometryConfidence: result.geometryAnalysis?.geometryConfidence || 0,
        geometryStatus: result.geometryAnalysis?.geometryStatus || "unavailable",
        footprintMergeNotes: result.footprintMergeNotes || [],
      },

      // Data source availability
      dataSources: result.dataSources,

      // Full source reconciliation audit
      sourceReconciliation: result.sourceAudit || null,
    };

    return NextResponse.json({
      success: true,
      sourceAudit,
    });
  } catch (error) {
    console.error("[SHOW-SOURCES] Error:", error);
    return NextResponse.json(
      {
        error: "Source audit failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

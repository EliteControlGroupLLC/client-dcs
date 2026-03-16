"use client";

import { AlertTriangle } from "lucide-react";
import type { StrictGeometryResult } from "@/lib/property-intelligence/strict-geometry-pipeline";

// ─── Types ───

interface GeometryPolygon {
  type: "Polygon";
  coordinates: number[][][];
}

interface SiteDiagramProps {
  /** Full geometry result from strict pipeline (preferred) */
  geometryResult?: StrictGeometryResult;
  /** Legacy fallback props for backward compatibility */
  lotWidth?: number;
  lotDepth?: number;
  mainHomeWidth?: number;
  mainHomeDepth?: number;
}

// ─── SVG Rendering Helpers ───

const SVG_WIDTH = 400;
const SVG_HEIGHT = 320;
const PADDING = 20;

/**
 * Convert a GeoJSON polygon to SVG path coordinates.
 * Normalizes coordinates to fit within the SVG viewBox.
 */
function polygonToSvgPath(
  polygon: GeometryPolygon,
  bounds: { minLng: number; maxLng: number; minLat: number; maxLat: number },
  scale: number,
  offsetX: number,
  offsetY: number
): string {
  const ring = polygon.coordinates[0];
  if (!ring || ring.length < 3) return "";

  const points = ring.map(([lng, lat]) => {
    const x = offsetX + (lng - bounds.minLng) * scale;
    // Flip Y axis (SVG Y increases downward, lat increases upward)
    const y = offsetY + (bounds.maxLat - lat) * scale;
    return `${x},${y}`;
  });

  return `M ${points.join(" L ")} Z`;
}

/**
 * Calculate bounding box from multiple polygons.
 */
function calculateBounds(polygons: (GeometryPolygon | null | undefined)[]): {
  minLng: number;
  maxLng: number;
  minLat: number;
  maxLat: number;
} | null {
  const validPolygons = polygons.filter((p): p is GeometryPolygon => p != null);
  if (validPolygons.length === 0) return null;

  let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;

  for (const polygon of validPolygons) {
    for (const [lng, lat] of polygon.coordinates[0] || []) {
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }
  }

  return { minLng, maxLng, minLat, maxLat };
}

// ─── Main Component ───

export function SiteDiagram({
  geometryResult,
  lotWidth = 60,
  lotDepth = 120,
  mainHomeWidth = 35,
  mainHomeDepth = 45,
}: SiteDiagramProps) {
  // ─── Render from Real Geometry (Preferred) ───
  if (geometryResult) {
    // Check if we can render a real diagram
    if (!geometryResult.canRenderDiagram) {
      return (
        <FallbackDiagram
          message={geometryResult.fallbackMessage || "Geometry data unavailable"}
          sourceAudit={geometryResult.sourceAudit}
        />
      );
    }

    // Render from real polygon data
    return (
      <RealGeometryDiagram
        parcelPolygon={geometryResult.parcelPolygon}
        buildingPolygon={geometryResult.buildingPolygon}
        setbackPolygon={geometryResult.buildableEnvelope?.parcelSetbackPolygon || null}
        separationPolygon={geometryResult.buildableEnvelope?.residenceSeparationPolygon || null}
        buildablePolygon={geometryResult.buildableEnvelope?.buildablePolygon || null}
        metrics={geometryResult.metrics}
        status={geometryResult.status}
        confidence={geometryResult.confidence}
        parcelSource={geometryResult.parcelSource}
        buildingSource={geometryResult.buildingSource}
      />
    );
  }

  // ─── Legacy Fallback (Estimated Rectangle Mode) ───
  // Only used when no geometryResult is provided
  return (
    <EstimatedDiagram
      lotWidth={lotWidth}
      lotDepth={lotDepth}
      mainHomeWidth={mainHomeWidth}
      mainHomeDepth={mainHomeDepth}
    />
  );
}

// ─── Fallback Component (When Geometry Unavailable) ───

function FallbackDiagram({
  message,
  sourceAudit,
}: {
  message: string;
  sourceAudit?: StrictGeometryResult["sourceAudit"];
}) {
  return (
    <div className="bg-white rounded-2xl border border-border p-6">
      <h4 className="text-sm font-semibold text-secondary mb-1">Site Layout Diagram</h4>
      <p className="text-xs text-muted-foreground mb-4">
        Real geometry data required
      </p>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800 mb-1">
              Unable to Verify Geometry
            </p>
            <p className="text-xs text-amber-700 mb-3">
              {message}
            </p>
            {sourceAudit && (
              <div className="text-[10px] text-amber-600 space-y-1">
                {sourceAudit.parcelGISReason && (
                  <p>Parcel data: {sourceAudit.parcelGISReason}</p>
                )}
                {sourceAudit.microsoftFootprintsReason && (
                  <p>Building data: {sourceAudit.microsoftFootprintsReason}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground mt-3 text-center">
        Contact us for a verified site analysis with accurate measurements.
      </p>
    </div>
  );
}

// ─── Real Geometry Diagram ───

function RealGeometryDiagram({
  parcelPolygon,
  buildingPolygon,
  setbackPolygon,
  separationPolygon,
  buildablePolygon,
  metrics,
  status,
  confidence,
  parcelSource,
  buildingSource,
}: {
  parcelPolygon: GeometryPolygon | null;
  buildingPolygon: GeometryPolygon | null;
  setbackPolygon: GeometryPolygon | null;
  separationPolygon: GeometryPolygon | null;
  buildablePolygon: GeometryPolygon | null;
  metrics: StrictGeometryResult["metrics"];
  status: StrictGeometryResult["status"];
  confidence: number;
  parcelSource?: string;
  buildingSource?: string;
}) {
  // Calculate bounds from all polygons
  const bounds = calculateBounds([
    parcelPolygon,
    buildingPolygon,
    setbackPolygon,
    buildablePolygon,
  ]);

  if (!bounds || !parcelPolygon) {
    return <FallbackDiagram message="Unable to calculate diagram bounds" />;
  }

  // Calculate scale to fit within SVG viewBox
  const boundsWidth = bounds.maxLng - bounds.minLng;
  const boundsHeight = bounds.maxLat - bounds.minLat;
  const scaleX = (SVG_WIDTH - PADDING * 2) / boundsWidth;
  const scaleY = (SVG_HEIGHT - PADDING * 2) / boundsHeight;
  const scale = Math.min(scaleX, scaleY);

  // Center the diagram
  const offsetX = PADDING + ((SVG_WIDTH - PADDING * 2) - boundsWidth * scale) / 2;
  const offsetY = PADDING + ((SVG_HEIGHT - PADDING * 2) - boundsHeight * scale) / 2;

  // Generate SVG paths
  const parcelPath = polygonToSvgPath(parcelPolygon, bounds, scale, offsetX, offsetY);
  const buildingPath = buildingPolygon
    ? polygonToSvgPath(buildingPolygon, bounds, scale, offsetX, offsetY)
    : "";
  const setbackPath = setbackPolygon
    ? polygonToSvgPath(setbackPolygon, bounds, scale, offsetX, offsetY)
    : "";
  const separationPath = separationPolygon
    ? polygonToSvgPath(separationPolygon, bounds, scale, offsetX, offsetY)
    : "";
  const buildablePath = buildablePolygon
    ? polygonToSvgPath(buildablePolygon, bounds, scale, offsetX, offsetY)
    : "";

  // Get building centroid for label placement
  let buildingLabelX = SVG_WIDTH / 2;
  let buildingLabelY = SVG_HEIGHT / 2;
  if (buildingPolygon) {
    const ring = buildingPolygon.coordinates[0];
    if (ring && ring.length > 0) {
      let sumLng = 0, sumLat = 0;
      for (const [lng, lat] of ring) {
        sumLng += lng;
        sumLat += lat;
      }
      const centLng = sumLng / ring.length;
      const centLat = sumLat / ring.length;
      buildingLabelX = offsetX + (centLng - bounds.minLng) * scale;
      buildingLabelY = offsetY + (bounds.maxLat - centLat) * scale;
    }
  }

  // Get buildable zone centroid for label
  let buildableLabelX = SVG_WIDTH / 2;
  let buildableLabelY = SVG_HEIGHT * 0.75;
  if (buildablePolygon) {
    const ring = buildablePolygon.coordinates[0];
    if (ring && ring.length > 0) {
      let sumLng = 0, sumLat = 0;
      for (const [lng, lat] of ring) {
        sumLng += lng;
        sumLat += lat;
      }
      const centLng = sumLng / ring.length;
      const centLat = sumLat / ring.length;
      buildableLabelX = offsetX + (centLng - bounds.minLng) * scale;
      buildableLabelY = offsetY + (bounds.maxLat - centLat) * scale;
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-1">
        <h4 className="text-sm font-semibold text-secondary">Site Layout Diagram</h4>
        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
          confidence >= 80 ? "bg-green-100 text-green-700" :
          confidence >= 60 ? "bg-amber-100 text-amber-700" :
          "bg-red-100 text-red-700"
        }`}>
          {confidence}% verified
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        {status === "geometry-verified"
          ? "Real parcel and building geometry from verified sources"
          : "Partial geometry data - some elements estimated"}
      </p>

      <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="w-full" style={{ maxHeight: 320 }}>
        {/* Property boundary (parcel polygon) */}
        <path
          d={parcelPath}
          fill="none"
          stroke="#0F2A4A"
          strokeWidth="2"
          strokeDasharray="6 3"
        />

        {/* 3ft setback zone */}
        {setbackPath && (
          <path
            d={setbackPath}
            fill="none"
            stroke="#F59E0B"
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity="0.7"
          />
        )}

        {/* 6ft separation zone around building */}
        {separationPath && (
          <path
            d={separationPath}
            fill="#EF4444"
            fillOpacity="0.08"
            stroke="#EF4444"
            strokeWidth="0.5"
            strokeDasharray="3 3"
          />
        )}

        {/* Main building footprint */}
        {buildingPath && (
          <path
            d={buildingPath}
            fill="#0F2A4A"
            fillOpacity="0.15"
            stroke="#0F2A4A"
            strokeWidth="1.5"
          />
        )}

        {/* ADU buildable zone */}
        {buildablePath && (
          <path
            d={buildablePath}
            fill="#3ECDA2"
            fillOpacity="0.15"
            stroke="#3ECDA2"
            strokeWidth="1.5"
          />
        )}

        {/* Labels */}
        {/* Property boundary label */}
        <text
          x={SVG_WIDTH / 2}
          y={PADDING - 4}
          textAnchor="middle"
          className="text-[9px] font-medium fill-secondary"
        >
          Property Boundary
          {metrics && ` (${metrics.parcelWidthFt}ft x ${metrics.parcelDepthFt}ft)`}
        </text>

        {/* Main residence label */}
        {buildingPath && (
          <>
            <text
              x={buildingLabelX}
              y={buildingLabelY - 8}
              textAnchor="middle"
              className="text-[10px] font-semibold fill-secondary"
            >
              Main Residence
            </text>
            {metrics && (
              <text
                x={buildingLabelX}
                y={buildingLabelY + 6}
                textAnchor="middle"
                className="text-[9px] fill-muted-foreground"
              >
                {metrics.buildingWidthFt}ft x {metrics.buildingDepthFt}ft
              </text>
            )}
          </>
        )}

        {/* ADU buildable zone label */}
        {buildablePath && (
          <>
            <text
              x={buildableLabelX}
              y={buildableLabelY - 6}
              textAnchor="middle"
              className="text-[11px] font-bold"
              fill="#2BA87F"
            >
              ADU Buildable Area
            </text>
            <text
              x={buildableLabelX}
              y={buildableLabelY + 8}
              textAnchor="middle"
              className="text-[9px]"
              fill="#2BA87F"
            >
              After setbacks & separation
            </text>
          </>
        )}

        {/* Legend */}
        <g transform={`translate(12, ${SVG_HEIGHT - 72})`}>
          <rect x={0} y={0} width={10} height={10} fill="#0F2A4A" fillOpacity="0.15" stroke="#0F2A4A" strokeWidth="1" />
          <text x={14} y={8} className="text-[8px] fill-muted-foreground">Main Residence</text>

          <rect x={0} y={14} width={10} height={10} fill="#3ECDA2" fillOpacity="0.15" stroke="#3ECDA2" strokeWidth="1" />
          <text x={14} y={22} className="text-[8px] fill-muted-foreground">ADU Buildable Area</text>

          <line x1={0} y1={32} x2={10} y2={32} stroke="#F59E0B" strokeWidth="1" strokeDasharray="3 3" />
          <text x={14} y={36} className="text-[8px] fill-muted-foreground">3ft Property Setback</text>

          <line x1={0} y1={46} x2={10} y2={46} stroke="#EF4444" strokeWidth="1" strokeDasharray="3 3" />
          <text x={14} y={50} className="text-[8px] fill-muted-foreground">6ft Residence Separation</text>
        </g>

        {/* Measured setbacks (if available) */}
        {metrics && (
          <g className="text-[7px] fill-muted-foreground">
            {/* Front setback */}
            <text x={SVG_WIDTH / 2} y={SVG_HEIGHT - PADDING + 12} textAnchor="middle">
              Front: {metrics.frontYardDepthFt}ft
            </text>
            {/* Rear setback */}
            <text x={SVG_WIDTH / 2} y={PADDING + 12} textAnchor="middle">
              Rear: {metrics.rearYardDepthFt}ft
            </text>
            {/* Left setback */}
            <text x={PADDING - 2} y={SVG_HEIGHT / 2} textAnchor="start" transform={`rotate(-90, ${PADDING - 2}, ${SVG_HEIGHT / 2})`}>
              Left: {metrics.leftSideYardFt}ft
            </text>
            {/* Right setback */}
            <text x={SVG_WIDTH - PADDING + 2} y={SVG_HEIGHT / 2} textAnchor="end" transform={`rotate(90, ${SVG_WIDTH - PADDING + 2}, ${SVG_HEIGHT / 2})`}>
              Right: {metrics.rightSideYardFt}ft
            </text>
          </g>
        )}
      </svg>

      {/* Data source attribution */}
      <div className="mt-3 pt-3 border-t border-border/50">
        <p className="text-[9px] text-muted-foreground text-center">
          Parcel: {parcelSource === "regrid-parcel-api" ? "Regrid Parcel API" : parcelSource === "provided" ? "Polygon Engine" : parcelSource || "Polygon Engine"} | Building: {buildingSource === "microsoft-footprints" ? "Microsoft Building Footprints" : buildingSource === "provided" ? "Polygon Engine" : buildingSource || "Polygon Engine"}
        </p>
      </div>
    </div>
  );
}

// ─── Estimated Diagram (Legacy Fallback) ───

function EstimatedDiagram({
  lotWidth,
  lotDepth,
  mainHomeWidth,
  mainHomeDepth,
}: {
  lotWidth: number;
  lotDepth: number;
  mainHomeWidth: number;
  mainHomeDepth: number;
}) {
  // Scale everything to fit in a viewBox
  const scaleX = (SVG_WIDTH - PADDING * 2) / lotWidth;
  const scaleY = (SVG_HEIGHT - PADDING * 2) / lotDepth;
  const scale = Math.min(scaleX, scaleY);

  const lotW = lotWidth * scale;
  const lotH = lotDepth * scale;
  const lotX = (SVG_WIDTH - lotW) / 2;
  const lotY = (SVG_HEIGHT - lotH) / 2;

  // Setbacks (3ft from property lines)
  const setback = 3 * scale;

  // Main home (centered horizontally, near front)
  const homeW = mainHomeWidth * scale;
  const homeH = mainHomeDepth * scale;
  const homeX = lotX + (lotW - homeW) / 2;
  const homeY = lotY + 8 * scale; // 8ft from front

  // 6ft separation zone from main home
  const separation = 6 * scale;

  // ADU build zone
  const aduZoneX = lotX + setback;
  const aduZoneY = homeY + homeH + separation;
  const aduZoneW = lotW - setback * 2;
  const aduZoneH = lotY + lotH - setback - aduZoneY;

  return (
    <div className="bg-white rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-1">
        <h4 className="text-sm font-semibold text-secondary">Site Layout Diagram</h4>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
          Estimated
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Estimated property layout - dimensions are approximate
      </p>

      <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="w-full" style={{ maxHeight: 320 }}>
        {/* Property boundary */}
        <rect
          x={lotX}
          y={lotY}
          width={lotW}
          height={lotH}
          fill="none"
          stroke="#0F2A4A"
          strokeWidth="2"
          strokeDasharray="6 3"
          rx="2"
        />

        {/* Setback zone (3ft from property lines) */}
        <rect
          x={lotX + setback}
          y={lotY + setback}
          width={lotW - setback * 2}
          height={lotH - setback * 2}
          fill="none"
          stroke="#F59E0B"
          strokeWidth="1"
          strokeDasharray="4 4"
          opacity="0.6"
          rx="1"
        />

        {/* Main house footprint */}
        <rect
          x={homeX}
          y={homeY}
          width={homeW}
          height={homeH}
          fill="#0F2A4A"
          opacity="0.15"
          stroke="#0F2A4A"
          strokeWidth="1.5"
          rx="3"
        />
        <text
          x={homeX + homeW / 2}
          y={homeY + homeH / 2 - 6}
          textAnchor="middle"
          className="text-[10px] font-semibold fill-secondary"
        >
          Main Residence
        </text>
        <text
          x={homeX + homeW / 2}
          y={homeY + homeH / 2 + 8}
          textAnchor="middle"
          className="text-[9px] fill-muted-foreground"
        >
          ~{mainHomeWidth}ft x {mainHomeDepth}ft
        </text>

        {/* 6ft separation zone */}
        <rect
          x={homeX - 4}
          y={homeY + homeH}
          width={homeW + 8}
          height={separation}
          fill="#EF4444"
          opacity="0.08"
          stroke="#EF4444"
          strokeWidth="0.5"
          strokeDasharray="3 3"
        />

        {/* ADU build zone */}
        {aduZoneH > 0 && (
          <>
            <rect
              x={aduZoneX}
              y={aduZoneY}
              width={aduZoneW}
              height={Math.max(aduZoneH, 0)}
              fill="#3ECDA2"
              opacity="0.12"
              stroke="#3ECDA2"
              strokeWidth="1.5"
              rx="3"
            />
            <text
              x={aduZoneX + aduZoneW / 2}
              y={aduZoneY + Math.max(aduZoneH, 20) / 2 - 4}
              textAnchor="middle"
              className="text-[11px] font-bold"
              fill="#2BA87F"
            >
              ADU Build Zone
            </text>
            <text
              x={aduZoneX + aduZoneW / 2}
              y={aduZoneY + Math.max(aduZoneH, 20) / 2 + 10}
              textAnchor="middle"
              className="text-[9px]"
              fill="#2BA87F"
            >
              Estimated buildable area
            </text>
          </>
        )}

        {/* Labels */}
        <text x={lotX + lotW / 2} y={lotY - 6} textAnchor="middle" className="text-[9px] font-medium fill-secondary">
          Property Boundary (~{lotWidth}ft x {lotDepth}ft)
        </text>

        <text x={lotX + lotW + 4} y={lotY + setback + 10} className="text-[8px] fill-warning" textAnchor="start">
          3ft setback
        </text>

        <text x={homeX + homeW + 8} y={homeY + homeH + separation / 2 + 3} className="text-[8px] fill-destructive" textAnchor="start">
          6ft min.
        </text>

        {/* Legend */}
        <rect x={12} y={SVG_HEIGHT - 60} width={10} height={10} fill="#0F2A4A" opacity="0.15" stroke="#0F2A4A" strokeWidth="1" rx="1" />
        <text x={26} y={SVG_HEIGHT - 52} className="text-[8px] fill-muted-foreground">Main Home</text>

        <rect x={12} y={SVG_HEIGHT - 44} width={10} height={10} fill="#3ECDA2" opacity="0.15" stroke="#3ECDA2" strokeWidth="1" rx="1" />
        <text x={26} y={SVG_HEIGHT - 36} className="text-[8px] fill-muted-foreground">ADU Build Zone</text>

        <line x1={12} y1={SVG_HEIGHT - 24} x2={22} y2={SVG_HEIGHT - 24} stroke="#F59E0B" strokeWidth="1" strokeDasharray="3 3" />
        <text x={26} y={SVG_HEIGHT - 20} className="text-[8px] fill-muted-foreground">3ft Setbacks</text>

        <line x1={12} y1={SVG_HEIGHT - 10} x2={22} y2={SVG_HEIGHT - 10} stroke="#EF4444" strokeWidth="1" strokeDasharray="3 3" />
        <text x={26} y={SVG_HEIGHT - 6} className="text-[8px] fill-muted-foreground">6ft Separation</text>
      </svg>

      {/* Estimated data warning */}
      <div className="mt-3 pt-3 border-t border-border/50">
        <p className="text-[9px] text-amber-600 text-center">
          This diagram uses estimated dimensions. Real geometry data unavailable.
        </p>
      </div>
    </div>
  );
}

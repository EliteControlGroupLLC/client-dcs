"use client";

import { AlertTriangle, LandPlot } from "lucide-react";
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
        setbackFt={geometryResult.buildableEnvelope?.propertyLineSetbackFt}
        separationFt={geometryResult.buildableEnvelope?.residenceSeparationFt}
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
    <div className="bg-secondary-light rounded-2xl border border-white/10 shadow-lg shadow-black/20 p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
          <LandPlot className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-white">Site Layout Diagram</h3>
      </div>
      <p className="text-sm text-white/75 mb-4">
        Real geometry data required
      </p>

      <div className="bg-amber-500/10 border border-amber-400/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-300 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-200 mb-1">
              Unable to Verify Geometry
            </p>
            <p className="text-xs text-amber-200 mb-3">
              {message}
            </p>
            {sourceAudit && (
              <div className="text-xs text-amber-200 space-y-1">
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

      <p className="text-xs text-white/75 mt-3 text-center">
        Contact us for a verified site analysis with accurate measurements.
      </p>
    </div>
  );
}

// ─── Real Geometry Diagram ───

function RealGeometryDiagram({
  parcelPolygon: rawParcel,
  buildingPolygon: rawBuilding,
  setbackPolygon: rawSetback,
  separationPolygon: rawSeparation,
  buildablePolygon: rawBuildable,
  setbackFt,
  separationFt,
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
  setbackFt?: number;
  separationFt?: number;
  metrics: StrictGeometryResult["metrics"];
  status: StrictGeometryResult["status"];
  confidence: number;
  parcelSource?: string;
  buildingSource?: string;
}) {
  // True-to-scale plan view (north up): a degree of longitude is only
  // cos(latitude) as long as a degree of latitude, so compress x accordingly.
  const refRing = rawParcel?.coordinates[0] ?? [];
  const refLat = refRing.length ? refRing.reduce((a, p) => a + p[1], 0) / refRing.length : 0;
  const refLng = refRing.length ? refRing[0][0] : 0;
  const kx = Math.cos((refLat * Math.PI) / 180);
  const toPlan = (p: GeometryPolygon | null): GeometryPolygon | null =>
    p ? { ...p, coordinates: p.coordinates.map((r) => r.map(([x, y]) => [refLng + (x - refLng) * kx, y])) } : null;
  const parcelPolygon = toPlan(rawParcel);
  const buildingPolygon = toPlan(rawBuilding);
  const setbackPolygon = toPlan(rawSetback);
  const separationPolygon = toPlan(rawSeparation);
  const buildablePolygon = toPlan(rawBuildable);

  // Calculate bounds from all polygons
  const bounds = calculateBounds([
    parcelPolygon,
    buildingPolygon,
    setbackPolygon,
    buildablePolygon,
  ]);

  if (!bounds || !parcelPolygon || !(bounds.maxLng > bounds.minLng) || !(bounds.maxLat > bounds.minLat)) {
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
    <div className="bg-secondary-light rounded-2xl border border-white/10 shadow-lg shadow-black/20 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <LandPlot className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white">Site Layout Diagram</h3>
        </div>
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${
          confidence >= 80 ? "bg-emerald-500/10 text-emerald-300" :
          confidence >= 60 ? "bg-amber-500/10 text-amber-200" :
          "bg-red-500/10 text-red-300"
        }`}>
          {confidence}% geometry confidence
        </span>
      </div>
      <p className="text-sm text-white/75 mb-4">
        {status === "geometry-verified"
          ? "Drawn to scale from the County parcel map and traced building outlines (north is up)"
          : "Partial geometry data - some elements estimated"}
      </p>

      <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="w-full" style={{ maxHeight: 320 }}>
        {/* Property boundary (parcel polygon) */}
        <path
          d={parcelPath}
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity="0.55"
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
            fill="#F87171"
            fillOpacity="0.08"
            stroke="#F87171"
            strokeWidth="0.5"
            strokeDasharray="3 3"
          />
        )}

        {/* Main building footprint */}
        {buildingPath && (
          <path
            d={buildingPath}
            fill="#D8C49A"
            fillOpacity="0.2"
            stroke="#B99A5A"
            strokeWidth="1.5"
          />
        )}

        {/* ADU buildable zone */}
        {buildablePath && (
          <path
            d={buildablePath}
            fill="#6FA3A3"
            fillOpacity="0.25"
            stroke="#6FA3A3"
            strokeWidth="1.5"
          />
        )}

        {/* Labels */}
        {/* Property boundary label */}
        <text
          x={SVG_WIDTH / 2}
          y={PADDING - 4}
          textAnchor="middle"
          className="text-[9px] font-medium fill-white"
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
              className="text-[10px] font-semibold fill-white"
            >
              Main Residence
            </text>
            {metrics && (
              <text
                x={buildingLabelX}
                y={buildingLabelY + 6}
                textAnchor="middle"
                className="text-[9px] fill-white/80"
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
              className="text-xs font-bold fill-white"
            >
              ADU Buildable Area
            </text>
            <text
              x={buildableLabelX}
              y={buildableLabelY + 8}
              textAnchor="middle"
              className="text-xs fill-white/80"
            >
              After setbacks & separation
            </text>
          </>
        )}

        {/* Legend */}
        <g transform={`translate(12, ${SVG_HEIGHT - 72})`}>
          <rect x={0} y={0} width={10} height={10} fill="#D8C49A" fillOpacity="0.2" stroke="#B99A5A" strokeWidth="1" />
          <text x={14} y={8} className="text-[8px] fill-white/80">Main Residence</text>

          <rect x={0} y={14} width={10} height={10} fill="#6FA3A3" fillOpacity="0.25" stroke="#6FA3A3" strokeWidth="1" />
          <text x={14} y={22} className="text-[8px] fill-white/80">ADU Buildable Area</text>

          <line x1={0} y1={32} x2={10} y2={32} stroke="#F59E0B" strokeWidth="1" strokeDasharray="3 3" />
          <text x={14} y={36} className="text-[8px] fill-white/80">{setbackFt != null ? `${setbackFt} ft` : "ADU"} Property Setback</text>

          <line x1={0} y1={46} x2={10} y2={46} stroke="#F87171" strokeWidth="1" strokeDasharray="3 3" />
          <text x={14} y={50} className="text-[8px] fill-white/80">{separationFt != null ? `${separationFt} ft` : "Required"} Residence Separation</text>
        </g>

        {/* North arrow (plan is drawn north-up) */}
        <g transform={`translate(${SVG_WIDTH - 18}, 18)`}>
          <line x1={0} y1={10} x2={0} y2={-6} stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1" />
          <path d="M -3 -2 L 0 -8 L 3 -2 Z" fill="#FFFFFF" fillOpacity="0.8" />
          <text x={0} y={20} textAnchor="middle" className="text-[8px] fill-white/80">N</text>
        </g>
      </svg>

      {metrics && (
        <p className="mt-2 text-xs text-white/75 text-center">
          Measured yards around the home (street side = front): front {metrics.frontYardDepthFt} ft · rear{" "}
          {metrics.rearYardDepthFt} ft · sides {metrics.leftSideYardFt} ft / {metrics.rightSideYardFt} ft
        </p>
      )}

      {/* Data source attribution */}
      <div className="mt-3 pt-3 border-t border-white/10">
        <p className="text-xs text-white/75 text-center">
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
    <div className="bg-secondary-light rounded-2xl border border-white/10 shadow-lg shadow-black/20 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <LandPlot className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white">Site Layout Diagram</h3>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap bg-amber-500/10 text-amber-200">
          Estimated
        </span>
      </div>
      <p className="text-sm text-white/75 mb-4">
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
          stroke="#FFFFFF"
          strokeOpacity="0.55"
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
          fill="#D8C49A"
          fillOpacity="0.2"
          stroke="#B99A5A"
          strokeWidth="1.5"
          rx="3"
        />
        <text
          x={homeX + homeW / 2}
          y={homeY + homeH / 2 - 6}
          textAnchor="middle"
          className="text-[10px] font-semibold fill-white"
        >
          Main Residence
        </text>
        <text
          x={homeX + homeW / 2}
          y={homeY + homeH / 2 + 8}
          textAnchor="middle"
          className="text-[9px] fill-white/80"
        >
          ~{mainHomeWidth}ft x {mainHomeDepth}ft
        </text>

        {/* 6ft separation zone */}
        <rect
          x={homeX - 4}
          y={homeY + homeH}
          width={homeW + 8}
          height={separation}
          fill="#F87171"
          opacity="0.08"
          stroke="#F87171"
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
              fill="#6FA3A3"
              fillOpacity="0.25"
              stroke="#6FA3A3"
              strokeWidth="1.5"
              rx="3"
            />
            <text
              x={aduZoneX + aduZoneW / 2}
              y={aduZoneY + Math.max(aduZoneH, 20) / 2 - 4}
              textAnchor="middle"
              className="text-xs font-bold fill-white"
            >
              ADU Build Zone
            </text>
            <text
              x={aduZoneX + aduZoneW / 2}
              y={aduZoneY + Math.max(aduZoneH, 20) / 2 + 10}
              textAnchor="middle"
              className="text-xs fill-white/80"
            >
              Estimated buildable area
            </text>
          </>
        )}

        {/* Labels */}
        <text x={lotX + lotW / 2} y={lotY - 6} textAnchor="middle" className="text-[9px] font-medium fill-white">
          Property Boundary (~{lotWidth}ft x {lotDepth}ft)
        </text>

        <text x={lotX + lotW + 4} y={lotY + setback + 10} className="text-[8px] fill-amber-300" textAnchor="start">
          3ft setback
        </text>

        <text x={homeX + homeW + 8} y={homeY + homeH + separation / 2 + 3} className="text-[8px] fill-red-300" textAnchor="start">
          6ft min.
        </text>

        {/* Legend */}
        <rect x={12} y={SVG_HEIGHT - 60} width={10} height={10} fill="#D8C49A" fillOpacity="0.2" stroke="#B99A5A" strokeWidth="1" rx="1" />
        <text x={26} y={SVG_HEIGHT - 52} className="text-[8px] fill-white/80">Main Home</text>

        <rect x={12} y={SVG_HEIGHT - 44} width={10} height={10} fill="#6FA3A3" fillOpacity="0.25" stroke="#6FA3A3" strokeWidth="1" rx="1" />
        <text x={26} y={SVG_HEIGHT - 36} className="text-[8px] fill-white/80">ADU Build Zone</text>

        <line x1={12} y1={SVG_HEIGHT - 24} x2={22} y2={SVG_HEIGHT - 24} stroke="#F59E0B" strokeWidth="1" strokeDasharray="3 3" />
        <text x={26} y={SVG_HEIGHT - 20} className="text-[8px] fill-white/80">3ft Setbacks</text>

        <line x1={12} y1={SVG_HEIGHT - 10} x2={22} y2={SVG_HEIGHT - 10} stroke="#F87171" strokeWidth="1" strokeDasharray="3 3" />
        <text x={26} y={SVG_HEIGHT - 6} className="text-[8px] fill-white/80">6ft Separation</text>
      </svg>

      {/* Estimated data warning */}
      <div className="mt-3 pt-3 border-t border-white/10">
        <p className="text-xs text-amber-200 text-center">
          This diagram uses estimated dimensions. Real geometry data unavailable.
        </p>
      </div>
    </div>
  );
}

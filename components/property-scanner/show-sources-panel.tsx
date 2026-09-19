"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Database, Eye, AlertTriangle } from "lucide-react";
import type { PropertyAnalysisResult } from "@/lib/property-intelligence";

interface ShowSourcesPanelProps {
  analysisData: PropertyAnalysisResult;
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const color =
    confidence >= 80
      ? "bg-primary/10 text-primary"
      : confidence >= 60
        ? "bg-amber-50 text-amber-700"
        : "bg-red-50 text-red-700";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color}`}>
      {confidence}%
    </span>
  );
}

function MethodBadge({ method }: { method: string }) {
  const color =
    method === "polygon-verified"
      ? "bg-primary/10 text-primary"
      : method === "polygon-estimated"
        ? "bg-amber-50 text-amber-700"
        : "bg-red-50 text-red-700";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color}`}>
      {method}
    </span>
  );
}

export function ShowSourcesPanel({ analysisData }: ShowSourcesPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"fields" | "geometry" | "debug">("fields");

  const { finalBuildability, property, geometryAnalysis, dataSources } = analysisData;

  return (
    <div className="bg-muted border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-secondary hover:bg-muted transition-colors"
      >
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          <span>Show Sources (Internal Debug)</span>
          <MethodBadge method={finalBuildability.geometryMethodUsed} />
        </div>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {isOpen && (
        <div className="border-t border-border p-4 space-y-4">
          <div className="flex gap-2">
            {(["fields", "geometry", "debug"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeTab === tab
                    ? "bg-secondary text-white"
                    : "bg-white text-muted-foreground hover:bg-muted border border-border"
                }`}
              >
                {tab === "fields" ? "Field Sources" : tab === "geometry" ? "Geometry Audit" : "Debug Comparison"}
              </button>
            ))}
          </div>

          {activeTab === "fields" && (
            <div className="space-y-3">
              {[
                { label: "Lot Size", field: property.lotSizeSqFt },
                { label: "Home Area", field: property.homeAreaSqFt },
                { label: "Footprint", field: property.footprintSqFt },
                { label: "Zoning", field: property.zoning },
                { label: "Slope", field: property.slope },
                { label: "APN", field: property.apn },
              ].map(({ label, field }) => (
                <div key={label} className="bg-white rounded-lg p-3 border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-secondary">{label}</span>
                    <ConfidenceBadge confidence={field.confidence} />
                  </div>
                  <div className="text-sm text-secondary font-medium">
                    {typeof field.value === "number" ? field.value.toLocaleString() : String(field.value)}
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {field.sources?.map((s: string, i: number) => (
                      <div key={i} className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Database className="h-3 w-3" />
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="bg-white rounded-lg p-3 border border-border">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-secondary">
                    Buildable Area (Single Source of Truth)
                  </span>
                  <ConfidenceBadge confidence={finalBuildability.buildabilityConfidence} />
                </div>
                <div className="text-sm text-secondary font-medium">
                  {finalBuildability.totalBuildableAreaSqFt.toLocaleString()} sq ft
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Database className="h-3 w-3" />
                  Method: <MethodBadge method={finalBuildability.geometryMethodUsed} />
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Candidate zones: {finalBuildability.candidateZoneCount}
                </div>
                {finalBuildability.warnings.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {finalBuildability.warnings.map((w, i) => (
                      <div key={i} className="flex items-start gap-1 text-xs text-amber-700">
                        <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        {w}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg p-3 border border-border">
                <div className="text-xs font-semibold text-secondary mb-1">Best Recommendation</div>
                <div className="text-sm text-secondary font-medium">{analysisData.bestRecommendation}</div>
              </div>
            </div>
          )}

          {activeTab === "geometry" && (
            <div className="space-y-3">
              {geometryAnalysis ? (
                <>
                  <div className="bg-white rounded-lg p-3 border border-border">
                    <div className="text-xs font-semibold text-secondary mb-2">Geometry Engine Status</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        Status: <MethodBadge method={geometryAnalysis.geometryStatus} />
                      </div>
                      <div>
                        Confidence: <ConfidenceBadge confidence={geometryAnalysis.geometryConfidence} />
                      </div>
                      <div>Parcel: {geometryAnalysis.parcelSource}</div>
                      <div>Footprint: {geometryAnalysis.footprintSource}</div>
                    </div>
                  </div>

                  {dataSources && (
                    <div className="bg-white rounded-lg p-3 border border-border">
                      <div className="text-xs font-semibold text-secondary mb-2">Data Sources</div>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        {Object.entries(dataSources).map(([name, available]) => (
                          <div key={name} className="flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${available ? "bg-primary" : "bg-red-500"}`} />
                            {name}: {available ? "Connected" : "Unavailable"}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysisData.footprintMergeNotes && analysisData.footprintMergeNotes.length > 0 && (
                    <div className="bg-white rounded-lg p-3 border border-border">
                      <div className="text-xs font-semibold text-secondary mb-2">Footprint Merge Audit</div>
                      <div className="space-y-1">
                        {analysisData.footprintMergeNotes.map((note, i) => (
                          <div key={i} className="text-xs text-muted-foreground">
                            {note}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-amber-50 rounded-lg p-3 border border-amber-200 text-xs text-amber-700">
                  Geometry engine did not run for this property.
                </div>
              )}

              {finalBuildability.notes.length > 0 && (
                <div className="bg-white rounded-lg p-3 border border-border">
                  <div className="text-xs font-semibold text-secondary mb-2">Geometry Engine Notes</div>
                  <div className="space-y-1">
                    {finalBuildability.notes.map((n, i) => (
                      <div key={i} className="text-xs text-muted-foreground">
                        {n}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "debug" && finalBuildability.debugComparison && (
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-3 border border-border">
                <div className="text-xs font-semibold text-secondary mb-3">Rectangle vs Polygon Comparison</div>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={`p-3 rounded-lg border ${
                      !finalBuildability.debugComparison.polygonIsSource
                        ? "border-primary-light/40 bg-primary-light/10"
                        : "border-border bg-muted"
                    }`}
                  >
                    <div className="text-xs text-muted-foreground mb-1">
                      Rectangle Method {!finalBuildability.debugComparison.polygonIsSource && "(ACTIVE)"}
                    </div>
                    <div className="text-lg font-bold text-secondary">
                      {finalBuildability.debugComparison.rectangleBuildableAreaSqFt.toLocaleString()} sq ft
                    </div>
                  </div>
                  <div
                    className={`p-3 rounded-lg border ${
                      finalBuildability.debugComparison.polygonIsSource
                        ? "border-primary/40 bg-primary/5"
                        : "border-border bg-muted"
                    }`}
                  >
                    <div className="text-xs text-muted-foreground mb-1">
                      Polygon Engine {finalBuildability.debugComparison.polygonIsSource && "(ACTIVE — Source of Truth)"}
                    </div>
                    <div className="text-lg font-bold text-secondary">
                      {finalBuildability.debugComparison.polygonBuildableAreaSqFt.toLocaleString()} sq ft
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground text-center">
                  Delta: {finalBuildability.debugComparison.deltaPercent > 0 ? "+" : ""}
                  {finalBuildability.debugComparison.deltaPercent}%
                  {finalBuildability.debugComparison.polygonIsSource
                    ? " — Polygon engine is the production source of truth"
                    : " — Using rectangle fallback (polygon unavailable)"}
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 border border-border">
                <div className="text-xs font-semibold text-secondary mb-2">Confidence Summary</div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div>Overall scan confidence: {analysisData.confidenceScore || "N/A"}%</div>
                  <div>Buildability confidence: {finalBuildability.buildabilityConfidence}%</div>
                  <div>Method: {finalBuildability.geometryMethodUsed}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
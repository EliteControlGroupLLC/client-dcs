"use client";

import { Building2 } from "lucide-react";

interface ZoningEnrichmentData {
  zoningCode: string | null;
  zoningDescription: string | null;
  landUseCategory: string | null;
  overlayDistricts: string[];
  maxLotCoverage: number | null;
  maxFAR: number | null;
  interpretation: string | null;
  confidence: number;
  available: true;
}

interface ZoningEnrichmentCardProps {
  data: ZoningEnrichmentData;
}

export function ZoningEnrichmentCard({ data }: ZoningEnrichmentCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-border p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-secondary">Zoning Enrichment</h3>
        </div>
        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
          Planning context
        </span>
      </div>

      <div className="space-y-2.5">
        {data.zoningCode && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Zoning Code</span>
            <span className="text-xs font-semibold text-secondary">{data.zoningCode}</span>
          </div>
        )}

        {data.zoningDescription && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Description</span>
            <span className="text-xs font-medium text-secondary text-right max-w-[60%]">
              {data.zoningDescription}
            </span>
          </div>
        )}

        {data.landUseCategory && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Land Use</span>
            <span className="text-xs font-medium text-secondary">{data.landUseCategory}</span>
          </div>
        )}

        {data.maxLotCoverage !== null && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Max Lot Coverage</span>
            <span className="text-xs font-semibold text-secondary">{data.maxLotCoverage}%</span>
          </div>
        )}

        {data.maxFAR !== null && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Max FAR</span>
            <span className="text-xs font-semibold text-secondary">{data.maxFAR}</span>
          </div>
        )}

        {data.overlayDistricts.length > 0 && (
          <div>
            <span className="text-xs text-muted-foreground block mb-1">Overlay Districts</span>
            <div className="flex flex-wrap gap-1">
              {data.overlayDistricts.map((district) => (
                <span
                  key={district}
                  className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded"
                >
                  {district}
                </span>
              ))}
            </div>
          </div>
        )}

        {data.interpretation && (
          <div className="bg-muted/30 rounded-lg p-3 mt-2">
            <p className="text-xs text-secondary leading-relaxed">{data.interpretation}</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-border/50">
        <span className="text-xs text-muted-foreground">
          Confidence: {data.confidence}%
        </span>
        <span className="text-xs text-muted-foreground">
          Source: Zoneomics zoning data
        </span>
      </div>
    </div>
  );
}

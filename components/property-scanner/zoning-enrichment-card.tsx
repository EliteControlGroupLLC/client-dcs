"use client";

import { Building2, ExternalLink } from "lucide-react";

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
    <div className="bg-white rounded-2xl border border-border p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-indigo-600" />
          </div>
          <h3 className="font-semibold text-secondary text-sm">Zoning Enrichment</h3>
        </div>
        <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
          Zoneomics
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
                  className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
                >
                  {district}
                </span>
              ))}
            </div>
          </div>
        )}

        {data.interpretation && (
          <div className="bg-indigo-50/50 rounded-lg p-3 mt-2">
            <p className="text-[11px] text-indigo-700 leading-relaxed">{data.interpretation}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
        <span className="text-[10px] text-muted-foreground">
          Confidence: {data.confidence}%
        </span>
        <a
          href="https://zoneomics.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-indigo-500 hover:text-indigo-700 flex items-center gap-0.5"
        >
          Powered by Zoneomics
          <ExternalLink className="h-2.5 w-2.5" />
        </a>
      </div>
    </div>
  );
}

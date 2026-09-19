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
    <div className="bg-secondary-light rounded-2xl border border-white/10 shadow-lg shadow-black/20 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white">Zoning Enrichment</h3>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap bg-accent/10 text-accent-light border border-accent/30">
          Planning context
        </span>
      </div>

      <div className="space-y-2.5">
        {data.zoningCode && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-white/75">Zoning Code</span>
            <span className="text-xs font-semibold text-white">{data.zoningCode}</span>
          </div>
        )}

        {data.zoningDescription && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-white/75">Description</span>
            <span className="text-xs font-medium text-white text-right max-w-[60%]">
              {data.zoningDescription}
            </span>
          </div>
        )}

        {data.landUseCategory && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-white/75">Land Use</span>
            <span className="text-xs font-medium text-white">{data.landUseCategory}</span>
          </div>
        )}

        {data.maxLotCoverage !== null && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-white/75">Max Lot Coverage</span>
            <span className="text-xs font-semibold text-white">{data.maxLotCoverage}%</span>
          </div>
        )}

        {data.maxFAR !== null && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-white/75">Max FAR</span>
            <span className="text-xs font-semibold text-white">{data.maxFAR}</span>
          </div>
        )}

        {data.overlayDistricts.length > 0 && (
          <div>
            <span className="text-xs text-white/75 block mb-1">Overlay Districts</span>
            <div className="flex flex-wrap gap-1">
              {data.overlayDistricts.map((district) => (
                <span
                  key={district}
                  className="text-xs bg-secondary border border-white/10 text-white/80 px-2 py-0.5 rounded"
                >
                  {district}
                </span>
              ))}
            </div>
          </div>
        )}

        {data.interpretation && (
          <div className="bg-white/[0.04] rounded-lg p-3 mt-2">
            <p className="text-xs text-white/80 leading-relaxed">{data.interpretation}</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-white/10">
        <span className="text-xs text-white/75">
          Confidence: {data.confidence}%
        </span>
        <span className="text-xs text-white/75">
          Source: Zoneomics zoning data
        </span>
      </div>
    </div>
  );
}

"use client";

import { Lock, CheckCircle, FileText, Building, DollarSign, MapPin } from "lucide-react";
import { LeadCaptureForm } from "./lead-capture-form";
import type { PropertyAnalysisResult } from "@/lib/property-intelligence";
import { displayFieldValue } from "@/lib/property-intelligence/types";

interface LockedReportPreviewProps {
  analysisData: PropertyAnalysisResult;
  reportToken?: string | null;
  propertyAddress: string;
  onReportUnlocked: () => void;
}

export function LockedReportPreview({
  analysisData,
  reportToken,
  propertyAddress,
  onReportUnlocked,
}: LockedReportPreviewProps) {
  // Real values for THIS property only (blurred, but still in the DOM).
  const best = analysisData.recommendations?.find((r) => r.type === analysisData.bestRecommendation);
  const rules = analysisData.aduRulesSnapshot;
  const shortAddress = propertyAddress.length > 30 ? `${propertyAddress.slice(0, 30)}...` : propertyAddress;
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Success message - Report is ready */}
      <div className="bg-secondary-light rounded-2xl shadow-lg shadow-black/20 border border-white/10 p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shrink-0">
            <CheckCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Your ADU Feasibility Report is Ready!</h2>
            <p className="text-sm text-white/80">
              We&apos;ve analyzed your property and prepared a comprehensive report.
            </p>
          </div>
        </div>
      </div>

      {/* Blurred report preview */}
      <div className="relative">
        {/* Blur overlay with lead capture form */}
        <div className="absolute inset-0 z-20 flex items-start justify-center pt-8">
          <div className="w-full max-w-lg sm:mx-4">
            <LeadCaptureForm
              propertyAddress={propertyAddress}
              scanResults={analysisData as unknown as Record<string, unknown>}
              reportToken={reportToken}
              onReportUnlocked={onReportUnlocked}
            />
          </div>
        </div>

        {/* Blurred content preview */}
        <div className="relative z-10 blur-sm pointer-events-none select-none opacity-60">
          {/* Mock report preview cards */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Property Summary Card Mock */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-secondary-light rounded-2xl border border-white/10 shadow-lg shadow-black/20 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Building className="h-5 w-5 text-accent" />
                  <h3 className="text-xl font-semibold text-white">Property Summary</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-white/75">Address</span>
                    <span className="text-sm font-medium text-white">{shortAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-white/75">Lot Size</span>
                    <span className="text-sm font-medium text-white">{displayFieldValue(analysisData.property.lotSizeSqFt, "sq ft")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-white/75">Zoning</span>
                    <span className="text-sm font-medium text-white">{displayFieldValue(analysisData.property.zoning)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-white/75">Feasibility</span>
                    <span className="text-sm font-medium text-accent-light">
                      {best ? `${best.type}: ${best.feasibility}` : "See report"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Jurisdiction Card Mock */}
              <div className="bg-secondary-light rounded-2xl border border-white/10 shadow-lg shadow-black/20 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-accent" />
                  <h3 className="text-xl font-semibold text-white">Jurisdiction & Rules</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-white/75">Jurisdiction</span>
                    <span className="text-sm font-medium text-white">{analysisData.jurisdiction?.name ?? "Not available"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-white/75">Max ADU Size</span>
                    <span className="text-sm font-medium text-white">
                      {rules ? `${rules.detachedMaxSqft.toLocaleString()} sq ft` : "Not available"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-white/75">Setback Requirements</span>
                    <span className="text-sm font-medium text-white">
                      {rules ? `${rules.rearSetbackFt} ft rear / ${rules.sideSetbackFt} ft side` : "Not available"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Map and Financial Preview Mock */}
            <div className="space-y-6">
              <div className="bg-secondary-light rounded-2xl border border-white/10 shadow-lg shadow-black/20 p-6 h-48">
                <div className="w-full h-full bg-secondary rounded-xl flex items-center justify-center">
                  <Lock className="h-8 w-8 text-white/60" />
                </div>
              </div>

              <div className="bg-secondary-light rounded-2xl border border-white/10 shadow-lg shadow-black/20 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="h-5 w-5 text-accent" />
                  <h3 className="text-xl font-semibold text-white">Financial Preview</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-white/75">Est. Build Cost</span>
                    <span className="text-sm font-medium text-white">$XXX,XXX</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-white/75">Est. Monthly Rent</span>
                    <span className="text-sm font-medium text-white">$X,XXX/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-white/75">Est. ROI</span>
                    <span className="text-sm font-medium text-white">XX%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations Mock */}
          <div className="mt-6">
            <div className="bg-secondary-light rounded-2xl border border-white/10 shadow-lg shadow-black/20 p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-accent" />
                <h3 className="text-xl font-semibold text-white">Recommended ADU Paths</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-secondary rounded-xl p-4 border border-white/10">
                  <div className="h-4 bg-white/15 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-white/15 rounded w-1/2" />
                </div>
                <div className="bg-secondary rounded-xl p-4 border border-white/10">
                  <div className="h-4 bg-white/15 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-white/15 rounded w-1/2" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional spacer for form visibility */}
      <div className="h-32" />
    </div>
  );
}

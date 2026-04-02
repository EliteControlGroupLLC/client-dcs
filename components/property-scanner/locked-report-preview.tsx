"use client";

import { Lock, CheckCircle, FileText, Building, DollarSign, MapPin } from "lucide-react";
import { LeadCaptureForm } from "./lead-capture-form";
import type { PropertyAnalysisResult } from "@/lib/property-intelligence";

interface LockedReportPreviewProps {
  analysisData: PropertyAnalysisResult;
  propertyAddress: string;
  onReportUnlocked: () => void;
}

export function LockedReportPreview({
  analysisData,
  propertyAddress,
  onReportUnlocked,
}: LockedReportPreviewProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Success message - Report is ready */}
      <div className="bg-gradient-to-r from-emerald-50 to-primary/10 rounded-2xl border border-primary/30 p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-secondary">Your ADU Feasibility Report is Ready!</h2>
            <p className="text-sm text-muted-foreground">
              We&apos;ve analyzed your property and prepared a comprehensive report.
            </p>
          </div>
        </div>
      </div>

      {/* Blurred report preview */}
      <div className="relative">
        {/* Blur overlay with lead capture form */}
        <div className="absolute inset-0 z-20 flex items-start justify-center pt-8">
          <div className="w-full max-w-lg mx-4">
            <LeadCaptureForm
              propertyAddress={propertyAddress}
              scanResults={analysisData as unknown as Record<string, unknown>}
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
              <div className="bg-white rounded-2xl border border-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Building className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-secondary">Property Summary</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Address</span>
                    <span className="text-sm font-medium">{propertyAddress.slice(0, 30)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Lot Size</span>
                    <span className="text-sm font-medium">{analysisData.property.lotSizeSqFt.value.toLocaleString()} sq ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Zoning</span>
                    <span className="text-sm font-medium">{analysisData.property.zoning.value}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Feasibility</span>
                    <span className="text-sm font-medium text-primary">Likely Eligible</span>
                  </div>
                </div>
              </div>

              {/* Jurisdiction Card Mock */}
              <div className="bg-white rounded-2xl border border-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-secondary">Jurisdiction & Rules</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Jurisdiction</span>
                    <span className="text-sm font-medium">{analysisData.jurisdiction?.name || "San Diego"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Max ADU Size</span>
                    <span className="text-sm font-medium">1,200 sq ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Setback Requirements</span>
                    <span className="text-sm font-medium">4 ft rear/side</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Map and Financial Preview Mock */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-border p-6 h-48">
                <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center">
                  <Lock className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-secondary">Financial Preview</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Est. Build Cost</span>
                    <span className="text-sm font-medium">$XXX,XXX</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Est. Monthly Rent</span>
                    <span className="text-sm font-medium">$X,XXX/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Est. ROI</span>
                    <span className="text-sm font-medium">XX%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations Mock */}
          <div className="mt-6">
            <div className="bg-white rounded-2xl border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-secondary">Recommended ADU Paths</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
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

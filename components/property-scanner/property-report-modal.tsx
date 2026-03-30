"use client";

import { useState } from "react";
import { X, Download, FileText, Building, DollarSign, MapPin, Shield, TrendingUp, AlertTriangle, Droplets, Flame, Mountain } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PropertyAnalysisResult } from "@/lib/property-intelligence";

interface PropertyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisData: PropertyAnalysisResult;
  reportData?: Record<string, unknown>;
}

export function PropertyReportModal({
  isOpen,
  onClose,
  analysisData,
  reportData,
}: PropertyReportModalProps) {
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setDownloading(true);

    // Generate a text-based report for download
    const reportContent = generateReportText(analysisData, reportData);
    const blob = new Blob([reportContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `DCS-Property-Report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-secondary to-secondary-light text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6" />
            <div>
              <h2 className="text-lg font-bold">Property Development Report</h2>
              <p className="text-sm text-white/70">
                {analysisData.property.address.value}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)] space-y-6">
          {/* Property Summary */}
          <ReportSection icon={Building} title="Property Summary">
            <ReportRow label="Address" value={analysisData.property.address.value} />
            <ReportRow label="Lot Size" value={`${analysisData.property.lotSizeSqFt.value.toLocaleString()} sq ft`} />
            <ReportRow label="Living Area" value={`${analysisData.property.homeAreaSqFt.value.toLocaleString()} sq ft`} />
            {analysisData.geometryAnalysis?.areaSummary && (
              <>
                <ReportRow label="Main Footprint" value={`${analysisData.geometryAnalysis.areaSummary.mainFootprintSqFt.toLocaleString()} sq ft`} />
                {analysisData.geometryAnalysis.areaSummary.mainLivingSqFt !== analysisData.geometryAnalysis.areaSummary.mainFootprintSqFt && (
                  <ReportRow label="Main Living Area" value={`${analysisData.geometryAnalysis.areaSummary.mainLivingSqFt.toLocaleString()} sq ft`} />
                )}
              </>
            )}
            <ReportRow label="Zoning" value={analysisData.property.zoning.value} />
            <ReportRow label="Slope" value={analysisData.property.slope.value} />
            {analysisData.geometryAnalysis && (
              <ReportRow
                label="Geometry"
                value={`${analysisData.geometryAnalysis.geometryStatus.replace(/-/g, " ")} (${analysisData.geometryAnalysis.geometryConfidence}%)`}
              />
            )}
          </ReportSection>

          {/* Jurisdiction */}
          {analysisData.jurisdiction && (
            <ReportSection icon={MapPin} title="Jurisdiction">
              <ReportRow label="Jurisdiction" value={analysisData.jurisdiction.name} />
              <ReportRow label="Rules Version" value={analysisData.jurisdiction.rulesVersion} />
            </ReportSection>
          )}

          {/* Feasibility */}
          <ReportSection icon={Shield} title="ADU Feasibility">
            <ReportRow label="Recommended Path" value={analysisData.bestRecommendation} />
            <ReportRow
              label="Buildable Envelope"
              value={`${analysisData.buildable.estimatedBuildableEnvelopeSqFt.toLocaleString()} sq ft`}
            />
            {analysisData.recommendations.map((rec) => (
              <ReportRow key={rec.type} label={rec.type} value={`${rec.feasibility} — ${rec.estimatedSizeRange}`} />
            ))}
          </ReportSection>

          {/* Financial Snapshot */}
          {analysisData.financialScenarios && analysisData.financialScenarios.length > 0 && (
            <ReportSection icon={DollarSign} title="Financial Snapshot">
              {analysisData.financialScenarios.slice(0, 3).map((scenario) => (
                <div key={scenario.scenarioName} className="mb-3 last:mb-0">
                  <p className="text-xs font-semibold text-secondary mb-1">{scenario.scenarioName}</p>
                  <div className="grid grid-cols-2 gap-1">
                    <ReportRow label="Est. Cost" value={`$${scenario.estimatedTotalCost.toLocaleString()}`} />
                    <ReportRow label="Est. Rent" value={`$${scenario.estimatedMonthlyIncome.toLocaleString()}/mo`} />
                    <ReportRow label="ROI" value={`${scenario.estimatedRoi}%`} />
                    <ReportRow label="Payback" value={`${scenario.estimatedPaybackYears} years`} />
                  </div>
                </div>
              ))}
            </ReportSection>
          )}

          {/* Opportunity Analysis */}
          {analysisData.upsideDetected && analysisData.upsideOpportunities && (
            <ReportSection icon={TrendingUp} title="Opportunity Analysis">
              {analysisData.upsideOpportunities.map((opp) => (
                <div key={opp.title} className="mb-2 last:mb-0">
                  <p className="text-xs font-semibold text-secondary">{opp.title}</p>
                  <p className="text-[11px] text-muted-foreground">{opp.summary}</p>
                </div>
              ))}
            </ReportSection>
          )}

          {/* Rent Scenarios */}
          {analysisData.rentScenarios && analysisData.rentScenarios.length > 0 && (
            <ReportSection icon={DollarSign} title="Rent Scenarios">
              {analysisData.rentScenarios.map((rs) => (
                <div key={rs.aduType} className="mb-3 last:mb-0">
                  <p className="text-xs font-semibold text-secondary mb-1 capitalize">{rs.aduType.replace(/-/g, " ")}</p>
                  <div className="grid grid-cols-3 gap-1">
                    <ReportRow label="Conservative" value={`$${rs.conservative.monthlyRent.toLocaleString()}/mo`} />
                    <ReportRow label="Market" value={`$${rs.market.monthlyRent.toLocaleString()}/mo`} />
                    <ReportRow label="Premium" value={`$${rs.premium.monthlyRent.toLocaleString()}/mo`} />
                  </div>
                </div>
              ))}
            </ReportSection>
          )}

          {/* Site Constraints */}
          {analysisData.siteConstraints && (
            <ReportSection icon={Shield} title="Site Conditions">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Constraint Risk</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  analysisData.siteConstraints.overallRiskLevel === "Low" ? "bg-emerald-50 text-emerald-700" :
                  analysisData.siteConstraints.overallRiskLevel === "Moderate" ? "bg-amber-50 text-amber-700" :
                  "bg-red-50 text-red-700"
                }`}>
                  {analysisData.siteConstraints.overallRiskLevel}
                </span>
              </div>
              {analysisData.siteConstraints.constraints.map((c) => (
                <ReportRow
                  key={c.category}
                  label={c.category.charAt(0).toUpperCase() + c.category.slice(1)}
                  value={c.severity === "none" ? "None" : `${c.severity.charAt(0).toUpperCase() + c.severity.slice(1)} — ${c.classification}`}
                />
              ))}
              {analysisData.siteConstraints.costAdjustmentPercent > 0 && (
                <ReportRow label="Est. Cost Impact" value={`+${analysisData.siteConstraints.costAdjustmentPercent}%`} />
              )}
              {analysisData.siteConstraints.timelineAdjustmentMonths > 0 && (
                <ReportRow label="Est. Timeline Impact" value={`+${analysisData.siteConstraints.timelineAdjustmentMonths} months`} />
              )}
            </ReportSection>
          )}

          {/* Confidence */}
          {analysisData.confidenceScore !== undefined && (
            <ReportSection icon={Shield} title="Confidence Score">
              <ReportRow label="Score" value={`${analysisData.confidenceScore}%`} />
              <ReportRow label="Band" value={analysisData.confidenceBand || "\u2014"} />
              {analysisData.manualReviewRequired && (
                <p className="text-[11px] text-amber-600 mt-1">Manual review recommended</p>
              )}
            </ReportSection>
          )}

          {/* Data Quality */}
          {analysisData.sanityChecks && !analysisData.sanityChecks.passed && (
            <ReportSection icon={AlertTriangle} title="Data Quality Notes">
              {analysisData.sanityChecks.checks
                .filter((c) => !c.passed)
                .map((c) => (
                  <div key={c.name} className="flex items-start gap-1.5 mb-1 last:mb-0">
                    <span className={`text-[10px] mt-0.5 ${c.severity === "error" ? "text-red-500" : "text-amber-500"}`}>\u25CF</span>
                    <p className="text-[11px] text-muted-foreground">{c.message}</p>
                  </div>
                ))}
            </ReportSection>
          )}

          {/* Disclaimers */}
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              {analysisData.disclaimer}
            </p>
            {analysisData.financialDisclaimer && (
              <p className="text-[10px] text-muted-foreground leading-relaxed mt-2">
                {analysisData.financialDisclaimer}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 flex items-center justify-between bg-slate-50/50">
          <p className="text-[10px] text-muted-foreground">
            Prepared for planning review by Distinct Construction Solutions
          </p>
          <Button size="sm" rounded="full" onClick={handleDownload} disabled={downloading}>
            <Download className="h-3.5 w-3.5" />
            {downloading ? "Downloading..." : "Download Report"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ReportSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="bg-slate-50 px-4 py-2.5 flex items-center gap-2 border-b border-border">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-secondary">{title}</h3>
      </div>
      <div className="p-4 space-y-1.5">{children}</div>
    </div>
  );
}

function ReportRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-secondary">{value}</span>
    </div>
  );
}

function generateReportText(
  data: PropertyAnalysisResult,
  _reportData?: Record<string, unknown>
): string {
  const lines: string[] = [
    "═══════════════════════════════════════════",
    "  DCS PROPERTY DEVELOPMENT REPORT",
    "═══════════════════════════════════════════",
    "",
    `Address: ${data.property.address.value}`,
    `Generated: ${new Date().toLocaleDateString()}`,
    "",
    "─── PROPERTY SUMMARY ───",
    `Lot Size: ${data.property.lotSizeSqFt.value.toLocaleString()} sq ft`,
    `Living Area: ${data.property.homeAreaSqFt.value.toLocaleString()} sq ft`,
    ...(data.geometryAnalysis?.areaSummary ? [
      `Main Footprint: ${data.geometryAnalysis.areaSummary.mainFootprintSqFt.toLocaleString()} sq ft`,
      `Main Living Area: ${data.geometryAnalysis.areaSummary.mainLivingSqFt.toLocaleString()} sq ft`,
      `Total Structure Footprint: ${data.geometryAnalysis.areaSummary.totalStructureFootprintSqFt.toLocaleString()} sq ft`,
    ] : []),
    `Zoning: ${data.property.zoning.value}`,
    `Slope: ${data.property.slope.value}`,
    ...(data.geometryAnalysis ? [
      `Geometry: ${data.geometryAnalysis.geometryStatus} (${data.geometryAnalysis.geometryConfidence}% confidence)`,
    ] : []),
    "",
  ];

  if (data.jurisdiction) {
    lines.push("─── JURISDICTION ───");
    lines.push(`Jurisdiction: ${data.jurisdiction.name}`);
    lines.push(`Rules Version: ${data.jurisdiction.rulesVersion}`);
    lines.push("");
  }

  lines.push("─── ADU FEASIBILITY ───");
  lines.push(`Recommended Path: ${data.bestRecommendation}`);
  lines.push(`Buildable Envelope: ${data.buildable.estimatedBuildableEnvelopeSqFt.toLocaleString()} sq ft`);
  lines.push("");

  for (const rec of data.recommendations) {
    lines.push(`  ${rec.type}: ${rec.feasibility} — ${rec.estimatedSizeRange} — ${rec.priceRange}`);
  }
  lines.push("");

  if (data.financialScenarios && data.financialScenarios.length > 0) {
    lines.push("─── FINANCIAL SNAPSHOT ───");
    for (const s of data.financialScenarios) {
      lines.push(`  ${s.scenarioName}:`);
      lines.push(`    Est. Cost: $${s.estimatedTotalCost.toLocaleString()}`);
      lines.push(`    Est. Rent: $${s.estimatedMonthlyIncome.toLocaleString()}/mo`);
      lines.push(`    ROI: ${s.estimatedRoi}%`);
      lines.push(`    Payback: ${s.estimatedPaybackYears} years`);
    }
    lines.push("");
  }

  // Rent Scenarios
  if (data.rentScenarios && data.rentScenarios.length > 0) {
    lines.push("─── RENT SCENARIOS ───");
    for (const rs of data.rentScenarios) {
      lines.push(`  ${rs.aduType.replace(/-/g, " ")}:`);
      lines.push(`    Conservative: $${rs.conservative.monthlyRent.toLocaleString()}/mo ($${rs.conservative.annualRent.toLocaleString()}/yr)`);
      lines.push(`    Market:       $${rs.market.monthlyRent.toLocaleString()}/mo ($${rs.market.annualRent.toLocaleString()}/yr)`);
      lines.push(`    Premium:      $${rs.premium.monthlyRent.toLocaleString()}/mo ($${rs.premium.annualRent.toLocaleString()}/yr)`);
    }
    lines.push("");
  }

  // Site Constraints
  if (data.siteConstraints) {
    lines.push("─── SITE CONDITIONS ───");
    lines.push(`  Overall Constraint Risk: ${data.siteConstraints.overallRiskLevel}`);
    for (const c of data.siteConstraints.constraints) {
      const label = c.category.charAt(0).toUpperCase() + c.category.slice(1);
      const sev = c.severity === "none" ? "None" : c.severity.charAt(0).toUpperCase() + c.severity.slice(1);
      lines.push(`  ${label}: ${sev} — ${c.classification}`);
    }
    if (data.siteConstraints.costAdjustmentPercent > 0) {
      lines.push(`  Est. Cost Impact: +${data.siteConstraints.costAdjustmentPercent}%`);
    }
    if (data.siteConstraints.timelineAdjustmentMonths > 0) {
      lines.push(`  Est. Timeline Impact: +${data.siteConstraints.timelineAdjustmentMonths} months`);
    }
    lines.push(`  Summary: ${data.siteConstraints.summary}`);
    lines.push("");
  }

  if (data.confidenceScore !== undefined) {
    lines.push(`Confidence Score: ${data.confidenceScore}% (${data.confidenceBand})`);
    lines.push("");
  }

  // Data Quality
  if (data.sanityChecks && !data.sanityChecks.passed) {
    lines.push("─── DATA QUALITY NOTES ───");
    for (const c of data.sanityChecks.checks.filter((ch) => !ch.passed)) {
      lines.push(`  [${c.severity.toUpperCase()}] ${c.message}`);
    }
    lines.push("");
  }

  lines.push("─── DISCLAIMER ───");
  lines.push(data.disclaimer);
  if (data.financialDisclaimer) {
    lines.push(data.financialDisclaimer);
  }
  lines.push("");
  lines.push("═══════════════════════════════════════════");
  lines.push("  Prepared by Distinct Construction Solutions");
  lines.push("  www.distinctcsolutions.com");
  lines.push("═══════════════════════════════════════════");

  return lines.join("\n");
}

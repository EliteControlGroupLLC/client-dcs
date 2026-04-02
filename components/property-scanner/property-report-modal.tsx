"use client";

import { useState, useRef } from "react";
import { X, Download, Printer, FileText, Building, DollarSign, MapPin, Shield, TrendingUp, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PropertyAnalysisResult } from "@/lib/property-intelligence";
import { ShowSourcesPanel } from "./show-sources-panel";

interface PropertyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisData: PropertyAnalysisResult;
  reportData?: Record<string, unknown>;
  isAdmin?: boolean;
}

export function PropertyReportModal({
  isOpen,
  onClose,
  analysisData,
  reportData,
  isAdmin = false,
}: PropertyReportModalProps) {
  const [downloading, setDownloading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleDownloadPDF = async () => {
    setDownloading(true);

    try {
      // Generate PDF-styled HTML content with Structura Aetrnum branding
      const pdfContent = generateStructuraPDFContent(analysisData);
      
      // Create a new window for the PDF content
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(pdfContent);
        printWindow.document.close();
        
        // Wait for content to load then trigger print (save as PDF)
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
          }, 500);
        };
      }
    } catch (error) {
      console.error("PDF generation error:", error);
    }

    setDownloading(false);
  };

  const handlePrint = () => {
    // Generate print-friendly content with Structura Aetrnum branding
    const printContent = generateStructuraPDFContent(analysisData);
    
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 500);
      };
    }
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

          {/* Source Cross-Reference (Admin Only) */}
          {isAdmin && analysisData.sourceAudit && (
            <ShowSourcesPanel analysisData={analysisData} />
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
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" rounded="full" onClick={handlePrint}>
              <Printer className="h-3.5 w-3.5" />
              Print
            </Button>
            <Button size="sm" rounded="full" onClick={handleDownloadPDF} disabled={downloading}>
              <Download className="h-3.5 w-3.5" />
              {downloading ? "Generating..." : "Download PDF"}
            </Button>
          </div>
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

/**
 * Generate PDF/Print content with Structura Aetrnum branding
 * Colors: Dark green (primary), Gold (accent), neutral light tones
 * Typography: Clean architectural font (Bahnschrift style)
 * Layout: Minimal, high-end, structured, no clutter
 */
function generateStructuraPDFContent(data: PropertyAnalysisResult): string {
  const generatedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>ADU Feasibility Report - ${data.property.address.value}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Barlow', 'Bahnschrift', 'Segoe UI', sans-serif;
      color: #1a1a1a;
      background: #fff;
      line-height: 1.6;
      font-size: 11pt;
    }
    
    .page {
      max-width: 8.5in;
      margin: 0 auto;
      padding: 0.75in;
      position: relative;
      min-height: 11in;
    }
    
    /* Watermark */
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 48pt;
      color: rgba(26, 77, 46, 0.04);
      font-weight: 700;
      letter-spacing: 4px;
      white-space: nowrap;
      z-index: -1;
      pointer-events: none;
    }
    
    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #1a4d2e;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    
    .logo {
      display: flex;
      flex-direction: column;
    }
    
    .logo-main {
      font-size: 24pt;
      font-weight: 700;
      color: #1a4d2e;
      letter-spacing: 3px;
      text-transform: uppercase;
    }
    
    .logo-sub {
      font-size: 10pt;
      font-weight: 300;
      color: #c9a227;
      letter-spacing: 6px;
      text-transform: uppercase;
      margin-top: 2px;
    }
    
    .report-info {
      text-align: right;
      font-size: 9pt;
      color: #666;
    }
    
    .report-info strong {
      color: #1a4d2e;
    }
    
    /* Title */
    .report-title {
      text-align: center;
      margin-bottom: 30px;
    }
    
    .report-title h1 {
      font-size: 18pt;
      font-weight: 600;
      color: #1a4d2e;
      margin-bottom: 8px;
      letter-spacing: 1px;
    }
    
    .report-title .address {
      font-size: 12pt;
      color: #333;
      font-weight: 400;
    }
    
    .report-title .confidential {
      font-size: 8pt;
      color: #c9a227;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-top: 8px;
    }
    
    /* Sections */
    .section {
      margin-bottom: 25px;
    }
    
    .section-title {
      font-size: 11pt;
      font-weight: 600;
      color: #1a4d2e;
      text-transform: uppercase;
      letter-spacing: 2px;
      border-bottom: 1px solid #c9a227;
      padding-bottom: 6px;
      margin-bottom: 15px;
    }
    
    .section-content {
      background: #fafafa;
      border-left: 3px solid #1a4d2e;
      padding: 15px 20px;
    }
    
    .data-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      border-bottom: 1px solid #eee;
    }
    
    .data-row:last-child {
      border-bottom: none;
    }
    
    .data-label {
      color: #666;
      font-weight: 400;
    }
    
    .data-value {
      color: #1a1a1a;
      font-weight: 500;
      text-align: right;
    }
    
    .data-value.highlight {
      color: #1a4d2e;
      font-weight: 600;
    }
    
    /* Two column layout */
    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    
    /* Recommendations */
    .recommendation-card {
      background: #f5f5f5;
      border: 1px solid #ddd;
      padding: 12px 15px;
      margin-bottom: 10px;
    }
    
    .recommendation-card h4 {
      font-size: 10pt;
      font-weight: 600;
      color: #1a4d2e;
      margin-bottom: 5px;
    }
    
    .recommendation-card p {
      font-size: 9pt;
      color: #666;
    }
    
    /* Footer */
    .footer {
      position: absolute;
      bottom: 0.5in;
      left: 0.75in;
      right: 0.75in;
      border-top: 1px solid #ddd;
      padding-top: 15px;
      font-size: 8pt;
      color: #999;
      display: flex;
      justify-content: space-between;
    }
    
    .footer-brand {
      color: #1a4d2e;
      font-weight: 500;
    }
    
    /* Disclaimer */
    .disclaimer {
      margin-top: 30px;
      padding: 15px;
      background: #f9f9f9;
      border: 1px solid #eee;
      font-size: 8pt;
      color: #888;
      line-height: 1.5;
    }
    
    @media print {
      .page {
        padding: 0.5in;
      }
      
      .watermark {
        display: block;
      }
    }
  </style>
</head>
<body>
  <div class="watermark">CONFIDENTIAL FEASIBILITY REPORT</div>
  
  <div class="page">
    <header class="header">
      <div class="logo">
        <div class="logo-main">Structura</div>
        <div class="logo-sub">Aetrnum</div>
      </div>
      <div class="report-info">
        <div><strong>Report Generated:</strong> ${generatedDate}</div>
        <div><strong>Confidence Score:</strong> ${data.confidenceScore || "N/A"}%</div>
      </div>
    </header>
    
    <div class="report-title">
      <h1>ADU Feasibility Report</h1>
      <div class="address">${data.property.address.value}</div>
      <div class="confidential">Confidential - Prepared for Property Owner</div>
    </div>
    
    <div class="two-col">
      <div class="section">
        <h2 class="section-title">Property Summary</h2>
        <div class="section-content">
          <div class="data-row">
            <span class="data-label">Lot Size</span>
            <span class="data-value">${data.property.lotSizeSqFt.value.toLocaleString()} sq ft</span>
          </div>
          <div class="data-row">
            <span class="data-label">Living Area</span>
            <span class="data-value">${data.property.homeAreaSqFt.value.toLocaleString()} sq ft</span>
          </div>
          <div class="data-row">
            <span class="data-label">Zoning</span>
            <span class="data-value">${data.property.zoning.value}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Slope</span>
            <span class="data-value">${data.property.slope.value}</span>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h2 class="section-title">Jurisdiction</h2>
        <div class="section-content">
          <div class="data-row">
            <span class="data-label">Jurisdiction</span>
            <span class="data-value">${data.jurisdiction?.name || "San Diego County"}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Rules Version</span>
            <span class="data-value">${data.jurisdiction?.rulesVersion || "2024"}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Buildable Envelope</span>
            <span class="data-value highlight">${data.buildable.estimatedBuildableEnvelopeSqFt.toLocaleString()} sq ft</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="section">
      <h2 class="section-title">ADU Feasibility Analysis</h2>
      <div class="section-content">
        <div class="data-row">
          <span class="data-label">Recommended Path</span>
          <span class="data-value highlight">${data.bestRecommendation}</span>
        </div>
        ${data.recommendations.map(rec => `
        <div class="data-row">
          <span class="data-label">${rec.type}</span>
          <span class="data-value">${rec.feasibility} — ${rec.estimatedSizeRange}</span>
        </div>
        `).join("")}
      </div>
    </div>
    
    ${data.financialScenarios && data.financialScenarios.length > 0 ? `
    <div class="section">
      <h2 class="section-title">Financial Snapshot</h2>
      <div class="section-content">
        ${data.financialScenarios.slice(0, 3).map(scenario => `
        <div style="margin-bottom: 12px;">
          <div style="font-weight: 600; color: #1a4d2e; margin-bottom: 5px;">${scenario.scenarioName}</div>
          <div class="data-row">
            <span class="data-label">Estimated Cost</span>
            <span class="data-value">$${scenario.estimatedTotalCost.toLocaleString()}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Monthly Rent Potential</span>
            <span class="data-value">$${scenario.estimatedMonthlyIncome.toLocaleString()}/mo</span>
          </div>
          <div class="data-row">
            <span class="data-label">Estimated ROI</span>
            <span class="data-value highlight">${scenario.estimatedRoi}%</span>
          </div>
          <div class="data-row">
            <span class="data-label">Payback Period</span>
            <span class="data-value">${scenario.estimatedPaybackYears} years</span>
          </div>
        </div>
        `).join("")}
      </div>
    </div>
    ` : ""}
    
    ${data.siteConstraints ? `
    <div class="section">
      <h2 class="section-title">Site Conditions</h2>
      <div class="section-content">
        <div class="data-row">
          <span class="data-label">Overall Risk Level</span>
          <span class="data-value">${data.siteConstraints.overallRiskLevel}</span>
        </div>
        ${data.siteConstraints.constraints.map(c => `
        <div class="data-row">
          <span class="data-label">${c.category.charAt(0).toUpperCase() + c.category.slice(1)}</span>
          <span class="data-value">${c.severity === "none" ? "None" : c.severity.charAt(0).toUpperCase() + c.severity.slice(1)}</span>
        </div>
        `).join("")}
      </div>
    </div>
    ` : ""}
    
    <div class="disclaimer">
      <strong>Disclaimer:</strong> ${data.disclaimer}
      ${data.financialDisclaimer ? `<br><br>${data.financialDisclaimer}` : ""}
    </div>
    
    <footer class="footer">
      <div class="footer-brand">Prepared by Structura Aetrnum</div>
      <div>info@structuraaetrnum.com | (858) 833-0705</div>
    </footer>
  </div>
</body>
</html>
  `.trim();
}

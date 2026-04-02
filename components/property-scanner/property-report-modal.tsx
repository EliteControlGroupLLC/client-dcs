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
 * Generate PDF/Print content with Structura Æternum branding
 * Brand Colors: Dark Green (#1B3D2F), Gold (#C9A227), Cream (#F8F6F1)
 * Typography: Barlow (architectural, clean)
 * Layout: Premium, minimal, professional architectural report
 */
function generateStructuraPDFContent(data: PropertyAnalysisResult): string {
  const generatedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Structura Æternum SVG Logo - Architectural monogram with brand colors
  const logoSVG = `
    <svg width="180" height="60" viewBox="0 0 180 60" xmlns="http://www.w3.org/2000/svg">
      <!-- Architectural Column Icon -->
      <g transform="translate(0, 5)">
        <!-- Column base -->
        <rect x="8" y="42" width="34" height="6" fill="#1B3D2F"/>
        <!-- Column shaft -->
        <rect x="12" y="12" width="26" height="30" fill="#1B3D2F"/>
        <!-- Column capital -->
        <rect x="8" y="6" width="34" height="6" fill="#1B3D2F"/>
        <!-- Column top detail -->
        <rect x="10" y="2" width="30" height="4" fill="#C9A227"/>
        <!-- Fluting lines -->
        <line x1="18" y1="12" x2="18" y2="42" stroke="#F8F6F1" stroke-width="1"/>
        <line x1="25" y1="12" x2="25" y2="42" stroke="#F8F6F1" stroke-width="1"/>
        <line x1="32" y1="12" x2="32" y2="42" stroke="#F8F6F1" stroke-width="1"/>
      </g>
      <!-- Brand Name -->
      <text x="55" y="28" font-family="Barlow, Bahnschrift, sans-serif" font-size="22" font-weight="600" fill="#1B3D2F" letter-spacing="2">STRUCTURA</text>
      <text x="55" y="46" font-family="Barlow, Bahnschrift, sans-serif" font-size="12" font-weight="300" fill="#C9A227" letter-spacing="4">ÆTERNUM</text>
    </svg>
  `;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>ADU Feasibility Report - ${data.property.address.value}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700&display=swap');
    
    :root {
      --brand-green: #1B3D2F;
      --brand-gold: #C9A227;
      --brand-cream: #F8F6F1;
      --brand-dark: #1a1a1a;
      --brand-muted: #666666;
      --brand-light: #f5f5f5;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    @page {
      size: letter;
      margin: 0.6in;
    }
    
    body {
      font-family: 'Barlow', 'Bahnschrift', 'Segoe UI', sans-serif;
      color: var(--brand-dark);
      background: #fff;
      line-height: 1.5;
      font-size: 10pt;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    .page {
      max-width: 8.5in;
      margin: 0 auto;
      padding: 0.6in;
      position: relative;
      min-height: 11in;
      background: #fff;
    }
    
    /* Diagonal Watermark */
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-35deg);
      font-family: 'Barlow', sans-serif;
      font-size: 42pt;
      font-weight: 300;
      color: rgba(27, 61, 47, 0.035);
      letter-spacing: 8px;
      white-space: nowrap;
      text-transform: uppercase;
      z-index: 0;
      pointer-events: none;
      user-select: none;
    }
    
    /* Header with Logo */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 20px;
      margin-bottom: 25px;
      border-bottom: 2px solid var(--brand-green);
      position: relative;
      z-index: 1;
    }
    
    .header::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 80px;
      height: 2px;
      background: var(--brand-gold);
    }
    
    .logo-container {
      display: flex;
      align-items: center;
    }
    
    .report-meta {
      text-align: right;
      font-size: 9pt;
      color: var(--brand-muted);
    }
    
    .report-meta strong {
      color: var(--brand-green);
      font-weight: 600;
    }
    
    .report-meta div {
      margin-bottom: 3px;
    }
    
    /* Report Title Block */
    .report-title-block {
      text-align: center;
      padding: 25px 0;
      margin-bottom: 25px;
      background: linear-gradient(135deg, var(--brand-cream) 0%, #fff 100%);
      border: 1px solid rgba(27, 61, 47, 0.1);
      border-radius: 4px;
      position: relative;
      z-index: 1;
    }
    
    .report-title-block h1 {
      font-size: 20pt;
      font-weight: 600;
      color: var(--brand-green);
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-bottom: 10px;
    }
    
    .report-title-block .property-address {
      font-size: 13pt;
      color: var(--brand-dark);
      font-weight: 400;
      margin-bottom: 8px;
    }
    
    .report-title-block .confidential-tag {
      display: inline-block;
      font-size: 8pt;
      color: var(--brand-gold);
      text-transform: uppercase;
      letter-spacing: 3px;
      font-weight: 500;
      padding: 4px 12px;
      border: 1px solid var(--brand-gold);
      border-radius: 2px;
    }
    
    /* Section Styling */
    .section {
      margin-bottom: 20px;
      position: relative;
      z-index: 1;
    }
    
    .section-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
    }
    
    .section-title {
      font-size: 10pt;
      font-weight: 600;
      color: var(--brand-green);
      text-transform: uppercase;
      letter-spacing: 2px;
      margin: 0;
    }
    
    .section-line {
      flex: 1;
      height: 1px;
      background: linear-gradient(90deg, var(--brand-gold) 0%, transparent 100%);
    }
    
    .section-content {
      background: var(--brand-cream);
      border-left: 3px solid var(--brand-green);
      padding: 14px 18px;
      border-radius: 0 4px 4px 0;
    }
    
    /* Data Rows */
    .data-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 7px 0;
      border-bottom: 1px solid rgba(27, 61, 47, 0.08);
    }
    
    .data-row:last-child {
      border-bottom: none;
    }
    
    .data-label {
      color: var(--brand-muted);
      font-weight: 400;
      font-size: 9.5pt;
    }
    
    .data-value {
      color: var(--brand-dark);
      font-weight: 500;
      text-align: right;
      font-size: 9.5pt;
    }
    
    .data-value.highlight {
      color: var(--brand-green);
      font-weight: 600;
    }
    
    .data-value.gold {
      color: var(--brand-gold);
      font-weight: 600;
    }
    
    /* Two Column Layout */
    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
    }
    
    /* Financial Scenario Cards */
    .scenario-card {
      background: #fff;
      border: 1px solid rgba(27, 61, 47, 0.12);
      border-radius: 4px;
      padding: 12px 14px;
      margin-bottom: 10px;
    }
    
    .scenario-card:last-child {
      margin-bottom: 0;
    }
    
    .scenario-title {
      font-size: 10pt;
      font-weight: 600;
      color: var(--brand-green);
      margin-bottom: 8px;
      padding-bottom: 6px;
      border-bottom: 1px solid var(--brand-gold);
    }
    
    /* Disclaimer */
    .disclaimer {
      margin-top: 25px;
      padding: 14px 16px;
      background: var(--brand-light);
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      font-size: 7.5pt;
      color: #777;
      line-height: 1.6;
      position: relative;
      z-index: 1;
    }
    
    .disclaimer strong {
      color: var(--brand-muted);
    }
    
    /* Footer */
    .footer {
      position: absolute;
      bottom: 0.5in;
      left: 0.6in;
      right: 0.6in;
      padding-top: 12px;
      border-top: 1px solid #ddd;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8pt;
      color: #999;
      z-index: 1;
    }
    
    .footer-brand {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .footer-brand-text {
      color: var(--brand-green);
      font-weight: 500;
      letter-spacing: 1px;
    }
    
    .footer-divider {
      width: 1px;
      height: 12px;
      background: var(--brand-gold);
    }
    
    .footer-contact {
      color: var(--brand-muted);
    }
    
    @media print {
      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .page {
        padding: 0;
        margin: 0;
      }
      
      .watermark {
        position: fixed;
        -webkit-print-color-adjust: exact;
      }
      
      .section-content {
        background: var(--brand-cream) !important;
      }
    }
  </style>
</head>
<body>
  <div class="watermark">Confidential Report</div>
  
  <div class="page">
    <!-- Header with Logo -->
    <header class="header">
      <div class="logo-container">
        ${logoSVG}
      </div>
      <div class="report-meta">
        <div><strong>Report Date:</strong> ${generatedDate}</div>
        <div><strong>Confidence:</strong> ${data.confidenceScore || "N/A"}%</div>
        <div><strong>Report ID:</strong> SA-${Date.now().toString(36).toUpperCase()}</div>
      </div>
    </header>
    
    <!-- Title Block -->
    <div class="report-title-block">
      <h1>ADU Feasibility Report</h1>
      <div class="property-address">${data.property.address.value}</div>
      <div class="confidential-tag">Confidential — Prepared for Property Owner</div>
    </div>
    
    <!-- Property & Jurisdiction (Two Columns) -->
    <div class="two-col">
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">Property Summary</h2>
          <div class="section-line"></div>
        </div>
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
        <div class="section-header">
          <h2 class="section-title">Jurisdiction</h2>
          <div class="section-line"></div>
        </div>
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
    
    <!-- ADU Feasibility -->
    <div class="section">
      <div class="section-header">
        <h2 class="section-title">ADU Feasibility Analysis</h2>
        <div class="section-line"></div>
      </div>
      <div class="section-content">
        <div class="data-row">
          <span class="data-label">Recommended Path</span>
          <span class="data-value gold">${data.bestRecommendation}</span>
        </div>
        ${data.recommendations.map(rec => `
        <div class="data-row">
          <span class="data-label">${rec.type}</span>
          <span class="data-value">${rec.feasibility} — ${rec.estimatedSizeRange}</span>
        </div>
        `).join("")}
      </div>
    </div>
    
    <!-- Financial Snapshot -->
    ${data.financialScenarios && data.financialScenarios.length > 0 ? `
    <div class="section">
      <div class="section-header">
        <h2 class="section-title">Financial Snapshot</h2>
        <div class="section-line"></div>
      </div>
      <div class="section-content" style="padding: 10px;">
        ${data.financialScenarios.slice(0, 3).map(scenario => `
        <div class="scenario-card">
          <div class="scenario-title">${scenario.scenarioName}</div>
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
    
    <!-- Site Conditions -->
    ${data.siteConstraints ? `
    <div class="section">
      <div class="section-header">
        <h2 class="section-title">Site Conditions</h2>
        <div class="section-line"></div>
      </div>
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
    
    <!-- Disclaimer -->
    <div class="disclaimer">
      <strong>Disclaimer:</strong> ${data.disclaimer}
      ${data.financialDisclaimer ? `<br><br>${data.financialDisclaimer}` : ""}
    </div>
    
    <!-- Footer -->
    <footer class="footer">
      <div class="footer-brand">
        <span class="footer-brand-text">Prepared by Structura Æternum</span>
        <span class="footer-divider"></span>
        <span>Architecture & Development</span>
      </div>
      <div class="footer-contact">
        info@structuraaetrnum.com | (858) 833-0705
      </div>
    </footer>
  </div>
</body>
</html>
  `.trim();
}

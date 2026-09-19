"use client";

import { useState } from "react";
import { Download, Printer, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PropertyAnalysisResult } from "@/lib/property-intelligence";
import { displayFieldValue } from "@/lib/property-intelligence/types";
import { COMPANY_INFO } from "@/lib/data/site-data";
import { logoSvgMarkup } from "@/components/layout/logo";

/** Escape text interpolated into the print document's HTML. */
function esc(v: unknown): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

interface ReportExportButtonsProps {
  analysisData: PropertyAnalysisResult;
}

export function ReportExportButtons({ analysisData }: ReportExportButtonsProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    setDownloading(true);

    try {
      const pdfContent = generateReportHtml(analysisData);
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(pdfContent);
        printWindow.document.close();
        
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
    const printContent = generateReportHtml(analysisData);
    
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
    <div className="bg-primary/5 rounded-2xl border border-primary/20 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-secondary">Your Report is Ready</h3>
            <p className="text-sm text-muted-foreground">Download or print your ADU Feasibility Report</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" size="lg" rounded="full" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            Print Report
          </Button>
          <Button size="lg" rounded="full" onClick={handleDownloadPDF} disabled={downloading}>
            {downloading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Print palette = the site's design tokens (app/globals.css). Inline hex is
// required here because the report renders in a standalone window.
const PRINT = {
  primary: "#336666",
  secondary: "#1A2B2B",
  accent: "#B99A5A",
  muted: "#F5F7F7",
  mutedForeground: "#5C6B6B",
  border: "#E2E8E8",
} as const;

/**
 * Generate PDF/Print content with TruthCore branding
 * (TruthCore is a DBA of Distinct Construction Solutions).
 */
function generateReportHtml(data: PropertyAnalysisResult): string {
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
  <title>ADU Feasibility Report - ${esc(data.property.address.value)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@400;500;600;700&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Red Hat Display', system-ui, -apple-system, 'Segoe UI', sans-serif;
      color: ${PRINT.secondary};
      background: #fff;
      line-height: 1.6;
      font-size: 11pt;
    }

    .page {
      max-width: 8.5in;
      margin: 0 auto;
      padding: 0.75in;
      position: relative;
    }

    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 48pt;
      color: rgba(51, 102, 102, 0.04);
      font-weight: 700;
      letter-spacing: 4px;
      white-space: nowrap;
      z-index: -1;
      pointer-events: none;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid ${PRINT.primary};
      padding-bottom: 20px;
      margin-bottom: 30px;
    }

    .logo {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }


    .logo-sub {
      font-size: 8pt;
      color: ${PRINT.mutedForeground};
    }

    .report-info {
      text-align: right;
      font-size: 9pt;
      color: ${PRINT.mutedForeground};
    }

    .report-info strong {
      color: ${PRINT.secondary};
      font-weight: 600;
    }

    .report-title {
      text-align: center;
      margin-bottom: 30px;
    }

    .report-title h1 {
      font-size: 20pt;
      font-weight: 700;
      color: ${PRINT.secondary};
      margin-bottom: 6px;
    }

    .report-title .address {
      font-size: 12pt;
      color: ${PRINT.secondary};
      font-weight: 500;
    }

    .report-title .confidential {
      font-size: 8pt;
      font-weight: 600;
      color: ${PRINT.mutedForeground};
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-top: 8px;
    }

    .section {
      margin-bottom: 25px;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .section-title {
      font-size: 10pt;
      font-weight: 700;
      color: ${PRINT.primary};
      text-transform: uppercase;
      letter-spacing: 1.5px;
      border-bottom: 1px solid ${PRINT.accent};
      padding-bottom: 6px;
      margin-bottom: 15px;
    }

    .section-content {
      background: ${PRINT.muted};
      border-left: 3px solid ${PRINT.primary};
      border-radius: 0 8px 8px 0;
      padding: 15px 20px;
    }

    .data-row {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      padding: 6px 0;
      border-bottom: 1px solid ${PRINT.border};
    }

    .data-row:last-child {
      border-bottom: none;
    }

    .data-label {
      color: ${PRINT.mutedForeground};
      font-weight: 400;
    }

    .data-value {
      color: ${PRINT.secondary};
      font-weight: 500;
      text-align: right;
    }

    .data-value.highlight {
      color: ${PRINT.primary};
      font-weight: 700;
    }

    .scenario-name {
      font-weight: 600;
      color: ${PRINT.primary};
      margin-bottom: 5px;
    }

    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    /* Side-by-side sections share one height */
    .two-col .section {
      display: flex;
      flex-direction: column;
    }

    .two-col .section-content {
      flex: 1;
    }

    /* In the document flow (not absolutely positioned) so it can never
       overlap the disclaimer when the report runs past one page. */
    .footer {
      margin-top: 30px;
      border-top: 1px solid ${PRINT.border};
      padding-top: 15px;
      font-size: 8pt;
      color: ${PRINT.mutedForeground};
      display: flex;
      justify-content: space-between;
      gap: 16px;
    }

    .footer-brand {
      color: ${PRINT.primary};
      font-weight: 600;
    }

    .disclaimer {
      break-inside: avoid;
      page-break-inside: avoid;
      margin-top: 30px;
      padding: 15px;
      background: ${PRINT.muted};
      border: 1px solid ${PRINT.border};
      border-radius: 8px;
      font-size: 8pt;
      color: ${PRINT.mutedForeground};
      line-height: 1.5;
    }

    .disclaimer strong {
      color: ${PRINT.secondary};
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
        ${logoSvgMarkup("color", 28)}
        <div class="logo-sub">TruthCore is a DBA of ${esc(COMPANY_INFO.name)}</div>
      </div>
      <div class="report-info">
        <div><strong>Report Generated:</strong> ${generatedDate}</div>
        <div><strong>Confidence Score:</strong> ${typeof data.confidenceScore === "number" ? `${data.confidenceScore}%` : "Not available"}</div>
      </div>
    </header>
    
    <div class="report-title">
      <h1>ADU Feasibility Report</h1>
      <div class="address">${esc(data.property.address.value)}</div>
      <div class="confidential">Confidential - Prepared for Property Owner</div>
    </div>
    
    <div class="two-col">
      <div class="section">
        <h2 class="section-title">Property Summary</h2>
        <div class="section-content">
          <div class="data-row">
            <span class="data-label">Lot Size</span>
            <span class="data-value">${esc(displayFieldValue(data.property.lotSizeSqFt, "sq ft"))}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Living Area</span>
            <span class="data-value">${esc(displayFieldValue(data.property.homeAreaSqFt, "sq ft"))}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Zoning</span>
            <span class="data-value">${esc(displayFieldValue(data.property.zoning))}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Slope</span>
            <span class="data-value">${esc(displayFieldValue(data.property.slope))}</span>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h2 class="section-title">Jurisdiction</h2>
        <div class="section-content">
          <div class="data-row">
            <span class="data-label">Jurisdiction</span>
            <span class="data-value">${esc(data.jurisdiction?.name ?? "Not available")}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Rules Version</span>
            <span class="data-value">${esc(data.jurisdiction?.rulesVersion ?? "Not available")}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Buildable Envelope</span>
            <span class="data-value highlight">${data.buildable.envelopeLabel ?? `${data.buildable.estimatedBuildableEnvelopeSqFt.toLocaleString()} sq ft`}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="section">
      <h2 class="section-title">ADU Feasibility Analysis</h2>
      <div class="section-content">
        <div class="data-row">
          <span class="data-label">Recommended Path</span>
          <span class="data-value highlight">${esc(data.bestRecommendation)}</span>
        </div>
        ${data.recommendations.map(rec => `
        <div class="data-row">
          <span class="data-label">${esc(rec.type)}</span>
          <span class="data-value">${esc(rec.feasibility)} — ${esc(rec.estimatedSizeRange)}</span>
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
          <div class="scenario-name">${esc(scenario.scenarioName)} (planning estimate)</div>
          <div class="data-row">
            <span class="data-label">Estimated Cost</span>
            <span class="data-value">$${scenario.estimatedTotalCost.toLocaleString()}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Monthly Rent ${scenario.rentSource === "rentcast" ? "(RentCast market estimate)" : "(planning estimate)"}</span>
            <span class="data-value">$${scenario.estimatedMonthlyIncome.toLocaleString()}/mo</span>
          </div>
          <div class="data-row">
            <span class="data-label">Estimated ROI</span>
            <span class="data-value highlight">${scenario.estimatedRoi}%</span>
          </div>
          <div class="data-row">
            <span class="data-label">Payback Period</span>
            <span class="data-value">${scenario.estimatedPaybackYears < 99 ? `${scenario.estimatedPaybackYears} years` : "N/A (cash flow not positive)"}</span>
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
          <span class="data-label">${esc(c.category.charAt(0).toUpperCase() + c.category.slice(1))}</span>
          <span class="data-value">${esc(c.confidence === 0 ? "Not checked" : c.classification)}</span>
        </div>
        `).join("")}
      </div>
    </div>
    ` : ""}
    
    <div class="disclaimer">
      <strong>Disclaimer:</strong> ${esc(data.disclaimer)}
      ${data.financialDisclaimer ? `<br><br>${esc(data.financialDisclaimer)}` : ""}
    </div>
    
    <footer class="footer">
      <div class="footer-brand">Prepared by TruthCore</div>
      <div>${esc(COMPANY_INFO.email)} | ${esc(COMPANY_INFO.phone)}</div>
    </footer>
  </div>
</body>
</html>
  `.trim();
}

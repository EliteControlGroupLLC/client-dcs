"use client";

import { useState } from "react";
import { Download, Printer, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PropertyAnalysisResult } from "@/lib/property-intelligence";

interface ReportExportButtonsProps {
  analysisData: PropertyAnalysisResult;
}

export function ReportExportButtons({ analysisData }: ReportExportButtonsProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    setDownloading(true);

    try {
      const pdfContent = generateStructuraPDFContent(analysisData);
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
    <div className="bg-gradient-to-r from-primary/5 to-emerald-50 rounded-2xl border border-primary/20 p-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-secondary">Your Report is Ready</h3>
            <p className="text-sm text-muted-foreground">Download or print your ADU Feasibility Report</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" rounded="full" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            Print Report
          </Button>
          <Button rounded="full" onClick={handleDownloadPDF} disabled={downloading}>
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

/**
 * Generate PDF/Print content with Structura Aetrnum branding
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
    
    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    
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

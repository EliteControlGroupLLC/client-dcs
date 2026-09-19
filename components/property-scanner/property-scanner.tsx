"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Search, MapPinOff, MapPin, Loader2, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddressAutocompleteInput } from "./address-autocomplete-input";
import { PropertyScanLoading } from "./property-scan-loading";
import { PropertySummaryCard } from "./property-summary-card";
import { BuildableAreaCard } from "./buildable-area-card";
import { RecommendationCard } from "./recommendation-card";
import { SmartRecommendationBanner } from "./smart-recommendation-banner";
import { NextStepCTA } from "./next-step-cta";
import { SiteDiagram } from "./site-diagram";
import { MapPreview } from "./map-preview";
import { MapboxMap } from "./mapbox-map";
import { JurisdictionSnapshotCard } from "./jurisdiction-snapshot-card";
import { AduRulesSnapshotCard } from "./adu-rules-snapshot-card";
import { FinancialPreviewCard } from "./financial-preview-card";
import { EquityAppraisalCard } from "./equity-appraisal-card";
import { ConfidenceScoreCard } from "./confidence-score-card";
import { ZoningEnrichmentCard } from "./zoning-enrichment-card";
import { RentEstimateCard } from "./rent-estimate-card";
import { RentScenariosCard } from "./rent-scenarios-card";
// Removed: DetectedStructuresCard - not client-facing per requirements
import { ImageryWarningBanner } from "./imagery-warning-banner";
import { SiteConstraintsCard } from "./site-constraints-card";
// Removed: DataSourcesBadge - not client-facing per requirements
import { LeadCaptureForm } from "./lead-capture-form";
import { PropertyReportModal } from "./property-report-modal";
import { LockedReportPreview } from "./locked-report-preview";
import { FLOOR_PLANS } from "@/lib/data/site-data";
import { ReportExportButtons } from "./report-export-buttons";
// Removed: ShowSourcesPanel - not client-facing per requirements
import type { PropertyAnalysisResult } from "@/lib/property-intelligence";
import { trackScanCompleted, trackLeadSubmitted } from "@/lib/analytics";

type ScanPhase = "address" | "scanning" | "results" | "unresolved";

// Why a scan produced no report. The first three come from
// /api/analyze-property (422); PICK_SUGGESTION is the client-side
// "several suggestions match what you typed" prompt.
type LookupIssueCode =
  | "ADDRESS_NOT_FOUND"
  | "ADDRESS_AMBIGUOUS"
  | "OUT_OF_AREA"
  | "PICK_SUGGESTION"
  | "ERROR";
interface LookupIssue {
  code: LookupIssueCode;
  message: string;
  candidates: string[];
}
const SERVER_LOOKUP_CODES = new Set<LookupIssueCode>(["ADDRESS_NOT_FOUND", "ADDRESS_AMBIGUOUS", "OUT_OF_AREA"]);

const ISSUE_TITLES: Record<LookupIssueCode, string> = {
  ADDRESS_NOT_FOUND: "We couldn't find that property",
  ADDRESS_AMBIGUOUS: "Which property did you mean?",
  PICK_SUGGESTION: "Which property did you mean?",
  OUT_OF_AREA: "That address is outside our service area",
  ERROR: "We couldn't complete the scan",
};

const normalizeAddr = (s: string) => s.toLowerCase().replace(/[.,#]/g, " ").replace(/\s+/g, " ").trim();
const houseNumberOf = (s: string) => s.trim().match(/^(\d+)/)?.[1] ?? null;

// Parse a numeric ADU size from a size-range label like "1,000 - 1,200 sq ft"
// (returns the upper bound — the best-case recommended size).
function parseRecommendedSqFt(sizeRange?: string | null): number | null {
  if (!sizeRange) return null;
  const nums = (sizeRange.match(/\d[\d,]*/g) || [])
    .map((n) => parseInt(n.replace(/,/g, ""), 10))
    .filter((n) => Number.isFinite(n) && n >= 100 && n <= 5000);
  return nums.length ? Math.max(...nums) : null;
}

export function PropertyScanner() {
  const [phase, setPhase] = useState<ScanPhase>("address");
  const [address, setAddress] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [analysisData, setAnalysisData] = useState<PropertyAnalysisResult | null>(null);
  // Server signature over analysisData — lets /api/property-report verify the
  // scan a lead submits wasn't altered in the browser.
  const [reportToken, setReportToken] = useState<string | null>(null);
  const [reportUnlocked, setReportUnlocked] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState<Record<string, unknown> | undefined>(undefined);
  // Why the last scan produced no report (never render a report for an
  // unresolved address — no guessing, no fabricated defaults).
  const [issue, setIssue] = useState<LookupIssue | null>(null);
  const [resolving, setResolving] = useState(false);
  const [animationDone, setAnimationDone] = useState(false);
  const scanSeqRef = useRef(0);

  const handleAddressSelect = (addr: string) => {
    setSelectedAddress(addr);
  };

  const handleAddressChange = (value: string) => {
    setAddress(value);
    // Editing after picking a suggestion invalidates that pick.
    if (value !== selectedAddress) setSelectedAddress("");
  };

  // Run the server analysis for one concrete address. Only a real,
  // parcel-matched San Diego County property yields a report; anything else
  // comes back as a lookup issue (422) that we show instead.
  const runScan = async (target: string) => {
    const seq = ++scanSeqRef.current;
    setAddress(target);
    setSelectedAddress(target);
    setAnalysisData(null);
    setReportToken(null);
    setIssue(null);
    setAnimationDone(false);
    setReportUnlocked(false);
    setPhase("scanning");

    try {
      const serverRes = await fetch("/api/analyze-property", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: target }),
      });
      const data = await serverRes.json().catch(() => null);
      if (seq !== scanSeqRef.current) return; // a newer scan started
      if (serverRes.ok && data?.success && data.result) {
        if (typeof data.meta?.resolvedAddress === "string" && data.meta.resolvedAddress) {
          setSelectedAddress(data.meta.resolvedAddress);
        }
        setAnalysisData(data.result);
        setReportToken(typeof data.reportToken === "string" ? data.reportToken : null);
        return;
      }
      if (data && SERVER_LOOKUP_CODES.has(data.code)) {
        setIssue({
          code: data.code,
          message: String(data.message ?? ""),
          candidates: Array.isArray(data.candidates) ? data.candidates : [],
        });
      } else {
        setIssue({
          code: "ERROR",
          message: "Our property lookup is temporarily unavailable. Please try again in a moment.",
          candidates: [],
        });
      }
      setPhase("unresolved");
    } catch {
      if (seq !== scanSeqRef.current) return;
      setIssue({
        code: "ERROR",
        message: "Our property lookup is temporarily unavailable. Please try again in a moment.",
        candidates: [],
      });
      setPhase("unresolved");
    }
  };

  // Scan button / Enter. A picked suggestion scans directly; free text is
  // first matched against real-address suggestions: exactly one match → use
  // it (the loading state shows the full resolved address); several → ask.
  const handleStartScan = async () => {
    const typed = (selectedAddress || address).trim();
    if (!typed || resolving) return;
    if (selectedAddress && selectedAddress === address) {
      void runScan(selectedAddress);
      return;
    }

    setResolving(true);
    let target = typed;
    try {
      const res = await fetch(`/api/address-suggest?q=${encodeURIComponent(typed)}`);
      const data = (await res.json()) as { suggestions?: string[] };
      const houseNo = houseNumberOf(typed);
      const suggestions = (data.suggestions ?? []).filter(
        (s) => houseNumberOf(s) !== null && (!houseNo || houseNumberOf(s) === houseNo)
      );
      const exact = suggestions.find((s) => normalizeAddr(s) === normalizeAddr(typed));
      if (exact) {
        target = exact;
      } else if (suggestions.length === 1) {
        target = suggestions[0];
      } else if (suggestions.length > 1) {
        setIssue({
          code: "PICK_SUGGESTION",
          message: "Several San Diego County addresses match what you typed. Pick yours to scan it.",
          candidates: suggestions,
        });
        setPhase("unresolved");
        return;
      }
      // No suggestion: send the typed text — the server resolves it or
      // reports it as not found / out of area.
    } catch {
      // Suggest service down — the server-side resolver still gates it.
    } finally {
      setResolving(false);
    }
    void runScan(target);
  };

  // Stable callback so the loading animation doesn't restart when data lands.
  const handleScanComplete = useCallback(() => {
    setAnimationDone(true);
  }, []);

  // Show results only once the animation has finished AND a real report exists.
  useEffect(() => {
    if (phase === "scanning" && animationDone && analysisData) {
      setPhase("results");
      trackScanCompleted(selectedAddress, analysisData.confidenceScore || 0);
    }
  }, [phase, animationDone, analysisData, selectedAddress]);

  const handleRescan = () => {
    scanSeqRef.current++;
    setPhase("address");
    setAddress("");
    setSelectedAddress("");
    setAnalysisData(null);
    setReportToken(null);
    setIssue(null);
    setReportUnlocked(false);
  };

  // Back to the input with the typed text kept, so it can be corrected.
  const handleEditAddress = () => {
    setIssue(null);
    setSelectedAddress("");
    setPhase("address");
  };

  const handleReportUnlocked = () => {
    setReportUnlocked(true);
    trackLeadSubmitted("property-scanner-report", selectedAddress);
  };

  // Derive the recommended ADU + financials for the Equity & Appraisal module.
  const bestRec = analysisData?.recommendations?.find(
    (r) => r.type === analysisData?.bestRecommendation
  );
  const recommendedAduType = analysisData?.bestRecommendation || bestRec?.type || "ADU";
  // The financial scenario for the SAME unit the report recommends (its name
  // is "<size> sq ft <type>"), so value-add inputs match what's shown.
  const primaryScenario =
    analysisData?.financialScenarios?.find((s) => s.scenarioName.endsWith(recommendedAduType)) ??
    analysisData?.financialScenarios?.find((s) => s.scenarioType !== "maximize") ??
    analysisData?.financialScenarios?.[0];
  const scenarioSqFt = primaryScenario ? parseInt(primaryScenario.scenarioName.replace(/,/g, ""), 10) : NaN;
  const recommendedAduSqFt =
    Number.isFinite(scenarioSqFt) && scenarioSqFt > 0
      ? scenarioSqFt
      : parseRecommendedSqFt(bestRec?.estimatedSizeRange) ?? 0;
  const recommendedAduLabel =
    recommendedAduSqFt > 0
      ? `${recommendedAduSqFt.toLocaleString()} sq ft ${recommendedAduType}`
      : recommendedAduType;
  // Income figure for the value-add model = NOI (cashflow before debt service).
  const aduAnnualNetIncome = primaryScenario
    ? primaryScenario.estimatedAnnualNetCashflow + primaryScenario.estimatedMonthlyPayment * 12
    : null;
  const aduTotalCost = primaryScenario?.estimatedTotalCost ?? null;
  // Only a real recorded living area — never the resolver's "typical" stand-in.
  const homeAreaField = analysisData?.property?.homeAreaSqFt;
  const homeAreaSqFt = homeAreaField && homeAreaField.status !== "Unavailable" ? homeAreaField.value : null;

  return (
    <div className="min-h-screen bg-muted">
      {/* Hero header — same dark interior hero as the rest of the site
          (pt-40 clears the fixed 81px header with 80px of breathing room). */}
      <section className="bg-secondary bg-[radial-gradient(ellipse_at_top,rgba(51,102,102,0.35),transparent_60%)] text-white pt-40 pb-20">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
            San Diego ADU Eligibility Scanner
          </span>

          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
            Build Your Dream Home or ADU with Confidence
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">
            Enter your property address and we&apos;ll scan it to estimate what you may be able to build.
          </p>

          {/* Address input */}
          {(phase === "address" || phase === "unresolved") && (
            <div className="max-w-2xl mx-auto animate-fade-in">
              <AddressAutocompleteInput
                value={address}
                onChange={handleAddressChange}
                onSelect={handleAddressSelect}
                onEnter={() => void handleStartScan()}
                placeholder="Type your San Diego property address..."
              />
              <div className="mt-4">
                <Button
                  size="lg"
                  rounded="full"
                  onClick={() => void handleStartScan()}
                  disabled={(!address && !selectedAddress) || resolving}
                  className="group"
                >
                  {resolving ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Search className="h-5 w-5" />
                  )}
                  {resolving ? "Finding your property..." : "Scan My Property"}
                </Button>
              </div>
              <p className="text-sm text-white/75 mt-4">
                Addresses in San Diego County only. Results are preliminary estimates.
              </p>
            </div>
          )}

          {(phase === "scanning" || phase === "results") && (
            <div className="animate-fade-in">
              <div className="inline-flex flex-col sm:flex-row items-center gap-1 sm:gap-3 max-w-full bg-secondary-light border border-white/10 shadow-lg shadow-black/20 rounded-2xl sm:rounded-full px-5 py-3">
                <span className="text-sm text-white/80">{selectedAddress}</span>
                {phase === "results" && (
                  <button
                    type="button"
                    onClick={handleRescan}
                    className="inline-flex items-center min-h-11 -my-3 text-sm font-medium text-accent hover:text-accent-light underline underline-offset-4 whitespace-nowrap"
                  >
                    Scan different address
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Content area */}
      <div className="relative z-10 container mx-auto px-4 max-w-7xl -mt-8 pb-20">
        {/* Scanning phase */}
        {phase === "scanning" && (
          <div className="bg-white rounded-2xl shadow-xl border border-border p-6 sm:p-8">
            <PropertyScanLoading
              address={selectedAddress}
              onComplete={handleScanComplete}
            />
          </div>
        )}

        {/* Unresolved lookup — no report, no lead form, never a guess */}
        {phase === "unresolved" && issue && (
          <div
            role="alert"
            data-testid="scan-lookup-issue"
            data-issue-code={issue.code}
            className="bg-white rounded-2xl shadow-xl border border-border p-6 sm:p-8 max-w-3xl mx-auto animate-fade-in"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <MapPinOff className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-bold text-secondary">{ISSUE_TITLES[issue.code]}</h2>
                {issue.message && (
                  <p className="text-sm text-muted-foreground mt-2">{issue.message}</p>
                )}
              </div>
            </div>

            {issue.candidates.length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  {issue.candidates.length === 1 ? "Did you mean" : "Choose your property"}
                </p>
                <div className="rounded-lg border border-border overflow-hidden">
                  {issue.candidates.map((candidate, index) => (
                    <button
                      type="button"
                      key={candidate}
                      onClick={() => void runScan(candidate)}
                      className={`w-full flex items-center gap-3 px-5 py-4 text-left text-secondary hover:bg-primary/5 hover:text-primary transition-colors ${
                        index !== issue.candidates.length - 1 ? "border-b border-border/50" : ""
                      }`}
                    >
                      <MapPin className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      <span className="text-sm font-medium">{candidate}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button variant="outline" size="lg" rounded="full" onClick={handleEditAddress}>
                Edit address
              </Button>
              <p className="text-sm text-muted-foreground">
                {issue.code === "OUT_OF_AREA"
                  ? "We currently serve properties in San Diego County."
                  : "Tip: start typing and pick your address from the suggestions."}
              </p>
            </div>
          </div>
        )}

        {/* Results phase - LOCKED until user submits info */}
        {phase === "results" && analysisData && !reportUnlocked && (
          <LockedReportPreview
            analysisData={analysisData}
            reportToken={reportToken}
            propertyAddress={selectedAddress}
            onReportUnlocked={handleReportUnlocked}
          />
        )}

        {/* Results phase - UNLOCKED after user submits info */}
        {phase === "results" && analysisData && reportUnlocked && (
          <div className="space-y-8 animate-fade-in">
            {/* Smart Recommendation Banner */}
            <SmartRecommendationBanner
              recommendation={analysisData.smartBanner.recommendation}
              details={analysisData.smartBanner.details}
            />

            {/* Confidence Tag */}
            {analysisData.confidenceScore !== undefined && analysisData.confidenceBand && (
              <ConfidenceScoreCard
                score={analysisData.confidenceScore}
                band={analysisData.confidenceBand}
                manualReviewRequired={analysisData.manualReviewRequired || false}
                manualReviewReasons={analysisData.manualReviewReasons || []}
                signals={analysisData.confidenceSignals || { positive: [], negative: [] }}
              />
            )}

            {/* Main grid: Property info + Map/Diagram */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left column - Property Summary, Jurisdiction, and Rules */}
              <div className="lg:col-span-2 space-y-6">
                <PropertySummaryCard data={analysisData.property} />

                {/* Jurisdiction + Rules side by side on large screens */}
                {analysisData.jurisdiction && analysisData.aduRulesSnapshot && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <JurisdictionSnapshotCard data={analysisData.jurisdiction} />
                    <AduRulesSnapshotCard
                      data={analysisData.aduRulesSnapshot}
                      jurisdictionName={analysisData.jurisdiction.name}
                    />
                  </div>
                )}

                <BuildableAreaCard data={analysisData.buildable} />
              </div>

              {/* Right column - Map and Site Diagram */}
              <div className="space-y-6">
                {/* Premium Mapbox map if geocoded data available */}
                {analysisData.geocoded ? (
                  <MapboxMap analysisData={analysisData} />
                ) : (
                  <MapPreview address={selectedAddress} />
                )}
                <SiteDiagram
                  geometryResult={analysisData.strictGeometry as Parameters<typeof SiteDiagram>[0]["geometryResult"]}
                  {...analysisData.lotDimensions}
                />
              </div>
            </div>

            {/* Imagery Warning */}
            {analysisData.imageryWarning && (
              <ImageryWarningBanner message={analysisData.imageryWarning} />
            )}

            {/* Detected Structures - Removed from client-facing view */}

            {/* Zoning Enrichment + Rent Estimates row */}
            {(analysisData.zoningEnrichment || analysisData.rentData) && (
              <div className={`grid grid-cols-1 gap-6 ${analysisData.zoningEnrichment && analysisData.rentData ? "md:grid-cols-2" : ""}`}>
                {analysisData.zoningEnrichment && (
                  <ZoningEnrichmentCard data={analysisData.zoningEnrichment} />
                )}
                {analysisData.rentData && (
                  <RentEstimateCard data={analysisData.rentData} />
                )}
              </div>
            )}

            {/* Site Constraints */}
            {analysisData.siteConstraints && (
              <SiteConstraintsCard data={analysisData.siteConstraints} />
            )}

            {/* Rent Scenarios (Conservative / Market / Premium) */}
            {analysisData.rentScenarios && analysisData.rentScenarios.length > 0 && (
              <RentScenariosCard scenarios={analysisData.rentScenarios} />
            )}

            {/* Recommended ADU Paths */}
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-secondary">Recommended ADU Paths</h2>
                <p className="text-sm text-muted-foreground mt-1">Your property may qualify for the following options</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {analysisData.recommendations.map((rec) => (
                  <RecommendationCard
                    key={rec.type}
                    data={rec}
                    isRecommended={rec.type === analysisData.bestRecommendation}
                  />
                ))}
              </div>
            </div>

            {/* Financial Preview */}
            {analysisData.financialScenarios && analysisData.financialScenarios.length > 0 && (
              <FinancialPreviewCard
                scenarios={analysisData.financialScenarios}
                disclaimer={analysisData.financialDisclaimer}
              />
            )}

            {/* Home Value, Equity & Projected Value after the recommended ADU */}
            {analysisData.recommendations && analysisData.recommendations.length > 0 && (
              <EquityAppraisalCard
                address={selectedAddress}
                recommendedAduLabel={recommendedAduLabel}
                recommendedAduSqFt={recommendedAduSqFt}
                recommendedAduType={recommendedAduType}
                homeAreaSqFt={homeAreaSqFt}
                aduAnnualNetIncome={aduAnnualNetIncome}
                aduTotalCost={aduTotalCost}
              />
            )}

            {/* Report Download/Print Buttons - Only shown after unlock */}
            <ReportExportButtons analysisData={analysisData} />

            {/* Data sources and debug info removed from client-facing view */}

            {/* Disclaimer */}
            <div className="bg-muted/50 rounded-2xl border border-border/50 p-5">
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                {analysisData.disclaimer}
              </p>
            </div>

            {/* Floor plans + pricing — every TruthCore option so clients can compare */}
            <div className="bg-white rounded-2xl border border-border p-6 sm:p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-secondary">Our ADU Floor Plans &amp; Pricing</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Every option we build, from garage conversions to full detached units. Prices are
                  turnkey estimates — your site review confirms the exact scope.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {FLOOR_PLANS.map((plan) => (
                  <div
                    key={plan.id}
                    className="rounded-2xl border border-border p-6 flex flex-col h-full"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-xl font-semibold text-secondary">{plan.name}</h3>
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {plan.sqFt.toLocaleString()} sq ft
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 mb-4">
                      {plan.bedrooms === 0 ? "Studio" : `${plan.bedrooms} bed`} · {plan.bathrooms} bath
                    </p>
                    <div className="mt-auto pt-4 border-t border-border">
                      <div className="text-lg font-bold text-primary">{plan.priceRange}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Est. rent ${plan.rentEstimate.low.toLocaleString()}&nbsp;– $
                        {plan.rentEstimate.high.toLocaleString()}/mo
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Section */}
            <NextStepCTA />

            {/* Property Report Modal with PDF/Print */}
            {analysisData && (
              <PropertyReportModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                analysisData={analysisData}
                reportData={reportData}
              />
            )}
          </div>
        )}

        {/* Address phase - show info cards below */}
        {phase === "address" && (
          // mt-28 offsets the container's -mt-8 overlap → the standard 80px (py-20) section gap
          <div className="mt-28">
            {/* Trust indicators */}
            <div className="grid sm:grid-cols-3 gap-6 mb-12">
              {[
                {
                  title: "Instant Property Scan",
                  description: "Get a preliminary ADU eligibility analysis in seconds, not weeks.",
                  icon: Search,
                },
                {
                  title: "San Diego Experts",
                  description: "Our analysis is based on San Diego County ADU regulations and setback requirements.",
                  icon: MapPin,
                },
                {
                  title: "Free & No Obligation",
                  description: "Explore your options with zero pressure. Book a review only when you're ready.",
                  icon: BadgeCheck,
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-white rounded-2xl border border-border p-6 text-center h-full"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-secondary mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground text-pretty">{item.description}</p>
                </div>
              ))}
            </div>

            {/* How it works */}
            <div className="bg-white rounded-2xl border border-border p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-secondary text-center mb-8">How It Works</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { step: "1", title: "Enter Address", desc: "Type your San Diego property address" },
                  { step: "2", title: "Instant Analysis", desc: "We scan lot size, setbacks, and zoning" },
                  { step: "3", title: "See Your Options", desc: "Get recommended ADU types and sizes" },
                  { step: "4", title: "Book a Review", desc: "Schedule a free property verification" },
                ].map((item) => (
                  <div key={item.step} className="text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-lg flex items-center justify-center mx-auto mb-3">
                      {item.step}
                    </div>
                    <h3 className="text-lg font-semibold text-secondary mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

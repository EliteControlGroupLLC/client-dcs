"use client";

import { useState, useCallback } from "react";
import { Shield, Search } from "lucide-react";
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

type ScanPhase = "address" | "scanning" | "results";

// Mock analysis data - will be replaced with real API data
function generateMockAnalysis(address: string) {
  // Simulate different results based on address
  const isLargeLot = address.includes("1234") || address.includes("7890");
  const hasGarage = !address.includes("4567");

  const lotSizeSqFt = isLargeLot ? 7200 : 5400;
  const mainHomeFootprintSqFt = isLargeLot ? 1800 : 1400;
  const estimatedOpenAreaSqFt = lotSizeSqFt - mainHomeFootprintSqFt - 800; // subtract driveway/patio
  const estimatedBuildableEnvelopeSqFt = isLargeLot ? 950 : 520;

  const detachedFeasibility = isLargeLot ? "Likely" as const : "Limited" as const;
  const attachedFeasibility = "Possible" as const;
  const garageFeasibility = hasGarage ? "Likely" as const : "Not Recommended" as const;
  const secondStoryFeasibility = "Possible" as const;

  const bestRecommendation = isLargeLot ? "Detached ADU" : hasGarage ? "Garage Conversion" : "Attached ADU";

  return {
    property: {
      address,
      lotSizeSqFt,
      mainHomeFootprintSqFt,
      estimatedOpenAreaSqFt,
      zoning: "RS-1-7",
      slope: "Mostly flat",
    },
    buildable: {
      requiredMainHomeSeparationFt: 6,
      requiredPropertyLineSetbackFt: 3,
      estimatedBuildableEnvelopeSqFt,
      oneStoryPotential: `Up to ${estimatedBuildableEnvelopeSqFt.toLocaleString()} sq ft estimated`,
      twoStoryPotential: isLargeLot
        ? "Up to 1,200 sq ft estimated depending on design/review"
        : "Up to 800 sq ft estimated depending on design/review",
    },
    recommendations: [
      {
        type: "Detached ADU",
        feasibility: detachedFeasibility,
        estimatedSizeRange: isLargeLot ? "600 - 1,200 sq ft" : "400 - 600 sq ft",
        priceRange: isLargeLot ? "$175K - $350K" : "$120K - $200K",
        description: isLargeLot
          ? "Based on this preliminary scan, a detached ADU appears feasible. Your lot has sufficient open area to accommodate a standalone unit with required setbacks."
          : "Your lot appears tight for a detached ADU. Limited buildable area may restrict unit size, but a smaller detached unit may still be possible.",
      },
      {
        type: "Attached ADU",
        feasibility: attachedFeasibility,
        estimatedSizeRange: "400 - 800 sq ft",
        priceRange: "$130K - $250K",
        description: "An attached ADU extends from your existing home. This option can work well when yard space is limited, as it shares a wall with the main residence.",
      },
      {
        type: "Garage Conversion",
        feasibility: garageFeasibility,
        estimatedSizeRange: hasGarage ? "350 - 500 sq ft" : "N/A",
        priceRange: hasGarage ? "$80K - $160K" : "N/A",
        description: hasGarage
          ? "Your property may qualify for a garage conversion. This is often the most cost-effective ADU option, converting existing structure into livable space."
          : "No existing garage structure detected. A garage conversion would not apply to this property.",
      },
      {
        type: "Second-Story ADU",
        feasibility: secondStoryFeasibility,
        estimatedSizeRange: "400 - 1,000 sq ft",
        priceRange: "$200K - $400K",
        description: "A second-story ADU is built above your existing home or garage. This option maximizes yard space while adding significant livable area.",
      },
    ],
    bestRecommendation,
    smartBanner: {
      recommendation: isLargeLot
        ? `Best fit for your property: Detached ADU up to approximately 800-1,200 sq ft`
        : hasGarage
        ? `Your lot appears limited for a detached ADU. A garage conversion may be the better path.`
        : `Consider an attached ADU or second-story addition to maximize your property's potential.`,
      details: isLargeLot
        ? "Your property has sufficient open yard area and favorable lot dimensions to support a standalone ADU. With an estimated buildable envelope of 950 sq ft, you have strong potential for a comfortable 1-2 bedroom detached unit."
        : hasGarage
        ? "Your lot looks tight for a detached ADU, but you may still have strong conversion options. A garage conversion is typically the most affordable path and can deliver a beautiful, functional living space."
        : "Based on the available buildable area, an attached ADU or second-story addition would maximize your property's ADU potential while working within the existing lot constraints.",
    },
    lotDimensions: {
      lotWidth: isLargeLot ? 60 : 45,
      lotDepth: isLargeLot ? 120 : 120,
      mainHomeWidth: isLargeLot ? 35 : 30,
      mainHomeDepth: isLargeLot ? 45 : 40,
    },
    disclaimer: "Preliminary estimate only. Final feasibility depends on site verification, title review, zoning, utility conditions, and city approval.",
  };
}

export function PropertyScanner() {
  const [phase, setPhase] = useState<ScanPhase>("address");
  const [address, setAddress] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [analysisData, setAnalysisData] = useState<ReturnType<typeof generateMockAnalysis> | null>(null);

  const handleAddressSelect = (addr: string) => {
    setSelectedAddress(addr);
  };

  const handleStartScan = () => {
    if (!selectedAddress && !address) return;
    const finalAddress = selectedAddress || address;
    setSelectedAddress(finalAddress);
    setAnalysisData(generateMockAnalysis(finalAddress));
    setPhase("scanning");
  };

  const handleScanComplete = useCallback(() => {
    setPhase("results");
  }, []);

  const handleRescan = () => {
    setPhase("address");
    setAddress("");
    setSelectedAddress("");
    setAnalysisData(null);
  };

  return (
    <div className="min-h-screen bg-muted pt-20">
      {/* Hero header */}
      <div className="bg-gradient-to-br from-secondary via-secondary to-secondary-light text-white py-16 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 architectural-grid opacity-30" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm">San Diego ADU Eligibility Scanner</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Enter Your Property Address
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto mb-10">
            We&apos;ll scan your property to estimate what kind of ADU or garage conversion may fit.
          </p>

          {/* Address input - always visible in header */}
          {phase === "address" && (
            <div className="max-w-2xl mx-auto animate-fade-in">
              <AddressAutocompleteInput
                value={address}
                onChange={setAddress}
                onSelect={handleAddressSelect}
                placeholder="Type your San Diego property address..."
              />
              <div className="mt-4">
                <Button
                  size="lg"
                  rounded="full"
                  onClick={handleStartScan}
                  disabled={!address && !selectedAddress}
                  className="group"
                >
                  <Search className="h-5 w-5" />
                  Scan My Property
                </Button>
              </div>
              <p className="text-xs text-white/40 mt-4">
                Addresses in San Diego County only. Results are preliminary estimates.
              </p>
            </div>
          )}

          {(phase === "scanning" || phase === "results") && (
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3">
                <span className="text-sm text-white/80">{selectedAddress}</span>
                {phase === "results" && (
                  <button
                    onClick={handleRescan}
                    className="text-xs text-primary hover:text-primary-light underline ml-2"
                  >
                    Scan different address
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-8 pb-16">
        {/* Scanning phase */}
        {phase === "scanning" && (
          <div className="bg-white rounded-3xl shadow-xl border border-border p-8 md:p-12">
            <PropertyScanLoading
              address={selectedAddress}
              onComplete={handleScanComplete}
            />
          </div>
        )}

        {/* Results phase */}
        {phase === "results" && analysisData && (
          <div className="space-y-8 animate-fade-in">
            {/* Smart Recommendation Banner */}
            <SmartRecommendationBanner
              recommendation={analysisData.smartBanner.recommendation}
              details={analysisData.smartBanner.details}
            />

            {/* Main grid: Property info + Map/Diagram */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left column - Property Summary & Buildable Area */}
              <div className="lg:col-span-2 space-y-6">
                <PropertySummaryCard data={analysisData.property} />
                <BuildableAreaCard data={analysisData.buildable} />
              </div>

              {/* Right column - Map & Site Diagram */}
              <div className="space-y-6">
                <MapPreview address={selectedAddress} />
                <SiteDiagram {...analysisData.lotDimensions} />
              </div>
            </div>

            {/* Recommended ADU Paths */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <h2 className="text-2xl font-bold text-secondary">Recommended ADU Paths</h2>
                <p className="text-sm text-muted-foreground">Your property may qualify for the following options</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {analysisData.recommendations.map((rec) => (
                  <RecommendationCard
                    key={rec.type}
                    data={rec}
                    isRecommended={rec.type === analysisData.bestRecommendation}
                  />
                ))}
              </div>
            </div>

            {/* CTA Section */}
            <NextStepCTA />
          </div>
        )}

        {/* Address phase - show info cards below */}
        {phase === "address" && (
          <div className="mt-12">
            {/* Trust indicators */}
            <div className="grid sm:grid-cols-3 gap-6 mb-12">
              {[
                {
                  title: "Instant Property Scan",
                  description: "Get a preliminary ADU eligibility analysis in seconds, not weeks.",
                  icon: "🔍",
                },
                {
                  title: "San Diego Experts",
                  description: "Our analysis is based on San Diego County ADU regulations and setback requirements.",
                  icon: "📍",
                },
                {
                  title: "Free & No Obligation",
                  description: "Explore your options with zero pressure. Book a review only when you're ready.",
                  icon: "✓",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-white rounded-2xl border border-border p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="font-bold text-secondary mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>

            {/* How it works */}
            <div className="bg-white rounded-2xl border border-border p-8">
              <h2 className="text-2xl font-bold text-secondary text-center mb-8">How It Works</h2>
              <div className="grid sm:grid-cols-4 gap-6">
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
                    <h4 className="font-semibold text-secondary mb-1">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
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

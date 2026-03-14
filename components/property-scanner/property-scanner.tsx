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
import { analyzeProperty } from "@/lib/property-intelligence";
import type { PropertyAnalysisResult } from "@/lib/property-intelligence";

type ScanPhase = "address" | "scanning" | "results";

export function PropertyScanner() {
  const [phase, setPhase] = useState<ScanPhase>("address");
  const [address, setAddress] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [analysisData, setAnalysisData] = useState<PropertyAnalysisResult | null>(null);

  const handleAddressSelect = (addr: string) => {
    setSelectedAddress(addr);
  };

  const handleStartScan = async () => {
    if (!selectedAddress && !address) return;
    const finalAddress = selectedAddress || address;
    setSelectedAddress(finalAddress);
    setPhase("scanning");

    // Run the property intelligence engine (async)
    try {
      const result = await analyzeProperty(finalAddress);
      setAnalysisData(result);
    } catch {
      // If analysis fails, try again as fallback
      try {
        const result = await analyzeProperty(finalAddress);
        setAnalysisData(result);
      } catch {
        // Analysis completely failed - stay on scanning phase
      }
    }
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

          {/* Address input */}
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
              {/* Left column - Property Summary and Buildable Area */}
              <div className="lg:col-span-2 space-y-6">
                <PropertySummaryCard data={analysisData.property} />
                <BuildableAreaCard data={analysisData.buildable} />
              </div>

              {/* Right column - Map and Site Diagram */}
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
